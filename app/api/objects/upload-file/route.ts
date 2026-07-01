import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { requireAuth } from "@lib/auth";
import {
  MAX_LISTING_IMAGE_BYTES,
} from "@lib/listingImageValidation";
import { normalizeListingImageUpload } from "@lib/normalizeListingImage";
import { securityLog } from "@lib/securityLog";
import {
  uploadBuffer,
  setObjectAclPolicy,
} from "@lib/r2Storage";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();

    const body = await req.json();
    const { fileData } = body;

    if (!fileData) {
      return error("Missing required field: fileData", 400);
    }

    const rawBuffer = Buffer.from(fileData, "base64");

    if (rawBuffer.length > MAX_LISTING_IMAGE_BYTES) {
      return error(
        `File too large. Maximum size is 20MB, got ${(rawBuffer.length / 1024 / 1024).toFixed(2)}MB`,
        400,
      );
    }

    let normalized;
    try {
      normalized = await normalizeListingImageUpload(rawBuffer);
    } catch (e: unknown) {
      const code = e instanceof Error ? e.message : "";
      if (code === "FILE_TOO_LARGE") {
        return error(`File too large. Maximum size is 20MB`, 400);
      }
      return error("Invalid image file format", 400);
    }

    const objectKey = await uploadBuffer(normalized.buffer, normalized.contentType);

    await setObjectAclPolicy(objectKey, {
      owner: user.id,
      visibility: "public",
    });

    securityLog("upload_file_legacy", {
      userId: user.id,
      bytes: normalized.buffer.length,
      transport: "json_base64",
    });
    return json({ objectPath: objectKey });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "";
    if (msg === "Unauthorized") return error("Unauthorized", 401);
    console.error("Upload error:", e);
    return error(msg || "Server error", 500);
  }
}
