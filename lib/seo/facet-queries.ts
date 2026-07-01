import { db } from "@lib/db";
import { listings } from "@shared/schema";
import { and, desc, eq, sql, type SQL } from "drizzle-orm";
import type { FacetDefinition } from "./facets";
import { slugVariants } from "./slug";

export type CollectionStats = {
  total: number;
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
};

export type FacetListingRow = typeof listings.$inferSelect;

function facetWhere(facet: FacetDefinition, brandSlug?: string): SQL | undefined {
  const parts: SQL[] = [eq(listings.isSold, false)];

  if (brandSlug) {
    parts.push(sql`lower(${listings.brand}) = ${brandSlug.toLowerCase()}`);
  }

  switch (facet.kind) {
    case "fuel":
      parts.push(
        sql`exists (
          select 1 from unnest(${listings.fuelType}) as f
          where lower(f) = ${String(facet.value)}
        )`,
      );
      break;
    case "transmission":
      parts.push(
        sql`exists (
          select 1 from unnest(${listings.transmission}) as t
          where lower(t) = ${String(facet.value)}
        )`,
      );
      break;
    case "body":
      parts.push(sql`lower(${listings.bodyType}) = ${String(facet.value)}`);
      break;
    case "drive":
      if (facet.value === "4x4") {
        parts.push(
          sql`exists (
            select 1 from unnest(${listings.driveType}) as d
            where lower(d) in ('awd', '4x4')
          )`,
        );
      } else {
        parts.push(
          sql`exists (
            select 1 from unnest(${listings.driveType}) as d
            where lower(d) = ${String(facet.value)}
          )`,
        );
      }
      break;
    case "priceMax":
      parts.push(sql`${listings.price}::numeric <= ${Number(facet.value)}`);
      break;
    case "year":
      parts.push(eq(listings.year, Number(facet.value)));
      break;
    default:
      return undefined;
  }

  return and(...parts);
}

export async function queryFacetListings(
  facet: FacetDefinition,
  brandSlug?: string,
  limit = 30,
): Promise<FacetListingRow[]> {
  const where = facetWhere(facet, brandSlug);
  if (!where) return [];
  try {
    return await db
      .select()
      .from(listings)
      .where(where)
      .orderBy(desc(listings.updatedAt))
      .limit(limit);
  } catch (err) {
    console.error("[facet] queryFacetListings failed:", err);
    return [];
  }
}

export async function countFacetListings(
  facet: FacetDefinition,
  brandSlug?: string,
): Promise<number> {
  const where = facetWhere(facet, brandSlug);
  if (!where) return 0;
  try {
    const [row] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(listings)
      .where(where);
    return row?.count ?? 0;
  } catch {
    return 0;
  }
}

export async function queryFacetStats(
  facet: FacetDefinition,
  brandSlug?: string,
): Promise<CollectionStats> {
  const where = facetWhere(facet, brandSlug);
  if (!where) return { total: 0, minPrice: 0, maxPrice: 0, avgPrice: 0 };
  try {
    const [row] = await db
      .select({
        total: sql<number>`count(*)::int`,
        minPrice: sql<number>`coalesce(min(${listings.price}::numeric), 0)::int`,
        maxPrice: sql<number>`coalesce(max(${listings.price}::numeric), 0)::int`,
        avgPrice: sql<number>`coalesce(avg(${listings.price}::numeric), 0)::int`,
      })
      .from(listings)
      .where(where);
    return {
      total: row?.total ?? 0,
      minPrice: row?.minPrice ?? 0,
      maxPrice: row?.maxPrice ?? 0,
      avgPrice: row?.avgPrice ?? 0,
    };
  } catch {
    return { total: 0, minPrice: 0, maxPrice: 0, avgPrice: 0 };
  }
}

