"use client";

import { Suspense } from "react";
import CebiaReturnPage from "@/pages/CebiaReturnPage";
import { NoSSR } from "../../no-ssr";

export default function CebiaReturnClient() {
  return (
    <NoSSR>
      <Suspense>
        <CebiaReturnPage />
      </Suspense>
    </NoSSR>
  );
}
