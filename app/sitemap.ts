import type { MetadataRoute } from "next";
import { db } from "@lib/db";
import { SITE_ORIGIN } from "@lib/seo/constants";
import { normalizeSlug } from "@lib/seo/slug";
import { buildListingUrl } from "@lib/seo/listing-url";
import { dedupeSitemapEntries } from "@lib/seo/sitemap-utils";
import { listings } from "@shared/schema";
import { desc, eq, sql } from "drizzle-orm";

/** Regenerate sitemap periodically so new listings appear before Google’s next full sitemap read. */
export const revalidate = 300;

/** Minimum active inventory before we list a brand+model SEO page in the sitemap. */
const MIN_MODEL_LISTINGS_FOR_SITEMAP = 3;

const brandKey = sql<string>`lower(trim(${listings.brand}))`;
const modelKey = sql<string>`lower(trim(${listings.model}))`;

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

  const brandRows = await db
    .select({
      brand: brandKey,
      lastUpdate: sql<Date>`max(${listings.updatedAt})`,
    })
    .from(listings)
    .where(eq(listings.isSold, false))
    .groupBy(brandKey);

  const modelRows = await db
    .select({
      brand: brandKey,
      model: modelKey,
      lastUpdate: sql<Date>`max(${listings.updatedAt})`,
      total: sql<number>`count(*)::int`,
    })
    .from(listings)
    .where(eq(listings.isSold, false))
    .groupBy(brandKey, modelKey)
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
      url: `${SITE_ORIGIN}/auta/${normalizeSlug(String(b.brand))}`,
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
      const path = entry.url.replace(SITE_ORIGIN, "");
      return path.split("/").every((seg, i) => i === 0 || seg.length > 0);
    });

  return dedupeSitemapEntries([
    ...staticPages,
    ...brandPages,
    ...modelPages,
    ...listingPages,
  ]);
}
