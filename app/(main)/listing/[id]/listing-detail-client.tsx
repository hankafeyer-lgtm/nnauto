"use client";

import ListingDetailPage from "@/pages/ListingDetailPage";
import { ClientOnly } from "../../client-only";

export default function ListingDetailClient() {
  return (
    <ClientOnly>
      <ListingDetailPage />
    </ClientOnly>
  );
}
