import { absoluteUrl } from "./site-url";
import { normalizeSlug } from "./slug";

const IGNORED_QUERY_KEYS = new Set(["lang", "language"]);
const PAGINATION_ONLY_KEYS = new Set(["page"]);
const TECHNICAL_QUERY_KEYS = new Set([
  "from",
  "sort",
  "filter",
  "openListing",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "fbclid",
  "gclid",
]);

function firstParam(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function activeQueryKeys(
  params: Record<string, string | string[] | undefined>,
): string[] {
  return Object.entries(params)
    .filter(([key, value]) => {
      if (IGNORED_QUERY_KEYS.has(key)) return false;
      if (value === undefined || value === "") return false;
      if (Array.isArray(value) && value.length === 0) return false;
      return true;
    })
    .map(([key]) => key);
}

export function isPaginationOnlyQuery(
  params: Record<string, string | string[] | undefined>,
): boolean {
  const keys = activeQueryKeys(params);
  return keys.length > 0 && keys.every((key) => PAGINATION_ONLY_KEYS.has(key));
}

export function hasTechnicalQueryParams(
  params: Record<string, string | string[] | undefined>,
): boolean {
  return activeQueryKeys(params).some((key) => TECHNICAL_QUERY_KEYS.has(key));
}

export function hasFilterQueryParams(
  params: Record<string, string | string[] | undefined>,
): boolean {
  const keys = activeQueryKeys(params);
  if (!keys.length) return false;
  if (isPaginationOnlyQuery(params)) return false;
  return true;
}

function buildUrlWithParams(
  basePath: string,
  params: Record<string, string | string[] | undefined>,
): string {
  const usp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (IGNORED_QUERY_KEYS.has(key)) continue;
    if (value === undefined || value === "") continue;
    if (Array.isArray(value)) {
      value.forEach((v) => usp.append(key, v));
    } else {
      usp.set(key, value);
    }
  }
  const qs = usp.toString();
  return absoluteUrl(qs ? `${basePath}?${qs}` : basePath);
}

/** Home canonical: self-referencing for ?page=2; technical/filter params → plain /. */
export function resolveHomeCanonicalUrl(
  params: Record<string, string | string[] | undefined> = {},
): string {
  if (hasTechnicalQueryParams(params)) {
    return absoluteUrl("/");
  }
  const page = firstParam(params.page)?.trim();
  if (page && page !== "1" && isPaginationOnlyQuery(params)) {
    return buildUrlWithParams("/", { page });
  }
  if (hasFilterQueryParams(params)) {
    return absoluteUrl("/");
  }
  return absoluteUrl("/");
}

/** /auta index canonical with optional ?page=; other query params → plain /auta. */
export function resolveAutaIndexCanonicalUrl(
  params: Record<string, string | string[] | undefined> = {},
): string {
  if (isPaginationOnlyQuery(params)) {
    return buildUrlWithParams("/auta", params);
  }
  return absoluteUrl("/auta");
}

/** Listings canonical: filters → SEO cluster; pagination-only → self. */
export function resolveListingsCanonicalUrl(
  params: Record<string, string | string[] | undefined>,
): string {
  const brand = firstParam(params.brand);
  const model = firstParam(params.model);

  if (brand && model && !hasTechnicalQueryParams(params)) {
    return absoluteUrl(
      `/auta/${normalizeSlug(brand)}/${normalizeSlug(model)}`,
    );
  }
  if (brand && !hasTechnicalQueryParams(params)) {
    return absoluteUrl(`/auta/${normalizeSlug(brand)}`);
  }
  if (isPaginationOnlyQuery(params)) {
    return buildUrlWithParams("/listings", params);
  }
  return absoluteUrl("/listings");
}

export function shouldNoindexListings(
  params: Record<string, string | string[] | undefined>,
): boolean {
  return hasFilterQueryParams(params);
}

export function shouldNoindexAutaIndex(
  params: Record<string, string | string[] | undefined>,
): boolean {
  return hasFilterQueryParams(params);
}
