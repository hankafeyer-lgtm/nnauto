import { NextRequest } from "next/server";
import { error, json } from "@lib/api-helpers";
import { requireAuth } from "@lib/auth";
import { db } from "@lib/db";
import { conversations, listings } from "@shared/schema";
import { desc, eq, sql } from "drizzle-orm";
import { ensureMessagingSchema } from "@lib/ensureMessagingSchema";

/**
 * GET /api/messages/conversations — buyer's inbox.
 * Returns all conversations where the logged-in user is the client.
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
        clientName: conversations.clientName,
        status: conversations.status,
        source: conversations.source,
        unreadClientCount: sql<number>`coalesce(${conversations.unreadClientCount}, 0)`,
        lastMessagePreview: conversations.lastMessagePreview,
        lastMessageAt: conversations.lastMessageAt,
        createdAt: conversations.createdAt,
      })
      .from(conversations)
      .where(eq(conversations.clientUserId, user.id))
      .orderBy(desc(conversations.lastMessageAt));

    // Enrich with listing info
    const listingIds = [...new Set(rows.map((r) => r.listingId))];
    const listingMap = new Map<string, { title?: string; brand?: string; model?: string; photos?: string[] | null }>();
    if (listingIds.length) {
      const listingRows = await db
        .select({ id: listings.id, title: listings.title, brand: listings.brand, model: listings.model, photos: listings.photos })
        .from(listings)
        .where(sql`${listings.id} IN (${sql.join(listingIds.map((id) => sql`${id}`), sql`, `)})`);
      for (const l of listingRows) listingMap.set(l.id, l);
    }

    const enriched = rows.map((r) => ({
      ...r,
      listing: listingMap.get(r.listingId) ?? null,
    }));

    return json({ conversations: enriched });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return error("Unauthorized", 401);
    return error(msg, 500);
  }
}
