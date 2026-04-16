import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { requireAdmin } from "@lib/auth";
import { storage } from "@lib/storage";

export async function GET(_req: NextRequest) {
  try {
    const _admin = await requireAdmin();

    const reports = await storage.getAllCebiaReports();
    const items = reports.map((r) => {
      const rr: any =
        r.rawResponse && typeof r.rawResponse === "object" && !Array.isArray(r.rawResponse)
          ? r.rawResponse
          : {};
      return {
        id: r.id,
        createdAt: new Date(r.createdAt as any).toISOString(),
        updatedAt: new Date(r.updatedAt as any).toISOString(),
        userId: r.userId ?? null,
        listingId: r.listingId ?? null,
        vin: r.vin,
        status: r.status,
        priceCents: r.priceCents ?? null,
        currency: r.currency ?? null,
        stripeSessionId: r.stripeSessionId ?? null,
        stripePaymentIntentId: r.stripePaymentIntentId ?? null,
        customerEmail: typeof rr.customerEmail === "string" ? rr.customerEmail : "",
        hasPdf: !!r.pdfBase64,
        adminPdfUrl: `/api/admin/cebia/reports/${encodeURIComponent(r.id)}/pdf`,
      };
    });

    const paidOnly = items
      .filter((item) => !!item.stripeSessionId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return json({ count: paidOnly.length, items: paidOnly });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return error("Unauthorized", 401);
    if (msg === "Forbidden") return error("Forbidden", 403);
    return error(msg, 500);
  }
}
