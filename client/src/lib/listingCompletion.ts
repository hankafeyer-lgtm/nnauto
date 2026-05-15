/**
 * Listing completion scoring — pure functions, no React.
 *
 * Computes a 0–100 score based on which fields the seller has filled
 * out. Used by the owner-facing analytics card to nudge them into
 * adding the bits that move conversion: photos, VIN, description,
 * specs, price, video.
 *
 * Weights add up to 100. Each item is independent so a missing one
 * doesn't fail the others.
 */

/** Minimal subset of the listing shape we read. Kept loose on purpose so
 *  it accepts both the public API listing type and the dealer/admin
 *  augmented shapes without a coupling cascade. */
export type CompletionListingInput = {
  photos?: string[] | null;
  video?: string | null;
  vin?: string | null;
  description?: string | null;
  price?: string | number | null;
  year?: number | null;
  mileage?: number | null;
  brand?: string | null;
  model?: string | null;
  fuelType?: string[] | string | null;
  transmission?: string[] | string | null;
  bodyType?: string | null;
};

export type CompletionItem = {
  key:
    | "photos"
    | "vin"
    | "description"
    | "specs"
    | "price"
    | "video";
  /** Czech short label shown in recommendations list. */
  label: string;
  /** Czech suggestion text shown when the item is incomplete. */
  suggestion: string;
  /** Lucide icon name as a string — UI maps to component. */
  icon: "Camera" | "FileText" | "AlignLeft" | "Settings2" | "DollarSign" | "Video";
  /** Whole-percent contribution of this item to the total score. */
  weight: number;
  /** True when the field qualifies as "filled out". */
  completed: boolean;
  /** 0..1 fraction earned for this item (partial credit for photos). */
  earnedFraction: number;
};

export type CompletionResult = {
  /** Integer 0..100 — what we show as "Заповнено на X%". */
  score: number;
  items: CompletionItem[];
  /** Items that are NOT completed yet, in display order. */
  missing: CompletionItem[];
};

const PHOTO_TARGET = 8;

function fillRatioFromArrayLength(len: number, target: number): number {
  if (target <= 0) return 1;
  if (len <= 0) return 0;
  if (len >= target) return 1;
  return len / target;
}

function hasText(value: string | null | undefined, min = 1): boolean {
  return typeof value === "string" && value.trim().length >= min;
}

function hasNonEmptyArray(
  value: string[] | string | null | undefined,
): boolean {
  if (Array.isArray(value)) return value.some((s) => hasText(s, 1));
  return hasText(value ?? "", 1);
}

function numeric(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  const n = typeof value === "number" ? value : Number(String(value).trim());
  return Number.isFinite(n) ? n : null;
}

/**
 * Compute completion score for a listing. Pure function — call it from
 * either a React render or a server route.
 */
export function computeListingCompletion(
  listing: CompletionListingInput,
): CompletionResult {
  const photoCount = Array.isArray(listing.photos)
    ? listing.photos.filter((p) => hasText(p, 1)).length
    : 0;
  const photosFraction = fillRatioFromArrayLength(photoCount, PHOTO_TARGET);

  const vinComplete = hasText(listing.vin, 11);
  const descriptionComplete = hasText(listing.description, 80);
  const price = numeric(listing.price);
  const priceComplete = price !== null && price > 0;
  const videoComplete = hasText(listing.video, 1);

  // Spec coverage: brand+model+year+mileage are always must-haves
  // (server-enforced); we count the optional choices that move
  // conversion — fuel type, transmission, body type.
  const specChecks = [
    hasText(listing.brand, 1),
    hasText(listing.model, 1),
    typeof listing.year === "number" && listing.year > 0,
    typeof listing.mileage === "number" && listing.mileage >= 0,
    hasNonEmptyArray(listing.fuelType),
    hasNonEmptyArray(listing.transmission),
    hasText(listing.bodyType, 1),
  ];
  const specsFraction =
    specChecks.filter(Boolean).length / specChecks.length;
  const specsComplete = specsFraction >= 0.85;

  const items: CompletionItem[] = [
    {
      key: "photos",
      label: "Fotografie",
      suggestion:
        photoCount === 0
          ? "Přidejte alespoň 6 kvalitních fotografií auta."
          : `Přidejte ještě ${Math.max(0, PHOTO_TARGET - photoCount)} fotek (interiér, motor, kola, dokumenty).`,
      icon: "Camera",
      weight: 25,
      completed: photosFraction >= 1,
      earnedFraction: photosFraction,
    },
    {
      key: "description",
      label: "Popis",
      suggestion:
        "Napište krátký popis (servisní historie, výbava, stav) — alespoň 80 znaků.",
      icon: "AlignLeft",
      weight: 20,
      completed: descriptionComplete,
      earnedFraction: descriptionComplete ? 1 : 0,
    },
    {
      key: "specs",
      label: "Specifikace",
      suggestion:
        "Doplňte palivo, převodovku a karoserii — pomůže to ve vyhledávání.",
      icon: "Settings2",
      weight: 20,
      completed: specsComplete,
      earnedFraction: specsFraction,
    },
    {
      key: "vin",
      label: "VIN",
      suggestion:
        "Doplňte VIN — kupující ho hledají kvůli historii (Cebia, Carfax).",
      icon: "FileText",
      weight: 15,
      completed: vinComplete,
      earnedFraction: vinComplete ? 1 : 0,
    },
    {
      key: "price",
      label: "Cena",
      suggestion: "Nastavte cenu inzerátu (povinné pro publikaci).",
      icon: "DollarSign",
      weight: 10,
      completed: priceComplete,
      earnedFraction: priceComplete ? 1 : 0,
    },
    {
      key: "video",
      label: "Video",
      suggestion:
        "Přidejte krátké video — inzeráty s videem mají 2× vyšší zájem.",
      icon: "Video",
      weight: 10,
      completed: videoComplete,
      earnedFraction: videoComplete ? 1 : 0,
    },
  ];

  const rawScore = items.reduce(
    (sum, it) => sum + it.weight * it.earnedFraction,
    0,
  );
  const score = Math.max(0, Math.min(100, Math.round(rawScore)));

  return {
    score,
    items,
    missing: items.filter((it) => !it.completed),
  };
}
