"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

const AddListingPage = dynamic(() => import("@/pages/AddListingPage"), {
  ssr: false,
});

export default function AddListingClient() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      }
    >
      <AddListingPage />
    </Suspense>
  );
}
