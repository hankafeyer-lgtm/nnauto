import type { Metadata } from "next";
import InvoicesClient from "./invoices-client";

export const metadata: Metadata = {
  title: "Faktury · Reklama na NNAuto",
  robots: { index: false, follow: false },
};

export default function InvoicesRoute() {
  return <InvoicesClient />;
}
