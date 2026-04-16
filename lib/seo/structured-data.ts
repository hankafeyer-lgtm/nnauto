import type { Listing } from "@shared/schema";
import { SITE_ORIGIN } from "./constants";

const fuelTypeMap: Record<string, string> = {
  benzin: "Gasoline",
  diesel: "Diesel",
  hybrid: "HybridElectric",
  elektro: "Electric",
  lpg: "NaturalGas",
  cng: "NaturalGas",
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

/** Schema.org Car + Offer for a DB listing row */
export function buildListingCarJsonLd(listing: Listing) {
  const id = listing.id;
  const url = `${SITE_ORIGIN}/listing/${id}`;
  const conditionUrl =
    listing.condition === "new"
      ? "https://schema.org/NewCondition"
      : "https://schema.org/UsedCondition";
  const price = Number(listing.price);
  const fuel = listing.fuelType?.[0];
  const trans = listing.transmission?.[0];
  const drive = listing.driveType?.[0];
  const body = listing.bodyType ?? undefined;

  return {
    "@context": "https://schema.org",
    "@type": "Car",
    "@id": `${url}#vehicle`,
    name: `${listing.year} ${listing.brand} ${listing.model}`,
    brand: { "@type": "Brand", name: listing.brand },
    manufacturer: { "@type": "Organization", name: listing.brand },
    model: listing.model,
    modelDate: String(listing.year),
    productionDate: String(listing.year),
    vehicleIdentificationNumber: listing.vin || undefined,
    mileageFromOdometer: {
      "@type": "QuantitativeValue",
      value: listing.mileage,
      unitCode: "KMT",
      unitText: "km",
    },
    fuelType: fuel ? fuelTypeMap[fuel] || fuel : undefined,
    vehicleTransmission: trans ? transmissionMap[trans] || trans : undefined,
    driveWheelConfiguration: drive ? driveTypeMap[drive] || drive : undefined,
    color: listing.color || undefined,
    bodyType: body ? bodyTypeMap[body] || body : undefined,
    numberOfDoors: listing.doors ?? undefined,
    vehicleSeatingCapacity: listing.seats ?? undefined,
    description:
      listing.description?.slice(0, 5000) ||
      `Prodej ${listing.year} ${listing.brand} ${listing.model}. Najeto ${listing.mileage.toLocaleString("cs-CZ")} km.`,
    image: listingPhotoUrls(listing.photos),
    url,
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
  };
}

export function buildOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "NNAuto",
    url: SITE_ORIGIN,
    logo: `${SITE_ORIGIN}/og-image.png`,
  };
}

export function buildWebSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "NNAuto",
    url: SITE_ORIGIN,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_ORIGIN}/listings?brand={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function buildHomePageJsonLdGraph() {
  return {
    "@context": "https://schema.org",
    "@graph": [buildOrganizationJsonLd(), buildWebSiteJsonLd()],
  };
}

/** ItemList of recent listing URLs — emitted on `/listings` HTML for crawlers (SPA shell uses NoSSR). */
export function buildListingIndexItemListJsonLd(
  rows: { id: string; title: string; brand: string; model: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Aktuální inzeráty NNAuto",
    numberOfItems: rows.length,
    itemListElement: rows.map((row, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${SITE_ORIGIN}/listing/${row.id}`,
      name: row.title || `${row.brand} ${row.model}`.trim(),
    })),
  };
}
