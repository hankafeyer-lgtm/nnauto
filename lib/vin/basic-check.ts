// Basic VIN-check utilities (NHTSA-backed) for the free "Základní VIN-kontrola" block.
// IMPORTANT: This is intentionally limited to public/free data. Heavy/paid checks
// (Cebia, Autotracer) are handled separately and must remain untouched.

const VALID_VIN_RE = /^[A-HJ-NPR-Z0-9]{17}$/;

const NHTSA_URL = "https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues";

export type VinDecoded = {
  make: string | null;
  model: string | null;
  year: number | null;
  bodyClass: string | null;
  fuelType: string | null;
};

export type RiskLevel = "low" | "medium" | "high";

export type BasicCheckInput = {
  vin: string;
  make?: string | null;
  model?: string | null;
  year?: number | null;
  mileage?: number | null;
  price?: number | null;
};

export type BasicCheckResult = {
  validVin: boolean;
  decoded: VinDecoded | null;
  nnautoCheck: {
    score: number;
    risk: RiskLevel;
    warnings: string[];
  };
  cebiaUpsell: {
    text: string;
    cta: string;
  };
};

export function validateVinFormat(vin: string): boolean {
  return VALID_VIN_RE.test((vin || "").toUpperCase());
}

export async function decodeVinNHTSA(vin: string): Promise<VinDecoded | null> {
  try {
    const url = `${NHTSA_URL}/${encodeURIComponent(vin)}?format=json`;
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      // Avoid hanging the request route forever if NHTSA is slow/unavailable.
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      Results?: Array<Record<string, string | null>>;
    };
    const row = data?.Results?.[0];
    if (!row) return null;

    const yearStr = String(row.ModelYear || "").trim();
    const year = /^\d{4}$/.test(yearStr) ? Number(yearStr) : null;

    const make = String(row.Make || "").trim() || null;
    const model = String(row.Model || "").trim() || null;
    const bodyClass = String(row.BodyClass || "").trim() || null;
    const fuelType = String(row.FuelTypePrimary || "").trim() || null;

    // NHTSA frequently returns Results with an error code but no useful values.
    if (!make && !model && !year && !bodyClass && !fuelType) return null;

    return { make, model, year, bodyClass, fuelType };
  } catch {
    return null;
  }
}

function normalize(s: string | null | undefined): string {
  return (s || "")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[\s\-_]+/g, " ")
    .trim();
}

function namesMatch(a: string, b: string): boolean {
  if (!a || !b) return true; // we don't have data to compare → don't penalize
  if (a === b) return true;
  // Brand/model strings often differ in formatting ("A6" vs "A6 Avant",
  // "Mercedes-Benz" vs "Mercedes Benz", etc.). Treat one-side substring as match.
  if (a.includes(b) || b.includes(a)) return true;
  // Strip non-alphanumeric and compare basic tokens.
  const ta = a.replace(/[^a-z0-9]/g, "");
  const tb = b.replace(/[^a-z0-9]/g, "");
  if (!ta || !tb) return true;
  return ta === tb || ta.includes(tb) || tb.includes(ta);
}

export function evaluate(
  input: BasicCheckInput,
  decoded: VinDecoded | null,
): BasicCheckResult {
  const warnings: string[] = [];
  let score = 10;

  const validVin = validateVinFormat(input.vin);
  if (!validVin) {
    score -= 5;
    warnings.push(
      "VIN má neplatný formát (musí mít 17 znaků, bez I/O/Q).",
    );
  }

  if (decoded) {
    const declMake = normalize(input.make);
    const declModel = normalize(input.model);
    const decMake = normalize(decoded.make);
    const decModel = normalize(decoded.model);

    if (declMake && decMake && !namesMatch(declMake, decMake)) {
      score -= 2;
      warnings.push(
        `Značka v inzerátu (${input.make}) neodpovídá VIN (${decoded.make}).`,
      );
    }
    if (declModel && decModel && !namesMatch(declModel, decModel)) {
      score -= 2;
      warnings.push(
        `Model v inzerátu (${input.model}) neodpovídá VIN (${decoded.model}).`,
      );
    }
    if (
      typeof input.year === "number" &&
      Number.isFinite(input.year) &&
      decoded.year &&
      Math.abs(input.year - decoded.year) > 1
    ) {
      score -= 2;
      warnings.push(
        `Rok výroby v inzerátu (${input.year}) se výrazně liší od VIN (${decoded.year}).`,
      );
    }
  } else if (validVin) {
    warnings.push(
      "Veřejná databáze NHTSA nevrátila k tomuto VIN data – nelze ověřit značku/model/rok.",
    );
  }

  if (
    typeof input.year === "number" &&
    Number.isFinite(input.year) &&
    typeof input.mileage === "number" &&
    Number.isFinite(input.mileage) &&
    input.mileage >= 0
  ) {
    const currentYear = new Date().getFullYear();
    const ageYears = currentYear - input.year;
    // Heuristika: pro auta starší než 3 roky je < 3 000 km / rok podezřele málo.
    if (ageYears >= 3 && input.mileage < ageYears * 3000) {
      score -= 1.5;
      warnings.push(
        `Najeté kilometry (${input.mileage.toLocaleString("cs-CZ")} km) jsou na stáří vozu (${ageYears} let) podezřele nízké.`,
      );
    }
  }

  if (score < 0) score = 0;
  if (score > 10) score = 10;

  let risk: RiskLevel;
  if (score >= 8) risk = "low";
  else if (score >= 5) risk = "medium";
  else risk = "high";

  return {
    validVin,
    decoded,
    nnautoCheck: {
      score: Number(score.toFixed(1)),
      risk,
      warnings,
    },
    cebiaUpsell: {
      text: "Pro úplnou historii vozu si objednejte detailní report Cebia.",
      cta: "Prověřit přes Cebia",
    },
  };
}
