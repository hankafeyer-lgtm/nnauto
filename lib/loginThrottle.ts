/**
 * In-memory login throttling (IP + email). Suitable for single Node process.
 * For PM2 cluster / multi-instance, replace with Redis / Upstash.
 */

type Bucket = { fails: number; lockedUntil: number };

const buckets = new Map<string, Bucket>();

const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILS = 12;
const LOCK_MS = 5 * 60 * 1000;

function prune(key: string, now: number) {
  const b = buckets.get(key);
  if (b && b.lockedUntil < now && b.fails === 0) buckets.delete(key);
}

export function isLoginBlocked(ip: string, emailNorm: string): boolean {
  const now = Date.now();
  const key = `${ip}::${emailNorm}`;
  prune(key, now);
  const b = buckets.get(key);
  if (!b) return false;
  if (b.lockedUntil > now) return true;
  return false;
}

export function recordLoginFailure(ip: string, emailNorm: string): void {
  const now = Date.now();
  const key = `${ip}::${emailNorm}`;
  let b = buckets.get(key);
  if (!b) {
    b = { fails: 0, lockedUntil: 0 };
    buckets.set(key, b);
  }
  if (b.lockedUntil > now) return;
  b.fails += 1;
  if (b.fails >= MAX_FAILS) {
    b.lockedUntil = now + LOCK_MS;
    b.fails = 0;
  }
}

export function recordLoginSuccess(ip: string, emailNorm: string): void {
  const key = `${ip}::${emailNorm}`;
  buckets.delete(key);
}
