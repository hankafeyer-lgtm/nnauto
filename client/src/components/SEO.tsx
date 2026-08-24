"use client";

import { useEffect } from "react";
import { buildListingAbsoluteUrl } from "@/lib/listingUrl";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: "website" | "article" | "product";
  locale?: string;
  noindex?: boolean;
  structuredData?: object;
  alternateLanguages?: { lang: string; url: string }[];
  prevPage?: string;
  nextPage?: string;
  /** When true, skip client head mutations — Next.js generateMetadata owns title/meta. */
  preserveServerHead?: boolean;
}

const baseUrl = "https://nnauto.cz";
const defaultImage = `${baseUrl}/og-image.png`;
const siteName = "NNAuto";

function setMeta(name: string, content: string, attr = "name") {
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setLink(rel: string, href: string, extra?: Record<string, string>) {
  const selector = extra
    ? `link[rel="${rel}"][${Object.entries(extra)
        .map(([k, v]) => `${k}="${v}"`)
        .join("][")}]`
    : `link[rel="${rel}"]`;
  let el = document.querySelector(selector);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    if (extra) Object.entries(extra).forEach(([k, v]) => el!.setAttribute(k, v));
    document.head.appendChild(el);
  }
  (el as HTMLLinkElement).href = href;
}

export function SEO({
  title,
  description = "NNAuto je prémiový marketplace pro nákup a prodej automobilů, motocyklů a nákladních vozidel v České republice. Tisíce ověřených inzerátů, pokročilé filtry, snadné vyhledávání.",
  keywords = "prodej aut, nákup aut, bazar aut, ojetá auta, nová auta, automobily, motocykly, nákladní vozy, SUV, elektroauta, autobazar, Česká republika, Praha, Brno, Ostrava, NNAuto, autobazar online, prodej vozidel, auto inzeráty, výkup aut, financing auta, prodej motorek, inzerce aut, авто базар Чехія, продаж авто в Чехії, car marketplace Czech Republic, used cars Czechia, auto verkaufen Tschechien",
  image = defaultImage,
  url = baseUrl,
  type = "website",
  locale = "cs_CZ",
  noindex = false,
  structuredData,
  alternateLanguages,
  prevPage,
  nextPage,
  preserveServerHead = false,
}: SEOProps) {
  const fullTitle = title
    ? `${title} | ${siteName}`
    : `${siteName} - Prémiový Marketplace Aut v České Republice`;

  useEffect(() => {
    if (preserveServerHead) return;

    document.title = fullTitle;

    setMeta("title", fullTitle);
    setMeta("description", description);
    setMeta("keywords", keywords);
    setMeta("author", "NNAuto");

    const robotsContent = noindex
      ? "noindex, nofollow"
      : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";
    setMeta("robots", robotsContent);

    setLink("canonical", url);

    setMeta("og:type", type, "property");
    setMeta("og:url", url, "property");
    setMeta("og:title", fullTitle, "property");
    setMeta("og:description", description, "property");
    setMeta("og:image", image, "property");
    setMeta("og:site_name", siteName, "property");
    setMeta("og:locale", locale, "property");

    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", fullTitle);
    setMeta("twitter:description", description);
    setMeta("twitter:image", image);

    let jsonLdEl = document.querySelector(
      'script[data-seo-jsonld="true"]',
    ) as HTMLScriptElement | null;
    if (structuredData) {
      if (!jsonLdEl) {
        jsonLdEl = document.createElement("script");
        jsonLdEl.type = "application/ld+json";
        jsonLdEl.setAttribute("data-seo-jsonld", "true");
        document.head.appendChild(jsonLdEl);
      }
      jsonLdEl.textContent = JSON.stringify(structuredData);
    } else if (jsonLdEl) {
      jsonLdEl.remove();
    }
  }, [
    fullTitle,
    description,
    keywords,
    image,
    url,
    type,
    locale,
    noindex,
    structuredData,
    preserveServerHead,
  ]);

  return null;
}

