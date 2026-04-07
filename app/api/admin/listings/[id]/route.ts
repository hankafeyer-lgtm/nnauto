import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { requireAdmin } from "@lib/auth";
import { storage } from "@lib/storage";
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
    const _admin = await requireAdmin();
    const { id } = await params;

    const deleted = await storage.deleteListing(id);
    if (!deleted) return error("Listing not found", 404);

    return json({ success: true });
  } catch (e: any) {
    if (e.message === "Unauthorized") return error("Unauthorized", 401);
    if (e.message === "Forbidden") return error("Forbidden", 403);
    return error(e.message, 500);
  }
}
