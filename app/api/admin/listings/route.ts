import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { requireAdmin } from "@lib/auth";
import { storage } from "@lib/storage";
import { withActiveTopListingStatus } from "@shared/topListing";

export async function GET(_req: NextRequest) {
  try {
    const _admin = await requireAdmin();
    const listings = await storage.getListings();
    // Expired TOP must show as inactive so admin can re-enable (fresh 30 days).
    return json(listings.map(withActiveTopListingStatus));
  } catch (e: any) {
    if (e.message === "Unauthorized") return error("Unauthorized", 401);
    if (e.message === "Forbidden") return error("Forbidden", 403);
    return error(e.message, 500);
  }
}
