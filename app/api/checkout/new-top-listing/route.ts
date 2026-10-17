import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { requireAuth } from "@lib/auth";
import { insertListingSchema } from "@shared/schema";
import {
  PRIVATE_LISTING_PRICE_CENTS,
  PRIVATE_LISTING_PRICE_LABEL,
} from "@shared/privateListingBilling";
import { pendingTopListings } from "@lib/pending-top-listings";
import { getCheckoutBaseUrl, getStripe } from "@lib/stripeCheckout";

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
      return error("Invalid listing data", 400);
    }

    let stripe;
    try {
      stripe = getStripe();
    } catch {
      return error("Payment system not configured", 503);
    }

    const baseUrl = getCheckoutBaseUrl(req);
    const brand = validationResult.data.brand;
    const model = validationResult.data.model;
    const requiresPublishFee = !user.isDealer && !user.isAdmin;

    const lineItems: Array<{
      price_data: {
        currency: string;
        product_data: { name: string; description: string };
        unit_amount: number;
      };
      quantity: number;
    }> = [];

    if (requiresPublishFee) {
      lineItems.push({
        price_data: {
          currency: "czk",
          product_data: {
            name: "Zveřejnění inzerátu",
            description: `Jednorázová platba ${PRIVATE_LISTING_PRICE_LABEL} za inzerát ${brand} ${model}. Platí natrvalo.`,
          },
          unit_amount: PRIVATE_LISTING_PRICE_CENTS,
        },
        quantity: 1,
      });
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
