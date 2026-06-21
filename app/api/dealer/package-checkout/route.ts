import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { requireDealer } from "@lib/auth";
import Stripe from "stripe";

const PACKAGES = {
  start: { name: "START", cars: 150, priceKc: 3000 },
  business: { name: "BUSINESS", cars: 350, priceKc: 4500 },
  pro: { name: "PRO", cars: 750, priceKc: 6000 },
} as const;

type PackageId = keyof typeof PACKAGES;

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Stripe not configured");
  return new Stripe(key);
}

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

function isPackageId(value: unknown): value is PackageId {
  return typeof value === "string" && value in PACKAGES;
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireDealer();
    if (!user.dealerId) return error("Dealer not found", 404);

    const body = await req.json().catch(() => ({}));
    const packageId = body.packageId;
    if (!isPackageId(packageId)) return error("Invalid package", 400);

    let stripe: Stripe;
    try {
      stripe = getStripe();
    } catch {
      return error("Payment system not configured", 503);
    }

    const pkg = PACKAGES[packageId];
    const baseUrl = getBaseUrl(req);
    const successUrl =
      `${baseUrl}/dealer?tab=billing&package_payment=success` +
      `&package_id=${packageId}&session_id={CHECKOUT_SESSION_ID}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "czk",
            product_data: {
              name: `NNAuto ${pkg.name}`,
              description: `${pkg.cars} vozidel / 1 rok`,
            },
            unit_amount: pkg.priceKc * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: successUrl,
      cancel_url: `${baseUrl}/dealer?tab=billing&package_payment=cancelled&package_id=${packageId}`,
      metadata: {
        type: "dealer_vehicle_package",
        packageId,
        userId: user.id,
        dealerId: user.dealerId,
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
