import type { Listing } from "@shared/schema";
import { SITE_ORIGIN } from "./constants";
import { buildListingAbsoluteUrl } from "./listing-url";
import { sanitizeJsonLd } from "./sanitize-jsonld";
import {
  buildListingSeoDescription,
  buildListingH1,
} from "./listing-meta";
import {
  listingHasIndexableVideo,
  listingVideoContentUrl,
  listingVideoDescription,
  listingVideoPageUrl,
  listingVideoThumbnailUrl,
  listingVideoTitle,
  listingVideoUploadDate,
} from "./listing-video";

const fuelTypeMap: Record<string, string> = {
  benzin: "Gasoline",
  diesel: "Diesel",
  hybrid: "HybridElectric",
  elektro: "Electric",
  electric: "Electric",
  lpg: "NaturalGas",
  cng: "NaturalGas",
  ethanol: "Ethanol",
  hydrogen: "Hydrogen",
  other: "Other",
};

const transmissionMap: Record<string, string> = {
  manual: "ManualTransmission",
  automat: "AutomaticTransmission",
  dsg: "AutomaticTransmission",
  cvt: "AutomaticTransmission",
};

const bodyTypeMap: Record<string, string> = {
  sedan: "Sedan",
  hatchback: "Hatchback",
  kombi: "StationWagon",
  suv: "SUV",
  crossover: "Crossover",
  coupe: "Coupe",
  cabrio: "Convertible",
  liftback: "Hatchback",
  pickup: "Pickup",
  minivan: "Minivan",
  van: "Van",
};

const driveTypeMap: Record<string, string> = {
  fwd: "FrontWheelDriveConfiguration",
  rwd: "RearWheelDriveConfiguration",
  awd: "AllWheelDriveConfiguration",
  "4x4": "FourWheelDriveConfiguration",
};

function listingPhotoUrls(photos: string[] | null | undefined, max = 10): string[] {
  if (!photos?.length) return [`${SITE_ORIGIN}/og-image.png`];
  return photos.slice(0, max).map((p) => {
    const path = p.replace(/^\/+/, "");
    return `${SITE_ORIGIN}/img/${path}?w=1200&q=80&f=webp`;
  });
}

export type BreadcrumbItem = { name: string; url?: string };

export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return sanitizeJsonLd({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  });
}

export type FaqItemInput = { question: string; answer: string };

export function buildFaqPageJsonLd(items: FaqItemInput[]) {
  return sanitizeJsonLd({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  });
}

export type ItemListEntry = { name: string; url: string };

export function buildItemListJsonLd(
  name: string,
  entries: ItemListEntry[],
  numberOfItems?: number,
) {
  return sanitizeJsonLd({
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: numberOfItems ?? entries.length,
    itemListElement: entries.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: entry.url,
      name: entry.name,
    })),
  });
}

export function buildCollectionPageJsonLd(opts: {
  name: string;
  description: string;
  url: string;
  items?: ItemListEntry[];
  stats?: { total: number; minPrice: number; maxPrice: number; avgPrice?: number };
}) {
  return sanitizeJsonLd({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: opts.name,
    description: opts.description,
    url: opts.url,
    isPartOf: { "@id": `${SITE_ORIGIN}/#website` },
    mainEntity: opts.items?.length
      ? {
          "@type": "ItemList",
          numberOfItems: opts.stats?.total ?? opts.items.length,
          itemListElement: opts.items.map((entry, index) => ({
            "@type": "ListItem",
            position: index + 1,
            url: entry.url,
            name: entry.name,
          })),
        }
      : undefined,
    ...(opts.stats && opts.stats.total >= 3 && opts.stats.minPrice > 0
      ? {
          offers: {
            "@type": "AggregateOffer",
            lowPrice: String(opts.stats.minPrice),
            highPrice: String(opts.stats.maxPrice),
            priceCurrency: "CZK",
            offerCount: opts.stats.total,
            availability: "https://schema.org/InStock",
          },
        }
      : {}),
  });
}

