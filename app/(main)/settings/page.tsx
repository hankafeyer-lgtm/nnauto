import type { Metadata } from "next";
import SettingsClient from "./settings-client";

export const metadata: Metadata = {
  title: "Nastavení | NNAuto",
  description: "Nastavení účtu.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Nastavení | NNAuto",
    description: "Nastavení účtu.",
    url: "https://nnauto.cz/settings",
    siteName: "NNAuto",
    images: [
      { url: "https://nnauto.cz/og-image.png", width: 1200, height: 630 },
    ],
    locale: "cs_CZ",
    type: "website",
  },
  alternates: { canonical: "https://nnauto.cz/settings" },
};

export default function Settings() {
  return <SettingsClient />;
}
