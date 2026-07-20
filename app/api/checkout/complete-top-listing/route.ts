import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { requireAuth } from "@lib/auth";
import { storage } from "@lib/storage";
import Stripe from "stripe";
import { pendingTopListings } from "@lib/pending-top-listings";

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

    const pendingData = pendingTopListings.get(stripeSessionId);
    if (!pendingData) {
      return error(
        "No pending listing found for this session. It may have expired or already been used.",
        400,
      );
    }

    if (pendingData.userId !== user.id) {
      return error("This session belongs to a different user", 403);
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
      if (session.payment_status !== "paid") {
        return error(
          "Payment not completed. Please complete payment first.",
          400,
        );
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

    pendingTopListings.delete(stripeSessionId);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + TOP_LISTING_DURATION_DAYS);

    const listing = await storage.createListing({
      ...pendingData.listingData,
      isTopListing: true,
      topListingExpiresAt: expiresAt,
    });

    await storage.createPayment({
      userId: user.id,
      listingId: listing.id,
      amount: TOP_LISTING_PRICE.toString(),
      currency: "czk",
      status: "completed",
      stripeSessionId: stripeSessionId,
      stripePaymentIntentId: (session.payment_intent as string) || null,
    });

    console.log(
      `TOP listing ${listing.id} created after successful payment (session: ${stripeSessionId})`,
    );

    return json(listing);
  } catch (e: any) {
    if (e.message === "Unauthorized") return error("Unauthorized", 401);
    console.error("Error completing TOP listing:", e);
    return error(e.message, 500);
  }
}
