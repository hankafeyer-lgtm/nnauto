"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  calcCtr,
  AD_DURATION_DAYS,
  type CampaignDraft,
  type AdCampaign,
  type AdPlacementId,
  type AdDurationDays,
} from "@/lib/ads";
import { getPlacementMeta } from "@/lib/ads/placements";
import {
  adminSetStatus,
  adminUpdatePrice,
  fetchCatalog,
  fetchMyCampaigns,
} from "@/lib/ads/api";
import {
  StatusBadge,
  formatCzk,
} from "@/pages/business/BusinessAdsShell";
import { AdCreative } from "@/components/ads/AdCreative";
import { AdPreview } from "@/components/ads/AdPreview";
import { useToast } from "@/hooks/use-toast";
import { Link } from "@/lib/navigation";
import {
  Eye,
  MousePointerClick,
  PauseCircle,
  CheckCircle2,
  Clock,
  Coins,
  Megaphone,
  RefreshCw,
  X,
  ExternalLink,
  Search,
  Monitor,
  ChevronDown,
  ChevronUp,
  Percent,
} from "lucide-react";
import { cn } from "@/lib/utils";

function StatCard({
  label,
  value,
  Icon,
  highlight,
  className,
}: {
  label: string;
  value: string | number;
  Icon: typeof Eye;
  highlight?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "min-w-0 rounded-xl border bg-white p-2 shadow-sm sm:p-3",
        highlight && "border-[#B8860B]/35 bg-[#B8860B]/5",
        className,
      )}
    >
      <div className="flex items-start gap-1.5 sm:gap-2">
        <div
          className={cn(
            "shrink-0 rounded-lg p-1.5 sm:p-2",
            highlight
              ? "bg-[#B8860B]/15 text-[#8a6508]"
              : "bg-neutral-100 text-neutral-600",
          )}
        >
          <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] leading-tight text-muted-foreground">
            {label}
          </p>
          <p className="mt-0.5 text-sm font-semibold tabular-nums truncate sm:text-base">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

type CatalogPlacement = {
  id: AdPlacementId;
  label: string;
  description?: string;
  pricesKc: Record<7 | 14 | 30, number>;
  enabled: boolean;
  available: boolean;
  wiredInProduct: boolean;
  locationHint?: string;
  desktopSize?: string;
  mobileSize?: string;
  media?: string;
};

function campaignToDraft(c: AdCampaign): CampaignDraft {
  const days = (
    c.durationDays === 7 || c.durationDays === 14 || c.durationDays === 30
      ? c.durationDays
      : 14
  ) as AdDurationDays;
  return {
    name: c.name,
    placement: c.placement,
    headline: c.headline,
    description: c.description,
    image: c.image,
    videoUrl: c.videoUrl,
    ctaText: c.ctaText,
    targetUrl: c.targetUrl,
    dailyBudget: c.dailyBudget,
    totalBudget: c.totalBudget,
    durationDays: days,
    priceKc: c.priceKc || c.totalBudget,
    startDate: c.startDate,
    endDate: c.endDate,
    brandFilter: c.brandFilter ?? undefined,
    categoryFilter: c.categoryFilter ?? undefined,
  };
}

function fmtDateTime(iso?: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("cs-CZ", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso.slice(0, 16);
  }
}

function advertiserLabel(c: AdCampaign) {
  if (c.advertiserName?.trim()) return c.advertiserName.trim();
  if (c.advertiserId) return c.advertiserId.slice(0, 10) + "…";
  return "—";
}

type AdminView = "fronta" | "kampane" | "cenik";
type StatusFilter = "all" | "pending" | "active" | "paused" | "rejected";

function isPendingStatus(s: string) {
  return (
    s === "pending_approval" ||
    s === "pending_review" ||
    s === "pending_payment"
  );
}

