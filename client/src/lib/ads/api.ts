/**
 * Client helpers for ads DB API (LOCAL-FIRST).
 * Falls back gracefully when unauthenticated / offline.
 */

import { listingsFetchHeaders } from "@/lib/queryClient";
import type { AdCampaign, CampaignDraft } from "./types";
import type { AdPlacementId } from "@shared/adCatalog";

export type ServeCreative = {
  id: string;
  placement: AdPlacementId;
  headline: string;
  description: string;
  imageUrl: string | null;
  videoUrl: string | null;
  ctaText: string;
  targetUrl: string;
};

function sessionKey(): string {
  if (typeof window === "undefined") return "ssr";
  try {
    const k = "nn_ad_session";
    let v = sessionStorage.getItem(k);
    if (!v) {
      v = `s_${Math.random().toString(36).slice(2)}_${Date.now()}`;
      sessionStorage.setItem(k, v);
    }
    return v;
  } catch {
    return `s_${Date.now()}`;
  }
}

function deviceHint(): string {
  if (typeof window === "undefined") return "unknown";
  const w = window.innerWidth;
  if (w < 640) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}

export async function fetchCatalog() {
  const res = await fetch("/api/ads/catalog", { credentials: "include" });
  if (!res.ok) throw new Error("Catalog load failed");
  return res.json() as Promise<{
    durations: number[];
    placements: Array<{
      id: AdPlacementId;
      label: string;
      description: string;
      pricesKc: Record<7 | 14 | 30, number>;
      enabled: boolean;
      available: boolean;
      wiredInProduct: boolean;
      desktopSize: string;
      mobileSize: string;
      locationHint: string;
      media: string;
    }>;
  }>;
}

export async function fetchMyCampaigns(): Promise<AdCampaign[]> {
  const res = await fetch("/api/ads/campaigns", {
    credentials: "include",
    headers: listingsFetchHeaders(),
  });
  if (res.status === 401) return [];
  if (!res.ok) throw new Error(await res.text());
  const data = (await res.json()) as { campaigns: AdCampaign[] };
  return data.campaigns || [];
}

export async function saveCampaignToApi(
  draft: CampaignDraft,
  opts: { submit?: boolean; editId?: string | null } = {},
): Promise<AdCampaign> {
  if (!draft.placement) throw new Error("Vyberte umístění");

  const payload = {
    name: draft.name.trim() || "Bez názvu",
    placement: draft.placement,
    headline: draft.headline.trim(),
    description: draft.description.trim(),
    imageUrl: draft.image.trim() || null,
    videoUrl: draft.videoUrl?.trim() || null,
    ctaText: draft.ctaText.trim() || "Zjistit více",
    targetUrl: draft.targetUrl.trim(),
    durationDays: draft.durationDays,
    startDate: draft.startDate,
    endDate: draft.endDate,
    brandFilter: draft.brandFilter || null,
    categoryFilter: draft.categoryFilter || null,
    submit: opts.submit !== false,
  };

  if (opts.editId) {
    const res = await fetch(`/api/ads/campaigns/${opts.editId}`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        ...listingsFetchHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error((await res.text()) || "Update failed");
    const data = (await res.json()) as { campaign: AdCampaign };
    if (opts.submit) {
      await fetch(`/api/ads/campaigns/${opts.editId}/status`, {
        method: "POST",
        credentials: "include",
        headers: {
          ...listingsFetchHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "pending_payment" }),
      });
    }
    return data.campaign;
  }

  const res = await fetch("/api/ads/campaigns", {
    method: "POST",
    credentials: "include",
    headers: {
      ...listingsFetchHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error((await res.text()) || "Create failed");
  const data = (await res.json()) as { campaign: AdCampaign };
  return data.campaign;
}

export async function localDemoPay(campaignId: string) {
  const res = await fetch(`/api/ads/campaigns/${campaignId}/local-demo-pay`, {
    method: "POST",
    credentials: "include",
    headers: listingsFetchHeaders(),
  });
  if (!res.ok) throw new Error((await res.text()) || "Demo pay failed");
  return res.json() as Promise<{
    campaign: AdCampaign;
    demo: true;
    notice: string;
  }>;
}

export async function adminSetStatus(
  campaignId: string,
  status: string,
  reason?: string,
) {
  const res = await fetch(`/api/ads/campaigns/${campaignId}/status`, {
    method: "POST",
    credentials: "include",
    headers: {
      ...listingsFetchHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status, reason }),
  });
  if (!res.ok) throw new Error((await res.text()) || "Status update failed");
  return (await res.json()) as { campaign: AdCampaign };
}

export async function adminUpdatePrice(body: {
  placement: AdPlacementId;
  durationDays?: number;
  priceKc?: number;
  enabled?: boolean;
  placementEnabled?: boolean;
}) {
  const res = await fetch("/api/ads/admin/prices", {
    method: "PUT",
    credentials: "include",
    headers: {
      ...listingsFetchHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error((await res.text()) || "Price update failed");
  return res.json();
}

export async function fetchServeCreative(
  placement: AdPlacementId,
): Promise<ServeCreative | null> {
  const res = await fetch(
    `/api/ads/serve?placement=${encodeURIComponent(placement)}`,
    { credentials: "include" },
  );
  if (!res.ok) return null;
  const data = (await res.json()) as { creative: ServeCreative | null };
  return data.creative;
}

export async function trackServeEvent(
  campaignId: string,
  eventType: "impression" | "click",
  placement?: string,
) {
  try {
    await fetch("/api/ads/events", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        campaignId,
        eventType,
        placement,
        device: deviceHint(),
        sessionKey: sessionKey(),
      }),
    });
  } catch {
    /* ignore analytics failures */
  }
}

export async function fetchCampaignStats(campaignId: string) {
  const res = await fetch(`/api/ads/campaigns/${campaignId}/stats`, {
    credentials: "include",
    headers: listingsFetchHeaders(),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as {
    stats: {
      impressions: number;
      clicks: number;
      ctr: number | null;
      hasData: boolean;
    };
  };
  return data.stats;
}

/** Map serve creative → AdCampaign shape for AdCreative. */
export function creativeToCampaign(c: ServeCreative): AdCampaign {
  return {
    id: c.id,
    advertiserId: "",
    name: c.headline,
    status: "active",
    placement: c.placement,
    headline: c.headline,
    description: c.description,
    image: c.imageUrl || "",
    videoUrl: c.videoUrl || undefined,
    ctaText: c.ctaText,
    targetUrl: c.targetUrl,
    dailyBudget: 0,
    totalBudget: 0,
    startDate: "",
    endDate: "",
    impressions: 0,
    clicks: 0,
    spend: 0,
    createdAt: "",
    updatedAt: "",
  };
}
