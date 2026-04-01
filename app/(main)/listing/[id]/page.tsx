import type { Metadata } from "next";
import { db } from "@lib/db";
import { listings } from "@shared/schema";
import { eq } from "drizzle-orm";
import ListingDetailClient from "./listing-detail-client";

type Props = {
  params: Promise<{ id: string }>;
};

const fuelLabel: Record<string, string> = {
  benzin: "Benzín",
  diesel: "Diesel",
  hybrid: "Hybrid",
  electric: "Elektro",
  lpg: "LPG",
  cng: "CNG",
};

const transmissionLabel: Record<string, string> = {
  manual: "Manuál",
  automatic: "Automat",
  robot: "Robot",
  cvt: "CVT",
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
      robots: { index: false, follow: false },
    };
  }

  const brand =
    listing.brand.charAt(0).toUpperCase() + listing.brand.slice(1);
  const model = listing.model;
  const price = Number(listing.price).toLocaleString("cs-CZ");
  const mileage = listing.mileage?.toLocaleString("cs-CZ") || "0";
  const fuel = listing.fuelType?.[0]
    ? fuelLabel[listing.fuelType[0]] || listing.fuelType[0]
    : "";
  const trans = listing.transmission?.[0]
    ? transmissionLabel[listing.transmission[0]] || listing.transmission[0]
    : "";

  const title = `${brand} ${model} ${listing.year} - ${price} Kč | NNAuto`;

  const descParts = [
    `${brand} ${model}`,
    `rok ${listing.year}`,
    `${mileage} km`,
    fuel,
    trans,
    listing.power ? `${listing.power} kW` : "",
    listing.engineVolume ? `${listing.engineVolume} L` : "",
    listing.region || "",
  ].filter(Boolean);
  const description = `Prodej: ${descParts.join(", ")}. Cena ${price} Kč. ${listing.description?.slice(0, 100) || ""}`;

  const keywords = [
    brand,
    model,
    `${brand} ${model}`,
    `${brand} ${model} ${listing.year}`,
    `prodej ${brand}`,
    `koupit ${brand} ${model}`,
    fuel,
    listing.bodyType || "",
    listing.region || "",
    "NNAuto",
    "bazar aut",
  ]
    .filter(Boolean)
    .join(", ");

  const photo = listing.photos?.[0];
  const imageUrl = photo
    ? `https://nnauto.cz/img/${photo.replace(/^\/+/, "")}?w=1200&q=80&f=webp`
    : "https://nnauto.cz/og-image.png";
  const url = `https://nnauto.cz/listing/${id}`;

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      url,
      siteName: "NNAuto",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${brand} ${model} ${listing.year}`,
        },
      ],
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
