import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { requireDealer } from "@lib/auth";
import { db } from "@lib/db";
import { dealerProfileUpdateSchema, dealers } from "@shared/schema";
import { eq } from "drizzle-orm";

const dealerProfileSelect = {
  id: dealers.id,
  ownerId: dealers.ownerId,
  companyName: dealers.companyName,
  ico: dealers.ico,
  dic: dealers.dic,
  description: dealers.description,
  logoUrl: dealers.logoUrl,
  website: dealers.website,
  phone: dealers.phone,
  email: dealers.email,
  address: dealers.address,
  region: dealers.region,
  isVerified: dealers.isVerified,
  maxListings: dealers.maxListings,
  plan: dealers.plan,
  status: dealers.status,
  verificationStatus: dealers.verificationStatus,
  xmlFeedUrl: dealers.xmlFeedUrl,
  xmlFeedStatus: dealers.xmlFeedStatus,
  lastSyncAt: dealers.lastSyncAt,
  createdAt: dealers.createdAt,
  updatedAt: dealers.updatedAt,
};

export async function GET(_req: NextRequest) {
  try {
    const user = await requireDealer();
    if (!user.dealerId) return error("Dealer not found", 404);

    const [dealer] = await db
      .select(dealerProfileSelect)
      .from(dealers)
      .where(eq(dealers.id, user.dealerId));
    if (!dealer) return error("Dealer not found", 404);

    return json({ dealer });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return error("Unauthorized", 401);
    if (msg === "Forbidden") return error("Forbidden", 403);
    return error(msg, 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireDealer();
    if (!user.dealerId) return error("Dealer not found", 404);

    const body = await req.json();
    const parsed = dealerProfileUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return json(
        { error: "Validation failed", errors: parsed.error.flatten() },
        400,
      );
    }

    const [dealer] = await db
      .update(dealers)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(dealers.id, user.dealerId))
      .returning(dealerProfileSelect);

    return json({ dealer });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return error("Unauthorized", 401);
    if (msg === "Forbidden") return error("Forbidden", 403);
    return error(msg, 500);
  }
}
