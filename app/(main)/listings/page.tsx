import type { Metadata } from "next";
import JsonLd from "@lib/seo/JsonLd";
import { getRecentActiveListings } from "@lib/seo/recent-listings";
import { buildListingIndexItemListJsonLd } from "@lib/seo/structured-data";
import { SITE_ORIGIN } from "@lib/seo/constants";
import { buildListingsPageMetadata } from "@lib/seo/listings-metadata";
import ListingsClient from "./listings-client";
import ListingsServerPreview from "./listings-server-preview";
import { ListingsSeoFooter } from "@lib/seo/components/listings/ListingsSeoFooter";

/** Refresh server JSON-LD ItemList so new listings appear in HTML between builds. */
export const revalidate = 300;

const LISTINGS_TITLE = "Inzeráty vozidel – ojetá i nová auta v ČR | NNAuto";
const LISTINGS_DESCRIPTION =
  "Prohlédněte si aktuální nabídku osobních aut, motocyklů a nákladních vozidel na NNAuto. Ověřené inzeráty od soukromých prodejců i autobazarů. Filtrujte podle značky, modelu, roku výroby, ceny, najetých kilometrů a regionu. Kontaktujte prodejce přímo.";

/**
 * Plain /listings is indexable. Any /listings?… filter URL is noindex,follow
 * with canonical to /listings or the matching /auta/… SEO cluster.
 */
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const params = await searchParams;

  return buildListingsPageMetadata(params, {
    title: LISTINGS_TITLE,
    description: LISTINGS_DESCRIPTION,
    openGraph: {
      title: LISTINGS_TITLE,
      description: LISTINGS_DESCRIPTION,
      url: `${SITE_ORIGIN}/listings`,
      siteName: "NNAuto",
      images: [{ url: `${SITE_ORIGIN}/og-image.png`, width: 1200, height: 630 }],
      locale: "cs_CZ",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: LISTINGS_TITLE,
      description: LISTINGS_DESCRIPTION,
      images: [`${SITE_ORIGIN}/og-image.png`],
    },
  });
}

const LISTING_INDEX_JSONLD_COUNT = 80;

export default async function Listings() {
  const recent = await getRecentActiveListings(LISTING_INDEX_JSONLD_COUNT);
  const itemListJsonLd = buildListingIndexItemListJsonLd(recent);

  // BreadcrumbList JSON-LD so Google understands /listings is the catalogue
  // root in the site hierarchy. Pairs with breadcrumb schema already emitted
  // by /auta/[brand], /auta/[brand]/[model] and /listing/[id].
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "NNAuto",
        item: `${SITE_ORIGIN}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Inzeráty",
        item: `${SITE_ORIGIN}/listings`,
      },
    ],
  };

  return (
    <>
      <JsonLd data={itemListJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      {/* SEO H1 — kept visually hidden so the catalog UI is untouched. */}
      <h1 className="sr-only">Inzeráty vozidel v České republice</h1>
      <ListingsServerPreview />
      <ListingsClient />

      <ListingsSeoFooter />
    </>
  );
}
