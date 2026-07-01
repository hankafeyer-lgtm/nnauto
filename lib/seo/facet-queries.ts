import { db } from "@lib/db";
import { listings } from "@shared/schema";
import { and, desc, eq, sql, type SQL } from "drizzle-orm";
import {
  buildBrandFacetPath,
  buildGlobalFacetPath,
  listBrandFacets,
  listGlobalFacets,
  type FacetDefinition,
} from "./facets";
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
  const now = new Date();
  const globalFacets = listGlobalFacets();
  const brandFacets = listBrandFacets();
  const fuelSlugs = globalFacets
    .filter((facet) => facet.kind === "fuel")
    .map((facet) => String(facet.value));
  const transmissionSlugs = globalFacets
    .filter((facet) => facet.kind === "transmission")
    .map((facet) => String(facet.value));
  const bodySlugs = globalFacets
    .filter((facet) => facet.kind === "body")
    .map((facet) => String(facet.value));
  const yearValues = globalFacets
    .filter((facet) => facet.kind === "year")
    .map((facet) => Number(facet.value));

  try {
    const result = (await db.execute(sql`
      WITH active AS (
        SELECT
          ${listings.id} AS id,
          lower(trim(${listings.brand})) AS brand,
          ${listings.fuelType} AS fuel_type,
          ${listings.transmission} AS transmission,
          lower(${listings.bodyType}) AS body_type,
          ${listings.driveType} AS drive_type,
          ${listings.price}::numeric AS price,
          ${listings.year} AS year
        FROM ${listings}
        WHERE ${listings.isSold} = false
      ),
      facet_hits AS (
        SELECT NULL::text AS brand, lower(f) AS slug, id
        FROM active, unnest(fuel_type) AS f
        WHERE lower(f) IN (${sql.join(fuelSlugs.map((slug) => sql`${slug}`), sql`, `)})

        UNION ALL

        SELECT brand, lower(f) AS slug, id
        FROM active, unnest(fuel_type) AS f
        WHERE brand <> ''
          AND lower(f) IN (${sql.join(
            brandFacets
              .filter((facet) => facet.kind === "fuel")
              .map((facet) => sql`${String(facet.value)}`),
            sql`, `,
          )})

        UNION ALL

        SELECT NULL::text AS brand, lower(t) AS slug, id
        FROM active, unnest(transmission) AS t
        WHERE lower(t) IN (${sql.join(transmissionSlugs.map((slug) => sql`${slug}`), sql`, `)})

        UNION ALL

        SELECT brand, lower(t) AS slug, id
        FROM active, unnest(transmission) AS t
        WHERE brand <> ''
          AND lower(t) IN (${sql.join(
            brandFacets
              .filter((facet) => facet.kind === "transmission")
              .map((facet) => sql`${String(facet.value)}`),
            sql`, `,
          )})

        UNION ALL

        SELECT NULL::text AS brand, body_type AS slug, id
        FROM active
        WHERE body_type IN (${sql.join(bodySlugs.map((slug) => sql`${slug}`), sql`, `)})

        UNION ALL

        SELECT brand, body_type AS slug, id
        FROM active
        WHERE brand <> ''
          AND body_type IN (${sql.join(
            brandFacets
              .filter((facet) => facet.kind === "body")
              .map((facet) => sql`${String(facet.value)}`),
            sql`, `,
          )})

        UNION ALL

        SELECT NULL::text AS brand, '4x4' AS slug, id
        FROM active
        WHERE EXISTS (
          SELECT 1 FROM unnest(drive_type) AS d
          WHERE lower(d) IN ('awd', '4x4')
        )

        UNION ALL

        SELECT brand, '4x4' AS slug, id
        FROM active
        WHERE brand <> ''
          AND EXISTS (
            SELECT 1 FROM unnest(drive_type) AS d
            WHERE lower(d) IN ('awd', '4x4')
          )

        UNION ALL

        SELECT NULL::text AS brand, 'do-200000' AS slug, id
        FROM active
        WHERE price <= 200000

        UNION ALL

        SELECT brand, 'do-200000' AS slug, id
        FROM active
        WHERE brand <> '' AND price <= 200000

        UNION ALL

        SELECT NULL::text AS brand, 'do-300000' AS slug, id
        FROM active
        WHERE price <= 300000

        UNION ALL

        SELECT brand, 'do-300000' AS slug, id
        FROM active
        WHERE brand <> '' AND price <= 300000

        UNION ALL

        SELECT NULL::text AS brand, 'do-500000' AS slug, id
        FROM active
        WHERE price <= 500000

        UNION ALL

        SELECT brand, 'do-500000' AS slug, id
        FROM active
        WHERE brand <> '' AND price <= 500000

        UNION ALL

        SELECT NULL::text AS brand, year::text AS slug, id
        FROM active
        WHERE year IN (${sql.join(yearValues.map((year) => sql`${year}`), sql`, `)})

        UNION ALL

        SELECT brand, year::text AS slug, id
        FROM active
        WHERE brand <> ''
          AND year IN (${sql.join(
            brandFacets
              .filter((facet) => facet.kind === "year")
              .map((facet) => sql`${Number(facet.value)}`),
            sql`, `,
          )})
      )
      SELECT brand, slug, count(DISTINCT id)::int AS total
      FROM facet_hits
      GROUP BY brand, slug
      HAVING count(DISTINCT id) >= ${min}
      ORDER BY brand NULLS FIRST, slug
    `)) as { rows?: { brand: string | null; slug: string; total: number }[] };

    return (result.rows ?? []).flatMap((row) => {
      if (!row.brand) {
        if (!globalFacets.some((facet) => facet.slug === row.slug)) return [];
        return [
          {
            url: `${SITE_ORIGIN}${buildGlobalFacetPath(row.slug)}`,
            lastModified: now,
          },
        ];
      }

      if (!brandFacets.some((facet) => facet.slug === row.slug)) return [];
      return [
        {
          url: `${SITE_ORIGIN}${buildBrandFacetPath(row.brand, row.slug)}`,
          lastModified: now,
        },
      ];
    });
  } catch (err) {
    console.error("[facet] queryIndexableFacetUrls failed:", err);
    return [];
  }
}
