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

/** Listing videos: stream from R2 and honor Range (required for reliable <video> playback). */
async function getVideoObjectResponse(
  req: NextRequest,
  client: S3Client,
  objectKey: string,
) {
  const range = req.headers.get("range") ?? undefined;
  const command = new GetObjectCommand({
    Bucket: R2_BUCKET,
    Key: objectKey,
    ...(range ? { Range: range } : {}),
  });
  const response = await client.send(command);
  if (!response.Body) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const headers = new Headers();
  headers.set("Content-Type", response.ContentType || "video/mp4");
  headers.set("Accept-Ranges", "bytes");
  headers.set("Cache-Control", "public, max-age=31536000, immutable");
  if (typeof response.ContentLength === "number") {
    headers.set("Content-Length", String(response.ContentLength));
  }
  if (response.ContentRange) {
    headers.set("Content-Range", response.ContentRange);
  }

  const status = response.$metadata?.httpStatusCode === 206 ? 206 : 200;
  const body = response.Body as { transformToWebStream(): ReadableStream };
  return new NextResponse(body.transformToWebStream(), { status, headers });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  try {
    const { path } = await params;
    const objectKey = path.join("/");

    const client = getR2Client();

    if (objectKey.startsWith("videos/")) {
      return await getVideoObjectResponse(req, client, objectKey);
    }

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

    const isJpeg = buffer.length > 8 && buffer[0] === 0xff && buffer[1] === 0xd8;
    const isPng =
      buffer.length > 8 && buffer[0] === 0x89 && buffer[1] === 0x50;
    const isGif =
      buffer.length > 8 &&
      buffer[0] === 0x47 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x38;
    const isWebp =
      buffer.length >= 12 &&
      buffer[0] === 0x52 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x46 &&
      buffer[8] === 0x57 &&
      buffer[9] === 0x45 &&
      buffer[10] === 0x42 &&
      buffer[11] === 0x50;

    const isImage = isJpeg || isPng || isGif || isWebp;

    if (isImage) {
      const rotated = await sharp(buffer).rotate().toBuffer();
      return new NextResponse(rotated, {
        headers: {
          "Cache-Control": "public, max-age=31536000, immutable",
          Vary: "Accept-Encoding",
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
  } catch (error: unknown) {
    const err = error as { name?: string; $metadata?: { httpStatusCode?: number } };
    if (err?.name === "NoSuchKey" || err?.$metadata?.httpStatusCode === 404) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    console.error("Object fetch error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
