import { NextRequest } from "next/server";
import { json, error, withAuth } from "@/lib/api-helpers";
import { storage } from "@/lib/storage";

type RouteContext = { params: Promise<{ id: string }> };

// ---------------------------------------------------------------------------
// GET /api/listings/[id]
// ---------------------------------------------------------------------------

export async function GET(
  _req: NextRequest,
  context: RouteContext,
) {
  try {
    const { id } = await context.params;
    const listing = await storage.getListing(id);
    if (!listing) {
      return error("Listing not found", 404);
    }
    return json(listing);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return error(message, 500);
  }
}

// ---------------------------------------------------------------------------
// PUT /api/listings/[id]  (owner or admin)
// ---------------------------------------------------------------------------

export async function PUT(
  req: NextRequest,
  context: RouteContext,
) {
  return withAuth(async (_req, user) => {
    try {
      const { id } = await context.params;
      const existingListing = await storage.getListing(id);
      if (!existingListing) {
        return error("Listing not found", 404);
      }

      if (existingListing.userId !== user.id && !user.isAdmin) {
        return error("Cannot update another user's listing", 403);
      }

      const body = await _req.json();
      const updatedListing = await storage.updateListing(id, body);
      return json(updatedListing);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Bad request";
      return error(message, 400);
    }
  }, req);
}

// ---------------------------------------------------------------------------
// DELETE /api/listings/[id]  (owner or admin)
// ---------------------------------------------------------------------------

export async function DELETE(
  req: NextRequest,
  context: RouteContext,
) {
  return withAuth(async (_req, user) => {
    try {
      const { id } = await context.params;
      const existingListing = await storage.getListing(id);
      if (!existingListing) {
        return error("Listing not found", 404);
      }

      if (existingListing.userId !== user.id && !user.isAdmin) {
        return error("Cannot delete another user's listing", 403);
      }

      const deleted = await storage.deleteListing(id);
      if (deleted) {
        return json({ message: "Listing deleted successfully" });
      }
      return error("Listing not found", 404);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Server error";
      return error(message, 500);
    }
  }, req);
}
