/**
 * One-time publish fee for private (non-dealer) sellers.
 * Charged via a dedicated Stripe account/price (see STRIPE_PRIVATE_LISTING_* env).
 * Listing stays active until the seller removes it — no monthly renewal.
 */
export const PRIVATE_LISTING_PRICE_CENTS = 6900; // 69,00 Kč — matches Stripe Price
export const PRIVATE_LISTING_PRICE_LABEL = "69 Kč";
export const PRIVATE_LISTING_PAYMENT_TYPE = "new_private_listing";
export const PRIVATE_LISTING_PRICE_ID_ENV = "STRIPE_PRIVATE_LISTING_PRICE_ID";
export const PRIVATE_LISTING_SECRET_KEY_ENV = "STRIPE_PRIVATE_LISTING_SECRET_KEY";

function asBool(value: unknown): boolean {
  return value === true || value === 1 || value === "true" || value === "1";
}

/** True when this account must pay before publishing a listing. */
export function requiresPrivateListingPayment(user: {
  isDealer?: unknown;
  isAdmin?: unknown;
} | null | undefined): boolean {
  if (!user) return false;
  return !asBool(user.isDealer) && !asBool(user.isAdmin);
}

export function getPrivateListingPriceId(): string {
  const id = (process.env.STRIPE_PRIVATE_LISTING_PRICE_ID || "").trim();
  if (!id) {
    throw new Error("STRIPE_PRIVATE_LISTING_PRICE_ID is not configured");
  }
  return id;
}
