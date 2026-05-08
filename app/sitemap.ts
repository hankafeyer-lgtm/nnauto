import type { MetadataRoute } from "next";
import { db } from "@lib/db";
import { SITE_ORIGIN } from "@lib/seo/constants";
import { normalizeSlug } from "@lib/seo/slug";
import { buildListingUrl } from "@lib/seo/listing-url";
import { listings } from "@shared/schema";
import { desc, eq, sql } from "drizzle-orm";

/** Regenerate sitemap periodically so new listings appear before Google’s next full sitemap read. */
export const revalidate = 300;

/** Minimum active inventory before we list a brand+model SEO page in the sitemap. */
const MIN_MODEL_LISTINGS_FOR_SITEMAP = 3;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const allListings = await db
    .select({
      id: listings.id,
      brand: listings.brand,
      model: listings.model,
      year: listings.year,
      updatedAt: listings.updatedAt,
      createdAt: listings.createdAt,
    })
    .from(listings)
    .where(eq(listings.isSold, false))
    .orderBy(desc(listings.updatedAt));

  // Distinct brands that currently have at least one active listing. Each
  // gets its own SEO landing page at /auta/<brand>.
  const brandRows = await db
    .select({
      brand: listings.brand,
      lastUpdate: sql<Date>`max(${listings.updatedAt})`,
    })
    .from(listings)
    .where(eq(listings.isSold, false))
    .groupBy(listings.brand);

  // Brand+model pairs with enough active inventory to warrant a dedicated SEO
  // landing at /auta/<brand>/<model>. Pairs below the threshold are still
  // reachable but render `noindex` and stay out of the sitemap to avoid thin
  // pages getting indexed.
  const modelRows = await db
    .select({
      brand: listings.brand,
      model: listings.model,
      lastUpdate: sql<Date>`max(${listings.updatedAt})`,
      total: sql<number>`count(*)::int`,
    })
    .from(listings)
    .where(eq(listings.isSold, false))
    .groupBy(listings.brand, listings.model)
    .having(sql`count(*) >= ${MIN_MODEL_LISTINGS_FOR_SITEMAP}`);

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_ORIGIN,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${SITE_ORIGIN}/listings`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${SITE_ORIGIN}/add-listing`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_ORIGIN}/pricing`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_ORIGIN}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_ORIGIN}/tips`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_ORIGIN}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const listingPages: MetadataRoute.Sitemap = allListings.map((l) => ({
    url: `${SITE_ORIGIN}${buildListingUrl({
      id: l.id,
      brand: l.brand,
      model: l.model,
      year: l.year,
    })}`,
    lastModified: l.updatedAt || l.createdAt || new Date(),
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  const brandPages: MetadataRoute.Sitemap = brandRows
    .filter((b) => !!b.brand)
    .map((b) => ({
      url: `${SITE_ORIGIN}/auta/${encodeURIComponent(String(b.brand).toLowerCase())}`,
      lastModified: b.lastUpdate ? new Date(b.lastUpdate) : new Date(),
      changeFrequency: "daily" as const,
      priority: 0.75,
    }));

  const modelPages: MetadataRoute.Sitemap = modelRows
    .filter((row) => !!row.brand && !!row.model)
    .map((row) => {
      const brandSlug = normalizeSlug(String(row.brand));
      const modelSlug = normalizeSlug(String(row.model));
      return {
        url: `${SITE_ORIGIN}/auta/${brandSlug}/${modelSlug}`,
        lastModified: row.lastUpdate ? new Date(row.lastUpdate) : new Date(),
        changeFrequency: "daily" as const,
        priority: 0.7,
      };
    })
    .filter((entry) => {
      // Sanity: skip entries where slug normalization produced an empty path
      // segment so we never emit `/auta//something` style URLs.
      const path = entry.url.replace(SITE_ORIGIN, "");
      return path.split("/").every((seg, i) => i === 0 || seg.length > 0);
    });

  // /prodej/<brand>-<model> SEO landing pages for ALL brand+model pairs
  // with at least 1 active listing. No minimum threshold — every real
  // combination in the inventory gets its own indexed landing page.
  const allModelRows = await db
    .select({
      brand: listings.brand,
      model: listings.model,
      lastUpdate: sql<Date>`max(${listings.updatedAt})`,
    })
    .from(listings)
    .where(eq(listings.isSold, false))
    .groupBy(listings.brand, listings.model);

  const prodejPages: MetadataRoute.Sitemap = allModelRows
    .filter((row) => !!row.brand && !!row.model)
    .map((row) => {
      const brandSlug = normalizeSlug(String(row.brand));
      const modelSlug = normalizeSlug(String(row.model));
      return {
        url: `${SITE_ORIGIN}/prodej/${brandSlug}-${modelSlug}`,
        lastModified: row.lastUpdate ? new Date(row.lastUpdate) : new Date(),
        changeFrequency: "daily" as const,
        priority: 0.65,
      };
    })
    .filter((entry) => {
      const segments = entry.url.replace(SITE_ORIGIN, "").split("/").slice(1);
      return segments.every((s) => s.length > 0);
    });

  // Programmatic variant pages (fuel/transmission/body) for models with
  // enough inventory. Only include combos with ≥2 listings to avoid thin.
  const variantRows = await db
    .select({
      brand: listings.brand,
      model: listings.model,
      fuel: sql<string>`unnest(coalesce(${listings.fuelType}, ARRAY[]::text[]))`,
    })
    .from(listings)
    .where(eq(listings.isSold, false));

  const variantCounts = new Map<string, number>();
  for (const r of variantRows) {
    if (!r.brand || !r.model || !r.fuel) continue;
    const key = `${normalizeSlug(r.brand)}-${normalizeSlug(r.model)}-${r.fuel.toLowerCase()}`;
    variantCounts.set(key, (variantCounts.get(key) ?? 0) + 1);
  }

  const variantPages: MetadataRoute.Sitemap = [];
  for (const [slug, count] of variantCounts) {
    if (count < 2) continue;
    variantPages.push({
      url: `${SITE_ORIGIN}/prodej/${slug}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.55,
    });
  }

  return [...staticPages, ...brandPages, ...modelPages, ...prodejPages, ...variantPages, ...listingPages];
}
