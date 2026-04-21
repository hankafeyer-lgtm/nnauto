import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

// Lightweight diagnostic endpoint that only logs to server stdout.
// No DB, no auth, capped payload. Used to capture real-device runtime errors
// that do not surface in automated tests (e.g. iOS Safari on the user's iPhone).
export async function POST(req: NextRequest) {
  try {
    const raw = await req.text();
    if (!raw || raw.length > 8000) {
      return NextResponse.json({ ok: false }, { status: 413 });
    }
    let payload: unknown = null;
    try {
      payload = JSON.parse(raw);
    } catch {
      payload = { raw: raw.slice(0, 2000) };
    }
    const h = await headers();
    const ua = h.get("user-agent") || "unknown";
    const ref = h.get("referer") || "";
    const fwd = h.get("x-forwarded-for") || h.get("x-real-ip") || "unknown";
    const ipHash = String(fwd).slice(0, 24);
    const ts = new Date().toISOString();
    // One-line JSON so we can grep from pm2 logs
    console.log(
      "[diag] " +
        JSON.stringify({
          ts,
          ipHash,
          ua: ua.slice(0, 240),
          ref: ref.slice(0, 240),
          payload,
        }),
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true });
}
