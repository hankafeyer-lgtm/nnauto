import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { db } from "@lib/db";
import { brands, models } from "@shared/schema";
import { asc, eq, ilike, or } from "drizzle-orm";

function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export async function GET(req: NextRequest) {
  try {
    const brandRaw = req.nextUrl.searchParams.get("brand")?.trim() ?? "";
    if (!brandRaw) return json({ models: [] });

    const wantedSlug = slugify(brandRaw);
    const [brand] = await db
      .select({ id: brands.id })
      .from(brands)
      .where(
        or(
          eq(brands.slug, wantedSlug),
          eq(brands.id, brandRaw),
          ilike(brands.name, brandRaw),
        )!,
      )
      .limit(1);

    if (!brand) return json({ models: [] });

    const rows = await db
      .select({ id: models.id, slug: models.slug, name: models.name })
      .from(models)
      .where(eq(models.brandId, brand.id))
      .orderBy(asc(models.name));

    return json({ models: rows });
  } catch (e: any) {
    return error("Failed to load models catalog", 500);
  }
}
