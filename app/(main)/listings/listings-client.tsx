"use client";

import ListingsPage from "@/pages/ListingsPage";
import { ClientOnly } from "../client-only";

export default function ListingsClient() {
  return (
    <ClientOnly>
      <ListingsPage />
    </ClientOnly>
  );
}
