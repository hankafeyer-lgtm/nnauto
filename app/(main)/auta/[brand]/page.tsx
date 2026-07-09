import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@lib/db";
import { listings } from "@shared/schema";
import { and, desc, eq, sql } from "drizzle-orm";
import { SITE_ORIGIN } from "@lib/seo/constants";
import {
  buildBreadcrumbJsonLd,
  buildBrandAggregateOfferJsonLd,
  buildCollectionPageJsonLd,
  buildFaqPageJsonLd,
  buildItemListJsonLd,
} from "@lib/seo/structured-data";
import {
  buildBrandFaq,
  buildBrandSeoIntro,
  getSimilarBrandLinks,
} from "@lib/seo/seo-content";
import JsonLd from "@lib/seo/JsonLd";
import { getListingMainTitleFromRow } from "@lib/seo/listing-title";
import {
  formatBrandDisplay,
} from "@lib/seo/brand-format";
import { normalizeSlug } from "@lib/seo/slug";
import { inzeratWord, formatCzk } from "@lib/seo/czech-format";
import { buildListingUrl } from "@lib/seo/listing-url";
import { getTopModelLinksForBrand, isTopModel } from "@lib/seo/top-models";
import {
  getFacetBySlug,
  isGlobalFacetSlug,
  buildGlobalFacetPath,
  getBrandFacetClusterLinks,
} from "@lib/seo/facets";
import {
  queryFacetListings,
  queryFacetStats,
  queryBrandCollectionStats,
} from "@lib/seo/facet-queries";
import {
  FacetCollectionPage,
  buildFacetPageMetadata,
} from "@lib/seo/FacetCollectionPage";
import { buildAggregateOfferJsonLd } from "@lib/seo/structured-data";
import { isSeoFeatureEnabled, shouldEmitFaqJsonLd } from "@lib/seo/features";
import { BrandBreadcrumb } from "@lib/seo/helpers/breadcrumb";
import { BrandListingGrid } from "@lib/seo/components/brand/BrandListingGrid";
import {
  BrandSeoIntro,
  BrandWhyChoose,
  BrandStatsBlock,
} from "@lib/seo/components/brand/BrandSeoIntro";
import { BrandFaq } from "@lib/seo/components/brand/BrandFaq";
import { BrandPopularModels } from "@lib/seo/components/brand/BrandPopularModels";
import { BrandNewestCars } from "@lib/seo/components/brand/BrandNewestCars";
import { BrandTopSearches } from "@lib/seo/components/brand/BrandTopSearches";
import { BrandCategories } from "@lib/seo/components/brand/BrandCategories";
import { BrandSimilarBrands } from "@lib/seo/components/brand/BrandSimilarBrands";

/**
 * SEO landing page per brand (e.g. /auta/bmw, /auta/audi).
 *
 * Goal: rank on Google / Seznam for queries like "BMW bazar", "prodej BMW",
 * "ojeté Audi" and pipe visitors into the real /listings?brand=xxx catalogue.
 *
 * The page is fully server-rendered with unique H1, human description, and
 * a plain <ul> of actual listings with anchor tags so crawlers see content
 * without executing JavaScript.
 */

export const revalidate = 900;

type Params = { brand: string };
type Props = {
  params: Promise<Params>;
};

async function queryBrandListings(brandSlug: string, limit = 30) {
  const norm = brandSlug.trim().toLowerCase();
  if (!norm) return [];
  try {
    return await db
      .select()
      .from(listings)
      .where(and(eq(listings.isSold, false), eq(listings.brand, norm)))
      .orderBy(desc(listings.updatedAt))
      .limit(limit);
  } catch (err) {
    console.error("[brand] queryBrandListings failed:", err);
    return [];
  }
}

/**
 * Models for this brand that have enough active inventory to deserve a
 * dedicated /auta/[brand]/[model] SEO page (≥3 listings — same threshold
 * the model page itself uses for indexing). Used to render a "Populární
 * modely" cross-link block so Google can discover model pages by crawling
 * the already-indexed brand page.
 */
