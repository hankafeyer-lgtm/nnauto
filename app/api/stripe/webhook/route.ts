import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import Stripe from "stripe";

export const runtime = "nodejs";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Stripe not configured");
  return new Stripe(key);
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction && !webhookSecret) {
    console.error("[STRIPE] STRIPE_WEBHOOK_SECRET is missing in production");
    return error("Webhook not configured", 503);
  }

  let stripe: Stripe;
  try {
    stripe = getStripe();
  } catch {
    return error("Payment system not configured", 503);
  }

  let event: Stripe.Event;

  try {
    if (webhookSecret) {
      const sig = req.headers.get("stripe-signature");
      if (!sig) {
        return error("Missing stripe-signature header", 400);
      }
      const rawBody = await req.text();
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } else {
      event = (await req.json()) as Stripe.Event;
    }
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return error(`Webhook Error: ${err.message}`, 400);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    console.log(
      `[STRIPE WEBHOOK] checkout.session.completed – session ${session.id}, ` +
        `listingId=${session.metadata?.listingId ?? "n/a"}, ` +
        `type=${session.metadata?.type ?? "n/a"}`,
    );
    // TODO: migrate full webhook handling (promote listing, cebia payment, etc.)
  }

  return json({ received: true });
}
