import { NextRequest } from "next/server";
import { z } from "zod";
import { error, json } from "@lib/api-helpers";
import { requireAuth } from "@lib/auth";
import { db } from "@lib/db";
import { listings, users } from "@shared/schema";
import { eq, sql } from "drizzle-orm";
import { storage } from "@lib/storage";
import { ensureMessagingSchema } from "@lib/ensureMessagingSchema";
import { checkRateLimit } from "@lib/rateLimit";
import { sendEmail } from "@lib/email";
import {
  getFirstMessageAutoReply,
  makeThreadKey,
  getPublicOrigin,
} from "@lib/messaging";
import { appendListingSourceTag } from "@shared/messageSource";

const bodySchema = z.object({
  listingId: z.string().min(1),
  initialMessage: z.string().trim().max(4000).optional(),
});

/**
 * Logged-in buyer: find or create the NNAuto chat thread for a listing,
 * optionally seed the first message when the thread is still empty.
 * Used from listing detail → /zpravy deep-link (private + dealer listings).
 */
export async function POST(req: NextRequest) {
  const limited = checkRateLimit(req, {
    name: "messages-ensure-from-listing",
    limit: 30,
    windowMs: 15 * 60 * 1000,
  });
  if (limited) return limited;

  try {
    await ensureMessagingSchema();
    const user = await requireAuth();

    const raw = await req.json().catch(() => null);
    const parsed = bodySchema.safeParse(raw);
    if (!parsed.success) return error("Invalid payload", 400);
    const { listingId, initialMessage: rawInitial } = parsed.data;

    const [listing] = await db
      .select()
      .from(listings)
      .where(eq(listings.id, listingId));
    if (!listing) return error("Listing not found", 404);
    if (listing.userId === user.id) {
      return error("Nelze psát sám sobě", 400);
    }

    const [owner] = await db.select().from(users).where(eq(users.id, listing.userId));
    if (!owner) return error("Listing owner not found", 404);

    const dealerUserId = owner.id;
    const dealerId = owner.dealerId ?? null;

    let conversation = await storage.findConversationByClientUserAndListing({
      clientUserId: user.id,
      listingId,
    });

    const buyerName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
    const buyerEmail = user.email?.trim() || null;
    const buyerPhone = user.phone?.trim() || null;

    if (!conversation) {
      if (!buyerEmail && !buyerPhone) {
        return error("V účtu chybí e-mail i telefon — dopňte je v profilu.", 400);
      }
      conversation = await storage.createConversation({
        dealerUserId,
        dealerId,
        listingId,
        clientUserId: user.id,
        clientName: buyerName || null,
        clientEmail: buyerEmail,
        clientPhone: buyerPhone,
        source: "chat",
        threadKey: makeThreadKey({
          dealerUserId,
          listingId,
          clientEmail: buyerEmail,
          clientPhone: buyerPhone,
        }),
      });
    } else if (!(conversation as { clientUserId?: string | null }).clientUserId) {
      try {
        await db.execute(
          sql`UPDATE conversations SET client_user_id = ${user.id} WHERE id = ${conversation.id} AND client_user_id IS NULL`,
        );
      } catch {
        /* non-critical */
      }
    }

    const messages = await storage.listMessages(conversation.id);
    const initial = rawInitial?.trim();

    if (messages.length === 0 && initial) {
      const tagged = appendListingSourceTag(initial);

      await storage.createMessage({
        conversationId: conversation.id,
        sender: "client",
        type: "text",
        content: tagged,
        channel: "chat",
      });

      await storage.touchConversationAfterMessage({
        conversationId: conversation.id,
        sender: "client",
        contentPreview: tagged,
        bumpStatusToInProgress: false,
      });

      const autoText = getFirstMessageAutoReply();
      if (autoText) {
        await storage.createMessage({
          conversationId: conversation.id,
          sender: "system",
          type: "text",
          content: autoText,
          channel: "chat",
        });
      }

      if (owner.email) {
        const listingTitle =
          listing.title || `${listing.brand} ${listing.model}`.trim() || "Inzerát";
        const origin = getPublicOrigin();
        sendEmail({
          to: owner.email,
          subject: `Nová zpráva k inzerátu: ${listingTitle} | NNAuto`,
          text: `Na NNAuto.cz vám přišla nová zpráva k vašemu inzerátu "${listingTitle}".\n\nOd: ${buyerName || "Zájemce"} (${buyerEmail || buyerPhone || "účet NNAuto"})\n\nZpráva:\n${tagged}\n\nOdpovědět: ${origin}/zpravy`,
          html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
          <p style="font-size:15px;"><strong>Na NNAuto.cz vám přišla nová zpráva</strong> k inzerátu „${listingTitle}".</p>
          <p style="font-size:14px;color:#555;">Od: ${buyerName || "Zájemce"} (${buyerEmail || buyerPhone || "účet NNAuto"})</p>
          <div style="background:#f5f5f5;border-radius:8px;padding:12px 16px;margin:12px 0;font-size:14px;">${tagged.replace(/\n/g, "<br/>")}</div>
          <p><a href="${origin}/zpravy" style="display:inline-block;background:#B8860B;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600;">Odpovědět</a></p>
          <hr style="border:none;border-top:1px solid #eee;margin:20px 0;"/>
          <p style="font-size:11px;color:#888;text-align:center;">NNAuto.cz</p>
        </div>`,
        }).catch(() => {});
      }
    }

    return json({ conversationId: conversation.id });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return error("Unauthorized", 401);
    console.error("[POST /api/messages/conversations/ensure-from-listing]", e);
    return error(msg, 500);
  }
}
