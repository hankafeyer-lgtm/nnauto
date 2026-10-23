import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { requireAdmin } from "@lib/auth";
import { db } from "@lib/db";
import { enrichPaymentForAdmin } from "@lib/paymentReceipt";
import { listings, payments, users, type Listing, type User } from "@shared/schema";
import { desc, eq } from "drizzle-orm";

export async function GET(_req: NextRequest) {
  try {
    await requireAdmin();

    const rows = await db
      .select({
        payment: payments,
        buyer: users,
        listing: listings,
      })
      .from(payments)
      .leftJoin(users, eq(payments.userId, users.id))
      .leftJoin(listings, eq(payments.listingId, listings.id))
      .orderBy(desc(payments.createdAt));

    const enriched = rows.map((row) =>
      enrichPaymentForAdmin(
        row.payment,
        (row.buyer as User | null) ?? null,
        (row.listing as Listing | null) ?? null,
      ),
    );

    return json(enriched);
  } catch (e: any) {
    if (e.message === "Unauthorized") return error("Unauthorized", 401);
    if (e.message === "Forbidden") return error("Forbidden", 403);
    return error(e.message, 500);
  }
}
