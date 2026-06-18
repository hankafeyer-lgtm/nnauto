import { cache } from "react";
import { db } from "@lib/db";
import { dealers, listings } from "@shared/schema";
import { and, desc, eq, ne, or, sql } from "drizzle-orm";

export const getListingById = cache(async (id: string) => {
  const [listing] = await db.select().from(listings).where(eq(listings.id, id));
  return listing ?? null;
});

/**
 * Lookup by the first 8 hex chars of UUID (short ID from SEO slug).
 * Falls back to full UUID match if the input looks like a full UUID.
 */
export const getListingBySlugId = cache(async (slugOrId: string) => {
  // Full UUID — direct lookup
  if (/^[a-f0-9]{8}-[a-f0-9]{4}-/.test(slugOrId)) {
    return getListingById(slugOrId);
  }
  // Extract trailing 8 hex chars from the SEO slug segment
  const shortMatch = slugOrId.match(/([a-f0-9]{8})$/);
  if (!shortMatch) return null;
  const shortId = shortMatch[1];
  const [listing] = await db
    .select()
    .from(listings)
    .where(sql`replace(${listings.id}::text, '-', '') LIKE ${shortId + '%'}`)
    .limit(1);
  return listing ?? null;
});

type ListingRecord = typeof listings.$inferSelect;

export type SimilarListing = Pick<
  ListingRecord,
  "id" | "title" | "price" | "brand" | "model" | "year" | "photos"
>;

export type DealerProfileForListing = Pick<
  typeof dealers.$inferSelect,
  | "id"
  | "ownerId"
  | "companyName"
  | "description"
  | "logoUrl"
  | "website"
  | "phone"
  | "email"
  | "address"
  | "region"
  | "isVerified"
  | "createdAt"
>;

export type DealerInventoryListing = Pick<
  ListingRecord,
  | "id"
  | "title"
  | "price"
  | "brand"
  | "model"
  | "year"
  | "mileage"
  | "fuelType"
  | "transmission"
  | "photos"
  | "isTopListing"
>;

export const getDealerProfileForListing = cache(async (listing: ListingRecord) => {
  // Enrichment only — a DB hiccup here must not crash the whole listing page.
  try {
    const [dealer] = await db
      .select({
        id: dealers.id,
        ownerId: dealers.ownerId,
        companyName: dealers.companyName,
        description: dealers.description,
        logoUrl: dealers.logoUrl,
        website: dealers.website,
        phone: dealers.phone,
        email: dealers.email,
        address: dealers.address,
        region: dealers.region,
        isVerified: dealers.isVerified,
        createdAt: dealers.createdAt,
      })
      .from(dealers)
      .where(eq(dealers.ownerId, listing.userId))
      .limit(1);
    return dealer ?? null;
  } catch (err) {
    console.error("[listing] getDealerProfileForListing failed:", err);
    return null;
  }
});

export const getDealerInventoryForListing = cache(
  async (listing: ListingRecord, take = 8): Promise<DealerInventoryListing[]> => {
    try {
      const rows = await db
        .select({
          id: listings.id,
          title: listings.title,
          price: listings.price,
          brand: listings.brand,
          model: listings.model,
          year: listings.year,
          mileage: listings.mileage,
          fuelType: listings.fuelType,
          transmission: listings.transmission,
          photos: listings.photos,
          isTopListing: listings.isTopListing,
        })
        .from(listings)
        .where(
          and(
            ne(listings.id, listing.id),
            eq(listings.userId, listing.userId),
            eq(listings.isSold, false),
          ),
        )
        .orderBy(desc(listings.isTopListing), desc(listings.updatedAt), desc(listings.createdAt))
        .limit(take);
      return rows;
    } catch (err) {
      console.error("[listing] getDealerInventoryForListing failed:", err);
      return [];
    }
  },
);

export const getSimilarListings = cache(
  async (listing: ListingRecord, take = 6): Promise<SimilarListing[]> => {
    if (!listing) return [];

    try {
    const primary = await db
      .select({
        id: listings.id,
        title: listings.title,
        price: listings.price,
        brand: listings.brand,
        model: listings.model,
        year: listings.year,
        photos: listings.photos,
      })
      .from(listings)
      .where(
        and(
          ne(listings.id, listing.id),
          eq(listings.isSold, false),
          or(eq(listings.brand, listing.brand), eq(listings.model, listing.model)),
        ),
      )
      .orderBy(desc(listings.updatedAt), desc(listings.createdAt))
      .limit(take);

    if (primary.length >= take) return primary;

    const fallback = await db
      .select({
        id: listings.id,
        title: listings.title,
        price: listings.price,
        brand: listings.brand,
        model: listings.model,
        year: listings.year,
        photos: listings.photos,
      })
      .from(listings)
      .where(and(ne(listings.id, listing.id), eq(listings.isSold, false)))
      .orderBy(desc(listings.updatedAt), desc(listings.createdAt))
      .limit(take * 3);

    const merged: SimilarListing[] = [];
    const seen = new Set<string>();
    for (const item of [...primary, ...fallback]) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      merged.push(item);
      if (merged.length >= take) break;
    }
    return merged;
    } catch (err) {
      console.error("[listing] getSimilarListings failed:", err);
      return [];
    }
  },
);
