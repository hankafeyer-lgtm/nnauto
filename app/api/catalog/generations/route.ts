import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { db } from "@lib/db";
import { brands, models, modelGenerations } from "@shared/schema";
import { and, asc, eq, ilike, or } from "drizzle-orm";

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
    const modelRaw = req.nextUrl.searchParams.get("model")?.trim() ?? "";
    if (!brandRaw || !modelRaw) return json({ generations: [] });

    const wantedBrandSlug = slugify(brandRaw);
    const [brand] = await db
      .select({ id: brands.id })
      .from(brands)
      .where(
        or(
          eq(brands.slug, wantedBrandSlug),
          eq(brands.id, brandRaw),
          ilike(brands.name, brandRaw),
        )!,
      )
      .limit(1);

    if (!brand) return json({ generations: [] });

    const wantedModelSlug = slugify(modelRaw);
    const [model] = await db
      .select({ id: models.id })
      .from(models)
      .where(
        and(
          eq(models.brandId, brand.id),
          or(
            eq(models.slug, wantedModelSlug),
            eq(models.id, modelRaw),
            ilike(models.name, modelRaw),
          )!,
        ),
      )
      .limit(1);

    if (!model) return json({ generations: [] });

    const rows = await db
      .select({
        id: modelGenerations.id,
        slug: modelGenerations.slug,
        name: modelGenerations.name,
      })
      .from(modelGenerations)
      .where(eq(modelGenerations.modelId, model.id))
      .orderBy(asc(modelGenerations.name));

    return json({ generations: rows });
  } catch (e: any) {
    return error("Failed to load generations catalog", 500);
  }
}
