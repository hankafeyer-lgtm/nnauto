import type { Metadata } from "next";
import CebiaReturnClient from "./cebia-return-client";

export const metadata: Metadata = {
  title: "Cebia - Výsledek | NNAuto",
  description: "Výsledek Cebia prověření VIN.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Cebia - Výsledek | NNAuto",
    description: "Výsledek Cebia prověření VIN.",
    url: "https://nnauto.cz/cebia/return",
    siteName: "NNAuto",
    images: [
      { url: "https://nnauto.cz/og-image.png", width: 1200, height: 630 },
    ],
    locale: "cs_CZ",
    type: "website",
  },
  alternates: { canonical: "https://nnauto.cz/cebia/return" },
};

export default function CebiaReturn() {
  return <CebiaReturnClient />;
}
