import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { requireAuth } from "@lib/auth";
import { insertListingSchema } from "@shared/schema";
import {
  PRIVATE_LISTING_PAYMENT_TYPE,
  PRIVATE_LISTING_PRICE_LABEL,
  getPrivateListingPriceId,
  requiresPrivateListingPayment,
} from "@shared/privateListingBilling";
import { pendingPrivateListings } from "@lib/pending-private-listings";
import {
  getCheckoutBaseUrl,
  getPrivateListingStripe,
} from "@lib/stripeCheckout";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();

    if (!requiresPrivateListingPayment(user)) {
      return error(
        "Dealers publish via dealer packages, not the private listing fee.",
        400,
      );
    }

    const listingData = await req.json();
    const validationResult = insertListingSchema.safeParse({
      ...listingData,
      userId: user.id,
      isTopListing: false,
    });

    if (!validationResult.success) {
      const details = validationResult.error.issues
        .slice(0, 5)
        .map((issue) => issue.message)
        .join("; ");
      return error(
        details
          ? `Neplatná data inzerátu: ${details}`
          : "Neplatná data inzerátu",
        400,
      );
    }

    let stripe;
    let priceId: string;
    try {
      stripe = getPrivateListingStripe();
      priceId = getPrivateListingPriceId();
    } catch (e: any) {
      console.error("Private listing Stripe config error:", e?.message || e);
      return error("Payment system not configured", 503);
    }

    const baseUrl = getCheckoutBaseUrl(req);
    const brand = validationResult.data.brand;
    const model = validationResult.data.model;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/add-listing?payment=success&type=private&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/add-listing?payment=cancelled`,
      metadata: {
        userId: user.id,
        type: PRIVATE_LISTING_PAYMENT_TYPE,
        brand,
        model,
        priceLabel: PRIVATE_LISTING_PRICE_LABEL,
      },
    });

    pendingPrivateListings.set(session.id, {
      userId: user.id,
      listingData: validationResult.data,
      createdAt: Date.now(),
    });

    return json({ url: session.url, sessionId: session.id });
  } catch (e: any) {
    if (e.message === "Unauthorized") return error("Unauthorized", 401);
    console.error("Private listing checkout error:", e);
    return error(e.message, 500);
  }
}
