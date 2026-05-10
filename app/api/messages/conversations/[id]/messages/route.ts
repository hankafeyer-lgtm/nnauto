import { NextRequest } from "next/server";
import { error, json } from "@lib/api-helpers";
import { requireAuth } from "@lib/auth";
import { storage } from "@lib/storage";
import { db } from "@lib/db";
import { sql } from "drizzle-orm";
import { ensureMessagingSchema } from "@lib/ensureMessagingSchema";

function getUserRole(conv: any, userId: string): "buyer" | "seller" | null {
  if (conv.dealerUserId === userId) return "seller";
  if (conv.clientUserId === userId) return "buyer";
  return null;
}

/**
 * GET — read messages (works for buyer and seller).
 * POST — send reply (works for buyer and seller).
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuth();
    await ensureMessagingSchema();
    const { id } = await params;

    const conv = await storage.getConversation(id);
    if (!conv) return error("Conversation not found", 404);
    const role = getUserRole(conv, user.id);
    if (!role) return error("Forbidden", 403);

    const messages = await storage.listMessages(id);

    // Mark messages as read from the user's perspective
    if (role === "seller" && conv.unreadDealerCount > 0) {
      await storage.markConversationReadByDealer(id);
    } else if (role === "buyer") {
      await db.execute(sql`UPDATE conversations SET unread_client_count = 0 WHERE id = ${id}`);
    }

    return json({ conversation: conv, messages, role });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return error("Unauthorized", 401);
    return error(msg, 500);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuth();
    await ensureMessagingSchema();
    const { id } = await params;

    const conv = await storage.getConversation(id);
    if (!conv) return error("Conversation not found", 404);
    const role = getUserRole(conv, user.id);
    if (!role) return error("Forbidden", 403);

    const body = await req.json().catch(() => null);
    const content = body?.content?.trim();
    if (!content) return error("Message content required", 400);

    const sender = role === "seller" ? "dealer" : "client";

    const inserted = await storage.createMessage({
      conversationId: id,
      sender,
      type: "text",
      content,
      channel: "chat",
    });

    await storage.touchConversationAfterMessage({
      conversationId: id,
      sender,
      contentPreview: content,
      bumpStatusToInProgress: role === "seller" && conv.status === "new",
    });

    // Bump the OTHER side's unread counter
    if (role === "seller") {
      await db.execute(sql`UPDATE conversations SET unread_client_count = coalesce(unread_client_count, 0) + 1 WHERE id = ${id}`);
    }

    return json({ ok: true, message: inserted });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return error("Unauthorized", 401);
    return error(msg, 500);
  }
}
