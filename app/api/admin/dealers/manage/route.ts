import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { requireSuperAdmin } from "@lib/auth";
import { ensureAdminSchema } from "@lib/ensureAdminSchema";
import { pool } from "@lib/db";

/**
 * Rich dealer list for Admin Dealer Management (super-admin only).
 * Joins owner user (email) and listing counts. Filtering/search is done
 * client-side; this returns the full set ordered by registration date.
 */
export async function GET(_req: NextRequest) {
  try {
    await requireSuperAdmin();
    await ensureAdminSchema();

    const { rows } = await pool.query(`
      SELECT
        d.id, d.owner_id, d.company_name, d.ico, d.dic, d.logo_url, d.website,
        d.phone, d.email, d.address, d.region, d.is_verified, d.max_listings,
        d.plan, d.status, d.verification_status, d.xml_feed_url, d.xml_feed_status,
        d.api_key, d.api_enabled, d.last_sync_at, d.created_at,
        u.email AS owner_email, u.username AS owner_username, u.phone AS owner_phone,
        COALESCE(lc.total, 0)::int AS vehicle_count,
        COALESCE(lc.active, 0)::int AS active_count
      FROM dealers d
      LEFT JOIN users u ON u.id = d.owner_id
      LEFT JOIN (
        SELECT user_id, COUNT(*) AS total, COUNT(*) FILTER (WHERE is_sold = false) AS active
        FROM listings GROUP BY user_id
      ) lc ON lc.user_id = d.owner_id
      ORDER BY d.created_at DESC
    `);

    const dealers = rows.map((r) => ({
      id: r.id,
      ownerId: r.owner_id,
      companyName: r.company_name,
      ico: r.ico,
      dic: r.dic,
      logoUrl: r.logo_url,
      website: r.website,
      phone: r.phone,
      email: r.email,
      address: r.address,
      region: r.region,
      isVerified: r.is_verified,
      maxListings: r.max_listings,
      plan: r.plan,
      status: r.status,
      verificationStatus: r.verification_status,
      xmlFeedUrl: r.xml_feed_url,
      xmlFeedStatus: r.xml_feed_status,
      apiKey: r.api_key,
      apiEnabled: r.api_enabled,
      lastSyncAt: r.last_sync_at,
      createdAt: r.created_at,
      ownerEmail: r.owner_email,
      ownerUsername: r.owner_username,
      ownerPhone: r.owner_phone,
      vehicleCount: r.vehicle_count,
      activeCount: r.active_count,
    }));

    return json({ dealers });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return error("Unauthorized", 401);
    if (msg === "Forbidden") return error("Forbidden", 403);
    return error(msg, 500);
  }
}
