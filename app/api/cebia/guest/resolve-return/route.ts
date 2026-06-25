import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { storage } from "@lib/storage";
import { mergeRawResponse, getCebiaGuestToken } from "@lib/cebiaHelpers";
import Stripe from "stripe";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Stripe not configured");
  return new Stripe(key);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const sessionId =
      typeof body?.sessionId === "string" ? body.sessionId.trim() : "";
    const reportId =
      typeof body?.reportId === "string" ? body.reportId.trim() : "";
    if (!sessionId && !reportId) {
      return error("sessionId or reportId required", 400);
    }

    let report = reportId
      ? await storage.getCebiaReportById(reportId)
      : undefined;
    let session: Stripe.Checkout.Session | null = null;

    if (sessionId) {
      try {
        const stripe = getStripe();
        session = await stripe.checkout.sessions.retrieve(sessionId);
      } catch (e) {
        console.error("Stripe resolve-return error:", e);
        if (!report) return error("Payment system not configured", 503);
      }
    }

    if (!report && sessionId) {
      report = await storage.getCebiaReportByStripeSessionId(sessionId);
    }

    const sessionReportId =
      (session?.client_reference_id as string | null) ||
      (session?.metadata?.reportId as string | undefined) ||
      "";
    if (!report && sessionReportId) {
      report = await storage.getCebiaReportById(sessionReportId);
    }

    if (!report) return error("Cebia order not found", 404);
    if (!String(report.userId || "").startsWith("guest:")) {
      return error("Forbidden", 403);
    }
    if (sessionReportId && report.id !== sessionReportId) {
      return error("Session/report mismatch", 403);
    }
    if (session && session.payment_status !== "paid") {
      return error("Payment not completed", 400);
    }

    if (
      session &&
      session.payment_status === "paid" &&
      report.status !== "paid" &&
      report.status !== "requested" &&
      report.status !== "ready"
    ) {
      const customerEmail =
        (session.customer_details?.email as string | undefined) || "";
      const updated = await storage.updateCebiaReport(report.id, {
        status: "paid",
        stripeSessionId: session.id,
        stripePaymentIntentId:
          (session.payment_intent as string) || report.stripePaymentIntentId,
        email: customerEmail || report.email,
        rawResponse: mergeRawResponse(report.rawResponse, {
          stripeSession: session as any,
          customerEmail,
        }),
      });
      if (updated) report = updated;
    }

    const token = getCebiaGuestToken(report);
    if (!token) return error("Guest token not found", 404);

    return json({
      reportId: report.id,
      token,
      listingId: report.listingId || null,
      status: report.status,
    });
  } catch (e: any) {
    console.error("Cebia guest resolve-return error:", e);
    return error(e.message, 500);
  }
}
