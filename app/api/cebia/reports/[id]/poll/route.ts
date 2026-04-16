import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { requireAuth } from "@lib/auth";
import { storage } from "@lib/storage";
import { cebiaGetPdfData } from "@lib/cebiaClient";
import { mergeRawResponse } from "@lib/cebiaHelpers";

const CEBIA_ENABLED = process.env.CEBIA_ENABLED === "true";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    if (!CEBIA_ENABLED) return error("Cebia is temporarily disabled", 503);

    const user = await requireAuth();
    const { id } = await params;

    const report = await storage.getCebiaReportById(id);
    if (!report) return error("Not found", 404);
    if (report.userId !== user.id) return error("Forbidden", 403);
    if (!report.cebiaQueueId) return error("No queueId yet", 400);
    if (report.status === "ready" && report.pdfBase64) {
      return json({ status: "ready" });
    }

    const pdfResp = await cebiaGetPdfData(report.cebiaQueueId);
    const queueStatus = pdfResp.queueStatus;

    if (queueStatus === 3 && pdfResp.pdfData) {
      const updated = await storage.updateCebiaReport(report.id, {
        status: "ready",
        cebiaQueueStatus: queueStatus,
        cebiaCouponNumber: pdfResp.couponNumber ?? null,
        cebiaReportUrl: pdfResp.reportUrl ?? null,
        pdfBase64: pdfResp.pdfData,
        rawResponse: mergeRawResponse(report.rawResponse, { cebiaPdfData: pdfResp }),
      });
      return json({ status: "ready", report: updated });
    }

    if (queueStatus === 6 || queueStatus === 4) {
      await storage.updateCebiaReport(report.id, {
        status: "failed",
        cebiaQueueStatus: queueStatus ?? null,
        rawResponse: mergeRawResponse(report.rawResponse, { cebiaPdfData: pdfResp }),
      });
      return error(pdfResp.message || "Cebia failed", 400);
    }

    await storage.updateCebiaReport(report.id, {
      status: "requested",
      cebiaQueueStatus: queueStatus ?? null,
      rawResponse: mergeRawResponse(report.rawResponse, { cebiaPdfData: pdfResp }),
    });
    return json({ status: "requested", queueStatus });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return error("Unauthorized", 401);
    if (msg === "Forbidden") return error("Forbidden", 403);
    return error(msg, 500);
  }
}
