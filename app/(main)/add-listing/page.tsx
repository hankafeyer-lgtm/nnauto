import type { Metadata } from "next";
import AddListingClient from "./add-listing-client";

export const metadata: Metadata = {
  title: "Přidat inzerát | NNAuto",
  description: "Přidejte svůj inzerát na NNAuto.",
  openGraph: {
    title: "Přidat inzerát | NNAuto",
    description: "Přidejte svůj inzerát na NNAuto.",
    url: "https://nnauto.cz/add-listing",
    siteName: "NNAuto",
    images: [
      { url: "https://nnauto.cz/og-image.png", width: 1200, height: 630 },
    ],
    locale: "cs_CZ",
    type: "website",
  },
  alternates: { canonical: "https://nnauto.cz/add-listing" },
};

export default function AddListing() {
  return <AddListingClient />;
}
