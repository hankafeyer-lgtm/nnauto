"use client";

import { Suspense } from "react";
import AdvertisingHomePage from "@/pages/business/AdvertisingHomePage";

export default function AdvertisingClient() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      }
    >
      <AdvertisingHomePage />
    </Suspense>
  );
}
