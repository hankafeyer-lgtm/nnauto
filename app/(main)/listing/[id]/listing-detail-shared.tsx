/**
 * Shared metadata builder + page renderer for listing detail.
 *
 * This module is consumed by BOTH:
 *   - app/(main)/listing/[id]/page.tsx          (legacy URL, kept alive)
 *   - app/(main)/auta/[brand]/[model]/[id]/page.tsx (new canonical URL)
 *
 * Centralizing the logic guarantees that:
 *   1. The `<link rel="canonical">` is identical on both routes (always
 *      points to the new SEO URL).
 *   2. JSON-LD, OG meta and rendered content are byte-equivalent — Google
 *      sees one piece of content under one canonical, regardless of how the
 *      user landed on it.
 *   3. Future changes to the listing detail layout / schema only need one
 *      edit, not two.
 */
import type { Metadata } from "next";
import JsonLd from "@lib/seo/JsonLd";
import { SITE_ORIGIN } from "@lib/seo/constants";
import {
  formatBrandDisplay,
  formatModelDisplay,
  formatVehicleTitle,
} from "@lib/seo/brand-format";
import { buildListingCarJsonLd } from "@lib/seo/structured-data";
import {
  buildListingUrl,
  buildListingAbsoluteUrl,
} from "@lib/seo/listing-url";
import { normalizeSlug } from "@lib/seo/slug";
import ListingDetailClient from "./listing-detail-client";
import ListingSeoSummary from "./ListingSeoSummary";
import type { SimilarListing } from "./get-listing";
import type { listings } from "@shared/schema";

type ListingRecord = typeof listings.$inferSelect;

export function buildListingMetadata(
  listing: ListingRecord | null,
  fallbackId: string,
): Metadata {
  if (!listing) return { title: "Inzerát nenalezen | NNAuto" };

  const capitalize = (v: string) =>
    v ? v.charAt(0).toUpperCase() + v.slice(1) : v;
  const brand = formatBrandDisplay(listing.brand);
  const model = formatModelDisplay(listing.model);
  const price = Number(listing.price).toLocaleString("cs-CZ");
  const mileage = listing.mileage
    ? listing.mileage.toLocaleString("cs-CZ")
    : "";
  const fuelList = Array.isArray(listing.fuelType)
    ? listing.fuelType.filter(Boolean)
    : [];
  const transmissionList = Array.isArray(listing.transmission)
    ? listing.transmission.filter(Boolean)
    : [];
  const fuel = capitalize(fuelList[0] || "");
  const transmission = capitalize(transmissionList[0] || "");
  const region = listing.region ? capitalize(String(listing.region)) : "";

  const titleParts = [
    `${brand} ${model} ${listing.year}`.trim(),
    fuel,
    mileage ? `${mileage} km` : "",
    `${price} Kč`,
    region,
  ].filter(Boolean);
  const title = `${titleParts.join(" · ")} | NNAuto`;

  const photo = listing.photos?.[0];
  const imageUrl = photo
    ? `${SITE_ORIGIN}/img/${photo.replace(/^\/+/, "")}?w=1200&q=80&f=webp`
    : `${SITE_ORIGIN}/og-image.png`;

  const descParts: string[] = [];
  descParts.push(`Prodám ${brand} ${model}, rok ${listing.year}`);
  if (mileage) descParts.push(`najeto ${mileage} km`);
  if (fuel) descParts.push(fuel.toLowerCase());
  if (transmission) descParts.push(transmission.toLowerCase());
  if (region) descParts.push(region);
  let desc = descParts.join(", ") + `. Cena ${price} Kč.`;
  if (listing.description && listing.description.trim().length) {
    const snippet = listing.description.replace(/\s+/g, " ").trim().slice(0, 80);
    desc += ` ${snippet}${snippet.length === 80 ? "…" : ""}`;
  }
  desc += " Prohlédněte si fotky a kontaktujte prodejce na NNAuto.cz.";
  desc = desc.slice(0, 300);

  const keywords = [
    brand,
    model,
    `${brand} ${model}`,
    `${brand} ${model} ${listing.year}`,
    `${brand} ${model} ${fuel}`.trim(),
    `prodej ${brand} ${model}`,
    `ojeté ${brand}`,
    fuel ? `${fuel} ${brand}` : "",
    region ? `auta ${region}` : "",
    region ? `autobazar ${region}` : "",
    "prodej aut",
    "bazar aut",
    "NNAuto",
  ]
    .filter(Boolean)
    .join(", ");

  // Always canonical to the new SEO URL — both routes converge here.
  const canonicalUrl = buildListingAbsoluteUrl(SITE_ORIGIN, {
    id: listing.id,
    brand: listing.brand,
    model: listing.model,
    year: listing.year,
  });

  return {
    title,
    description: desc,
    keywords,
    robots: listing.isSold
      ? { index: false, follow: true }
      : { index: true, follow: true },
    openGraph: {
      title,
      description: desc,
      url: canonicalUrl,
      siteName: "NNAuto",
      images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
      locale: "cs_CZ",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
      images: [imageUrl],
    },
    alternates: { canonical: canonicalUrl },
  };
}

