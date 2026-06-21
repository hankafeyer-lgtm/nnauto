import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { db } from "@lib/db";
import { listings, type Listing } from "@shared/schema";
import { and, eq } from "drizzle-orm";
import { storage } from "@lib/storage";
import { getApiDealer, type ApiDealerCtx } from "@lib/apiAuth";
import { dispatchVehicleWebhook } from "@lib/webhooks";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

async function resolveOwnedListing(
  ctx: ApiDealerCtx,
  idParam: string,
): Promise<Listing | undefined> {
  let listing: Listing | undefined;
  if (idParam.startsWith("ext:")) {
    const externalId = idParam.slice(4);
    [listing] = await db
      .select()
      .from(listings)
      .where(and(eq(listings.userId, ctx.userId), eq(listings.externalId, externalId)));
  } else {
    listing = await storage.getListing(idParam);
  }
  if (!listing || listing.userId !== ctx.userId) return undefined;
  return listing;
}

// PATCH — change a vehicle's availability (API key auth).
// Accepts { isSold: boolean } or { status: "sold" | "active" | "available" }.
export async function PATCH(req: NextRequest, context: RouteContext) {
  const ctx = await getApiDealer(req);
  if (!ctx) return error("Invalid or missing API key", 401);
  const { id } = await context.params;
  const listing = await resolveOwnedListing(ctx, id);
  if (!listing) return error("Vehicle not found", 404);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return error("Invalid JSON body", 400);
  }

  let isSold: boolean | undefined;
  if (typeof body.isSold === "boolean") {
    isSold = body.isSold;
  } else if (typeof body.status === "string") {
    const s = body.status.toLowerCase();
    if (s === "sold") isSold = true;
    else if (s === "active" || s === "available") isSold = false;
  }

  if (isSold === undefined) {
    return error("Provide isSold (boolean) or status ('sold' | 'active')", 400);
  }

  const updated = await storage.updateListing(listing.id, { isSold } as any);
  await dispatchVehicleWebhook({
    dealerId: ctx.dealerId,
    event: isSold ? "vehicle.sold" : "vehicle.updated",
    listing: updated,
    previous: listing,
    meta: { source: "api", action: "status" },
  });
  return json({ vehicle: updated, action: "status_updated", isSold });
}
