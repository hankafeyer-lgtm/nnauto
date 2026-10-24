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

export function HomepagePreview({
  device,
  pickMode,
  selected,
  catalogById,
  campaign,
  onSelect,
}: Props) {
  const top = catalogById.get("homepage_top");
  const featured = catalogById.get("featured_top");
  const cols = device === "mobile" ? 1 : device === "tablet" ? 2 : 3;
  const cars = PREVIEW_CARS.slice(0, device === "mobile" ? 4 : 6);

  return (
    <div className="bg-[#f7f3ea]" data-preview-page="homepage">
      <PreviewHeader device={device} />

      {/* Hero / search — mirrors homepage structure */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1400&q=60)",
          }}
        />
        <div className="relative px-3 py-6 sm:px-4 sm:py-8">
          <div className="rounded-2xl border bg-white/95 p-3 shadow-sm sm:p-4">
            <p className="mb-2 text-xs font-semibold text-[#B8860B]">
              Přidejte inzerát během 1 minuty
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {["Nové", "Ojeté", "Motorky", "Auta z Německa"].map((label, i) => (
                <div
                  key={label}
                  className={`rounded-xl border px-2 py-3 text-center text-xs font-medium ${
                    i === 1
                      ? "border-[#B8860B] bg-[#B8860B]/10 text-[#8a6508]"
                      : "bg-white"
                  }`}
                >
                  {label}
                </div>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <div className="h-9 flex-1 rounded-lg border bg-[#f7f3ea]" />
              <div className="h-9 w-24 rounded-lg bg-[#B8860B]" />
            </div>
          </div>
        </div>
      </section>

      <div className="space-y-4 px-3 pb-4 sm:px-4">
        {top ? (
          <PlacementZone
            placement={top}
            selected={selected === "homepage_top"}
            pickMode={pickMode}
            onSelect={onSelect}
          >
            {campaign?.placement === "homepage_top" ? (
              <AdCreative
                campaign={campaign}
                placement="homepage_top"
                preview
              />
            ) : null}
          </PlacementZone>
        ) : null}

        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold tracking-tight sm:text-xl">
            Doporučené automobily
          </h2>
          <span className="text-xs text-muted-foreground">Zobrazit vše</span>
        </div>

        {featured ? (
          <PlacementZone
            placement={featured}
            selected={selected === "featured_top"}
            pickMode={pickMode}
            onSelect={onSelect}
            compact
          >
            {campaign?.placement === "featured_top" ? (
              <AdCreative
                campaign={campaign}
                placement="featured_top"
                preview
              />
            ) : null}
          </PlacementZone>
        ) : null}

        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
          {cars.map((car) => (
            <PreviewCarCard key={car.id} car={car} />
          ))}
        </div>
      </div>

      <PreviewFooter />
    </div>
  );
}
