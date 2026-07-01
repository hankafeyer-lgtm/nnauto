import sharp from "sharp";
import {
  isValidListingImageBuffer,
  MAX_LISTING_IMAGE_BYTES,
} from "@lib/listingImageValidation";

export type NormalizedListingImage = {
  buffer: Buffer;
  contentType: "image/jpeg" | "image/png" | "image/webp" | "image/gif";
};

function detectContentTypeFromBuffer(buf: Buffer): NormalizedListingImage["contentType"] | null {
  if (buf.length < 4) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
    return "image/png";
  }
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x38) {
    return "image/gif";
  }
  if (
    buf.length >= 12 &&
    buf[0] === 0x52 &&
    buf[1] === 0x49 &&
    buf[2] === 0x46 &&
    buf[3] === 0x46 &&
    buf[8] === 0x57 &&
    buf[9] === 0x45 &&
    buf[10] === 0x42 &&
    buf[11] === 0x50
  ) {
    return "image/webp";
  }
  return null;
}

/**
 * Accept JPEG/PNG/WebP/GIF as-is; convert HEIC/HEIF/TIFF/BMP/AVIF and other
 * camera formats to JPEG via sharp so uploads work from any phone or PC.
 */
export async function normalizeListingImageUpload(
  buffer: Buffer,
): Promise<NormalizedListingImage> {
  if (buffer.length > MAX_LISTING_IMAGE_BYTES) {
    throw new Error("FILE_TOO_LARGE");
  }

  if (isValidListingImageBuffer(buffer)) {
    const contentType = detectContentTypeFromBuffer(buffer) ?? "image/jpeg";
    return { buffer, contentType };
  }

  try {
    const converted = await sharp(buffer, { failOn: "none" })
      .rotate()
      .jpeg({ quality: 88, mozjpeg: true })
      .toBuffer();

    if (converted.length > MAX_LISTING_IMAGE_BYTES) {
      throw new Error("FILE_TOO_LARGE");
    }

    return { buffer: converted, contentType: "image/jpeg" };
  } catch {
    throw new Error("INVALID_IMAGE");
  }
}
