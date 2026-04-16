import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { requireAdmin } from "@lib/auth";
import { storage } from "@lib/storage";
import { db } from "@lib/db";
import { sql } from "drizzle-orm";
import { updateListingSchema } from "@shared/schema";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const _admin = await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    const updateData = updateListingSchema.parse(body);

    const updated = await storage.updateListing(id, updateData);
    if (!updated) return error("Listing not found", 404);

    return json(updated);
  } catch (e: any) {
    if (e.message === "Unauthorized") return error("Unauthorized", 401);
    if (e.message === "Forbidden") return error("Forbidden", 403);
    return error(e.message, 400);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;

    const existing = await storage.getListing(id);
    if (!existing) return error("Listing not found", 404);

    await db.execute(sql`
      INSERT INTO deleted_listings (listing_id, user_id, deleted_by, brand, model, title, year, price, photo)
      VALUES (${id}, ${existing.userId}, ${admin.id}, ${existing.brand}, ${existing.model}, ${existing.title}, ${existing.year}, ${existing.price}, ${existing.photos?.[0] || null})
    `);

    const deleted = await storage.deleteListing(id);
    if (!deleted) return error("Listing not found", 404);

    return json({ success: true });
  } catch (e: any) {
    if (e.message === "Unauthorized") return error("Unauthorized", 401);
    if (e.message === "Forbidden") return error("Forbidden", 403);
    return error(e.message, 500);
  }
}
