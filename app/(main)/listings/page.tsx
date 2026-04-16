import type { Metadata } from "next";
import JsonLd from "@lib/seo/JsonLd";
import { getRecentActiveListings } from "@lib/seo/recent-listings";
import { buildListingIndexItemListJsonLd } from "@lib/seo/structured-data";
import ListingsClient from "./listings-client";

/** Refresh server JSON-LD ItemList so new listings appear in HTML between builds. */
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Inzeráty vozidel | NNAuto",
  description: "Prohlédněte si nabídku automobilů na NNAuto.",
  openGraph: {
    title: "Inzeráty vozidel | NNAuto",
    description: "Prohlédněte si nabídku automobilů na NNAuto.",
    url: "https://nnauto.cz/listings",
    siteName: "NNAuto",
    images: [{ url: "https://nnauto.cz/og-image.png", width: 1200, height: 630 }],
    locale: "cs_CZ",
    type: "website",
  },
  alternates: { canonical: "https://nnauto.cz/listings" },
};

const LISTING_INDEX_JSONLD_COUNT = 80;

export default async function Listings() {
  const recent = await getRecentActiveListings(LISTING_INDEX_JSONLD_COUNT);
  const itemListJsonLd = buildListingIndexItemListJsonLd(recent);

  return (
    <>
      <JsonLd data={itemListJsonLd} />
      <ListingsClient />
    </>
  );
}
