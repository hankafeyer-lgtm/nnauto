import type { Metadata } from "next";
import JsonLd from "@lib/seo/JsonLd";
import { buildHomePageJsonLdGraph } from "@lib/seo/structured-data";
import { buildHomePageMetadata } from "@lib/seo/home-metadata";
import { db } from "@lib/db";
import { listings } from "@shared/schema";
import { eq, sql, desc } from "drizzle-orm";
import { sortByTopPriority, getTopModelLinks } from "@lib/seo/top-models";
import HomeClient from "./home-client";
import { HomeSeoBlocks } from "@lib/seo/components/home/HomeSeoBlocks";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const params = await searchParams;
  return buildHomePageMetadata(params);
}

export const revalidate = 900;

async function getTopModels(limit = 30) {
  try {
    return await db
      .select({
        brand: listings.brand,
        model: listings.model,
        total: sql<number>`count(*)::int`,
      })
      .from(listings)
      .where(eq(listings.isSold, false))
      .groupBy(listings.brand, listings.model)
      .having(sql`count(*) >= 1`)
      .orderBy(desc(sql`count(*)`))
      .limit(limit);
  } catch (err) {
    console.error("[home] getTopModels failed:", err);
    return [];
  }
}

async function getRecentListings(limit = 6) {
  try {
    return await db
      .select({
        id: listings.id,
        brand: listings.brand,
        model: listings.model,
        year: listings.year,
        price: listings.price,
        createdAt: listings.createdAt,
      })
      .from(listings)
      .where(eq(listings.isSold, false))
      .orderBy(desc(listings.createdAt))
      .limit(limit);
  } catch (err) {
    console.error("[home] getRecentListings failed:", err);
    return [];
  }
}

export default async function Home() {
  const [rawModels, recentListings] = await Promise.all([
    getTopModels(40),
    getRecentListings(6),
  ]);
  const topModels = sortByTopPriority(rawModels).slice(0, 30);
  const topLinks = getTopModelLinks();
  return (
    <>
      <JsonLd data={buildHomePageJsonLdGraph()} />
      <h1 className="sr-only">Prodej a nákup ojetých aut v ČR</h1>
      <HomeClient />
      <HomeSeoBlocks
        topModels={topModels}
        recentListings={recentListings}
        topLinks={topLinks}
      />
    </>
  );
}
