"use client";

/**
 * Skeleton for the first viewport of ListingDetailPage while NoSSR waits for
 * hydration. Mirrors the real structure: Header band, container + 3-col grid,
 * back row, 3:2 gallery card (same aspect as Carousel), chip row, text
 * band, and a tall right column so the layout below (e.g. Souvisejici auta)
 * does not jump as much when the SPA replaces this block.
 *
 * Header slot heights follow `Header` non-compact: h-16 sm:h-20 lg:h-24.
 */
export function ListingDetailDelegatedFallback() {
  return (
    <div
      className="w-full max-w-[100vw] overflow-x-clip bg-background"
      data-testid="listing-detail-no-ssr-fallback"
      aria-label="Načítání"
    >
      <div
        className="h-16 w-full shrink-0 sm:h-20 lg:h-24 bg-muted/25"
        aria-hidden
        data-testid="listing-detail-header-slot"
      />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:items-start">
          <div className="space-y-6 lg:col-span-2">
            <div
              className="h-10 w-44 rounded-md bg-muted/50"
              aria-hidden
              data-testid="listing-detail-fallback-back"
            />
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <div className="relative aspect-[3/2] w-full bg-muted">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className="h-8 w-8 rounded-full border-2 border-muted-foreground/25 border-t-[#B8860B] animate-spin motion-reduce:animate-none"
                    aria-hidden
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3" aria-hidden>
              <div className="h-8 w-24 rounded-full bg-muted/50" />
              <div className="h-8 w-28 rounded-full bg-muted/50" />
              <div className="h-8 w-20 rounded-full bg-muted/50" />
            </div>
            <div
              className="h-24 max-w-2xl rounded-md bg-muted/35"
              aria-hidden
              data-testid="listing-detail-fallback-textband"
            />
          </div>
          <div className="lg:self-start">
            <div
              className="min-h-[26rem] rounded-2xl border border-border bg-muted/20 shadow-xl sm:min-h-[28rem]"
              aria-hidden
              data-testid="listing-detail-fallback-sidebar"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
