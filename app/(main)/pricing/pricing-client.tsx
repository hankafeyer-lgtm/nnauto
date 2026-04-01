"use client";

import PricingPage from "@/pages/PricingPage";
import { ClientOnly } from "../client-only";

export default function PricingClient() {
  return (
    <ClientOnly>
      <PricingPage />
    </ClientOnly>
  );
}
