"use client";

import AboutPage from "@/pages/AboutPage";
import { ClientOnly } from "../client-only";

export default function About() {
  return (
    <ClientOnly>
      <AboutPage />
    </ClientOnly>
  );
}
