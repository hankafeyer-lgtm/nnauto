"use client";

/**
 * Thin client mount for SSR pages (prodat-auto, /auta/:brand).
 */
import { AdSlot } from "./AdSlot";
import type { AdPlacementId } from "@/lib/ads/types";

export function AdSlotMount({
  placement,
  className,
  wrapperClassName,
}: {
  placement: AdPlacementId;
  className?: string;
  wrapperClassName?: string;
}) {
  return (
    <AdSlot
      placement={placement}
      className={className}
      wrapperClassName={wrapperClassName}
    />
  );
}
