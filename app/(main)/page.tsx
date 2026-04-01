import type { Metadata } from "next";
import HomeClient from "./home-client";

export const metadata: Metadata = {
  title: "NNAuto - Prémiový Marketplace Aut v ČR | Prodej a Nákup Vozidel",
  description:
    "NNAuto je prémiový marketplace pro nákup a prodej automobilů, motocyklů a nákladních vozidel v České republice. Tisíce ověřených inzerátů, pokročilé filtry, snadné vyhledávání. Najděte své vysněné auto ještě dnes!",
  keywords:
    "prodej aut, nákup aut, bazar aut, ojetá auta, nová auta, automobily, NNAuto, autobazar, Česká republika",
  openGraph: {
    title: "NNAuto - Prémiový Marketplace Aut v České Republice",
    description:
      "Najděte své vysněné auto na NNAuto. Tisíce ověřených inzerátů osobních aut, motocyklů a nákladních vozidel.",
    url: "https://nnauto.cz",
    siteName: "NNAuto",
    images: [
      {
        url: "https://nnauto.cz/og-image.png",
        width: 1200,
        height: 630,
        alt: "NNAuto - Prémiový Marketplace Aut",
      },
    ],
    locale: "cs_CZ",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NNAuto - Prémiový Marketplace Aut",
    description: "Najděte své vysněné auto na NNAuto.",
    images: ["https://nnauto.cz/og-image.png"],
  },
  alternates: {
    canonical: "https://nnauto.cz",
    languages: {
      "cs-CZ": "https://nnauto.cz",
      "uk-UA": "https://nnauto.cz",
      "en-US": "https://nnauto.cz",
      "de-DE": "https://nnauto.cz",
    },
  },
};

export default function Home() {
  return <HomeClient />;
}
