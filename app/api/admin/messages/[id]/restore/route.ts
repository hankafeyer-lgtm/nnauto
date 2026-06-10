import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { requireSuperAdmin } from "@lib/auth";
import { ensureMessagingSchema } from "@lib/ensureMessagingSchema";
import { writeAdminAudit } from "@lib/ensureAdminSchema";
import { storage } from "@lib/storage";

/**
 * POST /api/admin/messages/[id]/restore — restore a soft-deleted conversation
 * (and its messages). Super-admin only. Audited.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireSuperAdmin();
    await ensureMessagingSchema();

    const { id } = await params;
    if (!id) return error("Conversation not found", 404);

    const ok = await storage.restoreConversation(id);
    if (!ok) return error("Conversation not found", 404);

    await writeAdminAudit({
      actorUserId: admin.id,
      actorEmail: admin.email,
      action: "conversation.restore",
      targetType: "conversation",
      targetId: id,
    });

    return json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return error("Unauthorized", 401);
    if (msg === "Forbidden") return error("Forbidden", 403);
    return error(msg, 500);
  }
}
