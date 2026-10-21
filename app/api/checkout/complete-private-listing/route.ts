import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { requireAuth } from "@lib/auth";
import { storage } from "@lib/storage";
import {
  PRIVATE_LISTING_PAYMENT_TYPE,
  PRIVATE_LISTING_PRICE_CENTS,
  requiresPrivateListingPayment,
} from "@shared/privateListingBilling";
import { pendingPrivateListings } from "@lib/pending-private-listings";
import { getPrivateListingStripe } from "@lib/stripeCheckout";
import { eq } from "drizzle-orm";
import { db } from "@lib/db";
import { payments } from "@shared/schema";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { stripeSessionId } = await req.json();

    if (!stripeSessionId || typeof stripeSessionId !== "string") {
      return error("Invalid session ID", 400);
    }

    if (!requiresPrivateListingPayment(user)) {
      return error("Dealers do not use private listing checkout", 400);
    }

    // Idempotency: if this session already created a listing, return it.
    const [existingPayment] = await db
      .select()
      .from(payments)
      .where(eq(payments.stripeSessionId, stripeSessionId))
      .limit(1);
    if (existingPayment?.listingId) {
      const existingListing = await storage.getListing(existingPayment.listingId);
      if (existingListing && existingListing.userId === user.id) {
        return json(existingListing);
      }
    }

    const pendingData = pendingPrivateListings.get(stripeSessionId);
    if (!pendingData) {
      return error(
        "No pending listing found for this session. It may have expired or already been used.",
        400,
      );
    }

    if (pendingData.userId !== user.id) {
      return error("This session belongs to a different user", 403);
    }

    let stripe;
    try {
      stripe = getPrivateListingStripe();
    } catch {
      return error("Payment system not configured", 503);
    }

    let session;
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
      if (session.metadata?.type !== PRIVATE_LISTING_PAYMENT_TYPE) {
        return error("Invalid session type", 400);
      }
      // Accept the configured Stripe Price amount (69 Kč) with a small tolerance
      // for legacy 69,99 Kč test sessions.
      const amount = session.amount_total ?? 0;
      if (amount !== PRIVATE_LISTING_PRICE_CENTS && amount !== 6999) {
        console.error(
          `Private listing amount mismatch: expected ${PRIVATE_LISTING_PRICE_CENTS}, got ${amount}`,
        );
        return error("Invalid payment amount", 400);
      }
    } catch (err) {
      console.error("Error verifying Stripe session:", err);
      return error(
        "Could not verify payment. Please contact support.",
        400,
      );
    }

    pendingPrivateListings.delete(stripeSessionId);

    const listing = await storage.createListing({
      ...pendingData.listingData,
      isTopListing: false,
    });

    await storage.createPayment({
      userId: user.id,
      listingId: listing.id,
      amount: String(session.amount_total ?? PRIVATE_LISTING_PRICE_CENTS),
      currency: "czk",
      status: "completed",
      stripeSessionId,
      stripePaymentIntentId: (session.payment_intent as string) || null,
    });

    console.log(
      `Private listing ${listing.id} created after payment (session: ${stripeSessionId})`,
    );

    return json(listing);
  } catch (e: any) {
    if (e.message === "Unauthorized") return error("Unauthorized", 401);
    console.error("Error completing private listing:", e);
    return error(e.message, 500);
  }
}
