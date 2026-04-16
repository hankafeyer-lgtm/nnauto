import { NextRequest, NextResponse } from "next/server";
import { error } from "@lib/api-helpers";
import { requireAuth } from "@lib/auth";
import { storage } from "@lib/storage";

const CEBIA_ENABLED = process.env.CEBIA_ENABLED === "true";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    if (!CEBIA_ENABLED) return error("Cebia is temporarily disabled", 503);

    const user = await requireAuth();
    const { id } = await params;

    const report = await storage.getCebiaReportById(id);
    if (!report) return error("Not found", 404);
    if (report.userId !== user.id) return error("Forbidden", 403);
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
    if (msg === "Unauthorized") return error("Unauthorized", 401);
    if (msg === "Forbidden") return error("Forbidden", 403);
    return error(msg, 500);
  }
}
