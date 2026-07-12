import type { Metadata } from "next";
import JsonLd from "@lib/seo/JsonLd";
import { SITE_ORIGIN } from "@lib/seo/constants";
import {
  buildAggregateOfferJsonLd,
  buildBreadcrumbJsonLd,
  buildCollectionPageJsonLd,
  buildFaqPageJsonLd,
  buildItemListJsonLd,
} from "@lib/seo/structured-data";
import {
  formatBrandDisplay,
  formatModelDisplay,
  formatVehicleCardHeading,
  formatVehicleTitle,
} from "@lib/seo/brand-format";
import { buildListingUrl } from "@lib/seo/listing-url";
import { getListingMainTitleFromRow } from "@lib/seo/listing-title";
import { isSeoTextsEnabled } from "@lib/seo/features";
import type { CollectionStats, FacetListingRow } from "@lib/seo/facet-queries";
import type { FacetDefinition } from "@lib/seo/facets";
import { MIN_FACET_LISTINGS } from "@lib/seo/facets";
import {
  CollectionInternalLinkBlocks,
  CollectionVehicleJsonLd,
} from "@lib/seo/CollectionInternalLinkBlocks";

export type CombinedFacetScope =
  | { type: "facetPair"; facets: readonly [FacetDefinition, FacetDefinition] }
  | { type: "modelFacet"; brandSlug: string; modelSlug: string; facet: FacetDefinition };

function titleCaseRegion(value: string) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
}

function scopeNames(scope: CombinedFacetScope) {
  if (scope.type === "modelFacet") {
    const brandName = formatBrandDisplay(scope.brandSlug);
    const modelName = formatModelDisplay(scope.modelSlug);
    return {
      title: `${brandName} ${modelName} ${scope.facet.label} na prodej | NNAuto`,
      h1: `${brandName} ${modelName} ${scope.facet.label} na prodej`,
      shortName: `${brandName} ${modelName} ${scope.facet.shortLabel}`,
      descriptionSubject: `${brandName} ${modelName} ${scope.facet.label.toLowerCase()}`,
      breadcrumbs: [
        { name: "NNAuto", url: `${SITE_ORIGIN}/` },
        { name: "Auta", url: `${SITE_ORIGIN}/auta` },
        { name: brandName, url: `${SITE_ORIGIN}/auta/${scope.brandSlug}` },
        {
          name: modelName,
          url: `${SITE_ORIGIN}/auta/${scope.brandSlug}/${scope.modelSlug}`,
        },
        { name: scope.facet.shortLabel },
      ],
    };
  }

  const [primary, secondary] = scope.facets;
  return {
    title: `Auta ${primary.label} ${secondary.label} na prodej | NNAuto`,
    h1: `Auta ${primary.label} ${secondary.label} na prodej`,
    shortName: `${primary.shortLabel} ${secondary.shortLabel}`,
    descriptionSubject: `${primary.label.toLowerCase()} ${secondary.label.toLowerCase()}`,
    breadcrumbs: [
      { name: "NNAuto", url: `${SITE_ORIGIN}/` },
      { name: "Auta", url: `${SITE_ORIGIN}/auta` },
      { name: primary.shortLabel, url: `${SITE_ORIGIN}/auta/${primary.slug}` },
      { name: secondary.shortLabel },
    ],
  };
}

