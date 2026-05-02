// Pure helpers that translate raw NHTSA strings (returned by /api/vin/decode)
// into the enum values our listing form already uses. Keeping this in a
// separate module – with no React or form imports – makes it easy to unit
// test and keeps the AddListingPage diff small.
//
// IMPORTANT: never throw and never return values that aren't already part of
// the form's existing enums. If we cannot confidently map a raw value we
// return `null` and the caller leaves the corresponding form field as-is.

import {
  vehicleTypeBrands,
  getModelsForVehicleType,
} from "@/lib/translations";
import { carModels } from "@shared/carDatabase";

export type AutofillData = {
  make: string | null;
  model: string | null;
  year: string | null;
  body: string | null;
  fuel: string | null;
  engine: string | null;
  transmission: string | null;
};

const FUEL_VALUES = ["benzin", "diesel", "hybrid", "electric", "lpg", "cng"] as const;
type FuelValue = (typeof FUEL_VALUES)[number];

const TRANSMISSION_VALUES = ["manual", "automatic", "robot", "cvt"] as const;
type TransmissionValue = (typeof TRANSMISSION_VALUES)[number];

// Body type values are sourced from `getBodyTypes()` in translations.ts.
const KNOWN_BODY_VALUES = [
  "sedan",
  "hatchback",
  "wagon",
  "suv",
  "crossover",
  "coupe",
  "convertible",
  "minivan",
  "van",
  "pickup",
  "liftback",
  "truck",
  "chassis",
  "tipper",
] as const;

function slugify(s: string): string {
  return s
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]+/g, "")
    .replace(/-+/g, "-");
}

// Returns the brand slug as used in the form (e.g. "BMW" -> "bmw",
// "Mercedes-Benz" -> "mercedes-benz", "VOLKSWAGEN" -> "volkswagen") only if
// the slug exists in the canonical brand catalog. Otherwise null.
export function mapBrand(rawMake: string | null | undefined): string | null {
  if (!rawMake) return null;
  const slug = slugify(rawMake);
  if (!slug) return null;
  if (Object.prototype.hasOwnProperty.call(carModels, slug)) return slug;

  // Common NHTSA aliases – American spelling vs Czech catalog.
  const aliases: Record<string, string> = {
    "mercedes": "mercedes-benz",
    "vw": "volkswagen",
    "land-rover": "land-rover",
    "rolls-royce": "rolls-royce",
    "alfa": "alfa-romeo",
    "alfa-romeo": "alfa-romeo",
  };
  if (aliases[slug] && Object.prototype.hasOwnProperty.call(carModels, aliases[slug])) {
    return aliases[slug];
  }
  return null;
}

// Internal: convert a catalog model label ("Civic", "CR-V", "Octavia RS")
// into the slug actually stored in form state (matches `modelToValue` in
// AddListingPage / ModelCombobox). Keeping this here avoids importing
// AddListingPage internals.
function toFormModelValue(label: string): string {
  return label.toLowerCase().replace(/\s+/g, "-");
}

// Returns a model value (in the form's slug shape) only when the
// case-insensitive raw model matches one of the known models for the brand
// + vehicle-type combination. Otherwise null and we leave the field alone.
export function mapModel(
  brand: string | null,
  rawModel: string | null | undefined,
  vehicleType: string | undefined,
): string | null {
  if (!brand || !rawModel) return null;
  const candidates = getModelsForVehicleType(brand, vehicleType);
  if (!candidates?.length) return null;
  const target = rawModel.trim().toLowerCase();
  const targetSlug = slugify(rawModel);

  // 1) exact case-insensitive label match
  for (const c of candidates) {
    if (c.toLowerCase() === target) return toFormModelValue(c);
  }
  // 2) slug match ("CR-V" vs "Cr-V")
  for (const c of candidates) {
    if (slugify(c) === targetSlug) return toFormModelValue(c);
  }
  // 3) startsWith / contains – falls back gracefully for "CIVIC SI" → "Civic"
  for (const c of candidates) {
    const cl = c.toLowerCase();
    if (cl.startsWith(target) || target.startsWith(cl)) return toFormModelValue(c);
  }
  return null;
}

export function mapYear(raw: string | null | undefined): number | null {
  if (!raw) return null;
  const s = String(raw).trim();
  if (!/^\d{4}$/.test(s)) return null;
  const n = Number(s);
  const currentYear = new Date().getFullYear();
  if (n < 1900 || n > currentYear + 1) return null;
  return n;
}

export function mapFuel(raw: string | null | undefined): FuelValue | null {
  if (!raw) return null;
  const s = raw.toLowerCase();
  if (s.includes("hybrid")) return "hybrid";
  if (s.includes("electric") && !s.includes("hybrid")) return "electric";
  if (s.includes("diesel")) return "diesel";
  if (s.includes("compressed natural gas") || /\bcng\b/.test(s)) return "cng";
  if (s.includes("liquefied petroleum") || /\blpg\b/.test(s)) return "lpg";
  if (s.includes("gasoline") || s.includes("petrol") || s.includes("ethanol") || s.includes("flex")) {
    return "benzin";
  }
  return null;
}

