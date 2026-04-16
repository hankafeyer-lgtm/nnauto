import { NextRequest, NextResponse } from "next/server";
import { error } from "@lib/api-helpers";
import { requireAdmin } from "@lib/auth";
import { storage } from "@lib/storage";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const _admin = await requireAdmin();
    const { id } = await params;

    const report = await storage.getCebiaReportById(id);
    if (!report?.pdfBase64) {
      return error("Not found", 404);
    }

    const pdfBuffer = Buffer.from(report.pdfBase64, "base64");
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="cebia-${report.vin}.pdf"`,
      },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return error("Unauthorized", 401);
    if (msg === "Forbidden") return error("Forbidden", 403);
    return error(msg, 500);
  }
}
