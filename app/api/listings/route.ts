import { NextRequest } from "next/server";
import { json, error, withAuth } from "@lib/api-helpers";
import { getCurrentUser } from "@lib/auth";
import { queryListingsFromDb } from "@lib/listingsPublicQuery";
import * as H from "@lib/listingsQueryHelpers";
import { storage } from "@lib/storage";
import { insertListingSchema } from "@shared/schema";

/** Kept for compatibility: listings are no longer cached in RAM on this route. */
export function invalidateListingsCache() {}

type PublicListingsCacheEntry = {
  expiresAt: number;
  payload: unknown;
};

const PUBLIC_LISTINGS_CACHE_TTL_MS = 20_000;
const PUBLIC_COUNT_CACHE_TTL_MS = 15_000;
const PUBLIC_LISTINGS_CACHE_MAX_KEYS = 120;
const publicListingsCache = new Map<string, PublicListingsCacheEntry>();

function isPublicCacheableRequest(
  params: URLSearchParams,
  includeSoldListings: boolean,
  countOnly: boolean,
) {
  if (includeSoldListings) return false;
  if (H.qStr(params, "userId")) return false;
  if (countOnly) return true;
  return true;
}

function getCachedPublicListings(key: string) {
  const cached = publicListingsCache.get(key);
  if (!cached) return null;
  if (cached.expiresAt <= Date.now()) {
    publicListingsCache.delete(key);
    return null;
  }
  return cached.payload;
}

function setCachedPublicListings(key: string, payload: unknown) {
  if (publicListingsCache.size >= PUBLIC_LISTINGS_CACHE_MAX_KEYS) {
    const firstKey = publicListingsCache.keys().next().value;
    if (typeof firstKey === "string") {
      publicListingsCache.delete(firstKey);
    }
  }
  publicListingsCache.set(key, {
    expiresAt: Date.now() + PUBLIC_LISTINGS_CACHE_TTL_MS,
    payload,
  });
}

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

    const cacheable = isPublicCacheableRequest(
      params,
      includeSoldListings,
      countOnly,
    );
    const cacheKey = cacheable
      ? `${countOnly ? "count" : "list"}:${params.toString()}`
      : null;
    if (cacheKey) {
      const cachedPayload = getCachedPublicListings(cacheKey);
      if (cachedPayload) {
        return json(cachedPayload);
      }
    }

    const { rows, total, page, limit, totalPages } = await queryListingsFromDb(
      params,
      { includeSoldListings },
      { countOnly },
    );

    const hasMore = page * limit < total;
    const payload = {
      listings: rows,
      pagination: { total, page, limit, totalPages, hasMore },
    };

    if (cacheKey) {
      const ttl =
        countOnly ? PUBLIC_COUNT_CACHE_TTL_MS : PUBLIC_LISTINGS_CACHE_TTL_MS;
      if (publicListingsCache.size >= PUBLIC_LISTINGS_CACHE_MAX_KEYS) {
        const firstKey = publicListingsCache.keys().next().value;
        if (typeof firstKey === "string") {
          publicListingsCache.delete(firstKey);
        }
      }
      publicListingsCache.set(cacheKey, {
        expiresAt: Date.now() + ttl,
        payload,
      });
    }

    return json(payload);
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
