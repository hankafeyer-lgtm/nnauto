import { NextRequest } from "next/server";
import { error, json } from "@lib/api-helpers";
import { requireAuth } from "@lib/auth";
import { db } from "@lib/db";
import { sql } from "drizzle-orm";
import { ensureMessagingSchema } from "@lib/ensureMessagingSchema";

/**
 * Combined unread count: conversations where user is buyer (unread_client_count)
 * + conversations where user is seller (unread_dealer_count).
 */
export async function GET(_req: NextRequest) {
  try {
    const user = await requireAuth();
    await ensureMessagingSchema();
    const [row] = await db.execute(sql`
      SELECT coalesce(
        (SELECT sum(coalesce(unread_client_count, 0))::int FROM conversations WHERE client_user_id = ${user.id}), 0
      ) + coalesce(
        (SELECT sum(unread_dealer_count)::int FROM conversations WHERE dealer_user_id = ${user.id}), 0
      ) AS total
    `) as unknown as [{ total: number }];
    return json({ unread: Number((row as any)?.total ?? 0) });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return error("Unauthorized", 401);
    return error(msg, 500);
  }
}
