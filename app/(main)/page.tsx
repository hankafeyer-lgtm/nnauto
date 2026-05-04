import type { Metadata } from "next";
import JsonLd from "@lib/seo/JsonLd";
import { buildHomePageJsonLdGraph } from "@lib/seo/structured-data";
import { formatBrandDisplay, formatModelDisplay } from "@lib/seo/brand-format";
import { normalizeSlug } from "@lib/seo/slug";
import { db } from "@lib/db";
import { listings } from "@shared/schema";
import { eq, sql, desc } from "drizzle-orm";
import HomeClient from "./home-client";

const HOME_TITLE =
  "NNAuto - Prémiový Marketplace Aut v ČR | Prodej a Nákup Vozidel";
const HOME_DESCRIPTION =
  "NNAuto – moderní online autobazar v ČR. Tisíce ověřených inzerátů osobních aut, motocyklů a nákladních vozidel. Filtrujte podle značky, modelu, ceny a regionu.";
const HOME_OG_DESCRIPTION =
  "Najděte své vysněné auto na NNAuto. Osobní auta, motocykly i nákladní vozy. Ověření prodejci, pokročilé filtry a kontakt přímo s majitelem inzerátu.";

const POPULAR_BRANDS = [
  "bmw",
  "audi",
  "skoda",
  "mercedes-benz",
  "volkswagen",
  "volvo",
  "ford",
  "jeep",
];

export const metadata: Metadata = {
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  openGraph: {
    title: "NNAuto - Prémiový Marketplace Aut v České Republice",
    description: HOME_OG_DESCRIPTION,
    url: "https://nnauto.cz",
    siteName: "NNAuto",
    images: [{ url: "https://nnauto.cz/og-image.png", width: 1200, height: 630 }],
    locale: "cs_CZ",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NNAuto - Prémiový Marketplace Aut v České Republice",
    description: HOME_OG_DESCRIPTION,
    images: ["https://nnauto.cz/og-image.png"],
  },
  alternates: { canonical: "https://nnauto.cz" },
};

export const revalidate = 900;

async function getTopModels(limit = 30) {
  return db
    .select({
      brand: listings.brand,
      model: listings.model,
      total: sql<number>`count(*)::int`,
    })
    .from(listings)
    .where(eq(listings.isSold, false))
    .groupBy(listings.brand, listings.model)
    .having(sql`count(*) >= 1`)
    .orderBy(desc(sql`count(*)`))
    .limit(limit);
}

