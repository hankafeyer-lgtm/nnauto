"use client";

import ListingDetailPage from "@/pages/ListingDetailPage";
import type { Listing } from "@shared/schema";

type ListingDetailClientProps = {
  initialListing?: Listing | null;
  initialListingId?: string;
};

export default function ListingDetailClient({
  initialListing = null,
  initialListingId,
}: ListingDetailClientProps) {
  return (
    <ListingDetailPage
      initialListing={initialListing}
      initialListingId={initialListingId}
    />
  );
}
