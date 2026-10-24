"use client";

import { Suspense } from "react";
import AdvertiserInvoicesPage from "@/pages/business/AdvertiserInvoicesPage";

export default function InvoicesClient() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      }
    >
      <AdvertiserInvoicesPage />
    </Suspense>
  );
}
