"use client";

import ListingDetailPage from "@/pages/ListingDetailPage";
import { ClientOnly } from "../../client-only";

export default function ListingDetail() {
  return (
    <ClientOnly>
      <ListingDetailPage />
    </ClientOnly>
  );
}
