import { NextRequest } from "next/server";
import crypto from "node:crypto";
import { db } from "./db";
import { dealers } from "@shared/schema";
import { and, eq } from "drizzle-orm";

export interface ApiDealerCtx {
  dealerId: string;
  /** Owner user id — listings are stored under this user. */
  userId: string;
  maxListings: number;
  region: string | null;
  phone: string | null;
}

/** Generate a fresh dealer API key (fits the dealers.api_key 80-char column). */
export function generateApiKey(): string {
  return `nn_live_${crypto.randomBytes(24).toString("hex")}`;
}

function extractBearer(req: NextRequest): string {
  const header = req.headers.get("authorization") || "";
  if (header.startsWith("Bearer ")) return header.slice(7).trim();
  // Allow X-API-Key as a convenience for systems that reserve Authorization.
  const xKey = req.headers.get("x-api-key");
  return xKey ? xKey.trim() : "";
}

/**
 * Authenticate an external request by dealer API key. Returns the dealer
 * context, or null when the key is missing/invalid/disabled.
 */
export async function getApiDealer(req: NextRequest): Promise<ApiDealerCtx | null> {
  const key = extractBearer(req);
  if (!key || key.length < 16) return null;

  const [dealer] = await db
    .select()
    .from(dealers)
    .where(and(eq(dealers.apiKey, key), eq(dealers.apiEnabled, true)));

  if (!dealer) return null;

  return {
    dealerId: dealer.id,
    userId: dealer.ownerId,
    maxListings: dealer.maxListings,
    region: dealer.region,
    phone: dealer.phone,
  };
}
