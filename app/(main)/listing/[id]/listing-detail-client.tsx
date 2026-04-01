"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

const ListingDetailPage = dynamic(() => import("@/pages/ListingDetailPage"), { ssr: false });

function DetailLoading() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl shadow-lg">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <span className="text-xl font-bold"><span className="text-[#B8860B]">NN</span>Auto</span>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-10 w-40 bg-muted rounded animate-pulse" />
            <div className="aspect-[3/2] bg-muted rounded-2xl animate-pulse" />
            <div className="flex gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="w-16 h-16 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
            <div className="space-y-3">
              <div className="h-8 bg-muted rounded animate-pulse w-2/3" />
              <div className="h-5 bg-muted rounded animate-pulse w-1/2" />
              <div className="h-10 bg-muted rounded animate-pulse w-1/4" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-48 bg-card rounded-2xl border animate-pulse" />
            <div className="h-32 bg-card rounded-2xl border animate-pulse" />
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ListingDetailClient() {
  return (
    <Suspense fallback={<DetailLoading />}>
      <ListingDetailPage />
    </Suspense>
  );
}
