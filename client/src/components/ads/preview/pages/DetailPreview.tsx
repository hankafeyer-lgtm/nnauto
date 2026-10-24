"use client";

import type { AdCampaign, AdPlacementId } from "@/lib/ads/types";
import type { AdPlacementCatalogItem } from "@shared/adCatalog";
import { AdCreative } from "@/components/ads/AdCreative";
import { PlacementZone } from "../PlacementZone";
import { PreviewFooter, PreviewHeader } from "../PreviewChrome";
import {
  formatPreviewCzk,
  PREVIEW_CARS,
  type PreviewDevice,
} from "../preview-types";

type Props = {
  device: PreviewDevice;
  pickMode: boolean;
  selected: AdPlacementId | null;
  catalogById: Map<AdPlacementId, AdPlacementCatalogItem>;
  campaign: AdCampaign | null;
  onSelect: (id: AdPlacementId) => void;
};

export function DetailPreview({
  device,
  pickMode,
  selected,
  catalogById,
  campaign,
  onSelect,
}: Props) {
  const slot = catalogById.get("vehicle_detail_sidebar");
  const car = PREVIEW_CARS[0];
  const desktop = device === "desktop";

  const adBlock =
    slot ? (
      <PlacementZone
        placement={slot}
        selected={selected === "vehicle_detail_sidebar"}
        pickMode={pickMode}
        onSelect={onSelect}
      >
        {!pickMode && campaign?.placement === "vehicle_detail_sidebar" ? (
          <AdCreative
            campaign={campaign}
            placement="vehicle_detail_sidebar"
            preview
          />
        ) : null}
      </PlacementZone>
    ) : null;

  return (
    <div className="bg-[#f7f3ea]" data-preview-page="detail">
      <PreviewHeader device={device} />
      <div className="px-3 py-3 sm:px-4">
        <div
          className={
            desktop ? "grid grid-cols-[minmax(0,1fr)_240px] gap-4" : "space-y-4"
          }
        >
          <div className="space-y-3">
            <div className="overflow-hidden rounded-2xl border bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={car.image}
                alt=""
                className="aspect-[3/2] w-full object-cover"
              />
            </div>
            <div className="rounded-2xl border bg-white p-4">
              <h1 className="text-lg font-semibold">
                {car.brand} {car.model} {car.year}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {car.mileage.toLocaleString("cs-CZ")} km · {car.fuel} ·{" "}
                {car.city}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Udržovaný vůz, servisní knížka, STK platná. Ideální rodinný
                automobil s nízkou spotřebou.
              </p>
            </div>
            {!desktop ? adBlock : null}
          </div>

          <aside className="space-y-3">
            <div className="rounded-2xl border bg-white p-4 shadow-sm">
              <p className="text-xs text-muted-foreground">Cena</p>
              <p className="text-2xl font-bold text-[#B8860B]">
                {formatPreviewCzk(car.price)}
              </p>
              <button
                type="button"
                className="mt-3 w-full rounded-xl bg-[#B8860B] py-2.5 text-sm font-semibold text-white"
              >
                Zobrazit kontakt
              </button>
              <button
                type="button"
                className="mt-2 w-full rounded-xl border py-2.5 text-sm font-medium"
              >
                Napsat zprávu
              </button>
            </div>
            {desktop ? adBlock : null}
          </aside>
        </div>
      </div>
      <PreviewFooter />
    </div>
  );
}
