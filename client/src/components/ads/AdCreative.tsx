"use client";

import { ExternalLink } from "lucide-react";
import type { AdCampaign, AdPlacementId } from "@/lib/ads/types";
import { getPlacementMeta } from "@/lib/ads/placements";
import { cn } from "@/lib/utils";

type Props = {
  campaign: AdCampaign;
  placement?: AdPlacementId;
  onClick?: () => void;
  className?: string;
  /** Compact preview mode (wizard / admin) — no navigation */
  preview?: boolean;
};

function resolveHref(url: string): string {
  const trimmed = (url || "").trim();
  if (!trimmed) return "#";
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("/") ||
    trimmed.startsWith("mailto:") ||
    trimmed.startsWith("tel:")
  ) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

function handleAdNavigate(
  e: React.MouseEvent<HTMLAnchorElement>,
  opts: { preview: boolean; href: string; onClick?: () => void },
) {
  if (opts.preview) {
    e.preventDefault();
    return;
  }
  // Track after navigation starts so React store updates don't cancel the click
  const track = opts.onClick;
  if (track) {
    window.setTimeout(() => {
      try {
        track();
      } catch {
        /* ignore */
      }
    }, 0);
  }
}

function CtaPill({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center justify-center gap-1.5 rounded-xl bg-[#B8860B] px-4 py-2 text-sm font-medium text-white shadow",
        className,
      )}
    >
      {label}
      <ExternalLink className="h-3.5 w-3.5 opacity-90" />
    </span>
  );
}

export function AdCreative({
  campaign,
  placement,
  onClick,
  className,
  preview = false,
}: Props) {
  const place = placement ?? campaign.placement;
  const meta = getPlacementMeta(place);
  const aspect = meta?.aspect ?? "banner";
  const href = preview ? undefined : resolveHref(campaign.targetUrl);
  const cta = campaign.ctaText || "Zjistit více";

  const linkProps = {
    href: href || "#",
    target: preview ? undefined : ("_blank" as const),
    rel: preview ? undefined : "noopener noreferrer sponsored",
    onClick: (e: React.MouseEvent<HTMLAnchorElement>) =>
      handleAdNavigate(e, {
        preview,
        href: href || "#",
        onClick,
      }),
  };

  const media = (
    <>
      {campaign.videoUrl ? (
        <video
          src={campaign.videoUrl}
          poster={campaign.image || undefined}
          className="h-full w-full object-cover"
          muted
          playsInline
          loop
          autoPlay
        />
      ) : campaign.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={campaign.image}
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="flex h-full min-h-[6rem] items-center justify-center bg-muted text-sm text-muted-foreground">
          Nahrajte obrázek
        </div>
      )}
    </>
  );

  if (aspect === "sidebar") {
    return (
      <a
        {...linkProps}
        className={cn(
          "block overflow-hidden rounded-2xl border border-[#B8860B]/25 bg-white shadow-sm transition hover:border-[#B8860B]/50 hover:shadow-md",
          className,
        )}
        data-testid={`ad-creative-${place}`}
      >
        <div className="relative aspect-[4/5] bg-muted">{media}
          <span className="absolute left-2 top-2 rounded-md border border-[#B8860B]/20 bg-white/95 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#B8860B]">
            Reklama
          </span>
        </div>
        <div className="space-y-2 p-4">
          {campaign.headline ? (
            <p className="font-semibold leading-snug text-foreground">
              {campaign.headline}
            </p>
          ) : null}
          {campaign.description ? (
            <p className="line-clamp-3 text-sm text-muted-foreground">
              {campaign.description}
            </p>
          ) : null}
          <CtaPill label={cta} className="w-full justify-center" />
        </div>
      </a>
    );
  }

  if (aspect === "inline") {
    return (
      <a
        {...linkProps}
        className={cn(
          "flex h-full min-h-[280px] flex-col overflow-hidden rounded-2xl border border-[#B8860B]/25 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-[#B8860B]/45 hover:shadow-md",
          className,
        )}
        data-testid={`ad-creative-${place}`}
      >
        <div className="relative aspect-[16/10] bg-muted">
          {media}
          <span className="absolute left-2 top-2 rounded-md border border-[#B8860B]/20 bg-white/95 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#B8860B]">
            Reklama
          </span>
        </div>
        <div className="flex flex-1 flex-col gap-2 p-4">
          {campaign.headline ? (
            <p className="font-semibold leading-snug">{campaign.headline}</p>
          ) : null}
          {campaign.description ? (
            <p className="line-clamp-2 flex-1 text-sm text-muted-foreground">
              {campaign.description}
            </p>
          ) : null}
          <CtaPill label={cta} className="w-full justify-center" />
        </div>
      </a>
    );
  }

  if (aspect === "featured") {
    return (
      <a
        {...linkProps}
        className={cn(
          "mb-6 flex flex-col overflow-hidden rounded-2xl border border-[#B8860B]/30 bg-gradient-to-r from-[#B8860B]/8 to-[#D4AF37]/10 sm:flex-row",
          className,
        )}
        data-testid={`ad-creative-${place}`}
      >
        <div className="relative h-36 w-full shrink-0 sm:h-auto sm:w-56 md:w-72">
          <div className="absolute inset-0">{media}</div>
          <span className="absolute left-2 top-2 rounded-md border border-[#B8860B]/20 bg-white/95 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#B8860B]">
            TOP · Reklama
          </span>
        </div>
        <div className="flex flex-1 flex-col justify-center gap-2 p-4 sm:p-6">
          {campaign.headline ? (
            <p className="text-lg font-semibold sm:text-xl">{campaign.headline}</p>
          ) : null}
          {campaign.description ? (
            <p className="text-sm text-muted-foreground sm:text-base">
              {campaign.description}
            </p>
          ) : null}
          <CtaPill label={cta} />
        </div>
      </a>
    );
  }

  return (
    <a
      {...linkProps}
      className={cn(
        "relative block overflow-hidden rounded-2xl border border-[#B8860B]/25 bg-white shadow-sm transition hover:border-[#B8860B]/45 hover:shadow-md",
        className,
      )}
      data-testid={`ad-creative-${place}`}
    >
      <div className="relative aspect-[21/5] min-h-[120px] w-full bg-muted sm:min-h-[140px]">
        <div className="absolute inset-0">{media}</div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/35 to-transparent" />
        <span className="absolute left-3 top-3 rounded-md border border-[#B8860B]/20 bg-white/95 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#B8860B]">
          Reklama
        </span>
        <div className="absolute inset-y-0 left-0 flex max-w-xl flex-col justify-center gap-2 p-4 sm:p-6 md:p-8">
          {campaign.headline ? (
            <p className="text-lg font-semibold text-white drop-shadow sm:text-2xl md:text-3xl">
              {campaign.headline}
            </p>
          ) : null}
          {campaign.description ? (
            <p className="hidden text-sm text-white/90 sm:line-clamp-2 sm:block md:text-base">
              {campaign.description}
            </p>
          ) : null}
          <CtaPill label={cta} />
        </div>
      </div>
    </a>
  );
}
