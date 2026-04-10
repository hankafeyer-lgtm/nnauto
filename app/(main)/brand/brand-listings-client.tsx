"use client";

import { Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import CarCard from "@/components/CarCard";
import type { Listing } from "@shared/schema";

function ListingsGrid({ brand, model }: { brand: string; model?: string }) {
  const qs = new URLSearchParams({ brand, limit: "12", sort: "newest" });
  if (model) qs.set("model", model);

  const { data, isLoading } = useQuery<{ listings: Listing[] }>({
    queryKey: ["brand-listings", brand, model],
    queryFn: async () => {
      const res = await fetch(`/api/listings?${qs}`, { credentials: "same-origin" });
      if (!res.ok) throw new Error("Failed to load");
      return res.json();
    },
    staleTime: 60_000,
  });

  const listings = data?.listings ?? [];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-4 space-y-3">
            <div className="h-44 w-full rounded-lg bg-muted animate-pulse" />
            <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
            <div className="h-4 w-1/2 rounded bg-muted animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-8">
        Momentálně nejsou k dispozici žádné inzeráty.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {listings.map((listing) => (
        <CarCard key={listing.id} {...listing} viewMode="grid" />
      ))}
    </div>
  );
}

export default function BrandListingsClient({
  brand,
  model,
}: {
  brand: string;
  model?: string;
}) {
  return (
    <Suspense>
      <ListingsGrid brand={brand} model={model} />
    </Suspense>
  );
}
