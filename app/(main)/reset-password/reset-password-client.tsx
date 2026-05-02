"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

const ResetPasswordPage = dynamic(
  () => import("@/pages/ResetPasswordPage"),
  { ssr: false },
);

export default function ResetPasswordClient() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <ResetPasswordPage />
    </Suspense>
  );
}
