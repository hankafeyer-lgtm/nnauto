import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { requireDealer } from "@lib/auth";
import {
  DEALER_PACKAGES,
  getDealerPackagePriceId,
  getDealerStripe,
  isDealerPackageId,
} from "@lib/dealerPackages";

function getBaseUrl(req: NextRequest): string {
  if (process.env.APP_BASE_URL) return process.env.APP_BASE_URL;
  const origin = req.headers.get("origin");
  if (origin) return origin;
  const host = req.headers.get("host");
  if (host) {
    const proto =
      req.headers.get("x-forwarded-proto") === "https" ? "https" : "http";
    return `${proto}://${host}`;
  }
  return "http://localhost:3000";
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireDealer();
    if (!user.dealerId) return error("Dealer not found", 404);

    const body = await req.json().catch(() => ({}));
    const packageId = body.packageId;
    if (!isDealerPackageId(packageId)) return error("Invalid package", 400);

    let stripe;
    try {
      stripe = getDealerStripe();
    } catch {
      return error("Dealer payment system not configured", 503);
    }

    const pkg = DEALER_PACKAGES[packageId];
    const priceId = getDealerPackagePriceId(packageId);
    const baseUrl = getBaseUrl(req);
    const successUrl =
      `${baseUrl}/dealer?tab=billing&package_payment=success` +
      `&package_id=${packageId}&session_id={CHECKOUT_SESSION_ID}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: successUrl,
      cancel_url: `${baseUrl}/dealer?tab=billing&package_payment=cancelled&package_id=${packageId}`,
      subscription_data: {
        metadata: {
          type: "dealer_vehicle_package",
          packageId,
          userId: user.id,
          dealerId: user.dealerId,
        },
      },
      metadata: {
        type: "dealer_vehicle_package",
        packageId,
        userId: user.id,
        dealerId: user.dealerId,
        cars: String(pkg.cars),
      },
    });

    return json({ url: session.url, sessionId: session.id });
  } catch (e: any) {
    if (e.message === "Unauthorized") return error("Unauthorized", 401);
    if (e.message === "Forbidden") return error("Forbidden", 403);
    console.error("Dealer package checkout error:", e);
    return error(e.message, 500);
  }
}
