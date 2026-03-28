"use client";

import dynamic from "next/dynamic";

const PricingPage = dynamic(() => import("@/pages/PricingPage"), {
  loading: () => (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  ),
});

export default function Pricing() {
  return <PricingPage />;
}