async function queryPopularModels(brandSlug: string, limit = 50) {
  const norm = brandSlug.trim().toLowerCase();
  if (!norm) return [];
  try {
    const rows = await db
      .select({
        model: sql<string>`min(${listings.model})`,
        total: sql<number>`count(*)::int`,
      })
      .from(listings)
      .where(
        and(
          eq(listings.isSold, false),
          sql`lower(${listings.brand}) = ${norm}`,
        ),
      )
      .groupBy(sql`lower(${listings.model})`)
      .having(sql`count(*) >= 1`)
      .orderBy(desc(sql`count(*)`))
      .limit(limit);
    return rows.filter((r) => Boolean(r.model));
  } catch (err) {
    console.error("[brand] queryPopularModels failed:", err);
    return [];
  }
}

async function queryBrandStats(brandSlug: string) {
  const norm = brandSlug.trim().toLowerCase();
  try {
    const [row] = await db
      .select({
        total: sql<number>`count(*)::int`,
        minPrice: sql<number>`min(price::numeric)::int`,
        maxPrice: sql<number>`max(price::numeric)::int`,
      })
      .from(listings)
      .where(and(eq(listings.isSold, false), sql`lower(${listings.brand}) = ${norm}`));
    return { total: row?.total ?? 0, minPrice: row?.minPrice ?? 0, maxPrice: row?.maxPrice ?? 0 };
  } catch (err) {
    console.error("[brand] queryBrandStats failed:", err);
    return { total: 0, minPrice: 0, maxPrice: 0 };
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { brand } = await params;
  const brandSlug = decodeURIComponent(brand).toLowerCase();

  if (isGlobalFacetSlug(brandSlug)) {
    if (!isSeoFeatureEnabled("facetPages")) notFound();
    const facet = getFacetBySlug(brandSlug);
    if (!facet) return { title: "NNAuto" };
    const stats = await queryFacetStats(facet);
    return buildFacetPageMetadata(
      facet,
      stats,
      `${SITE_ORIGIN}${buildGlobalFacetPath(facet.slug)}`,
    );
  }

  const brandName = formatBrandDisplay(brandSlug);
  const stats = await queryBrandStats(brandSlug);
  const hasAny = stats.total > 0;
  const fromPart =
    stats.minPrice && stats.minPrice > 0 ? ` od ${formatCzk(stats.minPrice)}` : "";
  const title = hasAny
    ? `${brandName} na prodej – ${stats.total} ${inzeratWord(stats.total)}${fromPart} | NNAuto`
    : `${brandName} na prodej | NNAuto`;
  const description = hasAny
    ? `Aktuálně ${stats.total} ${inzeratWord(stats.total)} ${brandName}${fromPart}. Ojeté vozy ${brandName} od soukromých prodejců i autobazarů v ČR – ceny, fotografie a parametry na NNAuto.cz.`
    : `Aktuální nabídka ${brandName} na NNAuto – prémiovém marketplace automobilů v ČR.`;
  const canonical = `${SITE_ORIGIN}/auta/${encodeURIComponent(brand.toLowerCase())}`;

  return {
    title,
    description,
    alternates: { canonical },
    robots: hasAny ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "NNAuto",
      locale: "cs_CZ",
      type: "website",
      images: [
        {
          url: `${SITE_ORIGIN}/og-image.png`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${SITE_ORIGIN}/og-image.png`],
    },
    keywords: [
      brandName,
      `${brandName} prodej`,
      `${brandName} bazar`,
      `ojeté ${brandName}`,
      `${brandName} levně`,
      `${brandName} Praha`,
      `${brandName} Brno`,
      `${brandName} Ostrava`,
      "autobazar",
      "prodej aut",
      "NNAuto",
    ].join(", "),
  };
}

export default async function BrandLandingPage({ params }: Props) {
  const { brand } = await params;
  const brandSlug = decodeURIComponent(brand).toLowerCase();

  if (isGlobalFacetSlug(brandSlug)) {
    if (!isSeoFeatureEnabled("facetPages")) notFound();
    const facet = getFacetBySlug(brandSlug);
    if (!facet) notFound();
    const [rows, stats] = await Promise.all([
      queryFacetListings(facet, undefined, 30),
      queryFacetStats(facet),
    ]);
    if (stats.total === 0) notFound();
    return (
      <FacetCollectionPage
        facet={facet}
        rows={rows}
        stats={stats}
        canonical={`${SITE_ORIGIN}${buildGlobalFacetPath(facet.slug)}`}
      />
    );
  }

  const brandName = formatBrandDisplay(brandSlug);
  const [rows, popularModels, brandStats] = await Promise.all([
    queryBrandListings(brandSlug, 30),
    queryPopularModels(brandSlug, 12),
    queryBrandStats(brandSlug),
  ]);

  if (!rows.length) {
    // No listings yet for this brand — still render a SEO-friendly page so
    // Google can index it and we own the keyword. When first listing appears
    // the page upgrades automatically on next revalidation.
    return (
      <main className="container mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">
          {brandName} na NNAuto
        </h1>
        <p className="text-muted-foreground mb-6">
          Momentálně nejsou v nabídce žádné inzeráty značky {brandName}.
          Podívejte se na celý katalog nebo vložte vlastní inzerát.
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href="/listings"
            className="rounded-md border px-4 py-2 hover:bg-accent"
          >
            Všechny inzeráty
          </a>
          <a
            href="/add-listing"
            className="rounded-md bg-[#B8860B] text-white px-4 py-2"
          >
            Přidat inzerát
          </a>
        </div>
      </main>
    );
  }

  const canonical = `${SITE_ORIGIN}/auta/${encodeURIComponent(brandSlug)}`;

  const seen = new Set<string>();
  const dedupedModels = popularModels
    .map((m) => ({ ...m, slug: normalizeSlug(m.model) }))
    .filter((m) => {
      if (!m.slug || seen.has(m.slug)) return false;
      seen.add(m.slug);
      return true;
    })
    .sort((a, b) => {
      const at = isTopModel(brandSlug, a.slug) ? 0 : 1;
      const bt = isTopModel(brandSlug, b.slug) ? 0 : 1;
      return at - bt;
    });

  const prices = rows.map((l) => Number(l.price)).filter((p) => p > 0).sort((a, b) => a - b);
  const years = rows.map((l) => l.year).filter(Boolean).sort() as number[];
  const fuels = new Map<string, number>();
  for (const l of rows) {
    const f = Array.isArray(l.fuelType) ? l.fuelType[0] : null;
    if (f) fuels.set(f, (fuels.get(f) ?? 0) + 1);
  }

  const seoStats = {
    total: brandStats.total,
    minPrice: brandStats.minPrice || prices[0],
    maxPrice: brandStats.maxPrice || prices[prices.length - 1],
    minYear: years[0],
    maxYear: years[years.length - 1],
    topFuels: [...fuels.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([name, count]) => ({ name, count })),
    popularModels: dedupedModels.map((m) => ({
      name: m.model,
      slug: m.slug,
      count: m.total,
    })),
  };

  const introParagraphs = buildBrandSeoIntro(brandSlug, seoStats);
  const faqItems = buildBrandFaq(brandSlug, seoStats);
  const similarBrands = getSimilarBrandLinks(brandSlug);

  const itemListEntries = rows.map((l) => ({
    name: getListingMainTitleFromRow(l),
    url: `${SITE_ORIGIN}${buildListingUrl({
      id: l.id,
      brand: l.brand,
      model: l.model,
    })}`,
  }));

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "NNAuto", url: `${SITE_ORIGIN}/` },
    { name: "Auta", url: `${SITE_ORIGIN}/auta` },
    { name: brandName, url: canonical },
  ]);

  const collectionJsonLd = buildCollectionPageJsonLd({
    name: `${brandName} na prodej`,
    description: `Aktuální nabídka ojetých vozů ${brandName} na NNAuto.cz`,
    url: canonical,
    items: itemListEntries,
  });

  const itemListJsonLd = buildItemListJsonLd(
    `${brandName} – inzeráty na NNAuto`,
    itemListEntries,
    rows.length,
  );

  const faqJsonLd = shouldEmitFaqJsonLd("brandFaq")
    ? buildFaqPageJsonLd(faqItems)
    : null;
  const aggregateJsonLd = buildBrandAggregateOfferJsonLd({
    brandName,
    total: brandStats.total,
    minPrice: brandStats.minPrice,
    maxPrice: brandStats.maxPrice,
  });
  const collectionStats = await queryBrandCollectionStats(brandSlug);
  const enhancedAggregate = buildAggregateOfferJsonLd({
    name: `${brandName} na prodej`,
    stats: collectionStats,
  });
  const brandFacetLinks = getBrandFacetClusterLinks(brandSlug, brandName);

  return (
    <main className="container mx-auto max-w-6xl px-4 py-8">
      <JsonLd data={collectionJsonLd} />
      <JsonLd data={itemListJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      {faqJsonLd ? <JsonLd data={faqJsonLd} /> : null}
      {aggregateJsonLd ? <JsonLd data={aggregateJsonLd} /> : null}
      {enhancedAggregate ? <JsonLd data={enhancedAggregate} /> : null}

      <BrandBreadcrumb brandName={brandName} brandSlug={brandSlug} />

      <h1 className="text-3xl md:text-4xl font-bold mb-3">
        {brandName} na prodej
      </h1>
      <p className="text-muted-foreground max-w-3xl mb-6">
        Ověřené inzeráty značky <strong>{brandName}</strong> na NNAuto –
        prémiovém marketplace automobilů v ČR. Máme aktuálně{" "}
        <strong>{rows.length}+</strong> vozů {brandName} od soukromých prodejců
        i autobazarů. Filtrujte podle roku, ceny, najetých km, paliva nebo
        regionu a kontaktujte prodejce přímo bez mezičlánků.
      </p>

      <div className="mb-6 flex flex-wrap gap-2">
        <a
          href={`/listings?brand=${encodeURIComponent(brandSlug)}`}
          className="rounded-md bg-[#B8860B] text-white px-4 py-2 text-sm font-medium"
        >
          Otevřít kompletní filtr
        </a>
        <a
          href="/listings"
          className="rounded-md border px-4 py-2 text-sm hover:bg-accent"
        >
          Všechny značky
        </a>
        <a
          href="/add-listing"
          className="rounded-md border px-4 py-2 text-sm hover:bg-accent"
        >
          Přidat inzerát
        </a>
      </div>

      <h2 className="text-xl font-semibold mb-3">
        Aktuální nabídka {brandName}
      </h2>
      <BrandListingGrid rows={rows} />

      <BrandSeoIntro brandName={brandName} paragraphs={introParagraphs} />
      <BrandFaq brandName={brandName} items={faqItems} />
      <BrandWhyChoose brandName={brandName} brandSlug={brandSlug} />
      <BrandStatsBlock
        brandName={brandName}
        stats={{ rows, popularModels: dedupedModels }}
      />
      <BrandPopularModels
        brandSlug={brandSlug}
        brandName={brandName}
        models={dedupedModels}
      />
      <BrandNewestCars brandName={brandName} rows={rows} />
      <BrandTopSearches
        brandName={brandName}
        links={getTopModelLinksForBrand(brandSlug)}
      />
      <BrandCategories brandName={brandName} links={brandFacetLinks} />
      <BrandSimilarBrands links={similarBrands} />
    </main>
  );
}
