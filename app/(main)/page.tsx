import type { Metadata } from "next";
import JsonLd from "@lib/seo/JsonLd";
import { buildHomePageJsonLdGraph } from "@lib/seo/structured-data";
import HomeClient from "./home-client";

export const metadata: Metadata = {
  title: "NNAuto - Prémiový Marketplace Aut v ČR | Prodej a Nákup Vozidel",
  description:
    "NNAuto je prémiový marketplace pro nákup a prodej automobilů, motocyklů a nákladních vozidel v České republice.",
  openGraph: {
    title: "NNAuto - Prémiový Marketplace Aut v České Republice",
    description: "Najděte své vysněné auto na NNAuto.",
    url: "https://nnauto.cz",
    siteName: "NNAuto",
    images: [{ url: "https://nnauto.cz/og-image.png", width: 1200, height: 630 }],
    locale: "cs_CZ",
    type: "website",
  },
  alternates: { canonical: "https://nnauto.cz" },
};

export default function Home() {
  return (
    <>
      <JsonLd data={buildHomePageJsonLdGraph()} />
      <HomeClient />
    </>
  );
}
