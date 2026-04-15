"use client";

import { Suspense } from "react";
import HomePage from "@/pages/HomePage";
import { NoSSR } from "./no-ssr";

export default function HomeClient() {
  return (
    <NoSSR>
      <Suspense>
        <HomePage />
      </Suspense>
    </NoSSR>
  );
}
