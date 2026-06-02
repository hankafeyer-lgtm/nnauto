import { db } from "@lib/db";
import { listings } from "@shared/schema";
import { desc, eq } from "drizzle-orm";

/** Active listings for RSS / crawl hints (same filter as sitemap). */
export async function getRecentActiveListings(limit: number) {
  return db
    .select({
      id: listings.id,
      title: listings.title,
      brand: listings.brand,
      model: listings.model,
      year: listings.year,
      updatedAt: listings.updatedAt,
      createdAt: listings.createdAt,
    })
    .from(listings)
    .where(eq(listings.isSold, false))
    .orderBy(desc(listings.updatedAt))
    .limit(limit);
}
