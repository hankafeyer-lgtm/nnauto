import { NextRequest } from "next/server";
import { json, error, withAuth } from "@lib/api-helpers";
import { getCurrentUser } from "@lib/auth";
import { queryListingsFromDb } from "@lib/listingsPublicQuery";
import * as H from "@lib/listingsQueryHelpers";
import { storage } from "@lib/storage";
import { insertListingSchema } from "@shared/schema";

/** Kept for compatibility: listings are no longer cached in RAM on this route. */
export function invalidateListingsCache() {}

export async function GET(req: NextRequest) {
  try {
    const params = req.nextUrl.searchParams;
    const countOnly = H.toBool(params.get("countOnly"));

    const viewer = await getCurrentUser();
    const cabinetUserId = H.qStr(params, "userId");
    const includeSoldListings = Boolean(
      cabinetUserId &&
        viewer &&
        (viewer.id === cabinetUserId || viewer.isAdmin),
    );

    const { rows, total, page, limit, totalPages } = await queryListingsFromDb(
      params,
      { includeSoldListings },
      { countOnly },
    );

    const hasMore = page * limit < total;

    return json({
      listings: rows,
      pagination: { total, page, limit, totalPages, hasMore },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return error(message, 500);
  }
}

export async function POST(req: NextRequest) {
  return withAuth(async (_req, user) => {
    try {
      const body = await _req.json();
      const validatedData = insertListingSchema.parse(body);

      if (validatedData.userId !== user.id) {
        return error("Cannot create listing for another user", 403);
      }

      const listing = await storage.createListing(validatedData);
      invalidateListingsCache();
      return json(listing);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Bad request";
      return error(message, 400);
    }
  }, req);
}
