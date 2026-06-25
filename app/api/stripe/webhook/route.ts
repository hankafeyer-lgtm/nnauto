import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { storage } from "@lib/storage";
import { mergeRawResponse } from "@lib/cebiaHelpers";
import { generateAndDeliverCebiaPdf } from "@lib/cebiaGenerate";
import Stripe from "stripe";

export const runtime = "nodejs";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Stripe not configured");
  return new Stripe(key);
}

/**
 * Promote a paid Cebia checkout to `paid`, store the buyer e-mail captured by
 * Stripe, and kick off PDF generation + delivery in the background.
 *
 * Billing-safe: we only ever reach `CreatePdfQueue` once `payment_status` is
 * `"paid"`, so abandoned / unpaid checkouts never hit the Cebia API.
 */
async function handleCebiaCheckoutCompleted(session: Stripe.Checkout.Session) {
  if (session.payment_status !== "paid") return;

  const reportId =
    (session.metadata?.reportId as string | undefined) ||
    (session.client_reference_id as string | null) ||
    "";

  let report = reportId ? await storage.getCebiaReportById(reportId) : undefined;
  if (!report) report = await storage.getCebiaReportByStripeSessionId(session.id);
  if (!report) {
    console.error(`[STRIPE WEBHOOK] Cebia report not found for session ${session.id}`);
    return;
  }

  const email = (session.customer_details?.email as string | undefined) || "";

  // Promote to paid only from a pre-payment state; never downgrade an
  // already requested/ready report.
  if (
    report.status !== "paid" &&
    report.status !== "requesting" &&
    report.status !== "requested" &&
    report.status !== "ready"
  ) {
    const updated = await storage.updateCebiaReport(report.id, {
      status: "paid",
      stripeSessionId: session.id,
      stripePaymentIntentId:
        (session.payment_intent as string) || report.stripePaymentIntentId,
      email: email || report.email,
      rawResponse: mergeRawResponse(report.rawResponse, {
        stripeSession: { id: session.id, customerEmail: email },
      }),
    });
    if (updated) report = updated;
  } else if (email && !report.email) {
    await storage.updateCebiaReport(report.id, { email });
  }

  // Generate + deliver in the background so the webhook responds fast.
  void generateAndDeliverCebiaPdf(report.id, {
    pollAttempts: 30,
    pollIntervalMs: 4000,
    email,
  }).catch((e) => {
    console.error(`[STRIPE WEBHOOK] Cebia generation failed for ${report?.id}:`, e);
  });
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

    if (session.metadata?.type === "cebia_pdf_autotracer") {
      try {
        await handleCebiaCheckoutCompleted(session);
      } catch (e) {
        console.error("[STRIPE WEBHOOK] Cebia handling error:", e);
      }
    }
    // TODO: migrate remaining webhook handling (promote listing, etc.)
  }

  return json({ received: true });
}
