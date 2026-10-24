import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { servePlacement } from "@lib/ads/service";
import type { AdPlacementId } from "@shared/adCatalog";

/** Public — returns one live creative for a placement, or null. */
export async function GET(req: NextRequest) {
  try {
    const placement = req.nextUrl.searchParams.get(
      "placement",
    ) as AdPlacementId | null;
    if (!placement) return error("placement required", 400);

    const creative = await servePlacement(placement);
    return json(
      { creative },
      200,
      {
        "Cache-Control": "private, max-age=30",
      },
    );
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    return error(msg, 500);
  }
}
