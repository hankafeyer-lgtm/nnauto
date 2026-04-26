import type { Metadata } from "next";
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
  return <PrivacyClient />;
}
