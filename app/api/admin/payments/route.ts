import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { requireAdmin } from "@lib/auth";
import { storage } from "@lib/storage";

export async function GET(_req: NextRequest) {
  try {
    const _admin = await requireAdmin();
    const payments = await storage.getAllPayments();

    const enriched = await Promise.all(
      payments.map(async (payment) => {
        const buyer = await storage.getUser(payment.userId);
        const listing = await storage.getListing(payment.listingId);

        return {
          ...payment,
          buyerUsername: buyer?.username,
          buyerEmail: buyer?.email,
          buyerFirstName: buyer?.firstName,
          buyerLastName: buyer?.lastName,
          listingTitle: listing?.title,
          listingBrand: listing?.brand,
          listingModel: listing?.model,
          listingPrice: listing?.price,
        };
      }),
    );

    return json(enriched);
  } catch (e: any) {
    if (e.message === "Unauthorized") return error("Unauthorized", 401);
    if (e.message === "Forbidden") return error("Forbidden", 403);
    return error(e.message, 500);
  }
}
