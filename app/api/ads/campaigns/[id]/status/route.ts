import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { requireAuth } from "@lib/auth";
import { setCampaignStatus } from "@lib/ads/service";
import {
  AD_CAMPAIGN_STATUSES,
  type AdCampaignStatus,
} from "@shared/adCatalog";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, ctx: Ctx) {
  try {
    const user = await requireAuth();
    const { id } = await ctx.params;
    const body = (await req.json()) as {
      status?: string;
      reason?: string;
    };

    if (!body.status || !AD_CAMPAIGN_STATUSES.includes(body.status as AdCampaignStatus)) {
      return error("Neplatný status", 400);
    }

    // Admin-only transitions
    const adminOnly: AdCampaignStatus[] = [
      "approved",
      "active",
      "rejected",
      "completed",
    ];
    const to = body.status as AdCampaignStatus;
    if (adminOnly.includes(to) && !user.isAdmin) {
      return error("Forbidden", 403);
    }
    if (to === "rejected" && !body.reason?.trim()) {
      return error("Uveďte důvod zamítnutí", 400);
    }

    const campaign = await setCampaignStatus({
      id,
      toStatus: to,
      actorId: user.id,
      isAdmin: !!user.isAdmin,
      reason: body.reason,
    });

    return json({ campaign });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return error("Unauthorized", 401);
    if (msg === "Forbidden") return error("Forbidden", 403);
    if (msg === "Kampaň nenalezena") return error(msg, 404);
    return error(msg, 400);
  }
}
