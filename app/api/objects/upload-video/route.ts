import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { requireAuth } from "@lib/auth";
import { uploadBuffer, setObjectAclPolicy } from "@lib/r2Storage";

const MAX_VIDEO_UPLOAD_BYTES = 100 * 1024 * 1024; // 100MB

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();

    const formData = await req.formData();
    const file = formData.get("video");

    if (!file || !(file instanceof Blob)) {
      return error("No video file provided", 400);
    }

    if (file.size > MAX_VIDEO_UPLOAD_BYTES) {
      return error(
        `File too large. Maximum size is 100MB, got ${(file.size / 1024 / 1024).toFixed(2)}MB`,
        400,
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const contentType = file.type || "video/mp4";

    const objectKey = await uploadBuffer(buffer, contentType, "videos");

    await setObjectAclPolicy(objectKey, {
      owner: user.id,
      visibility: "public",
    });

    return json({ success: true, objectPath: objectKey });
  } catch (e: any) {
    if (e.message === "Unauthorized") return error("Unauthorized", 401);
    console.error("Video upload error:", e);
    return error(e.message || "Failed to upload video", 500);
  }
}
