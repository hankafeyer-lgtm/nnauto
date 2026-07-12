import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import {
  activateDealerPackageFromCheckoutSession,
  getDealerStripe,
  isDealerPackageId,
  syncDealerSubscriptionFromStripe,
} from "@lib/dealerPackages";
import { processDealerTopListingCheckoutSession } from "@lib/dealerTopListing";
import { ensureDealerInvoiceForPackageCheckout } from "@lib/dealerInvoice";
import Stripe from "stripe";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.DEALER_STRIPE_WEBHOOK_SECRET;
  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction && !webhookSecret) {
    console.error("[DEALER_STRIPE] DEALER_STRIPE_WEBHOOK_SECRET is missing in production");
    return error("Dealer Stripe webhook not configured", 503);
  }

  let stripe: Stripe;
  try {
    stripe = getDealerStripe();
  } catch {
    return error("Dealer payment system not configured", 503);
  }

  let event: Stripe.Event;
  try {
    if (webhookSecret) {
      const sig = req.headers.get("stripe-signature");
      if (!sig) return error("Missing stripe-signature header", 400);
      const rawBody = await req.text();
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } else {
      event = (await req.json()) as Stripe.Event;
    }
  } catch (err: any) {
    console.error("[DEALER_STRIPE] Webhook signature verification failed:", err.message);
    return error(`Webhook Error: ${err.message}`, 400);
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.metadata?.type === "dealer_vehicle_package" && session.id) {
        await activateDealerPackageFromCheckoutSession(session.id);
      }
      if (session.metadata?.type === "dealer_top_listing" && session.id) {
        await processDealerTopListingCheckoutSession(session, stripe);
      }
    }

    if (
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      await syncDealerSubscriptionFromStripe(event.data.object as Stripe.Subscription);
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
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
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
    }

    if (event.type === "invoice.payment_failed") {
      const invoice = event.data.object as Stripe.Invoice & { subscription?: string | Stripe.Subscription | null };
      const subscriptionId =
        typeof invoice.subscription === "string"
          ? invoice.subscription
          : invoice.subscription?.id;
      if (subscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        await syncDealerSubscriptionFromStripe(subscription);
      }
    }
  } catch (err) {
    console.error("[DEALER_STRIPE] Webhook handling failed:", err);
    return error("Webhook handling failed", 500);
  }

  return json({ received: true });
}
