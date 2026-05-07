import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { requireAuth } from "@lib/auth";
import { uploadBuffer } from "@lib/r2Storage";

const MAX_VIDEO_UPLOAD_BYTES = 200 * 1024 * 1024; // 200MB (matches UI limit)

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

    // Set ACL metadata on the initial PutObject — avoid setObjectAclPolicy here,
    // which re-downloads the entire object (OOM / timeouts for large videos).
    const objectKey = await uploadBuffer(buffer, contentType, "videos", {
      aclPolicy: { owner: user.id, visibility: "public" },
    });

    return json({ success: true, objectPath: objectKey });
  } catch (e: any) {
    if (e.message === "Unauthorized") return error("Unauthorized", 401);
    console.error("Video upload error:", e);
    return error(e.message || "Failed to upload video", 500);
  }
}
