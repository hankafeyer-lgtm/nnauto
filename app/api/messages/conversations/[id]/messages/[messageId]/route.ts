import { NextRequest } from "next/server";
import { error, json } from "@lib/api-helpers";
import { requireAuth } from "@lib/auth";
import { storage } from "@lib/storage";
import { ensureMessagingSchema } from "@lib/ensureMessagingSchema";

/**
 * DELETE /api/messages/conversations/[id]/messages/[messageId]
 *
 * Removes a single message authored by the caller. System messages
 * (auto-replies, source tags) are not deletable.
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; messageId: string }> },
) {
  try {
    const user = await requireAuth();
    await ensureMessagingSchema();
    const { id, messageId } = await params;

    const conv = await storage.getConversation(id);
    if (!conv) return error("Conversation not found", 404);
    if (conv.clientUserId !== user.id && conv.dealerUserId !== user.id) {
      return error("Forbidden", 403);
    }

    const ok = await storage.deleteMessage({
      conversationId: id,
      messageId,
      userId: user.id,
    });
    if (!ok) return error("Message not found or forbidden", 404);
    return json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return error("Unauthorized", 401);
    return error(msg, 500);
  }
}
