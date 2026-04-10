const BASE_URL = "https://nnauto.cz";

const SEARCH_ALLOWED_PARAMS = new Set(["brand", "model"]);

const BLACKLISTED_PREFIXES = ["utm_", "_restore"];

const BLACKLISTED_PARAMS = new Set([
  "sort",
  "order",
  "userId",
  "openListing",
  "limit",
  "countOnly",
  "includeSoldListings",
]);

function isBlacklisted(key: string): boolean {
  if (BLACKLISTED_PARAMS.has(key)) return true;
  return BLACKLISTED_PREFIXES.some((p) => key.startsWith(p));
}

/**
 * Build a normalized canonical URL.
 *
 * For /listings: keeps only brand + model, sorts alphabetically, strips empties.
 * page=1 or absent -> no page param. page>1 -> includes page.
 * For all other paths: canonical = pathname only (no query params).
 */
export function buildCanonical(
  pathname: string,
  searchParams?: URLSearchParams | Record<string, string | string[] | undefined>,
): string {
  if (pathname !== "/listings") {
    return `${BASE_URL}${pathname}`;
  }

  const params =
    searchParams instanceof URLSearchParams
      ? searchParams
      : new URLSearchParams(
          Object.entries(searchParams ?? {}).flatMap(([k, v]) =>
            v === undefined ? [] : Array.isArray(v) ? v.map((val) => [k, val]) : [[k, v]],
          ),
        );

  const canonical = new URLSearchParams();

  for (const key of Array.from(SEARCH_ALLOWED_PARAMS).sort()) {
    const val = params.get(key)?.trim();
    if (val) canonical.set(key, val);
  }

  const page = parseInt(params.get("page") ?? "", 10);
  if (page > 1) canonical.set("page", String(page));

  const qs = canonical.toString();
  return qs ? `${BASE_URL}${pathname}?${qs}` : `${BASE_URL}${pathname}`;
}

/**
 * Build rel="prev" / rel="next" pagination links for metadata.
 */
export function buildPaginationLinks(
  pathname: string,
  searchParams: URLSearchParams | Record<string, string | string[] | undefined>,
  currentPage: number,
  totalPages: number,
): { prev?: string; next?: string } {
  const result: { prev?: string; next?: string } = {};

  const params =
    searchParams instanceof URLSearchParams
      ? searchParams
      : new URLSearchParams(
          Object.entries(searchParams ?? {}).flatMap(([k, v]) =>
            v === undefined ? [] : Array.isArray(v) ? v.map((val) => [k, val]) : [[k, v]],
          ),
        );

  const buildPageUrl = (page: number) => {
    const p = new URLSearchParams();
    for (const key of Array.from(SEARCH_ALLOWED_PARAMS).sort()) {
      const val = params.get(key)?.trim();
      if (val) p.set(key, val);
    }
    if (page > 1) p.set("page", String(page));
    const qs = p.toString();
    return qs ? `${BASE_URL}${pathname}?${qs}` : `${BASE_URL}${pathname}`;
  };

  if (currentPage > 1) {
    result.prev = buildPageUrl(currentPage - 1);
  }
  if (currentPage < totalPages) {
    result.next = buildPageUrl(currentPage + 1);
  }

  return result;
}

export { BASE_URL };
