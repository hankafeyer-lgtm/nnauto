#!/usr/bin/env node
/**
 * Add +15 "view" events to every listing's analytics.
 *
 * Views are stored as rows in `listing_analytics_events` with
 * event_type = 'view' and a UNIQUE (listing_id, event_type, viewer_fingerprint)
 * constraint. To add N views we insert N rows per listing with distinct
 * synthetic fingerprints. The created_at values are spread over the last
 * 15 days so the daily chart / week-over-week stats look natural.
 *
 * Idempotent: re-running with the same VIEWS_PER_LISTING / seed prefix
 * will NOT double-count, because the synthetic fingerprints collide and
 * ON CONFLICT DO NOTHING skips them.
 *
 * Usage:   node scripts/add-views.mjs [count]
 * Example: node scripts/add-views.mjs 15
 * Requires: DATABASE_URL (or .env with DATABASE_URL)
 */

import "dotenv/config";
import pg from "pg";

const { Client } = pg;

const VIEWS_PER_LISTING = Number(process.argv[2]) || 15;
// Override with SEED_PREFIX=... to force a fresh, non-colliding batch of views
// even if the script was already run before with the default prefix.
const SEED_PREFIX = process.env.SEED_PREFIX || "seed-bulk-views";

const connectionString =
  process.env.DATABASE_URL_POOLED ||
  process.env.PRODUCTION_DATABASE_URL ||
  process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL is missing. Set it in .env or pass as env var.");
  process.exit(1);
}

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: process.env.PGSSL_REJECT_UNAUTHORIZED !== "false" },
});

await client.connect();

try {
  const countRes = await client.query(`SELECT COUNT(*)::int AS cnt FROM listings`);
  const totalListings = countRes.rows[0]?.cnt ?? 0;
  console.log(
    `Знайдено ${totalListings} оголошень. Додаю по ${VIEWS_PER_LISTING} переглядів кожному...`,
  );

  // Single server-side bulk insert: cross-join every listing with a series
  // 0..N-1 to generate N synthetic "view" rows per listing. Distinct
  // fingerprints keep each listing's added views unique; ON CONFLICT makes
  // the whole operation idempotent. created_at is spread over the last
  // N days (one per day) with a small random intraday offset.
  const res = await client.query(
    `INSERT INTO listing_analytics_events (
       listing_id, owner_user_id, event_type, viewer_fingerprint, created_at, updated_at
     )
     SELECT
       l.id,
       l.user_id,
       'view',
       $1 || '-' || l.id || '-' || gs.i,
       now() - (gs.i || ' days')::interval - (random() * interval '12 hours'),
       now()
     FROM listings l
     CROSS JOIN generate_series(0, $2 - 1) AS gs(i)
     ON CONFLICT (listing_id, event_type, viewer_fingerprint) DO NOTHING`,
    [SEED_PREFIX, VIEWS_PER_LISTING],
  );

  const inserted = res.rowCount || 0;
  console.log(
    `Готово. Додано ${inserted} нових переглядів (пропущено вже існуючих: ${
      totalListings * VIEWS_PER_LISTING - inserted
    }).`,
  );
} finally {
  await client.end();
}
