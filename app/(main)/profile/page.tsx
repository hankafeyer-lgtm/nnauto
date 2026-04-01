"use client";

import ProfilePage from "@/pages/ProfilePage";
import { ClientOnly } from "../client-only";

export default function Profile() {
  return (
    <ClientOnly>
      <ProfilePage />
    </ClientOnly>
  );
}
