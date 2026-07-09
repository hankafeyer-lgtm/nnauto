import { NextRequest } from "next/server";
import { error } from "@lib/api-helpers";
import { requireDealer } from "@lib/auth";
import {
  getDealerInvoiceByNumberForUser,
  getDealerInvoiceHtmlContent,
  getDealerInvoicePdfBuffer,
} from "@lib/dealerInvoice";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ number: string }> },
) {
  try {
    const user = await requireDealer();
    if (!user.dealerId) return error("Dealer not found", 404);

    const { number } = await params;
    const decodedNumber = decodeURIComponent(number);
    const invoice = await getDealerInvoiceByNumberForUser(
      decodedNumber,
      user.dealerId,
      user.id,
    );
    if (!invoice) return error("Invoice not found", 404);

    const format = req.nextUrl.searchParams.get("format");
    const download = req.nextUrl.searchParams.get("download") === "1";
    const embed = req.nextUrl.searchParams.get("embed") === "1";

    if (format === "pdf") {
      const pdf = await getDealerInvoicePdfBuffer(invoice);
      return new Response(pdf, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${invoice.number}.pdf"`,
          "Cache-Control": "private, no-store",
        },
      });
    }

    const html = await getDealerInvoiceHtmlContent(invoice, {
      showToolbar: !download && !embed,
    });

    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": download
          ? `attachment; filename="${invoice.number}.html"`
          : "inline",
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
