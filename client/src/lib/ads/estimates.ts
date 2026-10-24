/** Demo-only reach estimate — clearly labeled as approximate in the UI. */

export function estimateDailyImpressions(
  dailyBudgetCzk: number,
  placementWeight = 1,
): number {
  if (!Number.isFinite(dailyBudgetCzk) || dailyBudgetCzk <= 0) return 0;
  // Rough CPM-style model: ~25 Kč per 1000 impressions × placement weight
  const base = Math.round((dailyBudgetCzk / 25) * 1000 * placementWeight);
  return Math.max(0, base);
}

export function estimateTotalImpressions(
  dailyBudgetCzk: number,
  startDate: string,
  endDate: string,
  placementWeight = 1,
): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
  const days = Math.max(
    1,
    Math.ceil((end.getTime() - start.getTime()) / 86_400_000) + 1,
  );
  return estimateDailyImpressions(dailyBudgetCzk, placementWeight) * days;
}

export const PLACEMENT_WEIGHT: Record<string, number> = {
  homepage_top: 1.2,
  listing_top: 1.0,
  listing_inline: 0.85,
  vehicle_detail_sidebar: 0.7,
  featured_top: 1.1,
  category_brand: 0.9,
  sell_car: 0.75,
};
