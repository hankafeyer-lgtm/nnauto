import { randomBytes } from "crypto";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@lib/db";
import { cebiaReports } from "@shared/schema";
import { storage } from "@lib/storage";
import { cebiaCreatePdfQueue, cebiaGetPdfData } from "@lib/cebiaClient";
import { mergeRawResponse, getCebiaGuestToken } from "@lib/cebiaHelpers";
import { sendCebiaReportReadyEmail } from "@lib/email";

/**
 * Central, idempotent Cebia PDF generation + delivery.
 *
 * IMPORTANT billing invariant: the only billable Cebia call is
 * `CreatePdfQueue`. We therefore claim it with a single atomic conditional
 * UPDATE so that concurrent callers (Stripe webhook, the return page poll,
 * the cron recover sweep, the request/poll routes) can never trigger more
 * than one `CreatePdfQueue` per report. This function NEVER calls Cebia for
 * a report that has not been confirmed as paid upstream (status must already
 * be one of the PAID_STATES below — callers set `paid` only after Stripe
 * reports `payment_status === "paid"`).
 */

export const CEBIA_ENABLED = process.env.CEBIA_ENABLED === "true";

// States that mean "payment confirmed". A report only ever reaches these
// after a verified Stripe payment, so generation is safe from here on.
const PAID_STATES = new Set(["paid", "requesting", "requested", "ready"]);

// If a worker claimed the create slot but died before storing a queueId,
// release the claim after this long so another run can retry.
const STALE_REQUESTING_MS = 90_000;

export type GenerateResult = {
  status: "ready" | "pending" | "failed" | "skipped";
  reason?: string;
  queueStatus?: number | null;
};

function appBaseUrl(): string {
  return (process.env.APP_BASE_URL || "https://nnauto.cz").replace(/\/+$/, "");
}

/** Atomically claim the single billable CreatePdfQueue call. */
async function claimForRequest(reportId: string): Promise<boolean> {
  const rows = await db
    .update(cebiaReports)
    .set({ status: "requesting", updatedAt: new Date() })
    .where(
      and(
        eq(cebiaReports.id, reportId),
        isNull(cebiaReports.cebiaQueueId),
        eq(cebiaReports.status, "paid"),
      ),
    )
    .returning({ id: cebiaReports.id });
  return rows.length > 0;
}

/** Deliver the ready PDF by e-mail exactly once (guests and logged-in alike). */
export async function deliverCebiaEmail(
  reportId: string,
  fallbackEmail?: string | null,
): Promise<boolean> {
  const report = await storage.getCebiaReportById(reportId);
  if (!report || !report.pdfBase64) return false;
  if (report.emailSentAt) return false;

  const email = (report.email || fallbackEmail || "").trim();
  if (!email) return false;

  // Ensure a tokenized download link so the e-mail link works without a session.
  let token = report.downloadToken;
  if (!token) {
    token = randomBytes(24).toString("base64url");
    await storage.updateCebiaReport(reportId, { downloadToken: token });
  }

  const isGuest = String(report.userId || "").startsWith("guest:");
  const guestToken = getCebiaGuestToken(report);
  const base = appBaseUrl();
  const pdfUrl =
    isGuest && guestToken
      ? `${base}/api/cebia/guest/reports/${report.id}/pdf?token=${encodeURIComponent(guestToken)}&download=1`
      : `${base}/api/cebia/reports/${report.id}/pdf?token=${encodeURIComponent(token)}&download=1`;

  await sendCebiaReportReadyEmail({ email, vin: report.vin, pdfUrl });
  await storage.updateCebiaReport(reportId, {
    email,
    emailSentAt: new Date(),
  });
  return true;
}

/**
 * Drive a paid report towards a ready PDF and (optionally) deliver it by
 * e-mail. Safe to call repeatedly and concurrently.
 *
 * @param opts.pollAttempts number of GetPdfData polls in this call (default 1)
 * @param opts.pollIntervalMs delay between polls when pollAttempts > 1
 * @param opts.email fallback delivery e-mail if none stored on the report
 * @param opts.sendEmail whether to send the delivery e-mail on ready (default true)
 */
