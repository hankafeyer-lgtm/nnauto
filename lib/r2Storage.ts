import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

const BUCKET = process.env.CLOUDFLARE_R2_BUCKET_NAME || "12dk";
const ACCOUNT_ID = process.env.CLOUDFLARE_R2_ACCOUNT_ID || "";
const ACCESS_KEY = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || "";
const SECRET_KEY = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || "";

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const MAX_IMAGE_UPLOAD_BYTES = 20 * 1024 * 1024;

export function assertAllowedUploadContentType(contentType: string): string {
  const ct = String(contentType || "").trim().toLowerCase();
  if (!ALLOWED_IMAGE_TYPES.has(ct)) {
    throw new Error("Unsupported content type");
  }
  return ct;
}

export function getR2Client() {
  return new S3Client({
    region: "auto",
    endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: ACCESS_KEY, secretAccessKey: SECRET_KEY },
  });
}

export async function getPresignedUploadUrl(contentType: string): Promise<{
  uploadURL: string;
  objectKey: string;
}> {
  const ct = assertAllowedUploadContentType(contentType);
  const client = getR2Client();
  const objectKey = `uploads/${randomUUID()}`;
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: objectKey,
    ContentType: ct,
  });
  const uploadURL = await getSignedUrl(client, command, { expiresIn: 900 });
  return { uploadURL, objectKey };
}

function isValidImageMagic(buf: Buffer): boolean {
  if (buf.length < 12) return false;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return true;
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47)
    return true;
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x38)
    return true;
  if (
    buf[0] === 0x52 &&
    buf[1] === 0x49 &&
    buf[2] === 0x46 &&
    buf[3] === 0x46 &&
    buf[8] === 0x57 &&
    buf[9] === 0x45 &&
    buf[10] === 0x42 &&
    buf[11] === 0x50
  )
    return true;
  return false;
}

async function streamToBuffer(
  body: AsyncIterable<Uint8Array> | undefined,
): Promise<Buffer> {
  if (!body) return Buffer.alloc(0);
  const chunks: Uint8Array[] = [];
  for await (const chunk of body) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

/**
 * After client PUT to presigned URL: verify size, declared type, and magic bytes.
 */
export async function validatePresignedImageObject(objectKey: string): Promise<void> {
  const client = getR2Client();
  const head = await client.send(
    new HeadObjectCommand({ Bucket: BUCKET, Key: objectKey }),
  );
  const len = Number(head.ContentLength ?? 0);
  if (!Number.isFinite(len) || len < 1 || len > MAX_IMAGE_UPLOAD_BYTES) {
    throw new Error("Invalid upload size");
  }
  const ct = head.ContentType || "";
  assertAllowedUploadContentType(ct);

  const ranged = await client.send(
    new GetObjectCommand({
      Bucket: BUCKET,
      Key: objectKey,
      Range: "bytes=0-31",
    }),
  );
  const prefix = await streamToBuffer(
    ranged.Body as AsyncIterable<Uint8Array> | undefined,
  );
  if (!isValidImageMagic(prefix)) {
    throw new Error("Invalid image payload");
  }
}

export type ObjectAclPolicy = { owner: string; visibility: "public" | "private" };

export async function uploadBuffer(
  buffer: Buffer,
  contentType: string,
  prefix = "uploads",
  options?: { aclPolicy?: ObjectAclPolicy },
): Promise<string> {
  let ct: string;
  if (prefix === "videos") {
    const raw = String(contentType || "").trim().toLowerCase();
    if (!raw || raw === "application/octet-stream") {
      ct = "video/mp4";
    } else if (raw.startsWith("video/")) {
      ct = raw;
    } else {
      throw new Error("Unsupported content type");
    }
  } else {
    ct = assertAllowedUploadContentType(contentType);
  }
  const client = getR2Client();
  const objectKey = `${prefix}/${randomUUID()}`;
  await client.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: objectKey,
      Body: buffer,
      ContentType: ct,
      ...(options?.aclPolicy
        ? {
            Metadata: {
              aclpolicy: JSON.stringify(options.aclPolicy),
            },
          }
        : {}),
    }),
  );
  return objectKey;
}

export async function setObjectAclPolicy(
  key: string,
  aclPolicy: ObjectAclPolicy,
): Promise<void> {
  const client = getR2Client();

  const headResponse = await client.send(
    new HeadObjectCommand({ Bucket: BUCKET, Key: key }),
  );

  const getResponse = await client.send(
    new GetObjectCommand({ Bucket: BUCKET, Key: key }),
  );

  const bodyBuffer = await streamToBuffer(
    getResponse.Body as AsyncIterable<Uint8Array> | undefined,
  );

  await client.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: bodyBuffer,
      Metadata: {
        ...headResponse.Metadata,
        aclpolicy: JSON.stringify(aclPolicy),
      },
      ContentType: headResponse.ContentType,
    }),
  );
}
