import type { Metadata } from "next";
import { headers } from "next/headers";
import JsonLd from "@lib/seo/JsonLd";
import { SITE_ORIGIN } from "@lib/seo/constants";
import ListingDetailClient from "./listing-detail-client";
import { getListingById, getSimilarListings } from "./get-listing";

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
  const requestHeaders = await headers();
  const isIframeRequest = requestHeaders.get("sec-fetch-dest") === "iframe";
  const isEmbedded = resolvedSearchParams?.embedded === "1" && isIframeRequest;
  const listing = await getListingById(id);
  const initialListing = listing
    ? (JSON.parse(JSON.stringify(listing)) as typeof listing)
    : null;
  const brand = listing?.brand
    ? listing.brand.charAt(0).toUpperCase() + listing.brand.slice(1)
    : "";
  const price = listing ? Number(listing.price).toLocaleString("cs-CZ") : null;
  const listingName = `${brand} ${listing?.model ?? ""} ${listing?.year ?? ""}`.trim();
  const modelLabel = listing?.model ? String(listing.model) : "";
  const yearLabel = listing?.year ? String(listing.year) : "";
  const brandFilterUrl = `${SITE_ORIGIN}/?brand=${encodeURIComponent(listing?.brand ?? "")}`;
  const modelFilterUrl = `${brandFilterUrl}&model=${encodeURIComponent(listing?.model ?? "")}`;
  const fuelText = Array.isArray(listing?.fuelType)
    ? listing.fuelType.join(", ")
    : listing?.fuelType || "";
  const transmissionText = Array.isArray(listing?.transmission)
    ? listing.transmission.join(", ")
    : listing?.transmission || "";
  const productJsonLd = listing
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: listingName,
        description: listing.description || `${listingName} - inzerat na NNAuto`,
        brand: brand || undefined,
        additionalProperty: [
          { "@type": "PropertyValue", name: "Rok", value: String(listing.year) },
          {
            "@type": "PropertyValue",
            name: "Najeto",
            value: `${listing.mileage?.toLocaleString("cs-CZ")} km`,
          },
          { "@type": "PropertyValue", name: "Palivo", value: fuelText || undefined },
          {
            "@type": "PropertyValue",
            name: "Prevodovka",
            value: transmissionText || undefined,
          },
        ].filter((item) => Boolean(item.value)),
        offers: {
          "@type": "Offer",
          price: String(Number(listing.price)),
          priceCurrency: "CZK",
          availability: "https://schema.org/InStock",
          url: `${SITE_ORIGIN}/listing/${id}`,
        },
      }
    : null;
  const breadcrumbJsonLd = listing
    ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "NNAuto",
            item: `${SITE_ORIGIN}/`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: brand,
            item: brandFilterUrl,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: modelLabel,
            item: modelFilterUrl,
          },
          {
            "@type": "ListItem",
            position: 4,
            name: yearLabel,
          },
        ],
      }
    : null;
  const similarListings = listing ? await getSimilarListings(listing, 6) : [];

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
        {productJsonLd ? <JsonLd data={productJsonLd} /> : null}
        {breadcrumbJsonLd ? <JsonLd data={breadcrumbJsonLd} /> : null}
        <main className="min-h-screen bg-background">
          <div className="container mx-auto px-4 pt-4 max-w-7xl">
            <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
              <a href="/" className="hover:underline">NNAuto</a>
              <span className="mx-2">{">"}</span>
              <a href={`/?brand=${encodeURIComponent(listing.brand)}`} className="hover:underline">
                {brand}
              </a>
              <span className="mx-2">{">"}</span>
              <a
                href={`/?brand=${encodeURIComponent(listing.brand)}&model=${encodeURIComponent(listing.model)}`}
                className="hover:underline"
              >
                {modelLabel}
              </a>
              <span className="mx-2">{">"}</span>
              <span aria-current="page">{yearLabel}</span>
            </nav>
          </div>
          <ListingDetailClient
            initialListing={initialListing}
            initialListingId={id}
            embeddedMode={false}
          />
          {similarListings.length ? (
            <section className="container mx-auto px-4 py-8 max-w-7xl border-t">
              <h2 className="text-xl font-semibold mb-4">Souvisejici auta</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {similarListings.map((item) => {
                  const itemPhoto = item.photos?.[0];
                  const itemPrice = Number(item.price).toLocaleString("cs-CZ");
                  return (
                    <a
                      key={item.id}
                      href={`/listing/${item.id}`}
                      className="block rounded-lg border border-border bg-card hover:bg-accent/40 transition-colors overflow-hidden"
                    >
                      {itemPhoto ? (
                        <img
                          src={`${SITE_ORIGIN}/img/${itemPhoto.replace(/^\/+/, "")}?w=480&q=76&f=webp`}
                          alt={item.title}
                          loading="lazy"
                          className="w-full h-36 object-cover"
                        />
                      ) : null}
                      <div className="p-3 space-y-1">
                        <p className="text-sm font-medium line-clamp-2">{item.title}</p>
                        <p className="text-primary font-semibold">{itemPrice} Kč</p>
                      </div>
                    </a>
                  );
                })}
              </div>
            </section>
          ) : null}
        </main>
      </>
    );
  }

  return (
    <>
      {productJsonLd ? <JsonLd data={productJsonLd} /> : null}
      {breadcrumbJsonLd ? <JsonLd data={breadcrumbJsonLd} /> : null}
      <ListingDetailClient
        initialListing={initialListing}
        initialListingId={id}
        disableSsr
        embeddedMode
      />
    </>
  );
}
