import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { requireDealer } from "@lib/auth";
import { db } from "@lib/db";
import { ensureMessagingSchema } from "@lib/ensureMessagingSchema";
import { ensureLeadsSchema } from "@lib/ensureLeadsSchema";
import { leadStatusValues } from "@shared/schema";
import { sql } from "drizzle-orm";

/**
 * Update a lead's CRM status / note. The lead id is the conversation id.
 * Ownership is enforced by matching conversations.dealer_user_id to the
 * authenticated dealer before upserting into lead_states.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireDealer();
    await ensureMessagingSchema();
    await ensureLeadsSchema();

    const { id } = await params;
    if (!id) return error("Lead not found", 404);

    const body = await req.json().catch(() => null);
    const status = body?.status as string | undefined;
    const note = typeof body?.note === "string" ? body.note : undefined;

    if (status !== undefined && !leadStatusValues.includes(status as any)) {
      return error("Invalid status", 400);
    }
    if (status === undefined && note === undefined) {
      return error("Nothing to update", 400);
    }

    // Ownership check: the conversation must belong to this dealer.
    const owner = (await db.execute(sql`
      SELECT 1 FROM conversations
      WHERE id = ${id} AND dealer_user_id = ${user.id} AND deleted_at IS NULL
      LIMIT 1
    `)) as any;
    if (!owner?.rows?.length) return error("Lead not found", 404);

    const nextStatus = status ?? "new";
    const nextNote = note ?? null;

    await db.execute(sql`
      INSERT INTO lead_states (conversation_id, dealer_user_id, status, note, updated_at)
      VALUES (${id}, ${user.id}, ${nextStatus}, ${nextNote}, now())
      ON CONFLICT (conversation_id) DO UPDATE SET
        status = ${status !== undefined ? nextStatus : sql`lead_states.status`},
        note = ${note !== undefined ? nextNote : sql`lead_states.note`},
        updated_at = now()
    `);

    return json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return error("Unauthorized", 401);
    if (msg === "Forbidden") return error("Forbidden", 403);
    return error(msg, 500);
  }
}
