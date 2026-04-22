import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

/** Shape of the owner-only analytics numbers that we show both on listing
 *  cards (in "Moje inzeráty" / admin view) and on the full listing page.
 *  Keeping this type in one file guarantees the two places never drift. */
export type ListingStats = {
  views: number;
  contactClicks: number;
  whatsappClicks: number;
  telegramClicks: number;
};

export type ListingStatsMap = Record<string, ListingStats>;

const EMPTY_STATS: ListingStats = {
  views: 0,
  contactClicks: 0,
  whatsappClicks: 0,
  telegramClicks: 0,
};

function stableKey(ids: string[]): string {
  return [...ids].sort().join(",");
}

/**
 * Batch analytics for multiple listings at once.
 *
 * - Returns undefined while the first request is in flight so consumers can
 *   render a skeleton instead of fake zeros.
 * - After load, returns a map `{ [listingId]: { views, contactClicks, ... } }`
 *   — identical to the numbers shown on the listing detail page.
 * - Auto-refreshes every 60 s; safe to call from many components (react-query
 *   dedupes by `queryKey`).
 */
export function useListingStatsBatch(
  ids: string[],
  options: { enabled?: boolean } = {},
) {
  const key = useMemo(() => stableKey(ids), [ids]);
  const enabled = (options.enabled ?? true) && ids.length > 0;

  const { data, isLoading, isFetching } = useQuery<{ items: ListingStatsMap }>({
    queryKey: ["/api/listings/analytics/batch", key],
    enabled,
    staleTime: 30_000,
    refetchInterval: 60_000,
    retry: 1,
    retryDelay: 800,
    queryFn: async () => {
      if (!ids.length) return { items: {} };
      // Cache-bust once per minute so Safari never serves a stale {}
      // response while in-memory react-query deduplication still works.
      const bust = Math.floor(Date.now() / 60_000);
      const res = await apiRequest(
        "GET",
        `/api/listings/analytics/batch?ids=${encodeURIComponent(
          ids.join(","),
        )}&_t=${bust}`,
      );
      return (await res.json()) as { items: ListingStatsMap };
    },
  });

  return {
    items: data?.items ?? {},
    isLoading,
    isFetching,
    hasData: data !== undefined,
  };
}

/**
 * Single-listing convenience wrapper over `useListingStatsBatch`. The full
 * listing detail page and cards now read from the same cache entry in
 * react-query, so numbers are guaranteed to match.
 */
export function useListingStats(
  listingId: string | null | undefined,
  options: { enabled?: boolean } = {},
) {
  const ids = useMemo(
    () => (listingId ? [listingId] : []),
    [listingId],
  );
  const { items, isLoading, isFetching, hasData } = useListingStatsBatch(ids, {
    enabled: options.enabled,
  });
  const stats = listingId ? items[listingId] : undefined;
  return { stats, isLoading, isFetching, hasData };
}

export { EMPTY_STATS };
