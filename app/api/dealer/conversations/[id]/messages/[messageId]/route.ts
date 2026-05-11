import { NextRequest } from "next/server";
import { error, json } from "@lib/api-helpers";
import { requireDealer } from "@lib/auth";
import { storage } from "@lib/storage";
import { ensureMessagingSchema } from "@lib/ensureMessagingSchema";

/**
 * DELETE /api/dealer/conversations/[id]/messages/[messageId]
 *
 * Removes a single dealer-authored message. The dealer can only delete
 * messages where they are both the conversation owner *and* the
 * original sender (system + client messages are off-limits).
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; messageId: string }> },
) {
  try {
    const user = await requireDealer();
    await ensureMessagingSchema();
    const { id, messageId } = await params;

    const conv = await storage.getConversation(id);
    if (!conv) return error("Conversation not found", 404);
    if (conv.dealerUserId !== user.id) return error("Forbidden", 403);

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
    if (msg === "Forbidden") return error("Forbidden", 403);
    return error(msg, 500);
  }
}
