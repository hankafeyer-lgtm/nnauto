import type { Metadata } from "next";
import PlatbyClient from "./platby-client";

export const metadata: Metadata = {
  title: "Platby a faktury | NNAuto",
  description: "Přehled vašich plateb za inzeráty a stažení faktur.",
  robots: { index: false, follow: false },
  alternates: { canonical: "https://nnauto.cz/platby" },
};

export default function PlatbyPage() {
  return <PlatbyClient />;
}
