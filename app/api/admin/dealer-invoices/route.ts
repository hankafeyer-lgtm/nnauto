import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { requireAdmin } from "@lib/auth";
import { db } from "@lib/db";
import { dealerInvoices } from "@shared/schema";
import { desc } from "drizzle-orm";
import { dealerInvoicePublicPath } from "@lib/dealerInvoice";

export async function GET(_req: NextRequest) {
  try {
    await requireAdmin();

    const invoices = await db
      .select()
      .from(dealerInvoices)
      .orderBy(desc(dealerInvoices.issuedAt));

    return json({
      invoices: invoices.map((invoice) => ({
        id: invoice.id,
        dealerId: invoice.dealerId,
        userId: invoice.userId,
        number: invoice.number,
        issuedAt: invoice.issuedAt,
        paidAt: invoice.paidAt ?? invoice.issuedAt,
        packageId: invoice.packageId,
        description: invoice.description,
        amountKc: invoice.amountKc,
        currency: invoice.currency,
        status: invoice.status,
        buyerCompanyName: invoice.buyerCompanyName,
        buyerIco: invoice.buyerIco,
        buyerDic: invoice.buyerDic,
        buyerAddress: invoice.buyerAddress,
        buyerEmail: invoice.buyerEmail,
        paymentMethod: invoice.paymentMethod,
        stripeCheckoutSessionId: invoice.stripeCheckoutSessionId,
        stripeInvoiceId: invoice.stripeInvoiceId,
        hasHtml: !!invoice.htmlContent,
        hasPdf: !!invoice.pdfBase64,
        createdAt: invoice.createdAt,
        url: dealerInvoicePublicPath(invoice.number),
        adminUrl: `/api/admin/dealer-invoices/${encodeURIComponent(invoice.number)}`,
        pdfUrl: `/api/admin/dealer-invoices/${encodeURIComponent(invoice.number)}?format=pdf&download=1`,
      })),
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return error("Unauthorized", 401);
    if (msg === "Forbidden") return error("Forbidden", 403);
    return error(msg, 500);
  }
}
