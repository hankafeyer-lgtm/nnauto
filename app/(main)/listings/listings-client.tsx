"use client";

import { Suspense } from "react";
import ListingsPage from "@/pages/ListingsPage";
import { NoSSR } from "../no-ssr";

export default function ListingsClient() {
  return (
    <NoSSR>
      <Suspense>
        <ListingsPage />
      </Suspense>
    </NoSSR>
  );
}
