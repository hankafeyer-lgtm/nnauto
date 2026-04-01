"use client";

import AddListingPage from "@/pages/AddListingPage";
import { ClientOnly } from "../client-only";

export default function AddListing() {
  return (
    <ClientOnly>
      <AddListingPage />
    </ClientOnly>
  );
}
