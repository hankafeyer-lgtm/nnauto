import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { requireDealer } from "@lib/auth";
import { db } from "@lib/db";
import { dealers, dealerFeedSyncJobs, dealerFeeds } from "@shared/schema";
import { desc, eq } from "drizzle-orm";
import { validateFeedUrl } from "@lib/feed/syncFeed";

function mapAuthError(e: unknown) {
  const msg = e instanceof Error ? e.message : "Server error";
  if (msg === "Unauthorized") return error("Unauthorized", 401);
  if (msg === "Forbidden") return error("Forbidden", 403);
  return error(msg, 500);
}

// GET — return the dealer's feed config + latest sync status.
export async function GET() {
  try {
    const user = await requireDealer();
    if (!user.dealerId) return error("Dealer not found", 404);

    const [feed] = await db
      .select()
      .from(dealerFeeds)
      .where(eq(dealerFeeds.dealerId, user.dealerId));

    if (!feed) {
      return json({
        feed: {
          feedUrl: "",
          status: "idle",
          enabled: true,
          lastSyncAt: null,
          vehicleCount: 0,
          createdCount: 0,
          updatedCount: 0,
          deactivatedCount: 0,
          errorCount: 0,
          lastError: null,
          errors: null,
        },
        latestJob: null,
      });
    }

    const [latestJob] = await db
      .select()
      .from(dealerFeedSyncJobs)
      .where(eq(dealerFeedSyncJobs.feedId, feed.id))
      .orderBy(desc(dealerFeedSyncJobs.createdAt))
      .limit(1);

    return json({ feed, latestJob: latestJob ?? null });
  } catch (e) {
    return mapAuthError(e);
  }
}

// POST — save (upsert) the feed URL. Does not trigger a sync.
export async function POST(req: NextRequest) {
  try {
    const user = await requireDealer();
    if (!user.dealerId) return error("Dealer not found", 404);

    const body = await req.json().catch(() => ({}));
    const feedUrl = typeof body.feedUrl === "string" ? body.feedUrl.trim() : "";
    const enabled = typeof body.enabled === "boolean" ? body.enabled : true;

    if (feedUrl) {
      try {
        await validateFeedUrl(feedUrl);
      } catch (e) {
        return error(
          e instanceof Error ? e.message : "Neplatná URL feedu / Невалідна URL фіду",
          400,
        );
      }
    }

    const [existing] = await db
      .select()
      .from(dealerFeeds)
      .where(eq(dealerFeeds.dealerId, user.dealerId));

    let feed;
    if (existing) {
      [feed] = await db
        .update(dealerFeeds)
        .set({ feedUrl, enabled, updatedAt: new Date() })
        .where(eq(dealerFeeds.id, existing.id))
        .returning();
    } else {
      [feed] = await db
        .insert(dealerFeeds)
        .values({ dealerId: user.dealerId, userId: user.id, feedUrl, enabled })
        .returning();
    }

    // Mirror onto the dealers row for the admin dealer-management view.
    await db
      .update(dealers)
      .set({
        xmlFeedUrl: feedUrl,
        xmlFeedStatus: feedUrl ? "pending" : "none",
        updatedAt: new Date(),
      })
      .where(eq(dealers.id, user.dealerId));

    return json({ feed });
  } catch (e) {
    return mapAuthError(e);
  }
}
