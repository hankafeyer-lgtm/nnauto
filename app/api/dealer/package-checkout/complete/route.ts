import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { requireDealer } from "@lib/auth";
import Stripe from "stripe";

const PACKAGES = {
  start: { name: "START", cars: 150, priceKc: 3000 },
  business: { name: "BUSINESS", cars: 350, priceKc: 4500 },
  pro: { name: "PRO", cars: 750, priceKc: 6000 },
} as const;

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Stripe not configured");
  return new Stripe(key);
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireDealer();
    if (!user.dealerId) return error("Dealer not found", 404);

    const { sessionId } = await req.json().catch(() => ({}));
    if (!sessionId || typeof sessionId !== "string") {
      return error("Invalid session ID", 400);
    }

    let stripe: Stripe;
    try {
      stripe = getStripe();
    } catch {
      return error("Payment system not configured", 503);
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") {
      return error("Payment not completed", 400);
    }
    if (
      session.metadata?.type !== "dealer_vehicle_package" ||
      session.metadata?.userId !== user.id ||
      session.metadata?.dealerId !== user.dealerId
    ) {
      return error("Session mismatch", 403);
    }

    const packageId = session.metadata.packageId;
    if (!packageId || !(packageId in PACKAGES)) {
      return error("Invalid package", 400);
    }

    return json({
      ok: true,
      packageId,
      package: PACKAGES[packageId as keyof typeof PACKAGES],
      sessionId: session.id,
      paymentIntentId: session.payment_intent,
    });
  } catch (e: any) {
    if (e.message === "Unauthorized") return error("Unauthorized", 401);
    if (e.message === "Forbidden") return error("Forbidden", 403);
    console.error("Dealer package completion error:", e);
    return error(e.message, 500);
  }
}
