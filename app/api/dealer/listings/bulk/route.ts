import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { requireDealer } from "@lib/auth";
import { storage } from "@lib/storage";
import { invalidateListingsCache } from "../../../listings/route";
import { dispatchVehicleWebhook } from "@lib/webhooks";

type BulkAction = "mark_sold" | "delete" | "price_update";

type PricePayload = {
  mode?: "set" | "increase_percent" | "decrease_percent";
  value?: number;
};

const MAX_IDS = 100;

function roundPriceKc(n: number): number {
  return Math.max(0, Math.round(n));
}

function parseCurrentPrice(listing: { price: unknown }): number | null {
  const raw = listing.price;
  if (raw == null) return null;
  const n = parseFloat(String(raw).replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

/**
 * POST /api/dealer/listings/bulk
 * Dealer-only. Each id must belong to the authenticated user.
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requireDealer();
    const body = (await req.json()) as {
      ids?: string[];
      action?: BulkAction;
      payload?: PricePayload;
    };

    const { ids, action, payload } = body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return error("ids is required and must be a non-empty array", 400);
    }
    if (ids.length > MAX_IDS) {
      return error(`Maximum ${MAX_IDS} listings per request`, 400);
    }
    if (
      action !== "mark_sold" &&
      action !== "delete" &&
      action !== "price_update"
    ) {
      return error("Invalid action", 400);
    }

    let updated = 0;
    let skipped = 0;
    let cacheDirty = false;

    for (const id of ids) {
      if (typeof id !== "string" || !id) {
        skipped += 1;
        continue;
      }

      const listing = await storage.getListing(id);
      if (!listing || listing.userId !== user.id) {
        skipped += 1;
        continue;
      }

      if (action === "mark_sold") {
        const updatedListing = await storage.updateListing(id, { isSold: true });
        await dispatchVehicleWebhook({
          dealerId: user.dealerId,
          event: "vehicle.sold",
          listing: updatedListing,
          previous: listing,
          meta: { source: "dealer_bulk", action },
        });
        updated += 1;
        cacheDirty = true;
        continue;
      }

      if (action === "delete") {
        const ok = await storage.deleteListing(id);
        if (ok) {
          await dispatchVehicleWebhook({
            dealerId: user.dealerId,
            event: "vehicle.deleted",
            previous: listing,
            meta: { source: "dealer_bulk", action },
          });
          updated += 1;
          cacheDirty = true;
        } else {
          skipped += 1;
        }
        continue;
      }

      // price_update
      const mode = payload?.mode;
      const rawValue = payload?.value;
      if (
        mode !== "set" &&
        mode !== "increase_percent" &&
        mode !== "decrease_percent"
      ) {
        skipped += 1;
        continue;
      }
      const value = Number(rawValue);
      if (!Number.isFinite(value)) {
        skipped += 1;
        continue;
      }

      const current = parseCurrentPrice(listing);
      if (current === null) {
        skipped += 1;
        continue;
      }

      let newNum: number;
      if (mode === "set") {
        if (value < 0) {
          skipped += 1;
          continue;
        }
        newNum = roundPriceKc(value);
      } else if (mode === "increase_percent") {
        if (value < 0) {
          skipped += 1;
          continue;
        }
        newNum = roundPriceKc(current * (1 + value / 100));
      } else {
        if (value < 0) {
          skipped += 1;
          continue;
        }
        newNum = roundPriceKc(current * (1 - value / 100));
      }

      const updatedListing = await storage.updateListing(id, { price: String(newNum) });
      await dispatchVehicleWebhook({
        dealerId: user.dealerId,
        event: "vehicle.updated",
        listing: updatedListing,
        previous: listing,
        meta: { source: "dealer_bulk", action },
      });
      updated += 1;
      cacheDirty = true;
    }

    if (cacheDirty) {
      invalidateListingsCache();
    }

    return json({ success: true, updated, skipped });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return error("Unauthorized", 401);
    if (msg === "Forbidden") return error("Forbidden", 403);
    return error(msg, 500);
  }
}
