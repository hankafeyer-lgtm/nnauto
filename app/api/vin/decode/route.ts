import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { checkRateLimit } from "@lib/rateLimit";
import { getDecodedVin } from "@lib/vin/decode";

// VIN auto-fill endpoint used by the "Přidat inzerát" form.
// Public (no auth) – the underlying NHTSA data is publicly available; we just
// add a cache + rate-limit so this can never become an abuse vector.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 10 lookups / 60 s per IP. Filling out a single listing only needs one
// successful lookup, so this leaves plenty of room for retries while
// blocking automated scraping.
const RATE_LIMIT = { name: "vin-decode", limit: 10, windowMs: 60_000 } as const;

export async function POST(req: NextRequest) {
  const limited = checkRateLimit(req, RATE_LIMIT);
  if (limited) return limited;

  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return error("Invalid JSON body", 400);
  }

  const vinRaw = String(body?.vin ?? "").trim().toUpperCase();
  if (!vinRaw) return error("Missing vin", 400);
  if (vinRaw.length !== 17) {
    return error("VIN must be 17 characters", 400);
  }

  const result = await getDecodedVin(vinRaw);

  if ("error" in result) {
    return error(result.error, 400);
  }

  // Caller distinguishes "decoded but empty" (success: false, data: null)
  // from "fully or partially decoded" (success: true, data: {...}). The
  // form treats both as "no destructive overwrite" cases.
  if (!result.data) {
    return json({ success: false, data: null });
  }

  return json({
    success: true,
    data: {
      make: result.data.make,
      model: result.data.model,
      year: result.data.year,
      body: result.data.body,
      fuel: result.data.fuel,
      engine: result.data.engine,
      transmission: result.data.transmission,
    },
  });
}