export function buildAggregateOfferJsonLd(opts: {
  name: string;
  stats: { total: number; minPrice: number; maxPrice: number; avgPrice?: number };
}) {
  if (opts.stats.total < 3 || opts.stats.minPrice <= 0) return undefined;
  return sanitizeJsonLd({
    "@context": "https://schema.org",
    "@type": "Product",
    name: opts.name,
    offers: {
      "@type": "AggregateOffer",
      lowPrice: String(opts.stats.minPrice),
      highPrice: String(opts.stats.maxPrice),
      priceCurrency: "CZK",
      offerCount: opts.stats.total,
      availability: "https://schema.org/InStock",
    },
  });
}

/** Schema.org Vehicle + Offer for a DB listing row */
export function buildListingCarJsonLd(listing: Listing) {
  const id = listing.id;
  const url = buildListingAbsoluteUrl(SITE_ORIGIN, {
    id,
    brand: listing.brand,
    model: listing.model,
    year: listing.year,
  });
  const conditionUrl =
    listing.condition === "new"
      ? "https://schema.org/NewCondition"
      : "https://schema.org/UsedCondition";
  const price = Number(listing.price);
  const fuel = listing.fuelType?.[0];
  const trans = listing.transmission?.[0];
  const drive = listing.driveType?.[0];
  const body = listing.bodyType ?? undefined;

  return sanitizeJsonLd({
    "@context": "https://schema.org",
    "@type": "Vehicle",
    "@id": `${url}#vehicle`,
    name: `${listing.year} ${listing.brand} ${listing.model}`.trim(),
    brand: { "@type": "Brand", name: listing.brand },
    manufacturer: { "@type": "Organization", name: listing.brand },
    model: listing.model,
    vehicleModelDate: listing.year ? String(listing.year) : undefined,
    productionDate: listing.year ? String(listing.year) : undefined,
    vehicleIdentificationNumber: listing.vin || undefined,
    mileageFromOdometer:
      listing.mileage != null
        ? {
            "@type": "QuantitativeValue",
            value: listing.mileage,
            unitCode: "KMT",
            unitText: "km",
          }
        : undefined,
    fuelType: fuel ? fuelTypeMap[fuel] || fuel : undefined,
    vehicleTransmission: trans ? transmissionMap[trans] || trans : undefined,
    driveWheelConfiguration: drive ? driveTypeMap[drive] || drive : undefined,
    color: listing.color || undefined,
    bodyType: body ? bodyTypeMap[body] || body : undefined,
    numberOfDoors: listing.doors ?? undefined,
    vehicleSeatingCapacity: listing.seats ?? undefined,
    description:
      listing.description?.slice(0, 5000) ||
      (listing.mileage != null
        ? `Prodej ${listing.year} ${listing.brand} ${listing.model}. Najeto ${listing.mileage.toLocaleString("cs-CZ")} km.`
        : undefined),
    image: listingPhotoUrls(listing.photos),
    url,
    video: buildListingVideoFields(listing) || undefined,
    offers: {
      "@type": "Offer",
      "@id": `${url}#offer`,
      url,
      price,
      priceCurrency: "CZK",
      availability: listing.isSold
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock",
      itemCondition: conditionUrl,
    },
  });
}

/** VideoObject fields (no @context) for nesting on Vehicle/Product. */
function buildListingVideoFields(listing: Listing) {
  if (!listingHasIndexableVideo(listing)) return null;
  const contentUrl = listingVideoContentUrl(listing.video);
  if (!contentUrl) return null;
  const pageUrl = listingVideoPageUrl(listing);

  return {
    "@type": "VideoObject",
    "@id": `${pageUrl}#video`,
    name: listingVideoTitle(listing),
    description: listingVideoDescription(listing),
    thumbnailUrl: [listingVideoThumbnailUrl(listing)],
    contentUrl,
    embedUrl: pageUrl,
    uploadDate: listingVideoUploadDate(listing),
    mainEntityOfPage: pageUrl,
    isFamilyFriendly: true,
  };
}

/** Standalone VideoObject for Google video indexing / rich results. */
export function buildListingVideoJsonLd(listing: Listing) {
  const fields = buildListingVideoFields(listing);
  if (!fields) return null;
  return sanitizeJsonLd({
    "@context": "https://schema.org",
    ...fields,
  });
}

