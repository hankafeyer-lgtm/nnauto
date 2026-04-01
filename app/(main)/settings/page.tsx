"use client";

import SettingsPage from "@/pages/SettingsPage";
import { ClientOnly } from "../client-only";

export default function Settings() {
  return (
    <ClientOnly>
      <SettingsPage />
    </ClientOnly>
  );
}
