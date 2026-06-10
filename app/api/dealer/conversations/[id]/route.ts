import { NextRequest } from "next/server";
import { error, json } from "@lib/api-helpers";
import { requireDealer } from "@lib/auth";
import { storage } from "@lib/storage";
import { ensureMessagingSchema } from "@lib/ensureMessagingSchema";

/**
 * DELETE /api/dealer/conversations/[id]
 *
 * Removes a dealer-side conversation (cascades to all messages). The
 * caller must own the conversation (`dealerUserId === user.id`).
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireDealer();
    await ensureMessagingSchema();
    const { id } = await params;

    const conv = await storage.getConversation(id);
    if (!conv || conv.deletedAt) return error("Conversation not found", 404);
    if (conv.dealerUserId !== user.id) return error("Forbidden", 403);

    const ok = await storage.deleteConversation({
      conversationId: id,
      userId: user.id,
    });
    if (!ok) return error("Conversation not found", 404);
    return json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return error("Unauthorized", 401);
    if (msg === "Forbidden") return error("Forbidden", 403);
    return error(msg, 500);
  }
}
