import type { Metadata } from "next";
import ZpravyClient from "./zpravy-client";

export const metadata: Metadata = {
  title: "Moje zprávy | NNAuto",
  robots: { index: false, follow: false },
};

export default function ZpravyPage() {
  return <ZpravyClient />;
}
