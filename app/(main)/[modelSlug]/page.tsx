/**
 * Phase 1 — short SEO landing pages.
 *
 * URL: /[brand-model]
 *   e.g. /audi-a6, /bmw-x5, /skoda-octavia, /mercedes-benz-c-class
 *
 * This is an ADDITIVE SEO test layer:
 *   - Existing routes (`/auta/[brand]/[model]`, `/auta/[brand]/[model]/[id]`,
 *     `/listings`, `/listing/[id]`, …) are NOT touched.
 *   - The page resolves the slug via `parseShortModelSlug` against active DB
 *     inventory. Unknown / reserved slugs render 404 — the dynamic route
 *     never hijacks any other surface.
 *   - `<link rel="canonical">` ALWAYS points to the existing
 *     `/auta/{brand}/{model}` page. Phase 1 is a safe SEO test — no SEO
 *     weight transfer, no internal-link churn, no sitemap changes. The
 *     existing brand/model page keeps its rank.
 *   - Pages with fewer than `MIN_INDEX` listings render `noindex, follow`
 *     to avoid thin-content indexation (same threshold as the existing
 *     model landing page).
 *
 * Kill switch: `ENABLE_SHORT_MODEL_LANDINGS` env var. When set to "false"
 * the route immediately renders 404 for every slug, even if the file is
 * deployed.
 */
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
import { buildListingUrl } from "@lib/seo/listing-url";
import { parseShortModelSlug } from "@lib/seo/short-model-slug";

export const revalidate = 3600;

const ENABLE_SHORT_MODEL_LANDINGS =
  process.env.ENABLE_SHORT_MODEL_LANDINGS !== "false";

const MIN_INDEX = 3;
const LIST_LIMIT = 30;

type Props = { params: Promise<{ modelSlug: string }> };

const titleCaseRegion = (s: string) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1) : s;

async function queryModelListings(
  brand: string,
  model: string,
  limit = LIST_LIMIT,
) {
  return db
    .select()
    .from(listings)
    .where(
      and(
        eq(listings.isSold, false),
        sql`lower(${listings.brand}) = ${brand}`,
        sql`lower(${listings.model}) = ${model}`,
      ),
    )
    .orderBy(desc(listings.updatedAt))
    .limit(limit);
}

async function countModelListings(
  brand: string,
  model: string,
): Promise<number> {
  const rows = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(listings)
    .where(
      and(
        eq(listings.isSold, false),
        sql`lower(${listings.brand}) = ${brand}`,
        sql`lower(${listings.model}) = ${model}`,
      ),
    );
  return rows[0]?.count ?? 0;
}

async function priceRange(
  brand: string,
  model: string,
): Promise<{ min: number | null; max: number | null }> {
  const rows = await db
    .select({
      min: sql<number | null>`min(${listings.price})::int`,
      max: sql<number | null>`max(${listings.price})::int`,
    })
    .from(listings)
    .where(
      and(
        eq(listings.isSold, false),
        sql`lower(${listings.brand}) = ${brand}`,
        sql`lower(${listings.model}) = ${model}`,
      ),
    );
  return { min: rows[0]?.min ?? null, max: rows[0]?.max ?? null };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!ENABLE_SHORT_MODEL_LANDINGS) {
    return {
      title: "Inzerát nenalezen | NNAuto",
      robots: { index: false, follow: false },
    };
  }
  const { modelSlug } = await params;
  const match = await parseShortModelSlug(modelSlug);
  if (!match) {
    return {
      title: "Inzerát nenalezen | NNAuto",
      robots: { index: false, follow: false },
    };
  }

  const { brand, model } = match;
  const brandName = formatBrandDisplay(brand);
  const modelName = formatModelDisplay(model);
  const total = await countModelListings(brand, model);

  const title = total
    ? `${brandName} ${modelName} na prodej v ČR – ojetá i nová auta | NNAuto`
    : `${brandName} ${modelName} | NNAuto`;
  const description = total
    ? `Aktuální nabídka ${brandName} ${modelName} v ČR – ${total}+ ověřených inzerátů. Filtrujte podle ceny, roku a najetých km, kontaktujte prodejce přímo na NNAuto.`
    : `Aktuální nabídka ${brandName} ${modelName} na NNAuto.`;

  // Phase 1 canonical policy: short URL canonicalizes to the existing
  // /auta/{brand}/{model} landing. No SEO weight transfer, no risk to
  // current rankings.
  const canonical = `${SITE_ORIGIN}/auta/${brand}/${model}`;

  return {
    title,
    description,
    robots:
      total >= MIN_INDEX
        ? { index: true, follow: true }
        : { index: false, follow: true },
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
  };
}

