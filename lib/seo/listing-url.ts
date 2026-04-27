/**
 * Listing URL builder for SEO-friendly paths.
 *
 * Canonical format:
 *   /auta/[brand]/[model]/[id]
 *
 * Where:
 *   - brand and model are normalized via `normalizeSlug` (ASCII, lowercase,
 *     hyphenated; `Škoda` → `skoda`, `Mercedes-Benz` → `mercedes-benz`).
 *   - id is the FULL UUID (kept identical to the legacy `/listing/[id]`
 *     identifier — zero collision risk, no migration of existing identifiers,
 *     existing share/email/Stripe/etc URLs that embed the UUID can be
 *     rewritten one-to-one).
 *
 * The legacy `/listing/[id]` path remains live and serves the same content;
 * its `<link rel="canonical">` always points to the new URL built here.
 *
 * IMPORTANT: this builder must NEVER throw. If a listing is missing brand or
 * model (theoretically impossible given DB invariants, but defensively), we
 * fall back to the legacy `/listing/[id]` path so the link still resolves.
 */
import { normalizeSlug } from "./slug";

export interface ListingUrlInput {
  id: string;
  brand?: string | null;
  model?: string | null;
}

/**
 * Build the canonical SEO listing URL.
 *
 * Examples:
 *   { id: "507296e4-9441-4af8-80d7-788a036bf8fd", brand: "Škoda",         model: "Octavia" }
 *     → "/auta/skoda/octavia/507296e4-9441-4af8-80d7-788a036bf8fd"
 *
 *   { id: "919ad0cc-...",                          brand: "Mercedes-Benz", model: "C-Class" }
 *     → "/auta/mercedes-benz/c-class/919ad0cc-..."
 *
 * Falls back to legacy `/listing/[id]` if brand or model is missing.
 */
export function buildListingUrl(input: ListingUrlInput): string {
  const brandSlug = normalizeSlug(input.brand);
  const modelSlug = normalizeSlug(input.model);
  if (!brandSlug || !modelSlug || !input.id) {
    return `/listing/${input.id}`;
  }
  return `/auta/${brandSlug}/${modelSlug}/${input.id}`;
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
