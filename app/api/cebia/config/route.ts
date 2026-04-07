import { NextRequest } from "next/server";
import { json } from "@lib/api-helpers";

export async function GET() {
  return json({
    enabled: process.env.CEBIA_ENABLED === "true",
    paymentsFrozen: process.env.CEBIA_PAYMENTS_FROZEN === "true",
  });
}