export default async function ShortModelLandingPage({ params }: Props) {
  if (!ENABLE_SHORT_MODEL_LANDINGS) notFound();

  const { modelSlug } = await params;
  const match = await parseShortModelSlug(modelSlug);
  if (!match) notFound();

  const { brand, model } = match;
  const [rows, total, price] = await Promise.all([
    queryModelListings(brand, model),
    countModelListings(brand, model),
    priceRange(brand, model),
  ]);

  if (total === 0) notFound();

  const brandName = formatBrandDisplay(brand);
  const modelName = formatModelDisplay(model);
  const formatPrice = (n: number | null) =>
    n !== null ? `${n.toLocaleString("cs-CZ")} Kč` : null;

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
        item: `${SITE_ORIGIN}/auta/${brand}`,
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
        <a href={`/auta/${brand}`} className="hover:underline">
          {brandName}
        </a>
        <span>/</span>
        <span className="text-foreground font-medium">{modelName}</span>
      </nav>

      <h1 className="text-3xl md:text-4xl font-bold mb-3">
        {brandName} {modelName} na prodej v ČR
      </h1>

      <p className="text-muted-foreground max-w-3xl mb-4">
        Hledáte <strong>{brandName} {modelName}</strong>? Na NNAuto máme
        aktuálně <strong>{total}</strong>{" "}
        {total === 1 ? "inzerát" : total < 5 ? "inzeráty" : "inzerátů"} této
        modelové řady
        {price.min !== null && price.max !== null
          ? `, ceny od ${formatPrice(price.min)} do ${formatPrice(price.max)}`
          : ""}
        . Inzeráty pocházejí od soukromých prodejců i ověřených autobazarů –
        kontaktujete je přímo, bez mezičlánků a poplatků.
      </p>

      <div className="mb-6 flex flex-wrap gap-2">
        <a
          href={`/auta/${brand}/${model}`}
          className="rounded-md bg-[#B8860B] text-white px-4 py-2 text-sm font-medium"
        >
          Otevřít {brandName} {modelName}
        </a>
        <a
          href={`/auta/${brand}`}
          className="rounded-md border px-4 py-2 text-sm hover:bg-accent"
        >
          Vše {brandName}
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

      <section className="mt-10 prose max-w-none text-muted-foreground space-y-3 text-[15px] leading-relaxed">
        <h2 className="text-xl font-semibold text-foreground">
          {brandName} {modelName} – stručný přehled
        </h2>
        <p>
          <strong>{brandName} {modelName}</strong> patří mezi vyhledávané
          modely na českém trhu ojetých vozů. Před nákupem zkontrolujte
          servisní knížku, soulad reálného nájezdu s technickým průkazem a
          celkový technický stav vozu. U starších ročníků doporučujeme
          prověření přes <strong>Cebia</strong> – online report z VIN kódu
          odhalí historii vozu, počet majitelů a případné havárie.
        </p>
        <p>
          Pokud chcete{" "}
          <a href={`/auta/${brand}/${model}`} className="underline">
            prohlédnout všechny detaily {brandName} {modelName}
          </a>
          , otevřete kompletní stránku modelu s podrobnými statistikami a SEO
          popisem. Můžete také prohlížet{" "}
          <a href="/listings" className="underline">
            celý katalog inzerátů
          </a>{" "}
          a filtrovat podle značky, ceny, paliva a regionu.
        </p>
      </section>
    </main>
  );
}
