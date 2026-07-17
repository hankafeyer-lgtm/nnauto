import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@lib/db";
import { listings } from "@shared/schema";
import { and, desc, eq, sql, type SQL } from "drizzle-orm";
import { SITE_ORIGIN } from "@lib/seo/constants";
import JsonLd from "@lib/seo/JsonLd";
import {
  buildBreadcrumbJsonLd,
  buildCollectionPageJsonLd,
  buildFaqPageJsonLd,
  buildItemListJsonLd,
} from "@lib/seo/structured-data";
import {
  buildModelFaq,
  buildModelSeoIntro,
  buildModelWatchOut,
  buildModelWhyBuy,
  getPriorityModelSeo,
  getSimilarModelLinks,
  getSimilarPriceLink,
} from "@lib/seo/seo-content";
import {
  formatBrandDisplay,
  formatModelDisplay,
  formatVehicleTitle,
} from "@lib/seo/brand-format";
import { normalizeSlug, slugVariants } from "@lib/seo/slug";
import { getModelMetadataOverride } from "@lib/seo/model-metadata-overrides";
import { inzeratWord, formatCzk } from "@lib/seo/czech-format";
import {
  getFacetBySlug,
  isGlobalFacetSlug,
  isBrandFacetSlug,
  getBrandFacetClusterLinks,
} from "@lib/seo/facets";
import {
  countModelListingsWithVariants,
  queryCombinedFacetListings,
  queryCombinedFacetStats,
  queryFacetListings,
  queryFacetStats,
  queryModelCollectionStats,
} from "@lib/seo/facet-queries";
import {
  FacetCollectionPage,
  buildFacetPageMetadata,
} from "@lib/seo/FacetCollectionPage";
import {
  CombinedFacetCollectionPage,
  buildCombinedFacetMetadata,
} from "@lib/seo/CombinedFacetCollectionPage";
import {
  buildFacetPairRelatedLinks,
  facetPairPath,
  getFacetPairBySlugs,
} from "@lib/seo/seo-combinations";
import { buildAggregateOfferJsonLd } from "@lib/seo/structured-data";
import { buildListingUrl } from "@lib/seo/listing-url";
import { isSeoFeatureEnabled, shouldEmitFaqJsonLd } from "@lib/seo/features";
import { ModelBreadcrumb } from "@lib/seo/helpers/breadcrumb";
import { ModelListingGrid } from "@lib/seo/components/model/ModelListingGrid";
import {
  ModelSeoIntroParagraphs,
  ModelWhyBuy,
  ModelWatchOut,
} from "@lib/seo/components/model/ModelSeoIntro";
import { ModelFaq } from "@lib/seo/components/model/ModelFaq";
import { ModelLegacySeoBlock } from "@lib/seo/components/model/ModelLegacySeoBlock";
import {
  ModelSiblingModels,
  ModelSimilarModels,
  ModelSimilarPrice,
  ModelCategories,
  ModelFacetSearchLinks,
  ModelRelatedNav,
} from "@lib/seo/components/model/ModelRelatedModels";

/**
 * Model-level SEO landing page (e.g. /auta/skoda/octavia, /auta/bmw/3-series).
 *
 * - Indexable when there are at least MIN_INDEX listings
 * - noindex,follow when there are 1–2 listings (keeps the page reachable but
 *   keeps thin pages out of the index)
 * - 404 when there are no active listings — the page should not exist
 *
 * Canonical points back to itself, so this is the canonical SEO surface for
 * the brand+model combination. The /listings?brand=...&model=... view is
 * separately marked `noindex,follow` from `app/(main)/listings/page.tsx`.
 */

export const revalidate = 3600;

const MIN_INDEX = 3;
const LIST_LIMIT = 30;

type Params = { brand: string; model: string };
type Props = { params: Promise<Params> };

function slugSql(valueSql: SQL): SQL {
  return sql`trim(both '-' from regexp_replace(lower(translate(${valueSql}::text, 'áčďéěíňóřšťúůýžÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ', 'acdeeinorstuuyzACDEEINORSTUUYZ')), '[^a-z0-9]+', '-', 'g'))`;
}

function decodeAndNormalize(raw: string): string {
  try {
    return normalizeSlug(decodeURIComponent(raw));
  } catch {
    return normalizeSlug(raw);
  }
}

