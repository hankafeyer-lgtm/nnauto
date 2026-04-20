"use client";

import { Suspense } from "react";
import ListingDetailPage from "@/pages/ListingDetailPage";
import type { Listing } from "@shared/schema";
import { NoSSR } from "../../no-ssr";

type ListingDetailClientProps = {
  initialListing?: Listing | null;
  initialListingId?: string;
  disableSsr?: boolean;
  embeddedMode?: boolean;
};

export default function ListingDetailClient({
  initialListing = null,
  initialListingId,
  disableSsr = false,
  embeddedMode,
}: ListingDetailClientProps) {
  return (
    <NoSSR>
      <Suspense>
        <ListingDetailPage
          initialListing={initialListing}
          initialListingId={initialListingId}
          embeddedMode={embeddedMode}
        />
      </Suspense>
    </NoSSR>
  );
}
