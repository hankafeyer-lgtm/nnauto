import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { requireDealer } from "@lib/auth";
import { db } from "@lib/db";
import { sql } from "drizzle-orm";

export async function GET(_req: NextRequest) {
  try {
    const user = await requireDealer();
    const userId = user.id;

    const result = (await db.execute(sql`
      SELECT l.*,
        COALESCE(a.views, 0)::int AS views,
        COALESCE(a.contacts, 0)::int AS contacts,
        COALESCE(a.whatsapp, 0)::int AS whatsapp
      FROM listings l
      LEFT JOIN (
        SELECT
          listing_id,
          COUNT(*) FILTER (WHERE event_type = 'view') AS views,
          COUNT(*) FILTER (WHERE event_type = 'contact_click') AS contacts,
          COUNT(*) FILTER (WHERE event_type = 'whatsapp_click') AS whatsapp
        FROM listing_analytics_events
        GROUP BY listing_id
      ) a ON a.listing_id = l.id
      WHERE l.user_id = ${userId}
      ORDER BY l.created_at DESC
    `)) as any;

    return json({ listings: result?.rows || [] });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return error("Unauthorized", 401);
    if (msg === "Forbidden") return error("Forbidden", 403);
    return error(msg, 500);
  }
}
