import { NextRequest } from "next/server";
import { json } from "@lib/api-helpers";
import { db } from "@lib/db";
import { brands, models } from "@shared/schema";
import { asc, eq, ilike, or } from "drizzle-orm";
import { carModels } from "@shared/carDatabase";

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

type ModelRow = { id: string; slug: string; name: string };

/**
 * Models for a brand. Returns the union of the DB catalog and the bundled
 * static list (`carModels`) so the dropdown always shows every known model,
 * never goes empty, and keeps working even if the database is briefly
 * unavailable (we fall back to the static list instead of failing).
 */
export async function GET(req: NextRequest) {
  const brandRaw = req.nextUrl.searchParams.get("brand")?.trim() ?? "";
  if (!brandRaw) return json({ models: [] });

  const wantedSlug = slugify(brandRaw);

  // Static models bundled with the app (keyed by brand slug).
  const staticNames = Array.isArray(carModels[wantedSlug])
    ? carModels[wantedSlug]
    : [];

  // DB models (best-effort — never let a DB hiccup empty the dropdown).
  let dbRows: ModelRow[] = [];
  try {
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

    if (brand) {
      dbRows = await db
        .select({ id: models.id, slug: models.slug, name: models.name })
        .from(models)
        .where(eq(models.brandId, brand.id))
        .orderBy(asc(models.name));
    }
  } catch {
    // Ignore and fall back to the static list below.
  }

  // Merge DB + static, de-duplicating by normalised name.
  const seen = new Set<string>();
  const merged: ModelRow[] = [];
  const pushUnique = (row: ModelRow) => {
    const key = row.name.trim().toLowerCase();
    if (!key || seen.has(key)) return;
    seen.add(key);
    merged.push(row);
  };

  for (const row of dbRows) pushUnique(row);
  for (const name of staticNames) {
    pushUnique({ id: `static:${slugify(name)}`, slug: slugify(name), name });
  }

  // Alphabetical, with the generic "Ostatní" / "Other" option kept last.
  const isOther = (n: string) => /^(ostatn[íi]|other)$/i.test(n.trim());
  merged.sort((a, b) => {
    const ao = isOther(a.name);
    const bo = isOther(b.name);
    if (ao !== bo) return ao ? 1 : -1;
    return a.name.localeCompare(b.name, "cs");
  });

  return json({ models: merged });
}
