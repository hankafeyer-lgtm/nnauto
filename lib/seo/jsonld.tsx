import { BASE_URL } from "./canonical";

type JsonLdObject = Record<string, unknown>;

/**
 * React component that renders a JSON-LD script tag in server HTML.
 */
export function JsonLd({ data }: { data: JsonLdObject | JsonLdObject[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function breadcrumbJsonLd(
  items: { name: string; url: string }[],
): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function vehicleJsonLd(listing: {
  id: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  price: string | number;
  fuelType?: string[] | null;
  transmission?: string[] | null;
  color?: string | null;
  engineVolume?: string | null;
  photos?: string[] | null;
  description?: string | null;
  region?: string | null;
}): JsonLdObject {
  const url = `${BASE_URL}/listing/${listing.id}`;
  const photo = listing.photos?.[0];
  const image = photo
    ? `${BASE_URL}/img/${photo.replace(/^\/+/, "")}?w=1200&q=80&f=webp`
    : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "Car",
    name: `${listing.brand} ${listing.model} ${listing.year}`,
    brand: { "@type": "Brand", name: listing.brand },
    model: listing.model,
    vehicleModelDate: String(listing.year),
    mileageFromOdometer: {
      "@type": "QuantitativeValue",
      value: listing.mileage,
      unitCode: "KMT",
    },
    fuelType: listing.fuelType?.[0] || undefined,
    vehicleTransmission: listing.transmission?.[0] || undefined,
    color: listing.color || undefined,
    vehicleEngine: listing.engineVolume
      ? {
          "@type": "EngineSpecification",
          engineDisplacement: {
            "@type": "QuantitativeValue",
            value: listing.engineVolume,
            unitCode: "LTR",
          },
        }
      : undefined,
    image,
    description: listing.description || undefined,
    url,
    offers: {
      "@type": "Offer",
      price: Number(listing.price),
      priceCurrency: "CZK",
      availability: "https://schema.org/InStock",
      url,
      seller: {
        "@type": "Organization",
        name: "NNAuto",
        url: BASE_URL,
      },
    },
  };
}

export function itemListJsonLd(
  name: string,
  items: { url: string; name: string; position?: number }[],
): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: items.length,
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: item.position ?? i + 1,
      url: item.url,
      name: item.name,
    })),
  };
}

export function articleJsonLd(article: {
  title: string;
  excerpt?: string | null;
  author?: string | null;
  coverImage?: string | null;
  slug: string;
  publishedAt?: Date | string | null;
  updatedAt?: Date | string | null;
}): JsonLdObject {
  const url = `${BASE_URL}/blog/${article.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt || undefined,
    author: article.author
      ? { "@type": "Person", name: article.author }
      : { "@type": "Organization", name: "NNAuto" },
    publisher: {
      "@type": "Organization",
      name: "NNAuto",
      url: BASE_URL,
    },
    url,
    image: article.coverImage || undefined,
    datePublished: article.publishedAt
      ? new Date(article.publishedAt).toISOString()
      : undefined,
    dateModified: article.updatedAt
      ? new Date(article.updatedAt).toISOString()
      : undefined,
    mainEntityOfPage: url,
  };
}

export function blogJsonLd(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "NNAuto Blog",
    description:
      "Tipy a novinky ze světa automobilů v České republice.",
    url: `${BASE_URL}/blog`,
    publisher: {
      "@type": "Organization",
      name: "NNAuto",
      url: BASE_URL,
    },
  };
}
