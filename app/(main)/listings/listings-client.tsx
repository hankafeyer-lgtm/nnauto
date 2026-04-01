"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

const ListingsPage = dynamic(() => import("@/pages/ListingsPage"), { ssr: false });

function ListingsLoading() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl shadow-lg">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <span className="text-xl font-bold"><span className="text-[#B8860B]">NN</span>Auto</span>
          <div className="h-10 w-64 bg-muted rounded-xl animate-pulse" />
        </div>
      </header>
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="bg-card rounded-xl overflow-hidden border">
              <div className="h-48 bg-muted animate-pulse" />
              <div className="p-4 space-y-2">
                <div className="h-5 bg-muted rounded animate-pulse w-3/4" />
                <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
                <div className="h-6 bg-muted rounded animate-pulse w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default function ListingsClient() {
  return (
    <Suspense fallback={<ListingsLoading />}>
      <ListingsPage />
    </Suspense>
  );
}
