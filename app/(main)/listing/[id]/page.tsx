/**
 * Legacy listing detail route.
 *
 * URL: /listing/[id]   e.g. /listing/507296e4-9441-4af8-80d7-788a036bf8fd
 *
 * This route is kept ALIVE — every existing share, email, OG snapshot, Stripe
 * receipt and external backlink to the old URL keeps working. It renders the
 * EXACT same content as the new SEO route at
 * `/auta/[brand]/[model]/[id]`, but the `<link rel="canonical">` always
 * points to the new URL so Google consolidates the SEO signal there.
 *
 * Both routes share `listing-detail-shared.tsx` — single source of truth for
 * metadata, JSON-LD and rendered HTML. Future changes to listing detail must
 * be made there, not here.
 */
import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";
import { buildListingUrl } from "@lib/seo/listing-url";
import { getListingById, getSimilarListings } from "./get-listing";
import {
  buildListingMetadata,
  renderListingDetailPage,
  renderListingNotFound,
} from "./listing-detail-shared";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const ENABLE_LEGACY_LISTING_REDIRECT =
  process.env.ENABLE_LEGACY_LISTING_REDIRECT !== "false";

function appendSearchParams(
  pathname: string,
  searchParams: Record<string, string | string[] | undefined>,
): string {
  const usp = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (typeof value === "string") {
      usp.set(key, value);
      continue;
    }
    if (Array.isArray(value)) {
      for (const item of value) usp.append(key, item);
    }
  }
  const qs = usp.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const listing = await getListingById(id);
  return buildListingMetadata(listing, id);
}

export const revalidate = 900;

export default async function ListingDetail({ params, searchParams }: Props) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const isEmbedded = resolvedSearchParams?.embedded === "1";
  const listing = await getListingById(id);

  if (!listing) return renderListingNotFound();

  // Optional redirect switch for migration rollout:
  // - OFF by default (canonical-first remains active)
  // - ON in preview/staging when we want to test hard redirects
  // Keep ALL iframe embeds on legacy URL to avoid breaking parent integrations,
  // including unknown third-party iframe consumers that may not add
  // `embedded=1`.
  if (ENABLE_LEGACY_LISTING_REDIRECT && !isEmbedded) {
    const nextPath = buildListingUrl({
      id: listing.id,
      brand: listing.brand,
      model: listing.model,
    });
    permanentRedirect(appendSearchParams(nextPath, resolvedSearchParams));
  }

  const similarListings = await getSimilarListings(listing, 6);
  return renderListingDetailPage({ listing, similarListings, isEmbedded });
}
