import { db } from "@lib/db";
import {
  brands,
  models,
  listings as listingsTable,
} from "@shared/schema";
import { eq, and, ilike, sql, or } from "drizzle-orm";

function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export async function resolveBrandBySlug(
  slug: string,
): Promise<{ id: string; name: string; slug: string } | null> {
  const wanted = slugify(slug);
  const [brand] = await db
    .select({ id: brands.id, name: brands.name, slug: brands.slug })
    .from(brands)
    .where(or(eq(brands.slug, wanted), ilike(brands.name, slug))!)
    .limit(1);
  return brand ?? null;
}

export async function resolveModelBySlug(
  brandId: string,
  slug: string,
): Promise<{ id: string; name: string; slug: string } | null> {
  const wanted = slugify(slug);
  const [model] = await db
    .select({ id: models.id, name: models.name, slug: models.slug })
    .from(models)
    .where(
      and(
        eq(models.brandId, brandId),
        or(eq(models.slug, wanted), ilike(models.name, slug))!,
      ),
    )
    .limit(1);
  return model ?? null;
}

export type ListingStats = {
  count: number;
  minPrice: number | null;
  maxPrice: number | null;
  minYear: number | null;
  maxYear: number | null;
};

export async function getBrandListingStats(
  brandName: string,
): Promise<ListingStats> {
  const result = (await db.execute(sql`
    SELECT
      COUNT(*)::int AS count,
      MIN(price::numeric)::int AS min_price,
      MAX(price::numeric)::int AS max_price,
      MIN(year) AS min_year,
      MAX(year) AS max_year
    FROM listings
    WHERE LOWER(brand) = LOWER(${brandName})
      AND is_sold = false
  `)) as any;
  const row = result?.rows?.[0];
  return {
    count: Number(row?.count ?? 0),
    minPrice: row?.min_price ? Number(row.min_price) : null,
    maxPrice: row?.max_price ? Number(row.max_price) : null,
    minYear: row?.min_year ? Number(row.min_year) : null,
    maxYear: row?.max_year ? Number(row.max_year) : null,
  };
}

export async function getBrandModelListingStats(
  brandName: string,
  modelName: string,
): Promise<ListingStats> {
  const result = (await db.execute(sql`
    SELECT
      COUNT(*)::int AS count,
      MIN(price::numeric)::int AS min_price,
      MAX(price::numeric)::int AS max_price,
      MIN(year) AS min_year,
      MAX(year) AS max_year
    FROM listings
    WHERE LOWER(brand) = LOWER(${brandName})
      AND LOWER(model) = LOWER(${modelName})
      AND is_sold = false
  `)) as any;
  const row = result?.rows?.[0];
  return {
    count: Number(row?.count ?? 0),
    minPrice: row?.min_price ? Number(row.min_price) : null,
    maxPrice: row?.max_price ? Number(row.max_price) : null,
    minYear: row?.min_year ? Number(row.min_year) : null,
    maxYear: row?.max_year ? Number(row.max_year) : null,
  };
}

export async function getModelsForBrand(
  brandId: string,
): Promise<{ slug: string; name: string }[]> {
  return db
    .select({ slug: models.slug, name: models.name })
    .from(models)
    .where(eq(models.brandId, brandId));
}

export async function getModelListingCounts(
  brandName: string,
): Promise<Record<string, number>> {
  const result = (await db.execute(sql`
    SELECT LOWER(model) AS model_lower, COUNT(*)::int AS cnt
    FROM listings
    WHERE LOWER(brand) = LOWER(${brandName})
      AND is_sold = false
    GROUP BY LOWER(model)
  `)) as any;
  const map: Record<string, number> = {};
  for (const row of result?.rows ?? []) {
    if (row?.model_lower) map[row.model_lower] = Number(row.cnt ?? 0);
  }
  return map;
}
