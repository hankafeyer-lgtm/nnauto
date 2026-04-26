import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@lib/db";
import { listings } from "@shared/schema";
import { and, desc, eq } from "drizzle-orm";
import { SITE_ORIGIN } from "@lib/seo/constants";
import JsonLd from "@lib/seo/JsonLd";
import { getListingMainTitleFromRow } from "@lib/seo/listing-title";
import { formatBrandDisplay, formatVehicleTitle } from "@lib/seo/brand-format";

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
  return db
    .select()
    .from(listings)
    .where(and(eq(listings.isSold, false), eq(listings.brand, norm)))
    .orderBy(desc(listings.updatedAt))
    .limit(limit);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { brand } = await params;
  const brandSlug = decodeURIComponent(brand).toLowerCase();
  const brandName = formatBrandDisplay(brandSlug);
  const rows = await queryBrandListings(brand, 1);
  const hasAny = rows.length > 0;
  const title = hasAny
    ? `Prodej ${brandName} v ČR – ojetá i nová auta | NNAuto`
    : `${brandName} na NNAuto`;
  const description = hasAny
    ? `Ověřené inzeráty značky ${brandName} na NNAuto. Prohlédněte si ${brandName} od soukromých prodejců i autobazarů, filtrujte podle roku, ceny, najetých km a regionu. Kontakt přímo s majitelem.`
    : `Aktuální nabídka ${brandName} na NNAuto – prémiovém marketplace automobilů v ČR.`;
  const canonical = `${SITE_ORIGIN}/auta/${encodeURIComponent(brand.toLowerCase())}`;

  return {
    title,
    description,
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
  const rows = await queryBrandListings(brandSlug, 30);

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
      url: `${SITE_ORIGIN}/listing/${l.id}`,
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
              <a href={`/listing/${l.id}`} className="block group">
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

      <section className="mt-10 prose max-w-none text-muted-foreground space-y-3 text-[15px] leading-relaxed">
        <h2 className="text-xl font-semibold text-foreground">
          Proč si vybrat {brandName} na NNAuto?
        </h2>
        <p>
          Nakupovat <strong>{brandName}</strong> přes NNAuto znamená přímý
          kontakt s prodejcem, transparentní cenu a možnost ověřit historii
          vozu přes Cebia report. V nabídce najdete jak čerstvě přidané
          inzeráty, tak déle inzerovaná auta se sníženou cenou. Vše
          přehledně se všemi parametry – rok výroby, najeté km, palivo,
          převodovka, výbava a lokalita prodejce. Žádné mezičlánky, žádné
          skryté provize.
        </p>
        <p>
          Značka <strong>{brandName}</strong> patří mezi nejvyhledávanější
          na českém trhu ojetých vozů. Na NNAuto najdete jak ojeté kusy s
          prověřenou historií od soukromých majitelů, tak novější ročníky
          z autobazarů. Každý inzerát obsahuje detailní popis, fotografie
          z více úhlů, technické parametry a kontakt přímo na majitele
          nebo autobazar. Komunikace je rychlá – telefonicky nebo přes
          integrovaný formulář bez prostředníků.
        </p>
        <p>
          Pokud hledáte konkrétní model <strong>{brandName}</strong>,
          využijte{" "}
          <a
            href={`/listings?brand=${encodeURIComponent(brandSlug)}`}
            className="underline"
          >
            kompletní filtr na stránce inzerátů
          </a>{" "}
          – nastavíte rozsah ceny, roku a najetých km a najdete přesně to
          auto, které vám bude vyhovovat. Filtry lze libovolně kombinovat:
          typ paliva (benzín, diesel, hybrid, elektro, LPG, CNG),
          převodovka (manuál, automat, DSG, CVT), pohon (přední, zadní,
          4×4), počet majitelů, region nebo vzdálenost od vašeho města.
          Po každé změně filtru okamžitě uvidíte počet vozů, které
          aktuálně vyhovují vašemu zadání.
        </p>
        <p>
          <strong>Kontrola vozu před koupí.</strong> U každého vozu{" "}
          {brandName} doporučujeme zkontrolovat servisní knihu, stav
          karoserie (zejména prahy, lemy kol, podběhy a víka), kvalitu
          laku, stav motoru a převodovky a hlavně soulad reálného nájezdu
          s údaji v technickém průkazu. U starších ročníků si vždy
          vyžádejte výpis ze servisní historie nebo objednejte prověření
          přes <strong>Cebia</strong> – online report z VIN kódu odhalí
          předchozí majitele, případné havárie, zástavy nebo nesoulad v
          nájezdu. Inzeráty s prověřením Cebia mají na NNAuto speciální
          štítek, takže ověřená auta poznáte na první pohled.
        </p>
        <p>
          <strong>Co u {brandName} sledovat.</strong> Mnoho vozů této
          značky najdete jak ve verzích s benzínovým, tak dieselovým
          motorem, často i v úspornějších hybridních variantách. Při
          výběru zvažte, zda preferujete městský provoz (kde se vyplatí
          spíše benzín nebo hybrid) nebo dlouhé trasy po dálnici (kde má
          smysl dieselový motor). U vyšších ročníků s automatickou
          převodovkou si nechte zkontrolovat hladinu i barvu oleje –
          jakákoliv tmavá nebo spálená barva ukazuje na zanedbanou
          údržbu. Vůz vždy zkuste i v horší roli: zařadit na první
          rychlost, plně zatočit volantem do obou stran, projet hrbol –
          jakékoliv klepání nebo praskání je signál k bližší prohlídce v
          servisu.
        </p>
        <p>
          <strong>Prodej {brandName} přes NNAuto.</strong> Vlastníte{" "}
          {brandName} a chcete ho prodat? Vložte{" "}
          <a href="/add-listing" className="underline">
            vlastní inzerát zdarma
          </a>{" "}
          během několika minut. Nahrajte 8–12 kvalitních fotografií, popište
          výbavu, servisní historii a uveďte aktuální cenu. Pro rychlejší
          prodej využijte{" "}
          <a href="/pricing" className="underline">
            TOP zvýraznění
          </a>{" "}
          – inzerát se posune na začátek výpisu a získá výrazný barevný
          štítek. Cenu doporučujeme stanovit podle aktuální nabídky
          podobných vozů – srovnání najdete přímo zde na stránce{" "}
          {brandName}.
        </p>
      </section>

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
          </a>{" "}
          nebo si nastavte vlastní filtry v{" "}
          <a
            href={`/listings?brand=${encodeURIComponent(brandSlug)}`}
            className="underline"
          >
            katalogu {brandName}
          </a>
          .
        </p>
      </section>
    </main>
  );
}
