/**
 * Next.js instrumentation hook — runs once when the server process starts.
 *
 * We use it to self-schedule the dealer XML feed sync every 15 minutes so the
 * importer works on the long-running `next start` process (pm2/systemd) without
 * needing an external cron. To avoid bundling the DB driver into the
 * instrumentation chunk, the scheduler just pings our own cron endpoint over
 * localhost; the actual work runs inside that route handler.
 */
export async function register() {
  // Only run on the Node.js server runtime (not Edge), and only in production.
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.NODE_ENV !== "production") return;
  if (process.env.FEED_SYNC_DISABLED === "true") return;

  const g = globalThis as unknown as { __nnFeedTimer?: NodeJS.Timeout };
  if (g.__nnFeedTimer) return; // guard against double registration

  const INTERVAL_MS = 15 * 60 * 1000;
  const port = process.env.PORT || "5000";
  const secret = process.env.CRON_SECRET;
  const url = `http://127.0.0.1:${port}/api/cron/feed-sync${
    secret ? `?key=${encodeURIComponent(secret)}` : ""
  }`;

  const run = async () => {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        console.error(`[feed-sync] cron endpoint returned HTTP ${res.status}`);
        return;
      }
      const data = (await res.json()) as { processed?: number };
      if (data?.processed) {
        console.log(`[feed-sync] processed ${data.processed} feeds`);
      }
    } catch (e) {
      console.error("[feed-sync] scheduler error:", e);
    }
  };

  g.__nnFeedTimer = setInterval(run, INTERVAL_MS);
  // Kick off shortly after startup so the server is ready to serve the request.
  setTimeout(run, 60_000);
}
