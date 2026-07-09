import type { Metadata } from "next";
import DealerInvoiceClient from "./dealer-invoice-client";

type Props = {
  params: Promise<{ number: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { number } = await params;
  const decoded = decodeURIComponent(number);
  return {
    title: `Faktura ${decoded} | NNAuto`,
    robots: { index: false, follow: false },
  };
}

export default async function DealerInvoicePage({ params }: Props) {
  const { number } = await params;
  return <DealerInvoiceClient number={decodeURIComponent(number)} />;
}
