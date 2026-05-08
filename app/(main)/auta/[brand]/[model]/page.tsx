import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@lib/db";
import { listings } from "@shared/schema";
import { and, desc, eq, sql } from "drizzle-orm";
import { SITE_ORIGIN } from "@lib/seo/constants";
import JsonLd from "@lib/seo/JsonLd";
import {
  formatBrandDisplay,
  formatModelDisplay,
  formatVehicleTitle,
} from "@lib/seo/brand-format";
import { normalizeSlug } from "@lib/seo/slug";
import { buildListingUrl } from "@lib/seo/listing-url";

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

const titleCaseRegion = (s: string) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1) : s;

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
  return db
    .select()
    .from(listings)
    .where(
      and(
        eq(listings.isSold, false),
        sql`lower(${listings.brand}) = ${brandSlug}`,
        sql`lower(${listings.model}) = ${modelSlug}`,
      ),
    )
    .orderBy(desc(listings.updatedAt))
    .limit(limit);
}

async function countModelListings(
  brandSlug: string,
  modelSlug: string,
): Promise<number> {
  if (!brandSlug || !modelSlug) return 0;
  const rows = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(listings)
    .where(
      and(
        eq(listings.isSold, false),
        sql`lower(${listings.brand}) = ${brandSlug}`,
        sql`lower(${listings.model}) = ${modelSlug}`,
      ),
    );
  return rows[0]?.count ?? 0;
}

async function priceRange(
  brandSlug: string,
  modelSlug: string,
): Promise<{ min: number | null; max: number | null }> {
  if (!brandSlug || !modelSlug) return { min: null, max: null };
  const rows = await db
    .select({
      min: sql<number | null>`min(${listings.price})::int`,
      max: sql<number | null>`max(${listings.price})::int`,
    })
    .from(listings)
    .where(
      and(
        eq(listings.isSold, false),
        sql`lower(${listings.brand}) = ${brandSlug}`,
        sql`lower(${listings.model}) = ${modelSlug}`,
      ),
    );
  return { min: rows[0]?.min ?? null, max: rows[0]?.max ?? null };
}

