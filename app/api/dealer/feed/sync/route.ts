import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { requireDealer } from "@lib/auth";
import { db } from "@lib/db";
import { dealers, dealerFeeds } from "@shared/schema";
import { eq } from "drizzle-orm";
import { getOrCreateFeed, type FeedDealerCtx } from "@lib/feed/syncFeed";
import { enqueueFeedSyncJob, processPendingFeedSyncJobs } from "@lib/feed/syncJobs";
import {
  isDealerPackageRequiredError,
  requireActiveDealerPackage,
} from "@lib/dealerPackages";

function mapAuthError(e: unknown) {
  const msg = e instanceof Error ? e.message : "Server error";
  if (msg === "Unauthorized") return error("Unauthorized", 401);
  if (msg === "Forbidden") return error("Forbidden", 403);
  if (isDealerPackageRequiredError(e)) {
    return error(
      "Pro import vozidel je nutné aktivní balíček START, BUSINESS nebo PRO.",
      402,
    );
  }
  return error(msg, 500);
}

// POST — run a full sync now. Saves the URL first when provided, then fetches,
// parses, upserts listings and deactivates vehicles missing from the feed.
export async function POST(req: NextRequest) {
  try {
    const user = await requireDealer();
    if (!user.dealerId) return error("Dealer not found", 404);

    const [dealer] = await db
      .select()
      .from(dealers)
      .where(eq(dealers.id, user.dealerId));
    if (!dealer) return error("Dealer not found", 404);

    await requireActiveDealerPackage(user.dealerId, {
      isAdmin: user.isAdmin,
    });

    const body = await req.json().catch(() => ({}));
    const bodyUrl = typeof body.feedUrl === "string" ? body.feedUrl.trim() : "";

    // Use the provided URL (and persist it) or fall back to the saved one.
    let feedUrl = bodyUrl;
    if (!feedUrl) {
      const [feed] = await db
        .select()
        .from(dealerFeeds)
        .where(eq(dealerFeeds.dealerId, user.dealerId));
      feedUrl = feed?.feedUrl || "";
    }
    if (!feedUrl) return error("Není nastavena URL feedu / URL фіду не задано", 400);

    const ctx: FeedDealerCtx = {
      userId: user.id,
      dealerId: user.dealerId,
      region: dealer.region,
      phone: dealer.phone || user.phone,
      maxListings: dealer.maxListings,
    };

    const feed = await getOrCreateFeed(ctx, feedUrl);
    await db
      .update(dealerFeeds)
      .set({ feedUrl, status: "queued", updatedAt: new Date() })
      .where(eq(dealerFeeds.id, feed.id));

    const job = await enqueueFeedSyncJob({
      dealerId: user.dealerId,
      userId: user.id,
      feedId: feed.id,
      feedUrl,
      trigger: "manual",
    });

    void processPendingFeedSyncJobs(1).catch((e) => {
      console.error("[DEALER_FEED_SYNC] Background job failed:", e);
    });

    return json({ job: { id: job.id, status: job.status, queued: true } }, 202);
  } catch (e) {
    return mapAuthError(e);
  }
}
