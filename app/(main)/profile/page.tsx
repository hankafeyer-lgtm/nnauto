import type { Metadata } from "next";
import ProfileClient from "./profile-client";

export const metadata: Metadata = {
  title: "Můj profil | NNAuto",
  description: "Správa profilu.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Můj profil | NNAuto",
    description: "Správa profilu.",
    url: "https://nnauto.cz/profile",
    siteName: "NNAuto",
    images: [
      { url: "https://nnauto.cz/og-image.png", width: 1200, height: 630 },
    ],
    locale: "cs_CZ",
    type: "website",
  },
  alternates: { canonical: "https://nnauto.cz/profile" },
};

export default function Profile() {
  return <ProfileClient />;
}
