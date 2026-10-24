import type { Metadata } from "next";
import CreateClient from "./create-client";

export const metadata: Metadata = {
  title: "Nová kampaň · Reklama na NNAuto",
  robots: { index: false, follow: false },
};

export default function CreateCampaignRoute() {
  return <CreateClient />;
}
