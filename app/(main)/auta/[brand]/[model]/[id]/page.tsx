/**
 * SEO-friendly listing detail route.
 *
 * URL: /auta/[brand]/[model]/[slug]
 *   e.g. /auta/skoda/octavia/skoda-octavia-2018-507296e4
 *
 * Behaviour:
 *   - [slug] ends with the first 8 hex chars of the listing UUID; full UUIDs
 *     in the path still resolve for backwards compatibility.
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
import { SITE_ORIGIN } from "@lib/seo/constants";
import { buildListingUrl } from "@lib/seo/listing-url";
import { getFacetBySlug } from "@lib/seo/facets";
import {
  queryCombinedFacetListings,
  queryCombinedFacetStats,
} from "@lib/seo/facet-queries";
import {
  CombinedFacetCollectionPage,
  buildCombinedFacetMetadata,
} from "@lib/seo/CombinedFacetCollectionPage";
import {
  buildModelFacetRelatedLinks,
  isModelFacet,
  modelFacetPath,
} from "@lib/seo/seo-combinations";
import {
  getDealerInventoryForListing,
  getDealerProfileForListing,
  getListingBySlugId,
  getSimilarListings,
} from "../../../../listing/[id]/get-listing";
import {
  buildListingMetadata,
  renderListingDetailPage,
  renderListingNotFound,
} from "../../../../listing/[id]/listing-detail-shared";
import { safeDecodeURIComponent } from "@lib/safe-decode";

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
  const { brand, model, id } = await params;
  const brandSlug = normalizeSlug(safeDecodeURIComponent(brand));
  const modelSlug = normalizeSlug(safeDecodeURIComponent(model));
  const slugOrId = safeDecodeURIComponent(id);
  const facet = getFacetBySlug(normalizeSlug(slugOrId));
  if (isModelFacet(facet)) {
    const stats = await queryCombinedFacetStats([facet], {
      brandSlug,
      modelSlug,
    });
    const canonicalPath = modelFacetPath(brandSlug, modelSlug, facet);
    return buildCombinedFacetMetadata(
      { type: "modelFacet", brandSlug, modelSlug, facet },
      stats,
      `${SITE_ORIGIN}${canonicalPath}`,
    );
  }

  const listing = await getListingBySlugId(slugOrId);
  return buildListingMetadata(listing, id);
}

export const revalidate = 900;

export default async function ListingDetailSeo({
  params,
  searchParams,
}: Props) {
  const { brand: urlBrand, model: urlModel, id: rawId } = await params;
  const brandSlug = normalizeSlug(safeDecodeURIComponent(urlBrand));
  const modelSlug = normalizeSlug(safeDecodeURIComponent(urlModel));
  const slugOrId = safeDecodeURIComponent(rawId);
  const resolvedSearchParams = await searchParams;
  const isEmbedded = resolvedSearchParams?.embedded === "1";
  const facet = getFacetBySlug(normalizeSlug(slugOrId));

  if (isModelFacet(facet)) {
    const canonicalPath = modelFacetPath(brandSlug, modelSlug, facet);
    if (canonicalPath !== `/auta/${brandSlug}/${modelSlug}/${facet.slug}`) {
      permanentRedirect(canonicalPath);
    }
    const [rows, stats] = await Promise.all([
      queryCombinedFacetListings([facet], { brandSlug, modelSlug }, 30),
      queryCombinedFacetStats([facet], { brandSlug, modelSlug }),
    ]);
    return (
      <CombinedFacetCollectionPage
        scope={{ type: "modelFacet", brandSlug, modelSlug, facet }}
        rows={rows}
        stats={stats}
        canonical={`${SITE_ORIGIN}${canonicalPath}`}
        relatedLinks={buildModelFacetRelatedLinks(brandSlug, modelSlug, facet)}
      />
    );
  }

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
    const incomingPath = `/auta/${safeDecodeURIComponent(urlBrand)}/${safeDecodeURIComponent(urlModel)}/${slugOrId}`;
    if (incomingPath !== canonical) {
      permanentRedirect(appendSearchParams(canonical, resolvedSearchParams));
    }
  }

  const [similarListings, dealerProfile, dealerInventory] = await Promise.all([
    getSimilarListings(listing, 6),
    getDealerProfileForListing(listing),
    getDealerInventoryForListing(listing, 8),
  ]);
  return renderListingDetailPage({
    listing,
    similarListings,
    dealerProfile,
    dealerInventory,
    isEmbedded,
  });
}
