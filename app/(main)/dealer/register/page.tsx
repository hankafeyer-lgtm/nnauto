import type { Metadata } from "next";
import DealerClient from "../dealer-client";

export const metadata: Metadata = {
  title: "Registrace autobazaru | NNAuto",
  description: "Registrace firemního účtu pro autobazary na NNAuto.cz.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Registrace autobazaru | NNAuto",
    description: "Registrace firemního účtu pro autobazary na NNAuto.cz.",
    url: "https://nnauto.cz/dealer/register",
    siteName: "NNAuto",
    images: [
      { url: "https://nnauto.cz/og-image.png", width: 1200, height: 630 },
    ],
    locale: "cs_CZ",
    type: "website",
  },
  alternates: { canonical: "https://nnauto.cz/dealer/register" },
};

export default function DealerRegister() {
  return <DealerClient />;
}
