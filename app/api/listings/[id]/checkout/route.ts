import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { requireAuth } from "@lib/auth";
import { storage } from "@lib/storage";
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

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    let stripe: Stripe;
    try {
      stripe = getStripe();
    } catch {
      return error("Payment system not configured", 503);
    }

    const listing = await storage.getListing(id);
    if (!listing) return error("Listing not found", 404);

    if (listing.userId !== user.id) {
      return error("Cannot promote another user's listing", 403);
    }

    if (listing.isTopListing) {
      return error("Listing is already a TOP listing", 400);
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
              description: `Zvýraznění inzerátu: ${listing.brand} ${listing.model}`,
            },
            unit_amount: TOP_LISTING_PRICE,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/listings?userId=${user.id}&promoted=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/listings?userId=${user.id}&promoted=cancelled`,
      metadata: {
        listingId: id,
        userId: user.id,
        type: "promote_listing",
      },
    });

    return json({ url: session.url, sessionId: session.id });
  } catch (e: any) {
    if (e.message === "Unauthorized") return error("Unauthorized", 401);
    console.error("Stripe checkout error:", e);
    return error(e.message, 500);
  }
}
