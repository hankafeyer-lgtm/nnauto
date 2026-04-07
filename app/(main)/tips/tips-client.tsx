"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

const TipsPage = dynamic(() => import("@/pages/TipsPage"), { ssr: false });

export default function TipsClient() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      }
    >
      <TipsPage />
    </Suspense>
  );
}
