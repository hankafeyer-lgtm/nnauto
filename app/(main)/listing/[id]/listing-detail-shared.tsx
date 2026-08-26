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
} from "@lib/seo/brand-format";
import { buildListingCarJsonLd, buildListingProductJsonLd, buildListingVideoJsonLd } from "@lib/seo/structured-data";
import {
  listingHasIndexableVideo,
  listingVideoContentUrl,
  listingVideoThumbnailUrl,
} from "@lib/seo/listing-video";
import {
  buildListingAbsoluteUrl,
} from "@lib/seo/listing-url";
import {
  buildListingH1,
  buildListingImageAlt,
  buildListingInternalLinks,
  buildListingSeoDescription,
  buildListingSeoParagraph,
  buildListingSeoTitle,
} from "@lib/seo/listing-meta";
import { normalizeSlug } from "@lib/seo/slug";
import ListingDetailClient from "./listing-detail-client";
import ListingSeoSummary from "./ListingSeoSummary";
import { ListingBreadcrumbNav, buildListingBreadcrumbJsonLdItems } from "@lib/seo/helpers/breadcrumb";
import {
  SimilarListings,
  ListingAboutVehicle,
  RelatedOffers,
} from "@lib/seo/components/listing/RelatedOffers";
import type {
  DealerInventoryListing,
  DealerProfileForListing,
  SimilarListing,
} from "./get-listing";
import type { listings } from "@shared/schema";

type ListingRecord = typeof listings.$inferSelect;

export function buildListingMetadata(
  listing: ListingRecord | null,
  fallbackId: string,
): Metadata {
  if (!listing) return { title: "Inzerát nenalezen | NNAuto" };

  const title = buildListingSeoTitle(listing);
  const desc = buildListingSeoDescription(listing);
  const brand = formatBrandDisplay(listing.brand);
  const model = formatModelDisplay(listing.model);
  const fuelList = Array.isArray(listing.fuelType)
    ? listing.fuelType.filter(Boolean)
    : [];
  const region = listing.region ? String(listing.region) : "";

  const photo = listing.photos?.[0];
  const imageUrl = photo
    ? `${SITE_ORIGIN}/img/${photo.replace(/^\/+/, "")}?w=1200&q=80&f=webp`
    : `${SITE_ORIGIN}/og-image.png`;
  const imageAlt = buildListingImageAlt(listing, 0);
  const videoUrl = listingVideoContentUrl(listing.video);
  const videoThumb = listingHasIndexableVideo(listing)
    ? listingVideoThumbnailUrl(listing)
    : null;

  const keywords = [
    brand,
    model,
    `${brand} ${model}`,
    `${brand} ${model} ${listing.year}`,
    `prodej ${brand} ${model}`,
    `ojeté ${brand}`,
    fuelList[0] ? `${fuelList[0]} ${brand}` : "",
    region ? `auta ${region}` : "",
    "prodej aut",
    "NNAuto",
  ]
    .filter(Boolean)
    .join(", ");

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
      images: [{ url: imageUrl, width: 1200, height: 630, alt: imageAlt }],
      ...(videoUrl
        ? {
            videos: [
              {
                url: videoUrl,
                secureUrl: videoUrl,
                type: "video/mp4",
                width: 1280,
                height: 720,
              },
            ],
          }
        : {}),
      locale: "cs_CZ",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
      images: [videoThumb || imageUrl],
    },
    alternates: { canonical: canonicalUrl },
    other: videoUrl
      ? {
          "og:video": videoUrl,
          "og:video:secure_url": videoUrl,
          "og:video:type": "video/mp4",
          "og:video:width": "1280",
          "og:video:height": "720",
        }
      : undefined,
  };
}

