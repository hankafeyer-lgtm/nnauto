import { NextRequest } from "next/server";
import Stripe from "stripe";
import { PRIVATE_LISTING_SECRET_KEY_ENV } from "@shared/privateListingBilling";

/** Primary Stripe account (TOP, dealers, Cebia, existing flows). */
export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Stripe not configured");
  return new Stripe(key);
}

/**
 * Dedicated Stripe account for private listing publish fees.
 * Falls back to primary only if the dedicated key is missing (dev convenience);
 * production should always set STRIPE_PRIVATE_LISTING_SECRET_KEY.
 */
export function getPrivateListingStripe(): Stripe {
  const dedicated = (process.env.STRIPE_PRIVATE_LISTING_SECRET_KEY || "").trim();
  if (dedicated) return new Stripe(dedicated);
  throw new Error(
    `${PRIVATE_LISTING_SECRET_KEY_ENV} is not configured — private listing payments need the secondary Stripe account`,
  );
}

export function getCheckoutBaseUrl(req: NextRequest): string {
  if (process.env.APP_BASE_URL) return process.env.APP_BASE_URL;
  const origin = req.headers.get("origin");
  if (origin) return origin;
  const host = req.headers.get("host");
  if (host) {
    const proto =
      req.headers.get("x-forwarded-proto") === "https" ? "https" : "http";
    return `${proto}://${host}`;
  }
  return "http://localhost:3000";
}
