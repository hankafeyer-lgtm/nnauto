"use client";

import Header from "@/components/Header";
import { NoSSR } from "../../../no-ssr";

export default function ModelHeader() {
  return (
    <NoSSR
      fallback={
        <div className="h-14 border-b border-amber-100 bg-background/95 sm:h-20" />
      }
    >
      <Header />
    </NoSSR>
  );
}
