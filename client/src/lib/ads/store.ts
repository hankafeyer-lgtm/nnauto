"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import {
  createSeedStore,
  DEMO_ADVERTISER,
  advertiserDisplayName,
} from "./demo-seed";
import { useAdsDemoSession } from "./session";
import type {
  AdCampaign,
  AdInvoice,
  AdPlacementId,
  AdsStoreSnapshot,
  CampaignDraft,
  CampaignStatus,
} from "./types";
import { getAdsDemoUser } from "./session";

/** Bumped to v2 — resets fake-company seed from v1. */
const STORAGE_KEY = "nnauto_demo_ads_v2";
const CHANGE_EVENT = "nn-ads-changed";

let memorySnapshot: AdsStoreSnapshot | null = null;
let serverSnapshot: AdsStoreSnapshot | null = null;
let hydratedFromStorage = false;
const listeners = new Set<() => void>();

function emit(): void {
  listeners.forEach((l) => l());
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
  }
}

export function isCampaignLive(c: AdCampaign, today = new Date()): boolean {
  const live =
    c.status === "active" ||
    c.status === "approved" ||
    c.status === "scheduled";
  if (!live) return false;
  const t = today.toISOString().slice(0, 10);
  if (c.startDate && t < c.startDate) return false;
  if (c.endDate && t > c.endDate) return false;
  if (c.totalBudget > 0 && c.spend >= c.totalBudget) return false;
  return true;
}

function parseStoredSnapshot(raw: string): AdsStoreSnapshot | null {
  try {
    const parsed = JSON.parse(raw) as AdsStoreSnapshot;
    if (parsed?.version === 2 && Array.isArray(parsed.campaigns)) {
      if (!Array.isArray(parsed.invoices)) parsed.invoices = [];
      if (!parsed.budgets || typeof parsed.budgets !== "object") {
        parsed.budgets = {};
      }
      return parsed;
    }
  } catch {
    /* ignore */
  }
  return null;
}

function hydrateFromLocalStorage(): AdsStoreSnapshot {
  if (typeof window === "undefined") {
    return getServerSnapshot();
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = parseStoredSnapshot(raw);
      if (parsed) {
        memorySnapshot = parsed;
        hydratedFromStorage = true;
        return parsed;
      }
    }
  } catch {
    /* ignore */
  }
  const seed = createSeedStore();
  memorySnapshot = seed;
  hydratedFromStorage = true;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
  } catch {
    /* ignore */
  }
  return seed;
}

function readStore(): AdsStoreSnapshot {
  if (typeof window === "undefined") {
    return getServerSnapshot();
  }
  if (memorySnapshot && hydratedFromStorage) {
    return memorySnapshot;
  }
  return hydrateFromLocalStorage();
}

function writeStore(next: AdsStoreSnapshot): void {
  memorySnapshot = next;
  hydratedFromStorage = true;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }
  emit();
}

function subscribe(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  if (typeof window !== "undefined") {
    const onCrossTab = () => {
      hydratedFromStorage = false;
      memorySnapshot = null;
      hydrateFromLocalStorage();
      onStoreChange();
    };
    const onLocal = () => onStoreChange();
    window.addEventListener(CHANGE_EVENT, onLocal);
    window.addEventListener("storage", onCrossTab);
    return () => {
      listeners.delete(onStoreChange);
      window.removeEventListener(CHANGE_EVENT, onLocal);
      window.removeEventListener("storage", onCrossTab);
    };
  }
  return () => listeners.delete(onStoreChange);
}

function getSnapshot(): AdsStoreSnapshot {
  return readStore();
}

function getServerSnapshot(): AdsStoreSnapshot {
  if (!serverSnapshot) {
    serverSnapshot = createSeedStore();
  }
  return serverSnapshot;
}

function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function getActiveCampaignForPlacement(
  placement: AdPlacementId,
  store?: AdsStoreSnapshot,
): AdCampaign | null {
  const snap = store ?? readStore();
  const live = snap.campaigns.filter(
    (c) => c.placement === placement && isCampaignLive(c),
  );
  if (!live.length) return null;
  // Fair rotation (demo): least impressions first, random among ties
  const sorted = [...live].sort(
    (a, b) =>
      a.impressions - b.impressions || b.updatedAt.localeCompare(a.updatedAt),
  );
  const min = sorted[0].impressions;
  const pool = sorted.filter((c) => c.impressions === min);
  return pool[Math.floor(Math.random() * pool.length)] ?? sorted[0];
}

export function campaignsForAdvertiser(
  advertiserId: string,
  store?: AdsStoreSnapshot,
): AdCampaign[] {
  const snap = store ?? readStore();
  return snap.campaigns.filter((c) => c.advertiserId === advertiserId);
}

