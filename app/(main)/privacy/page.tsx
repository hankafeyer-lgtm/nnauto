import type { Metadata } from "next";
import PrivacyClient from "./privacy-client";

export const metadata: Metadata = {
  title: "Ochrana osobních údajů | NNAuto",
  description: "Zásady ochrany osobních údajů NNAuto.",
  openGraph: {
    title: "Ochrana osobních údajů | NNAuto",
    description: "Zásady ochrany osobních údajů NNAuto.",
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
  return <PrivacyClient />;
}
