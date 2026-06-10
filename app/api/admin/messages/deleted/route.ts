import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { requireSuperAdmin } from "@lib/auth";
import { ensureMessagingSchema } from "@lib/ensureMessagingSchema";
import { storage } from "@lib/storage";

/**
 * GET /api/admin/messages/deleted — soft-deleted conversations across all
 * dealers, for the admin recovery view. Super-admin only.
 */
export async function GET(_req: NextRequest) {
  try {
    await requireSuperAdmin();
    await ensureMessagingSchema();

    const conversations = await storage.listDeletedConversations(300);
    return json({ conversations });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return error("Unauthorized", 401);
    if (msg === "Forbidden") return error("Forbidden", 403);
    return error(msg, 500);
  }
}
