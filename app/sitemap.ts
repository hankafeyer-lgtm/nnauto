import type { MetadataRoute } from "next";
import { db } from "@lib/db";
import { listings } from "@shared/schema";
import { desc, eq } from "drizzle-orm";

const BASE_URL = "https://nnauto.cz";

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

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/listings`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/add-listing`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/pricing`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/tips`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const listingPages: MetadataRoute.Sitemap = allListings.map((l) => ({
    url: `${BASE_URL}/listing/${l.id}`,
    lastModified: l.updatedAt || l.createdAt || new Date(),
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...listingPages];
}
