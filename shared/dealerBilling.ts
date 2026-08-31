/**
 * Temporary promo mode: dealer packages are not charged and listing counts are
 * not capped, so dealers can publish any number of vehicles for free.
 *
 * Set to `false` to restore paid START / BUSINESS / PRO packages together with
 * their listing limits. Nothing else has to be reverted — every payment and
 * limit gate on the server and in the dealer cabinet reads this flag.
 */
export const DEALER_BILLING_FREE_MODE = true;

/** Slot allowance used while {@link DEALER_BILLING_FREE_MODE} is on. */
export const DEALER_FREE_MODE_MAX_LISTINGS = 1_000_000;
