import { NextRequest } from "next/server";
import { error, json } from "@lib/api-helpers";
import { requireDealer } from "@lib/auth";
import { storage } from "@lib/storage";
import { ensureMessagingSchema } from "@lib/ensureMessagingSchema";
import { updateConversationStatusSchema } from "@shared/schema";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireDealer();
    await ensureMessagingSchema();
    const { id } = await params;

    const conv = await storage.getConversation(id);
    if (!conv) return error("Conversation not found", 404);
    if (conv.dealerUserId !== user.id) return error("Forbidden", 403);

    const body = await req.json().catch(() => null);
    const parsed = updateConversationStatusSchema.safeParse(body);
    if (!parsed.success) return error("Invalid payload", 400);

    const updated = await storage.updateConversationStatus(id, parsed.data.status);
    return json({ ok: true, conversation: updated });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return error("Unauthorized", 401);
    if (msg === "Forbidden") return error("Forbidden", 403);
    console.error("[PATCH conv/:id/status] error:", e);
    return error(msg, 500);
  }
}
