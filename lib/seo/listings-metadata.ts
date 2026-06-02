import type { Metadata } from "next";
import { SITE_ORIGIN } from "./constants";
import { normalizeSlug } from "./slug";

const IGNORED_QUERY_KEYS = new Set(["lang", "language"]);

function firstParam(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function hasMeaningfulQueryParams(
  params: Record<string, string | string[] | undefined>,
): boolean {
  return Object.entries(params).some(([key, value]) => {
    if (IGNORED_QUERY_KEYS.has(key)) return false;
    if (value === undefined || value === "") return false;
    if (Array.isArray(value) && value.length === 0) return false;
    return true;
  });
}

/** Canonical target for filtered /listings views (plain /listings when no brand/model). */
export function resolveListingsCanonicalUrl(
  params: Record<string, string | string[] | undefined>,
): string {
  const brand = firstParam(params.brand);
  const model = firstParam(params.model);
  if (brand && model) {
    return `${SITE_ORIGIN}/auta/${normalizeSlug(brand)}/${normalizeSlug(model)}`;
  }
  if (brand) {
    return `${SITE_ORIGIN}/auta/${normalizeSlug(brand)}`;
  }
  return `${SITE_ORIGIN}/listings`;
}

/**
 * Any /listings?… URL is noindex,follow with canonical to the clean SEO cluster.
 * Plain /listings (no query) stays indexable.
 */
/** Client-side mirror of server metadata rules (ListingsPage hydrates after navigation). */
export function listingsSeoFromSearch(search: string): {
  canonical: string;
  noindex: boolean;
} {
  const usp = new URLSearchParams(
    search.startsWith("?") ? search.slice(1) : search.replace(/^\?/, ""),
  );
  const params: Record<string, string | string[] | undefined> = {};
  usp.forEach((value, key) => {
    params[key] = value;
  });
  return {
    canonical: resolveListingsCanonicalUrl(params),
    noindex: hasMeaningfulQueryParams(params),
  };
}

export function buildListingsPageMetadata(
  params: Record<string, string | string[] | undefined>,
  base: Pick<Metadata, "title" | "description" | "openGraph" | "twitter">,
): Metadata {
  const hasQuery = hasMeaningfulQueryParams(params);
  const canonical = resolveListingsCanonicalUrl(params);

  return {
    ...base,
    robots: hasQuery ? { index: false, follow: true } : { index: true, follow: true },
    alternates: { canonical },
    openGraph: base.openGraph
      ? { ...base.openGraph, url: canonical }
      : undefined,
  };
}
