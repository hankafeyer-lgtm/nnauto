/**
 * Live ad constructor preview — parent (wizard) writes state to sessionStorage;
 * AdSlot inside an iframe reads it and renders the draft (or pick zones).
 */

import type { AdPlacementId } from "@shared/adCatalog";

const FLAG_KEY = "nn_ad_live_preview";
const STATE_KEY = "nn_ad_live_preview_state";
export const AD_PREVIEW_MSG = "nn-ad-preview";
export const AD_PREVIEW_PICK_MSG = "nn-ad-pick";

export type LivePreviewCreative = {
  headline: string;
  description: string;
  image: string;
  videoUrl: string;
  ctaText: string;
  targetUrl: string;
};

export type LivePreviewState = {
  pickMode: boolean;
  placement: AdPlacementId | null;
  creative: LivePreviewCreative;
  updatedAt: number;
};

export function activateLivePreview(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(FLAG_KEY, "1");
  } catch {
    /* ignore */
  }
}

export function deactivateLivePreview(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(FLAG_KEY);
    sessionStorage.removeItem(STATE_KEY);
  } catch {
    /* ignore */
  }
}

export function writeLivePreviewState(state: LivePreviewState): void {
  if (typeof window === "undefined") return;
  try {
    activateLivePreview();
    sessionStorage.setItem(STATE_KEY, JSON.stringify(state));
    window.dispatchEvent(new Event(AD_PREVIEW_MSG));
    // Notify iframes (same origin)
    document.querySelectorAll("iframe[data-nn-ad-preview]").forEach((el) => {
      const win = (el as HTMLIFrameElement).contentWindow;
      win?.postMessage({ type: AD_PREVIEW_MSG, state }, window.location.origin);
    });
  } catch {
    /* ignore */
  }
}

export function readLivePreviewState(): LivePreviewState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STATE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as LivePreviewState;
  } catch {
    return null;
  }
}

/** True in constructor iframe or when opened via ?nn_ad_preview=1. */
export function isLiveAdPreviewActive(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (sessionStorage.getItem(FLAG_KEY) !== "1") return false;
    const q =
      new URLSearchParams(window.location.search).get("nn_ad_preview") === "1";
    const inIframe = window.self !== window.top;
    return q || inIframe;
  } catch {
    return false;
  }
}

export function previewPathForPage(
  page: string,
  sampleListingId?: string | null,
): string {
  const q = "nn_ad_preview=1";
  switch (page) {
    case "listings":
      return `/listings?${q}`;
    case "detail":
      return sampleListingId
        ? `/listing/${sampleListingId}?${q}`
        : `/listings?${q}`;
    case "brand":
      return `/auta/skoda?${q}`;
    case "sell":
      return `/prodat-auto?${q}`;
    case "homepage":
    default:
      return `/?${q}`;
  }
}
