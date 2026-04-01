import type { Metadata } from "next";
import ListingsClient from "./listings-client";

export const metadata: Metadata = {
  title: "Inzeráty vozidel | NNAuto",
  description:
    "Prohlédněte si nabídku automobilů, motocyklů a nákladních vozidel na NNAuto.",
  openGraph: {
    title: "Inzeráty vozidel | NNAuto",
    description:
      "Prohlédněte si nabídku automobilů, motocyklů a nákladních vozidel na NNAuto.",
    url: "https://nnauto.cz/listings",
    siteName: "NNAuto",
    images: [
      { url: "https://nnauto.cz/og-image.png", width: 1200, height: 630 },
    ],
    locale: "cs_CZ",
    type: "website",
  },
  alternates: { canonical: "https://nnauto.cz/listings" },
};

export default function Listings() {
  return <ListingsClient />;
}
