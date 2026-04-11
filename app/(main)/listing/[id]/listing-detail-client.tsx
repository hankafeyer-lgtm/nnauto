"use client";

import { Suspense } from "react";
import ListingDetailPage from "@/pages/ListingDetailPage";

export default function ListingDetailClient() {
  return (
    <Suspense>
      <ListingDetailPage />
    </Suspense>
  );
}
