import type { Metadata } from "next";
import JsonLd from "@lib/seo/JsonLd";
import { getRecentActiveListings } from "@lib/seo/recent-listings";
import { buildListingIndexItemListJsonLd } from "@lib/seo/structured-data";
import ListingsClient from "./listings-client";

/** Refresh server JSON-LD ItemList so new listings appear in HTML between builds. */
export const revalidate = 300;

const LISTINGS_TITLE = "Inzeráty vozidel – ojetá i nová auta v ČR | NNAuto";
const LISTINGS_DESCRIPTION =
  "Prohlédněte si aktuální nabídku osobních aut, motocyklů a nákladních vozidel na NNAuto. Ověřené inzeráty od soukromých prodejců i autobazarů. Filtrujte podle značky, modelu, roku výroby, ceny, najetých kilometrů a regionu. Kontaktujte prodejce přímo.";

export const metadata: Metadata = {
  title: LISTINGS_TITLE,
  description: LISTINGS_DESCRIPTION,
  openGraph: {
    title: LISTINGS_TITLE,
    description: LISTINGS_DESCRIPTION,
    url: "https://nnauto.cz/listings",
    siteName: "NNAuto",
    images: [{ url: "https://nnauto.cz/og-image.png", width: 1200, height: 630 }],
    locale: "cs_CZ",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: LISTINGS_TITLE,
    description: LISTINGS_DESCRIPTION,
    images: ["https://nnauto.cz/og-image.png"],
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
      {/* SEO-only H1 (visually hidden). Present in SSR HTML for crawlers without
          altering the visible catalog layout or filters. */}
      <h1 className="sr-only">
        Inzeráty vozidel – ojetá i nová auta, motocykly a nákladní vozidla v
        České republice
      </h1>
      <ListingsClient />
    </>
  );
}
