import type { Metadata } from "next";
import AboutClient from "./about-client";

export const metadata: Metadata = {
  title: "O nás | NNAuto",
  description:
    "NNAuto je prémiový marketplace pro prodej a nákup automobilů v České republice.",
  openGraph: {
    title: "O nás | NNAuto",
    description:
      "NNAuto je prémiový marketplace pro prodej a nákup automobilů v České republice.",
    url: "https://nnauto.cz/about",
    siteName: "NNAuto",
    images: [
      { url: "https://nnauto.cz/og-image.png", width: 1200, height: 630 },
    ],
    locale: "cs_CZ",
    type: "website",
  },
  alternates: { canonical: "https://nnauto.cz/about" },
};

export default function About() {
  return <AboutClient />;
}