export default async function Home() {
  const topModels = await getTopModels(30);
  return (
    <>
      <JsonLd data={buildHomePageJsonLdGraph()} />
      {/* SEO H1 — kept visually hidden so the hero design stays untouched. */}
      <h1 className="sr-only">
        Prodej a nákup ojetých aut v ČR
      </h1>
      <HomeClient />

      {/* Visible SEO content block — placed below the dynamic hero / listings.
          Server-rendered so crawlers see real text and internal links to brand
          landings. Does not interfere with filters or any client-side state. */}
      <section
        aria-labelledby="home-seo-brands"
        className="container mx-auto max-w-6xl px-4 py-10 border-t mt-8"
      >
        <h2
          id="home-seo-brands"
          className="text-xl md:text-2xl font-semibold mb-4"
        >
          Populární značky
        </h2>
        <ul className="flex flex-wrap gap-2">
          {POPULAR_BRANDS.map((slug) => (
            <li key={slug}>
              <a
                href={`/auta/${slug}`}
                className="inline-block rounded-md border px-3 py-1.5 text-sm hover:bg-accent transition-colors"
              >
                {formatBrandDisplay(slug)}
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-muted-foreground">
          Procházejte také{" "}
          <a href="/listings" className="underline hover:text-foreground">
            kompletní katalog inzerátů
          </a>{" "}
          nebo{" "}
          <a href="/add-listing" className="underline hover:text-foreground">
            přidejte vlastní inzerát
          </a>
          .
        </p>
      </section>

      {/* Top brand+model combos linking to /prodej SEO landings */}
      {topModels.length > 0 && (
        <section
          aria-labelledby="home-seo-models"
          className="container mx-auto max-w-6xl px-4 py-6"
        >
          <h2
            id="home-seo-models"
            className="text-xl md:text-2xl font-semibold mb-4"
          >
            Populární modely na prodej
          </h2>
          <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {topModels.map((m) => {
              const brandSlug = normalizeSlug(String(m.brand));
              const modelSlug = normalizeSlug(String(m.model));
              const brandName = formatBrandDisplay(m.brand);
              const modelName = formatModelDisplay(m.model);
              return (
                <li key={`${brandSlug}-${modelSlug}`}>
                  <a
                    href={`/${brandSlug}-${modelSlug}-prodej`}
                    className="flex items-center justify-between rounded-md border px-3 py-2 text-sm hover:bg-accent transition-colors"
                  >
                    <span className="truncate font-medium">
                      {brandName} {modelName}
                    </span>
                    <span className="ml-2 shrink-0 text-xs text-muted-foreground">
                      {m.total}
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section
        aria-labelledby="home-seo-text"
        className="container mx-auto max-w-6xl px-4 pb-12"
      >
        <h2
          id="home-seo-text"
          className="text-xl md:text-2xl font-semibold mb-3"
        >
          Online autobazar NNAuto – prodej a nákup ojetých aut
        </h2>
        <div className="prose max-w-none text-muted-foreground space-y-3 text-[15px] leading-relaxed">
          <p>
            <strong>NNAuto</strong> je moderní online autobazar pro Českou
            republiku, kde najdete tisíce ověřených inzerátů osobních aut,
            motocyklů a nákladních vozidel. Spojujeme prodejce a kupce
            přímo, bez mezičlánků. Každý inzerát obsahuje detailní popis,
            fotografie, technické parametry a kontakt přímo na majitele
            nebo prověřený autobazar.
          </p>
          <p>
            Vyberte si auto pomocí pokročilých filtrů – nastavte si značku
            (například{" "}
            <a href="/auta/bmw" className="underline">
              BMW
            </a>
            ,{" "}
            <a href="/auta/audi" className="underline">
              Audi
            </a>
            ,{" "}
            <a href="/auta/skoda" className="underline">
              Škoda
            </a>{" "}
            nebo{" "}
            <a href="/auta/mercedes-benz" className="underline">
              Mercedes-Benz
            </a>
            ), model, rok výroby, rozsah ceny a najetých kilometrů, palivo,
            převodovku nebo region prodejce. Inzeráty filtrujete v reálném
            čase a okamžitě vidíte, kolik vozů odpovídá vašim parametrům.
          </p>
          <p>
            Prodáváte auto? Vložte zdarma inzerát během několika minut.
            Nahrajte fotografie, popište výbavu a servisní historii a
            uveďte cenu. Pro rychlejší prodej můžete využít zvýraznění{" "}
            <a href="/pricing" className="underline">
              TOP inzerátu
            </a>{" "}
            – posune vaši nabídku nahoru ve výpisu a získá viditelný
            štítek. Doplňkově nabízíme prověření vozu přes Cebia, který
            online z VIN kódu odhalí historii, počet majitelů a případné
            havárie.
          </p>
          <p>
            Kupujete ojeté auto? Vždy si u staršího vozu prověřte servisní
            knížku, stav karoserie a soulad reálného nájezdu s technickým
            průkazem. Užitečné{" "}
            <a href="/tips" className="underline">
              tipy a rady při nákupu auta
            </a>{" "}
            jsme připravili v samostatné sekci. NNAuto je dostupné na
            počítači i na mobilu – inzeráty si snadno uložíte a vrátíte se
            k nim později.
          </p>
        </div>
      </section>
    </>
  );
}
