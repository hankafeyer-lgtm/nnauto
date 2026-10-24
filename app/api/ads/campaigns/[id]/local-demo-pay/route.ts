import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { requireAuth } from "@lib/auth";
import { markLocalDemoPaid } from "@lib/ads/service";

type Ctx = { params: Promise<{ id: string }> };

/**
 * LOCAL DEMO ONLY — does NOT create a real payment or call Stripe.
 * Marks campaign as locally "paid" and moves it to pending_approval.
 */
export async function POST(_req: NextRequest, ctx: Ctx) {
  try {
    const user = await requireAuth();
    const { id } = await ctx.params;

    // Hard guard: never run in production builds
    if (process.env.NODE_ENV === "production" && process.env.ADS_LOCAL_DEMO !== "1") {
      return error("Local demo payment is disabled outside local/dev", 403);
    }

    const campaign = await markLocalDemoPaid({
      id,
      userId: user.id,
      isAdmin: !!user.isAdmin,
    });

    return json({
      campaign,
      demo: true,
      notice:
        "LOCAL DEMO — žádná skutečná platba. Kampaň čeká na schválení administrátorem.",
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return error("Unauthorized", 401);
    if (msg === "Forbidden") return error("Forbidden", 403);
    if (msg === "Kampaň nenalezena") return error(msg, 404);
    return error(msg, 400);
  }
}