export async function generateAndDeliverCebiaPdf(
  reportId: string,
  opts: {
    pollAttempts?: number;
    pollIntervalMs?: number;
    email?: string | null;
    sendEmail?: boolean;
  } = {},
): Promise<GenerateResult> {
  const { pollAttempts = 1, pollIntervalMs = 0, email, sendEmail = true } = opts;

  let report = await storage.getCebiaReportById(reportId);
  if (!report) return { status: "skipped", reason: "not_found" };

  if (report.pdfBase64) {
    if (sendEmail) await deliverCebiaEmail(reportId, email);
    return { status: "ready" };
  }

  if (!CEBIA_ENABLED) return { status: "skipped", reason: "cebia_disabled" };
  if (!PAID_STATES.has(report.status)) {
    return { status: "skipped", reason: "not_paid" };
  }

  // Release a stale claim left behind by a crashed worker.
  if (
    report.status === "requesting" &&
    !report.cebiaQueueId &&
    report.updatedAt &&
    Date.now() - new Date(report.updatedAt).getTime() > STALE_REQUESTING_MS
  ) {
    await storage.updateCebiaReport(reportId, { status: "paid" });
    report = (await storage.getCebiaReportById(reportId)) || report;
  }

  // Ensure we have a queueId, performing the single billable create at most once.
  let queueId = report.cebiaQueueId;
  if (!queueId) {
    const owns = await claimForRequest(reportId);
    if (owns) {
      try {
        const createResp = await cebiaCreatePdfQueue(report.vin);
        if (!createResp?.queueId || createResp.queueStatus === 6) {
          await storage.updateCebiaReport(reportId, {
            status: "failed",
            rawResponse: mergeRawResponse(report.rawResponse, {
              cebiaCreatePdfQueue: createResp,
            }),
          });
          return { status: "failed", reason: createResp?.message || "create_failed" };
        }
        queueId = createResp.queueId;
        await storage.updateCebiaReport(reportId, {
          status: "requested",
          cebiaQueueId: queueId,
          cebiaQueueStatus: createResp.queueStatus ?? null,
          rawResponse: mergeRawResponse(report.rawResponse, {
            cebiaCreatePdfQueue: createResp,
          }),
        });
      } catch (e) {
        // Release the claim so a later run can retry without double-charging.
        await storage.updateCebiaReport(reportId, { status: "paid" });
        const msg = e instanceof Error ? e.message : "create_threw";
        return { status: "pending", reason: msg };
      }
    } else {
      // Another worker owns the create; just re-read whatever queueId exists.
      const fresh = await storage.getCebiaReportById(reportId);
      queueId = fresh?.cebiaQueueId || null;
      if (!queueId) return { status: "pending", reason: "claimed_by_other" };
      report = fresh || report;
    }
  }

  if (!queueId) return { status: "pending", reason: "no_queue_id" };

  // Poll for the finished PDF.
  for (let i = 0; i < Math.max(1, pollAttempts); i++) {
    let pdfResp: any;
    try {
      pdfResp = await cebiaGetPdfData(queueId);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "poll_threw";
      if (i < pollAttempts - 1 && pollIntervalMs) {
        await new Promise((r) => setTimeout(r, pollIntervalMs));
        continue;
      }
      return { status: "pending", reason: msg };
    }
    const qs = pdfResp?.queueStatus;

    if (qs === 3 && pdfResp.pdfData) {
      await storage.updateCebiaReport(reportId, {
        status: "ready",
        cebiaQueueStatus: qs,
        cebiaCouponNumber: pdfResp.couponNumber ?? null,
        cebiaReportUrl: pdfResp.reportUrl ?? null,
        pdfBase64: pdfResp.pdfData,
        rawResponse: mergeRawResponse(report.rawResponse, { cebiaPdfData: pdfResp }),
      });
      if (sendEmail) await deliverCebiaEmail(reportId, email);
      return { status: "ready", queueStatus: qs };
    }

    if (qs === 6 || qs === 4) {
      await storage.updateCebiaReport(reportId, {
        status: "failed",
        cebiaQueueStatus: qs ?? null,
        rawResponse: mergeRawResponse(report.rawResponse, { cebiaPdfData: pdfResp }),
      });
      return { status: "failed", reason: pdfResp?.message || `queueStatus_${qs}`, queueStatus: qs };
    }

    // Still processing.
    await storage.updateCebiaReport(reportId, {
      status: "requested",
      cebiaQueueStatus: qs ?? null,
      rawResponse: mergeRawResponse(report.rawResponse, { cebiaPdfData: pdfResp }),
    });
    if (i < pollAttempts - 1 && pollIntervalMs) {
      await new Promise((r) => setTimeout(r, pollIntervalMs));
    }
  }

  return { status: "pending" };
}
