import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { requireSuperAdmin } from "@lib/auth";
import { ensureAdminSchema } from "@lib/ensureAdminSchema";
import { pool } from "@lib/db";

/** Full dealer detail + owner + aggregated stats (super-admin only). */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireSuperAdmin();
    await ensureAdminSchema();
    const { id } = await params;

    const { rows: dealerRows } = await pool.query(
      `SELECT d.*, u.email AS owner_email, u.username AS owner_username,
              u.phone AS owner_phone, u.id AS owner_user_id
       FROM dealers d LEFT JOIN users u ON u.id = d.owner_id
       WHERE d.id = $1`,
      [id],
    );
    const d = dealerRows[0];
    if (!d) return error("Dealer not found", 404);

    const ownerId = d.owner_id as string;

    const { rows: listingRows } = await pool.query(
      `SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE is_sold = false)::int AS active
       FROM listings WHERE user_id = $1`,
      [ownerId],
    );
    const listingStats = listingRows[0] || { total: 0, active: 0 };

    let views = 0;
    let contacts = 0;
    try {
      const { rows: analyticsRows } = await pool.query(
        `SELECT event_type, COUNT(*)::int AS c
         FROM listing_analytics_events WHERE owner_user_id = $1 GROUP BY event_type`,
        [ownerId],
      );
      for (const a of analyticsRows) {
        if (a.event_type === "view") views = a.c;
        else if (a.event_type === "contact_click" || a.event_type === "whatsapp_click")
          contacts += a.c;
      }
    } catch {
      // analytics table may not exist yet
    }

    let leads = 0;
    try {
      const { rows: leadRows } = await pool.query(
        `SELECT COUNT(*)::int AS c FROM conversations WHERE dealer_user_id = $1`,
        [ownerId],
      );
      leads = leadRows[0]?.c ?? 0;
    } catch {
      leads = 0;
    }

    return json({
      dealer: {
        id: d.id,
        ownerId: d.owner_id,
        companyName: d.company_name,
        ico: d.ico,
        dic: d.dic,
        description: d.description,
        logoUrl: d.logo_url,
        website: d.website,
        phone: d.phone,
        email: d.email,
        address: d.address,
        region: d.region,
        isVerified: d.is_verified,
        maxListings: d.max_listings,
        plan: d.plan,
        status: d.status,
        verificationStatus: d.verification_status,
        xmlFeedUrl: d.xml_feed_url,
        xmlFeedStatus: d.xml_feed_status,
        apiKey: d.api_key,
        apiEnabled: d.api_enabled,
        lastSyncAt: d.last_sync_at,
        createdAt: d.created_at,
        ownerEmail: d.owner_email,
        ownerUsername: d.owner_username,
        ownerPhone: d.owner_phone,
      },
      stats: {
        vehicleCount: listingStats.total,
        activeListings: listingStats.active,
        views,
        contacts,
        leads,
      },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return error("Unauthorized", 401);
    if (msg === "Forbidden") return error("Forbidden", 403);
    return error(msg, 500);
  }
}
