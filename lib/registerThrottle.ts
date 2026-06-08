/**
 * In-memory registration throttling per IP.
 *
 * Normal (Turnstile-verified) registrations: up to 5 per hour per IP.
 * Fallback (Turnstile unavailable) registrations: up to 2 per hour per IP.
 *
 * For PM2 cluster / multi-instance, replace with Redis / Upstash.
 */

interface Entry {
  timestamps: number[];
}

const ipBuckets = new Map<string, Entry>();

const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_NORMAL = 5;
const MAX_FALLBACK = 2;

const PRUNE_INTERVAL_MS = 10 * 60 * 1000;
let lastPrune = Date.now();

function pruneAll(now: number) {
  if (now - lastPrune < PRUNE_INTERVAL_MS) return;
  lastPrune = now;
  for (const [key, entry] of ipBuckets) {
    entry.timestamps = entry.timestamps.filter((t) => now - t < WINDOW_MS);
    if (entry.timestamps.length === 0) ipBuckets.delete(key);
  }
}

function getRecent(ip: string, now: number): number[] {
  pruneAll(now);
  const entry = ipBuckets.get(ip);
  if (!entry) return [];
  entry.timestamps = entry.timestamps.filter((t) => now - t < WINDOW_MS);
  return entry.timestamps;
}

export function isRegisterBlocked(ip: string, isFallback: boolean): boolean {
  const now = Date.now();
  const recent = getRecent(ip, now);
  const limit = isFallback ? MAX_FALLBACK : MAX_NORMAL;
  return recent.length >= limit;
}

export function recordRegistration(ip: string): void {
  const now = Date.now();
  let entry = ipBuckets.get(ip);
  if (!entry) {
    entry = { timestamps: [] };
    ipBuckets.set(ip, entry);
  }
  entry.timestamps.push(now);
}
