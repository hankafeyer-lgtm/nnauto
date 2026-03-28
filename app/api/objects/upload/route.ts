import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { requireAuth } from "@lib/auth";
import { getPresignedUploadUrl } from "@lib/r2Storage";

export async function POST(req: NextRequest) {
  try {
    await requireAuth();
    const { uploadURL, objectKey } = await getPresignedUploadUrl();
    return json({ url: uploadURL, objectPath: `/objects/${objectKey}` });
  } catch (e: any) {
    if (e.message === "Unauthorized") return error("Unauthorized", 401);
    return error(e.message, 500);
  }
}
