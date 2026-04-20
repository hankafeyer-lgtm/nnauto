"use client";

import { Suspense } from "react";
import ListingDetailPage from "@/pages/ListingDetailPage";
import type { Listing } from "@shared/schema";
import { NoSSR } from "../../no-ssr";

type ListingDetailClientProps = {
  initialListing?: Listing | null;
  initialListingId?: string;
};

export default function ListingDetailClient({
  initialListing = null,
  initialListingId,
}: ListingDetailClientProps) {
  return (
    <NoSSR>
      <Suspense>
        <ListingDetailPage
          initialListing={initialListing}
          initialListingId={initialListingId}
        />
      </Suspense>
    </NoSSR>
  );
}
