import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { storage } from "@lib/storage";
import { assertValidGuestAccess } from "@lib/cebiaHelpers";
import { generateAndDeliverCebiaPdf } from "@lib/cebiaGenerate";

const CEBIA_ENABLED = process.env.CEBIA_ENABLED === "true";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    if (!CEBIA_ENABLED) return error("Cebia is temporarily disabled", 503);

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const token = typeof body?.token === "string" ? body.token : "";

    const report = await storage.getCebiaReportById(id);
    if (!report) return error("Not found", 404);
    if (!assertValidGuestAccess(report, token)) return error("Forbidden", 403);
    if (report.status === "ready" && report.pdfBase64) {
      return json({ status: "ready" });
    }

    const result = await generateAndDeliverCebiaPdf(report.id, { pollAttempts: 1 });
    if (result.status === "failed") {
      return error(result.reason || "Cebia failed", 400);
    }

    const updated = await storage.getCebiaReportById(report.id);
    return json({
      status: result.status === "ready" ? "ready" : "requested",
      queueStatus: result.queueStatus ?? updated?.cebiaQueueStatus ?? null,
      report: result.status === "ready" ? updated : undefined,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    return error(msg, 500);
  }
}
