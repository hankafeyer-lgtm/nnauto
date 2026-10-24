import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { requireAuth } from "@lib/auth";
import { getCampaignById, getCampaignStats } from "@lib/ads/service";

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
    const stats = await getCampaignStats(id);
    return json({ stats });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return error("Unauthorized", 401);
    return error(msg, 500);
  }
}
