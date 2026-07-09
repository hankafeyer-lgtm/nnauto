import type { MetadataRoute } from "next";
import { db } from "@lib/db";
import { SITE_ORIGIN } from "@lib/seo/constants";
import { normalizeSlug } from "@lib/seo/slug";
import { buildListingUrl } from "@lib/seo/listing-url";
import { dedupeSitemapEntries } from "@lib/seo/sitemap-utils";
import { queryIndexableFacetUrls } from "@lib/seo/facet-queries";
import { listings } from "@shared/schema";
import { desc, eq, sql } from "drizzle-orm";

/**
 * Generate the sitemap at request time instead of at build time.
 *
 * The sitemap runs several DB aggregations plus queryIndexableFacetUrls(), which
 * can exceed Next.js' 60s static-generation budget and abort `next build`. A
 * failed build leaves `.next` incomplete, so the deploy stops before restarting
 * the server and stale chunk hashes break client-only pages (e.g. /add-listing).
 * Rendering dynamically keeps deploys reliable.
 */
export const dynamic = "force-dynamic";

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
      photos: listings.photos,
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
      url: `${SITE_ORIGIN}/auta`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${SITE_ORIGIN}/listings`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${SITE_ORIGIN}/prodat-auto`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
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

  const listingPages: MetadataRoute.Sitemap = allListings.map((l) => {
    const images =
      Array.isArray((l as { photos?: string[] }).photos) &&
      (l as { photos?: string[] }).photos?.length
        ? (l as { photos: string[] }).photos
            .slice(0, 5)
            .map(
              (p) =>
                `${SITE_ORIGIN}/img/${String(p).replace(/^\/+/, "")}?w=1200&q=80&f=webp`,
            )
        : undefined;
    return {
      url: `${SITE_ORIGIN}${buildListingUrl({
        id: l.id,
        brand: l.brand,
        model: l.model,
        year: l.year,
      })}`,
      lastModified: l.updatedAt || l.createdAt || new Date(),
      changeFrequency: "daily" as const,
      priority: 0.8,
      ...(images?.length ? { images } : {}),
    };
  });

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

  const facetPages: MetadataRoute.Sitemap = (
    await queryIndexableFacetUrls(MIN_MODEL_LISTINGS_FOR_SITEMAP)
  ).map((entry) => ({
    url: entry.url,
    lastModified: entry.lastModified,
    changeFrequency: "daily" as const,
    priority: 0.65,
  }));

  return dedupeSitemapEntries([
    ...staticPages,
    ...facetPages,
    ...brandPages,
    ...modelPages,
    ...listingPages,
  ]);
}
