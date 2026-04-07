"use client";

import ListingsPage from "@/pages/ListingsPage";
import { NoSSR } from "../no-ssr";

export default function ListingsClient() {
  return (
    <NoSSR>
      <ListingsPage />
    </NoSSR>
  );
}
