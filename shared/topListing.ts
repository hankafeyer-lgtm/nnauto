/** Private / site-wide TOP highlight (existing listing promote or new TOP checkout). */
export const TOP_LISTING_PRICE_CENTS = 9900; // 99 Kč
export const TOP_LISTING_PRICE_LABEL = "99 Kč";
export const TOP_LISTING_DURATION_DAYS = 30;

export type TopListingLike = {
  isTopListing?: boolean | null;
  topListingExpiresAt?: Date | string | null;
};

/** True only while TOP is currently active (expired dates count as not TOP). */
export function isActiveTopListing(listing: TopListingLike | null | undefined): boolean {
  if (!listing?.isTopListing) return false;
  if (!listing.topListingExpiresAt) return true; // legacy permanent TOP
  const expires = new Date(listing.topListingExpiresAt);
  return Number.isFinite(expires.getTime()) && expires.getTime() > Date.now();
}

export function computeTopListingExpiresAt(
  from: Date = new Date(),
  days: number = TOP_LISTING_DURATION_DAYS,
): Date {
  const expiresAt = new Date(from);
  expiresAt.setDate(expiresAt.getDate() + days);
  return expiresAt;
}

/** Overlay DB row with effective TOP flag for UI / API responses. */
export function withActiveTopListingStatus<T extends TopListingLike>(listing: T): T {
  const active = isActiveTopListing(listing);
  if (active === Boolean(listing.isTopListing)) return listing;
  return { ...listing, isTopListing: active };
}
