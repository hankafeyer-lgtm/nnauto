"use client";

import HomePage from "@/pages/HomePage";
import { ClientOnly } from "./client-only";

export default function HomeClient() {
  return (
    <ClientOnly>
      <HomePage />
    </ClientOnly>
  );
}
