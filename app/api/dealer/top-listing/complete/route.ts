import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { requireDealer } from "@lib/auth";
import { ensureDealerInvoiceForTopListingCheckout } from "@lib/dealerInvoice";
import { storage } from "@lib/storage";
import Stripe from "stripe";

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

function isTopDuration(value: unknown): value is TopDuration {
  return value === "7" || value === "14" || value === "30";
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireDealer();
    if (!user.dealerId) return error("Dealer not found", 404);

    const { sessionId } = await req.json().catch(() => ({}));
    if (!sessionId || typeof sessionId !== "string") {
      return error("Invalid session ID", 400);
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.status !== "complete" || session.payment_status !== "paid") {
      return error("Payment not completed", 400);
    }
    if (session.metadata?.type !== "dealer_top_listing") {
      return error("Invalid session type", 400);
    }
    if (session.metadata.userId !== user.id || session.metadata.dealerId !== user.dealerId) {
      return error("Session mismatch", 403);
    }

    const duration = isTopDuration(session.metadata.duration)
      ? session.metadata.duration
      : "30";
    const listingIds = (session.metadata.listingIds || "")
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);
    if (!listingIds.length) return error("No listing IDs in session", 400);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + Number(duration));

    const updated = [];
    for (const id of listingIds) {
      const listing = await storage.getListing(id);
      if (!listing) continue;
      if (listing.userId !== user.id) continue;

      const updatedListing = await storage.updateListing(id, {
        isTopListing: true,
        topListingExpiresAt: expiresAt,
      } as any);
      if (updatedListing) updated.push(updatedListing);

      await storage.createPayment({
        userId: user.id,
        listingId: id,
        amount: String(Math.round((session.amount_total || 0) / listingIds.length)),
        currency: session.currency || "czk",
        status: "completed",
        stripeSessionId: sessionId,
        stripePaymentIntentId: (session.payment_intent as string) || null,
      });
    }

    const amountKc =
      typeof session.amount_total === "number"
        ? Math.round(session.amount_total / 100)
        : TOP_PRICES_KC[duration] * listingIds.length;
    const invoice = await ensureDealerInvoiceForTopListingCheckout({
      dealerId: user.dealerId,
      userId: user.id,
      stripeCheckoutSessionId: sessionId,
      amountKc,
      durationDays: Number(duration),
      listingCount: listingIds.length,
    });

    return json({
      ok: true,
      duration,
      expiresAt,
      updatedCount: updated.length,
      listings: updated,
      invoice: {
        id: invoice.id,
        number: invoice.number,
      },
    });
  } catch (e: any) {
    if (e.message === "Unauthorized") return error("Unauthorized", 401);
    if (e.message === "Forbidden") return error("Forbidden", 403);
    console.error("Dealer TOP completion error:", e);
    return error(e.message, 500);
  }
}
