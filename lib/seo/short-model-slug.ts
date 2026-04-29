/**
 * Short model slug parser for the additive SEO landing layer.
 *
 * The new layer introduces short URLs like:
 *   /audi-a6
 *   /bmw-x5
 *   /skoda-octavia
 *   /mercedes-benz-c-class
 *
 * These pages live in `app/(main)/[modelSlug]/page.tsx` and are designed to
 * NEVER conflict with any existing route. The parser below is the single
 * gatekeeper:
 *
 *   1. Reject reserved top-level slugs (`about`, `listings`, `admin`, …).
 *   2. Resolve the slug against active DB inventory only — if there's no
 *      brand+model pair in the database that matches, return null and the
 *      page renders 404.
 *
 * No new endpoints, no new tables. Only read-only queries already used by
 * the existing brand/model SEO surfaces.
 */
import { db } from "@lib/db";
import { listings } from "@shared/schema";
import { and, eq, sql } from "drizzle-orm";
import { normalizeSlug } from "./slug";

/**
 * Top-level paths owned by other routes / static files. These must never be
 * treated as `[brand]-[model]` even if the DB happens to contain matching
 * pairs. Next.js static routes already win over the dynamic `[modelSlug]`
 * segment, but this guard makes the contract explicit and protects future
 * additions (sitemaps, asset filenames, etc.).
 */
const RESERVED_SHORT_SLUGS = new Set<string>([
  // App routes
  "about",
  "add-listing",
  "admin",
  "api",
  "auta",
  "cebia",
  "dealer",
  "img",
  "listing",
  "listings",
  "objects",
  "pricing",
  "privacy",
  "profile",
  "settings",
  "tips",
  // Special routes / files
  "feed.xml",
  "robots.txt",
  "sitemap.xml",
  "_next",
  "favicon.ico",
  "site.webmanifest",
  // Public assets that may be requested from the root
  "og-image.png",
  "hero-bg.webp",
  "logo-192.png",
  "logo-512.png",
  "apple-touch-icon.png",
  "favicon-16x16.png",
  "favicon-32x32.png",
  "favicon-48x48.png",
]);

export function isReservedShortSlug(slug: string): boolean {
  return RESERVED_SHORT_SLUGS.has(slug.toLowerCase());
}

export type ShortModelSlugMatch = {
  brand: string;
  model: string;
};

/**
 * Parse a short slug like "audi-a6" or "mercedes-benz-c-class" into a
 * { brand, model } pair, validated against active DB inventory.
 *
 * Returns null when:
 *   - input is empty / has no hyphen
 *   - slug is reserved
 *   - no (brand, model) pair with active listings matches
 *
 * Multi-word brands (e.g. "mercedes-benz") are handled by trying the
 * longest brand prefixes first.
 */
export async function parseShortModelSlug(
  rawSlug: string,
): Promise<ShortModelSlugMatch | null> {
  if (!rawSlug) return null;
  let decoded = rawSlug;
  try {
    decoded = decodeURIComponent(rawSlug);
  } catch {
    decoded = rawSlug;
  }
  const slug = decoded.toLowerCase().trim();
  if (!slug || !slug.includes("-")) return null;
  if (isReservedShortSlug(slug)) return null;

  // Distinct active brand slugs (read-only, already-cached path used by
  // brand SEO pages). Sort by length desc so "mercedes-benz" wins over
  // "mercedes" when checking prefixes.
  const brandRows = await db
    .select({ brand: listings.brand })
    .from(listings)
    .where(eq(listings.isSold, false))
    .groupBy(listings.brand);

  const brandSlugs = Array.from(
    new Set(
      brandRows
        .map((r) => normalizeSlug(String(r.brand || "")))
        .filter((s) => s.length > 0),
    ),
  );
  brandSlugs.sort((a, b) => b.length - a.length);

  for (const brand of brandSlugs) {
    if (slug === brand) continue; // brand-only is /auta/[brand], not short slug
    const prefix = `${brand}-`;
    if (!slug.startsWith(prefix)) continue;
    const modelCandidate = slug.slice(prefix.length);
    if (!modelCandidate) continue;

    const exists = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(listings)
      .where(
        and(
          eq(listings.isSold, false),
          sql`lower(${listings.brand}) = ${brand}`,
          sql`lower(${listings.model}) = ${modelCandidate}`,
        ),
      );
    const total = exists[0]?.count ?? 0;
    if (total > 0) {
      return { brand, model: modelCandidate };
    }
  }

  return null;
}
