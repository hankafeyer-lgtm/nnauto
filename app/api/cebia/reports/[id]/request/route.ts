import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { requireAuth } from "@lib/auth";
import { storage } from "@lib/storage";
import { cebiaCreatePdfQueue } from "@lib/cebiaClient";
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
    if (report.status !== "paid" && report.status !== "requested" && report.status !== "ready") {
      return error("Report not paid", 400);
    }
    if (report.status === "ready" && report.pdfBase64) {
      return json({ status: "ready" });
    }

    const createResp = await cebiaCreatePdfQueue(report.vin);
    if (!createResp?.queueId || createResp.queueStatus === 6) {
      await storage.updateCebiaReport(report.id, {
        status: "failed",
        rawResponse: mergeRawResponse(report.rawResponse, { cebiaCreatePdfQueue: createResp }),
      });
      return error(createResp?.message || "Cebia request failed", 400);
    }

    const updated = await storage.updateCebiaReport(report.id, {
      status: "requested",
      cebiaQueueId: createResp.queueId,
      cebiaQueueStatus: createResp.queueStatus ?? null,
      rawResponse: mergeRawResponse(report.rawResponse, { cebiaCreatePdfQueue: createResp }),
    });

    return json({ report: updated || report });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return error("Unauthorized", 401);
    if (msg === "Forbidden") return error("Forbidden", 403);
    return error(msg, 500);
  }
}
