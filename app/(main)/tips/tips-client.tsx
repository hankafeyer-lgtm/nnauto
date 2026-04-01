"use client";

import TipsPage from "@/pages/TipsPage";
import { ClientOnly } from "../client-only";

export default function TipsClient() {
  return (
    <ClientOnly>
      <TipsPage />
    </ClientOnly>
  );
}
