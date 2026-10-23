import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { requireAuth } from "@lib/auth";
import { insertListingSchema } from "@shared/schema";
import {
  getPrivateListingPriceId,
  requiresPrivateListingPayment,
} from "@shared/privateListingBilling";
import { pendingTopListings } from "@lib/pending-top-listings";
import {
  getCheckoutBaseUrl,
  getPrivateListingStripe,
  getStripe,
} from "@lib/stripeCheckout";
import type Stripe from "stripe";

const TOP_LISTING_PRICE = 9900; // 99 CZK in haléře

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const listingData = await req.json();

    const validationResult = insertListingSchema.safeParse({
      ...listingData,
      userId: user.id,
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

    const baseUrl = getCheckoutBaseUrl(req);
    const brand = validationResult.data.brand;
    const model = validationResult.data.model;
    const requiresPublishFee = requiresPrivateListingPayment(user);

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    // Private sellers: publish fee + TOP on the dedicated Stripe account.
    // Dealers/admins: TOP only on the primary Stripe account (unchanged).
    let stripe: Stripe;
    try {
      if (requiresPublishFee) {
        stripe = getPrivateListingStripe();
        lineItems.push({
          price: getPrivateListingPriceId(),
          quantity: 1,
        });
      } else {
        stripe = getStripe();
      }
    } catch (e: any) {
      console.error("TOP listing Stripe config error:", e?.message || e);
      return error("Payment system not configured", 503);
    }

    lineItems.push({
      price_data: {
        currency: "czk",
        product_data: {
          name: "TOP Inzerát",
          description: `Zvýraznění inzerátu: ${brand} ${model}`,
        },
        unit_amount: TOP_LISTING_PRICE,
      },
      quantity: 1,
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${baseUrl}/add-listing?payment=success&type=top&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/add-listing?payment=cancelled`,
      metadata: {
        userId: user.id,
        type: "new_top_listing",
        includesPublishFee: requiresPublishFee ? "1" : "0",
        stripeAccount: requiresPublishFee ? "private_listing" : "primary",
      },
    });

    pendingTopListings.set(session.id, {
      userId: user.id,
      listingData: validationResult.data,
      createdAt: Date.now(),
    });

    return json({ url: session.url, sessionId: session.id });
  } catch (e: any) {
    if (e.message === "Unauthorized") return error("Unauthorized", 401);
    console.error("TOP listing checkout error:", e);
    return error(e.message, 500);
  }
}
