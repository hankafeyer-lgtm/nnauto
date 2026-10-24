"use client";

import type { AdCampaign, AdPlacementId } from "@/lib/ads/types";
import type { AdPlacementCatalogItem } from "@shared/adCatalog";
import { AdCreative } from "@/components/ads/AdCreative";
import { PlacementZone } from "../PlacementZone";
import { PreviewCarCard } from "../PreviewCarCard";
import { PreviewFooter, PreviewHeader } from "../PreviewChrome";
import { PREVIEW_CARS, type PreviewDevice } from "../preview-types";

type Props = {
  device: PreviewDevice;
  pickMode: boolean;
  selected: AdPlacementId | null;
  catalogById: Map<AdPlacementId, AdPlacementCatalogItem>;
  campaign: AdCampaign | null;
  onSelect: (id: AdPlacementId) => void;
};

export function BrandPreview({
  device,
  pickMode,
  selected,
  catalogById,
  campaign,
  onSelect,
}: Props) {
  const slot = catalogById.get("category_brand");
  const cols = device === "mobile" ? 1 : 2;

  return (
    <div className="bg-[#f7f3ea]" data-preview-page="brand">
      <PreviewHeader device={device} />
      <div className="space-y-4 px-3 py-4 sm:px-4">
        <div>
          <p className="text-xs text-muted-foreground">NNAuto › Auta › BMW</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">
            BMW na prodej
          </h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Aktuální nabídka ojetých vozů BMW — od soukromých prodejců i
            autobazarů.
          </p>
        </div>

        {slot ? (
          <PlacementZone
            placement={slot}
            selected={selected === "category_brand"}
            pickMode={pickMode}
            onSelect={onSelect}
          >
            {!pickMode && campaign?.placement === "category_brand" ? (
              <AdCreative
                campaign={campaign}
                placement="category_brand"
                preview
              />
            ) : null}
          </PlacementZone>
        ) : null}

        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
          {PREVIEW_CARS.filter((c) => c.brand === "BMW" || c.id === "p2")
            .concat(PREVIEW_CARS.slice(0, 3))
            .slice(0, 4)
            .map((car) => (
              <PreviewCarCard key={car.id} car={car} />
            ))}
        </div>
      </div>
      <PreviewFooter />
    </div>
  );
}
