"use client";

import ListingDetailPage from "@/pages/ListingDetailPage";
import { NoSSR } from "../../no-ssr";

export default function ListingDetailClient() {
  return (
    <NoSSR>
      <ListingDetailPage />
    </NoSSR>
  );
}
