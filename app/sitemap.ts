import type { MetadataRoute } from "next";
import { db } from "@lib/db";
import { listings, brands, models, articles } from "@shared/schema";
import { desc, eq } from "drizzle-orm";

const BASE_URL = "https://nnauto.cz";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [allListings, allBrands, allModels, allArticles] = await Promise.all([
    db
      .select({
        id: listings.id,
        updatedAt: listings.updatedAt,
        createdAt: listings.createdAt,
      })
      .from(listings)
      .where(eq(listings.isSold, false))
      .orderBy(desc(listings.updatedAt))
      .limit(300),
    db
      .select({ id: brands.id, slug: brands.slug, updatedAt: brands.updatedAt })
      .from(brands),
    db
      .select({
        slug: models.slug,
        brandId: models.brandId,
        updatedAt: models.updatedAt,
      })
      .from(models),
    db
      .select({ slug: articles.slug, updatedAt: articles.updatedAt })
      .from(articles)
      .where(eq(articles.isPublished, true))
      .orderBy(desc(articles.publishedAt)),
  ]);

  const brandIdToSlug = new Map(allBrands.map((b) => [b.id, b.slug]));

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/listings`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.9 },
    { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/add-listing`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/pricing`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/tips`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];

  const brandPages: MetadataRoute.Sitemap = allBrands.map((b) => ({
    url: `${BASE_URL}/brand/${b.slug}`,
    lastModified: b.updatedAt || new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const modelPages: MetadataRoute.Sitemap = allModels
    .filter((m) => brandIdToSlug.has(m.brandId))
    .map((m) => ({
      url: `${BASE_URL}/brand/${brandIdToSlug.get(m.brandId)}/${m.slug}`,
      lastModified: m.updatedAt || new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

  const blogPages: MetadataRoute.Sitemap = allArticles.map((a) => ({
    url: `${BASE_URL}/blog/${a.slug}`,
    lastModified: a.updatedAt || new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const listingPages: MetadataRoute.Sitemap = allListings.map((l) => ({
    url: `${BASE_URL}/listing/${l.id}`,
    lastModified: l.updatedAt || l.createdAt || new Date(),
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  return [
    ...staticPages,
    ...brandPages,
    ...modelPages,
    ...blogPages,
    ...listingPages,
  ];
}
