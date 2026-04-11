"use client";

import { Suspense } from "react";
import HomePage from "@/pages/HomePage";

export default function HomeClient() {
  return (
    <Suspense>
      <HomePage />
    </Suspense>
  );
}
