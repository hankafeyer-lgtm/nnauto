"use client";

import type { AdPlacementCatalogItem, AdPlacementId } from "@shared/adCatalog";
import { cn } from "@/lib/utils";
import { formatCzk } from "@/pages/business/BusinessAdsShell";

type Props = {
  placement: AdPlacementCatalogItem;
  selected: boolean;
  pickMode: boolean;
  onSelect: (id: AdPlacementId) => void;
  children?: React.ReactNode;
  className?: string;
  /** Compact label for narrow slots */
  compact?: boolean;
};

/**
 * Gold outline zone used only inside the campaign constructor preview.
 * Does not affect production AdSlot rendering.
 */
export function PlacementZone({
  placement,
  selected,
  pickMode,
  onSelect,
  children,
  className,
  compact,
}: Props) {
  if (!pickMode && children) {
    return <div className={className}>{children}</div>;
  }

  if (!pickMode) return null;

  return (
    <button
      type="button"
      onClick={() => onSelect(placement.id)}
      className={cn(
        "group relative w-full overflow-hidden rounded-xl border-2 border-dashed text-left transition",
        selected
          ? "border-[#B8860B] bg-[#B8860B]/10 ring-2 ring-[#B8860B]/30"
          : "border-[#B8860B]/55 bg-[#B8860B]/5 hover:border-[#B8860B] hover:bg-[#B8860B]/10",
        className,
      )}
      data-testid={`placement-zone-${placement.id}`}
    >
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-1 px-3 py-6 text-center",
          compact ? "min-h-[88px] py-4" : "min-h-[120px]",
        )}
      >
        <span className="rounded-md bg-white/95 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#B8860B] shadow-sm">
          Dostupná pozice
        </span>
        <p className="text-sm font-semibold text-foreground">
          {placement.shortLabel}
        </p>
        {!compact ? (
          <>
            <p className="text-xs font-semibold text-[#B8860B]">
              od {formatCzk(placement.pricesKc[7])} / 7 dní
            </p>
          </>
        ) : null}
      </div>
      {selected ? (
        <span className="absolute right-2 top-2 rounded-full bg-[#B8860B] px-2 py-0.5 text-[10px] font-semibold text-white">
          Vybráno
        </span>
      ) : null}
    </button>
  );
}
