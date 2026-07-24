import type { Metadata } from "next";
import { absoluteUrl } from "./site-url";
import {
  resolveListingsCanonicalUrl,
  shouldNoindexListings,
} from "./canonical";

/**
 * Plain /listings is indexable.
 * /listings?page=2+ → noindex,follow + canonical to /listings (like Tutut).
 * Any filter query → noindex,follow with canonical to /listings or /auta/….
 */
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
    noindex: shouldNoindexListings(params),
  };
}

export function buildListingsPageMetadata(
  params: Record<string, string | string[] | undefined>,
  base: Pick<Metadata, "title" | "description" | "openGraph" | "twitter">,
): Metadata {
  const noindex = shouldNoindexListings(params);
  const canonical = resolveListingsCanonicalUrl(params);

  return {
    ...base,
    robots: noindex ? { index: false, follow: true } : { index: true, follow: true },
    alternates: { canonical },
    openGraph: base.openGraph
      ? { ...base.openGraph, url: canonical }
      : undefined,
  };
}

// Re-export for backward compatibility
export { resolveListingsCanonicalUrl, shouldNoindexListings };
