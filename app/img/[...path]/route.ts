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

const imageCache = new Map<
  string,
  { buffer: Buffer; contentType: string; ts: number }
>();
const CACHE_TTL = 4 * 60 * 60 * 1000;
const MAX_CACHE = 1000;

const WATERMARK_VERSION = "wm4";

function shouldWatermark(objectKey: string): boolean {
  return objectKey.startsWith("uploads/");
}

function buildWatermarkSvg(imageWidth: number, imageHeight: number): Buffer {
  const fontSize = Math.max(
    14,
    Math.round(Math.min(imageWidth, imageHeight) * 0.048),
  );
  const padX = Math.max(12, Math.round(imageWidth * 0.022));
  const padY = Math.max(12, Math.round(imageHeight * 0.028));
  const strokeW = Math.max(1, Math.round(fontSize * 0.08));
  const letterSpacing = Math.max(1, Math.round(fontSize * 0.08));
  const y = padY + fontSize;

  const svg = `<svg width="${imageWidth}" height="${imageHeight}" xmlns="http://www.w3.org/2000/svg">
    <text x="${padX}" y="${y}"
      font-family="Georgia, 'Times New Roman', 'Playfair Display', serif"
      font-style="italic"
      font-weight="600"
      font-size="${fontSize}"
      letter-spacing="${letterSpacing}"
      fill="rgba(255,255,255,0.55)"
      stroke="rgba(0,0,0,0.35)"
      stroke-width="${strokeW}"
      paint-order="stroke fill">NNAuto.cz</text>
  </svg>`;

  return Buffer.from(svg);
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  try {
    const { path } = await params;
    const objectKey = path.join("/");

    const width = parseInt(req.nextUrl.searchParams.get("w") || "") || undefined;
    const quality = parseInt(req.nextUrl.searchParams.get("q") || "") || 80;
    const format = req.nextUrl.searchParams.get("f") || "webp";
    const maxWidth = Math.min(width || 1920, 1920);

    const cacheKey = `${objectKey}-w${maxWidth}-q${quality}-${format}-${WATERMARK_VERSION}`;

    const cached = imageCache.get(cacheKey);
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      return new NextResponse(cached.buffer, {
        headers: {
          "Content-Type": cached.contentType,
          "Cache-Control": "public, max-age=31536000, immutable",
          "X-Image-Cache": "HIT",
        },
      });
    }

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
    const originalBuffer = Buffer.concat(chunks);

    const isImage =
      originalBuffer.length > 8 &&
      ((originalBuffer[0] === 0xff && originalBuffer[1] === 0xd8) ||
        (originalBuffer[0] === 0x89 && originalBuffer[1] === 0x50) ||
        (originalBuffer[0] === 0x52 && originalBuffer[1] === 0x49));

    if (!isImage) {
      return new NextResponse(originalBuffer, {
        headers: {
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    let pipeline = sharp(originalBuffer).rotate();

    if (maxWidth && maxWidth < 1920) {
      pipeline = pipeline.resize(maxWidth, undefined, {
        withoutEnlargement: true,
        fit: "inside",
        fastShrinkOnLoad: true,
      });
    }

    if (shouldWatermark(objectKey)) {
      const resized = await pipeline.toBuffer({ resolveWithObject: true });
      const wmSvg = buildWatermarkSvg(resized.info.width, resized.info.height);
      pipeline = sharp(resized.data).composite([
        { input: wmSvg, top: 0, left: 0 },
      ]);
    }

    let contentType = "image/webp";
    if (format === "webp") {
      pipeline = pipeline.webp({ quality, effort: 4, smartSubsample: true });
    } else if (format === "avif") {
      pipeline = pipeline.avif({ quality, effort: 4 });
      contentType = "image/avif";
    } else {
      pipeline = pipeline.jpeg({ quality, mozjpeg: true });
      contentType = "image/jpeg";
    }

    const optimizedBuffer = await pipeline.toBuffer();

    if (imageCache.size >= MAX_CACHE) {
      const oldest = imageCache.keys().next().value;
      if (oldest) imageCache.delete(oldest);
    }
    imageCache.set(cacheKey, {
      buffer: optimizedBuffer,
      contentType,
      ts: Date.now(),
    });

    return new NextResponse(optimizedBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Image-Cache": "MISS",
      },
    });
  } catch (error: any) {
    if (error?.name === "NoSuchKey" || error?.$metadata?.httpStatusCode === 404) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    console.error("Image processing error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
