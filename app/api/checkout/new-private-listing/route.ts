import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { requireAuth } from "@lib/auth";
import { insertListingSchema } from "@shared/schema";
import {
  PRIVATE_LISTING_PAYMENT_TYPE,
  PRIVATE_LISTING_PRICE_CENTS,
  PRIVATE_LISTING_PRICE_LABEL,
} from "@shared/privateListingBilling";
import { pendingPrivateListings } from "@lib/pending-private-listings";
import { getCheckoutBaseUrl, getStripe } from "@lib/stripeCheckout";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();

    if (user.isDealer) {
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

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "czk",
            product_data: {
              name: "Zveřejnění inzerátu",
              description: `Jednorázová platba ${PRIVATE_LISTING_PRICE_LABEL} za inzerát ${brand} ${model}. Platí natrvalo, dokud inzerát sami nesmažete.`,
            },
            unit_amount: PRIVATE_LISTING_PRICE_CENTS,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/add-listing?payment=success&type=private&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/add-listing?payment=cancelled`,
      metadata: {
        userId: user.id,
        type: PRIVATE_LISTING_PAYMENT_TYPE,
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
