import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { requireAuth } from "@lib/auth";
import { insertListingSchema } from "@shared/schema";
import Stripe from "stripe";

const TOP_LISTING_PRICE = 9900; // 99 CZK in haléře

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Stripe not configured");
  return new Stripe(key);
}

function getBaseUrl(req: NextRequest): string {
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

// In-memory store for pending TOP listings, keyed by Stripe session ID.
// In production, use Redis or a database table for persistence across restarts.
const pendingTopListings = new Map<
  string,
  { userId: string; listingData: any; createdAt: number }
>();

setInterval(
  () => {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    for (const [sessionId, data] of pendingTopListings) {
      if (data.createdAt < oneHourAgo) pendingTopListings.delete(sessionId);
    }
  },
  15 * 60 * 1000,
);

export { pendingTopListings };

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

    let stripe: Stripe;
    try {
      stripe = getStripe();
    } catch {
      return error("Payment system not configured", 503);
    }

    const baseUrl = getBaseUrl(req);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "czk",
            product_data: {
              name: "TOP Inzerát",
              description: `Zvýraznění inzerátu: ${validationResult.data.brand} ${validationResult.data.model}`,
            },
            unit_amount: TOP_LISTING_PRICE,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/add-listing?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/add-listing?payment=cancelled`,
      metadata: {
        userId: user.id,
        type: "new_top_listing",
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
