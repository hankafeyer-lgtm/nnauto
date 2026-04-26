/**
 * Display-only adjustments for listing statistics.
 *
 * The database always stores the *real* numbers. These helpers are applied
 * exclusively at the rendering layer (JSX) so that calculations
 * (conversion rate, percentage bars, sorting, etc.) keep using the raw
 * values. Never use these helpers inside math.
 */

/** Constant offset added to every displayed view count. */
export const VIEWS_DISPLAY_OFFSET = 10;

/**
 * Adjust the raw view count for display only.
 *
 * The DB value stays untouched; once a listing has any real traffic the
 * UI shows `views + offset` so cards and the detail page communicate a
 * more meaningful baseline to visitors.
 *
 * Brand-new listings that still have **zero** real views are an explicit
 * exception — we keep the displayed number at `0` so freshly added cars
 * never appear with a fake `10` views the moment they go live. The +10
 * boost only kicks in after at least one real visitor has opened the
 * listing, which also covers the loading state (we treat unknown / null
 * values as zero and therefore render `0`).
 */
export function displayViews(
  rawViews: number | null | undefined,
): number {
  const safe =
    typeof rawViews === "number" && Number.isFinite(rawViews) && rawViews > 0
      ? Math.floor(rawViews)
      : 0;
  if (safe === 0) return 0;
  return safe + VIEWS_DISPLAY_OFFSET;
}
