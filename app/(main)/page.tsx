"use client";

import HomePage from "@/pages/HomePage";
import { ClientOnly } from "./client-only";

export default function Home() {
  return (
    <ClientOnly>
      <HomePage />
    </ClientOnly>
  );
}
