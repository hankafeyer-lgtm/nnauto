import JsonLd from "@lib/seo/JsonLd";
import { SITE_ORIGIN } from "@lib/seo/constants";
import {
  buildBreadcrumbJsonLd,
  buildCollectionPageJsonLd,
  buildFaqPageJsonLd,
  buildAggregateOfferJsonLd,
  buildItemListJsonLd,
} from "@lib/seo/structured-data";
import { formatBrandDisplay } from "@lib/seo/brand-format";
import { buildListingUrl } from "@lib/seo/listing-url";
import { getListingMainTitleFromRow } from "@lib/seo/listing-title";
import {
  buildFacetDescription,
  buildFacetH1,
  buildFacetTitle,
  getBrandFacetClusterLinks,
  getRelatedFacetLinks,
  MIN_FACET_LISTINGS,
  type FacetDefinition,
} from "@lib/seo/facets";
import {
  buildFacetFaq,
  buildFacetSeoIntro,
} from "@lib/seo/facet-content";
import type { CollectionStats } from "@lib/seo/facet-queries";
import type { listings } from "@shared/schema";
import { SeoHubLinks } from "./SeoHubLinks";
import { isSeoFeatureEnabled, isSeoTextsConfigured, isSeoTextsEnabled } from "@lib/seo/features";
import {
  CollectionInternalLinkBlocks,
  CollectionVehicleJsonLd,
} from "@lib/seo/CollectionInternalLinkBlocks";
import SeoCatalogClient from "@lib/seo/components/SeoCatalogClient";
import SeoCatalogFooter from "@lib/seo/components/SeoCatalogFooter";
import { filtersForFacet } from "@lib/seo/catalog-filter-defaults";

type ListingRow = typeof listings.$inferSelect;

export type FacetCollectionPageProps = {
  facet: FacetDefinition;
  brandSlug?: string;
  rows: ListingRow[];
  stats: CollectionStats;
  canonical: string;
};

