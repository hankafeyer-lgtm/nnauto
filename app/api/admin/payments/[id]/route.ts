import { NextRequest } from "next/server";
import { error, json } from "@lib/api-helpers";
import { requireAdmin } from "@lib/auth";
import { storage } from "@lib/storage";
import {
  enrichPaymentForAdmin,
  paymentReceiptFilename,
  renderPaymentReceiptHtml,
  renderPaymentReceiptPdf,
} from "@lib/paymentReceipt";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const payment = await storage.getPayment(id);
    if (!payment) return error("Payment not found", 404);

    const buyer = await storage.getUser(payment.userId);
    const listing = await storage.getListing(payment.listingId);
    const enriched = enrichPaymentForAdmin(payment, buyer, listing);

    const format = req.nextUrl.searchParams.get("format");
    const download = req.nextUrl.searchParams.get("download") === "1";

    if (format === "pdf") {
      const pdf = await renderPaymentReceiptPdf(enriched);
      const filename = paymentReceiptFilename(enriched);
      return new Response(pdf, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${filename}"`,
          "Cache-Control": "private, no-store",
        },
      });
    }

    if (format === "html") {
      const html = renderPaymentReceiptHtml(enriched);
      return new Response(html, {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "private, no-store",
        },
      });
    }

    return json(enriched);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return error("Unauthorized", 401);
    if (msg === "Forbidden") return error("Forbidden", 403);
    return error(msg, 500);
  }
}
