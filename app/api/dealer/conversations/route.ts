import { NextRequest } from "next/server";
import { error, json } from "@lib/api-helpers";
import { requireDealer } from "@lib/auth";
import { db } from "@lib/db";
import { listings } from "@shared/schema";
import { inArray } from "drizzle-orm";
import { storage } from "@lib/storage";
import { ensureMessagingSchema } from "@lib/ensureMessagingSchema";
import { conversationStatusValues } from "@shared/schema";

/**
 * Dealer inbox list. Returns conversations belonging to this dealer's
 * listings, joined client-side with the listing summary the inbox UI
 * needs (title + first photo + price).
 *
 * Query params:
 *   ?status=new|in_progress|closed   (optional)
 *   ?search=...                      (optional, free-text)
 */
export async function GET(req: NextRequest) {
  try {
    const user = await requireDealer();
    await ensureMessagingSchema();

    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get("status");
    const status = conversationStatusValues.includes(
      statusParam as (typeof conversationStatusValues)[number],
    )
      ? (statusParam as (typeof conversationStatusValues)[number])
      : undefined;
    const search = searchParams.get("search") || undefined;

    const items = await storage.listConversationsForDealer({
      dealerUserId: user.id,
      status,
      search,
    });

    const listingIds = Array.from(
      new Set(items.map((c) => c.listingId).filter(Boolean)),
    );
    const listingRows = listingIds.length
      ? await db
          .select({
            id: listings.id,
            title: listings.title,
            brand: listings.brand,
            model: listings.model,
            price: listings.price,
            photos: listings.photos,
          })
          .from(listings)
          .where(inArray(listings.id, listingIds))
      : [];
    const listingMap = new Map(listingRows.map((l) => [l.id, l]));

    return json({
      conversations: items.map((c) => ({
        ...c,
        listing: listingMap.get(c.listingId) ?? null,
      })),
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return error("Unauthorized", 401);
    if (msg === "Forbidden") return error("Forbidden", 403);
    console.error("[GET /api/dealer/conversations] error:", e);
    return error(msg, 500);
  }
}
