import { json, error } from "@lib/api-helpers";
import { getCurrentUser } from "@lib/auth";
import {
  countDealerUsedListingSlots,
  getActiveDealerPackageSubscription,
} from "@lib/dealerPackages";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return error("Unauthorized", 401);
    if (!user.isDealer || !user.dealerId) {
      return json({ isDealer: false, active: true });
    }
    if (user.isAdmin) {
      return json({
        isDealer: true,
        active: true,
        isAdmin: true,
        package: null,
        usedListings: 0,
        maxListings: null,
        remainingListings: null,
      });
    }

    const activePackage = await getActiveDealerPackageSubscription(user.dealerId);
    const usedListings = await countDealerUsedListingSlots(user.id);
    const maxListings = activePackage?.maxListings ?? 0;

    return json({
      isDealer: true,
      active: !!activePackage,
      isAdmin: false,
      package: activePackage,
      usedListings,
      maxListings,
      remainingListings: activePackage
        ? Math.max(0, activePackage.maxListings - usedListings)
        : 0,
      limitReached: activePackage ? usedListings >= activePackage.maxListings : true,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    return error(msg, 500);
  }
}
