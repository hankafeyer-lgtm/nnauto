import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { requireDealer } from "@lib/auth";
import { storage } from "@lib/storage";
import Stripe from "stripe";

const DEFAULT_TOP_7_PRICE_ID = "price_1Ts5D4ACpd0JnzGaR9UH7R84";
const DEFAULT_TOP_14_PRICE_ID = "price_1Ts5FbACpd0JnzGax7jc5gF6";
const DEFAULT_TOP_30_PRICE_ID = "price_1Ts5GdACpd0JnzGaJkIaNZDX";
const TOP_PRICES_KC = {
  "7": 39,
  "14": 69,
  "30": 99,
} as const;

type TopDuration = keyof typeof TOP_PRICES_KC;

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY || process.env.DEALER_STRIPE_SECRET_KEY;
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

function isTopDuration(value: unknown): value is TopDuration {
  return value === "7" || value === "14" || value === "30";
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireDealer();
    if (!user.dealerId) return error("Dealer not found", 404);

    const body = await req.json().catch(() => ({}));
    const listingIds = Array.isArray(body.listingIds)
      ? body.listingIds.filter((id: unknown): id is string => typeof id === "string" && !!id)
      : [];
    const duration = isTopDuration(body.duration) ? body.duration : "30";

    if (listingIds.length === 0) return error("Vyberte alespoň jeden inzerát", 400);
    if (listingIds.length > 10) {
      return error("Najednou lze topovat maximálně 10 inzerátů", 400);
    }

    const listings = await Promise.all(listingIds.map((id) => storage.getListing(id)));
    for (const listing of listings) {
      if (!listing) return error("Listing not found", 404);
      if (listing.userId !== user.id) return error("Cannot promote another user's listing", 403);
      if (listing.isTopListing) return error("Listing is already TOP", 400);
    }

    const stripe = getStripe();
    const baseUrl = getBaseUrl(req);
    const priceKc = TOP_PRICES_KC[duration];
    const priceIdByDuration: Partial<Record<TopDuration, string>> = {
      "7":
        process.env.DEALER_TOP_7_STRIPE_PRICE_ID ||
        process.env.TOP_7_STRIPE_PRICE_ID ||
        DEFAULT_TOP_7_PRICE_ID,
      "14":
        process.env.DEALER_TOP_14_STRIPE_PRICE_ID ||
        process.env.TOP_14_STRIPE_PRICE_ID ||
        DEFAULT_TOP_14_PRICE_ID,
      "30":
        process.env.DEALER_TOP_30_STRIPE_PRICE_ID ||
        process.env.TOP_30_STRIPE_PRICE_ID ||
        DEFAULT_TOP_30_PRICE_ID,
    };
    const stripePriceId = priceIdByDuration[duration];

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        stripePriceId
          ? {
              price: stripePriceId,
              quantity: listingIds.length,
            }
          : {
              price_data: {
                currency: "czk",
                product_data: {
                  name: `TOPování inzerátu na ${duration} dní`,
                  description: `Zvýraznění ${listingIds.length} inzerátů na NNAuto.cz`,
                },
                unit_amount: priceKc * 100,
              },
              quantity: listingIds.length,
            },
      ],
      mode: "payment",
      success_url:
        `${baseUrl}/dealer?tab=topovani&top_payment=success` +
        `&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/dealer?tab=topovani&top_payment=cancelled`,
      metadata: {
        type: "dealer_top_listing",
        userId: user.id,
        dealerId: user.dealerId,
        listingIds: listingIds.join(","),
        duration,
      },
    });

    return json({ url: session.url, sessionId: session.id });
  } catch (e: any) {
    if (e.message === "Unauthorized") return error("Unauthorized", 401);
    if (e.message === "Forbidden") return error("Forbidden", 403);
    console.error("Dealer TOP checkout error:", e);
    return error(e.message, 500);
  }
}
