/**
 * Sliding-window rate limiter (single process). For horizontal scale use Redis/Upstash.
 */

type Hit = { resetAt: number; count: number };

const store = new Map<string, Hit>();

export function rateLimitAllow(
  key: string,
  limit: number,
  windowMs: number,
): boolean {
  const now = Date.now();
  let h = store.get(key);
  if (!h || now > h.resetAt) {
    h = { resetAt: now + windowMs, count: 0 };
    store.set(key, h);
  }
  h.count += 1;
  if (h.count > limit) return false;
  return true;
}
