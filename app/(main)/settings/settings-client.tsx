"use client";

import SettingsPage from "@/pages/SettingsPage";
import { ClientOnly } from "../client-only";

export default function SettingsClient() {
  return (
    <ClientOnly>
      <SettingsPage />
    </ClientOnly>
  );
}
