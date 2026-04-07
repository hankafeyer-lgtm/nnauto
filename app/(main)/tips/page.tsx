import type { Metadata } from "next";
import TipsClient from "./tips-client";

export const metadata: Metadata = {
  title: "Tipy a rady | NNAuto",
  description: "Užitečné tipy pro nákup a prodej automobilu.",
  openGraph: {
    title: "Tipy a rady | NNAuto",
    description: "Užitečné tipy pro nákup a prodej automobilu.",
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
  return <TipsClient />;
}
