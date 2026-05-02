// VIN auto-fill decoder for the "Přidat inzerát" form.
// Pulls 7 normalized fields from NHTSA (Make, Model, ModelYear, BodyClass,
// FuelTypePrimary, DisplacementL/EngineModel, TransmissionStyle) and exposes
// them as a simple flat object the frontend can map to existing form fields.
//
// IMPORTANT: this is intentionally separate from `lib/vin/basic-check.ts`,
// which powers a different feature (paid Cebia upsell + risk score). Keeping
// the autofill decoder isolated means changing one will not break the other.

import { validateVinFormat } from "./basic-check";

export { validateVinFormat };

const NHTSA_URL = "https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues";

export type AutofillData = {
  make: string | null;
  model: string | null;
  year: string | null;
  body: string | null;
  fuel: string | null;
  engine: string | null;
  transmission: string | null;
};

// Cache for hot VINs. Keeps the API responsive and shields NHTSA from
// repeated identical requests during a single server lifetime. When/if a DB
// table `vin_cache` is added, swap this in-memory map for a DB lookup –
// the public API of `getDecodedVin()` does not need to change.
type CacheEntry = { data: AutofillData | null; ts: number };
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24h
const CACHE_MAX = 500;
const cache = new Map<string, CacheEntry>();

function cacheGet(vin: string): AutofillData | null | undefined {
  const hit = cache.get(vin);
  if (!hit) return undefined;
  if (Date.now() - hit.ts > CACHE_TTL_MS) {
    cache.delete(vin);
    return undefined;
  }
  // LRU bump – move the entry to the end of the insertion-order map.
  cache.delete(vin);
  cache.set(vin, hit);
  return hit.data;
}

function cacheSet(vin: string, data: AutofillData | null): void {
  if (cache.size >= CACHE_MAX) {
    const oldest = cache.keys().next().value;
    if (oldest) cache.delete(oldest);
  }
  cache.set(vin, { data, ts: Date.now() });
}

function cleanStr(v: unknown): string | null {
  const s = (v == null ? "" : String(v)).trim();
  if (!s) return null;
  // NHTSA frequently returns "Not Applicable" / "0" sentinels; treat as missing
  // so the form does not auto-fill obviously useless values.
  const lower = s.toLowerCase();
  if (
    lower === "not applicable" ||
    lower === "n/a" ||
    lower === "0" ||
    lower === "null"
  ) {
    return null;
  }
  return s;
}

async function fetchFromNHTSA(vin: string): Promise<AutofillData | null> {
  try {
    const url = `${NHTSA_URL}/${encodeURIComponent(vin)}?format=json`;
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const payload = (await res.json()) as {
      Results?: Array<Record<string, string | null>>;
    };
    const row = payload?.Results?.[0];
    if (!row) return null;

    const make = cleanStr(row.Make);
    const model = cleanStr(row.Model);
    const yearStr = cleanStr(row.ModelYear);
    const year = yearStr && /^\d{4}$/.test(yearStr) ? yearStr : null;
    const body = cleanStr(row.BodyClass);
    const fuel = cleanStr(row.FuelTypePrimary);
    // Engine: prefer the displacement (e.g. "2.0") since that is what the
    // form's `engineVolume` field stores. Fall back to EngineModel string.
    const displacement = cleanStr(row.DisplacementL);
    const engineModel = cleanStr(row.EngineModel);
    const engine = displacement || engineModel;
    const transmission = cleanStr(row.TransmissionStyle);

    if (!make && !model && !year && !body && !fuel && !engine && !transmission) {
      return null;
    }

    return { make, model, year, body, fuel, engine, transmission };
  } catch {
    return null;
  }
}

// Public entry point used by the API route. Validates input, checks the
// in-memory cache, falls back to NHTSA, and stores the result (including
// negative results, to avoid retry-storms for VINs NHTSA doesn't know).
export async function getDecodedVin(
  rawVin: string,
): Promise<{ vin: string; data: AutofillData | null } | { error: string }> {
  const vin = (rawVin || "").trim().toUpperCase();
  if (!validateVinFormat(vin)) {
    return { error: "VIN must have 17 valid characters (no I/O/Q)." };
  }

  const cached = cacheGet(vin);
  if (cached !== undefined) {
    return { vin, data: cached };
  }

  const data = await fetchFromNHTSA(vin);
  cacheSet(vin, data);
  return { vin, data };
}
