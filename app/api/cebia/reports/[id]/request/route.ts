import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { requireAuth } from "@lib/auth";
import { storage } from "@lib/storage";
import { generateAndDeliverCebiaPdf } from "@lib/cebiaGenerate";

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
    if (report.status !== "paid" && report.status !== "requesting" && report.status !== "requested" && report.status !== "ready") {
      return error("Report not paid", 400);
    }

    const result = await generateAndDeliverCebiaPdf(report.id, {
      pollAttempts: 1,
      email: user.email,
    });
    if (result.status === "failed") {
      return error(result.reason || "Cebia request failed", 400);
    }

    const updated = await storage.getCebiaReportById(report.id);
    return json({ status: result.status, report: updated || report });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return error("Unauthorized", 401);
    if (msg === "Forbidden") return error("Forbidden", 403);
    return error(msg, 500);
  }
}
