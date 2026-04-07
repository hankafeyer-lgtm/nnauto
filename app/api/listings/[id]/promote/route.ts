import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { requireAdmin } from "@lib/auth";
import { storage } from "@lib/storage";

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const listing = await storage.getListing(id);
    if (!listing) return error("Listing not found", 404);

    const updatedListing = await storage.updateListing(id, {
      isTopListing: true,
    });
    if (!updatedListing) return error("Listing not found", 404);

    return json(updatedListing);
  } catch (e: any) {
    if (e.message === "Unauthorized") return error("Unauthorized", 401);
    if (e.message === "Forbidden") return error("Forbidden", 403);
    return error(e.message, 500);
  }
}