export function invoicesForAdvertiser(
  advertiserId: string,
  store?: AdsStoreSnapshot,
): AdInvoice[] {
  const snap = store ?? readStore();
  return snap.invoices.filter((i) => i.advertiserId === advertiserId);
}

export function getAdvertiserBudget(
  advertiserId: string,
  store?: AdsStoreSnapshot,
): number {
  const snap = store ?? readStore();
  return snap.budgets[advertiserId] ?? 0;
}

export function trackAdImpression(campaignId: string): void {
  const snap = readStore();
  const campaigns = snap.campaigns.map((c) =>
    c.id === campaignId
      ? {
          ...c,
          impressions: c.impressions + 1,
          spend: Math.min(c.totalBudget, Number((c.spend + 0.8).toFixed(2))),
          updatedAt: new Date().toISOString(),
        }
      : c,
  );
  writeStore({ ...snap, campaigns });
}

export function trackAdClick(campaignId: string): void {
  const snap = readStore();
  const campaigns = snap.campaigns.map((c) =>
    c.id === campaignId
      ? {
          ...c,
          clicks: c.clicks + 1,
          spend: Math.min(c.totalBudget, Number((c.spend + 12).toFixed(2))),
          updatedAt: new Date().toISOString(),
        }
      : c,
  );
  writeStore({ ...snap, campaigns });
}

export function createCampaignFromDraft(
  draft: CampaignDraft,
  opts?: { status?: CampaignStatus; advertiserId?: string },
): AdCampaign {
  if (!draft.placement) {
    throw new Error("Placement is required");
  }
  const session = getAdsDemoUser();
  const advertiserId =
    opts?.advertiserId ??
    session.advertiserId ??
    DEMO_ADVERTISER.id;
  const now = new Date().toISOString();
  const campaign: AdCampaign = {
    id: uid("camp"),
    advertiserId,
    name: draft.name.trim() || "Bez názvu",
    status: opts?.status ?? "pending_review",
    placement: draft.placement,
    headline: draft.headline.trim(),
    description: draft.description.trim(),
    image: draft.image.trim(),
    videoUrl: draft.videoUrl?.trim() || undefined,
    ctaText: draft.ctaText.trim() || "Zjistit více",
    targetUrl: draft.targetUrl.trim() || "https://nnauto.cz/",
    dailyBudget: Number(draft.dailyBudget) || 0,
    totalBudget: Number(draft.totalBudget || draft.priceKc) || 0,
    durationDays: draft.durationDays,
    priceKc: Number(draft.priceKc) || Number(draft.totalBudget) || 0,
    startDate: draft.startDate,
    endDate: draft.endDate,
    brandFilter: draft.brandFilter || undefined,
    categoryFilter: draft.categoryFilter || undefined,
    impressions: 0,
    clicks: 0,
    spend: 0,
    createdAt: now,
    updatedAt: now,
  };
  const snap = readStore();
  const budget = snap.budgets[advertiserId] ?? 0;
  writeStore({
    ...snap,
    campaigns: [campaign, ...snap.campaigns],
    budgets: {
      ...snap.budgets,
      [advertiserId]: Math.max(0, budget - (campaign.totalBudget || 0)),
    },
  });
  return campaign;
}

export function updateCampaign(
  id: string,
  patch: Partial<AdCampaign>,
): AdCampaign | null {
  const snap = readStore();
  let updated: AdCampaign | null = null;
  const campaigns = snap.campaigns.map((c) => {
    if (c.id !== id) return c;
    updated = {
      ...c,
      ...patch,
      id: c.id,
      advertiserId: c.advertiserId,
      updatedAt: new Date().toISOString(),
    };
    return updated;
  });
  if (!updated) return null;
  writeStore({ ...snap, campaigns });
  return updated;
}

export function setCampaignStatus(
  id: string,
  status: CampaignStatus,
  extra?: Partial<Pick<AdCampaign, "rejectionReason">>,
): AdCampaign | null {
  return updateCampaign(id, { status, ...extra });
}

/** Admin approval — goes live if dates allow, otherwise scheduled. */
export function approveCampaign(id: string): AdCampaign | null {
  const snap = readStore();
  const c = snap.campaigns.find((x) => x.id === id);
  if (!c) return null;
  const today = new Date().toISOString().slice(0, 10);
  let status: CampaignStatus = "active";
  if (c.startDate && today < c.startDate) status = "scheduled";
  if (c.endDate && today > c.endDate) status = "completed";
  return updateCampaign(id, { status, rejectionReason: undefined });
}

export function rejectCampaign(
  id: string,
  reason?: string,
): AdCampaign | null {
  return setCampaignStatus(id, "rejected", {
    rejectionReason: reason?.trim() || undefined,
  });
}

