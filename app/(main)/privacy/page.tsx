import type { Metadata } from "next";
import JsonLd from "@lib/seo/JsonLd";
import { buildBreadcrumbJsonLd } from "@lib/seo/structured-data";
import PrivacyClient from "./privacy-client";

const PRIVACY_TITLE = "Ochrana osobních údajů – GDPR zásady | NNAuto";
const PRIVACY_DESCRIPTION =
  "Zásady ochrany osobních údajů NNAuto v souladu s GDPR. Zjistěte, jaké údaje shromažďujeme, jak je zpracováváme, jak dlouho uchováváme a jak můžete uplatnit svá práva.";

export const metadata: Metadata = {
  title: PRIVACY_TITLE,
  description: PRIVACY_DESCRIPTION,
  openGraph: {
    title: PRIVACY_TITLE,
    description: PRIVACY_DESCRIPTION,
    url: "https://nnauto.cz/privacy",
    siteName: "NNAuto",
    images: [
      { url: "https://nnauto.cz/og-image.png", width: 1200, height: 630 },
    ],
    locale: "cs_CZ",
    type: "website",
  },
  alternates: { canonical: "https://nnauto.cz/privacy" },
};

export default function Privacy() {
  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "NNAuto", url: "https://nnauto.cz/" },
          { name: "Ochrana osobních údajů", url: "https://nnauto.cz/privacy" },
        ])}
      />
      <section className="sr-only" aria-hidden="true">
        <h1>Ochrana osobních údajů NNAuto</h1>
        <h2>GDPR zásady a zpracování osobních údajů</h2>
        <p>
          NNAuto zpracovává osobní údaje za účelem provozu online autobazaru,
          správy uživatelských účtů, komunikace mezi kupujícími a prodejci,
          bezpečnosti služeb a splnění zákonných povinností.
        </p>
        <p>
          Uživatelé mají právo na přístup ke svým údajům, opravu, výmaz,
          omezení zpracování a přenositelnost údajů podle pravidel GDPR.
        </p>
        <nav aria-label="Interní odkazy">
          <a href="/about">O NNAuto</a>
          <a href="/pricing">Ceník služeb</a>
          <a href="/tips">Tipy a rady</a>
          <a href="/listings">Aktuální inzeráty</a>
        </nav>
      </section>
      <PrivacyClient />
    </>
  );
}
