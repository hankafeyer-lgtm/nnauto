import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { db } from "@lib/db";
import { listings, updateListingSchema, type Listing } from "@shared/schema";
import { and, eq } from "drizzle-orm";
import { storage } from "@lib/storage";
import { getApiDealer, type ApiDealerCtx } from "@lib/apiAuth";
import { dispatchVehicleWebhook } from "@lib/webhooks";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * Resolve a vehicle by our UUID/slug or by the dealer's own id using the
 * `ext:<externalId>` form. Returns the listing only if it belongs to the dealer.
 */
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

// GET — fetch a single vehicle (API key auth).
export async function GET(req: NextRequest, context: RouteContext) {
  const ctx = await getApiDealer(req);
  if (!ctx) return error("Invalid or missing API key", 401);
  const { id } = await context.params;
  const listing = await resolveOwnedListing(ctx, id);
  if (!listing) return error("Vehicle not found", 404);
  return json({ vehicle: listing });
}

// PUT — update a vehicle (API key auth).
export async function PUT(req: NextRequest, context: RouteContext) {
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

  const parsed = updateListingSchema.safeParse(body);
  if (!parsed.success) {
    return error(
      parsed.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("; "),
      400,
    );
  }

  const updated = await storage.updateListing(listing.id, {
    ...(parsed.data as Record<string, unknown>),
    source: "api",
  } as any);
  await dispatchVehicleWebhook({
    dealerId: ctx.dealerId,
    event: updated?.isSold && !listing.isSold ? "vehicle.sold" : "vehicle.updated",
    listing: updated,
    previous: listing,
    meta: { source: "api", action: "update" },
  });
  return json({ vehicle: updated, action: "updated" });
}

// DELETE — remove a vehicle (API key auth).
export async function DELETE(req: NextRequest, context: RouteContext) {
  const ctx = await getApiDealer(req);
  if (!ctx) return error("Invalid or missing API key", 401);
  const { id } = await context.params;
  const listing = await resolveOwnedListing(ctx, id);
  if (!listing) return error("Vehicle not found", 404);

  const ok = await storage.deleteListing(listing.id);
  if (!ok) return error("Vehicle not found", 404);
  await dispatchVehicleWebhook({
    dealerId: ctx.dealerId,
    event: "vehicle.deleted",
    previous: listing,
    meta: { source: "api" },
  });
  return json({ message: "Vehicle deleted", id: listing.id });
}
