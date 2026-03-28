import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { requireAdmin } from "@lib/auth";
import { storage } from "@lib/storage";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const _admin = await requireAdmin();
    const { id } = await params;
    const { isTopListing } = await req.json();

    if (typeof isTopListing !== "boolean") {
      return error("isTopListing must be a boolean", 400);
    }

    const updated = await storage.updateListing(id, { isTopListing });
    if (!updated) return error("Listing not found", 404);

    return json(updated);
  } catch (e: any) {
    if (e.message === "Unauthorized") return error("Unauthorized", 401);
    if (e.message === "Forbidden") return error("Forbidden", 403);
    return error(e.message, 500);
  }
}
