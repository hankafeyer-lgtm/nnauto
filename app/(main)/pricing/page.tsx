import type { Metadata } from "next";
import PricingClient from "./pricing-client";

const PRICING_TITLE = "Ceník služeb NNAuto – TOP inzeráty a Cebia | NNAuto";
const PRICING_DESCRIPTION =
  "Aktuální ceník služeb NNAuto: zvýraznění inzerátu (TOP), prověření vozu Cebia z VIN kódu, prodej auta v autobazaru online. Transparentní ceny, žádné skryté poplatky.";

export const metadata: Metadata = {
  title: PRICING_TITLE,
  description: PRICING_DESCRIPTION,
  openGraph: {
    title: PRICING_TITLE,
    description: PRICING_DESCRIPTION,
    url: "https://nnauto.cz/pricing",
    siteName: "NNAuto",
    images: [
      { url: "https://nnauto.cz/og-image.png", width: 1200, height: 630 },
    ],
    locale: "cs_CZ",
    type: "website",
  },
  alternates: { canonical: "https://nnauto.cz/pricing" },
};

export default function Pricing() {
  return (
    <>
      {/* SSR-only SEO content for crawlers. Visible page is rendered by PricingClient. */}
      <section className="sr-only" aria-hidden="true">
        <h1>Ceník služeb NNAuto</h1>
        <p>
          NNAuto nabízí transparentní ceník pro prodejce i kupce ojetých a
          nových vozů. Základní vložení inzerátu je zdarma. Pro rychlejší
          prodej můžete využít zvýraznění TOP, které posune inzerát nahoru
          ve výpisu a označí ho viditelným štítkem.
        </p>
        <p>
          Doplňkovou službou je online prověření vozu Cebia z VIN kódu –
          získáte report o historii vozu, počtu majitelů, případných
          haváriích a kontrole nájezdu. Cebia report je oficiální nástroj
          uznávaný v celé ČR. Cena Cebia prověření se odvíjí od typu
          reportu (Basic, Standard, Pro) a hradí ji kupující při objednání.
        </p>
        <p>
          Všechny ceny zobrazujeme včetně DPH. Platby probíhají online
          přes platební bránu. NNAuto si neúčtuje žádné skryté provize z
          prodejní ceny vozu – platíte pouze za zvolené doplňkové služby.
        </p>
      </section>
      <PricingClient />
    </>
  );
}
