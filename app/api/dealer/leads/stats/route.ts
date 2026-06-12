import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { requireDealer } from "@lib/auth";
import { db } from "@lib/db";
import { ensureMessagingSchema } from "@lib/ensureMessagingSchema";
import { ensureLeadsSchema } from "@lib/ensureLeadsSchema";
import { sql } from "drizzle-orm";

/**
 * Lead statistics for the dealer Leady tab + nav badge.
 * Counts are derived from conversations (the lead source) joined with the
 * dealer-assigned CRM status in lead_states. Legacy "rejected" maps to "lost".
 */
export async function GET(_req: NextRequest) {
  try {
    const user = await requireDealer();
    await ensureMessagingSchema();
    await ensureLeadsSchema();

    const result = (await db.execute(sql`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE c.created_at > now() - interval '7 days')::int AS "newThisWeek",
        COUNT(*) FILTER (WHERE eff.status = 'new')::int AS "new",
        COUNT(*) FILTER (WHERE eff.status = 'contacted')::int AS "contacted",
        COUNT(*) FILTER (WHERE eff.status = 'negotiating')::int AS "negotiating",
        COUNT(*) FILTER (WHERE eff.status = 'reserved')::int AS "reserved",
        COUNT(*) FILTER (WHERE eff.status = 'sold')::int AS "sold",
        COUNT(*) FILTER (WHERE eff.status = 'lost')::int AS "lost"
      FROM conversations c
      LEFT JOIN lead_states ls ON ls.conversation_id = c.id
      CROSS JOIN LATERAL (
        SELECT CASE WHEN ls.status = 'rejected' THEN 'lost' ELSE COALESCE(ls.status, 'new') END AS status
      ) eff
      WHERE c.dealer_user_id = ${user.id}
        AND c.deleted_at IS NULL
    `)) as any;

    const r = result?.rows?.[0] ?? {};
    const total = r.total ?? 0;
    const sold = r.sold ?? 0;
    const conversion = total > 0 ? Math.round((sold / total) * 1000) / 10 : 0;

    return json({
      total,
      newThisWeek: r.newThisWeek ?? 0,
      conversion,
      byStatus: {
        new: r.new ?? 0,
        contacted: r.contacted ?? 0,
        negotiating: r.negotiating ?? 0,
        reserved: r.reserved ?? 0,
        sold: r.sold ?? 0,
        lost: r.lost ?? 0,
      },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return error("Unauthorized", 401);
    if (msg === "Forbidden") return error("Forbidden", 403);
    return error(msg, 500);
  }
}
