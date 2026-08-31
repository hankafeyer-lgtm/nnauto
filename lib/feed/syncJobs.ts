import { db } from "@lib/db";
import { dealerFeedSyncJobs, dealerFeeds, dealers } from "@shared/schema";
import { and, eq, ne, sql } from "drizzle-orm";
import { getActiveDealerPackageSubscription } from "@lib/dealerPackages";
import {
  DEALER_BILLING_FREE_MODE,
  DEALER_FREE_MODE_MAX_LISTINGS,
} from "@shared/dealerBilling";
import { runFeedSync, type FeedDealerCtx } from "./syncFeed";

type FeedSyncTrigger = "manual" | "cron";

export async function enqueueFeedSyncJob(args: {
  dealerId: string;
  userId: string;
  feedId: string;
  feedUrl: string;
  trigger: FeedSyncTrigger;
}) {
  const [job] = await db
    .insert(dealerFeedSyncJobs)
    .values({
      dealerId: args.dealerId,
      userId: args.userId,
      feedId: args.feedId,
      feedUrl: args.feedUrl,
      trigger: args.trigger,
    })
    .returning();
  return job;
}

export async function enqueueEnabledFeedSyncJobs() {
  const feeds = await db
    .select()
    .from(dealerFeeds)
    .where(and(eq(dealerFeeds.enabled, true), ne(dealerFeeds.feedUrl, "")));

  const jobs = [];
  for (const feed of feeds) {
    const [existingPending] = await db
      .select({ id: dealerFeedSyncJobs.id })
      .from(dealerFeedSyncJobs)
      .where(
        and(
          eq(dealerFeedSyncJobs.feedId, feed.id),
          sql`${dealerFeedSyncJobs.status} IN ('pending', 'processing')`,
        ),
      )
      .limit(1);
    if (existingPending) continue;
    jobs.push(
      await enqueueFeedSyncJob({
        dealerId: feed.dealerId,
        userId: feed.userId,
        feedId: feed.id,
        feedUrl: feed.feedUrl,
        trigger: "cron",
      }),
    );
  }
  return jobs;
}

async function recoverStuckJobs() {
  await db.execute(sql`
    UPDATE dealer_feed_sync_jobs
    SET status = 'pending',
        error = COALESCE(error, 'Recovered stale processing job'),
        updated_at = now()
    WHERE status = 'processing'
      AND started_at < now() - interval '20 minutes'
  `);
}

async function claimNextFeedSyncJob() {
  const result = (await db.execute(sql`
    UPDATE dealer_feed_sync_jobs
    SET status = 'processing',
        started_at = COALESCE(started_at, now()),
        updated_at = now()
    WHERE id = (
      SELECT id
      FROM dealer_feed_sync_jobs
      WHERE status = 'pending'
      ORDER BY created_at ASC
      FOR UPDATE SKIP LOCKED
      LIMIT 1
    )
    RETURNING id
  `)) as { rows?: Array<{ id?: string }> };

  const id = result.rows?.[0]?.id;
  if (!id) return null;
  const [job] = await db
    .select()
    .from(dealerFeedSyncJobs)
    .where(eq(dealerFeedSyncJobs.id, id));
  return job ?? null;
}

async function finishJob(
  jobId: string,
  args:
    | { ok: true; summary: unknown }
    | { ok: false; error: string; summary?: unknown },
) {
  await db
    .update(dealerFeedSyncJobs)
    .set({
      status: args.ok ? "completed" : "failed",
      finishedAt: new Date(),
      summary: args.ok ? args.summary : args.summary ?? null,
      error: args.ok ? null : args.error,
      updatedAt: new Date(),
    })
    .where(eq(dealerFeedSyncJobs.id, jobId));
}

export async function processNextFeedSyncJob() {
  await recoverStuckJobs();
  const job = await claimNextFeedSyncJob();
  if (!job) return null;

  try {
    const [dealer] = await db
      .select()
      .from(dealers)
      .where(eq(dealers.id, job.dealerId));
    if (!dealer) throw new Error("Dealer not found");
    if (dealer.status === "blocked") throw new Error("Dealer blocked");

    const activePackage = await getActiveDealerPackageSubscription(job.dealerId);
    if (!DEALER_BILLING_FREE_MODE && !activePackage) {
      throw new Error("dealer_package_required");
    }

    const ctx: FeedDealerCtx = {
      userId: job.userId,
      dealerId: job.dealerId,
      region: dealer.region,
      phone: dealer.phone,
      maxListings: DEALER_BILLING_FREE_MODE
        ? DEALER_FREE_MODE_MAX_LISTINGS
        : activePackage?.maxListings ?? 0,
    };
    const summary = await runFeedSync(ctx, job.feedUrl);
    await finishJob(job.id, { ok: true, summary });
    return { jobId: job.id, dealerId: job.dealerId, ok: true, summary };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Feed sync failed";
    await finishJob(job.id, { ok: false, error: message });
    return { jobId: job.id, dealerId: job.dealerId, ok: false, error: message };
  }
}

export async function processPendingFeedSyncJobs(limit = 3) {
  const results = [];
  for (let i = 0; i < limit; i++) {
    const result = await processNextFeedSyncJob();
    if (!result) break;
    results.push(result);
  }
  return results;
}
