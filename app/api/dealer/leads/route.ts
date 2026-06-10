import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { requireDealer } from "@lib/auth";
import { db } from "@lib/db";
import { ensureMessagingSchema } from "@lib/ensureMessagingSchema";
import { ensureLeadsSchema } from "@lib/ensureLeadsSchema";
import { sql } from "drizzle-orm";

/**
 * Dealer CRM leads.
 *
 * Leads are derived from `conversations` — every contact form / chat / inbound
 * e-mail already creates a de-duplicated conversation with the buyer's name,
 * e-mail and phone. We surface each one as a lead and join the dealer-assigned
 * CRM status from `lead_states` (defaulting to "new").
 */
export async function GET(_req: NextRequest) {
  try {
    const user = await requireDealer();
    await ensureMessagingSchema();
    await ensureLeadsSchema();

    const result = (await db.execute(sql`
      SELECT
        c.id AS id,
        COALESCE(
          NULLIF(l.title, ''),
          NULLIF(TRIM(CONCAT_WS(' ', l.brand, l.model)), ''),
          'Vozidlo'
        ) AS car,
        c.listing_id AS "listingId",
        COALESCE(NULLIF(TRIM(c.client_name), ''), 'Zájemce') AS name,
        COALESCE(c.client_phone, '') AS phone,
        COALESCE(c.client_email, '') AS email,
        c.source AS source,
        c.created_at AS date,
        COALESCE(ls.status, 'new') AS status,
        ls.note AS note
      FROM conversations c
      LEFT JOIN listings l ON l.id = c.listing_id
      LEFT JOIN lead_states ls ON ls.conversation_id = c.id
      WHERE c.dealer_user_id = ${user.id}
        AND c.deleted_at IS NULL
      ORDER BY c.created_at DESC
      LIMIT 500
    `)) as any;

    return json({ leads: result?.rows ?? [] });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return error("Unauthorized", 401);
    if (msg === "Forbidden") return error("Forbidden", 403);
    return error(msg, 500);
  }
}
