"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

const ForgotPasswordPage = dynamic(
  () => import("@/pages/ForgotPasswordPage"),
  { ssr: false },
);

export default function ForgotPasswordClient() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <ForgotPasswordPage />
    </Suspense>
  );
}
