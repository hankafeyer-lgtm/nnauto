import type { Metadata } from "next";
import JsonLd from "@lib/seo/JsonLd";
import { getRecentActiveListings } from "@lib/seo/recent-listings";
import { buildListingIndexItemListJsonLd } from "@lib/seo/structured-data";
import { formatBrandDisplay } from "@lib/seo/brand-format";
import { SITE_ORIGIN } from "@lib/seo/constants";
import { buildListingsPageMetadata } from "@lib/seo/listings-metadata";
import ListingsClient from "./listings-client";
import ListingsServerPreview from "./listings-server-preview";

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

/** Refresh server JSON-LD ItemList so new listings appear in HTML between builds. */
export const revalidate = 300;

const LISTINGS_TITLE = "Inzeráty vozidel – ojetá i nová auta v ČR | NNAuto";
const LISTINGS_DESCRIPTION =
  "Prohlédněte si aktuální nabídku osobních aut, motocyklů a nákladních vozidel na NNAuto. Ověřené inzeráty od soukromých prodejců i autobazarů. Filtrujte podle značky, modelu, roku výroby, ceny, najetých kilometrů a regionu. Kontaktujte prodejce přímo.";

/**
 * Plain /listings is indexable. Any /listings?… filter URL is noindex,follow
 * with canonical to /listings or the matching /auta/… SEO cluster.
 */
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const params = await searchParams;

  return buildListingsPageMetadata(params, {
    title: LISTINGS_TITLE,
    description: LISTINGS_DESCRIPTION,
    openGraph: {
      title: LISTINGS_TITLE,
      description: LISTINGS_DESCRIPTION,
      url: `${SITE_ORIGIN}/listings`,
      siteName: "NNAuto",
      images: [{ url: `${SITE_ORIGIN}/og-image.png`, width: 1200, height: 630 }],
      locale: "cs_CZ",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: LISTINGS_TITLE,
      description: LISTINGS_DESCRIPTION,
      images: [`${SITE_ORIGIN}/og-image.png`],
    },
  });
}

const LISTING_INDEX_JSONLD_COUNT = 80;

export default async function Listings() {
  const recent = await getRecentActiveListings(LISTING_INDEX_JSONLD_COUNT);
  const itemListJsonLd = buildListingIndexItemListJsonLd(recent);

  // BreadcrumbList JSON-LD so Google understands /listings is the catalogue
  // root in the site hierarchy. Pairs with breadcrumb schema already emitted
  // by /auta/[brand], /auta/[brand]/[model] and /listing/[id].
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
    ],
  };

  return (
    <>
      <JsonLd data={itemListJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      {/* SEO H1 — kept visually hidden so the catalog UI is untouched. */}
      <h1 className="sr-only">Inzeráty vozidel v České republice</h1>
      <ListingsServerPreview />
      <ListingsClient />

      {/* Visible SEO content + brand internal links — placed below the catalog.
          Server-rendered, does not interact with filters or client state. */}
      <section
        aria-labelledby="listings-seo-brands"
        className="container mx-auto max-w-6xl px-4 py-10 border-t mt-8"
      >
        <h2
          id="listings-seo-brands"
          className="text-xl md:text-2xl font-semibold mb-4"
        >
          Procházet podle značky
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
      </section>

      <section
        aria-labelledby="listings-seo-text"
        className="container mx-auto max-w-6xl px-4 pb-12"
      >
        <h2
          id="listings-seo-text"
          className="text-xl md:text-2xl font-semibold mb-3"
        >
          Inzeráty vozidel – ojetá i nová auta v ČR
        </h2>
        <div className="prose max-w-none text-muted-foreground space-y-3 text-[15px] leading-relaxed">
          <p>
            Aktuální nabídka <strong>ojetých i nových vozů</strong> na
            NNAuto pokrývá všechny populární kategorie – osobní auta,
            motocykly, dodávky a nákladní vozidla. Inzeráty pocházejí jak
            od soukromých prodejců, tak od ověřených autobazarů. Filtrujte
            si nabídku podle značky, modelu, roku výroby, ceny, nájezdu,
            paliva, převodovky nebo regionu.
          </p>
          <p>
            Mezi nejhledanější značky v ČR patří{" "}
            <a href="/auta/skoda" className="underline">
              Škoda
            </a>{" "}
            (Octavia, Fabia, Superb),{" "}
            <a href="/auta/volkswagen" className="underline">
              Volkswagen
            </a>{" "}
            (Passat, Golf, Tiguan),{" "}
            <a href="/auta/bmw" className="underline">
              BMW
            </a>
            ,{" "}
            <a href="/auta/audi" className="underline">
              Audi
            </a>{" "}
            a{" "}
            <a href="/auta/mercedes-benz" className="underline">
              Mercedes-Benz
            </a>
            . Pro každou značku máme samostatnou stránku s přehledem
            aktuálních inzerátů, popisem a interními filtry.
          </p>
          <p>
            Při výběru ojetého auta si vždy zkontrolujte servisní knihu,
            stav karoserie, soulad reálného nájezdu s údaji v technickém
            průkazu a celkový technický stav vozu. U starších vozidel
            doporučujeme prověření přes <strong>Cebia</strong> – online
            report z VIN kódu odhalí historii vozu, počet majitelů a
            případné havárie. Více{" "}
            <a href="/tips" className="underline">
              tipů a rad při nákupu auta
            </a>{" "}
            najdete v samostatné sekci.
          </p>
          <p>
            Prodáváte vůz? Vložte{" "}
            <a href="/add-listing" className="underline">
              vlastní inzerát zdarma
            </a>{" "}
            – přidejte fotografie, popis a cenu. Pro rychlejší prodej
            využijte{" "}
            <a href="/pricing" className="underline">
              TOP zvýraznění
            </a>
            . NNAuto je dostupné na počítači i mobilu, inzeráty jsou
            optimalizované pro vyhledávání v Google a Seznam.
          </p>
        </div>
      </section>
    </>
  );
}
