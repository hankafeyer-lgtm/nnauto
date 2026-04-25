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
 * The DB value stays untouched; the UI shows `views + offset` so cards and
 * the detail page communicate a more meaningful baseline to visitors.
 * Pass `undefined` / `null` while loading and the helper falls back to the
 * offset itself, keeping the displayed number stable.
 */
export function displayViews(
  rawViews: number | null | undefined,
): number {
  const safe =
    typeof rawViews === "number" && Number.isFinite(rawViews) && rawViews > 0
      ? Math.floor(rawViews)
      : 0;
  return safe + VIEWS_DISPLAY_OFFSET;
}
