import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { syncAllFeeds } from "@lib/feed/syncFeed";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * Periodic sync of every enabled dealer feed. The app also self-schedules this
 * via instrumentation, but this endpoint lets an external scheduler (VPS cron)
 * trigger it too. Protected by CRON_SECRET passed either as
 * `Authorization: Bearer <secret>` or `?key=<secret>`.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization") || "";
    const keyParam = req.nextUrl.searchParams.get("key") || "";
    const provided = auth.startsWith("Bearer ") ? auth.slice(7) : keyParam;
    if (provided !== secret) return error("Unauthorized", 401);
  }

  const results = await syncAllFeeds();
  return json({ processed: results.length, results });
}
