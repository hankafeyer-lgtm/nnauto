/**
 * SEO-friendly listing detail route.
 *
 * URL: /auta/[brand]/[model]/[id]
 *   e.g. /auta/skoda/octavia/507296e4-9441-4af8-80d7-788a036bf8fd
 *
 * Behaviour:
 *   - [id] is a FULL UUID, identical to the legacy `/listing/[id]` identifier.
 *   - The brand/model segments are SEO labels. They are NOT used as a hard
 *     filter for lookup. The listing is resolved by id only.
 *   - SELF-HEALING URL: if the brand/model slugs in the URL don't match the
 *     listing's actual brand/model (because the listing was edited after the
 *     URL was minted), we issue a permanent 301 redirect to the correct
 *     canonical URL. This keeps Google's link equity in one place and old
 *     bookmarks/shares keep working.
 *
 * This route renders the EXACT same content as the legacy `/listing/[id]`
 * route — both call into `listing-detail-shared.tsx`. The canonical metadata
 * always points here regardless of which URL the user landed on.
 */
import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";
import { normalizeSlug } from "@lib/seo/slug";
import { buildListingUrl } from "@lib/seo/listing-url";
import {
  getListingBySlugId,
  getSimilarListings,
} from "../../../../listing/[id]/get-listing";
import {
  buildListingMetadata,
  renderListingDetailPage,
  renderListingNotFound,
} from "../../../../listing/[id]/listing-detail-shared";

type Props = {
  params: Promise<{ brand: string; model: string; id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

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
  const listing = await getListingBySlugId(decodeURIComponent(id));
  return buildListingMetadata(listing, id);
}

export const revalidate = 900;

export default async function ListingDetailSeo({
  params,
  searchParams,
}: Props) {
  const { brand: urlBrand, model: urlModel, id: rawId } = await params;
  const slugOrId = decodeURIComponent(rawId);
  const resolvedSearchParams = await searchParams;
  const isEmbedded = resolvedSearchParams?.embedded === "1";
  const listing = await getListingBySlugId(slugOrId);

  if (!listing) return renderListingNotFound();

  // Self-healing redirect: if the incoming URL doesn't match the
  // listing's canonical slug (brand/model changed, or old UUID format),
  // issue a 301 to the current canonical. Keeps link equity consolidated.
  if (!isEmbedded) {
    const canonical = buildListingUrl({
      id: listing.id,
      brand: listing.brand,
      model: listing.model,
      year: listing.year,
    });
    const incomingPath = `/auta/${decodeURIComponent(urlBrand)}/${decodeURIComponent(urlModel)}/${slugOrId}`;
    if (incomingPath !== canonical) {
      permanentRedirect(appendSearchParams(canonical, resolvedSearchParams));
    }
  }

  const similarListings = await getSimilarListings(listing, 6);
  return renderListingDetailPage({ listing, similarListings, isEmbedded });
}
