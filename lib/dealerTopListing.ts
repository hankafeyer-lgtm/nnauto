import Stripe from "stripe";
import { db } from "@lib/db";
import { assertDealerIsActive } from "@lib/dealerPackages";
import { ensureDealerInvoiceForTopListingCheckout } from "@lib/dealerInvoice";
import { storage } from "@lib/storage";
import { payments } from "@shared/schema";
import { and, eq } from "drizzle-orm";

const TOP_PRICES_KC = {
  "7": 39,
  "14": 69,
  "30": 99,
} as const;

type TopDuration = keyof typeof TOP_PRICES_KC;

function isTopDuration(value: unknown): value is TopDuration {
  return value === "7" || value === "14" || value === "30";
}

export function getDealerTopStripe() {
  const key = process.env.DEALER_STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Stripe not configured");
  return new Stripe(key);
}

function getSessionPaymentIntentId(session: Stripe.Checkout.Session): string | null {
  if (!session.payment_intent) return null;
  return typeof session.payment_intent === "string"
    ? session.payment_intent
    : session.payment_intent.id;
}

async function hasProcessedListingPayment(sessionId: string, listingId: string) {
  const [existing] = await db
    .select({ id: payments.id })
    .from(payments)
    .where(and(eq(payments.stripeSessionId, sessionId), eq(payments.listingId, listingId)))
    .limit(1);
  return !!existing;
}

export async function processDealerTopListingCheckoutSession(
  sessionOrId: Stripe.Checkout.Session | string,
  stripe = getDealerTopStripe(),
) {
  const session =
    typeof sessionOrId === "string"
      ? await stripe.checkout.sessions.retrieve(sessionOrId)
      : sessionOrId;

  if (session.status !== "complete" || session.payment_status !== "paid") {
    throw new Error("Payment not completed");
  }
  if (session.metadata?.type !== "dealer_top_listing") {
    throw new Error("Invalid session type");
  }

  const userId = session.metadata.userId;
  const dealerId = session.metadata.dealerId;
  if (!userId || !dealerId) throw new Error("Missing session metadata");
  await assertDealerIsActive(dealerId);

  const duration = isTopDuration(session.metadata.duration)
    ? session.metadata.duration
    : "30";
  const listingIds = (session.metadata.listingIds || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  if (!listingIds.length) throw new Error("No listing IDs in session");

  const amountKc =
    typeof session.amount_total === "number"
      ? Math.round(session.amount_total / 100)
      : TOP_PRICES_KC[duration] * listingIds.length;
  const amountPerListing = Math.round((session.amount_total || amountKc * 100) / listingIds.length);
  const paymentIntentId = getSessionPaymentIntentId(session);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + Number(duration));

  const updated = [];
  for (const id of listingIds) {
    const listing = await storage.getListing(id);
    if (!listing || listing.userId !== userId) continue;

    const alreadyProcessed = await hasProcessedListingPayment(session.id, id);
    if (alreadyProcessed) continue;

    const updatedListing = await storage.updateListing(id, {
      isTopListing: true,
      topListingExpiresAt: expiresAt,
    });
    if (updatedListing) updated.push(updatedListing);

    try {
      await storage.createPayment({
        userId,
        listingId: id,
        amount: String(amountPerListing),
        currency: session.currency || "czk",
        status: "completed",
        stripeSessionId: session.id,
        stripePaymentIntentId: paymentIntentId,
      });
    } catch (e) {
      const code = (e as { code?: string }).code;
      if (code !== "23505") throw e;
    }
  }

  const invoice = await ensureDealerInvoiceForTopListingCheckout({
    dealerId,
    userId,
    stripeCheckoutSessionId: session.id,
    amountKc,
    durationDays: Number(duration),
    listingCount: listingIds.length,
  });

  return {
    session,
    dealerId,
    userId,
    duration,
    expiresAt,
    updatedCount: updated.length,
    listings: updated,
    invoice,
  };
}
