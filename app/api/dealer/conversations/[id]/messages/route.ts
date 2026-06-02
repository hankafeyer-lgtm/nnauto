import { NextRequest } from "next/server";
import { error, json } from "@lib/api-helpers";
import { requireDealer } from "@lib/auth";
import { storage } from "@lib/storage";
import { ensureMessagingSchema } from "@lib/ensureMessagingSchema";
import { db } from "@lib/db";
import { listings, dealers, dealerOutboundMessageSchema } from "@shared/schema";
import { eq } from "drizzle-orm";
import { sendEmail } from "@lib/email";
import {
  buildReplyToAlias,
  getPublicOrigin,
  renderDealerEmailHtml,
  renderDealerEmailText,
} from "@lib/messaging";
import { buildListingUrl } from "@lib/seo/listing-url";

/**
 * GET — full message timeline for a conversation. Marks all client-sent
 * messages as read and zeroes the dealer-side unread counter as a side
 * effect (the act of opening the conversation in the inbox = "read").
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireDealer();
    await ensureMessagingSchema();
    const { id } = await params;

    const conv = await storage.getConversation(id);
    if (!conv) return error("Conversation not found", 404);
    if (conv.dealerUserId !== user.id) return error("Forbidden", 403);

    const items = await storage.listMessages(id);
    if (conv.unreadDealerCount > 0) {
      await storage.markConversationReadByDealer(id);
    }

    return json({
      conversation: { ...conv, unreadDealerCount: 0 },
      messages: items,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return error("Unauthorized", 401);
    if (msg === "Forbidden") return error("Forbidden", 403);
    console.error("[GET conv/:id/messages] error:", e);
    return error(msg, 500);
  }
}

/**
 * POST — dealer outbound message.
 *
 * Always persists a Message(sender=dealer). Additionally delivers via
 * e-mail when the conversation source is "email" or when the dealer
 * explicitly opts in via { viaEmail: true } AND we have a clientEmail.
 *
 * Email delivery is best-effort: if MailerSend fails we still keep the
 * in-app message, but flag the channel as "chat" instead of "email"
 * (caller decides if it wants to retry by re-sending).
 *
 * Status side-effects:
 *   conversation.status: "new" → "in_progress" on first dealer reply.
 */
export async function POST(
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
    const parsed = dealerOutboundMessageSchema.safeParse(body);
    if (!parsed.success) return error("Invalid payload", 400);
    const { content, viaEmail } = parsed.data;

    const wantEmail =
      conv.source === "email" || (viaEmail === true && !!conv.clientEmail);
    let channel: "chat" | "email" = "chat";
    let externalId: string | null = null;

    if (wantEmail && conv.clientEmail) {
      const [listing] = await db
        .select()
        .from(listings)
        .where(eq(listings.id, conv.listingId));
      const [dealerRow] = conv.dealerId
        ? await db.select().from(dealers).where(eq(dealers.id, conv.dealerId))
        : [];

      const subject = `Re: ${listing?.title || "Inzerát"} | NNAuto.cz`;
      const replyTo = buildReplyToAlias(conv.id) || undefined;
      const listingUrl = listing
        ? `${getPublicOrigin()}${buildListingUrl({
            id: listing.id,
            brand: listing.brand,
            model: listing.model,
            year: listing.year,
          })}`
        : undefined;

      // Format the price once (CZK) so both HTML and plain-text variants
      // show the same "999 999 Kč" string in the listing card.
      const priceFormatted = (() => {
        if (!listing?.price) return null;
        const n = Number(listing.price);
        if (!Number.isFinite(n) || n <= 0) return null;
        try {
          return new Intl.NumberFormat("cs-CZ", {
            style: "currency",
            currency: "CZK",
            maximumFractionDigits: 0,
          }).format(n);
        } catch {
          return `${n.toLocaleString("cs-CZ")} Kč`;
        }
      })();

      const listingContext = {
        listingTitle: listing?.title || null,
        listingUrl: listingUrl ?? null,
        listingBrand: listing?.brand || null,
        listingModel: listing?.model || null,
        listingYear: listing?.year ?? null,
        listingPriceFormatted: priceFormatted,
        dealerName: dealerRow?.companyName || null,
      };

      const result = await sendEmail({
        to: conv.clientEmail,
        toName: conv.clientName || undefined,
        subject,
        text: renderDealerEmailText({ body: content, ...listingContext }),
        html: renderDealerEmailHtml({ body: content, ...listingContext }),
        replyTo,
        fromName: dealerRow?.companyName || "NNAuto.cz",
      });
      if (result.ok) {
        channel = "email";
        externalId = result.externalId ?? null;
      }
    }

    const inserted = await storage.createMessage({
      conversationId: conv.id,
      sender: "dealer",
      type: channel === "email" ? "email" : "text",
      content,
      channel,
      externalId,
    });

    await storage.touchConversationAfterMessage({
      conversationId: conv.id,
      sender: "dealer",
      contentPreview: content,
      bumpStatusToInProgress: conv.status === "new",
    });

    return json({
      ok: true,
      message: { ...inserted, read: false },
      deliveredVia: channel,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return error("Unauthorized", 401);
    if (msg === "Forbidden") return error("Forbidden", 403);
    console.error("[POST conv/:id/messages] error:", e);
    return error(msg, 500);
  }
}
