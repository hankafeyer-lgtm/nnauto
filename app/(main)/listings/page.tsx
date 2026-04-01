"use client";

import ListingsPage from "@/pages/ListingsPage";
import { ClientOnly } from "../client-only";

export default function Listings() {
  return (
    <ClientOnly>
      <ListingsPage />
    </ClientOnly>
  );
}