export interface RenderListingDetailProps {
  listing: ListingRecord;
  similarListings: SimilarListing[];
  isEmbedded: boolean;
}

function cloneListingRecordForClient(listing: ListingRecord): ListingRecord {
  try {
    return JSON.parse(
      JSON.stringify(listing, (_k, v) =>
        typeof v === "bigint" ? v.toString() : v,
      ),
    ) as ListingRecord;
  } catch {
    return JSON.parse(JSON.stringify(listing)) as ListingRecord;
  }
}

export function renderListingDetailPage({
  listing,
  similarListings,
  isEmbedded,
}: RenderListingDetailProps) {
  const id = listing.id;
  const initialListing = cloneListingRecordForClient(listing);
  const brand = formatBrandDisplay(listing.brand);
  const price = Number(listing.price).toLocaleString("cs-CZ");
  const modelLabel = formatModelDisplay(listing.model);
  const yearLabel = listing.year ? String(listing.year) : "";
  const summaryTitle = formatVehicleTitle(
    listing.brand,
    listing.model,
    listing.year,
  );
  const listingName = summaryTitle;
  const brandSlug = normalizeSlug(listing.brand);
  const modelSlug = normalizeSlug(listing.model);
  const brandFilterUrl = `${SITE_ORIGIN}/auta/${brandSlug}`;
  const modelFilterUrl = `${SITE_ORIGIN}/auta/${brandSlug}/${modelSlug}`;
  const fuelText = Array.isArray(listing.fuelType)
    ? listing.fuelType.join(", ")
    : ((listing.fuelType as unknown as string) || "");
  const transmissionText = Array.isArray(listing.transmission)
    ? listing.transmission.join(", ")
    : ((listing.transmission as unknown as string) || "");

  const productImageUrls = Array.isArray(listing.photos)
    ? listing.photos
        .filter((p): p is string => typeof p === "string" && p.trim().length > 0)
        .slice(0, 6)
        .map(
          (p) =>
            `${SITE_ORIGIN}/img/${p.replace(/^\/+/, "")}?w=1200&q=80&f=webp`,
        )
    : [];
  const primaryImage = productImageUrls[0] ?? null;

  // Build preload URLs for the very first gallery photo so the browser
  // starts fetching the LCP image before the React bundle even runs. The
  // exact same URLs are then reused by the client-side carousel and the
  // fullscreen lightbox (immutable cache hit → instant paint).
  const firstPhotoKey = Array.isArray(listing.photos)
    ? listing.photos.find(
        (p): p is string => typeof p === "string" && p.trim().length > 0,
      )
    : undefined;
  const firstPhotoCleanKey = firstPhotoKey
    ? firstPhotoKey.replace(/^\/+/, "")
    : null;
  const PIPELINE_VERSION = "wm4";
  const preloadImageSrcSet = firstPhotoCleanKey
    ? `/img/${firstPhotoCleanKey}?w=560&q=78&f=webp&v=${PIPELINE_VERSION} 560w, /img/${firstPhotoCleanKey}?w=1120&q=84&f=webp&v=${PIPELINE_VERSION} 1120w`
    : null;
  const preloadImageDefault = firstPhotoCleanKey
    ? `/img/${firstPhotoCleanKey}?w=1120&q=84&f=webp&v=${PIPELINE_VERSION}`
    : null;

  const conditionRaw = (listing.condition || "").toLowerCase();
  const itemConditionUrl = conditionRaw.includes("nov")
    ? "https://schema.org/NewCondition"
    : conditionRaw.includes("havar") || conditionRaw.includes("damag")
      ? "https://schema.org/DamagedCondition"
      : "https://schema.org/UsedCondition";

  const priceValidUntil = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  // Always use the canonical (new SEO) URL in JSON-LD so structured-data
  // points consistently at one URL.
  const canonicalUrl = buildListingAbsoluteUrl(SITE_ORIGIN, {
    id: listing.id,
    brand: listing.brand,
    model: listing.model,
    year: listing.year,
  });

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: listingName,
    sku: listing.id,
    description: listing.description || `${listingName} - inzerat na NNAuto`,
    brand: brand ? { "@type": "Brand", name: brand } : undefined,
    image: productImageUrls.length
      ? productImageUrls
      : primaryImage
        ? [primaryImage]
        : undefined,
    additionalProperty: [
      { "@type": "PropertyValue", name: "Rok", value: String(listing.year) },
      {
        "@type": "PropertyValue",
        name: "Najeto",
        value: `${listing.mileage?.toLocaleString("cs-CZ")} km`,
      },
      { "@type": "PropertyValue", name: "Palivo", value: fuelText || undefined },
      {
        "@type": "PropertyValue",
        name: "Prevodovka",
        value: transmissionText || undefined,
      },
    ].filter((item) => Boolean(item.value)),
    offers: {
      "@type": "Offer",
      price: String(Number(listing.price)),
      priceCurrency: "CZK",
      availability: "https://schema.org/InStock",
      itemCondition: itemConditionUrl,
      priceValidUntil,
      url: canonicalUrl,
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: "0",
          currency: "CZK",
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "CZ",
        },
        doesNotShip: true,
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "CZ",
        returnPolicyCategory:
          "https://schema.org/MerchantReturnNotPermitted",
      },
      seller: {
        "@type": "Organization",
        name: "NNAuto",
        url: SITE_ORIGIN,
      },
    },
  };

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
        name: brand,
        item: brandFilterUrl,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: modelLabel,
        item: modelFilterUrl,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: yearLabel,
      },
    ],
  };

  const carJsonLd = buildListingCarJsonLd(listing);

  if (isEmbedded) {
    return (
      <>
        <JsonLd data={productJsonLd} />
        <JsonLd data={breadcrumbJsonLd} />
        <ListingDetailClient
          initialListing={initialListing}
          initialListingId={id}
          disableSsr
          embeddedMode
        />
      </>
    );
  }

  return (
    <>
      <JsonLd data={productJsonLd} />
      {carJsonLd ? <JsonLd data={carJsonLd} /> : null}
      <JsonLd data={breadcrumbJsonLd} />
      {preloadImageDefault && preloadImageSrcSet ? (
        <link
          rel="preload"
          as="image"
          href={preloadImageDefault}
          // @ts-expect-error imageSrcSet / imageSizes are valid in HTML5 but
          // missing from React's older type definitions for <link>.
          imageSrcSet={preloadImageSrcSet}
          imageSizes="(max-width: 1023px) 100vw, 1120px"
          fetchPriority="high"
        />
      ) : null}
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-3 pt-3 sm:px-4 sm:pt-4 max-w-7xl">
          <a
            href={`/auta/${brandSlug}`}
            className="block truncate text-sm text-muted-foreground hover:underline sm:hidden"
          >
            {`\u2190 Zpět na ${brand}`}
          </a>
          <nav
            aria-label="Breadcrumb"
            className="hidden flex-wrap items-center gap-x-2 gap-y-1 overflow-x-auto text-sm leading-relaxed text-muted-foreground sm:flex"
          >
            <a href="/" className="shrink-0 hover:underline">NNAuto</a>
            <span className="text-muted-foreground/70">{">"}</span>
            <a
              href={`/auta/${brandSlug}`}
              className="max-w-[40vw] truncate hover:underline sm:max-w-none"
            >
              {brand}
            </a>
            <span className="text-muted-foreground/70">{">"}</span>
            <a
              href={`/auta/${brandSlug}/${modelSlug}`}
              className="max-w-[40vw] truncate hover:underline sm:max-w-none"
            >
              {modelLabel}
            </a>
            <span className="text-muted-foreground/70">{">"}</span>
            <span aria-current="page" className="shrink-0">{yearLabel}</span>
          </nav>
        </div>
        <ListingSeoSummary listing={listing} />
        <ListingDetailClient
          initialListing={initialListing}
          initialListingId={id}
          embeddedMode={false}
          primaryHeading="delegated"
        />
        {similarListings.length ? (
          <section className="container mx-auto mt-6 border-t px-3 py-6 sm:mt-8 sm:px-4 sm:py-8 max-w-7xl">
            <h2 className="text-xl font-semibold mb-4">Souvisejici auta</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {similarListings.map((item) => {
                const itemPhoto = item.photos?.[0];
                const itemPrice = Number(item.price).toLocaleString("cs-CZ");
                const itemHref = buildListingUrl({
                  id: item.id,
                  brand: item.brand,
                  model: item.model,
                  year: item.year,
                });
                return (
                  <a
                    key={item.id}
                    href={itemHref}
                    className="block rounded-lg border border-border bg-card hover:bg-accent/40 transition-colors overflow-hidden"
                  >
                    {itemPhoto ? (
                      <img
                        src={`${SITE_ORIGIN}/img/${itemPhoto.replace(/^\/+/, "")}?w=480&q=76&f=webp`}
                        alt={item.title}
                        loading="lazy"
                        className="w-full h-36 object-cover"
                      />
                    ) : null}
                    <div className="p-3 space-y-1">
                      <p className="text-sm font-medium line-clamp-2">{item.title}</p>
                      <p className="text-primary font-semibold">{itemPrice} Kč</p>
                    </div>
                  </a>
                );
              })}
            </div>
          </section>
        ) : null}
      </main>
    </>
  );
}

export function renderListingNotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-bold">Inzerát nenalezen</h1>
        <p className="text-muted-foreground">
          Požadované oglaseni se nepodarilo nacist.
        </p>
      </div>
    </main>
  );
}