export async function countModelListingsWithVariants(
  brandSlug: string,
  modelSlug: string,
): Promise<number> {
  const variants = slugVariants(modelSlug);
  if (!variants.length) return 0;
  try {
    const [row] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(listings)
      .where(
        and(
          eq(listings.isSold, false),
          sql`lower(${listings.brand}) = ${brandSlug.toLowerCase()}`,
          sql`lower(${listings.model}) in (${sql.join(
            variants.map((v) => sql`${v}`),
            sql`, `,
          )})`,
        ),
      );
    return row?.count ?? 0;
  } catch {
    return 0;
  }
}

export async function queryBrandCollectionStats(
  brandSlug: string,
): Promise<CollectionStats> {
  try {
    const [row] = await db
      .select({
        total: sql<number>`count(*)::int`,
        minPrice: sql<number>`coalesce(min(${listings.price}::numeric), 0)::int`,
        maxPrice: sql<number>`coalesce(max(${listings.price}::numeric), 0)::int`,
        avgPrice: sql<number>`coalesce(avg(${listings.price}::numeric), 0)::int`,
      })
      .from(listings)
      .where(
        and(
          eq(listings.isSold, false),
          sql`lower(${listings.brand}) = ${brandSlug.toLowerCase()}`,
        ),
      );
    return {
      total: row?.total ?? 0,
      minPrice: row?.minPrice ?? 0,
      maxPrice: row?.maxPrice ?? 0,
      avgPrice: row?.avgPrice ?? 0,
    };
  } catch {
    return { total: 0, minPrice: 0, maxPrice: 0, avgPrice: 0 };
  }
}

export async function queryModelCollectionStats(
  brandSlug: string,
  modelSlug: string,
): Promise<CollectionStats> {
  const variants = slugVariants(modelSlug);
  if (!variants.length) {
    return { total: 0, minPrice: 0, maxPrice: 0, avgPrice: 0 };
  }
  try {
    const [row] = await db
      .select({
        total: sql<number>`count(*)::int`,
        minPrice: sql<number>`coalesce(min(${listings.price}::numeric), 0)::int`,
        maxPrice: sql<number>`coalesce(max(${listings.price}::numeric), 0)::int`,
        avgPrice: sql<number>`coalesce(avg(${listings.price}::numeric), 0)::int`,
      })
      .from(listings)
      .where(
        and(
          eq(listings.isSold, false),
          sql`lower(${listings.brand}) = ${brandSlug.toLowerCase()}`,
          sql`lower(${listings.model}) in (${sql.join(
            variants.map((v) => sql`${v}`),
            sql`, `,
          )})`,
        ),
      );
    return {
      total: row?.total ?? 0,
      minPrice: row?.minPrice ?? 0,
      maxPrice: row?.maxPrice ?? 0,
      avgPrice: row?.avgPrice ?? 0,
    };
  } catch {
    return { total: 0, minPrice: 0, maxPrice: 0, avgPrice: 0 };
  }
}

/** Indexable global + brand facet URLs for sitemap (count >= min). */
export async function queryIndexableFacetUrls(
  min = 3,
): Promise<{ url: string; lastModified: Date }[]> {
  const { SITE_ORIGIN } = await import("./constants");
  const { listGlobalFacets, listBrandFacets, buildGlobalFacetPath, buildBrandFacetPath } =
    await import("./facets");
  const out: { url: string; lastModified: Date }[] = [];

  for (const facet of listGlobalFacets()) {
    const total = await countFacetListings(facet);
    if (total >= min) {
      out.push({
        url: `${SITE_ORIGIN}${buildGlobalFacetPath(facet.slug)}`,
        lastModified: new Date(),
      });
    }
  }

  const brandRows = await db
    .select({ brand: sql<string>`lower(trim(${listings.brand}))` })
    .from(listings)
    .where(eq(listings.isSold, false))
    .groupBy(sql`lower(trim(${listings.brand}))`);

  for (const { brand } of brandRows) {
    if (!brand) continue;
    for (const facet of listBrandFacets()) {
      const total = await countFacetListings(facet, brand);
      if (total >= min) {
        out.push({
          url: `${SITE_ORIGIN}${buildBrandFacetPath(brand, facet.slug)}`,
          lastModified: new Date(),
        });
      }
    }
  }

  return out;
}
