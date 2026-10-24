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

export function ListingsPreview({
  device,
  pickMode,
  selected,
  catalogById,
  campaign,
  onSelect,
}: Props) {
  const top = catalogById.get("listing_top");
  const inline = catalogById.get("listing_inline");
  const cols = device === "mobile" ? 1 : 2;
  const cars = PREVIEW_CARS;

  const showInlineCreative =
    !pickMode && campaign?.placement === "listing_inline";
  const showTopCreative = !pickMode && campaign?.placement === "listing_top";

  return (
    <div className="bg-[#f7f3ea]" data-preview-page="listings">
      <PreviewHeader device={device} />
      <div className="border-b bg-white px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground">890 inzerátů</span>
          <div className="h-8 w-36 rounded-lg border bg-[#f7f3ea]" />
        </div>
      </div>

      <div
        className={`gap-3 px-3 py-3 sm:px-4 ${
          device === "desktop" ? "flex" : "block"
        }`}
      >
        {device === "desktop" ? (
          <aside className="w-44 shrink-0 space-y-2 rounded-xl border bg-white p-3">
            <p className="text-xs font-semibold">Filtry</p>
            {["Značka", "Cena", "Rok", "Palivo", "Kraj"].map((f) => (
              <div key={f} className="h-7 rounded-md border bg-[#f7f3ea]" />
            ))}
          </aside>
        ) : null}

        <div className="min-w-0 flex-1 space-y-3">
          {top ? (
            <PlacementZone
              placement={top}
              selected={selected === "listing_top"}
              pickMode={pickMode}
              onSelect={onSelect}
            >
              {showTopCreative ? (
                <AdCreative
                  campaign={campaign!}
                  placement="listing_top"
                  preview
                />
              ) : null}
            </PlacementZone>
          ) : null}

          <div
            className="grid gap-3"
            style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
          >
            {cars.flatMap((car, index) => {
              const card = <PreviewCarCard key={car.id} car={car} />;
              if (index === 1 && inline) {
                return [
                  card,
                  <PlacementZone
                    key="zone-inline"
                    placement={inline}
                    selected={selected === "listing_inline"}
                    pickMode={pickMode}
                    onSelect={onSelect}
                    className="h-full"
                  >
                    {showInlineCreative ? (
                      <AdCreative
                        campaign={campaign!}
                        placement="listing_inline"
                        preview
                        className="h-full"
                      />
                    ) : null}
                  </PlacementZone>,
                ];
              }
              return [card];
            })}
          </div>
        </div>
      </div>
      <PreviewFooter />
    </div>
  );
}
