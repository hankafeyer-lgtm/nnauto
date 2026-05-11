import { NextRequest } from "next/server";
import { error, json } from "@lib/api-helpers";
import { requireAuth } from "@lib/auth";
import { storage } from "@lib/storage";
import { ensureMessagingSchema } from "@lib/ensureMessagingSchema";

/**
 * DELETE /api/messages/conversations/[id]
 *
 * Removes the entire conversation (and all messages) if the caller is
 * a participant on either side. Idempotent: returns 404 when the
 * conversation is already gone.
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuth();
    await ensureMessagingSchema();
    const { id } = await params;

    const conv = await storage.getConversation(id);
    if (!conv) return error("Conversation not found", 404);
    if (conv.clientUserId !== user.id && conv.dealerUserId !== user.id) {
      return error("Forbidden", 403);
    }

    const ok = await storage.deleteConversation({
      conversationId: id,
      userId: user.id,
    });
    if (!ok) return error("Conversation not found", 404);
    return json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return error("Unauthorized", 401);
    return error(msg, 500);
  }
}
