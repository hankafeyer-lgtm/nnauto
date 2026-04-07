"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

const SettingsPage = dynamic(() => import("@/pages/SettingsPage"), {
  ssr: false,
});

export default function SettingsClient() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      }
    >
      <SettingsPage />
    </Suspense>
  );
}
