import { NextRequest } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { error, json } from "@lib/api-helpers";
import { db } from "@lib/db";
import { ensureMessagingSchema } from "@lib/ensureMessagingSchema";
import { makeThreadKey } from "@lib/messaging";
import { storage } from "@lib/storage";
import { listings, users } from "@shared/schema";

const bodySchema = z.object({
  listingId: z.string().min(1),
  phone: z.string().min(3),
  message: z.string().min(1),
  name: z.string().optional().nullable(),
  externalId: z.string().optional().nullable(),
});

/**
 * Incoming SMS webhook.
 *
 * Every SMS is stored as a normal dealer conversation/message, so it appears in
 * /dealer/messages ("Moje zprávy") instead of a separate Leads section.
 */
export async function POST(req: NextRequest) {
  const expected = (process.env.INBOUND_SMS_WEBHOOK_SECRET || "").trim();
  if (expected) {
    const url = new URL(req.url);
    const provided =
      url.searchParams.get("secret") ||
      req.headers.get("x-webhook-secret") ||
      "";
    if (provided !== expected) return error("Forbidden", 403);
  }

  try {
    await ensureMessagingSchema();

    const raw = await req.json().catch(() => null);
    const parsed = bodySchema.safeParse(raw);
    if (!parsed.success) return error("Invalid payload", 400);

    const { listingId, phone, message, name, externalId } = parsed.data;

    const [listing] = await db
      .select()
      .from(listings)
      .where(eq(listings.id, listingId));
    if (!listing) return error("Listing not found", 404);

    const [owner] = await db
      .select()
      .from(users)
      .where(eq(users.id, listing.userId));
    if (!owner) return error("Listing owner not found", 404);

    const dealerUserId = owner.id;
    const dealerId = owner.dealerId ?? null;
    const clientPhone = phone.trim();

    let conversation = await storage.findExistingConversation({
      dealerUserId,
      listingId,
      clientEmail: null,
      clientPhone,
    });

    if (!conversation) {
      conversation = await storage.createConversation({
        dealerUserId,
        dealerId,
        listingId,
        clientName: name?.trim() || null,
        clientEmail: null,
        clientPhone,
        source: "sms",
        threadKey: makeThreadKey({
          dealerUserId,
          listingId,
          clientEmail: null,
          clientPhone,
        }),
      });
    }

    const inserted = await storage.createMessage({
      conversationId: conversation.id,
      sender: "client",
      type: "text",
      content: message.trim(),
      channel: "sms",
      externalId: externalId ?? null,
    });

    await storage.touchConversationAfterMessage({
      conversationId: conversation.id,
      sender: "client",
      contentPreview: message.trim(),
      bumpStatusToInProgress: false,
    });

    return json({
      ok: true,
      conversationId: conversation.id,
      messageId: inserted.id,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    console.error("[POST /api/sms/inbound] error:", e);
    return error(msg, 500);
  }
}
