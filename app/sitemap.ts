import type { MetadataRoute } from "next";
import { db } from "@lib/db";
import { SITE_ORIGIN } from "@lib/seo/constants";
import { listings } from "@shared/schema";
import { desc, eq, sql } from "drizzle-orm";

/** Regenerate sitemap periodically so new listings appear before Google’s next full sitemap read. */
export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const allListings = await db
    .select({
      id: listings.id,
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
    url: `${SITE_ORIGIN}/listing/${l.id}`,
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

  return [...staticPages, ...brandPages, ...listingPages];
}
