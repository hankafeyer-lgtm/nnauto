"use client";

import AdminPage from "@/pages/AdminPage";
import { ClientOnly } from "../client-only";

export default function Admin() {
  return (
    <ClientOnly>
      <AdminPage />
    </ClientOnly>
  );
}
