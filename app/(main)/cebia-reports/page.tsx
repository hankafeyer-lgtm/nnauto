import type { Metadata } from "next";
import CebiaReportsClient from "./cebia-reports-client";

export const metadata: Metadata = {
  title: "Prověření vozu (Cebia) | NNAuto",
  description: "Vaše zakoupené VIN reporty Cebia.",
  robots: { index: false, follow: false },
  alternates: { canonical: "https://nnauto.cz/cebia-reports" },
};

export default function CebiaReports() {
  return <CebiaReportsClient />;
}
