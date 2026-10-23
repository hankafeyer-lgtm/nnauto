import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { requireAuth } from "@lib/auth";
import { storage } from "@lib/storage";
import { PRIVATE_LISTING_PRICE_CENTS } from "@shared/privateListingBilling";
import { pendingTopListings } from "@lib/pending-top-listings";
import { getPrivateListingStripe, getStripe } from "@lib/stripeCheckout";
import { buildPaymentSnapshots } from "@lib/paymentReceipt";
import { eq } from "drizzle-orm";
import { db } from "@lib/db";
import { payments } from "@shared/schema";

const TOP_LISTING_PRICE = 9900;
const TOP_LISTING_DURATION_DAYS = 30;

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { stripeSessionId } = await req.json();

    if (!stripeSessionId || typeof stripeSessionId !== "string") {
      return error("Invalid session ID", 400);
    }

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

    // Peek metadata on primary first; private publish+TOP lives on secondary account.
    let stripe = getStripe();
    let session;
    try {
      session = await stripe.checkout.sessions.retrieve(stripeSessionId);
    } catch {
      try {
        stripe = getPrivateListingStripe();
        session = await stripe.checkout.sessions.retrieve(stripeSessionId);
      } catch {
        return error("Payment system not configured", 503);
      }
    }

    try {
      if (session.payment_status !== "paid") {
        return error(
          "Payment not completed. Please complete payment first.",
          400,
        );
      }
      if (session.metadata?.userId !== user.id) {
        return error("Session user mismatch", 403);
      }
      if (session.metadata?.type !== "new_top_listing") {
        return error("Invalid session type", 400);
      }

      const includesPublishFee = session.metadata?.includesPublishFee === "1";
      const expectedTotals = includesPublishFee
        ? [
            TOP_LISTING_PRICE + PRIVATE_LISTING_PRICE_CENTS, // 69 + 99
            TOP_LISTING_PRICE + 6999, // legacy 69,99 + 99
          ]
        : [TOP_LISTING_PRICE];
      if (!expectedTotals.includes(session.amount_total ?? -1)) {
        console.error(
          `TOP listing amount mismatch: expected one of ${expectedTotals.join("/")}, got ${session.amount_total}`,
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

    pendingTopListings.delete(stripeSessionId);

    const includesPublishFee = session.metadata?.includesPublishFee === "1";

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + TOP_LISTING_DURATION_DAYS);

    const listing = await storage.createListing({
      ...pendingData.listingData,
      isTopListing: true,
    });
    const updatedListing = await storage.updateListing(listing.id, {
      topListingExpiresAt: expiresAt,
    });

    await storage.createPayment({
      userId: user.id,
      listingId: listing.id,
      amount: String(session.amount_total ?? TOP_LISTING_PRICE),
      currency: "czk",
      status: "completed",
      stripeSessionId: stripeSessionId,
      stripePaymentIntentId: (session.payment_intent as string) || null,
      ...buildPaymentSnapshots({
        user,
        listing: updatedListing ?? listing,
        paymentType: "new_top_listing",
        includesPublishFee,
        includesTop: true,
      }),
    });

    console.log(
      `TOP listing ${listing.id} created after successful payment (session: ${stripeSessionId})`,
    );

    return json(updatedListing ?? listing);
  } catch (e: any) {
    if (e.message === "Unauthorized") return error("Unauthorized", 401);
    console.error("Error completing TOP listing:", e);
    return error(e.message, 500);
  }
}
