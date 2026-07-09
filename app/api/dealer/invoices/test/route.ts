import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { requireDealer } from "@lib/auth";
import {
  createAdminTestDealerInvoice,
  isDealerPackageIdSafe,
  serializeDealerInvoiceListItem,
} from "@lib/dealerInvoice";

export async function POST(req: NextRequest) {
  try {
    const user = await requireDealer();
    if (!user.dealerId) return error("Dealer not found", 404);
    if (!user.isAdmin) return error("Forbidden", 403);

    const body = await req.json().catch(() => ({}));
    const packageId =
      typeof body.packageId === "string" && isDealerPackageIdSafe(body.packageId)
        ? body.packageId
        : "business";

    const invoice = await createAdminTestDealerInvoice(
      user.dealerId,
      user.id,
      packageId,
    );

    return json({
      ok: true,
      invoice: serializeDealerInvoiceListItem(invoice),
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return error("Unauthorized", 401);
    if (msg === "Forbidden") return error("Forbidden", 403);
    return error(msg, 500);
  }
}
