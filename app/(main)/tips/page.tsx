"use client";

import TipsPage from "@/pages/TipsPage";
import { ClientOnly } from "../client-only";

export default function Tips() {
  return (
    <ClientOnly>
      <TipsPage />
    </ClientOnly>
  );
}
