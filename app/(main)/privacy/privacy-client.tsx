"use client";

import PrivacyPolicyPage from "@/pages/PrivacyPolicyPage";
import { ClientOnly } from "../client-only";

export default function PrivacyClient() {
  return (
    <ClientOnly>
      <PrivacyPolicyPage />
    </ClientOnly>
  );
}
