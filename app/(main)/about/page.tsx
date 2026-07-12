import type { Metadata } from "next";
import JsonLd from "@lib/seo/JsonLd";
import { buildBreadcrumbJsonLd } from "@lib/seo/structured-data";
import AboutClient from "./about-client";

const ABOUT_TITLE = "O nás – online autobazar NNAuto v ČR | NNAuto";
const ABOUT_DESCRIPTION =
  "NNAuto je online autobazar v České republice s ověřenými inzeráty osobních aut, motocyklů a nákladních vozů. Spojujeme prodejce a kupce přímo, bez mezičlánků a skrytých poplatků.";

export const metadata: Metadata = {
  title: ABOUT_TITLE,
  description: ABOUT_DESCRIPTION,
  openGraph: {
    title: ABOUT_TITLE,
    description: ABOUT_DESCRIPTION,
    url: "https://nnauto.cz/about",
    siteName: "NNAuto",
    images: [
      { url: "https://nnauto.cz/og-image.png", width: 1200, height: 630 },
    ],
    locale: "cs_CZ",
    type: "website",
  },
  alternates: { canonical: "https://nnauto.cz/about" },
};

export default function About() {
  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "NNAuto", url: "https://nnauto.cz/" },
          { name: "O nás", url: "https://nnauto.cz/about" },
        ])}
      />
      {/* SSR-only SEO content for crawlers. Visible page is rendered by AboutClient
          (client component). This block does not affect user UX. */}
      <section className="sr-only" aria-hidden="true">
        <h1>O nás – online autobazar NNAuto</h1>
        <h2>Jak NNAuto pomáhá při nákupu a prodeji aut</h2>
        <p>
          NNAuto je online autobazar pro prodej a nákup ojetých i nových
          automobilů, motocyklů a nákladních vozidel v České republice.
          Naším cílem je přímý kontakt mezi prodejcem a kupujícím, bez
          mezičlánků a bez skrytých poplatků. Každý inzerát obsahuje
          podrobný popis, fotografie, technické parametry a přímý kontakt.
        </p>
        <p>
          Na NNAuto najdete tisíce vozů od soukromých prodejců i prověřených
          autobazarů – BMW, Audi, Škoda, Mercedes-Benz, Volkswagen, Volvo,
          Ford, Jeep a další značky. Inzeráty lze filtrovat podle značky,
          modelu, roku výroby, ceny, nájezdu, paliva, převodovky a regionu.
        </p>
        <p>
          U vybraných inzerátů nabízíme prověření Cebia – online report
          historie vozu z VIN kódu. Můžete si tak ověřit počet majitelů,
          pravost najetých kilometrů, případnou havárii nebo zástavu vozu.
          Bezpečné nakupování ojetého auta začíná u kvalitních informací.
        </p>
        <nav aria-label="Interní odkazy">
          <a href="/auta">Katalog aut</a>
          <a href="/listings">Aktuální inzeráty</a>
          <a href="/prodat-auto">Prodat auto</a>
          <a href="/pricing">Ceník služeb</a>
        </nav>
      </section>
      <AboutClient />
    </>
  );
}