export interface RenderListingDetailProps {
  listing: ListingRecord;
  similarListings: SimilarListing[];
  dealerProfile?: DealerProfileForListing | null;
  dealerInventory?: DealerInventoryListing[];
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

function cloneSerializable<T>(value: T): T {
  try {
    return JSON.parse(
      JSON.stringify(value, (_k, v) =>
        typeof v === "bigint" ? v.toString() : v,
      ),
    ) as T;
  } catch {
    return value;
  }
}

export function renderListingDetailPage({
  listing,
  similarListings,
  dealerProfile = null,
  dealerInventory = [],
  isEmbedded,
}: RenderListingDetailProps) {
  const id = listing.id;
  const initialListing = cloneListingRecordForClient(listing);
  const initialDealerProfile = dealerProfile ? cloneSerializable(dealerProfile) : null;
  const initialDealerInventory = cloneSerializable(dealerInventory);
  const brand = formatBrandDisplay(listing.brand);
  const modelLabel = formatModelDisplay(listing.model);
  const summaryTitle = buildListingH1(listing);
  const listingName = summaryTitle;
  const brandSlug = normalizeSlug(listing.brand);
  const modelSlug = normalizeSlug(listing.model);

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
    ? `/img/${firstPhotoCleanKey}?w=560&q=82&f=webp&v=${PIPELINE_VERSION} 560w, /img/${firstPhotoCleanKey}?w=1120&q=84&f=webp&v=${PIPELINE_VERSION} 1120w`
    : null;
  const preloadImageDefault = firstPhotoCleanKey
    ? `/img/${firstPhotoCleanKey}?w=1120&q=84&f=webp&v=${PIPELINE_VERSION}`
    : null;

  // Always use the canonical (new SEO) URL in JSON-LD so structured-data
  // points consistently at one URL.
  const canonicalUrl = buildListingAbsoluteUrl(SITE_ORIGIN, {
    id: listing.id,
    brand: listing.brand,
    model: listing.model,
    year: listing.year,
  });

  const productJsonLd = buildListingProductJsonLd(listing, canonicalUrl);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: buildListingBreadcrumbJsonLdItems(SITE_ORIGIN, {
      brand,
      brandSlug,
      modelLabel,
      modelSlug,
      listingName,
      canonicalUrl,
    }).map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      ...(item.item ? { item: item.item } : {}),
    })),
  };

  const seoParagraph = buildListingSeoParagraph(listing);
  const internalLinks = buildListingInternalLinks(listing);

  const carJsonLd = buildListingCarJsonLd(listing);
  const videoJsonLd = buildListingVideoJsonLd(listing);

  if (isEmbedded) {
    return (
      <>
        <JsonLd data={productJsonLd} />
        <JsonLd data={breadcrumbJsonLd} />
        {videoJsonLd ? <JsonLd data={videoJsonLd} /> : null}
        <ListingDetailClient
          initialListing={initialListing}
          initialListingId={id}
          initialDealerProfile={initialDealerProfile}
          initialDealerInventory={initialDealerInventory}
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
      {videoJsonLd ? <JsonLd data={videoJsonLd} /> : null}
      <JsonLd data={breadcrumbJsonLd} />
      {preloadImageDefault && preloadImageSrcSet ? (
        <link
          rel="preload"
          as="image"
          href={preloadImageDefault}
          imageSrcSet={preloadImageSrcSet}
          imageSizes="(max-width: 1023px) 100vw, 1120px"
          fetchPriority="high"
        />
      ) : null}
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-3 pt-3 sm:px-4 sm:pt-4 max-w-7xl">
          <ListingBreadcrumbNav
            brand={brand}
            brandSlug={brandSlug}
            modelLabel={modelLabel}
            modelSlug={modelSlug}
            listingName={listingName}
          />
        </div>
        <ListingSeoSummary listing={listing} />
        <ListingDetailClient
          initialListing={initialListing}
          initialListingId={id}
          initialDealerProfile={initialDealerProfile}
          initialDealerInventory={initialDealerInventory}
          embeddedMode={false}
          primaryHeading="delegated"
        />
        <SimilarListings items={similarListings} />
        <ListingAboutVehicle paragraph={seoParagraph} />
        <RelatedOffers links={internalLinks} />
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
