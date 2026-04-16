import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { storage } from "@lib/storage";
import { assertValidGuestAccess } from "@lib/cebiaHelpers";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const token = req.nextUrl.searchParams.get("token") || "";

    const report = await storage.getCebiaReportById(id);
    if (!report) return error("Not found", 404);
    if (!assertValidGuestAccess(report, token)) return error("Forbidden", 403);

    const { pdfBase64, ...rest } = report as any;
    return json({ ...rest, hasPdf: !!pdfBase64 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    return error(msg, 500);
  }
}
