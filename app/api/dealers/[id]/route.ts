import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { db } from "@lib/db";
import { dealerSettings, dealers } from "@shared/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const [dealer] = await db
      .select()
      .from(dealers)
      .where(eq(dealers.id, id));
    if (!dealer) return error("Dealer not found", 404);
    const [settingsRow] = await db
      .select({ settings: dealerSettings.settings })
      .from(dealerSettings)
      .where(eq(dealerSettings.dealerId, id));

    return json({
      dealer: {
        id: dealer.id,
        companyName: dealer.companyName,
        description: dealer.description,
        logoUrl: dealer.logoUrl,
        website: dealer.website,
        phone: dealer.phone,
        email: dealer.email,
        address: dealer.address,
        region: dealer.region,
        isVerified: dealer.isVerified,
      },
      settings: settingsRow?.settings ?? null,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    return error(msg, 500);
  }
}
