import { NextRequest, NextResponse } from "next/server";
import { error } from "@lib/api-helpers";
import { requireAdmin } from "@lib/auth";
import { storage } from "@lib/storage";

export async function GET(_req: NextRequest) {
  try {
    const _admin = await requireAdmin();

    const allReports = await storage.getAllCebiaReports();
    const reports = allReports
      .map((r) => {
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
        };
      })
      .filter((item) => !!item.stripeSessionId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const escapeCsv = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const header = [
      "id",
      "createdAt",
      "updatedAt",
      "userId",
      "listingId",
      "vin",
      "status",
      "priceCents",
      "currency",
      "stripeSessionId",
      "stripePaymentIntentId",
      "customerEmail",
      "hasPdf",
    ];
    const rows = reports.map((r) =>
      [
        r.id,
        r.createdAt,
        r.updatedAt,
        r.userId || "",
        r.listingId || "",
        r.vin,
        r.status,
        r.priceCents,
        r.currency,
        r.stripeSessionId || "",
        r.stripePaymentIntentId || "",
        r.customerEmail || "",
        r.hasPdf ? "yes" : "no",
      ]
        .map(escapeCsv)
        .join(","),
    );
    const csv = `${header.join(",")}\n${rows.join("\n")}`;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="cebia-reports.csv"',
      },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return error("Unauthorized", 401);
    if (msg === "Forbidden") return error("Forbidden", 403);
    return error(msg, 500);
  }
}
