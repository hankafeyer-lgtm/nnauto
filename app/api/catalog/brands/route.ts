import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { db } from "@lib/db";
import { brands } from "@shared/schema";
import { asc } from "drizzle-orm";

export async function GET(_req: NextRequest) {
  try {
    const rows = await db
      .select({ id: brands.id, slug: brands.slug, name: brands.name })
      .from(brands)
      .orderBy(asc(brands.name));
    return json({ brands: rows });
  } catch (e: any) {
    return error("Failed to load brands catalog", 500);
  }
}
