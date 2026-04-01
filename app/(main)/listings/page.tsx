import type { Metadata } from "next";
import { Suspense } from "react";
import { db } from "@lib/db";
import { listings } from "@shared/schema";
import { desc } from "drizzle-orm";

export const metadata: Metadata = {
  title: "Inzeráty vozidel | NNAuto",
  description: "Prohlédněte si nabídku automobilů na NNAuto.",
  openGraph: {
    title: "Inzeráty vozidel | NNAuto",
    description: "Prohlédněte si nabídku automobilů na NNAuto.",
    url: "https://nnauto.cz/listings",
    siteName: "NNAuto",
    images: [{ url: "https://nnauto.cz/og-image.png", width: 1200, height: 630 }],
    locale: "cs_CZ",
    type: "website",
  },
  alternates: { canonical: "https://nnauto.cz/listings" },
};

async function SSRListings() {
  let cars: any[] = [];
  let total = 0;
  try {
    cars = await db
      .select({
        id: listings.id,
        title: listings.title,
        brand: listings.brand,
        model: listings.model,
        year: listings.year,
        price: listings.price,
        mileage: listings.mileage,
        photos: listings.photos,
        isTopListing: listings.isTopListing,
        fuelType: listings.fuelType,
      })
      .from(listings)
      .orderBy(desc(listings.isTopListing), desc(listings.createdAt))
      .limit(20);
    const [count] = await db.select({ c: listings.id }).from(listings);
    total = cars.length;
  } catch {}

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cars.map((car) => {
          const photo = car.photos?.[0];
          const imgSrc = photo ? `/img/${photo.replace(/^\/+/, "")}?w=400&q=68&f=webp` : "";
          const price = Number(car.price).toLocaleString("cs-CZ");
          return (
            <a key={car.id} href={`/listing/${car.id}`}
              className="block bg-card rounded-xl overflow-hidden border hover:shadow-lg transition-shadow">
              {imgSrc && (
                <img src={imgSrc} alt={car.title || `${car.brand} ${car.model}`}
                  loading="lazy" decoding="async" className="w-full h-48 object-cover" />
              )}
              <div className="p-4">
                <h3 className="font-semibold truncate">{car.title || `${car.brand} ${car.model}`}</h3>
                <p className="text-sm text-muted-foreground">{car.year} · {car.mileage?.toLocaleString("cs-CZ")} km</p>
                <p className="text-lg font-bold mt-1 text-[#B8860B]">{price} Kč</p>
                {car.isTopListing && (
                  <span className="inline-block mt-1 px-2 py-0.5 text-xs font-bold bg-amber-400 text-black rounded">TOP</span>
                )}
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}

export default async function Listings() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl shadow-lg">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <a href="/" className="text-xl font-bold">
            <span className="text-[#B8860B]">NN</span>Auto
          </a>
          <nav className="flex items-center gap-3">
            <a href="/listings" className="text-sm font-medium">Vyhledat</a>
            <a href="/add-listing" className="px-3 py-1.5 text-sm border rounded-lg">Přidat auto</a>
          </nav>
        </div>
      </header>
      <Suspense fallback={
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-card rounded-xl overflow-hidden border">
                <div className="h-48 bg-muted animate-pulse" />
                <div className="p-4 space-y-2">
                  <div className="h-5 bg-muted rounded animate-pulse w-3/4" />
                  <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      }>
        <SSRListings />
      </Suspense>
    </div>
  );
}
