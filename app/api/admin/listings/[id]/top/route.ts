import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { requireAdmin } from "@lib/auth";
import { storage } from "@lib/storage";
import { computeTopListingExpiresAt } from "@shared/topListing";
import { invalidateListingsCache } from "../../../../listings/route";

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

    // Enabling TOP always starts a fresh 30-day window — including re-TOP
    // after a previous period expired (DB may still have is_top_listing=true).
    const updated = await storage.updateListing(
      id,
      isTopListing
        ? {
            isTopListing: true,
            topListingExpiresAt: computeTopListingExpiresAt(),
          }
        : {
            isTopListing: false,
            topListingExpiresAt: null,
          },
    );
    if (!updated) return error("Listing not found", 404);

    invalidateListingsCache();
    return json(updated);
  } catch (e: any) {
    if (e.message === "Unauthorized") return error("Unauthorized", 401);
    if (e.message === "Forbidden") return error("Forbidden", 403);
    return error(e.message, 500);
  }
}
