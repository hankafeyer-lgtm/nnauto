import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { requireAuth } from "@lib/auth";
import { storage } from "@lib/storage";
import Stripe from "stripe";

const CEBIA_REPORT_PRICE_CENTS = Number.parseInt(
  (process.env.CEBIA_REPORT_PRICE_CENTS || "").trim() || "29900",
  10,
);
const CEBIA_PAYMENTS_FROZEN = process.env.CEBIA_PAYMENTS_FROZEN === "true";
const CEBIA_STRIPE_PAYMENT_LINK_URL = (
  process.env.CEBIA_STRIPE_PAYMENT_LINK_URL || ""
).trim();

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
    const proto = req.headers.get("x-forwarded-proto") === "https" ? "https" : "http";
    return `${proto}://${host}`;
  }
  return "http://localhost:3000";
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    if (CEBIA_PAYMENTS_FROZEN) return error("Payments are temporarily disabled", 503);
    if (!CEBIA_REPORT_PRICE_CENTS || !Number.isFinite(CEBIA_REPORT_PRICE_CENTS)) {
      return error("Cebia pricing not configured", 503);
    }

    const body = await req.json();
    const vin = typeof body?.vin === "string" ? body.vin.trim().toUpperCase() : "";
    if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(vin)) return error("VIN is invalid", 400);

    const report = await storage.createCebiaReport({
      userId: user.id,
      listingId: null,
      vin,
      product: "pdf_autotracer",
      status: "created",
      priceCents: CEBIA_REPORT_PRICE_CENTS,
      currency: "CZK",
      stripeSessionId: null,
      stripePaymentIntentId: null,
      cebiaQueueId: null,
      cebiaQueueStatus: null,
      cebiaCouponNumber: null,
      cebiaReportUrl: null,
      pdfBase64: null,
      rawResponse: null,
    });

    if (CEBIA_STRIPE_PAYMENT_LINK_URL) {
      const u = new URL(CEBIA_STRIPE_PAYMENT_LINK_URL);
      u.searchParams.set("client_reference_id", report.id);
      u.searchParams.set("nnauto_report_id", report.id);
      return json({ url: u.toString(), reportId: report.id });
    }

    let stripe: Stripe;
    try {
      stripe = getStripe();
    } catch {
      return error("Payment system not configured", 503);
    }

    const baseUrl = getBaseUrl(req);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "czk",
            product_data: {
              name: "Cebia Autotracer (PDF) — prověření VIN",
              description: `VIN: ${vin}`,
            },
            unit_amount: CEBIA_REPORT_PRICE_CENTS,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/?cebia=success&session_id={CHECKOUT_SESSION_ID}&report_id=${encodeURIComponent(report.id)}`,
      cancel_url: `${baseUrl}/?cebia=cancelled`,
      metadata: {
        type: "cebia_pdf_autotracer",
        userId: user.id,
        vin,
        reportId: report.id,
      },
    });

    await storage.updateCebiaReport(report.id, {
      stripeSessionId: session.id,
      stripePaymentIntentId: (session.payment_intent as string) || null,
    });

    return json({ url: session.url, sessionId: session.id, reportId: report.id });
  } catch (e: any) {
    if (e.message === "Unauthorized") return error("Unauthorized", 401);
    console.error("Cebia home checkout error:", e);
    return error(e.message, 500);
  }
}
