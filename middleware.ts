import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { buildListingUrl } from "@lib/seo/listing-url";
import { rateLimitAllow } from "@lib/rateLimitMemory";
import { securityLog } from "@lib/securityLog";

const LEGACY_LISTING_PATH = /^\/listing\/([^/]+)\/?$/;

function clientIp(req: NextRequest) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // SEO: legacy /listing/{id} → canonical /auta/… as HTTP 301 (Next
  // permanentRedirect() emits 308). Skip iframe embeds (`embedded=1`).
  const legacyListing = pathname.match(LEGACY_LISTING_PATH);
  if (legacyListing && req.nextUrl.searchParams.get("embedded") !== "1") {
    const listingId = legacyListing[1];
    try {
      const apiUrl = new URL(
        `/api/listings/${encodeURIComponent(listingId)}`,
        req.url,
      );
      const res = await fetch(apiUrl, {
        headers: { cookie: req.headers.get("cookie") ?? "" },
      });
      if (res.ok) {
        const listing = (await res.json()) as {
          id: string;
          brand?: string | null;
          model?: string | null;
          year?: number | null;
        };
        const destPath = buildListingUrl({
          id: listing.id,
          brand: listing.brand,
          model: listing.model,
          year: listing.year,
        });
        const dest = new URL(destPath, req.url);
        req.nextUrl.searchParams.forEach((value, key) => {
          if (key !== "embedded") dest.searchParams.set(key, value);
        });
        return NextResponse.redirect(dest, 301);
      }
    } catch {
      // Fall through to page handler (404 / embed).
    }
  }

  if (!pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const ip = clientIp(req);
  const path = pathname;
  const method = req.method;

  if (path === "/api/login" && method === "POST") {
    if (!rateLimitAllow(`login:${ip}`, 25, 60_000)) {
      securityLog("rate_limit_hit", { route: "login", ipHash: ip.slice(0, 12) });
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }
  }
  if (path === "/api/register" && method === "POST") {
    if (!rateLimitAllow(`register:${ip}`, 10, 60_000)) {
      securityLog("rate_limit_hit", { route: "register", ipHash: ip.slice(0, 12) });
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }
  }
  if (path === "/api/listings" && method === "GET") {
    if (!rateLimitAllow(`listings:${ip}`, 120, 60_000)) {
      securityLog("rate_limit_hit", { route: "listings", ipHash: ip.slice(0, 12) });
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }
  }
  if (path.match(/^\/api\/users\/[^/]+$/) && method === "GET") {
    if (!rateLimitAllow(`userget:${ip}`, 60, 60_000)) {
      securityLog("rate_limit_hit", { route: "user_get", ipHash: ip.slice(0, 12) });
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }
  }
  if (
    (path === "/api/objects/upload-file" ||
      path === "/api/objects/upload-image" ||
      path === "/api/objects/upload-video" ||
      path === "/api/objects/upload" ||
      path === "/api/objects/finalize-upload") &&
    method === "POST"
  ) {
    if (!rateLimitAllow(`upload:${ip}`, 40, 60_000)) {
      securityLog("rate_limit_hit", { route: "upload", ipHash: ip.slice(0, 12) });
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/listing/:id*", "/api/:path*"],
};
