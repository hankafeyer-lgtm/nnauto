import { NextRequest } from "next/server";
import { error, json } from "@lib/api-helpers";
import { requireAuth } from "@lib/auth";
import { db } from "@lib/db";
import { conversations } from "@shared/schema";
import { eq, sql } from "drizzle-orm";
import { ensureMessagingSchema } from "@lib/ensureMessagingSchema";

export async function GET(_req: NextRequest) {
  try {
    const user = await requireAuth();
    await ensureMessagingSchema();
    const [row] = await db
      .select({ total: sql<number>`coalesce(sum(coalesce(unread_client_count, 0)), 0)::int` })
      .from(conversations)
      .where(eq(conversations.clientUserId, user.id));
    return json({ unread: row?.total ?? 0 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return error("Unauthorized", 401);
    return error(msg, 500);
  }
}