async function queryModelListings(
  brandSlug: string,
  modelSlug: string,
  limit = LIST_LIMIT,
) {
  if (!brandSlug || !modelSlug) return [];
  const variants = slugVariants(modelSlug).map(normalizeSlug);
  if (!variants.length) return [];
  return db
    .select()
    .from(listings)
    .where(
      and(
        eq(listings.isSold, false),
        sql`${slugSql(sql`${listings.brand}`)} = ${normalizeSlug(brandSlug)}`,
        sql`${slugSql(sql`${listings.model}`)} in (${sql.join(
          variants.map((v) => sql`${v}`),
          sql`, `,
        )})`,
      ),
    )
    .orderBy(desc(listings.updatedAt))
    .limit(limit);
}

async function countModelListings(
  brandSlug: string,
  modelSlug: string,
): Promise<number> {
  return countModelListingsWithVariants(brandSlug, modelSlug);
}

async function priceRange(
  brandSlug: string,
  modelSlug: string,
): Promise<{ min: number | null; max: number | null }> {
  if (!brandSlug || !modelSlug) return { min: null, max: null };
  const variants = slugVariants(modelSlug).map(normalizeSlug);
  if (!variants.length) return { min: null, max: null };
  const rows = await db
    .select({
      min: sql<number | null>`min(${listings.price})::int`,
      max: sql<number | null>`max(${listings.price})::int`,
    })
    .from(listings)
    .where(
      and(
        eq(listings.isSold, false),
        sql`${slugSql(sql`${listings.brand}`)} = ${normalizeSlug(brandSlug)}`,
        sql`${slugSql(sql`${listings.model}`)} in (${sql.join(
          variants.map((v) => sql`${v}`),
          sql`, `,
        )})`,
      ),
    );
  return { min: rows[0]?.min ?? null, max: rows[0]?.max ?? null };
}

async function yearRange(
  brandSlug: string,
  modelSlug: string,
): Promise<{ min: number | null; max: number | null }> {
  if (!brandSlug || !modelSlug) return { min: null, max: null };
  const variants = slugVariants(modelSlug).map(normalizeSlug);
  if (!variants.length) return { min: null, max: null };
  const rows = await db
    .select({
      min: sql<number | null>`min(${listings.year})::int`,
      max: sql<number | null>`max(${listings.year})::int`,
    })
    .from(listings)
    .where(
      and(
        eq(listings.isSold, false),
        sql`${slugSql(sql`${listings.brand}`)} = ${normalizeSlug(brandSlug)}`,
        sql`${slugSql(sql`${listings.model}`)} in (${sql.join(
          variants.map((v) => sql`${v}`),
          sql`, `,
        )})`,
      ),
    );
  return { min: rows[0]?.min ?? null, max: rows[0]?.max ?? null };
}

