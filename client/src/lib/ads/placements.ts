/**
 * Client placement catalog — re-exports shared ad catalog + legacy helpers.
 */
export {
  AD_PLACEMENT_CATALOG,
  AD_DURATION_DAYS,
  AD_ROTATION_COPY,
  getAdPlacement,
  getAdPriceKc,
  addDaysIso,
  type AdPlacementId,
  type AdDurationDays,
  type AdPlacementCatalogItem,
} from "@shared/adCatalog";

import {
  AD_PLACEMENT_CATALOG,
  type AdPlacementId,
  type AdPlacementCatalogItem,
} from "@shared/adCatalog";

/** @deprecated Prefer AD_PLACEMENT_CATALOG — kept for existing imports. */
export type PlacementMeta = {
  id: AdPlacementId;
  label: string;
  shortLabel: string;
  description: string;
  previewHint: string;
  aspect: AdPlacementCatalogItem["aspect"];
};

export const AD_PLACEMENTS: PlacementMeta[] = AD_PLACEMENT_CATALOG.map((p) => ({
  id: p.id,
  label: p.label,
  shortLabel: p.shortLabel,
  description: p.description,
  previewHint: `${p.desktopSize} · ${p.mobileSize} · od ${p.pricesKc[7]} Kč / 7 dní`,
  aspect: p.aspect,
}));

export function getPlacementMeta(
  id: AdPlacementId,
): PlacementMeta | undefined {
  return AD_PLACEMENTS.find((p) => p.id === id);
}
