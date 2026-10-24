import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { requireAuth } from "@lib/auth";
import {
  createCampaign,
  listAllCampaigns,
  listCampaignsForUser,
  type CampaignInput,
} from "@lib/ads/service";
import {
  AD_DURATION_DAYS,
  type AdDurationDays,
  type AdPlacementId,
} from "@shared/adCatalog";

function isSafeHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

export async function GET(_req: NextRequest) {
  try {
    const user = await requireAuth();
    if (user.isAdmin) {
      return json({ campaigns: await listAllCampaigns() });
    }
    return json({ campaigns: await listCampaignsForUser(user.id) });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return error("Unauthorized", 401);
    return error(msg, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = (await req.json()) as Partial<CampaignInput> & {
      submit?: boolean;
    };

    if (!body.placement || !body.headline || !body.targetUrl) {
      return error("Chybí povinná pole (placement, headline, targetUrl)", 400);
    }
    if (!isSafeHttpUrl(String(body.targetUrl))) {
      return error("Cílový odkaz musí být http(s) URL", 400);
    }
    const days = Number(body.durationDays) as AdDurationDays;
    if (!AD_DURATION_DAYS.includes(days)) {
      return error("Neplatná délka kampaně", 400);
    }
    if (!body.imageUrl && !body.videoUrl) {
      return error("Nahrajte obrázek nebo video", 400);
    }

    const status = body.submit ? "pending_payment" : body.status || "draft";

    const campaign = await createCampaign(
      user.id,
      {
        name: String(body.name || "Bez názvu"),
        placement: body.placement as AdPlacementId,
        headline: String(body.headline),
        description: String(body.description || ""),
        imageUrl: body.imageUrl || null,
        videoUrl: body.videoUrl || null,
        ctaText: body.ctaText || "Zjistit více",
        targetUrl: String(body.targetUrl),
        durationDays: days,
        startDate: String(body.startDate || new Date().toISOString().slice(0, 10)),
        endDate: body.endDate ? String(body.endDate) : undefined,
        brandFilter: body.brandFilter || null,
        categoryFilter: body.categoryFilter || null,
        status,
      },
      {
        advertiserName:
          [user.firstName, user.lastName].filter(Boolean).join(" ") ||
          user.username ||
          user.email ||
          null,
      },
    );

    return json({ campaign }, 201);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return error("Unauthorized", 401);
    return error(msg, 400);
  }
}
