"use client";

import { Suspense } from "react";
import ListingsPage from "@/pages/ListingsPage";

export default function ListingsClient() {
  return (
    <Suspense>
      <ListingsPage />
    </Suspense>
  );
}
