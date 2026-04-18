import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { rateLimitAllow } from "@lib/rateLimitMemory";
import { securityLog } from "@lib/securityLog";

function clientIp(req: NextRequest) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export function middleware(req: NextRequest) {
  if (!req.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const ip = clientIp(req);
  const path = req.nextUrl.pathname;
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

export const config = { matcher: ["/api/:path*"] };
