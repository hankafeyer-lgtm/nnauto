import { cache } from "react";
import { db } from "@lib/db";
import { listings } from "@shared/schema";
import { eq } from "drizzle-orm";

export const getListingById = cache(async (id: string) => {
  const [listing] = await db.select().from(listings).where(eq(listings.id, id));
  return listing ?? null;
});
