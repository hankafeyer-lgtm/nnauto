import { NextRequest } from "next/server";
import { error, json } from "@lib/api-helpers";
import { requireDealer } from "@lib/auth";
import { storage } from "@lib/storage";
import { ensureMessagingSchema } from "@lib/ensureMessagingSchema";

/**
 * Inbox summary used by the dealer cabinet header/footer/dashboard.
 *
 * Default response is the rich shape used by the new inbox shortcut
 * (totals + recent conversations). Older callers that only read
 * `data.unread` keep working because that field is still at the top
 * level. Callers that explicitly want the lightest possible response
 * can pass `?summary=0` to get just the count.
 *
 * The client polls this every ~60s while a dealer page is open
 * (cheap; one indexed SUM + a 5-row LIMIT).
 */
export async function GET(req: NextRequest) {
  try {
    const user = await requireDealer();
    await ensureMessagingSchema();
    const summaryRequested =
      new URL(req.url).searchParams.get("summary") !== "0";

    if (!summaryRequested) {
      const count = await storage.getDealerUnreadCount(user.id);
      return json({ unread: count });
    }

    const summary = await storage.getDealerInboxSummary(user.id);
    return json(summary);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return error("Unauthorized", 401);
    if (msg === "Forbidden") return error("Forbidden", 403);
    return error(msg, 500);
  }
}
