import { NextRequest, NextResponse } from "next/server";
import { error } from "@lib/api-helpers";
import { requireAuth } from "@lib/auth";
import { db } from "@lib/db";
import { listings } from "@shared/schema";
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";

/** Same fresh-response policy the batch endpoint uses. Owner stats
 *  change whenever someone views, so the browser must always revalidate. */
function freshJson(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "private, no-store, no-cache, must-revalidate, max-age=0",
      Pragma: "no-cache",
    },
  });
}

type DailyBucket = {
  date: string; // YYYY-MM-DD in Europe/Prague
  views: number;
  contactClicks: number;
  whatsappClicks: number;
  telegramClicks: number;
};

/**
 * Daily breakdown of view / contact events for a single listing,
 * suitable for plotting a chart on the listing detail page.
 *
 *   GET /api/listings/:id/analytics/daily?days=all|7|30
 *
 * Auth: only the listing owner or an admin may read. Returns 403 for
 * anyone else and 404 when the listing doesn't exist.
 *
 * Response:
 *   {
 *     days: [{ date, views, contactClicks, whatsappClicks, telegramClicks }],
 *     totals: { views, contactClicks, whatsappClicks, telegramClicks },
 *     weekOverWeek: { lastWeek, prevWeek, deltaPercent | null }
 *   }
 *
 * `days` always contains exactly `days` rows in ascending date order —
 * zero-filled for days without events so the chart never gets gaps.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const [listing] = await db
      .select({ id: listings.id, userId: listings.userId })
      .from(listings)
      .where(eq(listings.id, id));
    if (!listing) return error("Listing not found", 404);
    if (!user.isAdmin && listing.userId !== user.id) {
      return error("Forbidden", 403);
    }

    const daysParam = (req.nextUrl.searchParams.get("days") || "all").toLowerCase();
    const allTime = daysParam === "all" || daysParam === "0";
    const days: 7 | 30 | "all" = allTime
      ? "all"
      : daysParam === "30"
        ? 30
        : 7;

    // Per-day buckets in the Europe/Prague timezone so cabinet
    // owners see calendar-aligned charts even when the server runs
    // on UTC. `generate_series` zero-fills missing days.
    const dailyResult = allTime
      ? ((await db.execute(sql`
          WITH bounds AS (
            SELECT
              LEAST(
                COALESCE(
                  (
                    SELECT MIN((lae.created_at AT TIME ZONE 'Europe/Prague')::date)
                    FROM listing_analytics_events lae
                    WHERE lae.listing_id = ${id}
                  ),
                  (l.created_at AT TIME ZONE 'Europe/Prague')::date
                ),
                (l.created_at AT TIME ZONE 'Europe/Prague')::date
              ) AS start_day,
              (now() AT TIME ZONE 'Europe/Prague')::date AS end_day
            FROM listings l
            WHERE l.id = ${id}
          ),
          range AS (
            SELECT generate_series(b.start_day, b.end_day, interval '1 day')::date AS day
            FROM bounds b
          ),
          bucketed AS (
            SELECT
              (lae.created_at AT TIME ZONE 'Europe/Prague')::date AS day,
              COUNT(*) FILTER (WHERE lae.event_type = 'view')::int           AS views,
              COUNT(*) FILTER (WHERE lae.event_type = 'contact_click')::int   AS contact_clicks,
              COUNT(*) FILTER (WHERE lae.event_type = 'whatsapp_click')::int  AS whatsapp_clicks,
              COUNT(*) FILTER (WHERE lae.event_type = 'telegram_click')::int  AS telegram_clicks
            FROM listing_analytics_events lae
            CROSS JOIN bounds b
            WHERE lae.listing_id = ${id}
              AND (lae.created_at AT TIME ZONE 'Europe/Prague')::date >= b.start_day
            GROUP BY 1
          )
          SELECT
            to_char(r.day, 'YYYY-MM-DD') AS date,
            COALESCE(b.views, 0)::int            AS views,
            COALESCE(b.contact_clicks, 0)::int   AS contact_clicks,
            COALESCE(b.whatsapp_clicks, 0)::int  AS whatsapp_clicks,
            COALESCE(b.telegram_clicks, 0)::int  AS telegram_clicks
          FROM range r
          LEFT JOIN bucketed b ON b.day = r.day
          ORDER BY r.day ASC
        `)) as { rows?: Array<Record<string, unknown>> })
      : ((await db.execute(sql`
          WITH range AS (
            SELECT generate_series(
              (now() AT TIME ZONE 'Europe/Prague')::date - (${days - 1})::int,
              (now() AT TIME ZONE 'Europe/Prague')::date,
              interval '1 day'
            )::date AS day
          ),
          bucketed AS (
            SELECT
              (lae.created_at AT TIME ZONE 'Europe/Prague')::date AS day,
              COUNT(*) FILTER (WHERE lae.event_type = 'view')::int           AS views,
              COUNT(*) FILTER (WHERE lae.event_type = 'contact_click')::int   AS contact_clicks,
              COUNT(*) FILTER (WHERE lae.event_type = 'whatsapp_click')::int  AS whatsapp_clicks,
              COUNT(*) FILTER (WHERE lae.event_type = 'telegram_click')::int  AS telegram_clicks
            FROM listing_analytics_events lae
            WHERE lae.listing_id = ${id}
              AND lae.created_at >= (now() AT TIME ZONE 'Europe/Prague')::date - (${days - 1})::int
            GROUP BY 1
          )
          SELECT
            to_char(r.day, 'YYYY-MM-DD') AS date,
            COALESCE(b.views, 0)::int            AS views,
            COALESCE(b.contact_clicks, 0)::int   AS contact_clicks,
            COALESCE(b.whatsapp_clicks, 0)::int  AS whatsapp_clicks,
            COALESCE(b.telegram_clicks, 0)::int  AS telegram_clicks
          FROM range r
          LEFT JOIN bucketed b ON b.day = r.day
          ORDER BY r.day ASC
        `)) as { rows?: Array<Record<string, unknown>> });

    const daysData: DailyBucket[] = (dailyResult.rows ?? []).map((r) => ({
      date: String(r.date),
      views: Number(r.views ?? 0),
      contactClicks: Number(r.contact_clicks ?? 0),
      whatsappClicks: Number(r.whatsapp_clicks ?? 0),
      telegramClicks: Number(r.telegram_clicks ?? 0),
    }));

    // Week-over-week views growth — compare the last 7 days against
    // the 7 days before that. Lives next to the daily breakdown so
    // both come back in a single round-trip.
    const wowResult = (await db.execute(sql`
      SELECT
        COUNT(*) FILTER (
          WHERE event_type = 'view'
            AND created_at >= now() - interval '7 days'
        )::int AS last_week,
        COUNT(*) FILTER (
          WHERE event_type = 'view'
            AND created_at >= now() - interval '14 days'
            AND created_at <  now() - interval '7 days'
        )::int AS prev_week
      FROM listing_analytics_events
      WHERE listing_id = ${id}
    `)) as { rows?: Array<{ last_week?: number; prev_week?: number }> };

    const wowRow = wowResult.rows?.[0] ?? { last_week: 0, prev_week: 0 };
    const lastWeek = Number(wowRow.last_week ?? 0);
    const prevWeek = Number(wowRow.prev_week ?? 0);
    let deltaPercent: number | null = null;
    if (prevWeek > 0) {
      deltaPercent = Math.round(((lastWeek - prevWeek) / prevWeek) * 100);
    } else if (lastWeek > 0) {
      // Going from zero to positive — clamp to a sentinel rather than
      // dividing by zero, so the UI can show e.g. "Nový růst".
      deltaPercent = null;
    } else {
      deltaPercent = 0;
    }

    const totals = daysData.reduce(
      (acc, d) => {
        acc.views += d.views;
        acc.contactClicks += d.contactClicks;
        acc.whatsappClicks += d.whatsappClicks;
        acc.telegramClicks += d.telegramClicks;
        return acc;
      },
      { views: 0, contactClicks: 0, whatsappClicks: 0, telegramClicks: 0 },
    );

    return freshJson({
      days: daysData,
      totals,
      weekOverWeek: {
        lastWeek,
        prevWeek,
        deltaPercent,
      },
      window: days,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return error("Unauthorized", 401);
    if (msg === "Forbidden") return error("Forbidden", 403);
    return error(msg, 500);
  }
}
