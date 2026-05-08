/**
 * Listing URL builder for SEO-friendly paths.
 *
 * Canonical format:
 *   /auta/[brand]/[model]/[slug]-[shortId]
 *
 * Where:
 *   - brand and model are normalized via `normalizeSlug`.
 *   - The final segment is a human-readable slug built from brand+model+year
 *     followed by the first 8 chars of the UUID (enough for unique lookup).
 *
 * Examples:
 *   { id: "507296e4-...", brand: "Škoda", model: "Octavia", year: 2018 }
 *     → "/auta/skoda/octavia/skoda-octavia-2018-507296e4"
 *
 *   { id: "919ad0cc-...", brand: "Mercedes-Benz", model: "C-Class", year: 2020 }
 *     → "/auta/mercedes-benz/c-class/mercedes-benz-c-class-2020-919ad0cc"
 *
 * The route handler extracts the trailing 8-char hex as the lookup key,
 * then verifies the slug matches the listing (self-healing redirect if not).
 *
 * The legacy `/listing/[id]` and old full-UUID paths remain live via
 * redirect to the canonical slug URL.
 *
 * IMPORTANT: this builder must NEVER throw.
 */
import { normalizeSlug } from "./slug";

export interface ListingUrlInput {
  id: string;
  brand?: string | null;
  model?: string | null;
  year?: number | null;
}

function buildSlugSegment(input: ListingUrlInput): string {
  const brand = normalizeSlug(input.brand);
  const model = normalizeSlug(input.model);
  const year = input.year ? String(input.year) : "";
  const shortId = (input.id ?? "").replace(/-/g, "").slice(0, 8);
  const parts = [brand, model, year, shortId].filter(Boolean);
  return parts.join("-");
}

/**
 * Extract the 8-char short ID from the end of a listing slug segment.
 * Returns null if the format doesn't match.
 */
export function extractShortIdFromSlug(slug: string): string | null {
  const match = slug.match(/([a-f0-9]{8})$/);
  return match?.[1] ?? null;
}

/**
 * Build the canonical SEO listing URL.
 */
export function buildListingUrl(input: ListingUrlInput): string {
  const brandSlug = normalizeSlug(input.brand);
  const modelSlug = normalizeSlug(input.model);
  if (!brandSlug || !modelSlug || !input.id) {
    return `/listing/${input.id}`;
  }
  const segment = buildSlugSegment(input);
  return `/auta/${brandSlug}/${modelSlug}/${segment}`;
}

/**
 * Build the absolute canonical URL (with origin) for use in
 * `<link rel="canonical">`, JSON-LD, sitemap, OG meta, etc.
 */
export function buildListingAbsoluteUrl(
  origin: string,
  input: ListingUrlInput,
): string {
  return `${origin}${buildListingUrl(input)}`;
}

/**
 * Returns true if the given path looks like a listing detail URL (either the
 * legacy `/listing/[id]` form or the new `/auta/[brand]/[model]/[id]` form).
 * Useful for iframe selectors, redirect logic, etc.
 */
export function isListingDetailPath(path: string | null | undefined): boolean {
  if (!path) return false;
  return /^\/(listing\/|auta\/[^/]+\/[^/]+\/)/.test(path);
}
