import { NextRequest } from "next/server";
import { error, json } from "@lib/api-helpers";
import { requireAuth } from "@lib/auth";
import { db } from "@lib/db";
import { conversations, listings } from "@shared/schema";
import { desc, or, eq, and, isNull, sql } from "drizzle-orm";
import { ensureMessagingSchema } from "@lib/ensureMessagingSchema";

/**
 * GET /api/messages/conversations — unified inbox for ANY user.
 *
 * Returns conversations where the user is either:
 *   - the client (buyer) — clientUserId matches
 *   - the listing owner (seller/dealer) — dealerUserId matches
 *
 * Each row includes a `role` field ("buyer" | "seller") so the UI knows
 * which perspective to render. Works for private sellers, dealers, and
 * all account types.
 */
export async function GET(_req: NextRequest) {
  try {
    const user = await requireAuth();
    await ensureMessagingSchema();

    const rows = await db
      .select({
        id: conversations.id,
        listingId: conversations.listingId,
        dealerUserId: conversations.dealerUserId,
        clientUserId: conversations.clientUserId,
        clientName: conversations.clientName,
        clientEmail: conversations.clientEmail,
        clientPhone: conversations.clientPhone,
        status: conversations.status,
        source: conversations.source,
        unreadDealerCount: conversations.unreadDealerCount,
        unreadClientCount: sql<number>`coalesce(${conversations.unreadClientCount}, 0)`,
        lastMessagePreview: conversations.lastMessagePreview,
        lastMessageAt: conversations.lastMessageAt,
        createdAt: conversations.createdAt,
      })
      .from(conversations)
      .where(
        and(
          or(
            eq(conversations.clientUserId, user.id),
            eq(conversations.dealerUserId, user.id),
          ),
          isNull(conversations.deletedAt),
        ),
      )
      .orderBy(desc(conversations.lastMessageAt));

    const listingIds = [...new Set(rows.map((r) => r.listingId))];
    const listingMap = new Map<string, { title?: string; brand?: string; model?: string; photos?: string[] | null }>();
    if (listingIds.length) {
      const listingRows = await db
        .select({ id: listings.id, title: listings.title, brand: listings.brand, model: listings.model, photos: listings.photos })
        .from(listings)
        .where(sql`${listings.id} IN (${sql.join(listingIds.map((id) => sql`${id}`), sql`, `)})`);
      for (const l of listingRows) listingMap.set(l.id, l);
    }

    const enriched = rows.map((r) => {
      const isSeller = r.dealerUserId === user.id;
      return {
        ...r,
        role: isSeller ? "seller" as const : "buyer" as const,
        unreadCount: isSeller ? r.unreadDealerCount : r.unreadClientCount,
        listing: listingMap.get(r.listingId) ?? null,
      };
    });

    return json({ conversations: enriched });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return error("Unauthorized", 401);
    return error(msg, 500);
  }
}
