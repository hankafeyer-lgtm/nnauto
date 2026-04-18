import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { requireAuth } from "@lib/auth";
import { securityLog } from "@lib/securityLog";
import {
  assertAllowedUploadContentType,
  uploadBuffer,
  setObjectAclPolicy,
} from "@lib/r2Storage";

const MAX_IMAGE_UPLOAD_BYTES = 20 * 1024 * 1024; // 20MB

function isValidImage(buf: Buffer): boolean {
  if (buf.length < 12) return false;
  // JPEG
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return true;
  // PNG
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47)
    return true;
  // GIF
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x38)
    return true;
  // WebP (RIFF....WEBP)
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

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();

    const body = await req.json();
    const { fileData, fileName, contentType } = body;

    if (!fileData || !fileName || !contentType) {
      return error(
        "Missing required fields: fileData, fileName, contentType",
        400,
      );
    }

    try {
      assertAllowedUploadContentType(contentType);
    } catch {
      return error("Only image files are allowed", 400);
    }

    const buffer = Buffer.from(fileData, "base64");

    if (buffer.length > MAX_IMAGE_UPLOAD_BYTES) {
      return error(
        `File too large. Maximum size is 20MB, got ${(buffer.length / 1024 / 1024).toFixed(2)}MB`,
        400,
      );
    }

    if (!isValidImage(buffer)) {
      return error("Invalid image file format", 400);
    }

    const objectKey = await uploadBuffer(buffer, contentType);

    await setObjectAclPolicy(objectKey, {
      owner: user.id,
      visibility: "public",
    });

    securityLog("upload_file_legacy", { userId: user.id, bytes: buffer.length });
    return json({ objectPath: objectKey });
  } catch (e: any) {
    if (e.message === "Unauthorized") return error("Unauthorized", 401);
    console.error("Upload error:", e);
    return error(e.message, 500);
  }
}