/**
 * Advertiser pause/resume — cannot bypass approval.
 * Resume only from paused → active (or scheduled if start in future).
 */
export function advertiserSetCampaignRunning(
  id: string,
  running: boolean,
): AdCampaign | null {
  const snap = readStore();
  const session = getAdsDemoUser();
  const c = snap.campaigns.find((x) => x.id === id);
  if (!c) return null;
  if (
    session.role === "ADVERTISER" &&
    c.advertiserId !== session.advertiserId
  ) {
    throw new Error("Nemáte oprávnění upravit tuto kampaň");
  }
  if (running) {
    if (c.status === "pending_review" || c.status === "rejected" || c.status === "draft") {
      throw new Error("Kampaň musí nejprve schválit Admin");
    }
    if (c.status !== "paused" && c.status !== "scheduled") {
      return c;
    }
    return approveCampaign(id);
  }
  if (c.status === "active" || c.status === "scheduled") {
    return setCampaignStatus(id, "paused");
  }
  return c;
}

export function resetAdsDemoStore(): void {
  writeStore(createSeedStore());
}

export function calcCtr(impressions: number, clicks: number): number {
  if (!impressions) return 0;
  return (clicks / impressions) * 100;
}

export function summarizeCampaigns(campaigns: AdCampaign[]) {
  const impressions = campaigns.reduce((s, c) => s + c.impressions, 0);
  const clicks = campaigns.reduce((s, c) => s + c.clicks, 0);
  const spend = campaigns.reduce((s, c) => s + c.spend, 0);
  return {
    total: campaigns.length,
    activeCount: campaigns.filter((c) => c.status === "active").length,
    pendingCount: campaigns.filter((c) => c.status === "pending_review").length,
    pausedCount: campaigns.filter((c) => c.status === "paused").length,
    rejectedCount: campaigns.filter((c) => c.status === "rejected").length,
    impressions,
    clicks,
    ctr: calcCtr(impressions, clicks),
    spend,
  };
}

export function useAdsStore(): AdsStoreSnapshot {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useActiveAd(placement: AdPlacementId): AdCampaign | null {
  const store = useAdsStore();
  return getActiveCampaignForPlacement(placement, store);
}

/** Campaigns visible to current demo session (admin = all). */
export function useScopedCampaigns(): AdCampaign[] {
  const store = useAdsStore();
  const { role, advertiserId } = useAdsDemoSession();
  return useMemo(() => {
    if (role === "ADMIN") return store.campaigns;
    if (!advertiserId) return [];
    return store.campaigns.filter((c) => c.advertiserId === advertiserId);
  }, [store.campaigns, role, advertiserId]);
}

export function useScopedInvoices(): AdInvoice[] {
  const store = useAdsStore();
  const { role, advertiserId } = useAdsDemoSession();
  return useMemo(() => {
    if (role === "ADMIN") return store.invoices;
    if (!advertiserId) return [];
    return store.invoices.filter((i) => i.advertiserId === advertiserId);
  }, [store.invoices, role, advertiserId]);
}

export function useAdsActions() {
  return {
    createCampaignFromDraft,
    updateCampaign,
    setCampaignStatus,
    approveCampaign,
    rejectCampaign,
    advertiserSetCampaignRunning,
    trackAdImpression,
    trackAdClick,
    resetAdsDemoStore,
  };
}

export function emptyDraft(): CampaignDraft {
  const today = new Date().toISOString().slice(0, 10);
  return {
    name: "",
    placement: null,
    headline: "",
    description: "",
    image: "",
    videoUrl: "",
    ctaText: "Zjistit více",
    targetUrl: "https://nnauto.cz/",
    dailyBudget: 0,
    totalBudget: 0,
    durationDays: 14,
    priceKc: 0,
    startDate: today,
    endDate: today,
  };
}

export function useDashboardStats() {
  const campaigns = useScopedCampaigns();
  const store = useAdsStore();
  const { role, advertiserId } = useAdsDemoSession();
  return useCallback(() => {
    const stats = summarizeCampaigns(campaigns);
    const id = advertiserId ?? DEMO_ADVERTISER.id;
    return {
      ...stats,
      availableBudget:
        role === "ADMIN"
          ? Object.values(store.budgets).reduce((s, n) => s + n, 0)
          : getAdvertiserBudget(id, store),
    };
  }, [campaigns, store, role, advertiserId])();
}

export function useAdminAdsStats() {
  const store = useAdsStore();
  return useMemo(() => {
    const stats = summarizeCampaigns(store.campaigns);
    return {
      advertiserCount: store.advertisers.length,
      ...stats,
    };
  }, [store]);
}

export {
  DEMO_ADVERTISER,
  advertiserDisplayName,
};
