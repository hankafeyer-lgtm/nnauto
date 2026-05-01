import { NextRequest, NextResponse } from "next/server";
import { rateLimitAllow } from "./rateLimitMemory";

// Thin wrapper around the in-memory sliding-window limiter for use in
// public API routes that don't have any other auth gate.
//
// IMPORTANT (single-process):
//   This is per-instance. For horizontal scale add a shared store (Redis).

export function getClientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    // X-Forwarded-For: client, proxy1, proxy2 → take the left-most.
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  // NextRequest doesn't expose a stable .ip on all runtimes; fall back to
  // a constant bucket so the limiter still applies (worst case: shared bucket).
  return "unknown";
}

export type RateLimitOptions = {
  // Logical name for the limiter, included in the bucket key so different
  // routes don't share counters.
  name: string;
  limit: number;
  windowMs: number;
  retryAfterSeconds?: number;
};

export function checkRateLimit(
  req: NextRequest,
  opts: RateLimitOptions,
): NextResponse | null {
  const ip = getClientIp(req);
  const key = `${opts.name}:${ip}`;
  const allowed = rateLimitAllow(key, opts.limit, opts.windowMs);
  if (allowed) return null;
  const retryAfter = String(
    opts.retryAfterSeconds ?? Math.ceil(opts.windowMs / 1000),
  );
  return NextResponse.json(
    { error: "Too many requests" },
    {
      status: 429,
      headers: { "Retry-After": retryAfter },
    },
  );
}
