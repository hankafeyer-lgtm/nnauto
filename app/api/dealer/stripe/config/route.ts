import { NextRequest } from "next/server";
import { json } from "@lib/api-helpers";

export async function GET(_req: NextRequest) {
  return json({
    publishableKey: process.env.DEALER_STRIPE_PUBLISHABLE_KEY || null,
  });
}
