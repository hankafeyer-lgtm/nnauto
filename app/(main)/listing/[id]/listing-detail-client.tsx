"use client";

import { Suspense } from "react";
import ListingDetailPage from "@/pages/ListingDetailPage";
import { NoSSR } from "../../no-ssr";

export default function ListingDetailClient() {
  return (
    <NoSSR>
      <Suspense>
        <ListingDetailPage />
      </Suspense>
    </NoSSR>
  );
}
