import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { requireAuth } from "@lib/auth";
import { storage } from "@lib/storage";
import { db } from "@lib/db";
import { sql } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuth();
    const { id: listingId } = await params;
    if (!listingId) return error("Missing listing id", 400);

    const listing = await storage.getListing(listingId);
    if (!listing) return error("Listing not found", 404);

    if (listing.userId !== user.id && !user.isAdmin) {
      return error("Forbidden", 403);
    }

    const result = (await db.execute(sql`
      SELECT
        COUNT(*) FILTER (WHERE event_type = 'view')::int AS views,
        COUNT(*) FILTER (WHERE event_type = 'contact_click')::int AS contact_clicks,
        COUNT(*) FILTER (WHERE event_type = 'whatsapp_click')::int AS whatsapp_clicks,
        COUNT(*) FILTER (WHERE event_type = 'telegram_click')::int AS telegram_clicks
      FROM listing_analytics_events
      WHERE listing_id = ${listingId}
    `)) as any;

    const row = result?.rows?.[0];
    return json({
      listingId,
      views: Number(row?.views || 0),
      contactClicks: Number(row?.contact_clicks || 0),
      whatsappClicks: Number(row?.whatsapp_clicks || 0),
      telegramClicks: Number(row?.telegram_clicks || 0),
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return error("Unauthorized", 401);
    if (msg === "Forbidden") return error("Forbidden", 403);
    return error(msg, 500);
  }
}
