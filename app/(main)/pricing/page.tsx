import type { Metadata } from "next";
import PricingClient from "./pricing-client";

export const metadata: Metadata = {
  title: "Ceník | NNAuto",
  description: "Ceník služeb NNAuto - TOP inzeráty, Cebia prověření VIN.",
  openGraph: {
    title: "Ceník | NNAuto",
    description: "Ceník služeb NNAuto - TOP inzeráty, Cebia prověření VIN.",
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
  return <PricingClient />;
}
