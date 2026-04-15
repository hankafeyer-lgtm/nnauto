import type { Metadata } from "next";
import DealerClient from "./dealer-client";

export const metadata: Metadata = {
  title: "Dealer | NNAuto",
  description: "Dealer cabinet — NNAuto.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Dealer | NNAuto",
    description: "Dealer cabinet — NNAuto.",
    url: "https://nnauto.cz/dealer",
    siteName: "NNAuto",
    images: [
      { url: "https://nnauto.cz/og-image.png", width: 1200, height: 630 },
    ],
    locale: "cs_CZ",
    type: "website",
  },
  alternates: { canonical: "https://nnauto.cz/dealer" },
};

export default function Dealer() {
  return <DealerClient />;
}
