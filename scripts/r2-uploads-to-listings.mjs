#!/usr/bin/env node
/**
 * Lists all R2 objects under uploads/, groups consecutive uploads within 2 minutes,
 * writes listings.json with public r2.dev URLs.
 *
 * Env (R2 S3 API):
 *   CLOUDFLARE_R2_ENDPOINT     — required, e.g. https://<ACCOUNT_ID>.r2.cloudflarestorage.com
 *   CLOUDFLARE_R2_BUCKET_NAME  — required (bucket name only, never part of hostname)
 *   CLOUDFLARE_R2_ACCESS_KEY_ID
 *   CLOUDFLARE_R2_SECRET_ACCESS_KEY
 * Optional:
 *   CLOUDFLARE_R2_ACCOUNT_ID   — only if R2_PUBLIC_BASE_URL not set and endpoint hostname cannot be parsed
 *   R2_PUBLIC_BASE_URL         — override public base (no trailing slash)
 *   R2_UPLOADS_PREFIX          — default uploads/
 *   R2_GROUP_GAP_MS            — default 120000 (2 minutes)
 *   R2_LISTINGS_OUT            — output path, default listings.json in cwd
 *
 * Run: node --env-file=.env scripts/r2-uploads-to-listings.mjs
 */

import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

try {
  await import("dotenv/config");
} catch {
  /* optional */
}

const ENDPOINT = process.env.CLOUDFLARE_R2_ENDPOINT?.trim().replace(/\/$/, "");
const BUCKET = process.env.CLOUDFLARE_R2_BUCKET_NAME?.trim();
const ACCESS_KEY = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID?.trim();
const SECRET_KEY = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY?.trim();
const PUBLIC_BASE_URL = "https://pub-d325306cbf594d02a62f39fb6a92a0fd.r2.dev";

const _prefixRaw = process.env.R2_UPLOADS_PREFIX || "uploads/";
const PREFIX = _prefixRaw.endsWith("/") ? _prefixRaw : `${_prefixRaw}/`;
const GAP_MS = Number.parseInt(process.env.R2_GROUP_GAP_MS || "120000", 10);
const OUT_FILE = resolve(
  process.cwd(),
  process.env.R2_LISTINGS_OUT || "listings.json",
);

function publicUrl(key) {
  const encodedKey = key
    .split("/")
    .map((seg) => encodeURIComponent(seg))
    .join("/");
  return `${PUBLIC_BASE_URL}/${encodedKey}`;
}

if (!ENDPOINT || !BUCKET || !ACCESS_KEY || !SECRET_KEY) {
  console.error(
    "Missing env: CLOUDFLARE_R2_ENDPOINT, CLOUDFLARE_R2_BUCKET_NAME, CLOUDFLARE_R2_ACCESS_KEY_ID, CLOUDFLARE_R2_SECRET_ACCESS_KEY",
  );
  process.exit(1);
}

console.log("[R2] Connecting with:");
console.log("  endpoint:", ENDPOINT);
console.log("  bucket:  ", BUCKET);
console.log("  prefix:  ", PREFIX);

const client = new S3Client({
  region: "auto",
  endpoint: ENDPOINT,
  forcePathStyle: true,
  credentials: {
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_KEY,
  },
});

/** @type {{ key: string; lastModified: Date }[]} */
const objects = [];
let continuationToken = undefined;

do {
  const res = await client.send(
    new ListObjectsV2Command({
      Bucket: BUCKET,
      Prefix: PREFIX,
      ContinuationToken: continuationToken,
    }),
  );
  for (const obj of res.Contents || []) {
    if (!obj.Key || !obj.LastModified) continue;
    if (obj.Key.endsWith("/")) continue;
    objects.push({ key: obj.Key, lastModified: obj.LastModified });
  }
  continuationToken = res.IsTruncated ? res.NextContinuationToken : undefined;
} while (continuationToken);

objects.sort((a, b) => a.lastModified.getTime() - b.lastModified.getTime());

/** @param {{ key: string; lastModified: Date }[][]} groups */
function buildGroups(items, gapMs) {
  if (items.length === 0) return [];
  const groups = [];
  let current = [items[0]];
  for (let i = 1; i < items.length; i++) {
    const prev = items[i - 1];
    const curr = items[i];
    const delta = curr.lastModified.getTime() - prev.lastModified.getTime();
    if (delta < gapMs) {
      current.push(curr);
    } else {
      groups.push(current);
      current = [curr];
    }
  }
  groups.push(current);
  return groups;
}

const groups = buildGroups(objects, GAP_MS);

const result = groups.map((g) => ({
  createdAt: g[0].lastModified.toISOString(),
  images: g.map((o) => publicUrl(o.key)),
}));

writeFileSync(OUT_FILE, JSON.stringify(result, null, 2), "utf8");

console.log(
  `Bucket: ${BUCKET}, prefix: ${PREFIX}, objects: ${objects.length}, groups: ${groups.length}`,
);
console.log(`Written: ${OUT_FILE}`);
