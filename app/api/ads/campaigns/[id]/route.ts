import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { requireAuth } from "@lib/auth";
import {
  getCampaignById,
  updateCampaign,
  type CampaignInput,
} from "@lib/ads/service";
import { AD_DURATION_DAYS, type AdDurationDays } from "@shared/adCatalog";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  try {
    const user = await requireAuth();
    const { id } = await ctx.params;
    const campaign = await getCampaignById(id);
    if (!campaign) return error("Not found", 404);
    if (!user.isAdmin && campaign.advertiserId !== user.id) {
      return error("Forbidden", 403);
    }
    return json({ campaign });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return error("Unauthorized", 401);
    return error(msg, 500);
  }
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  try {
    const user = await requireAuth();
    const { id } = await ctx.params;
    const body = (await req.json()) as Partial<CampaignInput>;

    if (body.durationDays != null) {
      const days = Number(body.durationDays) as AdDurationDays;
      if (!AD_DURATION_DAYS.includes(days)) {
        return error("Neplatná délka kampaně", 400);
      }
    }

    const campaign = await updateCampaign(id, user.id, body, !!user.isAdmin);
    return json({ campaign });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return error("Unauthorized", 401);
    if (msg === "Forbidden") return error("Forbidden", 403);
    if (msg === "Kampaň nenalezena") return error(msg, 404);
    return error(msg, 400);
  }
}
