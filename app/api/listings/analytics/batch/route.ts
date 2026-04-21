import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { requireAuth } from "@lib/auth";
import { db } from "@lib/db";
import { sql } from "drizzle-orm";

/**
 * Batch analytics: returns {views, contactClicks, whatsappClicks} for a set of
 * listings in a single query. Only the listings that belong to the caller are
 * returned (admins may see any). Usage:
 *   GET /api/listings/analytics/batch?ids=a,b,c
 */
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const raw = req.nextUrl.searchParams.get("ids") || "";
    const ids = Array.from(
      new Set(
        raw
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
          .slice(0, 200), // safety cap
      ),
    );
    if (!ids.length) return json({ items: {} });

    // Security: instead of trusting listing_analytics_events.owner_user_id
    // (which historically may be NULL for older rows), join on listings.user_id.
    // Admins get stats for any id. Regular users only see their own listings.
    const ownerFilter = user.isAdmin
      ? sql`true`
      : sql`l.user_id = ${user.id}`;

    const result = (await db.execute(sql`
      SELECT
        lae.listing_id,
        COUNT(*) FILTER (WHERE lae.event_type = 'view')::int          AS views,
        COUNT(*) FILTER (WHERE lae.event_type = 'contact_click')::int  AS contact_clicks,
        COUNT(*) FILTER (WHERE lae.event_type = 'whatsapp_click')::int AS whatsapp_clicks,
        COUNT(*) FILTER (WHERE lae.event_type = 'telegram_click')::int AS telegram_clicks
      FROM listing_analytics_events lae
      JOIN listings l ON l.id = lae.listing_id
      WHERE lae.listing_id = ANY(${ids}::text[])
        AND ${ownerFilter}
      GROUP BY lae.listing_id
    `)) as any;

    const items: Record<
      string,
      {
        views: number;
        contactClicks: number;
        whatsappClicks: number;
        telegramClicks: number;
      }
    > = {};
    for (const r of result?.rows ?? []) {
      items[String(r.listing_id)] = {
        views: Number(r.views || 0),
        contactClicks: Number(r.contact_clicks || 0),
        whatsappClicks: Number(r.whatsapp_clicks || 0),
        telegramClicks: Number(r.telegram_clicks || 0),
      };
    }
    // Fill in zeros for requested ids with no events yet — UI expects numbers.
    for (const id of ids) {
      if (!items[id]) {
        items[id] = {
          views: 0,
          contactClicks: 0,
          whatsappClicks: 0,
          telegramClicks: 0,
        };
      }
    }
    return json({ items });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return error("Unauthorized", 401);
    return error(msg, 500);
  }
}
