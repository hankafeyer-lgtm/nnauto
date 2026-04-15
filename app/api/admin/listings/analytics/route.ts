import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { requireAdmin } from "@lib/auth";
import { storage } from "@lib/storage";
import { db } from "@lib/db";
import { sql } from "drizzle-orm";

type ListingAnalyticsCounts = {
  listingId: string;
  views: number;
  contactClicks: number;
  whatsappClicks: number;
};

async function getListingAnalyticsByIds(
  listingIds: string[],
): Promise<Record<string, ListingAnalyticsCounts>> {
  const base: Record<string, ListingAnalyticsCounts> = {};
  for (const id of listingIds) {
    base[id] = { listingId: id, views: 0, contactClicks: 0, whatsappClicks: 0 };
  }
  if (!listingIds.length) return base;

  const listingIdsSql = sql.join(
    listingIds.map((id) => sql`${id}`),
    sql`, `,
  );
  const result = (await db.execute(sql`
    SELECT
      listing_id,
      COUNT(*) FILTER (WHERE event_type = 'view')::int AS views,
      COUNT(*) FILTER (WHERE event_type = 'contact_click')::int AS contact_clicks,
      COUNT(*) FILTER (WHERE event_type = 'whatsapp_click')::int AS whatsapp_clicks
    FROM listing_analytics_events
    WHERE listing_id IN (${listingIdsSql})
    GROUP BY listing_id
  `)) as any;

  const rows = Array.isArray(result?.rows) ? result.rows : [];
  for (const row of rows) {
    const lid = String(row?.listing_id || "");
    if (!lid || !base[lid]) continue;
    base[lid] = {
      listingId: lid,
      views: Number(row?.views || 0),
      contactClicks: Number(row?.contact_clicks || 0),
      whatsappClicks: Number(row?.whatsapp_clicks || 0),
    };
  }
  return base;
}

export async function GET(_req: NextRequest) {
  try {
    const _admin = await requireAdmin();

    const allListings = await storage.getListings();
    const listingIds = allListings.map((l) => l.id);
    const statsMap = await getListingAnalyticsByIds(listingIds);

    const items = allListings.map((listing) => {
      const stats = statsMap[listing.id] || {
        listingId: listing.id,
        views: 0,
        contactClicks: 0,
        whatsappClicks: 0,
      };
      return {
        listingId: listing.id,
        ownerUserId: listing.userId,
        views: stats.views,
        contactClicks: stats.contactClicks,
        whatsappClicks: stats.whatsappClicks,
      };
    });

    return json({ count: items.length, items });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return error("Unauthorized", 401);
    if (msg === "Forbidden") return error("Forbidden", 403);
    return error(msg, 500);
  }
}
