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
import { makeThreadKey } from "@lib/messaging";

const bodySchema = z.object({
  listingId: z.string().min(1),
});

/**
 * Logged-in buyer: find or create the NNAuto chat thread for a listing.
 * First message is sent only when the user clicks Odeslat (client POST …/messages).
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
    const { listingId } = parsed.data;

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

    return json({ conversationId: conversation.id });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return error("Unauthorized", 401);
    console.error("[POST /api/messages/conversations/ensure-from-listing]", e);
    return error(msg, 500);
  }
}
