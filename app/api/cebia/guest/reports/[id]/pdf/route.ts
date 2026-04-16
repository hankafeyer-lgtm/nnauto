import { NextRequest, NextResponse } from "next/server";
import { error } from "@lib/api-helpers";
import { storage } from "@lib/storage";
import { assertValidGuestAccess } from "@lib/cebiaHelpers";

const CEBIA_ENABLED = process.env.CEBIA_ENABLED === "true";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    if (!CEBIA_ENABLED) return error("Cebia is temporarily disabled", 503);

    const { id } = await params;
    const token = req.nextUrl.searchParams.get("token") || "";

    const report = await storage.getCebiaReportById(id);
    if (!report) return error("Not found", 404);
    if (!assertValidGuestAccess(report, token)) return error("Forbidden", 403);
    if (!report.pdfBase64) return error("PDF not ready yet", 409);

    const pdfBuffer = Buffer.from(report.pdfBase64, "base64");
    const downloadParam = req.nextUrl.searchParams.get("download");
    const forceDownload = downloadParam === "1" || downloadParam === "true";

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${forceDownload ? "attachment" : "inline"}; filename="cebia-${report.vin}.pdf"`,
      },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    return error(msg, 500);
  }
}
