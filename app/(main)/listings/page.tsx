import type { Metadata } from "next";
import JsonLd from "@lib/seo/JsonLd";
import { getRecentActiveListings } from "@lib/seo/recent-listings";
import { buildListingIndexItemListJsonLd } from "@lib/seo/structured-data";
import { formatBrandDisplay } from "@lib/seo/brand-format";
import ListingsClient from "./listings-client";

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

export const metadata: Metadata = {
  title: LISTINGS_TITLE,
  description: LISTINGS_DESCRIPTION,
  openGraph: {
    title: LISTINGS_TITLE,
    description: LISTINGS_DESCRIPTION,
    url: "https://nnauto.cz/listings",
    siteName: "NNAuto",
    images: [{ url: "https://nnauto.cz/og-image.png", width: 1200, height: 630 }],
    locale: "cs_CZ",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: LISTINGS_TITLE,
    description: LISTINGS_DESCRIPTION,
    images: ["https://nnauto.cz/og-image.png"],
  },
  alternates: { canonical: "https://nnauto.cz/listings" },
};

const LISTING_INDEX_JSONLD_COUNT = 80;

export default async function Listings() {
  const recent = await getRecentActiveListings(LISTING_INDEX_JSONLD_COUNT);
  const itemListJsonLd = buildListingIndexItemListJsonLd(recent);

  return (
    <>
      <JsonLd data={itemListJsonLd} />
      {/* SEO H1 — kept visually hidden so the catalog UI is untouched. */}
      <h1 className="sr-only">Inzeráty vozidel v České republice</h1>
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
            paliva, převodovky, pohonu, počtu majitelů nebo regionu.
            Filtry se aplikují v reálném čase a okamžitě uvidíte, kolik
            vozů odpovídá vašim parametrům.
          </p>
          <p>
            Mezi nejhledanější značky v ČR patří{" "}
            <a href="/auta/skoda" className="underline">
              Škoda
            </a>{" "}
            (Octavia, Fabia, Superb, Kodiaq),{" "}
            <a href="/auta/volkswagen" className="underline">
              Volkswagen
            </a>{" "}
            (Passat, Golf, Tiguan, Touran),{" "}
            <a href="/auta/bmw" className="underline">
              BMW
            </a>{" "}
            (řada 3, řada 5, X3, X5),{" "}
            <a href="/auta/audi" className="underline">
              Audi
            </a>{" "}
            (A4, A6, Q5, Q7) a{" "}
            <a href="/auta/mercedes-benz" className="underline">
              Mercedes-Benz
            </a>{" "}
            (C-Class, E-Class, GLC). Pro každou značku máme samostatnou
            SEO stránku s přehledem aktuálních inzerátů, popisem a
            interními filtry. Z brandové stránky se jedním kliknutím
            dostanete na kompletní filtrovaný katalog.
          </p>
          <p>
            <strong>Jak vybrat správné ojeté auto.</strong> Při hledání
            doporučujeme nejprve si stanovit rozpočet (včetně rezervy na
            servis), preferovaný typ paliva a karoserie a potom procházet
            inzeráty. U benzínových motorů je obvyklý nájezd 15–20 tisíc
            km ročně, u dieselových 25–35 tisíc km ročně. Vůz s výrazně
            nižším nájezdem v poměru ke stáří může být buď garážový kus,
            nebo (méně příjemně) auto se stočeným tachometrem. Reálný
            nájezd ověříte v servisní knížce nebo přes Cebia report.
          </p>
          <p>
            <strong>Kontrola před koupí.</strong> Při osobní prohlídce
            zaměřte pozornost na karoserii (koroze pod prahy, lemy kol,
            víka, podběhy), kvalitu laku (rozdíly v odstínech mezi díly
            mohou znamenat opravu po havárii), stav motoru (úniky oleje,
            stav rozvodů, výkon při zkušební jízdě), převodovku
            (přeřazování, pískání, házení) a interiér (stav volantu,
            sedadel, řadicí páky – musí odpovídat údajům na tachometru).
            U automobilů s automatickou převodovkou si nechte zkontrolovat
            i hladinu a barvu oleje.
          </p>
          <p>
            <strong>Cebia prověření vozu.</strong> U starších vozidel
            silně doporučujeme objednat online report Cebia – odhalí
            historii vozu (předchozí registrace, nájezdy z STK, případné
            havárie), počet majitelů, zástavy a leasingy. Cebia je
            oficiální nástroj uznávaný v celé ČR a najdete ho přímo u
            inzerátů na NNAuto, kde má prodejce Cebia objednanou. Více{" "}
            <a href="/tips" className="underline">
              tipů a rad při nákupu auta
            </a>{" "}
            najdete v samostatné sekci.
          </p>
          <p>
            <strong>Prodáváte vůz?</strong> Vložte{" "}
            <a href="/add-listing" className="underline">
              vlastní inzerát zdarma
            </a>{" "}
            během několika minut – přidejte 8–12 fotografií, detailní
            popis, výbavu, servisní historii a cenu. Pro rychlejší prodej
            využijte{" "}
            <a href="/pricing" className="underline">
              TOP zvýraznění
            </a>{" "}
            – inzerát se posune na začátek výpisu a získá výrazný štítek.
            Pravidelní prodejci a autobazary mohou využít dealerský účet
            se statistikami zobrazení a kontaktů. Cenu inzerátu doporučujeme
            stanovit podle aktuální nabídky podobných vozů na NNAuto –
            srovnání usnadňuje filtr podle značky, modelu a roku.
          </p>
          <p>
            <strong>NNAuto na mobilu.</strong> Mobilní verze je plně
            funkční a obsahuje všechny filtry stejně jako desktop.
            Fotografie listujete prstem, kontakt na prodejce je vždy
            jeden klik. Mapování dat (rok, nájezd, cena, region) je
            optimalizované pro načítání i na pomalejším mobilním
            připojení. Více informací o našich službách najdete na
            stránce{" "}
            <a href="/about" className="underline">
              O nás
            </a>{" "}
            nebo se podívejte na{" "}
            <a href="/pricing" className="underline">
              ceník služeb
            </a>
            , kde najdete aktuální tarify za TOP zvýraznění a Cebia
            prověření.
          </p>
        </div>
      </section>
    </>
  );
}
