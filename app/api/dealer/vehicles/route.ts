import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { db } from "@lib/db";
import { listings, insertListingSchema } from "@shared/schema";
import { and, eq, sql } from "drizzle-orm";
import { storage } from "@lib/storage";
import { getApiDealer } from "@lib/apiAuth";
import { dispatchVehicleWebhook } from "@lib/webhooks";

export const dynamic = "force-dynamic";

// GET — list the dealer's vehicles (API key auth).
export async function GET(req: NextRequest) {
  const ctx = await getApiDealer(req);
  if (!ctx) return error("Invalid or missing API key", 401);

  const rows = await db
    .select()
    .from(listings)
    .where(eq(listings.userId, ctx.userId));
  return json({ vehicles: rows, total: rows.length });
}

// POST — create a vehicle (API key auth). When `externalId` is provided and a
// vehicle with that id already exists for the dealer, it is updated instead
// (idempotent upsert), so external systems can safely re-send the same car.
export async function POST(req: NextRequest) {
  const ctx = await getApiDealer(req);
  if (!ctx) return error("Invalid or missing API key", 401);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return error("Invalid JSON body", 400);
  }

  const externalId =
    typeof body.externalId === "string" && body.externalId.trim()
      ? body.externalId.trim()
      : undefined;

  // Upsert path: update the existing vehicle with this external id.
  if (externalId) {
    const [existing] = await db
      .select()
      .from(listings)
      .where(and(eq(listings.userId, ctx.userId), eq(listings.externalId, externalId)));
    if (existing) {
      const parsed = insertListingSchema.partial().safeParse({
        ...body,
        userId: ctx.userId,
        sellerType: "dealer",
      });
      if (!parsed.success) {
        return error(
          parsed.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("; "),
          400,
        );
      }
      const { userId: _omit, ...updateData } = parsed.data as Record<string, unknown>;
      const updated = await storage.updateListing(existing.id, {
        ...updateData,
        source: "api",
        externalId,
      } as any);
      await dispatchVehicleWebhook({
        dealerId: ctx.dealerId,
        event: updated?.isSold && !existing.isSold ? "vehicle.sold" : "vehicle.updated",
        listing: updated,
        previous: existing,
        meta: { source: "api", action: "upsert" },
      });
      return json({ vehicle: updated, action: "updated" });
    }
  }

  const parsed = insertListingSchema.safeParse({
    ...body,
    userId: ctx.userId,
    sellerType: "dealer",
    source: "api",
    externalId,
  });
  if (!parsed.success) {
    return error(
      parsed.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("; "),
      400,
    );
  }

  // Enforce the dealer's listing limit.
  const countRes = (await db.execute(sql`
    SELECT COUNT(*)::int AS total FROM listings WHERE user_id = ${ctx.userId}
  `)) as any;
  const currentCount = countRes?.rows?.[0]?.total || 0;
  if (currentCount >= ctx.maxListings) {
    return error(`Listing limit reached (${ctx.maxListings})`, 403);
  }

  const created = await storage.createListing(parsed.data);
  await dispatchVehicleWebhook({
    dealerId: ctx.dealerId,
    event: "vehicle.created",
    listing: created,
    meta: { source: "api" },
  });
  return json({ vehicle: created, action: "created" }, 201);
}
