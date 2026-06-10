import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { requireSuperAdmin } from "@lib/auth";
import { ensureAdminSchema } from "@lib/ensureAdminSchema";
import { pool } from "@lib/db";

/** Admin dashboard overview counters (super-admin only). */
export async function GET(_req: NextRequest) {
  try {
    await requireSuperAdmin();
    await ensureAdminSchema();

    const { rows } = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM dealers) AS total_dealers,
        (SELECT COUNT(*) FROM dealers WHERE verification_status = 'verified') AS verified_dealers,
        (SELECT COUNT(*) FROM dealers WHERE xml_feed_status = 'active') AS active_xml_feeds,
        (SELECT COUNT(*) FROM dealers WHERE api_enabled = true) AS active_api_keys,
        (SELECT COUNT(*) FROM dealers WHERE created_at > now() - interval '7 days') AS new_dealers,
        (SELECT COUNT(*) FROM dealers WHERE xml_feed_status = 'error') AS sync_errors,
        (SELECT COUNT(*) FROM dealers WHERE status = 'blocked') AS blocked_dealers,
        (SELECT COUNT(*) FROM dealers WHERE verification_status = 'pending') AS pending_verifications
    `);
    const r = rows[0] || {};

    // Leads have no dedicated table yet — approximate "new leads" from
    // conversations created in the last 7 days. Safe if the table is missing.
    let newLeads = 0;
    try {
      const { rows: lr } = await pool.query(
        `SELECT COUNT(*)::int AS c FROM conversations WHERE created_at > now() - interval '7 days' AND deleted_at IS NULL`,
      );
      newLeads = lr[0]?.c ?? 0;
    } catch {
      newLeads = 0;
    }

    return json({
      totalDealers: Number(r.total_dealers) || 0,
      verifiedDealers: Number(r.verified_dealers) || 0,
      pendingVerifications: Number(r.pending_verifications) || 0,
      activeXmlFeeds: Number(r.active_xml_feeds) || 0,
      activeApiKeys: Number(r.active_api_keys) || 0,
      newDealers: Number(r.new_dealers) || 0,
      syncErrors: Number(r.sync_errors) || 0,
      blockedDealers: Number(r.blocked_dealers) || 0,
      newLeads,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return error("Unauthorized", 401);
    if (msg === "Forbidden") return error("Forbidden", 403);
    return error(msg, 500);
  }
}
