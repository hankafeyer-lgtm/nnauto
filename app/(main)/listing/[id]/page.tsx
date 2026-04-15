import type { Metadata } from "next";
import { db } from "@lib/db";
import { listings } from "@shared/schema";
import { eq } from "drizzle-orm";
import ListingDetailClient from "./listing-detail-client";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const [listing] = await db.select().from(listings).where(eq(listings.id, id));

  if (!listing) return { title: "Inzerát nenalezen | NNAuto" };

  const brand = listing.brand.charAt(0).toUpperCase() + listing.brand.slice(1);
  const price = Number(listing.price).toLocaleString("cs-CZ");
  const title = `${brand} ${listing.model} ${listing.year} - ${price} Kč | NNAuto`;
  const photo = listing.photos?.[0];
  const imageUrl = photo
    ? `https://nnauto.cz/img/${photo.replace(/^\/+/, "")}?w=1200&q=80&f=webp`
    : "https://nnauto.cz/og-image.png";

  return {
    title,
    description: `${brand} ${listing.model}, rok ${listing.year}, ${listing.mileage?.toLocaleString("cs-CZ")} km, ${price} Kč.`,
    openGraph: {
      title,
      url: `https://nnauto.cz/listing/${id}`,
      siteName: "NNAuto",
      images: [{ url: imageUrl, width: 1200, height: 630 }],
      locale: "cs_CZ",
      type: "website",
    },
    alternates: { canonical: `https://nnauto.cz/listing/${id}` },
  };
}

export default function ListingDetail() {
  return <ListingDetailClient />;
}
