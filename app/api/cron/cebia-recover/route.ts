import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { db } from "@lib/db";
import { storage } from "@lib/storage";
import { mergeRawResponse } from "@lib/cebiaHelpers";
import {
  CEBIA_ENABLED,
  generateAndDeliverCebiaPdf,
  deliverCebiaEmail,
} from "@lib/cebiaGenerate";
import { sql } from "drizzle-orm";
import Stripe from "stripe";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  return key ? new Stripe(key) : null;
}

/**
 * Safety-net sweep for Cebia reports whose PDF was never produced/delivered
 * because the buyer closed the tab before the on-screen flow finished and/or
 * the webhook was missed.
 *
 * Billing invariant: we NEVER call Cebia for a report that Stripe has not
 * confirmed as paid. For pre-payment rows we re-check the Stripe session and
 * only promote + generate when `payment_status === "paid"`.
 *
 * Protected by CRON_SECRET via `Authorization: Bearer <secret>` or `?key=`.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization") || "";
    const keyParam = req.nextUrl.searchParams.get("key") || "";
    const provided = auth.startsWith("Bearer ") ? auth.slice(7) : keyParam;
    if (provided !== secret) return error("Unauthorized", 401);
  }

  if (!CEBIA_ENABLED) return json({ skipped: "cebia_disabled" });

  // Candidates: paid checkouts without a finished PDF in the last 30 days.
  const result = (await db.execute(sql`
    SELECT id, status, stripe_session_id, email
    FROM cebia_reports
    WHERE pdf_base64 IS NULL
      AND stripe_session_id IS NOT NULL
      AND status IN ('created', 'paid', 'requesting', 'requested')
      AND created_at >= now() - interval '30 days'
    ORDER BY created_at DESC
    LIMIT 25
  `)) as any;
  const rows: Array<{
    id: string;
    status: string;
    stripe_session_id: string | null;
    email: string | null;
  }> = result?.rows || [];

  const stripe = getStripe();
  const summary: Array<{ id: string; result: string; reason?: string }> = [];

  for (const row of rows) {
    try {
      let report = await storage.getCebiaReportById(row.id);
      if (!report) {
        summary.push({ id: row.id, result: "skipped", reason: "not_found" });
        continue;
      }

      // Pre-payment rows must be verified against Stripe before any Cebia call.
      const isConfirmedPaid =
        report.status === "paid" ||
        report.status === "requesting" ||
        report.status === "requested";

      let email = report.email || "";

      if (!isConfirmedPaid) {
        if (!stripe || !report.stripeSessionId) {
          summary.push({ id: row.id, result: "skipped", reason: "no_stripe" });
          continue;
        }
        const session = await stripe.checkout.sessions.retrieve(
          report.stripeSessionId,
        );
        if (session.payment_status !== "paid") {
          summary.push({ id: row.id, result: "skipped", reason: "unpaid" });
          continue;
        }
        email = (session.customer_details?.email as string | undefined) || email;
        const updated = await storage.updateCebiaReport(report.id, {
          status: "paid",
          stripePaymentIntentId:
            (session.payment_intent as string) || report.stripePaymentIntentId,
          email: email || report.email,
          rawResponse: mergeRawResponse(report.rawResponse, {
            stripeSession: { id: session.id, customerEmail: email },
          }),
        });
        if (updated) report = updated;
      }

      const gen = await generateAndDeliverCebiaPdf(report.id, {
        pollAttempts: 20,
        pollIntervalMs: 4000,
        email,
      });
      if (gen.status === "ready") await deliverCebiaEmail(report.id, email);
      summary.push({ id: row.id, result: gen.status, reason: gen.reason });
    } catch (e) {
      summary.push({
        id: row.id,
        result: "error",
        reason: e instanceof Error ? e.message : "unknown",
      });
    }
  }

  return json({ scanned: rows.length, summary });
}
