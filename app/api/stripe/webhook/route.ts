import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { storage } from "@lib/storage";
import { mergeRawResponse } from "@lib/cebiaHelpers";
import { generateAndDeliverCebiaPdf } from "@lib/cebiaGenerate";
import {
  activateDealerPackageFromCheckoutSession,
  isDealerPackageId,
  syncDealerSubscriptionFromStripe,
} from "@lib/dealerPackages";
import { ensureDealerInvoiceForPackageCheckout } from "@lib/dealerInvoice";
import { processDealerTopListingCheckoutSession } from "@lib/dealerTopListing";
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
    if (session.metadata?.type === "dealer_vehicle_package" && session.id) {
      try {
        await activateDealerPackageFromCheckoutSession(session.id);
      } catch (e) {
        console.error("[STRIPE WEBHOOK] Dealer package handling error:", e);
      }
    }
    if (session.metadata?.type === "dealer_top_listing" && session.id) {
      try {
        await processDealerTopListingCheckoutSession(session, stripe);
      } catch (e) {
        console.error("[STRIPE WEBHOOK] Dealer TOP handling error:", e);
      }
    }
  }

  if (event.type === "invoice.payment_succeeded") {
    const invoice = event.data.object as Stripe.Invoice & {
      subscription?: string | Stripe.Subscription | null;
    };
    const subscriptionId =
      typeof invoice.subscription === "string"
        ? invoice.subscription
        : invoice.subscription?.id;
    if (subscriptionId) {
      try {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        if (subscription.metadata?.type === "dealer_vehicle_package") {
          const row = await syncDealerSubscriptionFromStripe(subscription);
          if (!isDealerPackageId(row.packageId)) {
            throw new Error("Dealer package invoice has invalid packageId");
          }
          await ensureDealerInvoiceForPackageCheckout({
            dealerId: row.dealerId,
            userId: row.userId,
            packageId: row.packageId,
            subscriptionId: row.id,
            stripeInvoiceId: invoice.id,
            amountKc: invoice.amount_paid
              ? Math.round(invoice.amount_paid / 100)
              : row.amountKc,
            issuedAt: invoice.status_transitions?.paid_at
              ? new Date(invoice.status_transitions.paid_at * 1000)
              : new Date(),
          });
        }
      } catch (e) {
        console.error("[STRIPE WEBHOOK] Dealer invoice handling error:", e);
      }
    }
  }

  if (
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    try {
      const subscription = event.data.object as Stripe.Subscription;
      if (subscription.metadata?.type === "dealer_vehicle_package") {
        await syncDealerSubscriptionFromStripe(subscription);
      }
    } catch (e) {
      console.error("[STRIPE WEBHOOK] Dealer subscription handling error:", e);
    }
  }

  return json({ received: true });
}
