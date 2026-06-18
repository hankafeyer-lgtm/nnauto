import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@lib/db";
import { listings } from "@shared/schema";
import { and, desc, eq, sql } from "drizzle-orm";
import { SITE_ORIGIN } from "@lib/seo/constants";
import JsonLd from "@lib/seo/JsonLd";
import { getListingMainTitleFromRow } from "@lib/seo/listing-title";
import {
  formatBrandDisplay,
  formatModelDisplay,
  formatVehicleTitle,
} from "@lib/seo/brand-format";
import { normalizeSlug } from "@lib/seo/slug";
import { buildListingUrl } from "@lib/seo/listing-url";
import { getTopModelLinksForBrand, isTopModel } from "@lib/seo/top-models";

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

/** Region label gets a simple Title Case for SEO display. */
const titleCaseRegion = (s: string) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1) : s;

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
  const brandName = formatBrandDisplay(brandSlug);
  const stats = await queryBrandStats(brandSlug);
  const hasAny = stats.total > 0;
  const title = hasAny
    ? `${brandName} na prodej (${stats.total}) – od ${stats.minPrice.toLocaleString("cs-CZ")} Kč | NNAuto`
    : `${brandName} na NNAuto`;
  const description = hasAny
    ? `${stats.total} ověřených inzerátů ${brandName} na NNAuto. Ceny od ${stats.minPrice.toLocaleString("cs-CZ")} Kč do ${stats.maxPrice.toLocaleString("cs-CZ")} Kč. Ojeté i nové vozy, přímý kontakt s prodejcem.`
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

  // ItemList JSON-LD so Google understands this is a category of products.
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${brandName} – inzeráty na NNAuto`,
    itemListElement: rows.map((l, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_ORIGIN}${buildListingUrl({
        id: l.id,
        brand: l.brand,
        model: l.model,
      })}`,
      name: getListingMainTitleFromRow(l),
    })),
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
        name: "Inzeráty",
        item: `${SITE_ORIGIN}/listings`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: brandName,
      },
    ],
  };

  return (
    <main className="container mx-auto max-w-6xl px-4 py-8">
      <JsonLd data={itemListJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: `Kolik stojí ojetý ${brandName}?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `Ceny ojetých vozů ${brandName} na NNAuto se pohybují od desítek tisíc korun za starší ročníky po stovky tisíc za novější modely v top stavu. Aktuální nabídku najdete přímo na této stránce.`,
            },
          },
          {
            "@type": "Question",
            name: `Kde koupit ${brandName} v České republice?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `Na NNAuto.cz najdete ověřené inzeráty ${brandName} od soukromých prodejců i autobazarů z celé ČR. Kontaktujete prodejce přímo, bez mezičlánků.`,
            },
          },
          {
            "@type": "Question",
            name: `Jak ověřit historii ${brandName} před koupí?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `Doporučujeme prověřit vůz přes Cebia report, který z VIN kódu odhalí historii, počet majitelů, najeté km a případné havárie. NNAuto u inzerátů s prověřením zobrazuje speciální štítek.`,
            },
          },
        ],
      }} />
      {brandStats.total >= 3 && brandStats.minPrice > 0 ? (
        <JsonLd data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: `${brandName} – ojetá auta`,
          description: `Nabídka ${brandStats.total} ojetých vozů ${brandName} na NNAuto.cz`,
          brand: { "@type": "Brand", name: brandName },
          offers: {
            "@type": "AggregateOffer",
            lowPrice: String(brandStats.minPrice),
            highPrice: String(brandStats.maxPrice),
            priceCurrency: "CZK",
            offerCount: brandStats.total,
            availability: "https://schema.org/InStock",
          },
        }} />
      ) : null}

      <nav
        className="text-sm text-muted-foreground mb-4 flex gap-1 flex-wrap"
        aria-label="Breadcrumb"
      >
        <a href="/" className="hover:underline">
          NNAuto
        </a>
        <span>/</span>
        <a href="/listings" className="hover:underline">
          Inzeráty
        </a>
        <span>/</span>
        <span className="text-foreground font-medium">{brandName}</span>
      </nav>

      <h1 className="text-3xl md:text-4xl font-bold mb-3">
        Prodej {brandName} v České republice
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
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {rows.map((l) => {
          const year = l.year;
          const mileage = l.mileage
            ? `${l.mileage.toLocaleString("cs-CZ")} km`
            : "";
          const price = l.price
            ? `${Number(l.price).toLocaleString("cs-CZ")} Kč`
            : "";
          const img = l.photos?.[0]
            ? `${SITE_ORIGIN}/img/${l.photos[0].replace(/^\/+/, "")}?w=800&q=75&f=webp`
            : null;
          return (
            <li
              key={l.id}
              className="rounded-lg border bg-card overflow-hidden"
            >
              <a
                href={buildListingUrl({
                  id: l.id,
                  brand: l.brand,
                  model: l.model,
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
                  />
                ) : (
                  <div className="w-full h-48 bg-muted" aria-hidden="true" />
                )}
                <div className="p-3 space-y-1">
                  <h3 className="font-semibold group-hover:underline">
                    {formatVehicleTitle(l.brand, l.model, l.year)}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {[year, mileage, l.region ? titleCaseRegion(String(l.region)) : ""]
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

      <section className="mt-10 prose max-w-none text-muted-foreground">
        <h2 className="text-xl font-semibold text-foreground">
          Proč si vybrat {brandName} na NNAuto?
        </h2>
        <p>
          Nakupovat {brandName} skrze NNAuto znamená přímý kontakt s prodejcem,
          transparentní cenu a možnost ověřit historii vozu přes Cebia report.
          V nabídce najdete jak čerstvě přidané inzeráty, tak déle inzerovaná
          auta se sníženou cenou. Vše přehledně se všemi parametry – rok
          výroby, najeté km, palivo, převodovka a lokalita.
        </p>
        <p>
          Značka <strong>{brandName}</strong> patří mezi nejvyhledávanější vozy
          na českém trhu. Na NNAuto najdete jak ojeté kusy s prověřenou
          historií, tak novější ročníky. Každý inzerát obsahuje detailní popis,
          fotografie, technické parametry a kontakt přímo na majitele nebo
          autobazar – bez zbytečných mezičlánků a skrytých poplatků.
        </p>
        <p>
          Pokud hledáte konkrétní model <strong>{brandName}</strong>, využijte{" "}
          <a
            href={`/listings?brand=${encodeURIComponent(brandSlug)}`}
            className="underline"
          >
            kompletní filtr na stránce inzerátů
          </a>{" "}
          – nastavíte rozsah ceny, roku a najetých km a najdete přesně to auto,
          které vám bude vyhovovat. Můžete také kombinovat filtr značky s typem
          paliva (benzín, diesel, hybrid, elektro), převodovkou (manuál,
          automat) nebo regionem prodejce.
        </p>
        <p>
          U každého vozu {brandName} doporučujeme zkontrolovat servisní knihu,
          stav karoserie, nájezd a v případě staršího ročníku objednat
          prověření přes <strong>Cebia</strong> – ušetříte si tak nepříjemná
          překvapení s historií vozu. NNAuto u inzerátů s prověřením Cebia
          zobrazuje speciální štítek, takže snadno poznáte ověřená auta.
        </p>
      </section>

      {/* Data-driven stats block — unique SEO content per brand from real inventory */}
      {(() => {
        const prices = rows.map((l) => Number(l.price)).filter((p) => p > 0).sort((a, b) => a - b);
        const years = rows.map((l) => l.year).filter(Boolean).sort();
        const fuels = new Map<string, number>();
        for (const l of rows) {
          const f = Array.isArray(l.fuelType) ? l.fuelType[0] : null;
          if (f) fuels.set(f, (fuels.get(f) ?? 0) + 1);
        }
        if (prices.length < 3) return null;
        const minPrice = prices[0].toLocaleString("cs-CZ");
        const maxPrice = prices[prices.length - 1].toLocaleString("cs-CZ");
        const minYear = years[0];
        const maxYear = years[years.length - 1];
        const topFuels = [...fuels.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
        return (
          <section className="mt-8 prose max-w-none text-muted-foreground">
            <h2 className="text-xl font-semibold text-foreground">
              {brandName} na NNAuto v číslech
            </h2>
            <p>
              Aktuálně nabízíme <strong>{rows.length}+ vozů {brandName}</strong> v
              cenovém rozpětí od <strong>{minPrice} Kč</strong> do <strong>{maxPrice} Kč</strong>.
              Ročníky v nabídce sahají od <strong>{minYear}</strong> do <strong>{maxYear}</strong>.
              {topFuels.length > 0 ? (
                <> Nejčastější palivo: {topFuels.map(([f, c]) => `${f} (${c}×)`).join(", ")}.</>
              ) : null}
            </p>
            <p>
              Nejoblíbenější modely {brandName} s aktivní nabídkou:
              {" "}{popularModels.slice(0, 5).map((m) => formatModelDisplay(m.model)).join(", ")}.
              Každý model má vlastní stránku s filtry a detailním výpisem, kde porovnáte
              ceny, najeté km, stav a výbavu — vše na jednom místě bez potřeby jiného bazaru.
            </p>
          </section>
        );
      })()}

      {(() => {
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
        if (dedupedModels.length === 0) return null;
        return (
          <section
            aria-labelledby="popular-models-heading"
            className="mt-10"
          >
            <h2
              id="popular-models-heading"
              className="text-xl font-semibold mb-3"
            >
              Populární modely {brandName}
            </h2>
            <p className="text-sm text-muted-foreground mb-4 max-w-3xl">
              Nejhledanější modely značky {brandName} s aktuálně dostupnou
              nabídkou na NNAuto. Klikněte pro zobrazení všech inzerátů
              konkrétního modelu.
            </p>
            <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {dedupedModels.map((m) => (
                <li key={m.slug}>
                  <a
                    href={`/auta/${brandSlug}/${m.slug}`}
                    className="flex items-center justify-between rounded-md border px-3 py-2 text-sm hover:bg-accent transition-colors"
                  >
                    <span className="truncate font-medium">
                      {brandName} {formatModelDisplay(m.model)}
                    </span>
                    <span className="ml-2 shrink-0 text-xs text-muted-foreground">
                      {m.total}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        );
      })()}

      {(() => {
        const brandTopLinks = getTopModelLinksForBrand(brandSlug);
        if (brandTopLinks.length === 0) return null;
        return (
          <section className="mt-6">
            <h3 className="text-base font-semibold mb-2 text-muted-foreground">
              Nejčastěji hledané {brandName}
            </h3>
            <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
              {brandTopLinks.map((l) => (
                <li key={l.slug}>
                  <a href={l.href} className="text-muted-foreground hover:text-foreground hover:underline transition-colors">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        );
      })()}

      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-3">Související značky</h2>
        <ul className="flex flex-wrap gap-2">
          {[
            "bmw",
            "audi",
            "skoda",
            "mercedes-benz",
            "volkswagen",
            "volvo",
            "ford",
            "jeep",
          ]
            .filter((b) => b !== brandSlug)
            .slice(0, 8)
            .map((slug) => (
              <li key={slug}>
                <a
                  href={`/auta/${slug}`}
                  className="inline-block rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
                >
                  {formatBrandDisplay(slug)}
                </a>
              </li>
            ))}
        </ul>
        <p className="mt-4 text-sm text-muted-foreground">
          Prohlédněte si také{" "}
          <a href="/listings" className="underline">
            všechny inzeráty napříč značkami
          </a>
          .
        </p>
      </section>
    </main>
  );
}
