import type { Metadata } from "next";
import JsonLd from "@lib/seo/JsonLd";
import { buildHomePageJsonLdGraph } from "@lib/seo/structured-data";
import HomeClient from "./home-client";

const HOME_TITLE =
  "NNAuto - Prémiový Marketplace Aut v ČR | Prodej a Nákup Vozidel";
const HOME_DESCRIPTION =
  "NNAuto – moderní online autobazar v ČR. Tisíce ověřených inzerátů osobních aut, motocyklů a nákladních vozidel. Filtrujte podle značky, modelu, ceny a regionu.";
const HOME_OG_DESCRIPTION =
  "Najděte své vysněné auto na NNAuto. Osobní auta, motocykly i nákladní vozy. Ověření prodejci, pokročilé filtry a kontakt přímo s majitelem inzerátu.";

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

export default function Home() {
  return (
    <>
      <JsonLd data={buildHomePageJsonLdGraph()} />
      {/* SEO-only H1 (visually hidden). Gives crawlers a clear top-level heading
          without changing the visible hero design. */}
      <h1 className="sr-only">
        NNAuto – online autobazar v České republice. Prodej a nákup osobních
        aut, motocyklů a nákladních vozidel.
      </h1>
      <HomeClient />
    </>
  );
}
