import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@lib/db";
import { listings } from "@shared/schema";
import { and, desc, eq, sql, type SQL } from "drizzle-orm";
import { SITE_ORIGIN } from "@lib/seo/constants";
import { buildListingUrl } from "@lib/seo/listing-url";
import { getListingMainTitleFromRow } from "@lib/seo/listing-title";
import JsonLd from "@lib/seo/JsonLd";
import {
  parseProdejSlug,
  generateSeoText,
  type ProdejSlugParsed,
} from "@lib/seo/prodej-landing";

export const revalidate = 900;

type Props = { params: Promise<{ slug: string }> };

function buildFilterCondition(filter: ProdejSlugParsed["filter"]): SQL | null {
  if (!filter) return null;
  switch (filter.type) {
    case "fuel":
      return sql`EXISTS (SELECT 1 FROM unnest(coalesce(${listings.fuelType}, ARRAY[]::text[])) AS f WHERE lower(f) = ${filter.value})`;
    case "transmission":
      return sql`EXISTS (SELECT 1 FROM unnest(coalesce(${listings.transmission}, ARRAY[]::text[])) AS t WHERE lower(t) = ${filter.value})`;
    case "body":
      return sql`lower(${listings.bodyType}) = ${filter.value}`;
    case "year":
      return eq(listings.year, Number(filter.value));
    default:
      return null;
  }
}

async function queryListings(brandSlug: string, modelSlug: string, filter: ProdejSlugParsed["filter"], limit = 30) {
  const conditions: SQL[] = [
    eq(listings.isSold, false),
    sql`lower(${listings.brand}) = ${brandSlug}`,
    sql`lower(regexp_replace(${listings.model}, E'\\s+', '-', 'g')) = ${modelSlug}`,
  ];
  const fc = buildFilterCondition(filter);
  if (fc) conditions.push(fc);
  return db.select().from(listings).where(and(...conditions)).orderBy(desc(listings.updatedAt)).limit(limit);
}

