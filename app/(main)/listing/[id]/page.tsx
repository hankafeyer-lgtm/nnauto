import type { Metadata } from "next";
import JsonLd from "@lib/seo/JsonLd";
import { SITE_ORIGIN } from "@lib/seo/constants";
import { buildListingCarJsonLd } from "@lib/seo/structured-data";
import ListingDetailClient from "./listing-detail-client";
import { getListingById } from "./get-listing";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const listing = await getListingById(id);

  if (!listing) return { title: "Inzerát nenalezen | NNAuto" };

  const brand = listing.brand.charAt(0).toUpperCase() + listing.brand.slice(1);
  const price = Number(listing.price).toLocaleString("cs-CZ");
  const title = `${brand} ${listing.model} ${listing.year} - ${price} Kč | NNAuto`;
  const photo = listing.photos?.[0];
  const imageUrl = photo
    ? `${SITE_ORIGIN}/img/${photo.replace(/^\/+/, "")}?w=1200&q=80&f=webp`
    : `${SITE_ORIGIN}/og-image.png`;
  const desc = `${brand} ${listing.model}, rok ${listing.year}, ${listing.mileage?.toLocaleString("cs-CZ")} km, ${price} Kč.`;
  const keywords = [
    brand,
    listing.model,
    `${brand} ${listing.model}`,
    String(listing.year),
    listing.region,
    "prodej aut",
    "NNAuto",
  ]
    .filter(Boolean)
    .join(", ");

  return {
    title,
    description: desc,
    keywords,
    openGraph: {
      title,
      description: desc,
      url: `${SITE_ORIGIN}/listing/${id}`,
      siteName: "NNAuto",
      images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
      locale: "cs_CZ",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
      images: [imageUrl],
    },
    alternates: { canonical: `${SITE_ORIGIN}/listing/${id}` },
  };
}

export default async function ListingDetail({ params }: Props) {
  const { id } = await params;
  const listing = await getListingById(id);
  const brand = listing?.brand
    ? listing.brand.charAt(0).toUpperCase() + listing.brand.slice(1)
    : "";
  const price = listing ? Number(listing.price).toLocaleString("cs-CZ") : null;
  const descriptionText = listing?.description?.trim() || "";

  return (
    <>
      {listing ? <JsonLd data={buildListingCarJsonLd(listing)} /> : null}
      {listing ? (
        <section
          aria-label="Listing SEO content"
          className="sr-only"
          data-testid="listing-seo-content"
        >
          <h1>{`${brand} ${listing.model} ${listing.year}`}</h1>
          <p>{price ? `${price} Kč` : ""}</p>
          {descriptionText ? <p>{descriptionText}</p> : null}
          <ul>
            <li>{`Rok: ${listing.year}`}</li>
            <li>{`Najeto: ${listing.mileage?.toLocaleString("cs-CZ")} km`}</li>
            <li>{`Palivo: ${Array.isArray(listing.fuelType) ? listing.fuelType.join(", ") : listing.fuelType || ""}`}</li>
            <li>{`Převodovka: ${Array.isArray(listing.transmission) ? listing.transmission.join(", ") : listing.transmission || ""}`}</li>
            <li>{`Lokalita: ${listing.region || ""}`}</li>
          </ul>
        </section>
      ) : null}
      <ListingDetailClient />
    </>
  );
}
