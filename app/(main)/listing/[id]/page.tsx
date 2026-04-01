import type { Metadata } from "next";
import { db } from "@lib/db";
import { listings } from "@shared/schema";
import { eq } from "drizzle-orm";
import ListingDetailClient from "./listing-detail-client";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  const [listing] = await db
    .select()
    .from(listings)
    .where(eq(listings.id, id));

  if (!listing) {
    return {
      title: "Inzerát nenalezen | NNAuto",
      description: "Požadovaný inzerát nebyl nalezen.",
    };
  }

  const title = `${listing.title || `${listing.brand} ${listing.model}`} | NNAuto`;
  const description = `${listing.year} ${listing.brand} ${listing.model}, ${listing.mileage?.toLocaleString("cs-CZ")} km, ${Number(listing.price).toLocaleString("cs-CZ")} Kč. ${listing.description?.slice(0, 120) || ""}`;
  const photo = listing.photos?.[0];
  const imageUrl = photo
    ? `https://nnauto.cz/img/${photo.replace(/^\/+/, "")}?w=1200&q=80&f=webp`
    : "https://nnauto.cz/og-image.png";
  const url = `https://nnauto.cz/listing/${id}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: "NNAuto",
      images: [{ url: imageUrl, width: 1200, height: 630 }],
      locale: "cs_CZ",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
    alternates: { canonical: url },
  };
}

export default function ListingDetail() {
  return <ListingDetailClient />;
}
