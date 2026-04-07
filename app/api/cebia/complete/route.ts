import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { requireAuth } from "@lib/auth";
import { storage } from "@lib/storage";
import Stripe from "stripe";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Stripe not configured");
  return new Stripe(key);
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const stripeSessionId =
      typeof body?.stripeSessionId === "string" ? body.stripeSessionId : "";
    if (!stripeSessionId) return error("stripeSessionId required", 400);

    const report = await storage.getCebiaReportByStripeSessionId(stripeSessionId);
    if (!report) return error("Cebia order not found", 404);
    if (report.userId !== user.id) return error("Forbidden", 403);

    let stripe: Stripe;
    try {
      stripe = getStripe();
    } catch {
      return error("Payment system not configured", 503);
    }

    const session = await stripe.checkout.sessions.retrieve(stripeSessionId);
    if (session.payment_status !== "paid") return error("Payment not completed", 400);

    if (session.metadata?.userId && session.metadata.userId !== user.id) {
      return error("Session user mismatch", 403);
    }

    const updated = await storage.updateCebiaReport(report.id, {
      status: "paid",
      stripePaymentIntentId:
        (session.payment_intent as string) || report.stripePaymentIntentId,
    });

    return json({ report: updated || report });
  } catch (e: any) {
    if (e.message === "Unauthorized") return error("Unauthorized", 401);
    console.error("Cebia complete error:", e);
    return error(e.message, 500);
  }
}
