import type { Metadata } from "next";
import CampaignsClient from "./campaigns-client";

export const metadata: Metadata = {
  title: "Kampaně · Reklama na NNAuto",
  robots: { index: false, follow: false },
};

export default function CampaignsRoute() {
  return <CampaignsClient />;
}
