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

function getR2Client() {
  return new S3Client({
    region: "auto",
    endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: ACCESS_KEY, secretAccessKey: SECRET_KEY },
  });
}

export async function getPresignedUploadUrl(): Promise<{
  uploadURL: string;
  objectKey: string;
}> {
  const client = getR2Client();
  const objectKey = `uploads/${randomUUID()}`;
  const command = new PutObjectCommand({ Bucket: BUCKET, Key: objectKey });
  const uploadURL = await getSignedUrl(client, command, { expiresIn: 900 });
  return { uploadURL, objectKey };
}

export async function uploadBuffer(
  buffer: Buffer,
  contentType: string,
  prefix = "uploads",
): Promise<string> {
  const client = getR2Client();
  const objectKey = `${prefix}/${randomUUID()}`;
  await client.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: objectKey,
      Body: buffer,
      ContentType: contentType,
    }),
  );
  return objectKey;
}

export async function setObjectAclPolicy(
  key: string,
  aclPolicy: { owner: string; visibility: "public" | "private" },
): Promise<void> {
  const client = getR2Client();

  const headResponse = await client.send(
    new HeadObjectCommand({ Bucket: BUCKET, Key: key }),
  );

  const getResponse = await client.send(
    new GetObjectCommand({ Bucket: BUCKET, Key: key }),
  );

  const chunks: Uint8Array[] = [];
  const stream = getResponse.Body as AsyncIterable<Uint8Array>;
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  const bodyBuffer = Buffer.concat(chunks);

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
