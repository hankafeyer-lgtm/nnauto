import { json, error } from "@lib/api-helpers";
import { requireAdmin } from "@lib/auth";
import { db } from "@lib/db";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    await requireAdmin();

    const result = (await db.execute(sql`
      SELECT
        dl.*,
        u_owner.username AS owner_username,
        u_owner.email AS owner_email,
        u_deleter.username AS deleted_by_username
      FROM deleted_listings dl
      LEFT JOIN users u_owner ON u_owner.id = dl.user_id
      LEFT JOIN users u_deleter ON u_deleter.id = dl.deleted_by
      ORDER BY dl.deleted_at DESC
      LIMIT 200
    `)) as any;

    return json({ items: result?.rows || [] });
  } catch (e: any) {
    if (e.message === "Unauthorized") return error("Unauthorized", 401);
    if (e.message === "Forbidden") return error("Forbidden", 403);
    console.error("[admin/deleted-listings]", e);
    return error("Failed to fetch deleted listings", 500);
  }
}
