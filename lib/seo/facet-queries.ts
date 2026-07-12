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
import { normalizeSlug, slugVariants } from "./slug";

export type CollectionStats = {
  total: number;
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
};

export type FacetListingRow = typeof listings.$inferSelect;

function facetValues(facet: FacetDefinition): string[] {
  return Array.isArray(facet.value)
    ? facet.value.map(String)
    : [String(facet.value)];
}

function slugSql(valueSql: SQL): SQL {
  return sql`trim(both '-' from regexp_replace(lower(translate(${valueSql}::text, 'áčďéěíňóřšťúůýžÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ', 'acdeeinorstuuyzACDEEINORSTUUYZ')), '[^a-z0-9]+', '-', 'g'))`;
}

function slugIn(columnSql: SQL, values: string[]): SQL {
  return sql`${slugSql(columnSql)} in (${sql.join(
    values.map((value) => sql`${normalizeSlug(value)}`),
    sql`, `,
  )})`;
}

function facetCondition(facet: FacetDefinition): SQL | undefined {
  switch (facet.kind) {
    case "fuel":
      return sql`exists (
          select 1 from unnest(${listings.fuelType}) as f
          where ${slugSql(sql`f`)} in (${sql.join(
            facetValues(facet).map((value) => sql`${normalizeSlug(value)}`),
            sql`, `,
          )})
        )`;
    case "transmission":
      return sql`exists (
          select 1 from unnest(${listings.transmission}) as t
          where ${slugSql(sql`t`)} in (${sql.join(
            facetValues(facet).map((value) => sql`${normalizeSlug(value)}`),
            sql`, `,
          )})
        )`;
    case "body":
      return slugIn(sql`${listings.bodyType}`, facetValues(facet));
    case "drive":
      if (facet.value === "4x4") {
        return sql`exists (
            select 1 from unnest(${listings.driveType}) as d
            where ${slugSql(sql`d`)} in ('awd', '4x4')
          )`;
      }
      return sql`exists (
            select 1 from unnest(${listings.driveType}) as d
            where ${slugSql(sql`d`)} in (${sql.join(
              facetValues(facet).map((value) => sql`${normalizeSlug(value)}`),
              sql`, `,
            )})
          )`;
    case "priceMax":
      return sql`${listings.price}::numeric <= ${Number(facet.value)}`;
    case "priceRange":
      if (facet.minValue == null || facet.maxValue == null) return undefined;
      return sql`${listings.price}::numeric >= ${facet.minValue} AND ${listings.price}::numeric <= ${facet.maxValue}`;
    case "priceMin":
      return sql`${listings.price}::numeric >= ${Number(facet.value)}`;
    case "mileageMax":
      return sql`${listings.mileage} <= ${Number(facet.value)}`;
    case "region":
      return slugIn(sql`${listings.region}`, facetValues(facet));
    case "year":
      return eq(listings.year, Number(facet.value));
    default:
      return undefined;
  }
}

function facetWhere(facet: FacetDefinition, brandSlug?: string): SQL | undefined {
  const condition = facetCondition(facet);
  if (!condition) return undefined;

  const parts: SQL[] = [eq(listings.isSold, false), condition];

  if (brandSlug) {
    parts.push(sql`${slugSql(sql`${listings.brand}`)} = ${normalizeSlug(brandSlug)}`);
  }

  return and(...parts);
}

function combinedFacetWhere(
  facets: readonly FacetDefinition[],
  opts: { brandSlug?: string; modelSlug?: string } = {},
): SQL | undefined {
  const parts: SQL[] = [eq(listings.isSold, false)];

  if (opts.brandSlug) {
    parts.push(sql`${slugSql(sql`${listings.brand}`)} = ${normalizeSlug(opts.brandSlug)}`);
  }

  if (opts.modelSlug) {
    const variants = slugVariants(opts.modelSlug).map(normalizeSlug);
    if (!variants.length) return undefined;
    parts.push(sql`${slugSql(sql`${listings.model}`)} in (${sql.join(
      variants.map((variant) => sql`${variant}`),
      sql`, `,
    )})`);
  }

  for (const facet of facets) {
    const condition = facetCondition(facet);
    if (!condition) return undefined;
    parts.push(condition);
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

export async function queryCombinedFacetListings(
  facets: readonly FacetDefinition[],
  opts: { brandSlug?: string; modelSlug?: string } = {},
  limit = 30,
): Promise<FacetListingRow[]> {
  const where = combinedFacetWhere(facets, opts);
  if (!where) return [];
  try {
    return await db
      .select()
      .from(listings)
      .where(where)
      .orderBy(desc(listings.updatedAt))
      .limit(limit);
  } catch (err) {
    console.error("[facet] queryCombinedFacetListings failed:", err);
    return [];
  }
}

export async function queryCombinedFacetStats(
  facets: readonly FacetDefinition[],
  opts: { brandSlug?: string; modelSlug?: string } = {},
): Promise<CollectionStats> {
  const where = combinedFacetWhere(facets, opts);
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
  } catch (err) {
    console.error("[facet] queryCombinedFacetStats failed:", err);
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

    const fastPathRows = (result.rows ?? []).flatMap((row) => {
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

    const indexedFastGlobalSlugs = new Set(
      fastPathRows
        .map((entry) => entry.url.replace(`${SITE_ORIGIN}/auta/`, ""))
        .filter((slug) => !slug.includes("/")),
    );
    const fallbackGlobalRows = await Promise.all(
      globalFacets
        .filter((facet) => !indexedFastGlobalSlugs.has(facet.slug))
        .map(async (facet) => {
          const total = await countFacetListings(facet);
          if (total < min) return null;
          return {
            url: `${SITE_ORIGIN}${buildGlobalFacetPath(facet.slug)}`,
            lastModified: now,
          };
        }),
    );

    return [
      ...fastPathRows,
      ...fallbackGlobalRows.filter(
        (entry): entry is { url: string; lastModified: Date } => Boolean(entry),
      ),
    ];
  } catch (err) {
    console.error("[facet] queryIndexableFacetUrls failed:", err);
    return [];
  }
}
