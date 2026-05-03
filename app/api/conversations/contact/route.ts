import { NextRequest } from "next/server";
import { error, json } from "@lib/api-helpers";
import { db } from "@lib/db";
import { listings, users, contactDealerSchema } from "@shared/schema";
import { eq } from "drizzle-orm";
import { storage } from "@lib/storage";
import { ensureMessagingSchema } from "@lib/ensureMessagingSchema";
import { checkRateLimit } from "@lib/rateLimit";
import {
  getFirstMessageAutoReply,
  makeThreadKey,
} from "@lib/messaging";
import { appendListingSourceTag } from "@shared/messageSource";

/**
 * Public buyer → dealer contact form.
 *
 * Either creates a new Conversation (status=new) or appends to the
 * existing one matched by (dealerUserId × listingId × clientEmail|Phone),
 * inserts the buyer's first message and optionally an off-hours
 * auto-reply system message.
 *
 * Rate-limited per IP (cheap anti-spam — Turnstile is not currently wired
 * into this route, but can be added later by reading the token from body
 * and calling verifyTurnstileToken(); we deliberately keep it optional so
 * the form works without a captcha key configured).
 */
export async function POST(req: NextRequest) {
  const limited = checkRateLimit(req, {
    name: "conversations-contact",
    limit: 10,
    windowMs: 15 * 60 * 1000,
  });
  if (limited) return limited;

  try {
    await ensureMessagingSchema();

    const body = await req.json().catch(() => null);
    const parsed = contactDealerSchema.safeParse(body);
    if (!parsed.success) return error("Invalid payload", 400);
    const { listingId, name, email, phone, message: rawMessage } = parsed.data;

    // Defensive: even though the client widgets prepend the
    // "Inzerát z NNAuto.cz" attribution, third-party clients hitting
    // this public endpoint might not. The helper is idempotent — if
    // the buyer already added the tag we don't duplicate it.
    const message = appendListingSourceTag(rawMessage);

    if (!email && !phone) {
      return error("E-mail nebo telefon je povinný", 400);
    }

    const [listing] = await db
      .select()
      .from(listings)
      .where(eq(listings.id, listingId));
    if (!listing) return error("Listing not found", 404);

    const [owner] = await db.select().from(users).where(eq(users.id, listing.userId));
    if (!owner) return error("Listing owner not found", 404);

    const dealerUserId = owner.id;
    const dealerId = owner.dealerId ?? null;

    let conversation = await storage.findExistingConversation({
      dealerUserId,
      listingId,
      clientEmail: email ?? null,
      clientPhone: phone ?? null,
    });

    if (!conversation) {
      conversation = await storage.createConversation({
        dealerUserId,
        dealerId,
        listingId,
        clientName: name ?? null,
        clientEmail: email ?? null,
        clientPhone: phone ?? null,
        // The form is in-app; if a buyer leaves an email we still keep
        // source="chat" so the dealer reply UI defaults to in-app chat
        // (dealer can opt-in to email per-message).
        source: "chat",
        threadKey: makeThreadKey({
          dealerUserId,
          listingId,
          clientEmail: email ?? null,
          clientPhone: phone ?? null,
        }),
      });
    }

    const isFirstClientMessageOfConversation =
      !conversation.lastMessageAt;

    const inserted = await storage.createMessage({
      conversationId: conversation.id,
      sender: "client",
      type: "text",
      content: message,
      channel: "chat",
    });

    await storage.touchConversationAfterMessage({
      conversationId: conversation.id,
      sender: "client",
      contentPreview: message,
      bumpStatusToInProgress: false, // first incoming message stays "new"
    });

    let autoReplyMessage: { id: string } | null = null;
    if (isFirstClientMessageOfConversation) {
      const autoText = getFirstMessageAutoReply();
      if (autoText) {
        const autoMsg = await storage.createMessage({
          conversationId: conversation.id,
          sender: "system",
          type: "text",
          content: autoText,
          channel: "chat",
        });
        autoReplyMessage = { id: autoMsg.id };
      }
    }

    return json({
      ok: true,
      conversationId: conversation.id,
      messageId: inserted.id,
      autoReplyMessageId: autoReplyMessage?.id ?? null,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    console.error("[POST /api/conversations/contact] error:", e);
    return error(msg, 500);
  }
}
