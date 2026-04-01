"use client";

import PricingPage from "@/pages/PricingPage";
import { ClientOnly } from "../client-only";

export default function Pricing() {
  return (
    <ClientOnly>
      <PricingPage />
    </ClientOnly>
  );
}