async function yearRange(
  brandSlug: string,
  modelSlug: string,
): Promise<{ min: number | null; max: number | null }> {
  if (!brandSlug || !modelSlug) return { min: null, max: null };
  const rows = await db
    .select({
      min: sql<number | null>`min(${listings.year})::int`,
      max: sql<number | null>`max(${listings.year})::int`,
    })
    .from(listings)
    .where(
      and(
        eq(listings.isSold, false),
        sql`lower(${listings.brand}) = ${brandSlug}`,
        sql`lower(${listings.model}) = ${modelSlug}`,
      ),
    );
  return { min: rows[0]?.min ?? null, max: rows[0]?.max ?? null };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { brand, model } = await params;
  const brandSlug = decodeAndNormalize(brand);
  const modelSlug = decodeAndNormalize(model);
  const brandName = formatBrandDisplay(brandSlug);
  const modelName = formatModelDisplay(modelSlug);
  const total = await countModelListings(brandSlug, modelSlug);

  const canonical = `${SITE_ORIGIN}/auta/${brandSlug}/${modelSlug}`;
  const title = total
    ? `Prodej ${brandName} ${modelName} – ojeté i nové vozy v ČR | NNAuto`
    : `${brandName} ${modelName} | NNAuto`;
  const description = total
    ? `Aktuální nabídka ${brandName} ${modelName} v ČR – ${total}+ inzerátů od soukromých prodejců i autobazarů. Filtrujte podle roku, ceny, najetých km a paliva, kontaktujte prodejce přímo.`
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
    keywords: [
      `${brandName} ${modelName}`,
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

  const [rows, total, price, year] = await Promise.all([
    queryModelListings(brandSlug, modelSlug),
    countModelListings(brandSlug, modelSlug),
    priceRange(brandSlug, modelSlug),
    yearRange(brandSlug, modelSlug),
  ]);

  // No active inventory – do not generate a thin page.
  if (total === 0) notFound();

  const brandName = formatBrandDisplay(brandSlug);
  const modelName = formatModelDisplay(modelSlug);
  const canonical = `${SITE_ORIGIN}/auta/${brandSlug}/${modelSlug}`;
  const isThin = total < MIN_INDEX;

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
        item: `${SITE_ORIGIN}/auta/${brandSlug}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: modelName,
      },
    ],
  };

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${brandName} ${modelName} – inzeráty na NNAuto`,
    numberOfItems: rows.length,
    itemListElement: rows.map((l, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_ORIGIN}${buildListingUrl({
        id: l.id,
        brand: l.brand,
        model: l.model,
      })}`,
      name: formatVehicleTitle(l.brand, l.model, l.year),
    })),
  };

  const formatPrice = (n: number | null) =>
    n !== null ? `${n.toLocaleString("cs-CZ")} Kč` : null;

  return (
    <main className="container mx-auto max-w-6xl px-4 py-8">
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={itemListJsonLd} />

      <nav
        className="text-sm text-muted-foreground mb-4 flex flex-wrap gap-1"
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
        <a href={`/auta/${brandSlug}`} className="hover:underline">
          {brandName}
        </a>
        <span>/</span>
        <span className="text-foreground font-medium">{modelName}</span>
      </nav>

      <h1 className="text-3xl md:text-4xl font-bold mb-3">
        Prodej {brandName} {modelName} v České republice
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
          href="/listings"
          className="rounded-md border px-4 py-2 text-sm hover:bg-accent"
        >
          Všechny inzeráty
        </a>
      </div>

      <h2 className="text-xl font-semibold mb-3">
        Aktuální nabídka {brandName} {modelName}
      </h2>
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {rows.map((l) => {
          const yearLabel = l.year;
          const mileage = l.mileage
            ? `${l.mileage.toLocaleString("cs-CZ")} km`
            : "";
          const priceLabel = l.price
            ? `${Number(l.price).toLocaleString("cs-CZ")} Kč`
            : "";
          const img = l.photos?.[0]
            ? `${SITE_ORIGIN}/img/${l.photos[0].replace(/^\/+/, "")}?w=800&q=75&f=webp`
            : null;
          const carTitle = formatVehicleTitle(l.brand, l.model, l.year);
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
                    alt={carTitle}
                    className="w-full h-48 object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div className="w-full h-48 bg-muted" aria-hidden="true" />
                )}
                <div className="p-3 space-y-1">
                  <h3 className="font-semibold group-hover:underline">
                    {carTitle}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {[
                      yearLabel,
                      mileage,
                      l.region ? titleCaseRegion(String(l.region)) : "",
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  <p className="font-semibold text-[#B8860B]">{priceLabel}</p>
                </div>
              </a>
            </li>
          );
        })}
      </ul>

      {/* Unique long-form SEO copy. Generic enough to work for any brand+model
          combination yet rich with vehicle-buyer keywords. Aim ~500–700 slov
          tak, aby stránka nebyla duplicitou /listings. */}
      <section className="mt-12 prose max-w-none text-muted-foreground space-y-4 text-[15px] leading-relaxed">
        <h2 className="text-2xl font-semibold text-foreground">
          {brandName} {modelName} – co je dobré vědět před nákupem
        </h2>
        <p>
          <strong>{brandName} {modelName}</strong> patří mezi vyhledávané
          modely na českém trhu ojetých vozů. Pokud zvažujete nákup, zaměřte
          se zejména na servisní historii, soulad reálného nájezdu s údaji
          v technickém průkazu a celkový technický stav vozu. U starších
          ročníků je vhodné nechat vůz prohlédnout v autorizovaném servisu
          nebo nezávislým technikem – odhalíte tak skryté závady, které
          z popisu nebo fotografií nemusí být patrné.
        </p>
        <p>
          Při výběru konkrétního {brandName} {modelName} doporučujeme
          porovnat několik inzerátů z podobné cenové i ročníkové kategorie.
          Cena vozu se odvíjí od roku výroby, najetých kilometrů, výbavy,
          stavu karoserie, motorového a převodového ústrojí. Vozy se
          servisní knihou a doložitelnou historií mají na sekundárním trhu
          vyšší hodnotu a snáze se prodávají dál.
        </p>
        <h3 className="text-xl font-semibold text-foreground">
          Motory, převodovky a varianty
        </h3>
        <p>
          Model {modelName} bývá u značky {brandName} obvykle dostupný v
          několika motorizacích – benzín, diesel, případně hybrid nebo
          elektro. Každá varianta má své výhody: zážehové motory bývají
          tišší a mají nižší pořizovací cenu, vznětové motory nabízejí
          vyšší krouticí moment a delší dojezd, hybridní pohon pak nižší
          spotřebu ve městě. Před nákupem si rozmyslete, kolik kilometrů
          ročně najedete – pro převážně městský provoz se vyplatí benzín
          nebo hybrid, pro dálniční jízdy spíše diesel.
        </p>
        <p>
          Převodovka může být manuální nebo automatická (klasická,
          dvouspojková, CVT). Automatické převodovky jsou pohodlnější, ale
          vyžadují pravidelnou výměnu oleje a mohou být nákladnější na
          opravy. Manuální převodovka je obvykle spolehlivější a levnější
          v servisu.
        </p>
        <h3 className="text-xl font-semibold text-foreground">
          Co zkontrolovat při prohlídce {modelName}
        </h3>
        <p>
          Při prohlídce {brandName} {modelName} se zaměřte na rovnoměrnost
          spár karoserie, kvalitu laku, případnou korozi pod prahy a v
          podběhu kol, stav podvozku a stav motorového prostoru. V
          interiéru zkontrolujte funkčnost elektroniky, klimatizace,
          multimédií a všech tlačítek. Otestujte vozidlo na jízdě:
          poslouchejte motor, sledujte chování při brzdění, akceleraci a
          řazení.
        </p>
        <p>
          Pro starší vozy je rozumné objednat report z VIN kódu –{" "}
          <strong>Cebia</strong> nabízí online prověření historie vozu
          včetně počtu majitelů, kontroly nájezdu, případných havárií a
          zástav. Investice v řádu stovek korun vám může ušetřit
          nepříjemnosti za desetitisíce.
        </p>
        <h3 className="text-xl font-semibold text-foreground">
          Prodej {brandName} {modelName} přes NNAuto
        </h3>
        <p>
          Pokud naopak chcete {brandName} {modelName} prodat,{" "}
          <a href="/add-listing" className="underline">
            vložte inzerát zdarma na NNAuto
          </a>
          . Doporučujeme nahrát alespoň 8–12 fotografií ve dne, popsat
          výbavu, servisní historii i případné drobné vady. Inzerát s
          kvalitními fotografiemi a podrobným popisem se prodává rychleji
          a za lepší cenu. Pro maximální dosah využijte zvýraznění{" "}
          <a href="/pricing" className="underline">
            TOP inzerátu
          </a>
          .
        </p>
        <p>
          Cenu stanovte podle aktuální nabídky podobných vozů – u tohoto
          modelu na NNAuto najdete{" "}
          <a
            href={`/listings?brand=${encodeURIComponent(brandSlug)}&model=${encodeURIComponent(modelSlug)}`}
            className="underline"
          >
            kompletní katalog s pokročilými filtry
          </a>{" "}
          (rok, cena, najeto, palivo, převodovka, region). Realistická
          cena s ohledem na technický stav, výbavu a sezónu vede k
          úspěšnému prodeji během několika dnů.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold mb-3">
          {brandName} {modelName} – hledat podle
        </h2>
        <ul className="flex flex-wrap gap-2">
          <li><a href={`/prodej/${brandSlug}-${modelSlug}-diesel`} className="inline-block rounded-md border px-3 py-1.5 text-sm hover:bg-accent">{brandName} {modelName} diesel</a></li>
          <li><a href={`/prodej/${brandSlug}-${modelSlug}-benzin`} className="inline-block rounded-md border px-3 py-1.5 text-sm hover:bg-accent">{brandName} {modelName} benzín</a></li>
          <li><a href={`/prodej/${brandSlug}-${modelSlug}-automat`} className="inline-block rounded-md border px-3 py-1.5 text-sm hover:bg-accent">{brandName} {modelName} automat</a></li>
          <li><a href={`/prodej/${brandSlug}-${modelSlug}-kombi`} className="inline-block rounded-md border px-3 py-1.5 text-sm hover:bg-accent">{brandName} {modelName} kombi</a></li>
          <li><a href={`/prodej/${brandSlug}-${modelSlug}`} className="inline-block rounded-md border px-3 py-1.5 text-sm hover:bg-accent">{brandName} {modelName} na prodej</a></li>
        </ul>
      </section>

      <section className="mt-6">
        <h3 className="text-base font-semibold mb-2 text-muted-foreground">Související</h3>
        <ul className="flex flex-wrap gap-2">
          <li><a href={`/auta/${brandSlug}`} className="inline-block rounded-md border px-3 py-1.5 text-sm hover:bg-accent">Vše {brandName}</a></li>
          <li><a href="/listings" className="inline-block rounded-md border px-3 py-1.5 text-sm hover:bg-accent">Všechny inzeráty</a></li>
          <li><a href="/tips" className="inline-block rounded-md border px-3 py-1.5 text-sm hover:bg-accent">Tipy a rady</a></li>
        </ul>
      </section>

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
