import { NextRequest } from "next/server";
import { error, json } from "@lib/api-helpers";
import { requireDealer } from "@lib/auth";
import { storage } from "@lib/storage";
import { ensureMessagingSchema } from "@lib/ensureMessagingSchema";
import { updateQuickReplySchema } from "@shared/schema";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireDealer();
    await ensureMessagingSchema();
    const { id } = await params;

    const body = await req.json().catch(() => null);
    const parsed = updateQuickReplySchema.safeParse(body);
    if (!parsed.success) return error("Invalid payload", 400);

    const updated = await storage.updateQuickReply({
      id,
      dealerUserId: user.id,
      ...parsed.data,
    });
    if (!updated) return error("Quick reply not found", 404);
    return json({ ok: true, quickReply: updated });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return error("Unauthorized", 401);
    if (msg === "Forbidden") return error("Forbidden", 403);
    return error(msg, 500);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireDealer();
    await ensureMessagingSchema();
    const { id } = await params;
    const ok = await storage.deleteQuickReply({ id, dealerUserId: user.id });
    if (!ok) return error("Quick reply not found", 404);
    return json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return error("Unauthorized", 401);
    if (msg === "Forbidden") return error("Forbidden", 403);
    return error(msg, 500);
  }
}
