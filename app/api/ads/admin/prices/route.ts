import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { requireAdmin } from "@lib/auth";
import {
  getCatalogWithPrices,
  setPlacementEnabled,
  upsertPlacementPrice,
} from "@lib/ads/service";
import {
  AD_DURATION_DAYS,
  type AdDurationDays,
  type AdPlacementId,
} from "@shared/adCatalog";

export async function GET() {
  try {
    await requireAdmin();
    return json(await getCatalogWithPrices());
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return error("Unauthorized", 401);
    if (msg === "Forbidden" || msg.includes("Admin")) return error("Forbidden", 403);
    return error(msg, 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = (await req.json()) as {
      placement?: AdPlacementId;
      durationDays?: number;
      priceKc?: number;
      enabled?: boolean;
      /** Toggle entire placement on/off for all durations */
      placementEnabled?: boolean;
    };

    if (!body.placement) return error("placement required", 400);

    if (typeof body.placementEnabled === "boolean") {
      const catalog = await setPlacementEnabled(
        body.placement,
        body.placementEnabled,
        admin.id,
      );
      return json(catalog);
    }

    const days = Number(body.durationDays) as AdDurationDays;
    if (!AD_DURATION_DAYS.includes(days)) {
      return error("Neplatná délka", 400);
    }
    if (typeof body.priceKc !== "number") {
      return error("priceKc required", 400);
    }

    const catalog = await upsertPlacementPrice({
      placement: body.placement,
      durationDays: days,
      priceKc: body.priceKc,
      enabled: body.enabled !== false,
      updatedBy: admin.id,
    });
    return json(catalog);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return error("Unauthorized", 401);
    if (msg === "Forbidden" || msg.includes("Admin")) return error("Forbidden", 403);
    return error(msg, 400);
  }
}
