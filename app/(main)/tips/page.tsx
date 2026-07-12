import type { Metadata } from "next";
import JsonLd from "@lib/seo/JsonLd";
import { buildBreadcrumbJsonLd } from "@lib/seo/structured-data";
import TipsClient from "./tips-client";

const TIPS_TITLE = "Tipy a rady při nákupu a prodeji ojetého auta | NNAuto";
const TIPS_DESCRIPTION =
  "Praktické tipy pro nákup i prodej ojetého auta v ČR – jak zkontrolovat technický stav, ověřit historii přes VIN, vyjednat cenu a bezpečně dokončit obchod. NNAuto rady.";

export const metadata: Metadata = {
  title: TIPS_TITLE,
  description: TIPS_DESCRIPTION,
  openGraph: {
    title: TIPS_TITLE,
    description: TIPS_DESCRIPTION,
    url: "https://nnauto.cz/tips",
    siteName: "NNAuto",
    images: [
      { url: "https://nnauto.cz/og-image.png", width: 1200, height: 630 },
    ],
    locale: "cs_CZ",
    type: "website",
  },
  alternates: { canonical: "https://nnauto.cz/tips" },
};

export default function Tips() {
  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "NNAuto", url: "https://nnauto.cz/" },
          { name: "Tipy a rady", url: "https://nnauto.cz/tips" },
        ])}
      />
      {/* SSR-only SEO content for crawlers. Visible page is rendered by TipsClient. */}
      <section className="sr-only" aria-hidden="true">
        <h1>Tipy a rady při nákupu a prodeji ojetého auta</h1>
        <h2>Jak bezpečně koupit, prověřit a prodat ojeté auto</h2>
        <p>
          Nákup ojetého auta je velké rozhodnutí. Před prohlídkou si vždy
          připravte kontrolní seznam – stav karoserie, koroze pod prahy,
          kvalita laku, stav motoru a převodovky, servisní kniha a souhlas
          mezi reálným nájezdem a údaji v technickém průkazu. U starších
          vozů doporučujeme prověření přes Cebia – online report z VIN
          kódu odhalí havárie, zástavy i původ vozidla.
        </p>
        <p>
          Při prodeji vozu je klíčové kvalitní zpracování inzerátu.
          Pořiďte minimálně 8–12 fotografií ve dne, na světlém pozadí.
          Vyfoťte exteriér ze všech stran, interiér, motorový prostor,
          tachometr a doklady (VIN, TP). V popisu uveďte rok výroby,
          nájezd, palivo, převodovku, výbavu a servisní historii. Cenu
          stanovte podle aktuální nabídky podobných vozů na NNAuto.
        </p>
        <p>
          Při převodu vozu nezapomeňte na změnu vlastníka v registru
          vozidel, ukončení povinného ručení a předání servisních knížek.
          Smlouvu o prodeji uzavřete písemně a uveďte v ní stav nájezdu i
          případné vady. Bezpečné platby probíhají bankovním převodem nebo
          v ověřené hotovosti – vyhněte se zaslání zálohy předem.
        </p>
        <nav aria-label="Interní odkazy">
          <a href="/listings">Aktuální nabídka aut</a>
          <a href="/auta">SEO katalog aut</a>
          <a href="/pricing">Ceník služeb</a>
          <a href="/about">O NNAuto</a>
        </nav>
      </section>
      <TipsClient />
    </>
  );
}