export default function AdminAdsTab() {
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
  const [catalog, setCatalog] = useState<CatalogPlacement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [view, setView] = useState<AdminView>("fronta");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [showSitePreview, setShowSitePreview] = useState(false);
  const [showMoreInfo, setShowMoreInfo] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [camps, cat] = await Promise.all([
        fetchMyCampaigns(),
        fetchCatalog(),
      ]);
      setCampaigns(camps);
      setCatalog(cat.placements as CatalogPlacement[]);
    } catch (e) {
      toast({
        title: "Nepodařilo se načíst reklamy",
        description: e instanceof Error ? e.message : "Chyba API",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const apply = () => setShowSitePreview(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // Lock body scroll when mobile review sheet is open
  useEffect(() => {
    if (!selectedId) return;
    const prev = document.body.style.overflow;
    const mq = window.matchMedia("(max-width: 1023px)");
    if (mq.matches) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [selectedId]);

  const pending = useMemo(
    () => campaigns.filter((c) => isPendingStatus(c.status)),
    [campaigns],
  );

  const selected = campaigns.find((c) => c.id === selectedId) ?? null;

  const stats = useMemo(() => {
    const impressions = campaigns.reduce((s, c) => s + c.impressions, 0);
    const clicks = campaigns.reduce((s, c) => s + c.clicks, 0);
    return {
      total: campaigns.length,
      activeCount: campaigns.filter((c) => c.status === "active").length,
      pendingCount: pending.length,
      pausedCount: campaigns.filter((c) => c.status === "paused").length,
      rejectedCount: campaigns.filter((c) => c.status === "rejected").length,
      impressions,
      clicks,
      spend: campaigns.reduce((s, c) => s + (c.spend || 0), 0),
      ctr: impressions > 0 ? calcCtr(impressions, clicks) : 0,
    };
  }, [campaigns, pending.length]);

  const filteredCampaigns = useMemo(() => {
    const q = query.trim().toLowerCase();
    return campaigns.filter((c) => {
      if (statusFilter === "pending" && !isPendingStatus(c.status)) return false;
      if (statusFilter === "active" && c.status !== "active") return false;
      if (statusFilter === "paused" && c.status !== "paused") return false;
      if (statusFilter === "rejected" && c.status !== "rejected") return false;
      if (!q) return true;
      const hay = [
        c.name,
        c.headline,
        c.description,
        c.placement,
        getPlacementMeta(c.placement)?.label,
        c.advertiserId,
        c.advertiserName,
        c.targetUrl,
        c.ctaText,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [campaigns, query, statusFilter]);

  const notify = (title: string, description?: string) =>
    toast({ title, description });

  const onApprove = async (c: AdCampaign) => {
    setBusy(true);
    try {
      await adminSetStatus(c.id, "active");
      notify("Kampaň schválena a aktivována", c.name);
      setSelectedId(null);
      await load();
    } catch (e) {
      notify("Chyba", e instanceof Error ? e.message : "Forbidden");
    } finally {
      setBusy(false);
    }
  };

  const onReject = async (c: AdCampaign) => {
    if (!rejectReason.trim()) {
      notify("Uveďte důvod zamítnutí");
      return;
    }
    setBusy(true);
    try {
      await adminSetStatus(c.id, "rejected", rejectReason.trim());
      notify("Kampaň zamítnuta", c.name);
      setRejectReason("");
      setSelectedId(null);
      await load();
    } catch (e) {
      notify("Chyba", e instanceof Error ? e.message : "Forbidden");
    } finally {
      setBusy(false);
    }
  };

  const onStatus = async (c: AdCampaign, status: string) => {
    setBusy(true);
    try {
      await adminSetStatus(
        c.id,
        status,
        status === "rejected" ? rejectReason || "Zamítnuto" : undefined,
      );
      notify("Status změněn", `${c.name} → ${status}`);
      await load();
    } catch (e) {
      notify("Chyba", e instanceof Error ? e.message : "Forbidden");
    } finally {
      setBusy(false);
    }
  };

  const savePrice = async (
    placement: AdPlacementId,
    days: 7 | 14 | 30,
    priceKc: number,
  ) => {
    setBusy(true);
    try {
      const cat = await adminUpdatePrice({
        placement,
        durationDays: days,
        priceKc,
      });
      setCatalog(cat.placements as CatalogPlacement[]);
      notify("Cena uložena", `${placement} · ${days} dní`);
    } catch (e) {
      notify("Chyba ceny", e instanceof Error ? e.message : "Forbidden");
    } finally {
      setBusy(false);
    }
  };

  const togglePlacement = async (
    placement: AdPlacementId,
    enabled: boolean,
  ) => {
    setBusy(true);
    try {
      const cat = await adminUpdatePrice({
        placement,
        placementEnabled: enabled,
      });
      setCatalog(cat.placements as CatalogPlacement[]);
      notify(enabled ? "Místo zapnuto" : "Místo vypnuto", placement);
    } catch (e) {
      notify("Chyba", e instanceof Error ? e.message : "Forbidden");
    } finally {
      setBusy(false);
    }
  };

  const openReview = (id: string) => {
    setSelectedId(id);
    setView("fronta");
    setShowMoreInfo(false);
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setShowSitePreview(false);
    }
  };

  return (
    <div className="space-y-2.5 sm:space-y-5">
      <div className="flex items-center justify-between gap-2 sm:items-start sm:gap-3">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-[15px] font-semibold tracking-tight sm:text-xl">
            <Megaphone className="h-4 w-4 shrink-0 text-[#B8860B] sm:h-5 sm:w-5" />
            Kabinet reklamy
          </h2>
          <p className="mt-0.5 hidden text-sm text-muted-foreground sm:block">
            Kontrola, živý náhled a ceník.
          </p>
        </div>
        <div className="flex shrink-0 gap-1.5 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 rounded-xl px-2.5 sm:px-3"
            asChild
          >
            <Link href="/business/advertising" scroll>
              <ExternalLink className="h-3.5 w-3.5 sm:mr-1.5" />
              <span className="hidden sm:inline">Reklama na NNAuto</span>
            </Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 w-9 rounded-xl px-0"
            disabled={loading || busy}
            onClick={() => void load()}
            aria-label="Obnovit"
          >
            <RefreshCw
              className={cn("h-3.5 w-3.5", loading && "animate-spin")}
            />
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="py-6 text-center text-sm text-muted-foreground">Načítám…</p>
      ) : (
        <>
          {/* Mobile: 2×3 grid — no horizontal cutoff */}
          <div className="grid grid-cols-3 gap-1.5 sm:hidden">
            <StatCard
              label="Čeká"
              value={stats.pendingCount}
              Icon={Clock}
              highlight={stats.pendingCount > 0}
              className="min-w-0"
            />
            <StatCard
              label="Aktivní"
              value={stats.activeCount}
              Icon={CheckCircle2}
              className="min-w-0"
            />
            <StatCard
              label="Kampaně"
              value={stats.total}
              Icon={Megaphone}
              className="min-w-0"
            />
            <StatCard
              label="Utraceno"
              value={stats.spend > 0 ? formatCzk(stats.spend) : "—"}
              Icon={Coins}
              className="min-w-0"
            />
            <StatCard
              label="Zobr."
              value={
                stats.impressions > 0
                  ? stats.impressions.toLocaleString("cs-CZ")
                  : "—"
              }
              Icon={Eye}
              className="min-w-0"
            />
            <StatCard
              label="CTR"
              value={stats.impressions > 0 ? `${stats.ctr.toFixed(1)}%` : "—"}
              Icon={Percent}
              className="min-w-0"
            />
          </div>
          {/* Desktop / tablet grid */}
          <div className="hidden grid-cols-4 gap-2 sm:grid lg:grid-cols-4 xl:grid-cols-8 sm:gap-3">
            <StatCard label="Kampaně" value={stats.total} Icon={Megaphone} />
            <StatCard
              label="Čeká"
              value={stats.pendingCount}
              Icon={Clock}
              highlight={stats.pendingCount > 0}
            />
            <StatCard label="Aktivní" value={stats.activeCount} Icon={CheckCircle2} />
            <StatCard label="Pozastavené" value={stats.pausedCount} Icon={PauseCircle} />
            <StatCard
              label="Zobrazení"
              value={
                stats.impressions > 0
                  ? stats.impressions.toLocaleString("cs-CZ")
                  : "—"
              }
              Icon={Eye}
            />
            <StatCard
              label="Kliknutí"
              value={stats.clicks > 0 ? stats.clicks.toLocaleString("cs-CZ") : "—"}
              Icon={MousePointerClick}
            />
            <StatCard
              label="CTR"
              value={stats.impressions > 0 ? `${stats.ctr.toFixed(2)} %` : "—"}
              Icon={Percent}
            />
            <StatCard
              label="Utraceno"
              value={stats.spend > 0 ? formatCzk(stats.spend) : "—"}
              Icon={Coins}
            />
          </div>
        </>
      )}

      <div className="sticky top-0 z-20 -mx-0.5 flex gap-1 rounded-xl border border-neutral-200 bg-neutral-100/95 p-1 backdrop-blur-md sm:mx-0">
        {(
          [
            ["fronta", `Kontrola${pending.length ? ` · ${pending.length}` : ""}`],
            ["kampane", "Kampaně"],
            ["cenik", "Ceník"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              setView(id);
              if (id !== "fronta") setSelectedId(null);
            }}
            className={cn(
              "min-h-11 flex-1 rounded-lg px-2 py-2.5 text-[13px] font-medium transition sm:min-h-10 sm:px-3 sm:text-sm",
              view === id
                ? "bg-white text-neutral-900 shadow-sm"
                : "text-neutral-500 hover:text-neutral-800",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {view === "fronta" ? (
        <>
          <div
            className={cn(
              "grid gap-4 xl:grid-cols-[minmax(220px,280px)_minmax(0,1fr)]",
              selected && "max-lg:hidden xl:grid",
            )}
          >
            <Card className="rounded-2xl">
              <CardHeader className="px-3 pb-2 pt-3 sm:px-4 sm:pt-4">
                <CardTitle className="text-sm sm:text-base">Ke kontrole</CardTitle>
                <p className="text-[11px] text-muted-foreground sm:text-xs">
                  Kreativita + kde se zobrazí na webu.
                </p>
              </CardHeader>
              <CardContent className="space-y-2 px-3 pb-3 sm:px-4 sm:pb-4">
                {pending.length === 0 ? (
                  <div className="rounded-xl border border-dashed py-8 text-center">
                    <p className="text-sm text-muted-foreground">
                      Fronta je prázdná.
                    </p>
                    <Button
                      type="button"
                      variant="link"
                      className="mt-1 text-[#B8860B]"
                      onClick={() => setView("kampane")}
                    >
                      Otevřít všechny kampaně
                    </Button>
                  </div>
                ) : (
                  pending.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => openReview(c.id)}
                      className={cn(
                        "w-full rounded-xl border bg-white p-3 text-left transition active:scale-[0.99]",
                        selected?.id === c.id
                          ? "border-[#B8860B]/50 ring-2 ring-[#B8860B]/20"
                          : "hover:border-[#B8860B]/30",
                      )}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold">{c.name}</p>
                        <StatusBadge status={c.status} />
                      </div>
                      <p className="mt-0.5 line-clamp-1 text-[11px] text-neutral-600">
                        {c.headline || "Bez headline"}
                      </p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {getPlacementMeta(c.placement)?.shortLabel} ·{" "}
                        {formatCzk(c.priceKc || c.totalBudget)} ·{" "}
                        {advertiserLabel(c)}
                      </p>
                      <p className="mt-0.5 text-[10px] text-neutral-400">
                        {c.startDate} → {c.endDate}
                      </p>
                    </button>
                  ))
                )}
              </CardContent>
            </Card>

            {!selected ? (
              <Card className="hidden rounded-2xl border-dashed xl:block">
                <CardContent className="flex min-h-[280px] items-center justify-center p-8 text-center text-sm text-muted-foreground">
                  Vyberte kampaň — kreativita i živý náhled stránky.
                </CardContent>
              </Card>
            ) : null}
          </div>

          {selected ? (
            <div
              className={cn(
                "space-y-0",
                "max-lg:fixed max-lg:inset-0 max-lg:z-40 max-lg:flex max-lg:flex-col max-lg:bg-[#F7F5F0]",
                "max-lg:pt-[env(safe-area-inset-top)]",
              )}
            >
              <Card className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-none border-0 shadow-none max-lg:bg-transparent lg:rounded-2xl lg:border lg:shadow-sm">
                <CardHeader className="sticky top-0 z-10 flex shrink-0 flex-row items-start justify-between gap-2 border-b bg-white/95 px-3 py-2.5 backdrop-blur-md sm:px-4 sm:py-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <CardTitle className="truncate text-sm sm:text-lg">
                        {selected.name}
                      </CardTitle>
                      <StatusBadge status={selected.status} />
                      {selected.localDemo ? (
                        <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-800">
                          LOCAL DEMO
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-0.5 truncate text-[11px] text-muted-foreground sm:text-sm">
                      {getPlacementMeta(selected.placement)?.label}
                      {" · "}
                      {selected.startDate} → {selected.endDate}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-10 w-10 shrink-0 rounded-xl"
                    onClick={() => setSelectedId(null)}
                    aria-label="Zavřít"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </CardHeader>

                <CardContent
                  className={cn(
                    "grid min-h-0 flex-1 gap-3 overflow-y-auto p-3 sm:p-4 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)] lg:gap-5",
                    "max-lg:pb-[calc(7.5rem+env(safe-area-inset-bottom))]",
                  )}
                >
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                        Kreativa
                      </p>
                      <AdCreative
                        campaign={selected}
                        preview
                        className="pointer-events-none"
                      />
                      {selected.videoUrl ? (
                        <p className="mt-1.5 truncate text-[11px] text-neutral-500">
                          Video: {selected.videoUrl}
                        </p>
                      ) : null}
                    </div>

                    {/* Quick metrics */}
                    <div className="grid grid-cols-4 gap-1.5 rounded-xl border bg-white p-2 text-center">
                      <MiniMetric
                        label="Zobr."
                        value={
                          selected.impressions > 0
                            ? selected.impressions.toLocaleString("cs-CZ")
                            : "—"
                        }
                      />
                      <MiniMetric
                        label="Klik."
                        value={
                          selected.clicks > 0
                            ? String(selected.clicks)
                            : "—"
                        }
                      />
                      <MiniMetric
                        label="CTR"
                        value={
                          selected.impressions > 0
                            ? `${calcCtr(selected.impressions, selected.clicks).toFixed(2)}%`
                            : "—"
                        }
                      />
                      <MiniMetric
                        label="Spend"
                        value={
                          selected.spend > 0
                            ? formatCzk(selected.spend)
                            : "—"
                        }
                      />
                    </div>

                    <dl className="rounded-xl border bg-white px-3 text-sm">
                      <Row label="Headline" value={selected.headline || "—"} />
                      <Row
                        label="Popis"
                        value={selected.description || "—"}
                        multiline
                      />
                      <Row label="CTA" value={selected.ctaText || "—"} />
                      <Row
                        label="URL"
                        value={selected.targetUrl || "—"}
                        href={selected.targetUrl}
                      />
                      <Row
                        label="Cena"
                        value={formatCzk(
                          selected.priceKc || selected.totalBudget,
                        )}
                      />
                      <Row
                        label="Období"
                        value={`${selected.startDate} → ${selected.endDate}`}
                      />
                      <Row
                        label="Délka"
                        value={`${selected.durationDays || "—"} dní`}
                      />
                      <Row
                        label="Inzerent"
                        value={
                          selected.advertiserName?.trim() ||
                          selected.advertiserId ||
                          "—"
                        }
                      />
                    </dl>

                    <button
                      type="button"
                      onClick={() => setShowMoreInfo((v) => !v)}
                      className="flex w-full items-center justify-between rounded-xl border bg-white px-3 py-2.5 text-left text-xs font-medium text-neutral-600"
                    >
                      Další informace
                      {showMoreInfo ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>

                    {showMoreInfo ? (
                      <dl className="rounded-xl border bg-white px-3 text-sm">
                        <Row
                          label="Brand filtr"
                          value={selected.brandFilter || "—"}
                        />
                        <Row
                          label="Kategorie"
                          value={selected.categoryFilter || "—"}
                        />
                        <Row
                          label="Vytvořeno"
                          value={fmtDateTime(selected.createdAt)}
                        />
                        <Row
                          label="Aktualizace"
                          value={fmtDateTime(selected.updatedAt)}
                        />
                        <Row
                          label="Zaplaceno"
                          value={fmtDateTime(selected.paidAt)}
                        />
                        <Row
                          label="Schváleno"
                          value={fmtDateTime(selected.approvedAt)}
                        />
                        <Row
                          label="Denní rozpočet"
                          value={
                            selected.dailyBudget > 0
                              ? formatCzk(selected.dailyBudget)
                              : "—"
                          }
                        />
                        <Row label="ID kampaně" value={selected.id} />
                        <Row
                          label="ID inzerenta"
                          value={selected.advertiserId || "—"}
                        />
                        {selected.rejectionReason ? (
                          <Row
                            label="Zamítnutí"
                            value={selected.rejectionReason}
                            multiline
                          />
                        ) : null}
                      </dl>
                    ) : null}

                    <div className="hidden space-y-3 lg:block">
                      <ReviewActions
                        campaign={selected}
                        rejectReason={rejectReason}
                        setRejectReason={setRejectReason}
                        busy={busy}
                        onApprove={() => void onApprove(selected)}
                        onReject={() => void onReject(selected)}
                        onStatus={(s) => void onStatus(selected, s)}
                      />
                    </div>
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={() => setShowSitePreview((v) => !v)}
                      className="mb-2 flex w-full items-center justify-between gap-2 rounded-xl border bg-white px-3 py-2.5 text-left lg:pointer-events-none lg:border-0 lg:bg-transparent lg:px-0 lg:py-0"
                    >
                      <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                        <Monitor className="h-3.5 w-3.5" />
                        Kde se zobrazí
                      </span>
                      <span className="lg:hidden text-neutral-400">
                        {showSitePreview ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </span>
                    </button>

                    {showSitePreview ? (
                      <AdPreview
                        draft={campaignToDraft(selected)}
                        placement={selected.placement}
                        catalog={catalog}
                        reviewOnly
                        className="min-h-[320px] sm:min-h-[420px] lg:min-h-[480px]"
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowSitePreview(true)}
                        className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed bg-white py-8 text-sm text-muted-foreground lg:hidden"
                      >
                        <Monitor className="h-6 w-6 text-[#B8860B]" />
                        Živý náhled stránky
                      </button>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="fixed inset-x-0 bottom-0 z-50 border-t border-neutral-200 bg-white/95 px-3 py-2.5 pb-[calc(0.65rem+env(safe-area-inset-bottom))] backdrop-blur-md lg:hidden">
                <ReviewActions
                  campaign={selected}
                  rejectReason={rejectReason}
                  setRejectReason={setRejectReason}
                  busy={busy}
                  compact
                  onApprove={() => void onApprove(selected)}
                  onReject={() => void onReject(selected)}
                  onStatus={(s) => void onStatus(selected, s)}
                />
              </div>
            </div>
          ) : null}
        </>
      ) : null}

      {view === "kampane" ? (
        <Card className="rounded-2xl">
          <CardHeader className="space-y-2.5 px-3 pt-3 pb-2 sm:space-y-3 sm:px-6 sm:pt-4 sm:pb-3">
            <div>
              <CardTitle className="text-sm sm:text-lg">Všechny kampaně</CardTitle>
              <p className="text-[11px] text-muted-foreground sm:text-sm">
                Filtr + náhled jako u inzerenta.
              </p>
            </div>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Název, headline, inzerent, URL…"
                className="h-10 rounded-xl pl-9"
              />
            </div>
            <div className="flex gap-1 overflow-x-auto pb-0.5">
              {(
                [
                  ["all", "Vše"],
                  ["pending", "Čeká"],
                  ["active", "Aktivní"],
                  ["paused", "Pauza"],
                  ["rejected", "Zamítnuté"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setStatusFilter(id)}
                  className={cn(
                    "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition",
                    statusFilter === id
                      ? "border-[#B8860B]/40 bg-[#B8860B]/10 text-[#8a6508]"
                      : "border-neutral-200 bg-white text-neutral-500",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="px-3 pb-3 sm:px-6 sm:pb-4">
            {filteredCampaigns.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                {campaigns.length === 0
                  ? "Žádné kampaně."
                  : "Nic neodpovídá filtru."}
              </p>
            ) : (
              <>
                <ul className="space-y-2 md:hidden">
                  {filteredCampaigns.map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => openReview(c.id)}
                        className="w-full rounded-xl border bg-white p-3 text-left active:bg-neutral-50"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold">{c.name}</p>
                            <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                              {c.headline || "—"}
                            </p>
                          </div>
                          <StatusBadge status={c.status} />
                        </div>
                        <div className="mt-2 flex flex-wrap gap-x-2.5 gap-y-1 text-[11px] text-neutral-500">
                          <span>
                            {getPlacementMeta(c.placement)?.shortLabel}
                          </span>
                          <span className="tabular-nums">
                            {formatCzk(c.priceKc || c.totalBudget)}
                          </span>
                          <span>{advertiserLabel(c)}</span>
                          <span className="tabular-nums">
                            {c.startDate} → {c.endDate}
                          </span>
                          <span className="tabular-nums">
                            {c.impressions > 0
                              ? `${c.impressions.toLocaleString("cs-CZ")} / ${c.clicks}`
                              : "Bez dat"}
                          </span>
                        </div>
                        {c.rejectionReason ? (
                          <p className="mt-1.5 line-clamp-2 rounded-lg bg-red-50 px-2 py-1 text-[11px] text-red-700">
                            {c.rejectionReason}
                          </p>
                        ) : null}
                      </button>
                    </li>
                  ))}
                </ul>

                <div className="hidden overflow-x-auto rounded-md border md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Název</TableHead>
                        <TableHead>Inzerent</TableHead>
                        <TableHead>Místo</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Období</TableHead>
                        <TableHead>Cena</TableHead>
                        <TableHead>Zobr.</TableHead>
                        <TableHead>Klik.</TableHead>
                        <TableHead>CTR</TableHead>
                        <TableHead className="text-right">Akce</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCampaigns.map((c) => (
                        <TableRow
                          key={c.id}
                          className="cursor-pointer hover:bg-[#B8860B]/5"
                          onClick={() => openReview(c.id)}
                        >
                          <TableCell>
                            <div className="min-w-[140px]">
                              <p className="font-medium">{c.name}</p>
                              <p className="line-clamp-1 text-xs text-muted-foreground">
                                {c.headline}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-[120px] truncate text-sm">
                            {advertiserLabel(c)}
                          </TableCell>
                          <TableCell className="text-sm">
                            {getPlacementMeta(c.placement)?.shortLabel ??
                              c.placement}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={c.status} />
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-xs">
                            {c.startDate} → {c.endDate}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-sm tabular-nums">
                            {formatCzk(c.priceKc || c.totalBudget)}
                          </TableCell>
                          <TableCell className="tabular-nums">
                            {c.impressions > 0
                              ? c.impressions.toLocaleString("cs-CZ")
                              : "—"}
                          </TableCell>
                          <TableCell className="tabular-nums">
                            {c.clicks > 0
                              ? c.clicks.toLocaleString("cs-CZ")
                              : "—"}
                          </TableCell>
                          <TableCell className="tabular-nums text-sm">
                            {c.impressions > 0
                              ? `${calcCtr(c.impressions, c.clicks).toFixed(2)} %`
                              : "—"}
                          </TableCell>
                          <TableCell
                            className="text-right"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="inline-flex flex-wrap justify-end gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 rounded-lg"
                                onClick={() => openReview(c.id)}
                              >
                                Náhled
                              </Button>
                              {isPendingStatus(c.status) && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 rounded-lg"
                                  disabled={busy}
                                  onClick={() => void onApprove(c)}
                                >
                                  Schválit
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 rounded-lg"
                                disabled={busy}
                                onClick={() => void onStatus(c, "active")}
                              >
                                Aktivovat
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 rounded-lg"
                                disabled={busy}
                                onClick={() => void onStatus(c, "paused")}
                              >
                                Pauza
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      ) : null}

      {view === "cenik" ? (
        <Card className="rounded-2xl">
          <CardHeader className="px-3 pt-3 sm:px-6 sm:pt-4">
            <CardTitle className="text-sm sm:text-lg">
              Ceník a dostupnost míst
            </CardTitle>
            <p className="text-[11px] text-muted-foreground sm:text-sm">
              Stejný katalog jako ve wizardu inzerenta.
            </p>
          </CardHeader>
          <CardContent className="space-y-3 px-3 pb-3 sm:space-y-4 sm:px-6 sm:pb-4">
            {catalog.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Katalog není k dispozici.
              </p>
            ) : (
              catalog.map((p) => (
                <div
                  key={p.id}
                  className="rounded-2xl border bg-white p-3 sm:p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold sm:text-base">
                        {p.label}
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {p.wiredInProduct
                          ? "Napojeno na web"
                          : "Slot ještě není na stránce"}
                        {" · "}
                        <span
                          className={
                            p.enabled ? "text-emerald-700" : "text-amber-700"
                          }
                        >
                          {p.enabled ? "Zapnuto" : "Vypnuto"}
                        </span>
                        {p.media ? ` · ${p.media}` : ""}
                      </p>
                      {p.locationHint ? (
                        <p className="mt-1 text-[11px] text-neutral-500">
                          {p.locationHint}
                        </p>
                      ) : null}
                      {(p.desktopSize || p.mobileSize) && (
                        <p className="mt-1 text-[10px] text-neutral-400">
                          {p.desktopSize ? `PC ${p.desktopSize}` : null}
                          {p.desktopSize && p.mobileSize ? " · " : null}
                          {p.mobileSize ? `Mobil ${p.mobileSize}` : null}
                        </p>
                      )}
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-9 shrink-0 rounded-xl"
                      disabled={busy}
                      onClick={() => void togglePlacement(p.id, !p.enabled)}
                    >
                      {p.enabled ? "Vypnout" : "Zapnout"}
                    </Button>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {AD_DURATION_DAYS.map((days) => (
                      <label key={days} className="text-[11px] sm:text-xs">
                        <span className="text-muted-foreground">
                          {days} dní
                        </span>
                        <Input
                          type="number"
                          min={0}
                          inputMode="numeric"
                          defaultValue={p.pricesKc[days]}
                          className="mt-1 h-10 rounded-xl text-sm"
                          onBlur={(e) => {
                            const v = Number(e.target.value);
                            if (Number.isFinite(v) && v !== p.pricesKc[days]) {
                              void savePrice(p.id, days, v);
                            }
                          }}
                        />
                      </label>
                    ))}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[9px] text-muted-foreground">{label}</p>
      <p className="text-xs font-semibold tabular-nums sm:text-sm">{value}</p>
    </div>
  );
}

function ReviewActions({
  campaign,
  rejectReason,
  setRejectReason,
  busy,
  onApprove,
  onReject,
  onStatus,
  compact,
}: {
  campaign: AdCampaign;
  rejectReason: string;
  setRejectReason: (v: string) => void;
  busy: boolean;
  onApprove: () => void;
  onReject: () => void;
  onStatus: (s: string) => void;
  compact?: boolean;
}) {
  const pending = isPendingStatus(campaign.status);

  if (!pending) {
    return (
      <div className={cn("flex gap-2", compact && "w-full")}>
        <Button
          type="button"
          className={cn(
            "rounded-xl bg-emerald-600 text-white hover:bg-emerald-700",
            compact && "h-11 flex-1",
          )}
          disabled={busy}
          onClick={() => onStatus("active")}
        >
          Aktivovat
        </Button>
        <Button
          type="button"
          variant="outline"
          className={cn("rounded-xl", compact && "h-11 flex-1")}
          disabled={busy}
          onClick={() => onStatus("paused")}
        >
          Pauza
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <input
        value={rejectReason}
        onChange={(e) => setRejectReason(e.target.value)}
        className="w-full rounded-xl border bg-neutral-50 px-3 py-2 text-sm"
        placeholder="Důvod zamítnutí (povinné)…"
      />
      <div className="flex gap-2">
        <Button
          type="button"
          className={cn(
            "rounded-xl bg-emerald-600 text-white hover:bg-emerald-700",
            compact && "h-11 flex-1",
          )}
          disabled={busy}
          onClick={onApprove}
          data-testid="admin-approve-campaign"
        >
          {compact ? "Schválit" : "Schválit + aktivovat"}
        </Button>
        <Button
          type="button"
          variant="destructive"
          className={cn("rounded-xl", compact && "h-11 flex-1")}
          disabled={busy}
          onClick={onReject}
          data-testid="admin-reject-campaign"
        >
          Zamítnout
        </Button>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  href,
  multiline,
}: {
  label: string;
  value: string;
  href?: string;
  multiline?: boolean;
}) {
  const safeHref =
    href &&
    (href.startsWith("http://") ||
      href.startsWith("https://") ||
      href.startsWith("/"))
      ? href
      : href
        ? `https://${href}`
        : undefined;

  return (
    <div className="flex justify-between gap-3 border-b border-dashed py-2 last:border-0">
      <dt className="shrink-0 text-xs text-muted-foreground sm:text-sm">
        {label}
      </dt>
      <dd
        className={cn(
          "max-w-[65%] text-right text-xs font-medium sm:text-sm",
          multiline ? "whitespace-pre-wrap break-words" : "truncate",
        )}
        title={value}
      >
        {safeHref && value !== "—" ? (
          <a
            href={safeHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[#8a6508] underline-offset-2 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="truncate">{value}</span>
            <ExternalLink className="h-3 w-3 shrink-0" />
          </a>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}
