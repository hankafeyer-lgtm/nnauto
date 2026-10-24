"use client";

import { useEffect, useRef, useState } from "react";
import type { AdCampaign, AdPlacementId } from "@/lib/ads/types";
import {
  creativeToCampaign,
  fetchServeCreative,
  trackServeEvent,
  type ServeCreative,
} from "@/lib/ads/api";
import { getAdPlacement } from "@/lib/ads/placements";
import {
  AD_PREVIEW_MSG,
  AD_PREVIEW_PICK_MSG,
  isLiveAdPreviewActive,
  readLivePreviewState,
  type LivePreviewState,
} from "@/lib/ads/preview-bridge";
import { AdCreative } from "./AdCreative";
import { PlacementZone } from "./preview/PlacementZone";
import { cn } from "@/lib/utils";

type Props = {
  placement: AdPlacementId;
  className?: string;
  /** Extra wrapper classes when ad is shown (e.g. container padding) */
  wrapperClassName?: string;
};

function LivePreviewCreativeMount({
  placement,
  campaign,
  className,
  wrapperClassName,
}: {
  placement: AdPlacementId;
  campaign: AdCampaign;
  className?: string;
  wrapperClassName?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const t = window.setTimeout(() => {
      ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 350);
    return () => window.clearTimeout(t);
  }, [placement, campaign.headline, campaign.image, campaign.videoUrl]);

  return (
    <div
      ref={ref}
      className={cn(wrapperClassName)}
      data-ad-placement={placement}
      data-ad-preview="1"
    >
      <AdCreative
        campaign={campaign}
        placement={placement}
        className={className}
        preview
      />
    </div>
  );
}

function useLivePreviewState(): LivePreviewState | null {
  const [state, setState] = useState<LivePreviewState | null>(() =>
    isLiveAdPreviewActive() ? readLivePreviewState() : null,
  );

  useEffect(() => {
    if (!isLiveAdPreviewActive()) {
      setState(null);
      return;
    }
    const sync = () => setState(readLivePreviewState());
    sync();
    window.addEventListener(AD_PREVIEW_MSG, sync);
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      if (e.data?.type === AD_PREVIEW_MSG) sync();
    };
    window.addEventListener("message", onMessage);
    return () => {
      window.removeEventListener(AD_PREVIEW_MSG, sync);
      window.removeEventListener("message", onMessage);
    };
  }, []);

  return isLiveAdPreviewActive() ? state : null;
}

/**
 * Fetches a live campaign from /api/ads/serve.
 * In constructor live-preview iframe, shows draft creative or pick zones.
 * Renders nothing when there is no eligible campaign (production).
 */
export function AdSlot({ placement, className, wrapperClassName }: Props) {
  const preview = useLivePreviewState();
  const [creative, setCreative] = useState<ServeCreative | null>(null);
  const tracked = useRef<string | null>(null);

  useEffect(() => {
    if (preview) return;
    let cancelled = false;
    fetchServeCreative(placement).then((c) => {
      if (!cancelled) setCreative(c);
    });
    return () => {
      cancelled = true;
    };
  }, [placement, preview]);

  useEffect(() => {
    if (preview || !creative) return;
    if (tracked.current === creative.id) return;
    tracked.current = creative.id;
    void trackServeEvent(creative.id, "impression", placement);
  }, [creative, placement, preview]);

  // —— Constructor live preview ——
  if (preview) {
    const meta = getAdPlacement(placement);
    if (!meta) return null;

    if (preview.pickMode) {
      return (
        <div className={cn(wrapperClassName)} data-ad-preview-zone={placement}>
          <PlacementZone
            placement={meta}
            selected={preview.placement === placement}
            pickMode
            onSelect={(id) => {
              try {
                window.parent.postMessage(
                  { type: AD_PREVIEW_PICK_MSG, placement: id },
                  window.location.origin,
                );
              } catch {
                /* ignore */
              }
            }}
          />
        </div>
      );
    }

    if (preview.placement !== placement) return null;

    const c = preview.creative;
    const hasMedia = Boolean(c.image || c.videoUrl);
    if (!hasMedia && !c.headline) return null;

    const campaign = {
      id: "preview",
      advertiserId: "preview",
      name: "Náhled",
      status: "active" as const,
      placement,
      headline: c.headline,
      description: c.description,
      image: c.image,
      videoUrl: c.videoUrl,
      ctaText: c.ctaText || "Zjistit více",
      targetUrl: c.targetUrl || "#",
      dailyBudget: 0,
      totalBudget: 0,
      durationDays: 7 as const,
      priceKc: 0,
      startDate: "",
      endDate: "",
      impressions: 0,
      clicks: 0,
      spend: 0,
      createdAt: "",
      updatedAt: "",
    };

    return (
      <LivePreviewCreativeMount
        wrapperClassName={wrapperClassName}
        placement={placement}
        className={className}
        campaign={campaign}
      />
    );
  }

  // —— Production serve ——
  if (!creative) return null;

  const campaign = creativeToCampaign(creative);

  return (
    <div
      className={cn(wrapperClassName)}
      data-ad-placement={placement}
      data-ad-campaign={creative.id}
    >
      <AdCreative
        campaign={campaign}
        placement={placement}
        className={className}
        onClick={() => {
          void trackServeEvent(creative.id, "click", placement);
        }}
      />
    </div>
  );
}
