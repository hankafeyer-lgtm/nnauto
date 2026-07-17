import type { MetadataRoute } from "next";
import { db } from "@lib/db";
import { SITE_ORIGIN } from "@lib/seo/constants";
import { normalizeSlug } from "@lib/seo/slug";
import { isTopModel } from "@lib/seo/top-models";
import { buildListingUrl } from "@lib/seo/listing-url";
import { dedupeSitemapEntries } from "@lib/seo/sitemap-utils";
import { queryIndexableFacetUrls } from "@lib/seo/facet-queries";
import { AUTA_GUIDE_PAGES, COMPARISON_PAGES } from "@lib/seo/editorial-pages";
import { listGlobalFacets, type FacetDefinition } from "@lib/seo/facets";
import {
  facetPairPath,
  getFacetPairBySlugs,
  isModelFacet,
  modelFacetPath,
} from "@lib/seo/seo-combinations";
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

type SitemapListing = {
  id: string;
  brand: string | null;
  model: string | null;
  year: number | null;
  price: unknown;
  mileage: number | null;
  fuelType: string[] | null;
  transmission: string[] | null;
  bodyType: string | null;
  driveType: string[] | null;
  region: string | null;
  photos: string[] | null;
  updatedAt: Date | null;
  createdAt: Date | null;
};

function facetValues(facet: FacetDefinition): string[] {
  return Array.isArray(facet.value)
    ? facet.value.map(String)
    : [String(facet.value)];
}

function normalizeValue(value: unknown) {
  return normalizeSlug(String(value ?? ""));
}

function includesFacetValue(values: unknown, facet: FacetDefinition) {
  const expected = new Set(facetValues(facet).map(normalizeValue));
  const current = Array.isArray(values) ? values : [values];
  return current.some((value) => expected.has(normalizeValue(value)));
}

function numberValue(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function listingMatchesFacet(listing: SitemapListing, facet: FacetDefinition) {
  switch (facet.kind) {
    case "fuel":
      return includesFacetValue(listing.fuelType, facet);
    case "transmission":
      return includesFacetValue(listing.transmission, facet);
    case "body":
      return includesFacetValue(listing.bodyType, facet);
    case "drive":
      return facet.value === "4x4"
        ? includesFacetValue(listing.driveType, {
            ...facet,
            value: ["4x4", "awd"],
          })
        : includesFacetValue(listing.driveType, facet);
    case "priceMax":
      return numberValue(listing.price) > 0 && numberValue(listing.price) <= Number(facet.value);
    case "priceRange":
      return (
        facet.minValue != null &&
        facet.maxValue != null &&
        numberValue(listing.price) >= facet.minValue &&
        numberValue(listing.price) <= facet.maxValue
      );
    case "priceMin":
      return numberValue(listing.price) >= Number(facet.value);
    case "mileageMax":
      return Number(listing.mileage ?? 0) > 0 && Number(listing.mileage) <= Number(facet.value);
    case "region":
      return includesFacetValue(listing.region, facet);
    case "year":
      return Number(listing.year) === Number(facet.value);
    default:
      return false;
  }
}

function buildInventoryCombinationPages(allListings: SitemapListing[]): MetadataRoute.Sitemap {
  const globalFacets = listGlobalFacets();
  const canonicalPairMap = new Map<string, readonly [FacetDefinition, FacetDefinition]>();

  for (const first of globalFacets) {
    for (const second of globalFacets) {
      const pair = getFacetPairBySlugs(first.slug, second.slug);
      if (!pair) continue;
      canonicalPairMap.set(facetPairPath(pair), pair);
    }
  }

  const counts = new Map<string, { count: number; lastModified: Date; url: string; priority: number }>();

  function bump(url: string, listing: SitemapListing, priority: number) {
    const lastModified = listing.updatedAt || listing.createdAt || new Date();
    const existing = counts.get(url);
    if (!existing) {
      counts.set(url, { count: 1, lastModified, url, priority });
      return;
    }
    existing.count += 1;
    if (lastModified > existing.lastModified) existing.lastModified = lastModified;
  }

  for (const listing of allListings) {
    const brandSlug = normalizeSlug(listing.brand);
    const modelSlug = normalizeSlug(listing.model);
    if (!brandSlug) continue;

    const matchingFacets = globalFacets.filter((facet) => listingMatchesFacet(listing, facet));

    for (const facet of matchingFacets) {
      if (facet.brandLevel) {
        bump(`${SITE_ORIGIN}/auta/${brandSlug}/${facet.slug}`, listing, 0.62);
      }
      if (modelSlug && isModelFacet(facet)) {
        bump(`${SITE_ORIGIN}${modelFacetPath(brandSlug, modelSlug, facet)}`, listing, 0.6);
      }
    }

    for (const [path, pair] of canonicalPairMap) {
      if (
        matchingFacets.some((facet) => facet.slug === pair[0].slug) &&
        matchingFacets.some((facet) => facet.slug === pair[1].slug)
      ) {
        bump(`${SITE_ORIGIN}${path}`, listing, 0.58);
      }
    }
  }

  return [...counts.values()]
    .filter((entry) => entry.count >= MIN_MODEL_LISTINGS_FOR_SITEMAP)
    .map((entry) => ({
      url: entry.url,
      lastModified: entry.lastModified,
      changeFrequency: "daily" as const,
      priority: entry.priority,
    }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const allListings = await db
    .select({
      id: listings.id,
      brand: listings.brand,
      model: listings.model,
      year: listings.year,
      price: listings.price,
      mileage: listings.mileage,
      fuelType: listings.fuelType,
      transmission: listings.transmission,
      bodyType: listings.bodyType,
      driveType: listings.driveType,
      region: listings.region,
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
                `${SITE_ORIGIN}/img/${String(p).replace(/^\/+/, "")}?w=1200&amp;q=80&amp;f=webp`,
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
      const priority = isTopModel(brandSlug, modelSlug) ? 0.86 : 0.7;
      return {
        url: `${SITE_ORIGIN}/auta/${brandSlug}/${modelSlug}`,
        lastModified: row.lastUpdate ? new Date(row.lastUpdate) : new Date(),
        changeFrequency: "daily" as const,
        priority,
      };
    })
    .filter((entry) => {
      const path = entry.url.replace(SITE_ORIGIN, "");
      return path.split("/").every((seg, i) => i === 0 || seg.length > 0);
    });

  const sellerModelPages: MetadataRoute.Sitemap = modelRows
    .filter((row) => !!row.brand && !!row.model)
    .map((row) => {
      const brandSlug = normalizeSlug(String(row.brand));
      const modelSlug = normalizeSlug(String(row.model));
      return {
        url: `${SITE_ORIGIN}/prodat-auto/${brandSlug}-${modelSlug}`,
        lastModified: row.lastUpdate ? new Date(row.lastUpdate) : new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.6,
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

  const inventoryCombinationPages = buildInventoryCombinationPages(allListings);

  const guidePages: MetadataRoute.Sitemap = AUTA_GUIDE_PAGES.map((page) => ({
    url: `${SITE_ORIGIN}/auta/${page.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.64,
  }));

  const comparisonPages: MetadataRoute.Sitemap = COMPARISON_PAGES.map((page) => ({
    url: `${SITE_ORIGIN}/porovnani/${page.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.55,
  }));

  return dedupeSitemapEntries([
    ...staticPages,
    ...guidePages,
    ...comparisonPages,
    ...facetPages,
    ...inventoryCombinationPages,
    ...brandPages,
    ...modelPages,
    ...sellerModelPages,
    ...listingPages,
  ]);
}