export function mapTransmission(
  raw: string | null | undefined,
): TransmissionValue | null {
  if (!raw) return null;
  const s = raw.toLowerCase();
  if (s.includes("cvt") || s.includes("continuously variable")) return "cvt";
  if (s.includes("dual clutch") || s.includes("dct") || s.includes("automated manual") || s.includes("amt")) {
    return "robot";
  }
  if (s.includes("automatic")) return "automatic";
  if (s.includes("manual") || s.includes("standard")) return "manual";
  return null;
}

export function mapBody(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const s = raw.toLowerCase();
  // Order matters: longer / more specific patterns first.
  if (s.includes("convertible") || s.includes("cabriolet") || s.includes("roadster")) {
    return "convertible";
  }
  if (s.includes("coupe")) return "coupe";
  if (s.includes("liftback") || s.includes("liftgate") || s.includes("fastback")) {
    return "liftback";
  }
  if (s.includes("hatchback")) return "hatchback";
  if (s.includes("wagon") || s.includes("estate") || s.includes("kombi")) return "wagon";
  if (s.includes("pickup") || s.includes("pick-up")) return "pickup";
  if (s.includes("crossover") || s.includes("cuv")) return "crossover";
  if (s.includes("sport utility") || /\bsuv\b/.test(s)) return "suv";
  if (s.includes("minivan") || s.includes("mpv") || s.includes("multi-purpose")) return "minivan";
  if (/\bvan\b/.test(s) || s.includes("cargo van")) return "van";
  if (s.includes("sedan") || s.includes("saloon")) return "sedan";
  if (s.includes("tipper") || s.includes("dump")) return "tipper";
  if (s.includes("chassis")) return "chassis";
  if (s.includes("truck")) return "truck";
  return null;
}

// NHTSA's DisplacementL is already in the form's preferred format ("2.0",
// "1.5", "3.0"). We just sanitize it.
export function mapEngine(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const s = String(raw).trim();
  if (!s) return null;
  // If it's a pure number, normalize to one decimal place ("2" -> "2.0").
  if (/^\d+(\.\d+)?$/.test(s)) {
    const n = Number(s);
    if (!Number.isFinite(n) || n <= 0 || n > 20) return null;
    // Keep at most one decimal digit; the form treats this as a string.
    return n.toFixed(1);
  }
  return s;
}

// Picks the most likely vehicleType for a brand when the user has not
// selected one yet. Returns null if the brand is found in multiple buckets
// (in which case we leave it for the user to choose).
export function inferVehicleTypeForBrand(brand: string | null): string | null {
  if (!brand) return null;
  const types: string[] = [];
  for (const [type, brands] of Object.entries(vehicleTypeBrands)) {
    if (brands.includes(brand)) types.push(type);
  }
  if (types.length === 0) return null;
  if (types.length === 1) return types[0];
  // Prefer passenger cars when the brand is sold across categories.
  if (types.includes("osobni-auta")) return "osobni-auta";
  return types[0];
}

// Whole-form mapping – returns ONLY the keys/values we are confident about.
// The caller iterates over these and calls form.setValue() for each.
export type AutofillPatch = {
  vehicleType?: string;
  brand?: string;
  model?: string;
  year?: number;
  bodyType?: string;
  fuelType?: FuelValue[];
  transmission?: TransmissionValue[];
  engineVolume?: string;
};

export function buildAutofillPatch(
  data: AutofillData,
  current: {
    vehicleType: string | null | undefined;
    brand: string | null | undefined;
  },
): AutofillPatch {
  const patch: AutofillPatch = {};

  const brand = mapBrand(data.make);
  if (brand) {
    patch.brand = brand;
    if (!current.vehicleType) {
      const vt = inferVehicleTypeForBrand(brand);
      if (vt) patch.vehicleType = vt;
    }
  }

  // Use the (possibly newly inferred) vehicleType for model lookup so that
  // setting brand+vehicleType in the same patch can also resolve a model.
  const effectiveVehicleType = patch.vehicleType ?? current.vehicleType ?? undefined;
  const effectiveBrand = brand ?? current.brand ?? null;
  const model = mapModel(effectiveBrand, data.model, effectiveVehicleType ?? undefined);
  if (model) patch.model = model;

  const year = mapYear(data.year);
  if (year != null) patch.year = year;

  const body = mapBody(data.body);
  if (body && (KNOWN_BODY_VALUES as readonly string[]).includes(body)) {
    patch.bodyType = body;
  }

  const fuel = mapFuel(data.fuel);
  if (fuel) patch.fuelType = [fuel];

  const transmission = mapTransmission(data.transmission);
  if (transmission) patch.transmission = [transmission];

  const engine = mapEngine(data.engine);
  if (engine) patch.engineVolume = engine;

  return patch;
}
