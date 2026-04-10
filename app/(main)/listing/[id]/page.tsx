import type { Metadata } from "next";
import { cache } from "react";
import { db } from "@lib/db";
import { listings } from "@shared/schema";
import { eq } from "drizzle-orm";
import { JsonLd, vehicleJsonLd, breadcrumbJsonLd, BASE_URL } from "@lib/seo";
import ListingDetailClient from "./listing-detail-client";

export const revalidate = 60;

const getListing = cache(async (id: string) => {
  const [listing] = await db.select().from(listings).where(eq(listings.id, id));
  return listing ?? null;
});

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const listing = await getListing(id);

  if (!listing) return { title: "Inzerát nenalezen | NNAuto" };

  const brand = listing.brand.charAt(0).toUpperCase() + listing.brand.slice(1);
  const price = Number(listing.price).toLocaleString("cs-CZ");
  const title = `${brand} ${listing.model} ${listing.year} - ${price} Kč | NNAuto`;
  const photo = listing.photos?.[0];
  const imageUrl = photo
    ? `${BASE_URL}/img/${photo.replace(/^\/+/, "")}?w=1200&q=80&f=webp`
    : `${BASE_URL}/og-image.png`;

  return {
    title,
    description: `${brand} ${listing.model}, rok ${listing.year}, ${listing.mileage?.toLocaleString("cs-CZ")} km, ${price} Kč.`,
    robots: { index: true, follow: true },
    openGraph: {
      title,
      url: `${BASE_URL}/listing/${id}`,
      siteName: "NNAuto",
      images: [{ url: imageUrl, width: 1200, height: 630 }],
      locale: "cs_CZ",
      type: "website",
    },
    alternates: { canonical: `${BASE_URL}/listing/${id}` },
  };
}

export default async function ListingDetail({ params }: Props) {
  const { id } = await params;
  const listing = await getListing(id);

  return (
    <>
      {listing && (
        <JsonLd
          data={[
            vehicleJsonLd(listing),
            breadcrumbJsonLd([
              { name: "NNAuto", url: BASE_URL },
              { name: listing.brand, url: `${BASE_URL}/listings?brand=${encodeURIComponent(listing.brand)}` },
              { name: listing.model, url: `${BASE_URL}/listings?brand=${encodeURIComponent(listing.brand)}&model=${encodeURIComponent(listing.model)}` },
              { name: `${listing.brand} ${listing.model} ${listing.year}`, url: `${BASE_URL}/listing/${id}` },
            ]),
          ]}
        />
      )}
      <ListingDetailClient />
    </>
  );
}
