import { NextRequest } from "next/server";
import { error, json } from "@lib/api-helpers";
import { requireAuth } from "@lib/auth";
import { storage } from "@lib/storage";
import { db } from "@lib/db";
import { eq, sql } from "drizzle-orm";
import { ensureMessagingSchema } from "@lib/ensureMessagingSchema";
import { listings, users } from "@shared/schema";
import { appendListingSourceTag } from "@shared/messageSource";
import { getFirstMessageAutoReply, getPublicOrigin } from "@lib/messaging";
import { sendEmail } from "@lib/email";

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

    const priorMessages = await storage.listMessages(id);
    // "First buyer message" = no prior client-sent message in this thread.
    // We intentionally ignore prior system/welcome messages here, otherwise
    // a tread that already had an auto-reply bubble would silently miss the
    // seller email — which is what users were reporting in production.
    const isFirstBuyerMessage =
      role === "client" &&
      priorMessages.every((m) => m.sender !== "client");

    const storedContent =
      role === "client" ? appendListingSourceTag(content) : content;

    const inserted = await storage.createMessage({
      conversationId: id,
      sender,
      type: "text",
      content: storedContent,
      channel: "chat",
    });

    await storage.touchConversationAfterMessage({
      conversationId: id,
      sender,
      contentPreview: storedContent,
      bumpStatusToInProgress: role === "seller" && conv.status === "new",
    });

    // Bump the OTHER side's unread counter
    if (role === "seller") {
      await db.execute(sql`UPDATE conversations SET unread_client_count = coalesce(unread_client_count, 0) + 1 WHERE id = ${id}`);
    }

    // First buyer message: auto-reply + e-mail seller (same behaviour as legacy contact flow)
    if (isFirstBuyerMessage) {
      const autoText = getFirstMessageAutoReply();
      if (autoText) {
        await storage.createMessage({
          conversationId: id,
          sender: "system",
          type: "text",
          content: autoText,
          channel: "chat",
        });
      }

      const [listing] = await db
        .select()
        .from(listings)
        .where(eq(listings.id, conv.listingId));
      const [owner] = await db
        .select()
        .from(users)
        .where(eq(users.id, conv.dealerUserId));

      const sellerEmail = owner?.email?.trim();
      if (!listing) {
        console.warn(
          "[MSG-EMAIL] skip: listing not found",
          { conversationId: id, listingId: conv.listingId },
        );
      } else if (!sellerEmail) {
        console.warn(
          "[MSG-EMAIL] skip: seller user has no email on file",
          { conversationId: id, dealerUserId: conv.dealerUserId },
        );
      } else {
        const listingTitle =
          listing.title ||
          `${listing.brand} ${listing.model}`.trim() ||
          "Inzerát";
        const buyerLabel =
          [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ||
          "Zájemce";
        const buyerContact =
          user.email?.trim() || user.phone?.trim() || "účet NNAuto";
        const origin = getPublicOrigin();
        try {
          // Await so a failed email is observable in logs and the API route
          // doesn't return before MailerSend has finished the HTTPS call —
          // background promises after `return` are not guaranteed on Node
          // serverless lifecycles.
          const result = await sendEmail({
            to: sellerEmail,
            subject: `Nová zpráva k inzerátu: ${listingTitle} | NNAuto`,
            text: `Na NNAuto.cz vám přišla nová zpráva k vašemu inzerátu "${listingTitle}".\n\nOd: ${buyerLabel} (${buyerContact})\n\nZpráva:\n${storedContent}\n\nOdpovědět: ${origin}/zpravy`,
            html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
          <p style="font-size:15px;"><strong>Na NNAuto.cz vám přišla nová zpráva</strong> k inzerátu „${listingTitle}".</p>
          <p style="font-size:14px;color:#555;">Od: ${buyerLabel} (${buyerContact})</p>
          <div style="background:#f5f5f5;border-radius:8px;padding:12px 16px;margin:12px 0;font-size:14px;">${storedContent.replace(/\n/g, "<br/>")}</div>
          <p><a href="${origin}/zpravy" style="display:inline-block;background:#B8860B;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600;">Odpovědět</a></p>
          <hr style="border:none;border-top:1px solid #eee;margin:20px 0;"/>
          <p style="font-size:11px;color:#888;text-align:center;">NNAuto.cz</p>
        </div>`,
          });
          if (!result.ok) {
            console.error(
              "[MSG-EMAIL] sendEmail returned ok=false",
              { conversationId: id, to: sellerEmail },
            );
          } else {
            console.info(
              "[MSG-EMAIL] sent",
              {
                conversationId: id,
                to: sellerEmail,
                externalId: result.externalId,
              },
            );
          }
        } catch (e) {
          // Never fail the POST response because of an email problem.
          console.error("[MSG-EMAIL] unexpected throw", e);
        }
      }
    }

    return json({ ok: true, message: inserted });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return error("Unauthorized", 401);
    return error(msg, 500);
  }
}
