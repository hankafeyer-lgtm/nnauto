"use client";

import AdminPage from "@/pages/AdminPage";
import { ClientOnly } from "../client-only";

export default function AdminClient() {
  return (
    <ClientOnly>
      <AdminPage />
    </ClientOnly>
  );
}
