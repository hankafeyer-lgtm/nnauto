import type { Metadata } from "next";
import { buildCanonical, buildPaginationLinks, BASE_URL } from "./canonical";
import { getRobotsDirective } from "./index-rules";
import { resolveBrandBySlug, resolveModelBySlug, type ListingStats } from "./resolve";

const OG_IMAGE = "https://nnauto.cz/og-image.png";

function toSearchParams(
  sp: URLSearchParams | Record<string, string | string[] | undefined>,
): URLSearchParams {
  if (sp instanceof URLSearchParams) return sp;
  return new URLSearchParams(
    Object.entries(sp).flatMap(([k, v]) =>
      v === undefined ? [] : Array.isArray(v) ? v.map((val) => [k, val]) : [[k, v]],
    ),
  );
}

/**
 * Build full Metadata object for /listings search page.
 */
export async function buildSearchMetadata(
  rawSearchParams: Record<string, string | string[] | undefined>,
): Promise<Metadata> {
  const params = toSearchParams(rawSearchParams);
  const brandSlug = params.get("brand")?.trim();
  const modelSlug = params.get("model")?.trim();
  const page = parseInt(params.get("page") ?? "1", 10);

  let brandName: string | null = null;
  let modelName: string | null = null;

  if (brandSlug) {
    const brand = await resolveBrandBySlug(brandSlug);
    if (brand) {
      brandName = brand.name;
      if (modelSlug) {
        const model = await resolveModelBySlug(brand.id, modelSlug);
        if (model) modelName = model.name;
      }
    }
  }

  const titleParts: string[] = [];
  if (brandName) titleParts.push(brandName);
  if (modelName) titleParts.push(modelName);
  const filterLabel = titleParts.length > 0 ? titleParts.join(" ") : null;

  const title = filterLabel
    ? page > 1
      ? `${filterLabel} - Stránka ${page} | NNAuto`
      : `${filterLabel} - Inzeráty vozidel | NNAuto`
    : page > 1
      ? `Inzeráty vozidel - Stránka ${page} | NNAuto`
      : "Inzeráty vozidel | NNAuto";

  const description = filterLabel
    ? `Prohlédněte si nabídku vozidel ${filterLabel} na NNAuto. Ověřené inzeráty, pokročilé filtry, snadné vyhledávání.`
    : "Prohlédněte si nabídku automobilů na NNAuto. Ověřené inzeráty, pokročilé filtry, snadné vyhledávání.";

  const robots = getRobotsDirective(params);
  const canonical = buildCanonical("/listings", params);

  const other: Record<string, string> = {};
  const pagination = buildPaginationLinks("/listings", params, page, 9999);
  if (pagination.prev) other["link-prev"] = pagination.prev;
  if (pagination.next) other["link-next"] = pagination.next;

  return {
    title,
    description,
    robots: {
      index: robots.index,
      follow: robots.follow,
    },
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "NNAuto",
      images: [{ url: OG_IMAGE, width: 1200, height: 630 }],
      locale: "cs_CZ",
      type: "website",
    },
  };
}

/**
 * Build Metadata for /brand/[slug] page.
 */
export function buildBrandMetadata(
  brandName: string,
  brandSlug: string,
  listingCount: number,
): Metadata {
  const title = `${brandName} - Prodej vozidel | NNAuto`;
  const description =
    listingCount > 0
      ? `Nabídka ${listingCount} vozidel značky ${brandName} v České republice. Ověřené inzeráty na NNAuto.`
      : `Vozidla značky ${brandName} na NNAuto. Ověřené inzeráty v České republice.`;
  const canonical = `${BASE_URL}/brand/${brandSlug}`;

  return {
    title,
    description,
    robots: { index: true, follow: true },
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "NNAuto",
      images: [{ url: OG_IMAGE, width: 1200, height: 630 }],
      locale: "cs_CZ",
      type: "website",
    },
  };
}

/**
 * Build Metadata for /brand/[slug]/[model] page.
 */
export function buildBrandModelMetadata(
  brandName: string,
  brandSlug: string,
  modelName: string,
  modelSlug: string,
  stats: ListingStats,
): Metadata {
  const title = `${brandName} ${modelName} - Prodej | NNAuto`;
  const pricePart =
    stats.minPrice && stats.maxPrice
      ? `, ceny od ${stats.minPrice.toLocaleString("cs-CZ")} do ${stats.maxPrice.toLocaleString("cs-CZ")} Kč`
      : "";
  const yearPart =
    stats.minYear && stats.maxYear && stats.minYear !== stats.maxYear
      ? `, roky ${stats.minYear}–${stats.maxYear}`
      : "";
  const description =
    stats.count > 0
      ? `Nabídka ${stats.count} vozidel ${brandName} ${modelName}${pricePart}${yearPart}. Ověřené inzeráty na NNAuto.`
      : `Vozidla ${brandName} ${modelName} na NNAuto. Ověřené inzeráty v České republice.`;
  const canonical = `${BASE_URL}/brand/${brandSlug}/${modelSlug}`;

  return {
    title,
    description,
    robots: { index: true, follow: true },
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "NNAuto",
      images: [{ url: OG_IMAGE, width: 1200, height: 630 }],
      locale: "cs_CZ",
      type: "website",
    },
  };
}

/**
 * Build Metadata for /blog/[slug] article page.
 */
export function buildArticleMetadata(article: {
  title: string;
  excerpt?: string | null;
  coverImage?: string | null;
  slug: string;
}): Metadata {
  const title = `${article.title} | NNAuto Blog`;
  const description = article.excerpt || article.title;
  const canonical = `${BASE_URL}/blog/${article.slug}`;
  const image = article.coverImage || OG_IMAGE;

  return {
    title,
    description,
    robots: { index: true, follow: true },
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "NNAuto",
      images: [{ url: image, width: 1200, height: 630 }],
      locale: "cs_CZ",
      type: "article",
    },
  };
}
