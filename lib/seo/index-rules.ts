/**
 * Params that, when present alone (or combined), still allow indexing.
 * Only brand and brand+model are indexable filter combos.
 */
const INDEXABLE_PARAMS = new Set(["brand", "model"]);

/** Params that are purely navigational and don't affect indexing decision. */
const IGNORED_PARAMS = new Set([
  "sort",
  "order",
  "limit",
  "countOnly",
  "openListing",
]);

/**
 * Determine whether a /listings search page should be indexed.
 *
 * Returns true ONLY when:
 * - brand is present (optionally with model)
 * - no other filter params are set
 * - page is 1 or absent
 * - userId is absent
 */
export function shouldIndexSearch(
  searchParams: URLSearchParams | Record<string, string | string[] | undefined>,
): boolean {
  const params =
    searchParams instanceof URLSearchParams
      ? searchParams
      : new URLSearchParams(
          Object.entries(searchParams ?? {}).flatMap(([k, v]) =>
            v === undefined
              ? []
              : Array.isArray(v)
                ? v.map((val) => [k, val])
                : [[k, v]],
          ),
        );

  if (!params.get("brand")?.trim()) return false;

  if (params.has("userId")) return false;

  const page = parseInt(params.get("page") ?? "1", 10);
  if (page > 1) return false;

  for (const [key] of params.entries()) {
    if (INDEXABLE_PARAMS.has(key)) continue;
    if (IGNORED_PARAMS.has(key)) continue;
    if (key === "page") continue;
    if (key.startsWith("utm_")) continue;
    if (key.startsWith("_restore")) continue;
    return false;
  }

  return true;
}

/**
 * Get the robots meta directive for a search page.
 */
export function getRobotsDirective(
  searchParams: URLSearchParams | Record<string, string | string[] | undefined>,
): { index: boolean; follow: boolean } {
  const params =
    searchParams instanceof URLSearchParams
      ? searchParams
      : new URLSearchParams(
          Object.entries(searchParams ?? {}).flatMap(([k, v]) =>
            v === undefined
              ? []
              : Array.isArray(v)
                ? v.map((val) => [k, val])
                : [[k, v]],
          ),
        );

  if (params.has("userId")) {
    return { index: false, follow: false };
  }

  const page = parseInt(params.get("page") ?? "1", 10);
  if (page > 1) {
    return { index: false, follow: true };
  }

  return {
    index: shouldIndexSearch(params),
    follow: true,
  };
}
