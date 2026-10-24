import type { Metadata } from "next";
import PrehledClient from "./prehled-client";

export const metadata: Metadata = {
  title: "Přehled · Reklama na NNAuto",
  robots: { index: false, follow: false },
};

export default function PrehledRoute() {
  return <PrehledClient />;
}
