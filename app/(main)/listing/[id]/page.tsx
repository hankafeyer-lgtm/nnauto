import type { Metadata } from "next";
import JsonLd from "@lib/seo/JsonLd";
import { SITE_ORIGIN } from "@lib/seo/constants";
import { buildListingCarJsonLd } from "@lib/seo/structured-data";
import ListingDetailClient from "./listing-detail-client";
import { getListingById } from "./get-listing";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ embedded?: string }>;
};

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

export default async function ListingDetail({ params, searchParams }: Props) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const isEmbedded = resolvedSearchParams?.embedded === "1";
  const listing = await getListingById(id);
  const initialListing = listing
    ? (JSON.parse(JSON.stringify(listing)) as typeof listing)
    : null;
  const brand = listing?.brand
    ? listing.brand.charAt(0).toUpperCase() + listing.brand.slice(1)
    : "";
  const price = listing ? Number(listing.price).toLocaleString("cs-CZ") : null;

  if (!listing) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-bold">Inzerát nenalezen</h1>
          <p className="text-muted-foreground">
            Požadované oglaseni se nepodarilo nacist.
          </p>
        </div>
      </main>
    );
  }

  if (!isEmbedded) {
    return (
      <>
        <JsonLd data={buildListingCarJsonLd(listing)} />
        <main className="min-h-screen bg-background">
          <article className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
            <h1 className="text-3xl font-bold">{`${brand} ${listing.model} ${listing.year}`}</h1>
            <p className="text-2xl font-semibold text-primary">{`${price} Kč`}</p>
            {listing.description ? (
              <p className="text-base leading-relaxed whitespace-pre-line">
                {listing.description}
              </p>
            ) : null}
            <section className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <p>{`Rok: ${listing.year}`}</p>
              <p>{`Najeto: ${listing.mileage?.toLocaleString("cs-CZ")} km`}</p>
              <p>{`Palivo: ${Array.isArray(listing.fuelType) ? listing.fuelType.join(", ") : listing.fuelType || ""}`}</p>
              <p>{`Převodovka: ${Array.isArray(listing.transmission) ? listing.transmission.join(", ") : listing.transmission || ""}`}</p>
              <p>{`Lokalita: ${listing.region || ""}`}</p>
              <p>{`VIN: ${listing.vin || "neuvedeno"}`}</p>
            </section>
          </article>
        </main>
      </>
    );
  }

  return (
    <>
      <JsonLd data={buildListingCarJsonLd(listing)} />
      <ListingDetailClient initialListing={initialListing} initialListingId={id} />
    </>
  );
}