export function buildListingProductJsonLd(
  listing: Listing,
  canonicalUrl: string,
) {
  const name = buildListingH1(listing);
  const description =
    listing.description?.slice(0, 5000) ||
    buildListingSeoDescription(listing);
  const price = Number(listing.price);
  const photos = Array.isArray(listing.photos) ? listing.photos : [];
  const imageUrls = listingPhotoUrls(photos, 6);

  const conditionRaw = String(listing.condition ?? "").toLowerCase();
  const itemConditionUrl = conditionRaw.includes("nov")
    ? "https://schema.org/NewCondition"
    : conditionRaw.includes("havar") || conditionRaw.includes("damag")
      ? "https://schema.org/DamagedCondition"
      : "https://schema.org/UsedCondition";

  const priceValidUntil = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  return sanitizeJsonLd({
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    sku: listing.id,
    description,
    brand: listing.brand
      ? { "@type": "Brand", name: listing.brand }
      : undefined,
    image: imageUrls,
    video: buildListingVideoFields(listing) || undefined,
    offers: {
      "@type": "Offer",
      price: String(price),
      priceCurrency: "CZK",
      availability: listing.isSold
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock",
      itemCondition: itemConditionUrl,
      priceValidUntil,
      url: canonicalUrl,
      seller: {
        "@type": "Organization",
        name: "NNAuto",
        url: SITE_ORIGIN,
      },
    },
  });
}

export function buildOrganizationJsonLd() {
  return sanitizeJsonLd({
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_ORIGIN}/#organization`,
    name: "NNAuto",
    alternateName: "NNAuto.cz",
    url: SITE_ORIGIN,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_ORIGIN}/logo-512.png`,
      width: 512,
      height: 512,
    },
    image: `${SITE_ORIGIN}/og-image.png`,
    description:
      "NNAuto je online autobazar v České republice s ověřenými inzeráty osobních aut, motocyklů a nákladních vozidel.",
    areaServed: {
      "@type": "Country",
      name: "Czech Republic",
    },
    inLanguage: "cs-CZ",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      availableLanguage: ["cs", "en"],
      url: `${SITE_ORIGIN}/about`,
    },
    sameAs: [
      "https://www.facebook.com/nnauto.cz",
      "https://www.instagram.com/nnauto.cz",
    ],
  });
}

export function buildWebSiteJsonLd() {
  return sanitizeJsonLd({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_ORIGIN}/#website`,
    name: "NNAuto",
    alternateName: "NNAuto.cz",
    url: SITE_ORIGIN,
    inLanguage: "cs-CZ",
    publisher: { "@id": `${SITE_ORIGIN}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_ORIGIN}/listings?brand={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  });
}

export function buildHomePageJsonLdGraph() {
  return sanitizeJsonLd({
    "@context": "https://schema.org",
    "@graph": [buildOrganizationJsonLd(), buildWebSiteJsonLd()],
  });
}

/** ItemList of recent listing URLs — emitted on `/listings` HTML for crawlers. */
export function buildListingIndexItemListJsonLd(
  rows: { id: string; title: string; brand: string; model: string }[],
) {
  return buildItemListJsonLd(
    "Aktuální inzeráty NNAuto",
    rows.map((row) => ({
      name: row.title || `${row.brand} ${row.model}`.trim(),
      url: buildListingAbsoluteUrl(SITE_ORIGIN, {
        id: row.id,
        brand: row.brand,
        model: row.model,
      }),
    })),
    rows.length,
  );
}

export function buildBrandAggregateOfferJsonLd(opts: {
  brandName: string;
  total: number;
  minPrice: number;
  maxPrice: number;
}) {
  if (opts.total < 3 || opts.minPrice <= 0) return undefined;
  return sanitizeJsonLd({
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${opts.brandName} – ojetá auta`,
    description: `Nabídka ${opts.total} ojetých vozů ${opts.brandName} na NNAuto.cz`,
    brand: { "@type": "Brand", name: opts.brandName },
    offers: {
      "@type": "AggregateOffer",
      lowPrice: String(opts.minPrice),
      highPrice: String(opts.maxPrice),
      priceCurrency: "CZK",
      offerCount: opts.total,
      availability: "https://schema.org/InStock",
    },
  });
}
