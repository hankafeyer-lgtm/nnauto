import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { requireDealer } from "@lib/auth";
import { activateDealerPackageFromCheckoutSession } from "@lib/dealerPackages";

export async function POST(req: NextRequest) {
  try {
    const user = await requireDealer();
    if (!user.dealerId) return error("Dealer not found", 404);

    const { sessionId } = await req.json().catch(() => ({}));
    if (!sessionId || typeof sessionId !== "string") {
      return error("Invalid session ID", 400);
    }

    const subscription = await activateDealerPackageFromCheckoutSession(sessionId);
    if (subscription.userId !== user.id || subscription.dealerId !== user.dealerId) {
      return error("Session mismatch", 403);
    }

    return json({
      ok: true,
      packageId: subscription.packageId,
      subscription,
      sessionId,
    });
  } catch (e: any) {
    if (e.message === "Unauthorized") return error("Unauthorized", 401);
    if (e.message === "Forbidden") return error("Forbidden", 403);
    console.error("Dealer package completion error:", e);
    return error(e.message, 500);
  }
}
