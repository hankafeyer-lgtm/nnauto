import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { requireAuth } from "@lib/auth";
import { securityLog } from "@lib/securityLog";
import { setObjectAclPolicy, validatePresignedImageObject } from "@lib/r2Storage";

function normalizeObjectKey(raw: string): string | null {
  const s = raw.trim().replace(/^\//, "");
  const noPrefix = s.startsWith("objects/") ? s.slice("objects/".length) : s;
  if (!noPrefix.startsWith("uploads/")) return null;
  if (noPrefix.includes("..") || noPrefix.includes("\\")) return null;
  return noPrefix;
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json().catch(() => ({}));
    const key = normalizeObjectKey(
      typeof body.objectKey === "string" ? body.objectKey : "",
    );
    if (!key) {
      return error("Invalid object key", 400);
    }

    await validatePresignedImageObject(key);
    await setObjectAclPolicy(key, {
      owner: user.id,
      visibility: "public",
    });

    securityLog("upload_finalize", { userId: user.id, ok: true });
    return json({ objectPath: key });
  } catch (e: unknown) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return error("Unauthorized", 401);
    }
    const msg = e instanceof Error ? e.message : "finalize_failed";
    securityLog("upload_finalize", { ok: false, reason: msg.slice(0, 80) });
    return error("Could not finalize upload", 400);
  }
}
