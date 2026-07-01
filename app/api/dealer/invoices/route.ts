import { json, error } from "@lib/api-helpers";
import { requireDealer } from "@lib/auth";
import { listDealerInvoices } from "@lib/dealerInvoice";

export async function GET() {
  try {
    const user = await requireDealer();
    if (!user.dealerId) return error("Dealer not found", 404);

    const invoices = await listDealerInvoices(user.dealerId, user.id);
    return json({
      invoices: invoices.map((invoice) => ({
        id: invoice.id,
        number: invoice.number,
        dateISO: invoice.issuedAt,
        amountKc: invoice.amountKc,
        status: invoice.status,
        description: invoice.description,
        packageId: invoice.packageId,
      })),
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return error("Unauthorized", 401);
    if (msg === "Forbidden") return error("Forbidden", 403);
    return error(msg, 500);
  }
}
