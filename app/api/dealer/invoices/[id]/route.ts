import { NextRequest } from "next/server";
import { error } from "@lib/api-helpers";
import { requireDealer } from "@lib/auth";
import {
  getDealerInvoiceForUser,
  renderDealerInvoiceHtml,
} from "@lib/dealerInvoice";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireDealer();
    if (!user.dealerId) return error("Dealer not found", 404);

    const { id } = await params;
    const invoice = await getDealerInvoiceForUser(id, user.dealerId, user.id);
    if (!invoice) return error("Invoice not found", 404);

    const html = renderDealerInvoiceHtml(invoice);
    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `attachment; filename="${invoice.number}.html"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return error("Unauthorized", 401);
    if (msg === "Forbidden") return error("Forbidden", 403);
    return error(msg, 500);
  }
}
