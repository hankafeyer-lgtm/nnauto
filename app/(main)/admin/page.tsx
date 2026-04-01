import type { Metadata } from "next";
import AdminClient from "./admin-client";

export const metadata: Metadata = {
  title: "Administrace | NNAuto",
  description: "Administrační panel NNAuto.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Administrace | NNAuto",
    description: "Administrační panel NNAuto.",
    url: "https://nnauto.cz/admin",
    siteName: "NNAuto",
    images: [
      { url: "https://nnauto.cz/og-image.png", width: 1200, height: 630 },
    ],
    locale: "cs_CZ",
    type: "website",
  },
  alternates: { canonical: "https://nnauto.cz/admin" },
};

export default function Admin() {
  return <AdminClient />;
}
