"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Pause, Play, Pencil, Plus } from "lucide-react";
import { calcCtr, getPlacementMeta } from "@/lib/ads";
import {
  adminSetStatus,
  fetchMyCampaigns,
  localDemoPay,
} from "@/lib/ads/api";
import { AdCreative } from "@/components/ads/AdCreative";
import {
  BusinessAdsShell,
  StatusBadge,
  formatCzk,
  PrimaryCta,
} from "./BusinessAdsShell";
import { useToast } from "@/hooks/use-toast";
import { Link } from "@/lib/navigation";
import type { AdCampaign } from "@/lib/ads";
import { cn } from "@/lib/utils";

type Filter = "all" | "active" | "waiting" | "paused" | "other";

function matchesFilter(c: AdCampaign, f: Filter) {
  if (f === "all") return true;
  if (f === "active") return c.status === "active";
  if (f === "paused") return c.status === "paused";
  if (f === "waiting") {
    return (
      c.status === "pending_approval" ||
      c.status === "pending_review" ||
      c.status === "pending_payment" ||
      c.status === "draft"
    );
  }
  return (
    c.status === "rejected" ||
    c.status === "completed" ||
    c.status === "scheduled" ||
    c.status === "approved"
  );
}

export default function MyCampaignsPage() {
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setCampaigns(await fetchMyCampaigns());
    } catch (e) {
      toast({
        title: "Nepodařilo se načíst kampaně",
        description:
          e instanceof Error ? e.message : "Přihlaste se a zkuste znovu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(
    () => campaigns.filter((c) => matchesFilter(c, filter)),
    [campaigns, filter],
  );

  const toggle = async (id: string, status: string) => {
    try {
      if (
        status === "active" ||
        status === "scheduled" ||
        status === "approved"
      ) {
        await adminSetStatus(id, "paused");
        toast({
          title: "Kampaň pozastavena",
          description: "Reklama zmizí ze stránky, dokud ji znovu neaktivujete.",
        });
      } else if (status === "paused") {
        await adminSetStatus(id, "active");
        toast({
          title: "Kampaň aktivována",
          description: "Zobrazí se, pokud je schválená a v období.",
        });
      }
      await load();
    } catch (e) {
      toast({
        title: "Nelze změnit status",
        description: e instanceof Error ? e.message : "Chyba",
        variant: "destructive",
      });
    }
  };

  const demoPay = async (id: string) => {
    try {
      const res = await localDemoPay(id);
      toast({ title: "LOCAL DEMO", description: res.notice });
      await load();
    } catch (e) {
      toast({
        title: "Demo platba selhala",
        description: e instanceof Error ? e.message : "Chyba",
        variant: "destructive",
      });
    }
  };

  return (
    <BusinessAdsShell
      title="Kampaně"
      actions={
        <PrimaryCta
          href="/business/advertising/create"
          className="hidden h-9 sm:inline-flex"
        >
          <Plus className="mr-1 h-4 w-4" />
          Nová
        </PrimaryCta>
      }
    >
      {!loading && campaigns.length > 0 ? (
        <div className="mb-3 flex gap-1 overflow-x-auto pb-0.5 sm:mb-4">
          {(
            [
              ["all", "Vše"],
              ["waiting", "Čeká"],
              ["active", "Aktivní"],
              ["paused", "Pauza"],
              ["other", "Ostatní"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition",
                filter === id
                  ? "border-[#B8860B]/40 bg-[#B8860B]/10 text-[#8a6508]"
                  : "border-neutral-200 bg-white text-neutral-500",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      ) : null}

      {loading ? (
        <p className="py-16 text-center text-sm text-muted-foreground">
          Načítám kampaně…
        </p>
      ) : campaigns.length === 0 ? (
        <Card className="rounded-2xl border-dashed">
          <CardContent className="py-12 text-center text-muted-foreground sm:py-14">
            <p className="text-sm">Zatím žádné kampaně.</p>
            <Button
              asChild
              className="mt-4 hidden h-11 rounded-xl bg-[#B8860B] text-white hover:bg-[#9a7209] sm:inline-flex"
            >
              <Link href="/business/advertising/create" scroll>
                <Plus className="mr-1.5 h-4 w-4" />
                Vytvořit první
              </Link>
            </Button>
            <p className="mt-3 text-xs text-neutral-400 sm:hidden">
              Začněte tlačítkem níže.
            </p>
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          Nic v tomto filtru.
        </p>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {filtered.map((c) => (
            <Card
              key={c.id}
              className="overflow-hidden rounded-2xl border bg-white/90 shadow-sm"
              data-testid={`campaign-card-${c.id}`}
            >
              <CardContent className="space-y-3 p-3.5 sm:grid sm:gap-4 sm:space-y-0 sm:p-5 lg:grid-cols-[200px_minmax(0,1fr)_auto]">
                <div className="pointer-events-none mx-auto w-full max-w-[280px] sm:mx-0 sm:max-w-[200px]">
                  <AdCreative campaign={c} preview />
                </div>

                <div className="min-w-0 space-y-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-semibold sm:text-lg">
                      {c.name}
                    </h2>
                    <StatusBadge status={c.status} />
                  </div>
                  {c.headline ? (
                    <p className="line-clamp-2 text-sm text-neutral-700">
                      {c.headline}
                    </p>
                  ) : null}
                  <p className="text-xs text-muted-foreground sm:text-sm">
                    {getPlacementMeta(c.placement)?.label}
                  </p>
                  <p className="text-[11px] text-muted-foreground sm:text-xs">
                    {c.startDate} → {c.endDate} ·{" "}
                    {formatCzk(c.priceKc || c.totalBudget)}
                    {c.spend > 0 ? ` · utraceno ${formatCzk(c.spend)}` : ""}
                  </p>
                  {c.targetUrl ? (
                    <p className="truncate text-[11px] text-neutral-400">
                      {c.targetUrl}
                    </p>
                  ) : null}
                  {c.rejectionReason ? (
                    <p className="rounded-lg bg-red-50 px-2.5 py-1.5 text-xs text-red-700">
                      Důvod zamítnutí: {c.rejectionReason}
                    </p>
                  ) : null}
                  <div className="grid grid-cols-3 gap-2">
                    <Metric
                      label="Zobrazení"
                      value={
                        c.impressions > 0
                          ? c.impressions.toLocaleString("cs-CZ")
                          : "—"
                      }
                    />
                    <Metric
                      label="Kliknutí"
                      value={
                        c.clicks > 0 ? c.clicks.toLocaleString("cs-CZ") : "—"
                      }
                    />
                    <Metric
                      label="CTR"
                      value={
                        c.impressions > 0
                          ? `${calcCtr(c.impressions, c.clicks).toFixed(2)} %`
                          : "—"
                      }
                    />
                  </div>
                </div>

                <div className="flex gap-2 sm:flex-col sm:items-stretch lg:min-w-[7.5rem]">
                  {c.status === "pending_payment" ? (
                    <Button
                      type="button"
                      size="sm"
                      className="h-10 flex-1 rounded-xl bg-[#B8860B] text-white hover:bg-[#9a7209] sm:h-9 sm:flex-none"
                      onClick={() => void demoPay(c.id)}
                    >
                      Demo platba
                    </Button>
                  ) : null}
                  {(c.status === "active" ||
                    c.status === "paused" ||
                    c.status === "scheduled" ||
                    c.status === "approved") && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-10 flex-1 rounded-xl sm:h-9 sm:flex-none"
                      onClick={() => void toggle(c.id, c.status)}
                    >
                      {c.status === "paused" ? (
                        <>
                          <Play className="mr-1 h-3.5 w-3.5" /> Spustit
                        </>
                      ) : (
                        <>
                          <Pause className="mr-1 h-3.5 w-3.5" /> Pauza
                        </>
                      )}
                    </Button>
                  )}
                  {(c.status === "draft" ||
                    c.status === "rejected" ||
                    c.status === "pending_payment" ||
                    c.status === "pending_approval") && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-10 flex-1 rounded-xl sm:h-9 sm:flex-none"
                      asChild
                    >
                      <Link href={`/business/advertising/create?edit=${c.id}`}>
                        <Pencil className="mr-1 h-3.5 w-3.5" />
                        Upravit
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Mobile FAB-style new campaign */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-neutral-200/80 bg-white/95 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur-md sm:hidden">
        <Button
          asChild
          className="h-11 w-full rounded-xl bg-[#B8860B] text-white hover:bg-[#9a7209]"
        >
          <Link href="/business/advertising/create" scroll>
            <Plus className="mr-1.5 h-4 w-4" />
            Nová kampaň
          </Link>
        </Button>
      </div>
      <div className="h-16 sm:hidden" aria-hidden />
    </BusinessAdsShell>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-muted/20 px-2.5 py-2 sm:px-3">
      <p className="text-[10px] text-muted-foreground sm:text-[11px]">{label}</p>
      <p className="text-sm font-semibold tabular-nums">{value}</p>
    </div>
  );
}
