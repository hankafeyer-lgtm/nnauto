import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { requireAuth } from "@lib/auth";
import {
  isValidListingImageBuffer,
  MAX_LISTING_IMAGE_BYTES,
} from "@lib/listingImageValidation";
import { securityLog } from "@lib/securityLog";
import {
  assertAllowedUploadContentType,
  uploadBuffer,
  setObjectAclPolicy,
} from "@lib/r2Storage";

/**
 * Same-origin multipart upload (binary body, no base64).
 * Faster than /api/objects/upload-file for “přidat auto” photo flows on mobile.
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
      return error("No file provided", 400);
    }

    const contentType =
      file.type && file.type.startsWith("image/")
        ? file.type
        : "image/jpeg";

    try {
      assertAllowedUploadContentType(contentType);
    } catch {
      return error("Only image files are allowed", 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    if (buffer.length > MAX_LISTING_IMAGE_BYTES) {
      return error(
        `File too large. Maximum size is 20MB, got ${(buffer.length / 1024 / 1024).toFixed(2)}MB`,
        400,
      );
    }

    if (!isValidListingImageBuffer(buffer)) {
      return error("Invalid image file format", 400);
    }

    const objectKey = await uploadBuffer(buffer, contentType);

    await setObjectAclPolicy(objectKey, {
      owner: user.id,
      visibility: "public",
    });

    securityLog("upload_file_legacy", {
      userId: user.id,
      bytes: buffer.length,
      transport: "multipart",
    });
    return json({ objectPath: objectKey });
  } catch (e: unknown) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return error("Unauthorized", 401);
    }
    console.error("Upload image error:", e);
    const msg = e instanceof Error ? e.message : "Server error";
    return error(msg, 500);
  }
}
