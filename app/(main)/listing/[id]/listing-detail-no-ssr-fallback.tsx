"use client";

/**
 * Placeholder shown under ListingSeoSummary until the listing SPA hydrates.
 * Height is tuned to approximate the first paint of ListingDetailPage
 * (back button + ~3:2 gallery + badge row + spec chips) so replacing this
 * block with real content causes less vertical jump than the generic 60vh
 * spinner from NoSSR. Not pixel-perfect — CLS mitigation only.
 */
export function ListingDetailDelegatedFallback() {
  return (
    <div
      aria-label="Načítání"
      className="w-full bg-background min-h-[62dvh] sm:min-h-[46rem] lg:min-h-[42rem] flex items-start justify-center pt-8 sm:pt-10"
      data-testid="listing-detail-no-ssr-fallback"
    >
      <div
        className="h-9 w-9 shrink-0 rounded-full border-[3px] border-[rgba(184,134,11,0.25)] border-t-[#B8860B] animate-spin motion-reduce:animate-none"
        aria-hidden
      />
    </div>
  );
}
