import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { requireAuth } from "@lib/auth";
import { db } from "@lib/db";
import { enrichPaymentForAdmin } from "@lib/paymentReceipt";
import { listings, payments, type Listing } from "@shared/schema";
import { desc, eq } from "drizzle-orm";

export async function GET(_req: NextRequest) {
  try {
    const user = await requireAuth();

    const rows = await db
      .select({
        payment: payments,
        listing: listings,
      })
      .from(payments)
      .leftJoin(listings, eq(payments.listingId, listings.id))
      .where(eq(payments.userId, user.id))
      .orderBy(desc(payments.createdAt));

    const enriched = rows.map((row) =>
      enrichPaymentForAdmin(
        row.payment,
        user as any,
        (row.listing as Listing | null) ?? null,
        { pdfAudience: "user" },
      ),
    );

    return json(enriched);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return error("Unauthorized", 401);
    return error(msg, 500);
  }
}
