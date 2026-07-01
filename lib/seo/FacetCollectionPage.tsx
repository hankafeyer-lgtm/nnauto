import JsonLd from "@lib/seo/JsonLd";
import { SITE_ORIGIN } from "@lib/seo/constants";
import {
  buildBreadcrumbJsonLd,
  buildCollectionPageJsonLd,
  buildFaqPageJsonLd,
  buildAggregateOfferJsonLd,
  buildItemListJsonLd,
} from "@lib/seo/structured-data";
import { formatBrandDisplay, formatVehicleTitle, formatVehicleCardHeading } from "@lib/seo/brand-format";
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

type ListingRow = typeof listings.$inferSelect;

const titleCaseRegion = (s: string) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1) : s;

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

  return (
    <main className="container mx-auto max-w-6xl px-4 py-8">
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

      <h2 className="text-xl font-semibold mb-3 mt-6">Aktuální nabídka</h2>
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {rows.map((l) => {
          const img = l.photos?.[0]
            ? `${SITE_ORIGIN}/img/${l.photos[0].replace(/^\/+/, "")}?w=800&q=75&f=webp`
            : null;
          const price = l.price
            ? `${Number(l.price).toLocaleString("cs-CZ")} Kč`
            : "";
          return (
            <li key={l.id} className="rounded-lg border bg-card overflow-hidden">
              <a
                href={buildListingUrl({
                  id: l.id,
                  brand: l.brand,
                  model: l.model,
                  year: l.year,
                })}
                className="block group"
              >
                {img ? (
                  <img
                    src={img}
                    alt={formatVehicleTitle(l.brand, l.model, l.year)}
                    className="w-full h-48 object-cover"
                    loading="lazy"
                    decoding="async"
                    width={800}
                    height={480}
                  />
                ) : (
                  <div className="w-full h-48 bg-muted" aria-hidden="true" />
                )}
                <div className="p-3 space-y-1">
                  <h3 className="font-semibold group-hover:underline">
                    {formatVehicleCardHeading(l.brand, l.model)}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {[
                      l.year,
                      l.mileage
                        ? `${l.mileage.toLocaleString("cs-CZ")} km`
                        : "",
                      l.region ? titleCaseRegion(String(l.region)) : "",
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  <p className="font-semibold text-[#B8860B]">{price}</p>
                </div>
              </a>
            </li>
          );
        })}
      </ul>

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
          <h2 className="text-xl font-semibold mb-3">Související kategorie</h2>
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
    </main>
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
