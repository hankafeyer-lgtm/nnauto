import { NextRequest, NextResponse } from "next/server";

/**
 * First-party visit beacon. Counts every landing even when ad pixels are
 * blocked or marketing cookies are rejected. Lightweight — no PII stored
 * beyond path/referrer/UTM already present in the request.
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => null)) as {
      path?: string;
      location?: string;
      referrer?: string | null;
      utm?: Record<string, string>;
      ts?: number;
    } | null;

    const path =
      typeof body?.path === "string" ? body.path.slice(0, 500) : null;
    const referrer =
      typeof body?.referrer === "string" ? body.referrer.slice(0, 500) : null;
    const utm =
      body?.utm && typeof body.utm === "object" ? body.utm : {};

    console.info(
      JSON.stringify({
        type: "site_visit",
        path,
        referrer,
        utm_source: utm.utm_source || null,
        utm_medium: utm.utm_medium || null,
        utm_campaign: utm.utm_campaign || null,
        gclid: utm.gclid ? "1" : null,
        fbclid: utm.fbclid ? "1" : null,
        ttclid: utm.ttclid ? "1" : null,
        ts: typeof body?.ts === "number" ? body.ts : Date.now(),
      }),
    );
  } catch {
    /* never fail the beacon */
  }

  return new NextResponse(null, { status: 204 });
}