export function FacetCollectionPage({
  facet,
  brandSlug,
  rows,
  stats,
  canonical,
}: FacetCollectionPageProps) {
  if (!isSeoFeatureEnabled("facetPages")) return null;

  const brandName = brandSlug ? formatBrandDisplay(brandSlug) : undefined;
  const h1 = buildFacetH1(facet, brandName);
  const intro = buildFacetSeoIntro(facet, stats, brandName);
  const faq = buildFacetFaq(facet, stats, brandName);
  const relatedFacets = getRelatedFacetLinks(facet, brandSlug);
  const brandClusters = brandSlug
    ? getBrandFacetClusterLinks(brandSlug, brandName!)
    : [];

  const itemEntries = rows.map((l) => ({
    name: getListingMainTitleFromRow(l),
    url: `${SITE_ORIGIN}${buildListingUrl({
      id: l.id,
      brand: l.brand,
      model: l.model,
      year: l.year,
    })}`,
  }));

  const breadcrumbs = brandSlug
    ? [
        { name: "NNAuto", url: `${SITE_ORIGIN}/` },
        ...(isSeoFeatureEnabled("autoHub")
          ? [{ name: "Auta", url: `${SITE_ORIGIN}/auta` }]
          : []),
        { name: brandName!, url: `${SITE_ORIGIN}/auta/${brandSlug}` },
        { name: facet.shortLabel },
      ]
    : [
        { name: "NNAuto", url: `${SITE_ORIGIN}/` },
        ...(isSeoFeatureEnabled("autoHub")
          ? [{ name: "Auta", url: `${SITE_ORIGIN}/auta` }]
          : []),
        { name: facet.shortLabel },
      ];

  const collectionName = brandName
    ? `${brandName} ${facet.label} na prodej`
    : buildFacetH1(facet);
  const defaultFilters = {
    ...filtersForFacet(facet),
    ...(brandSlug ? { brand: brandSlug } : {}),
  };

  return (
    <>
      <JsonLd data={buildBreadcrumbJsonLd(breadcrumbs)} />
      <JsonLd
        data={buildCollectionPageJsonLd({
          name: collectionName,
          description: buildFacetDescription(facet, stats.total, brandName),
          url: canonical,
          items: itemEntries,
          stats,
        })}
      />
      <JsonLd data={buildItemListJsonLd(collectionName, itemEntries, stats.total)} />
      <CollectionVehicleJsonLd rows={rows} />
      {(() => {
        const agg = buildAggregateOfferJsonLd({
          name: collectionName,
          stats,
        });
        return agg ? <JsonLd data={agg} /> : null;
      })()}
      {isSeoTextsConfigured() && buildFaqPageJsonLd(faq) ? (
        <JsonLd data={buildFaqPageJsonLd(faq)} />
      ) : null}

      <SeoCatalogClient defaultFilters={defaultFilters} />

      <section className="container mx-auto max-w-6xl px-4 pb-12 pt-4">
      <nav
        className="text-sm text-muted-foreground mb-4 flex flex-wrap gap-1"
        aria-label="Breadcrumb"
      >
        <a href="/" className="hover:underline">
          NNAuto
        </a>
        <span>/</span>
        {isSeoFeatureEnabled("autoHub") ? (
          <>
            <a href="/auta" className="hover:underline">
              Auta
            </a>
            <span>/</span>
          </>
        ) : null}
        {brandSlug ? (
          <>
            <span>/</span>
            <a href={`/auta/${brandSlug}`} className="hover:underline">
              {brandName}
            </a>
          </>
        ) : null}
        <span>/</span>
        <span className="text-foreground font-medium">{facet.shortLabel}</span>
      </nav>

      <h1 className="text-3xl md:text-4xl font-bold mb-3">{h1}</h1>

      {stats.total >= MIN_FACET_LISTINGS ? (
        <p className="text-muted-foreground max-w-3xl mb-4">
          Aktuálně <strong>{stats.total}</strong> inzerátů
          {stats.minPrice && stats.maxPrice ? (
            <>
              {" "}
              v cenách <strong>{stats.minPrice.toLocaleString("cs-CZ")}–{stats.maxPrice.toLocaleString("cs-CZ")} Kč</strong>
            </>
          ) : null}
          {stats.avgPrice ? (
            <>
              , průměr <strong>{stats.avgPrice.toLocaleString("cs-CZ")} Kč</strong>
            </>
          ) : null}
          .
        </p>
      ) : null}

      <SeoHubLinks
        links={[
          { label: "Katalog inzerátů", href: "/listings" },
          ...(brandSlug
            ? [{ label: `Vše ${brandName}`, href: `/auta/${brandSlug}` }]
            : [{ label: "Všechny značky", href: "/auta" }]),
        ]}
      />

      {isSeoTextsEnabled() ? (
        <section className="mt-10 prose max-w-none text-muted-foreground space-y-4">
          {intro.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </section>
      ) : null}

      {isSeoTextsEnabled() ? (
        <section className="mt-10" aria-labelledby="facet-faq">
          <h2 id="facet-faq" className="text-xl font-semibold mb-4">
            Časté dotazy
          </h2>
          <dl className="space-y-4">
            {faq.map((item) => (
              <div key={item.question}>
                <dt className="font-medium text-foreground">{item.question}</dt>
                <dd className="mt-1 text-muted-foreground">{item.answer}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      {isSeoFeatureEnabled("brandCategories") && relatedFacets.length ? (
        <section className="mt-10">
          <h2 className="text-xl font-semibold mb-3">Související vyhledávání</h2>
          <SeoHubLinks links={relatedFacets} />
        </section>
      ) : null}

      {isSeoFeatureEnabled("brandCategories") && brandClusters.length ? (
        <section className="mt-8">
          <h2 className="text-lg font-semibold mb-2">
            Další kategorie {brandName}
          </h2>
          <SeoHubLinks links={brandClusters} />
        </section>
      ) : null}

      <CollectionInternalLinkBlocks
        rows={rows}
        brandSlug={brandSlug}
      />
      </section>

      <SeoCatalogFooter />
    </>
  );
}

export function buildFacetPageMetadata(
  facet: FacetDefinition,
  stats: CollectionStats,
  canonical: string,
  brandSlug?: string,
): import("next").Metadata {
  const brandName = brandSlug ? formatBrandDisplay(brandSlug) : undefined;
  const title = buildFacetTitle(facet, brandName);
  const description = buildFacetDescription(facet, stats.total, brandName);
  const indexable = stats.total >= MIN_FACET_LISTINGS;

  return {
    title,
    description,
    alternates: { canonical },
    robots: indexable
      ? { index: true, follow: true }
      : { index: false, follow: true },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "NNAuto",
      locale: "cs_CZ",
      type: "website",
      images: [{ url: `${SITE_ORIGIN}/og-image.png`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${SITE_ORIGIN}/og-image.png`],
    },
  };
}
