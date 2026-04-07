import { NextRequest, NextResponse } from "next/server";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const R2_ACCOUNT_ID =
  process.env.CLOUDFLARE_R2_ACCOUNT_ID || "b0a8932fd64127835449fba2af9ec15a";
const R2_BUCKET =
  process.env.CLOUDFLARE_R2_BUCKET_NAME || "12dk";

function getR2Client() {
  return new S3Client({
    region: "auto",
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || "",
    },
  });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  try {
    const { path } = await params;
    const objectKey = path.join("/");

    const client = getR2Client();
    const command = new GetObjectCommand({ Bucket: R2_BUCKET, Key: objectKey });
    const response = await client.send(command);

    if (!response.Body) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const chunks: Buffer[] = [];
    const stream = response.Body as AsyncIterable<Uint8Array>;
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }
    const buffer = Buffer.concat(chunks);

    const isImage =
      buffer.length > 8 &&
      ((buffer[0] === 0xff && buffer[1] === 0xd8) ||
        (buffer[0] === 0x89 && buffer[1] === 0x50) ||
        (buffer[0] === 0x52 && buffer[1] === 0x49));

    if (isImage) {
      const rotated = await sharp(buffer).rotate().toBuffer();
      return new NextResponse(rotated, {
        headers: {
          "Cache-Control": "public, max-age=31536000, immutable",
          "Vary": "Accept-Encoding",
        },
      });
    }

    const contentType = response.ContentType || "application/octet-stream";
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error: any) {
    if (error?.name === "NoSuchKey" || error?.$metadata?.httpStatusCode === 404) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    console.error("Object fetch error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
