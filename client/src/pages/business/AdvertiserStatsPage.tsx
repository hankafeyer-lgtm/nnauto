"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BusinessAdsShell, formatCzk } from "./BusinessAdsShell";
import { calcCtr, getPlacementMeta } from "@/lib/ads";
import { fetchMyCampaigns } from "@/lib/ads/api";
import type { AdCampaign } from "@/lib/ads";
import { Eye, MousePointerClick, Percent, Coins } from "lucide-react";

export default function AdvertiserStatsPage() {
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchMyCampaigns()
      .then((list) => {
        if (!cancelled) setCampaigns(list);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(() => {
    const impressions = campaigns.reduce((s, c) => s + c.impressions, 0);
    const clicks = campaigns.reduce((s, c) => s + c.clicks, 0);
    return {
      impressions,
      clicks,
      ctr: impressions > 0 ? calcCtr(impressions, clicks) : null,
      spend: campaigns.reduce((s, c) => s + (c.spend || 0), 0),
      hasData: impressions > 0 || clicks > 0,
    };
  }, [campaigns]);

  return (
    <BusinessAdsShell title="Statistiky">
      {loading ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          Načítám…
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <MetricCard
              label="Zobrazení"
              value={
                stats.hasData
                  ? stats.impressions.toLocaleString("cs-CZ")
                  : "Nejsou data"
              }
              Icon={Eye}
            />
            <MetricCard
              label="Kliknutí"
              value={
                stats.hasData
                  ? stats.clicks.toLocaleString("cs-CZ")
                  : "Nejsou data"
              }
              Icon={MousePointerClick}
            />
            <MetricCard
              label="CTR"
              value={
                stats.ctr != null ? `${stats.ctr.toFixed(2)} %` : "Nejsou data"
              }
              Icon={Percent}
            />
            <MetricCard
              label="Utraceno"
              value={stats.spend > 0 ? formatCzk(stats.spend) : "—"}
              Icon={Coins}
            />
          </div>

          <Card className="mt-8 rounded-2xl border bg-white/90">
            <CardHeader>
              <CardTitle className="text-lg">Podle kampaní</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {campaigns.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Zatím žádná data.
                </p>
              ) : (
                campaigns.map((c) => (
                  <div
                    key={c.id}
                    className="flex flex-col gap-2 rounded-xl border bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="font-medium">{c.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {getPlacementMeta(c.placement)?.shortLabel ??
                          c.placement}
                      </p>
                    </div>
                    <div className="grid grid-cols-4 gap-3 text-center text-xs sm:text-sm">
                      <Cell
                        label="Zobr."
                        value={
                          c.impressions > 0
                            ? c.impressions.toLocaleString("cs-CZ")
                            : "—"
                        }
                      />
                      <Cell
                        label="Klik."
                        value={
                          c.clicks > 0
                            ? c.clicks.toLocaleString("cs-CZ")
                            : "—"
                        }
                      />
                      <Cell
                        label="CTR"
                        value={
                          c.impressions > 0
                            ? `${calcCtr(c.impressions, c.clicks).toFixed(2)} %`
                            : "Nejsou data"
                        }
                      />
                      <Cell
                        label="Cena"
                        value={formatCzk(c.priceKc || c.totalBudget)}
                      />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </>
      )}
    </BusinessAdsShell>
  );
}

function MetricCard({
  label,
  value,
  Icon,
}: {
  label: string;
  value: string;
  Icon: typeof Eye;
}) {
  return (
    <Card className="rounded-2xl border bg-white/90 shadow-sm">
      <CardContent className="flex items-start gap-3 p-4">
        <div className="rounded-xl bg-[#B8860B]/10 p-2.5 text-[#B8860B]">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="mt-0.5 text-lg font-semibold tabular-nums">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="font-semibold tabular-nums">{value}</p>
    </div>
  );
}
