import { NextRequest } from "next/server";
import { error, json } from "@lib/api-helpers";
import { requireAuth } from "@lib/auth";
import { storage } from "@lib/storage";
import { db } from "@lib/db";
import { sql } from "drizzle-orm";
import { ensureMessagingSchema } from "@lib/ensureMessagingSchema";

/**
 * GET /api/messages/conversations/:id/messages — buyer reads messages.
 * POST — buyer sends a reply.
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
    if ((conv as any).clientUserId !== user.id) return error("Forbidden", 403);

    const messages = await storage.listMessages(id);

    // Mark dealer messages as read from buyer side
    if ((conv as any).unreadClientCount > 0) {
      await db.execute(sql`UPDATE conversations SET unread_client_count = 0 WHERE id = ${id}`);
    }

    return json({ conversation: conv, messages });
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
    if ((conv as any).clientUserId !== user.id) return error("Forbidden", 403);

    const body = await req.json().catch(() => null);
    const content = body?.content?.trim();
    if (!content) return error("Message content required", 400);

    const inserted = await storage.createMessage({
      conversationId: id,
      sender: "client",
      type: "text",
      content,
      channel: "chat",
    });

    await storage.touchConversationAfterMessage({
      conversationId: id,
      sender: "client",
      contentPreview: content,
      bumpStatusToInProgress: false,
    });

    return json({ ok: true, message: inserted });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return error("Unauthorized", 401);
    return error(msg, 500);
  }
}
