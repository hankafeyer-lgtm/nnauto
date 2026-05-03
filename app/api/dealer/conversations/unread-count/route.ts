import { NextRequest } from "next/server";
import { error, json } from "@lib/api-helpers";
import { requireDealer } from "@lib/auth";
import { storage } from "@lib/storage";
import { ensureMessagingSchema } from "@lib/ensureMessagingSchema";

/**
 * Unread badge for the dealer cabinet "Messages" tab.
 * Sums unread_dealer_count across all conversations owned by this dealer.
 *
 * The client polls this every ~30s when in the cabinet (cheap).
 */
export async function GET(_req: NextRequest) {
  try {
    const user = await requireDealer();
    await ensureMessagingSchema();
    const count = await storage.getDealerUnreadCount(user.id);
    return json({ unread: count });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return error("Unauthorized", 401);
    if (msg === "Forbidden") return error("Forbidden", 403);
    return error(msg, 500);
  }
}
