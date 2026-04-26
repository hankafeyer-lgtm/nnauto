import type { Metadata } from "next";
import { headers } from "next/headers";
import JsonLd from "@lib/seo/JsonLd";
import { SITE_ORIGIN } from "@lib/seo/constants";
import {
  formatBrandDisplay,
  formatModelDisplay,
  formatVehicleTitle,
} from "@lib/seo/brand-format";
import { buildListingCarJsonLd } from "@lib/seo/structured-data";
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

  const capitalize = (v: string) =>
    v ? v.charAt(0).toUpperCase() + v.slice(1) : v;
  const brand = formatBrandDisplay(listing.brand);
  const model = formatModelDisplay(listing.model);
  const price = Number(listing.price).toLocaleString("cs-CZ");
  const mileage = listing.mileage
    ? listing.mileage.toLocaleString("cs-CZ")
    : "";
  const fuelList = Array.isArray(listing.fuelType)
    ? listing.fuelType.filter(Boolean)
    : [];
  const transmissionList = Array.isArray(listing.transmission)
    ? listing.transmission.filter(Boolean)
    : [];
  const fuel = capitalize(fuelList[0] || "");
  const transmission = capitalize(transmissionList[0] || "");
  const region = listing.region ? capitalize(String(listing.region)) : "";

  // Rich, keyword-packed title — stays under Google's ~60 char soft limit in
  // most cases while covering "brand model rok palivo město cena".
  const titleParts = [
    `${brand} ${model} ${listing.year}`.trim(),
    fuel,
    mileage ? `${mileage} km` : "",
    `${price} Kč`,
    region,
  ].filter(Boolean);
  const title = `${titleParts.join(" · ")} | NNAuto`;

  const photo = listing.photos?.[0];
  const imageUrl = photo
    ? `${SITE_ORIGIN}/img/${photo.replace(/^\/+/, "")}?w=1200&q=80&f=webp`
    : `${SITE_ORIGIN}/og-image.png`;

  // Richer meta description: auto-generates a human-readable summary that
  // still reads natural, with concrete numbers and a call-to-action. Much
  // better for CTR in Google than the old "brand, rok, km, cena." line.
  const descParts: string[] = [];
  descParts.push(`Prodám ${brand} ${model}, rok ${listing.year}`);
  if (mileage) descParts.push(`najeto ${mileage} km`);
  if (fuel) descParts.push(fuel.toLowerCase());
  if (transmission) descParts.push(transmission.toLowerCase());
  if (region) descParts.push(region);
  let desc = descParts.join(", ") + `. Cena ${price} Kč.`;
  if (listing.description && listing.description.trim().length) {
    const snippet = listing.description.replace(/\s+/g, " ").trim().slice(0, 80);
    desc += ` ${snippet}${snippet.length === 80 ? "…" : ""}`;
  }
  desc += " Prohlédněte si fotky a kontaktujte prodejce na NNAuto.cz.";
  desc = desc.slice(0, 300);

  const keywords = [
    brand,
    model,
    `${brand} ${model}`,
    `${brand} ${model} ${listing.year}`,
    `${brand} ${model} ${fuel}`.trim(),
    `prodej ${brand} ${model}`,
    `ojeté ${brand}`,
    fuel ? `${fuel} ${brand}` : "",
    region ? `auta ${region}` : "",
    region ? `autobazar ${region}` : "",
    "prodej aut",
    "bazar aut",
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
  const brand = formatBrandDisplay(listing?.brand);
  const price = listing ? Number(listing.price).toLocaleString("cs-CZ") : null;
  const modelLabel = formatModelDisplay(listing?.model);
  const yearLabel = listing?.year ? String(listing.year) : "";
  const summaryTitle = formatVehicleTitle(
    listing?.brand,
    listing?.model,
    listing?.year,
  );
  const listingName = summaryTitle;
  const summaryMileage = listing?.mileage
    ? `${listing.mileage.toLocaleString("cs-CZ")} km`
    : "";
  const summaryFuel = Array.isArray(listing?.fuelType)
    ? listing.fuelType.join(", ")
    : listing?.fuelType || "";
  const summaryTransmission = Array.isArray(listing?.transmission)
    ? listing.transmission.join(", ")
    : listing?.transmission || "";
  const summaryImage = listing?.photos?.[0]
    ? `${SITE_ORIGIN}/img/${listing.photos[0].replace(/^\/+/, "")}?w=1200&q=80&f=webp`
    : null;
  const brandFilterUrl = `${SITE_ORIGIN}/?brand=${encodeURIComponent(listing?.brand ?? "")}`;
  const modelFilterUrl = `${brandFilterUrl}&model=${encodeURIComponent(listing?.model ?? "")}`;
  const fuelText = Array.isArray(listing?.fuelType)
    ? listing.fuelType.join(", ")
    : listing?.fuelType || "";
  const transmissionText = Array.isArray(listing?.transmission)
    ? listing.transmission.join(", ")
    : listing?.transmission || "";
  // Resolve all listing photos to absolute URLs for schema.org `image`.
  const productImageUrls = Array.isArray(listing?.photos)
    ? listing!.photos
        .filter((p): p is string => typeof p === "string" && p.trim().length > 0)
        .slice(0, 6)
        .map(
          (p) =>
            `${SITE_ORIGIN}/img/${p.replace(/^\/+/, "")}?w=1200&q=80&f=webp`,
        )
    : [];
  const primaryImage = productImageUrls[0] || summaryImage;

  // Map our "condition" field to schema.org item conditions.
  const conditionRaw = (listing?.condition || "").toLowerCase();
  const itemConditionUrl = conditionRaw.includes("nov")
    ? "https://schema.org/NewCondition"
    : conditionRaw.includes("havar") || conditionRaw.includes("damag")
      ? "https://schema.org/DamagedCondition"
      : "https://schema.org/UsedCondition";

  // Offer stays valid for a year — Merchant Listings requires a future date.
  const priceValidUntil = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  const productJsonLd = listing
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: listingName,
        sku: listing.id,
        description: listing.description || `${listingName} - inzerat na NNAuto`,
        brand: brand
          ? { "@type": "Brand", name: brand }
          : undefined,
        image: productImageUrls.length
          ? productImageUrls
          : primaryImage
            ? [primaryImage]
            : undefined,
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
          itemCondition: itemConditionUrl,
          priceValidUntil,
          url: `${SITE_ORIGIN}/listing/${id}`,
          // Vehicles are picked up in person — state it explicitly so
          // Google Merchant Listings stops warning about missing fields.
          shippingDetails: {
            "@type": "OfferShippingDetails",
            shippingRate: {
              "@type": "MonetaryAmount",
              value: "0",
              currency: "CZK",
            },
            shippingDestination: {
              "@type": "DefinedRegion",
              addressCountry: "CZ",
            },
            doesNotShip: true,
          },
          hasMerchantReturnPolicy: {
            "@type": "MerchantReturnPolicy",
            applicableCountry: "CZ",
            returnPolicyCategory:
              "https://schema.org/MerchantReturnNotPermitted",
          },
          seller: {
            "@type": "Organization",
            name: "NNAuto",
            url: SITE_ORIGIN,
          },
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
  // schema.org Car / Vehicle JSON-LD — adds the more specific automotive type
  // alongside the existing Product schema. Google supports both; the Vehicle
  // type unlocks "Vehicle" rich result eligibility (year, mileage, fuel type,
  // transmission, body type) that Product alone does not expose.
  const carJsonLd = listing ? buildListingCarJsonLd(listing) : null;

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
        {carJsonLd ? <JsonLd data={carJsonLd} /> : null}
        {breadcrumbJsonLd ? <JsonLd data={breadcrumbJsonLd} /> : null}
        <main className="min-h-screen bg-background">
          <div className="container mx-auto px-3 pt-3 sm:px-4 sm:pt-4 max-w-7xl">
            <a
              href={`/?brand=${encodeURIComponent(listing.brand)}`}
              className="block truncate text-sm text-muted-foreground hover:underline sm:hidden"
            >
              {`\u2190 Zpět na ${brand}`}
            </a>
            <nav
              aria-label="Breadcrumb"
              className="hidden flex-wrap items-center gap-x-2 gap-y-1 overflow-x-auto text-sm leading-relaxed text-muted-foreground sm:flex"
            >
              <a href="/" className="shrink-0 hover:underline">NNAuto</a>
              <span className="text-muted-foreground/70">{">"}</span>
              <a
                href={`/?brand=${encodeURIComponent(listing.brand)}`}
                className="max-w-[40vw] truncate hover:underline sm:max-w-none"
              >
                {brand}
              </a>
              <span className="text-muted-foreground/70">{">"}</span>
              <a
                href={`/?brand=${encodeURIComponent(listing.brand)}&model=${encodeURIComponent(listing.model)}`}
                className="max-w-[40vw] truncate hover:underline sm:max-w-none"
              >
                {modelLabel}
              </a>
              <span className="text-muted-foreground/70">{">"}</span>
              <span aria-current="page" className="shrink-0">{yearLabel}</span>
            </nav>
          </div>
          <ListingDetailClient
            initialListing={initialListing}
            initialListingId={id}
            embeddedMode={false}
          />
          {/* Keep a server-rendered listing summary for SEO without changing visible UI. */}
          <article className="sr-only">
            <h1>{summaryTitle}</h1>
            <p>{price ? `${price} Kč` : ""}</p>
            {listing.description ? <p>{listing.description}</p> : null}
            {summaryImage ? <img src={summaryImage} alt={summaryTitle} /> : null}
            <ul>
              <li>{`Rok: ${yearLabel}`}</li>
              {summaryMileage ? <li>{`Najeto: ${summaryMileage}`}</li> : null}
              {summaryFuel ? <li>{`Palivo: ${summaryFuel}`}</li> : null}
              {summaryTransmission ? <li>{`Převodovka: ${summaryTransmission}`}</li> : null}
              {listing.region ? <li>{`Lokalita: ${listing.region}`}</li> : null}
              {listing.vin ? <li>{`VIN: ${listing.vin}`}</li> : null}
            </ul>
          </article>
          {similarListings.length ? (
            <section className="container mx-auto mt-6 border-t px-3 py-6 sm:mt-8 sm:px-4 sm:py-8 max-w-7xl">
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
