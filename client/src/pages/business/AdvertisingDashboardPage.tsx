"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Eye,
  MousePointerClick,
  Percent,
  Wallet,
  Coins,
  Activity,
} from "lucide-react";
import {
  BusinessAdsShell,
  StatusBadge,
  formatCzk,
} from "./BusinessAdsShell";
import { calcCtr, getPlacementMeta } from "@/lib/ads";
import { fetchMyCampaigns } from "@/lib/ads/api";
import type { AdCampaign } from "@/lib/ads";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/lib/navigation";

function StatCard({
  label,
  value,
  Icon,
}: {
  label: string;
  value: string;
  Icon: typeof Eye;
}) {
  return (
    <Card className="rounded-xl border bg-white/90 shadow-sm">
      <CardContent className="flex items-start gap-2 p-3 sm:gap-2.5 sm:p-3.5">
        <div className="rounded-lg bg-[#B8860B]/10 p-1.5 text-[#B8860B] sm:p-2">
          <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] text-muted-foreground sm:text-[11px]">
            {label}
          </p>
          <p className="mt-0.5 text-base font-semibold tabular-nums truncate sm:text-lg">
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="font-semibold tabular-nums text-xs sm:text-sm">{value}</p>
    </div>
  );
}

/** User-facing overview: totals + per-campaign performance (no admin actions). */
export default function AdvertisingDashboardPage() {
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
    const spend = campaigns.reduce((s, c) => s + (c.spend || 0), 0);
    const activeCount = campaigns.filter((c) => c.status === "active").length;
    const waiting = campaigns.filter(
      (c) =>
        c.status === "pending_approval" ||
        c.status === "pending_review" ||
        c.status === "pending_payment",
    ).length;
    const budget = campaigns
      .filter((c) => c.status === "active" || c.status === "scheduled")
      .reduce((s, c) => s + (c.priceKc || c.totalBudget || 0), 0);
    return {
      impressions,
      clicks,
      ctr: impressions > 0 ? calcCtr(impressions, clicks) : 0,
      spend,
      activeCount,
      waiting,
      budget,
      hasData: impressions > 0 || clicks > 0,
    };
  }, [campaigns]);

  return (
    <BusinessAdsShell title="Přehled">
      {loading ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          Načítám…
        </p>
      ) : (
        <>
          {stats.waiting > 0 ? (
            <p className="mb-3 rounded-xl border border-violet-200 bg-violet-50 px-3 py-2.5 text-xs text-violet-900 sm:text-sm">
              {stats.waiting}{" "}
              {stats.waiting === 1 ? "kampaň čeká" : "kampaně čekají"} na
              schválení nebo platbu.{" "}
              <Link
                href="/business/advertising/campaigns"
                scroll
                className="font-semibold underline-offset-2 hover:underline"
              >
                Zobrazit
              </Link>
            </p>
          ) : null}

          <div className="grid grid-cols-2 gap-2 sm:gap-2.5 lg:grid-cols-3 xl:grid-cols-6">
            <StatCard
              label="Aktivní"
              value={String(stats.activeCount)}
              Icon={Activity}
            />
            <StatCard
              label="Zobrazení"
              value={
                stats.hasData
                  ? stats.impressions.toLocaleString("cs-CZ")
                  : "—"
              }
              Icon={Eye}
            />
            <StatCard
              label="Kliknutí"
              value={
                stats.hasData ? stats.clicks.toLocaleString("cs-CZ") : "—"
              }
              Icon={MousePointerClick}
            />
            <StatCard
              label="CTR"
              value={stats.hasData ? `${stats.ctr.toFixed(2)} %` : "—"}
              Icon={Percent}
            />
            <StatCard
              label="Utraceno"
              value={stats.spend > 0 ? formatCzk(stats.spend) : "—"}
              Icon={Coins}
            />
            <StatCard
              label="Rozpočet"
              value={stats.budget > 0 ? formatCzk(stats.budget) : "—"}
              Icon={Wallet}
            />
          </div>

          <Card className="mt-4 rounded-xl border bg-white/90 sm:mt-6">
            <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0 px-3 pb-2 pt-3 sm:px-4 sm:pb-3 sm:pt-4">
              <CardTitle className="text-sm font-semibold sm:text-base">
                Podle kampaní
              </CardTitle>
              <Link
                href="/business/advertising/campaigns"
                scroll
                className="text-sm font-medium text-[#B8860B] hover:underline"
              >
                Spravovat
              </Link>
            </CardHeader>
            <CardContent className="space-y-2 px-3 pb-3 sm:px-4 sm:pb-4">
              {campaigns.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Zatím žádná data.{" "}
                  <Link
                    href="/business/advertising/create"
                    scroll
                    className="font-medium text-[#B8860B] hover:underline"
                  >
                    Vytvořit kampaň
                  </Link>
                </p>
              ) : (
                campaigns.map((c) => (
                  <div
                    key={c.id}
                    className="rounded-xl border border-neutral-100 bg-neutral-50/60 p-3 sm:p-3.5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium text-neutral-900 text-sm sm:text-base">
                          {c.name}
                        </p>
                        <p className="mt-0.5 text-[11px] text-neutral-500 sm:text-xs">
                          {getPlacementMeta(c.placement)?.shortLabel ??
                            getPlacementMeta(c.placement)?.label ??
                            c.placement}
                          {" · "}
                          {c.startDate} → {c.endDate}
                        </p>
                      </div>
                      <StatusBadge status={c.status} />
                    </div>
                    <div className="mt-2.5 grid grid-cols-4 gap-2 text-center sm:gap-3">
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
                            : "—"
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
