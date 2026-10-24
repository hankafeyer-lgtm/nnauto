"use client";

import { Suspense } from "react";
import MyCampaignsPage from "@/pages/business/MyCampaignsPage";

export default function CampaignsClient() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      }
    >
      <MyCampaignsPage />
    </Suspense>
  );
}
