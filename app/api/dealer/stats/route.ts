import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { requireDealer } from "@lib/auth";
import { db } from "@lib/db";
import { dealers } from "@shared/schema";
import { eq, sql } from "drizzle-orm";
import { getActiveDealerPackageSubscription } from "@lib/dealerPackages";

export async function GET(_req: NextRequest) {
  try {
    const user = await requireDealer();
    if (!user.dealerId) return error("Dealer not found", 404);

    const [dealer] = await db
      .select()
      .from(dealers)
      .where(eq(dealers.id, user.dealerId));
    if (!dealer) return error("Dealer not found", 404);

    const userId = user.id;

    const listingsCountResult = (await db.execute(sql`
      SELECT COUNT(*)::int AS total FROM listings WHERE user_id = ${userId}
    `)) as any;
    const totalListings = listingsCountResult?.rows?.[0]?.total || 0;

    const activeListingsResult = (await db.execute(sql`
      SELECT COUNT(*)::int AS total FROM listings
      WHERE user_id = ${userId} AND created_at > now() - interval '90 days'
    `)) as any;
    const activeListings = activeListingsResult?.rows?.[0]?.total || 0;

    const analyticsResult = (await db.execute(sql`
      SELECT
        COUNT(*) FILTER (WHERE event_type = 'view')::int AS total_views,
        COUNT(*) FILTER (WHERE event_type = 'contact_click')::int AS total_contacts,
        COUNT(*) FILTER (WHERE event_type = 'whatsapp_click')::int AS total_whatsapp
      FROM listing_analytics_events
      WHERE owner_user_id = ${userId}
    `)) as any;
    const analytics = analyticsResult?.rows?.[0] || {};

    const last30Result = (await db.execute(sql`
      SELECT
        COUNT(*) FILTER (WHERE event_type = 'view')::int AS views,
        COUNT(*) FILTER (WHERE event_type = 'contact_click')::int AS contacts,
        COUNT(*) FILTER (WHERE event_type = 'whatsapp_click')::int AS whatsapp
      FROM listing_analytics_events
      WHERE owner_user_id = ${userId} AND created_at > now() - interval '30 days'
    `)) as any;
    const last30 = last30Result?.rows?.[0] || {};

    const perListingResult = (await db.execute(sql`
      SELECT
        lae.listing_id,
        l.title,
        l.brand,
        l.model,
        l.price,
        (SELECT (l.photos)[1]) AS photo,
        COUNT(*) FILTER (WHERE lae.event_type = 'view')::int AS views,
        COUNT(*) FILTER (WHERE lae.event_type = 'contact_click')::int AS contacts,
        COUNT(*) FILTER (WHERE lae.event_type = 'whatsapp_click')::int AS whatsapp
      FROM listing_analytics_events lae
      JOIN listings l ON l.id = lae.listing_id
      WHERE lae.owner_user_id = ${userId}
      GROUP BY lae.listing_id, l.title, l.brand, l.model, l.price, l.photos
      ORDER BY views DESC
      LIMIT 20
    `)) as any;
    const perListing = perListingResult?.rows || [];
    const dealerPackage = await getActiveDealerPackageSubscription(user.dealerId);

    return json({
      dealer,
      dealerPackage,
      stats: {
        totalListings,
        activeListings,
        totalViews: analytics.total_views || 0,
        totalContacts: analytics.total_contacts || 0,
        totalWhatsapp: analytics.total_whatsapp || 0,
        conversionRate: analytics.total_views
          ? (
              (((analytics.total_contacts || 0) +
                (analytics.total_whatsapp || 0)) /
                analytics.total_views) *
              100
            ).toFixed(1)
          : "0.0",
        last30Days: {
          views: last30.views || 0,
          contacts: last30.contacts || 0,
          whatsapp: last30.whatsapp || 0,
        },
        perListing,
      },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return error("Unauthorized", 401);
    if (msg === "Forbidden") return error("Forbidden", 403);
    return error(msg, 500);
  }
}