async function querySiblingModels(
  brandSlug: string,
  excludeModelSlug: string,
  limit = 8,
) {
  if (!brandSlug || !excludeModelSlug) return [];
  return db
    .select({
      model: sql<string>`min(${listings.model})`,
      total: sql<number>`count(*)::int`,
    })
    .from(listings)
    .where(
      and(
        eq(listings.isSold, false),
        sql`${slugSql(sql`${listings.brand}`)} = ${normalizeSlug(brandSlug)}`,
        sql`${slugSql(sql`${listings.model}`)} != ${normalizeSlug(excludeModelSlug)}`,
      ),
    )
    .groupBy(sql`lower(${listings.model})`)
    .orderBy(desc(sql`count(*)`))
    .limit(limit);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { brand, model } = await params;
  const brandSlug = decodeAndNormalize(brand);
  const modelSlug = decodeAndNormalize(model);

  const facetPair = getFacetPairBySlugs(brandSlug, modelSlug);
  if (facetPair) {
    if (!isSeoFeatureEnabled("facetPages")) notFound();
    const canonicalPath = facetPairPath(facetPair);
    if (canonicalPath !== `/auta/${brandSlug}/${modelSlug}`) notFound();
    const stats = await queryCombinedFacetStats(facetPair);
    return buildCombinedFacetMetadata(
      { type: "facetPair", facets: facetPair },
      stats,
      `${SITE_ORIGIN}${canonicalPath}`,
    );
  }
  if (isGlobalFacetSlug(brandSlug)) notFound();

  if (isBrandFacetSlug(modelSlug)) {
    if (!isSeoFeatureEnabled("facetPages")) notFound();
    const modelCount = await countModelListingsWithVariants(brandSlug, modelSlug);
    if (modelCount === 0) {
      const facet = getFacetBySlug(modelSlug);
      if (facet) {
        const stats = await queryFacetStats(facet, brandSlug);
        return buildFacetPageMetadata(
          facet,
          stats,
          `${SITE_ORIGIN}/auta/${brandSlug}/${facet.slug}`,
          brandSlug,
        );
      }
    }
  }

  const brandName = formatBrandDisplay(brandSlug);
  const modelName = formatModelDisplay(modelSlug);
  const total = await countModelListings(brandSlug, modelSlug);

  // Fetch the lowest price so the title/description can advertise "od X Kč"
  // (a stronger click magnet in the SERP than a generic label).
  const price = total >= MIN_INDEX
    ? await priceRange(brandSlug, modelSlug)
    : { min: null, max: null };
  const fromPart =
    price.min !== null && price.min > 0 ? ` od ${formatCzk(price.min)}` : "";

  const canonical = `${SITE_ORIGIN}/auta/${brandSlug}/${modelSlug}`;
  const metadataSeo =
    getModelMetadataOverride(brandSlug, modelSlug) ??
    getPriorityModelSeo(brandSlug, modelSlug);
  const title = metadataSeo
    ? total
      ? `${metadataSeo.titleKeyword} – ${total} ${inzeratWord(total)}${fromPart} | NNAuto`
      : `${metadataSeo.titleKeyword} | NNAuto`
    : total
      ? `${brandName} ${modelName} na prodej – ${total} ${inzeratWord(total)}${fromPart} | NNAuto`
      : `${brandName} ${modelName} na prodej | NNAuto`;
  const description = metadataSeo
    ? total
      ? `${metadataSeo.descriptionLead} ${total} ${inzeratWord(total)}${fromPart}, fotografie, výbava a kontakt přímo na prodejce.`
      : `${metadataSeo.descriptionLead} Online autobazar NNAuto.cz.`
    : total
      ? `Aktuálně ${total} ${inzeratWord(total)} ${brandName} ${modelName}${fromPart}. Ověřené ojeté vozy od soukromých prodejců i autobazarů v ČR – ceny, fotografie a parametry. Kontaktujte prodejce přímo.`
      : `Nabídka ${brandName} ${modelName} na NNAuto – online autobazar v České republice.`;

  const robots: Metadata["robots"] =
    total >= MIN_INDEX
      ? { index: true, follow: true }
      : { index: false, follow: true };

  return {
    title,
    description,
    robots,
    alternates: { canonical },
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
      `${brandName} ${modelName}`,
      ...(metadataSeo
        ? [metadataSeo.searchPhrase, metadataSeo.titleKeyword]
        : []),
      `prodej ${brandName} ${modelName}`,
      `${brandName} ${modelName} bazar`,
      `ojeté ${brandName} ${modelName}`,
      `${brandName} ${modelName} levně`,
      `${brandName} ${modelName} Praha`,
      `${brandName} ${modelName} Brno`,
      "autobazar",
      "prodej aut",
      "NNAuto",
    ].join(", "),
  };
}

