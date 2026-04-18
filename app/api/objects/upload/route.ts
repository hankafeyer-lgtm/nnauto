import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { requireAuth } from "@lib/auth";
import { securityLog } from "@lib/securityLog";
import { getPresignedUploadUrl } from "@lib/r2Storage";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json().catch(() => ({}));
    const contentType =
      typeof body.contentType === "string" ? body.contentType.trim() : "";
    if (!contentType) {
      return error("contentType is required", 400);
    }

    const { uploadURL, objectKey } = await getPresignedUploadUrl(contentType);
    securityLog("upload_presign", { userId: user.id });
    return json({
      url: uploadURL,
      objectPath: `/objects/${objectKey}`,
      objectKey,
    });
  } catch (e: unknown) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return error("Unauthorized", 401);
    }
    const msg = e instanceof Error ? e.message : "Server error";
    return error(msg, 400);
  }
}
