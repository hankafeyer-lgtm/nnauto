import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { requireAuth } from "@lib/auth";
import { storage } from "@lib/storage";

export async function GET(_req: NextRequest) {
  try {
    const user = await requireAuth();
    const reports = await storage.getCebiaReportsByUserId(user.id);
    const slim = reports.map(({ pdfBase64, rawResponse, ...rest }) => rest);
    return json(slim);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return error("Unauthorized", 401);
    if (msg === "Forbidden") return error("Forbidden", 403);
    return error(msg, 500);
  }
}