export default async function BrandModelLandingPage({ params }: Props) {
  const { brand, model } = await params;
  const brandSlug = decodeAndNormalize(brand);
  const modelSlug = decodeAndNormalize(model);
  if (!brandSlug || !modelSlug) notFound();

  const facetPair = getFacetPairBySlugs(brandSlug, modelSlug);
  if (facetPair) {
    if (!isSeoFeatureEnabled("facetPages")) notFound();
    const canonicalPath = facetPairPath(facetPair);
    if (canonicalPath !== `/auta/${brandSlug}/${modelSlug}`) notFound();
    const [rows, stats] = await Promise.all([
      queryCombinedFacetListings(facetPair, {}, 30),
      queryCombinedFacetStats(facetPair),
    ]);
    return (
      <CombinedFacetCollectionPage
        scope={{ type: "facetPair", facets: facetPair }}
        rows={rows}
        stats={stats}
        canonical={`${SITE_ORIGIN}${canonicalPath}`}
        relatedLinks={buildFacetPairRelatedLinks(facetPair)}
      />
    );
  }
  if (isGlobalFacetSlug(brandSlug)) notFound();

  if (isBrandFacetSlug(modelSlug)) {
    if (!isSeoFeatureEnabled("facetPages")) notFound();
    const modelCount = await countModelListingsWithVariants(brandSlug, modelSlug);
    if (modelCount === 0) {
      const facet = getFacetBySlug(modelSlug);
      if (facet) {
        const [rows, stats] = await Promise.all([
          queryFacetListings(facet, brandSlug, 30),
          queryFacetStats(facet, brandSlug),
        ]);
        return (
          <FacetCollectionPage
            facet={facet}
            brandSlug={brandSlug}
            rows={rows}
            stats={stats}
            canonical={`${SITE_ORIGIN}/auta/${brandSlug}/${facet.slug}`}
          />
        );
      }
    }
  }

  const [rows, total, price, year, siblingModels] = await Promise.all([
    queryModelListings(brandSlug, modelSlug),
    countModelListings(brandSlug, modelSlug),
    priceRange(brandSlug, modelSlug),
    yearRange(brandSlug, modelSlug),
    querySiblingModels(brandSlug, modelSlug),
  ]);

  // No active inventory – do not generate a thin page.
  if (total === 0) notFound();

  const brandName = formatBrandDisplay(brandSlug);
  const modelName = formatModelDisplay(modelSlug);
  const canonical = `${SITE_ORIGIN}/auta/${brandSlug}/${modelSlug}`;
  const isThin = total < MIN_INDEX;

  const fuelMap = new Map<string, number>();
  const transMap = new Map<string, number>();
  for (const l of rows) {
    const f = Array.isArray(l.fuelType) ? l.fuelType[0] : null;
    if (f) fuelMap.set(f, (fuelMap.get(f) ?? 0) + 1);
    const t = Array.isArray(l.transmission) ? l.transmission[0] : null;
    if (t) transMap.set(t, (transMap.get(t) ?? 0) + 1);
  }

  const modelStats = {
    total,
    minPrice: price.min,
    maxPrice: price.max,
    minYear: year.min,
    maxYear: year.max,
    fuels: [...fuelMap.entries()].map(([name, count]) => ({ name, count })),
    transmissions: [...transMap.entries()].map(([name, count]) => ({ name, count })),
    siblingModels: siblingModels.map((s) => ({
      name: s.model,
      slug: normalizeSlug(s.model),
      count: s.total,
    })),
  };

  const introParagraphs = buildModelSeoIntro(brandSlug, modelSlug, modelStats);
  const whyBuy = buildModelWhyBuy(brandSlug, modelSlug);
  const watchOut = buildModelWatchOut(brandSlug, modelSlug);
  const faqItems = buildModelFaq(brandSlug, modelSlug, modelStats);
  const similarModelLinks = getSimilarModelLinks(
    brandSlug,
    siblingModels.map((s) => ({ name: s.model, slug: normalizeSlug(s.model) })),
  );
  const similarPriceLink = getSimilarPriceLink(
    brandSlug,
    modelSlug,
    price.min,
    price.max,
  );

  const itemListEntries = rows.map((l) => ({
    name: formatVehicleTitle(l.brand, l.model, l.year),
    url: `${SITE_ORIGIN}${buildListingUrl({
      id: l.id,
      brand: l.brand,
      model: l.model,
      year: l.year,
    })}`,
  }));

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "NNAuto", url: `${SITE_ORIGIN}/` },
    { name: "Auta", url: `${SITE_ORIGIN}/auta` },
    { name: brandName, url: `${SITE_ORIGIN}/auta/${brandSlug}` },
    { name: modelName, url: canonical },
  ]);

  const modelCollectionStats = await queryModelCollectionStats(brandSlug, modelSlug);

  const collectionJsonLd = buildCollectionPageJsonLd({
    name: `${brandName} ${modelName} na prodej`,
    description: `Aktuální nabídka ${brandName} ${modelName} na NNAuto.cz`,
    url: canonical,
    items: itemListEntries,
    stats: modelCollectionStats,
  });

  const itemListJsonLd = buildItemListJsonLd(
    `${brandName} ${modelName} – inzeráty na NNAuto`,
    itemListEntries,
    rows.length,
  );

  const faqJsonLd = shouldEmitFaqJsonLd("modelFaq")
    ? buildFaqPageJsonLd(faqItems)
    : null;
  const modelAggregateJsonLd = buildAggregateOfferJsonLd({
    name: `${brandName} ${modelName} na prodej`,
    stats: modelCollectionStats,
  });
  const brandFacetLinks = getBrandFacetClusterLinks(brandSlug, brandName);

  const formatPrice = (n: number | null) =>
    n !== null ? `${n.toLocaleString("cs-CZ")} Kč` : null;

  return (
    <main className="container mx-auto max-w-6xl px-4 py-8">
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={collectionJsonLd} />
      <JsonLd data={itemListJsonLd} />
      {faqJsonLd ? <JsonLd data={faqJsonLd} /> : null}
      {modelAggregateJsonLd ? <JsonLd data={modelAggregateJsonLd} /> : null}

      <ModelBreadcrumb
        brandName={brandName}
        brandSlug={brandSlug}
        modelName={modelName}
      />

      <h1 className="text-3xl md:text-4xl font-bold mb-3">
        {brandName} {modelName} na prodej
      </h1>

      {/* Intro block — different from /listings UI: short summary with concrete
          numbers (price range, year range, count). Helps Google understand
          this page is unique. */}
      <p className="text-muted-foreground max-w-3xl mb-4">
        Aktuálně máme na NNAuto <strong>{total}</strong>{" "}
        {total === 1 ? "inzerát" : total < 5 ? "inzeráty" : "inzerátů"}{" "}
        modelu <strong>{brandName} {modelName}</strong>
        {price.min !== null && price.max !== null
          ? ` v cenovém rozpětí ${formatPrice(price.min)} – ${formatPrice(price.max)}`
          : ""}
        {year.min !== null && year.max !== null
          ? `, ročníky ${year.min}–${year.max}`
          : ""}
        . Inzeráty pocházejí od soukromých prodejců i ověřených autobazarů.
        Kontaktujte prodejce přímo, bez mezičlánků.
      </p>

      <div className="mb-6 flex flex-wrap gap-2">
        <a
          href={`/listings?brand=${encodeURIComponent(brandSlug)}&model=${encodeURIComponent(modelSlug)}`}
          className="rounded-md bg-[#B8860B] text-white px-4 py-2 text-sm font-medium"
        >
          Otevřít kompletní filtr
        </a>
        <a
          href={`/auta/${brandSlug}`}
          className="rounded-md border px-4 py-2 text-sm hover:bg-accent"
        >
          Všechny modely {brandName}
        </a>
        <a
          href={`/prodat-auto/${brandSlug}-${modelSlug}`}
          className="rounded-md border px-4 py-2 text-sm hover:bg-accent"
        >
          Prodat {brandName} {modelName}
        </a>
        <a
          href="/listings"
          className="rounded-md border px-4 py-2 text-sm hover:bg-accent"
        >
          Všechny inzeráty
        </a>
      </div>

      <h2 className="text-xl font-semibold mb-3">
        Aktuální nabídka {brandName} {modelName}
      </h2>
      <ModelListingGrid rows={rows} />

      <ModelSeoIntroParagraphs paragraphs={introParagraphs} />
      <ModelWhyBuy brandName={brandName} modelName={modelName} paragraphs={whyBuy} />
      <ModelWatchOut brandName={brandName} modelName={modelName} paragraphs={watchOut} />
      <ModelFaq brandName={brandName} modelName={modelName} items={faqItems} />
      <ModelLegacySeoBlock
        brandName={brandName}
        modelName={modelName}
        brandSlug={brandSlug}
        modelSlug={modelSlug}
      />
      <ModelSiblingModels
        brandSlug={brandSlug}
        brandName={brandName}
        siblings={siblingModels.map((s) => ({
          model: s.model,
          slug: normalizeSlug(s.model),
          total: s.total,
        }))}
      />
      <ModelSimilarModels links={similarModelLinks} />
      <ModelSimilarPrice link={similarPriceLink} />
      <ModelCategories brandName={brandName} links={brandFacetLinks} />
      <ModelFacetSearchLinks
        brandName={brandName}
        modelName={modelName}
        brandSlug={brandSlug}
        modelSlug={modelSlug}
      />
      <ModelRelatedNav brandSlug={brandSlug} brandName={brandName} />

      {isThin ? (
        <p className="mt-8 text-xs text-muted-foreground">
          Tato stránka má momentálně omezený inventář a není v současné
          chvíli zařazena do indexu vyhledávačů. Pravidelně doplňujeme
          nové inzeráty.
        </p>
      ) : null}
    </main>
  );
}
