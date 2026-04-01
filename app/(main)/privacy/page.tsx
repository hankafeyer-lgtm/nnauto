"use client";

import PrivacyPolicyPage from "@/pages/PrivacyPolicyPage";
import { ClientOnly } from "../client-only";

export default function Privacy() {
  return (
    <ClientOnly>
      <PrivacyPolicyPage />
    </ClientOnly>
  );
}
