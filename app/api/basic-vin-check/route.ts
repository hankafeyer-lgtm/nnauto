import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { checkRateLimit } from "@lib/rateLimit";
import {
  decodeVinNHTSA,
  evaluate,
  validateVinFormat,
  type BasicCheckInput,
} from "@lib/vin/basic-check";

// Free, lightweight VIN sanity check. Heavy/paid Cebia logic stays in /api/cebia/*.
// This endpoint is intentionally public (no auth) – it returns the same data
// any visitor can already obtain from NHTSA, plus our own scoring.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 15 requests / 60 s per IP – enough for normal listing browsing, blocks abuse.
const RATE_LIMIT = { name: "basic-vin-check", limit: 15, windowMs: 60_000 } as const;

function toNumber(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function toStr(v: unknown): string | null {
  if (v == null) return null;
  const s = String(v).trim();
  return s ? s : null;
}

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

  const input: BasicCheckInput = {
    vin: vinRaw,
    make: toStr(body?.make),
    model: toStr(body?.model),
    year: toNumber(body?.year),
    mileage: toNumber(body?.mileage),
    price: toNumber(body?.price),
  };

  const decoded = validateVinFormat(input.vin)
    ? await decodeVinNHTSA(input.vin)
    : null;

  const result = evaluate(input, decoded);
  return json(result);
}
