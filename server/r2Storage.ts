import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Response } from "express";
import { randomUUID } from "crypto";

const R2_ACCOUNT_ID =
  process.env.CLOUDFLARE_R2_ACCOUNT_ID || "b0a8932fd64127835449fba2af9ec15a";
const R2_ENDPOINT = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
const R2_BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME || "12dk";

export const r2Client = new S3Client({
  region: "auto",
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || "",
  },
});

export interface ObjectAclPolicy {
  owner: string;
  visibility: "public" | "private";
  aclRules?: any[];
}

export enum ObjectPermission {
  READ = "read",
  WRITE = "write",
}

export class ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
    Object.setPrototypeOf(this, ObjectNotFoundError.prototype);
  }
}

export class R2StorageService {
  constructor() {}

  async getObjectEntityUploadURL(): Promise<{
    uploadURL: string;
    objectKey: string;
  }> {
    const objectId = randomUUID();
    const key = `uploads/${objectId}`;

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    });

    const uploadUrl = await getSignedUrl(r2Client, command, {
      expiresIn: 900,
    });

    return { uploadURL: uploadUrl, objectKey: key };
  }

  async getVideoUploadURL(
    contentType: string
  ): Promise<{ uploadURL: string; objectKey: string }> {
    const objectId = randomUUID();
    const key = `videos/${objectId}`;

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });

    // Longer expiry for video uploads (30 minutes)
    const uploadUrl = await getSignedUrl(r2Client, command, {
      expiresIn: 1800,
    });

    return { uploadURL: uploadUrl, objectKey: key };
  }

  async uploadFile(buffer: Buffer, contentType: string): Promise<string> {
    const objectId = randomUUID();
    const key = `uploads/${objectId}`;

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    });

    await r2Client.send(command);
    return key;
  }

  async uploadVideo(buffer: Buffer, contentType: string): Promise<string> {
    const objectId = randomUUID();
    const key = `videos/${objectId}`;

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    });

    await r2Client.send(command);
    return key;
  }

  async getObjectMetadata(key: string): Promise<any> {
    try {
      const command = new HeadObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
      });

      const response = await r2Client.send(command);
      return response.Metadata || {};
    } catch (error: any) {
      if (error.name === "NotFound") {
        throw new ObjectNotFoundError();
      }
      throw error;
    }
  }

  async setObjectMetadata(
    key: string,
    metadata: Record<string, string>
  ): Promise<void> {
    try {
      const headCommand = new HeadObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
      });

      const headResponse = await r2Client.send(headCommand);

      // Get the object content to reupload
      const getCommand = new GetObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
      });

      const getResponse = await r2Client.send(getCommand);

      // Buffer the stream to avoid exhausting it before upload
      const chunks: Uint8Array[] = [];
      const stream = getResponse.Body as any;

      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      const bodyBuffer = Buffer.concat(chunks);

      // Preserve all existing metadata and content-type when updating
      const putCommand = new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        Body: bodyBuffer,
        Metadata: { ...headResponse.Metadata, ...metadata },
        ContentType: headResponse.ContentType,
      });

      await r2Client.send(putCommand);
    } catch (error: any) {
      console.error("Error setting object metadata:", error);
      throw error;
    }
  }

  async getObjectAclPolicy(key: string): Promise<ObjectAclPolicy | null> {
    try {
      const metadata = await this.getObjectMetadata(key);
      const aclPolicyStr = metadata["aclpolicy"];
      if (!aclPolicyStr) {
        return null;
      }
      return JSON.parse(aclPolicyStr);
    } catch (error) {
      if (error instanceof ObjectNotFoundError) {
        return null;
      }
      throw error;
    }
  }

  async setObjectAclPolicy(
    key: string,
    aclPolicy: ObjectAclPolicy
  ): Promise<void> {
    const aclPolicyStr = JSON.stringify(aclPolicy);
    await this.setObjectMetadata(key, { aclpolicy: aclPolicyStr });
  }

  async canAccessObject({
    userId,
    key,
    requestedPermission,
  }: {
    userId?: string;
    key: string;
    requestedPermission?: ObjectPermission;
  }): Promise<boolean> {
    const aclPolicy = await this.getObjectAclPolicy(key);
    if (!aclPolicy) {
      return false;
    }

    if (
      aclPolicy.visibility === "public" &&
      requestedPermission === ObjectPermission.READ
    ) {
      return true;
    }

    if (!userId) {
      return false;
    }

    if (aclPolicy.owner === userId) {
      return true;
    }

    return false;
  }

  async downloadObject(key: string, res: Response, cacheTtlSec: number = 3600) {
    try {
      const command = new GetObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
      });

      const response = await r2Client.send(command);
      const aclPolicy = await this.getObjectAclPolicy(key);
      const isPublic = aclPolicy?.visibility === "public";

      res.set({
        "Content-Type": response.ContentType || "application/octet-stream",
        "Content-Length": response.ContentLength?.toString() || "0",
        "Cache-Control": `${
          isPublic ? "public" : "private"
        }, max-age=${cacheTtlSec}`,
      });

      if (response.Body) {
        const stream = response.Body as any;
        stream.pipe(res);
      } else {
        res.status(404).json({ error: "File not found" });
      }
    } catch (error: any) {
      console.error("Error downloading file:", error);
      if (!res.headersSent) {
        if (error.name === "NoSuchKey") {
          res.status(404).json({ error: "File not found" });
        } else {
          res.status(500).json({ error: "Error downloading file" });
        }
      }
    }
  }

  async getObjectStream(key: string): Promise<AsyncIterable<Uint8Array>> {
    const command = new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    });

    const response = await r2Client.send(command);

    if (!response.Body) {
      throw new ObjectNotFoundError();
    }

    return response.Body as AsyncIterable<Uint8Array>;
  }

  normalizeObjectEntityPath(rawPath: string): string {
    if (
      !rawPath.startsWith(`https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/`)
    ) {
      return rawPath;
    }

    const url = new URL(rawPath);
    const bucketPrefix = `/${R2_BUCKET_NAME}/`;

    if (!url.pathname.startsWith(bucketPrefix)) {
      return rawPath;
    }

    const key = url.pathname.slice(bucketPrefix.length);
    return `/objects/${key}`;
  }

  async trySetObjectEntityAclPolicy(
    rawPath: string,
    aclPolicy: ObjectAclPolicy
  ): Promise<string> {
    const normalizedPath = this.normalizeObjectEntityPath(rawPath);
    if (!normalizedPath.startsWith("/objects/")) {
      return normalizedPath;
    }

    const key = normalizedPath.slice("/objects/".length);
    await this.setObjectAclPolicy(key, aclPolicy);
    return normalizedPath;
  }

  getObjectKey(objectPath: string): string {
    if (!objectPath.startsWith("/objects/")) {
      throw new ObjectNotFoundError();
    }
    return objectPath.slice("/objects/".length);
  }

  getPublicUrl(key: string): string {
    return `https://pub-${R2_ACCOUNT_ID}.r2.dev/${key}`;
  }
}
