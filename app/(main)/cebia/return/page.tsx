"use client";

import CebiaReturnPage from "@/pages/CebiaReturnPage";
import { ClientOnly } from "../../client-only";

export default function CebiaReturn() {
  return (
    <ClientOnly>
      <CebiaReturnPage />
    </ClientOnly>
  );
}