async function countListings(brandSlug: string, modelSlug: string, filter: ProdejSlugParsed["filter"]) {
  const conditions: SQL[] = [
    eq(listings.isSold, false),
    sql`lower(${listings.brand}) = ${brandSlug}`,
    sql`lower(regexp_replace(${listings.model}, E'\\s+', '-', 'g')) = ${modelSlug}`,
  ];
  const fc = buildFilterCondition(filter);
  if (fc) conditions.push(fc);
  const [row] = await db.select({ c: sql<number>`count(*)::int` }).from(listings).where(and(...conditions));
  return row?.c ?? 0;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const parsed = parseProdejSlug(slug);
  if (!parsed) return { title: "Stránka nenalezena | NNAuto" };

  const { brandDisplay, modelDisplay, canonical, filter } = parsed;
  const bm = `${brandDisplay} ${modelDisplay}`;
  const filterLabel = filter ? ` ${filter.display}` : "";
  const fullLabel = `${bm}${filterLabel}`;
  const title = `${fullLabel} na prodej | Bazar aut ČR | NNAuto`;
  const description = filter
    ? `Prohlédněte si nabídku vozů ${bm} ${filter.display} na prodej. Aktuální inzeráty ${filter.type === "fuel" ? `s palivem ${filter.display}` : filter.type === "transmission" ? `s převodovkou ${filter.display}` : filter.type === "body" ? `v karosérii ${filter.display}` : `rok ${filter.display}`} na NNAuto.cz.`
    : `Prohlédněte si nabídku vozů ${bm} na prodej. Ověřená auta, aktuální nabídky a jednoduchý výběr na NNAuto.cz. Filtrujte podle roku, ceny a najetých km.`;

  const total = await countListings(parsed.brandSlug, parsed.modelSlug, filter);
  const shouldIndex = total >= 2;

  return {
    title,
    description,
    alternates: { canonical },
    robots: shouldIndex ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "NNAuto",
      locale: "cs_CZ",
      type: "website",
      images: [{ url: `${SITE_ORIGIN}/og-image.png`, width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", title, description },
    keywords: [
      fullLabel,
      `${fullLabel} prodej`,
      `${fullLabel} bazar`,
      `ojeté ${bm}${filterLabel}`,
      `koupit ${fullLabel}`,
      "autobazar ČR",
      "NNAuto",
    ].join(", "),
  };
}

export default async function ProdejLandingPage({ params }: Props) {
  const { slug } = await params;
  const parsed = parseProdejSlug(slug);
  if (!parsed) notFound();

  const { brandSlug, modelSlug, brandDisplay, modelDisplay, canonical, filter } = parsed;
  const bm = `${brandDisplay} ${modelDisplay}`;
  const filterLabel = filter ? ` ${filter.display}` : "";
  const fullLabel = `${bm}${filterLabel}`;

  const [rows, total] = await Promise.all([
    queryListings(brandSlug, modelSlug, filter, 30),
    countListings(brandSlug, modelSlug, filter),
  ]);

  const seoText = generateSeoText(brandDisplay, modelDisplay, total);

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${bm} – inzeráty na NNAuto`,
    numberOfItems: total,
    itemListElement: rows.map((l, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_ORIGIN}${buildListingUrl({ id: l.id, brand: l.brand, model: l.model })}`,
      name: getListingMainTitleFromRow(l),
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "NNAuto", item: `${SITE_ORIGIN}/` },
      { "@type": "ListItem", position: 2, name: "Prodej aut", item: `${SITE_ORIGIN}/listings` },
      { "@type": "ListItem", position: 3, name: `${fullLabel} na prodej` },
    ],
  };

  return (
    <>
      <JsonLd data={itemListJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: `Kolik stojí ${fullLabel}?`,
            acceptedAnswer: { "@type": "Answer", text: `Ceny ${fullLabel} na NNAuto se pohybují v závislosti na roku výroby, nájezdu a stavu. Aktuálně evidujeme ${total} nabídek. Prohlédněte si inzeráty na této stránce.` },
          },
          {
            "@type": "Question",
            name: `Kde koupit ${fullLabel} v ČR?`,
            acceptedAnswer: { "@type": "Answer", text: `Na NNAuto.cz najdete ověřené inzeráty ${fullLabel} od soukromých prodejců i autobazarů z celé České republiky. Kontaktujete prodejce přímo.` },
          },
        ],
      }} />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto max-w-5xl px-4 py-8 sm:py-10">
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="mb-6 flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground"
          >
            <a href="/" className="hover:underline">NNAuto</a>
            <span aria-hidden>›</span>
            <a href="/listings" className="hover:underline">Inzeráty</a>
            <span aria-hidden>›</span>
            <a href={`/auta/${brandSlug}`} className="hover:underline">{brandDisplay}</a>
            <span aria-hidden>›</span>
            <span aria-current="page">{modelDisplay}</span>
          </nav>

          {/* H1 */}
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            {fullLabel} na prodej
          </h1>

          <p className="text-lg text-muted-foreground mb-8 max-w-3xl">
            Aktuální nabídka {total > 0 ? total : ""} vozů {fullLabel} na NNAuto.cz.
            Ověřené inzeráty od soukromých prodejců i autobazarů v ČR.
          </p>

          {/* Listings grid */}
          {rows.length > 0 ? (
            <section aria-label={`Inzeráty ${bm}`} className="mb-12">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {rows.map((l) => {
                  const photo = l.photos?.[0];
                  const price = Number(l.price).toLocaleString("cs-CZ");
                  const href = buildListingUrl({ id: l.id, brand: l.brand, model: l.model });
                  const title = getListingMainTitleFromRow(l);
                  return (
                    <a
                      key={l.id}
                      href={href}
                      className="group block overflow-hidden rounded-xl border border-border bg-card transition-colors hover:bg-accent/40"
                    >
                      {photo ? (
                        <img
                          src={`${SITE_ORIGIN}/img/${photo.replace(/^\/+/, "")}?w=480&q=76&f=webp`}
                          alt={title}
                          loading="lazy"
                          width={480}
                          height={320}
                          className="aspect-[3/2] w-full object-cover"
                        />
                      ) : (
                        <div className="aspect-[3/2] w-full bg-muted flex items-center justify-center text-muted-foreground text-sm">
                          Bez fotky
                        </div>
                      )}
                      <div className="p-3 space-y-1">
                        <p className="text-sm font-medium line-clamp-2 group-hover:underline">
                          {title}
                        </p>
                        <p className="text-primary font-semibold">{price} Kč</p>
                        {l.mileage ? (
                          <p className="text-xs text-muted-foreground">
                            {l.mileage.toLocaleString("cs-CZ")} km · {l.year}
                          </p>
                        ) : null}
                      </div>
                    </a>
                  );
                })}
              </div>
              <div className="mt-6 text-center">
                <a
                  href={`/listings?brand=${encodeURIComponent(brandSlug)}&model=${encodeURIComponent(modelSlug)}`}
                  className="inline-block rounded-md border px-5 py-2.5 text-sm font-medium hover:bg-accent transition-colors"
                >
                  Zobrazit všech {total} nabídek {bm} →
                </a>
              </div>
            </section>
          ) : (
            <section className="mb-12 rounded-lg border border-border bg-muted/30 px-6 py-10 text-center">
              <p className="text-muted-foreground">
                Momentálně nejsou dostupné žádné vozy této modelové řady.
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Podívejte se na{" "}
                <a href={`/auta/${brandSlug}`} className="underline hover:text-foreground">
                  další modely {brandDisplay}
                </a>{" "}
                nebo{" "}
                <a href="/listings" className="underline hover:text-foreground">
                  celý katalog
                </a>.
              </p>
            </section>
          )}

          {/* SEO text */}
          <article
            className="prose prose-sm max-w-none text-muted-foreground dark:prose-invert"
            dangerouslySetInnerHTML={{
              __html: seoText
                .replace(/^## (.+)$/gm, "<h2>$1</h2>")
                .replace(/^### (.+)$/gm, "<h3>$1</h3>")
                .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
                .replace(/^- (.+)$/gm, "<li>$1</li>")
                .replace(/(<li>.*<\/li>\n?)+/gs, (m) => `<ul>${m}</ul>`)
                .replace(/^(\d+)\. (.+)$/gm, "<li>$2</li>")
                .replace(/\n\n/g, "</p><p>")
                .replace(/^/, "<p>")
                .replace(/$/, "</p>"),
            }}
          />

          {/* Related variant links — internal linking for SEO */}
          <nav className="mt-8" aria-label="Související nabídky">
            <h3 className="text-base font-semibold mb-2 text-muted-foreground">
              Další nabídky {bm}
            </h3>
            <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
              {!filter && (
                <>
                  <li><a href={`/prodej/${brandSlug}-${modelSlug}-diesel`} className="text-muted-foreground hover:text-foreground hover:underline">{bm} diesel</a></li>
                  <li><a href={`/prodej/${brandSlug}-${modelSlug}-benzin`} className="text-muted-foreground hover:text-foreground hover:underline">{bm} benzín</a></li>
                  <li><a href={`/prodej/${brandSlug}-${modelSlug}-automat`} className="text-muted-foreground hover:text-foreground hover:underline">{bm} automat</a></li>
                  <li><a href={`/prodej/${brandSlug}-${modelSlug}-kombi`} className="text-muted-foreground hover:text-foreground hover:underline">{bm} kombi</a></li>
                </>
              )}
              {filter && (
                <li><a href={`/prodej/${brandSlug}-${modelSlug}`} className="text-muted-foreground hover:text-foreground hover:underline">Všechny {bm}</a></li>
              )}
              <li><a href={`/auta/${brandSlug}`} className="text-muted-foreground hover:text-foreground hover:underline">{brandDisplay} – všechny modely</a></li>
              <li><a href={`/auta/${brandSlug}/${modelSlug}`} className="text-muted-foreground hover:text-foreground hover:underline">{bm} – katalog</a></li>
            </ul>
          </nav>

          {/* CTA */}
          <div className="mt-10 flex flex-wrap gap-3">
            <a
              href={`/listings?brand=${encodeURIComponent(brandSlug)}&model=${encodeURIComponent(modelSlug)}`}
              className="rounded-md bg-[#B8860B] text-white px-5 py-2.5 font-medium hover:bg-[#9c7308] transition-colors"
            >
              Všechny {fullLabel} na NNAuto
            </a>
            <a
              href="/add-listing"
              className="rounded-md border px-5 py-2.5 font-medium hover:bg-accent transition-colors"
            >
              Prodat {bm}
            </a>
          </div>
        </div>
      </main>
    </>
  );
}
