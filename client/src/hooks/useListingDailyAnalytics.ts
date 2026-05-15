import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export type AnalyticsDailyBucket = {
  date: string;
  views: number;
  contactClicks: number;
  whatsappClicks: number;
  telegramClicks: number;
};

export type ListingDailyAnalytics = {
  days: AnalyticsDailyBucket[];
  totals: {
    views: number;
    contactClicks: number;
    whatsappClicks: number;
    telegramClicks: number;
  };
  weekOverWeek: {
    lastWeek: number;
    prevWeek: number;
    /** Null when prevWeek was 0 and lastWeek > 0 (no meaningful base). */
    deltaPercent: number | null;
  };
  window: 7 | 30;
};

/**
 * Owner-only daily analytics for a single listing.
 *
 * Reuses the cabinet polling cadence from `useListingStats` (60s
 * refresh, 30s stale) so it slots in next to it without doubling the
 * request rate. The endpoint is gated by listing ownership / admin
 * on the server.
 */
export function useListingDailyAnalytics(
  listingId: string | null | undefined,
  options: { days?: 7 | 30; enabled?: boolean } = {},
) {
  const days = options.days ?? 7;
  const enabled = (options.enabled ?? true) && !!listingId;

  return useQuery<ListingDailyAnalytics>({
    queryKey: ["/api/listings", listingId, "analytics/daily", days],
    enabled,
    staleTime: 60_000,
    refetchInterval: 120_000,
    retry: 1,
    retryDelay: 800,
    queryFn: async () => {
      const res = await apiRequest(
        "GET",
        `/api/listings/${listingId}/analytics/daily?days=${days}`,
      );
      return (await res.json()) as ListingDailyAnalytics;
    },
  });
}
