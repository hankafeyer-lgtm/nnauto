"use client";

import type { AdCampaign, AdPlacementId } from "@/lib/ads/types";
import type { AdPlacementCatalogItem } from "@shared/adCatalog";
import { AdCreative } from "@/components/ads/AdCreative";
import { PlacementZone } from "../PlacementZone";
import { PreviewFooter, PreviewHeader } from "../PreviewChrome";
import type { PreviewDevice } from "../preview-types";

type Props = {
  device: PreviewDevice;
  pickMode: boolean;
  selected: AdPlacementId | null;
  catalogById: Map<AdPlacementId, AdPlacementCatalogItem>;
  campaign: AdCampaign | null;
  onSelect: (id: AdPlacementId) => void;
};

export function SellPreview({
  device: _device,
  pickMode,
  selected,
  catalogById,
  campaign,
  onSelect,
}: Props) {
  const slot = catalogById.get("sell_car");

  return (
    <div className="bg-[#f7f3ea]" data-preview-page="sell">
      <PreviewHeader device={_device} />
      <div className="mx-auto max-w-2xl space-y-4 px-3 py-6 sm:px-4">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Prodat auto rychle a jednoduše
        </h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Vložte inzerát na NNAuto.cz za 69 Kč a oslovte tisíce kupujících.
          Bez provize — cenu i podmínky určujete vy.
        </p>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-md bg-[#B8860B] px-4 py-2.5 text-sm font-semibold text-white">
            Přidat inzerát
          </span>
          <span className="rounded-md border bg-white px-4 py-2.5 text-sm font-medium">
            Ceník inzerce
          </span>
        </div>

        {slot ? (
          <PlacementZone
            placement={slot}
            selected={selected === "sell_car"}
            pickMode={pickMode}
            onSelect={onSelect}
          >
            {!pickMode && campaign?.placement === "sell_car" ? (
              <AdCreative campaign={campaign} placement="sell_car" preview />
            ) : null}
          </PlacementZone>
        ) : null}

        <section className="rounded-2xl border bg-white p-4">
          <h2 className="text-base font-semibold">Jak to funguje</h2>
          <ol className="mt-2 list-decimal space-y-1 pl-4 text-sm text-muted-foreground">
            <li>Vytvořte inzerát s fotkami</li>
            <li>Zveřejněte nabídku</li>
            <li>Komunikujte se zájemci přímo</li>
          </ol>
        </section>
      </div>
      <PreviewFooter />
    </div>
  );
}
