/**
 * URL slug helpers for SEO routes.
 *
 * The DB stores brand / model values as lowercase strings (sometimes with
 * spaces or hyphens, occasionally diacritics). For URL paths we want a
 * stable, ASCII-only, hyphen-separated representation so that
 * `/auta/skoda/octavia`, `/auta/Škoda/Octavia` and `/auta/SKODA/OCTAVIA`
 * all resolve to the same canonical URL.
 *
 * Display formatting (e.g. "Škoda Octavia") lives in `brand-format.ts`.
 */

/** Strip diacritics: "Škoda" → "Skoda", "Citroën" → "Citroen". */
function stripDiacritics(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/**
 * Convert any user / DB string into a canonical SEO slug.
 * - Lowercased
 * - ASCII only (diacritics removed)
 * - Spaces, underscores → "-"
 * - Repeated separators collapsed
 * - Leading / trailing separators trimmed
 */
export function normalizeSlug(input: string | null | undefined): string {
  if (!input) return "";
  return stripDiacritics(String(input))
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Convert a URL slug back into the variants we may need to match against
 * DB values. Returns the slug itself plus a space-separated form, both
 * lowercased. Useful when the DB stores e.g. "3 series" while the URL is
 * "3-series".
 */
export function slugVariants(slug: string): string[] {
  const norm = normalizeSlug(slug);
  if (!norm) return [];
  const variants = new Set<string>([norm, norm.replace(/-/g, " ")]);
  return Array.from(variants);
}