export function buildCombinedFacetMetadata(
  scope: CombinedFacetScope,
  stats: CollectionStats,
  canonical: string,
): Metadata {
  const names = scopeNames(scope);
  const description =
    stats.total >= MIN_FACET_LISTINGS
      ? `Prohlédněte si ${stats.total} inzerátů ${names.descriptionSubject} na NNAuto.cz. Aktuální ceny, fotografie, výbava a kontakt přímo na prodejce.`
      : `Aktuální výběr ${names.descriptionSubject} na NNAuto.cz. Nabídka se automaticky aktualizuje podle nových inzerátů.`;

  return {
    title: names.title,
    description,
    alternates: { canonical },
    robots:
      stats.total >= MIN_FACET_LISTINGS
        ? { index: true, follow: true }
        : { index: false, follow: true },
    openGraph: {
      title: names.title,
      description,
      url: canonical,
      siteName: "NNAuto",
      locale: "cs_CZ",
      type: "website",
      images: [{ url: `${SITE_ORIGIN}/og-image.png`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: names.title,
      description,
      images: [`${SITE_ORIGIN}/og-image.png`],
    },
  };
}

function faqItems(scope: CombinedFacetScope, stats: CollectionStats) {
  const names = scopeNames(scope);
  return [
    {
      question: `Kolik stojí ${names.descriptionSubject}?`,
      answer:
        stats.minPrice > 0 && stats.maxPrice > 0
          ? `Aktuální nabídka se pohybuje od ${stats.minPrice.toLocaleString("cs-CZ")} do ${stats.maxPrice.toLocaleString("cs-CZ")} Kč. Cena závisí na roku, nájezdu, výbavě a stavu konkrétního vozu.`
          : `Cena závisí na konkrétním modelu, roku výroby, nájezdu a technickém stavu. Aktuální inzeráty najdete přímo na této stránce.`,
    },
    {
      question: `Kolik aut je v nabídce?`,
      answer:
        stats.total > 0
          ? `Momentálně je v této kombinaci ${stats.total} aktivních inzerátů. Nabídka se průběžně aktualizuje podle nových vozů.`
          : `Aktuální počet vozů se mění podle nově přidaných inzerátů. Stránka zůstává dostupná a po doplnění nabídky se může stát indexovatelnou.`,
    },
    {
      question: `Jak vybrat správné auto?`,
      answer: `Porovnejte více inzerátů ve stejné cenové kategorii, ověřte servisní historii, nájezd, stav karoserie a výsledky zkušební jízdy. U starších vozů doporučujeme prověření VIN kódu.`,
    },
  ];
}

function seoParagraphs(scope: CombinedFacetScope, stats: CollectionStats) {
  const names = scopeNames(scope);
  if (scope.type === "modelFacet") {
    const brandName = formatBrandDisplay(scope.brandSlug);
    const modelName = formatModelDisplay(scope.modelSlug);
    return [
      `Výběr ${brandName} ${modelName} ${scope.facet.label.toLowerCase()} kombinuje konkrétní model s nejdůležitějším parametrem pro nákup. Díky tomu se nemusíte probírat obecnými výsledky a rychleji najdete auta, která odpovídají přesnějšímu záměru hledání.`,
      stats.total >= MIN_FACET_LISTINGS
        ? `Stránka aktuálně pracuje s ${stats.total} aktivními inzeráty. U každého vozu doporučujeme porovnat cenu, nájezd, rok výroby, servisní historii a výbavu s podobnými nabídkami stejného modelu.`
        : `Nabídka je zatím užší, proto je stránka dostupná pro uživatele a interní odkazy, ale vyhledávačům říkáme noindex/follow, dokud inventory nedosáhne dostatečné kvality.`,
    ];
  }

  const [primary, secondary] = scope.facets;
  return [
    `Kombinace ${primary.label.toLowerCase()} a ${secondary.label.toLowerCase()} pomáhá najít auta podle dvou praktických kritérií najednou. Je vhodná pro uživatele, kteří nehledají jen značku, ale konkrétní typ nabídky, cenu, palivo, lokalitu nebo ročník.`,
    stats.total >= MIN_FACET_LISTINGS
      ? `Aktuální výběr obsahuje ${stats.total} aktivních inzerátů. Porovnávejte hlavně cenu vůči nájezdu, stav karoserie, výbavu, původ vozu a dostupnost prohlídky u prodejce.`
      : `Pokud je nabídka v této kombinaci malá, stránka zůstává technicky dostupná, ale není zařazená do indexu. Jakmile přibude dost aut, automaticky začne fungovat jako plnohodnotná SEO landing page.`,
    `Níže najdete související auta, populární modely, značky a podobná vyhledávání, která pomáhají rychle přejít na širší nebo přesnější výběr než ${names.shortName}.`,
  ];
}

export function CombinedFacetCollectionPage({
  scope,
  rows,
  stats,
  canonical,
  relatedLinks,
}: {
  scope: CombinedFacetScope;
  rows: FacetListingRow[];
  stats: CollectionStats;
  canonical: string;
  relatedLinks: { label: string; href: string }[];
}) {
  const names = scopeNames(scope);
  const faqs = faqItems(scope, stats);
  const itemEntries = rows.map((listing) => ({
    name: getListingMainTitleFromRow(listing),
    url: `${SITE_ORIGIN}${buildListingUrl({
      id: listing.id,
      brand: listing.brand,
      model: listing.model,
      year: listing.year,
    })}`,
  }));

  return (
    <main className="container mx-auto max-w-6xl px-4 py-8">
      <JsonLd data={buildBreadcrumbJsonLd(names.breadcrumbs)} />
      <JsonLd
        data={buildCollectionPageJsonLd({
          name: names.h1,
          description: `${names.h1} na NNAuto.cz`,
          url: canonical,
          items: itemEntries,
          stats,
        })}
      />
      <JsonLd data={buildItemListJsonLd(names.h1, itemEntries, stats.total)} />
      <CollectionVehicleJsonLd rows={rows} />
      {(() => {
        const aggregate = buildAggregateOfferJsonLd({ name: names.h1, stats });
        return aggregate ? <JsonLd data={aggregate} /> : null;
      })()}
      <JsonLd data={buildFaqPageJsonLd(faqs)} />

      <nav className="text-sm text-muted-foreground mb-4 flex flex-wrap gap-1" aria-label="Breadcrumb">
        {names.breadcrumbs.map((item, index) => (
          <span key={`${item.name}-${index}`} className="contents">
            {index > 0 ? <span>/</span> : null}
            {item.url ? (
              <a href={item.url.replace(SITE_ORIGIN, "") || "/"} className="hover:underline">
                {item.name}
              </a>
            ) : (
              <span className="text-foreground font-medium">{item.name}</span>
            )}
          </span>
        ))}
      </nav>

      <h1 className="text-3xl md:text-4xl font-bold mb-3">{names.h1}</h1>
      <p className="text-muted-foreground max-w-3xl mb-4">
        Aktuálně <strong>{stats.total}</strong> inzerátů
        {stats.minPrice && stats.maxPrice ? (
          <>
            {" "}
            v cenách{" "}
            <strong>
              {stats.minPrice.toLocaleString("cs-CZ")}–{stats.maxPrice.toLocaleString("cs-CZ")} Kč
            </strong>
          </>
        ) : null}
        .
      </p>

      <section className="mt-6">
        <h2 className="text-xl font-semibold mb-3">Aktuální nabídka</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rows.map((listing) => {
            const photo = listing.photos?.[0];
            const img = photo
              ? `${SITE_ORIGIN}/img/${photo.replace(/^\/+/, "")}?w=800&q=75&f=webp`
              : null;
            return (
              <li key={listing.id} className="rounded-lg border bg-card overflow-hidden">
                <a
                  href={buildListingUrl({
                    id: listing.id,
                    brand: listing.brand,
                    model: listing.model,
                    year: listing.year,
                  })}
                  className="block group"
                >
                  {img ? (
                    <img
                      src={img}
                      alt={formatVehicleTitle(listing.brand, listing.model, listing.year)}
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
                      {formatVehicleCardHeading(listing.brand, listing.model)}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {[
                        listing.year,
                        listing.mileage ? `${listing.mileage.toLocaleString("cs-CZ")} km` : "",
                        listing.region ? titleCaseRegion(String(listing.region)) : "",
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    <p className="font-semibold text-[#B8860B]">
                      {Number(listing.price).toLocaleString("cs-CZ")} Kč
                    </p>
                  </div>
                </a>
              </li>
            );
          })}
        </ul>
      </section>

      {isSeoTextsEnabled() ? (
        <section className="mt-10 prose max-w-none text-muted-foreground space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">
            Jak vybrat {names.shortName}
          </h2>
          {seoParagraphs(scope, stats).map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </section>
      ) : null}

      <section className="mt-10" aria-labelledby="combined-faq">
        <h2 id="combined-faq" className="text-xl font-semibold mb-4">
          Časté dotazy
        </h2>
        <dl className="space-y-4">
          {faqs.map((item) => (
            <div key={item.question}>
              <dt className="font-medium text-foreground">{item.question}</dt>
              <dd className="mt-1 text-muted-foreground">{item.answer}</dd>
            </div>
          ))}
        </dl>
      </section>

      <CollectionInternalLinkBlocks
        rows={rows}
        brandSlug={scope.type === "modelFacet" ? scope.brandSlug : undefined}
        modelSlug={scope.type === "modelFacet" ? scope.modelSlug : undefined}
        relatedLinks={relatedLinks}
      />
    </main>
  );
}
