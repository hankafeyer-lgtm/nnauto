"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { AdPlacementId, CampaignDraft } from "@/lib/ads/types";
import {
  AD_PLACEMENT_CATALOG,
  getAdPlacement,
  type AdPlacementCatalogItem,
} from "@/lib/ads/placements";
import {
  activateLivePreview,
  AD_PREVIEW_PICK_MSG,
  deactivateLivePreview,
  previewPathForPage,
  writeLivePreviewState,
} from "@/lib/ads/preview-bridge";
import { cn } from "@/lib/utils";
import { Crosshair, ExternalLink, Monitor, Smartphone, Tablet } from "lucide-react";
import {
  pageForPlacement,
  PREVIEW_PAGES,
  type PreviewDevice,
  type PreviewPageId,
} from "./preview/preview-types";

type Props = {
  draft: CampaignDraft;
  placement?: AdPlacementId | null;
  catalog?: AdPlacementCatalogItem[];
  pickMode?: boolean;
  onPickModeChange?: (v: boolean) => void;
  onSelectPlacement?: (id: AdPlacementId) => void;
  device?: PreviewDevice;
  onDeviceChange?: (d: PreviewDevice) => void;
  /** Admin review: hide placement picker, keep live site preview */
  reviewOnly?: boolean;
  className?: string;
};

/** Live NNAuto site preview — real pages in an iframe with draft injected into AdSlot. */
export function AdPreview({
  draft,
  placement,
  catalog = AD_PLACEMENT_CATALOG,
  pickMode: pickModeProp,
  onPickModeChange,
  onSelectPlacement,
  device: deviceProp,
  onDeviceChange,
  reviewOnly = false,
  className,
}: Props) {
  const [deviceLocal, setDeviceLocal] = useState<PreviewDevice>("desktop");
  const [pickLocal, setPickLocal] = useState(false);
  const [page, setPage] = useState<PreviewPageId>(() =>
    pageForPlacement(placement ?? draft.placement),
  );
  const [sampleListingId, setSampleListingId] = useState<string | null>(null);
  const [iframeKey, setIframeKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const device = deviceProp ?? deviceLocal;
  const setDevice = onDeviceChange ?? setDeviceLocal;
  const pickMode = reviewOnly ? false : (pickModeProp ?? pickLocal);
  const setPickMode = onPickModeChange ?? setPickLocal;
  const selected = placement ?? draft.placement;

  useEffect(() => {
    if (selected) setPage(pageForPlacement(selected));
  }, [selected]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/listings?limit=1", { credentials: "include" })
      .then((r) => r.json())
      .then((data: { listings?: { id?: string }[] }) => {
        const id = data?.listings?.[0]?.id;
        if (!cancelled && id) setSampleListingId(id);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    activateLivePreview();
    return () => deactivateLivePreview();
  }, []);

  useEffect(() => {
    writeLivePreviewState({
      pickMode,
      placement: selected,
      creative: {
        headline: draft.headline || "",
        description: draft.description || "",
        image: draft.image || "",
        videoUrl: draft.videoUrl || "",
        ctaText: draft.ctaText || "Zjistit více",
        targetUrl: draft.targetUrl || "#",
      },
      updatedAt: Date.now(),
    });
  }, [draft, pickMode, selected]);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      if (e.data?.type !== AD_PREVIEW_PICK_MSG) return;
      const id = e.data.placement as AdPlacementId | undefined;
      if (!id) return;
      onSelectPlacement?.(id);
      setPickMode(false);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [onSelectPlacement, setPickMode]);

  const iframeSrc = useMemo(
    () => previewPathForPage(page, sampleListingId),
    [page, sampleListingId],
  );

  // Reload iframe when page changes so we land on the right route
  useEffect(() => {
    setIframeKey((k) => k + 1);
  }, [iframeSrc]);

  const pageLabel =
    PREVIEW_PAGES.find((p) => p.id === page)?.label ?? "Hlavní stránka";
  const selectedMeta = selected ? getAdPlacement(selected) : null;
  const wired = catalog.filter((c) => c.wiredInProduct !== false);

  const frameMax =
    device === "mobile"
      ? "max-w-[390px]"
      : device === "tablet"
        ? "max-w-[768px]"
        : "max-w-none";

  const openLive = () => {
    window.open(iframeSrc, "_blank", "noopener,noreferrer");
  };

  return (
    <div className={cn("flex h-full min-h-0 flex-col gap-3", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          {(
            [
              ["desktop", Monitor, "Počítač"],
              ["tablet", Tablet, "Tablet"],
              ["mobile", Smartphone, "Mobil"],
            ] as const
          ).map(([id, Icon, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setDevice(id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition",
                device === id
                  ? "bg-[#B8860B]/15 font-semibold text-[#8a6508]"
                  : "text-slate-500 hover:bg-slate-50",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {!reviewOnly ? (
          <button
            type="button"
            onClick={() => setPickMode(!pickMode)}
            className={cn(
              "inline-flex min-h-9 items-center gap-1.5 rounded-xl border px-3 text-xs font-semibold transition",
              pickMode
                ? "border-[#B8860B] bg-[#B8860B] text-white shadow-sm"
                : "border-[#B8860B]/40 bg-white text-[#8a6508] hover:bg-[#B8860B]/10",
            )}
          >
            <Crosshair className="h-3.5 w-3.5" />
            {pickMode ? "Hotovo" : "Vybrat místo"}
          </button>
        ) : (
          <span className="inline-flex min-h-9 items-center rounded-xl border border-[#B8860B]/25 bg-[#B8860B]/10 px-3 text-xs font-semibold text-[#8a6508]">
            Admin náhled
          </span>
        )}

        <button
          type="button"
          onClick={openLive}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 hover:border-[#B8860B]/40 hover:text-[#8a6508]"
          title="Otevřít stejný náhled v novém okně"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Nové okno</span>
        </button>
      </div>

      <div className="flex gap-1 overflow-x-auto pb-1">
        {PREVIEW_PAGES.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPage(p.id)}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition",
              page === p.id
                ? "border-[#B8860B] bg-[#B8860B]/10 font-semibold text-[#8a6508]"
                : "border-slate-200 bg-white text-slate-500 hover:border-[#B8860B]/40",
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-slate-500">
          <span className="font-medium text-emerald-700">Živý náhled</span>
          {" · "}
          {pageLabel}
          {selectedMeta ? (
            <>
              {" · "}
              <span className="font-medium text-[#8a6508]">
                {selectedMeta.shortLabel}
              </span>
            </>
          ) : null}
          {pickMode ? (
            <span className="text-sky-700">
              {" — "}klikněte na zlatou zónu na stránce
            </span>
          ) : null}
        </p>
        <p className="text-[10px] text-slate-400">
          {wired.length} pozic · skutečný web NNAuto
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden rounded-2xl border border-black/10 bg-gradient-to-b from-slate-200/80 to-[#ebe6dc] p-2 shadow-inner sm:p-3">
        <div
          className={cn(
            "mx-auto h-full min-h-[420px] overflow-hidden rounded-xl border border-black/10 bg-white shadow-lg transition-[max-width] duration-300",
            frameMax,
          )}
        >
          <iframe
            key={iframeKey}
            ref={iframeRef}
            data-nn-ad-preview
            title="Živý náhled NNAuto"
            src={iframeSrc}
            className="h-full min-h-[420px] w-full border-0 bg-white"
            // Same-origin scripts needed for AdSlot preview bridge
          />
        </div>
      </div>
    </div>
  );
}
