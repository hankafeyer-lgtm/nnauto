"use client";

import { Suspense } from "react";
import HomePage from "@/pages/HomePage";
import { NoSSR } from "./no-ssr";

function HomeFallback() {
  return (
    <div className="min-h-screen bg-background text-foreground" aria-label="Načítání hlavní stránky">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex items-center justify-between gap-3">
          <div className="h-8 w-28 rounded-md bg-muted" />
          <div className="flex items-center gap-2">
            <div className="h-10 w-36 rounded-lg bg-muted" />
            <div className="h-10 w-10 rounded-lg bg-muted" />
          </div>
        </div>
        <div className="mt-5 h-16 rounded-xl bg-muted" />
        <div className="mt-4 h-20 rounded-xl bg-muted" />
      </div>
      <div className="relative min-h-[560px] bg-muted">
        <div className="absolute inset-x-4 top-8 rounded-2xl bg-background/90 p-5 shadow-sm">
          <div className="mx-auto h-16 max-w-sm rounded-xl bg-muted" />
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="h-28 rounded-xl bg-muted" />
            <div className="h-28 rounded-xl bg-muted" />
            <div className="h-28 rounded-xl bg-muted" />
            <div className="h-28 rounded-xl bg-muted" />
          </div>
          <div className="mt-6 h-44 rounded-xl bg-muted" />
        </div>
      </div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="h-8 w-56 rounded-md bg-muted" />
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-[420px] rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function HomeClient() {
  return (
    <NoSSR fallback={<HomeFallback />}>
      <Suspense>
        <HomePage />
      </Suspense>
    </NoSSR>
  );
}
