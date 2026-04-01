"use client";

import CebiaReturnPage from "@/pages/CebiaReturnPage";
import { ClientOnly } from "../../client-only";

export default function CebiaReturnClient() {
  return (
    <ClientOnly>
      <CebiaReturnPage />
    </ClientOnly>
  );
}
