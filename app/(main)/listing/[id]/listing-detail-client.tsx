"use client";

import { Suspense } from "react";
import ListingDetailPage from "@/pages/ListingDetailPage";
import type { Listing } from "@shared/schema";
import type {
  DealerInventoryListing,
  DealerProfileForListing,
} from "./get-listing";
import { NoSSR } from "../../no-ssr";
import { ListingDetailDelegatedFallback } from "./listing-detail-no-ssr-fallback";

type ListingDetailClientProps = {
  initialListing?: Listing | null;
  initialListingId?: string;
  initialDealerProfile?: DealerProfileForListing | null;
  initialDealerInventory?: DealerInventoryListing[];
  disableSsr?: boolean;
  embeddedMode?: boolean;
  /** SSR already emitted `<h1>` — client title becomes `<h2>` for one-H1 semantics. */
  primaryHeading?: "page" | "delegated";
};

export default function ListingDetailClient({
  initialListing = null,
  initialListingId,
  initialDealerProfile = null,
  initialDealerInventory = [],
  disableSsr = false,
  embeddedMode,
  primaryHeading = "page",
}: ListingDetailClientProps) {
  return (
    <NoSSR
      fallback={
        primaryHeading === "delegated" ? (
          <ListingDetailDelegatedFallback />
        ) : undefined
      }
    >
      <Suspense>
        <ListingDetailPage
          initialListing={initialListing}
          initialListingId={initialListingId}
          initialDealerProfile={initialDealerProfile}
          initialDealerInventory={initialDealerInventory}
          embeddedMode={embeddedMode}
          primaryHeading={primaryHeading}
        />
      </Suspense>
    </NoSSR>
  );
}