export function generateVehicleSchema(listing: {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuelType?: string[];
  transmission?: string[];
  color?: string;
  bodyType?: string;
  engineVolume?: string;
  power?: number;
  vin?: string;
  photos?: string[];
  description?: string;
  condition?: string;
  sellerType?: string;
  doors?: number;
  seats?: number;
  driveType?: string[];
  region?: string;
}) {
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
  const conditionUrl =
    listing.condition === "new"
      ? "https://schema.org/NewCondition"
      : "https://schema.org/UsedCondition";
  const images =
    listing.photos && listing.photos.length > 0
      ? listing.photos.map(
          (p) =>
            `${baseUrl}/img/${p.replace(/^\/+/, "")}?w=1200&q=80&f=webp`,
        )
      : [`${baseUrl}/og-image.png`];

  return {
    "@context": "https://schema.org",
    "@type": "Car",
    "@id": `${buildListingAbsoluteUrl({
      id: listing.id,
      brand: listing.brand,
      model: listing.model,
      year: listing.year,
    })}#vehicle`,
    name: `${listing.year} ${listing.brand} ${listing.model}`,
    brand: { "@type": "Brand", name: listing.brand },
    manufacturer: { "@type": "Organization", name: listing.brand },
    model: listing.model,
    modelDate: listing.year.toString(),
    productionDate: listing.year.toString(),
    vehicleIdentificationNumber: listing.vin || undefined,
    mileageFromOdometer: {
      "@type": "QuantitativeValue",
      value: listing.mileage,
      unitCode: "KMT",
      unitText: "km",
    },
    fuelType: listing.fuelType?.[0]
      ? fuelTypeMap[listing.fuelType[0]] || listing.fuelType[0]
      : undefined,
    vehicleTransmission: listing.transmission?.[0]
      ? transmissionMap[listing.transmission[0]] || listing.transmission[0]
      : undefined,
    driveWheelConfiguration: listing.driveType?.[0]
      ? driveTypeMap[listing.driveType[0]] || listing.driveType[0]
      : undefined,
    color: listing.color || undefined,
    bodyType: listing.bodyType
      ? bodyTypeMap[listing.bodyType] || listing.bodyType
      : undefined,
    numberOfDoors: listing.doors || undefined,
    vehicleSeatingCapacity: listing.seats || undefined,
    description:
      listing.description ||
      `Prodej ${listing.year} ${listing.brand} ${listing.model}. Najeto ${listing.mileage.toLocaleString("cs-CZ")} km.`,
    image: images,
    url: buildListingAbsoluteUrl({
      id: listing.id,
      brand: listing.brand,
      model: listing.model,
      year: listing.year,
    }),
    offers: {
      "@type": "Offer",
      "@id": `${buildListingAbsoluteUrl({
        id: listing.id,
        brand: listing.brand,
        model: listing.model,
        year: listing.year,
      })}#offer`,
      url: buildListingAbsoluteUrl({
        id: listing.id,
        brand: listing.brand,
        model: listing.model,
        year: listing.year,
      }),
      price: listing.price,
      priceCurrency: "CZK",
      availability: "https://schema.org/InStock",
      itemCondition: conditionUrl,
    },
  };
}

export function generateBreadcrumbSchema(
  items: { name: string; url: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generateListingsSchema(
  listings: Array<{
    id: string;
    brand: string;
    model: string;
    year: number;
    price: number;
    photos?: string[];
  }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Inzeráty vozidel na NNAuto",
    numberOfItems: listings.length,
    itemListElement: listings.slice(0, 20).map((listing, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: buildListingAbsoluteUrl({
        id: listing.id,
        brand: listing.brand,
        model: listing.model,
        year: listing.year,
      }),
      name: `${listing.year} ${listing.brand} ${listing.model}`,
    })),
  };
}

export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "NNAuto",
    url: baseUrl,
    logo: `${baseUrl}/logo-512.png`,
  };
}

export function generateWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "NNAuto",
    url: baseUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/listings?brand={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function generateFAQSchema(
  faqs: { question: string; answer: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}

export function generateListingKeywords(listing: {
  brand: string;
  model: string;
  year: number;
  bodyType?: string;
  fuelType?: string[];
  region?: string;
  condition?: string;
}): string {
  const keywords: string[] = [
    listing.brand,
    listing.model,
    `${listing.brand} ${listing.model}`,
    `${listing.year} ${listing.brand}`,
    `prodej ${listing.brand}`,
    "auto bazar",
    "NNAuto",
  ];
  if (listing.region) keywords.push(listing.region);
  return Array.from(new Set(keywords.filter(Boolean))).join(", ");
}

export default SEO;
