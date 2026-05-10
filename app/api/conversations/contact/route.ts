import { NextRequest } from "next/server";
import { error, json } from "@lib/api-helpers";
import { db } from "@lib/db";
import { listings, users, contactDealerSchema } from "@shared/schema";
import { eq, sql } from "drizzle-orm";
import { storage } from "@lib/storage";
import { ensureMessagingSchema } from "@lib/ensureMessagingSchema";
import { checkRateLimit } from "@lib/rateLimit";
import { getCurrentUser } from "@lib/auth";
import { sendEmail } from "@lib/email";
import {
  getFirstMessageAutoReply,
  makeThreadKey,
  getPublicOrigin,
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

    // Private sellers don't have an inbox / dashboard to read inbound
    // messages from — the UI hides the form for them, this is the
    // matching server-side guard so a hand-crafted POST can't slip a
    // ghost conversation into a user account that never opens it.
    // Listings without an explicit sellerType (legacy data) keep the
    // dealer-style behaviour so we don't regress production.
    if (listing.sellerType === "private") {
      return error(
        "Private sellers can be contacted only by phone or e-mail",
        409,
      );
    }

    const [owner] = await db.select().from(users).where(eq(users.id, listing.userId));
    if (!owner) return error("Listing owner not found", 404);

    const dealerUserId = owner.id;
    const dealerId = owner.dealerId ?? null;

    // Optional: capture logged-in buyer's userId for their inbox
    let clientUserId: string | null = null;
    try {
      const currentUser = await getCurrentUser();
      if (currentUser && currentUser.id !== dealerUserId) {
        clientUserId = currentUser.id;
      }
    } catch { /* not logged in — fine, contact form works anonymously */ }

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
        clientUserId,
        clientName: name ?? null,
        clientEmail: email ?? null,
        clientPhone: phone ?? null,
        source: "chat",
        threadKey: makeThreadKey({
          dealerUserId,
          listingId,
          clientEmail: email ?? null,
          clientPhone: phone ?? null,
        }),
      });
    } else if (clientUserId && !(conversation as any).clientUserId) {
      try {
        await db.execute(sql`UPDATE conversations SET client_user_id = ${clientUserId} WHERE id = ${conversation.id} AND client_user_id IS NULL`);
      } catch { /* non-critical backfill */ }
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

    // Email notification to dealer (best-effort, never blocks response)
    if (owner.email) {
      const listingTitle = listing.title || `${listing.brand} ${listing.model}`;
      const origin = getPublicOrigin();
      sendEmail({
        to: owner.email,
        subject: `Nová zpráva k inzerátu: ${listingTitle} | NNAuto`,
        text: `Na NNAuto.cz vám přišla nová zpráva k vašemu inzerátu "${listingTitle}".\n\nOd: ${name || "Zájemce"} (${email || phone || "neuvedeno"})\n\nZpráva:\n${message}\n\nOdpovědět: ${origin}/dealer/messages`,
        html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
          <p style="font-size:15px;"><strong>Na NNAuto.cz vám přišla nová zpráva</strong> k inzerátu „${listingTitle}".</p>
          <p style="font-size:14px;color:#555;">Od: ${name || "Zájemce"} (${email || phone || "neuvedeno"})</p>
          <div style="background:#f5f5f5;border-radius:8px;padding:12px 16px;margin:12px 0;font-size:14px;">${message.replace(/\n/g, "<br/>")}</div>
          <p><a href="${origin}/dealer/messages" style="display:inline-block;background:#B8860B;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600;">Odpovědět</a></p>
          <hr style="border:none;border-top:1px solid #eee;margin:20px 0;"/>
          <p style="font-size:11px;color:#888;text-align:center;">NNAuto.cz – Prémiový autobazar</p>
        </div>`,
      }).catch(() => { /* email failures never block the response */ });
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
