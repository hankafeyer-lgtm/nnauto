"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

const TermsPage = dynamic(() => import("@/pages/TermsPage"), { ssr: false });

export default function TermsClient() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
        </div>
      }
    >
      <TermsPage />
    </Suspense>
  );
}
