"use client";

import HomePage from "@/pages/HomePage";
import { NoSSR } from "./no-ssr";

export default function HomeClient() {
  return (
    <NoSSR>
      <HomePage />
    </NoSSR>
  );
}
