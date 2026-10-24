import type { Metadata } from "next";
import AdvertisingClient from "./advertising-client";

export const metadata: Metadata = {
  title: "Reklama na NNAuto",
  description:
    "Reklamní kabinet NNAuto — vytvořte kampaň, sledujte výkon a spravujte faktury.",
  robots: { index: false, follow: false },
};

export default function BusinessAdvertisingPage() {
  return <AdvertisingClient />;
}
