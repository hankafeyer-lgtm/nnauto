import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { requireAuth } from "@lib/auth";
import { storage } from "@lib/storage";
import Stripe from "stripe";

const TOP_LISTING_PRICE = 9900;
const TOP_LISTING_DURATION_DAYS = 30;

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Stripe not configured");
  return new Stripe(key);
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { stripeSessionId } = await req.json();

    if (!stripeSessionId || typeof stripeSessionId !== "string") {
      return error("Invalid session ID", 400);
    }

    let stripe: Stripe;
    try {
      stripe = getStripe();
    } catch {
      return error("Payment system not configured", 503);
    }

    let session: Stripe.Checkout.Session;
    try {
      session = await stripe.checkout.sessions.retrieve(stripeSessionId);

      if (session.status !== "complete") {
        return error(
          "Checkout session not complete. Please complete payment first.",
          400,
        );
      }

      if (session.payment_status !== "paid") {
        return error(
          "Payment not completed. Please complete payment first.",
          400,
        );
      }

      if (session.metadata?.type !== "promote_listing") {
        return error("Invalid session type", 400);
      }

      if (session.amount_total !== TOP_LISTING_PRICE) {
        console.error(
          `Amount mismatch: expected ${TOP_LISTING_PRICE}, got ${session.amount_total}`,
        );
        return error("Invalid payment amount", 400);
      }

      if (session.metadata?.userId !== user.id) {
        return error("Session user mismatch", 403);
      }
    } catch (err) {
      console.error("Error verifying Stripe session:", err);
      return error(
        "Could not verify payment. Please contact support.",
        400,
      );
    }

    const listingId = session.metadata?.listingId;
    if (!listingId) {
      return error("No listing ID in session", 400);
    }

    const listing = await storage.getListing(listingId);
    if (!listing) return error("Listing not found", 404);

    if (listing.userId !== user.id) {
      return error("Cannot promote another user's listing", 403);
    }

    const activeTopExpiresAt = listing.topListingExpiresAt
      ? new Date(listing.topListingExpiresAt)
      : null;
    if (
      listing.isTopListing &&
      activeTopExpiresAt &&
      activeTopExpiresAt.getTime() > Date.now()
    ) {
      console.log(`Listing ${listingId} already TOP - returning success`);
      return json(listing);
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + TOP_LISTING_DURATION_DAYS);

    const updatedListing = await storage.updateListing(listingId, {
      isTopListing: true,
      topListingExpiresAt: expiresAt,
    });

    await storage.createPayment({
      userId: user.id,
      listingId: listingId,
      amount: (session.amount_total || TOP_LISTING_PRICE).toString(),
      currency: session.currency || "czk",
      status: "completed",
      stripeSessionId: stripeSessionId,
      stripePaymentIntentId: (session.payment_intent as string) || null,
    });

    console.log(
      `Listing ${listingId} promoted to TOP after successful payment (session: ${stripeSessionId})`,
    );

    return json(updatedListing);
  } catch (e: any) {
    if (e.message === "Unauthorized") return error("Unauthorized", 401);
    console.error("Error completing promotion:", e);
    return error(e.message, 500);
  }
}
