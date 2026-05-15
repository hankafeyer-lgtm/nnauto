import { useMemo, useState } from "react";
import {
  Eye,
  Heart,
  Phone,
  Percent,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  useListingDailyAnalytics,
  type ListingDailyAnalytics,
} from "@/hooks/useListingDailyAnalytics";
import { useListingStats } from "@/hooks/useListingStats";
import { displayViews } from "@/lib/displayStats";
import ListingCompletionScore from "@/components/ListingCompletionScore";
import ListingViewsChart from "@/components/ListingViewsChart";
import type { CompletionListingInput } from "@/lib/listingCompletion";

interface ListingAnalyticsCardProps {
  listingId: string;
  listing: CompletionListingInput;
  /**
   * Locally-known favorite count, if available. We don't yet persist
   * favorites on the server (Phase 4 of the analytics rollout), so the
   * caller can pass `undefined` and the card just shows a "—" cell —
   * the chart/CTR/views/recommendations remain fully functional.
   */
  favoritesCount?: number | null;
  className?: string;
}

const RANGE_BUTTONS: Array<{ value: 7 | 30; label: string }> = [
  { value: 7, label: "7 dní" },
  { value: 30, label: "30 dní" },
];

function StatTile({
  icon: Icon,
  label,
  value,
  hint,
  testId,
  accent = "default",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  testId?: string;
  accent?: "default" | "muted";
}) {
  return (
    <div
      className="rounded-lg border bg-background/70 p-3"
      data-testid={testId}
    >
      <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] sm:text-xs uppercase tracking-wide">
        <Icon className="h-3.5 w-3.5 shrink-0" />
        <span>{label}</span>
      </div>
      <p
        className={`font-bold text-lg sm:text-xl tabular-nums leading-tight mt-1 ${accent === "muted" ? "text-muted-foreground" : "text-black dark:text-white"}`}
      >
        {value}
      </p>
      {hint ? (
        <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Owner-facing "Statistika inzerátu" block — combines aggregate counts,
 * a daily views chart with a 7/30-day toggle, week-over-week growth,
 * CTR, and the completion score with recommendations.
 *
 * Designed to be embedded on the listing detail page (full width, full
 * variant) and on the dealer cabinet listing list (one per card). The
 * caller decides where to place it; no positioning assumptions baked
 * into the component.
 */
export default function ListingAnalyticsCard({
  listingId,
  listing,
  favoritesCount,
  className = "",
}: ListingAnalyticsCardProps) {
  const [windowDays, setWindowDays] = useState<7 | 30>(7);

  const dailyQuery = useListingDailyAnalytics(listingId, { days: windowDays });
  const totalsQuery = useListingStats(listingId);

  const data: ListingDailyAnalytics | undefined = dailyQuery.data;
  const totals = data?.totals ?? totalsQuery.stats ?? {
    views: 0,
    contactClicks: 0,
    whatsappClicks: 0,
    telegramClicks: 0,
  };

  const totalContacts =
    totals.contactClicks + totals.whatsappClicks + totals.telegramClicks;

  const ctr = useMemo(() => {
    if (!totals.views) return 0;
    return Math.min(
      999,
      Math.round((totalContacts / Math.max(totals.views, 1)) * 100),
    );
  }, [totals.views, totalContacts]);

  const deltaPercent = data?.weekOverWeek.deltaPercent ?? null;
  const lastWeek = data?.weekOverWeek.lastWeek ?? 0;
  const prevWeek = data?.weekOverWeek.prevWeek ?? 0;

  const deltaIcon =
    deltaPercent === null
      ? TrendingUp
      : deltaPercent > 0
        ? TrendingUp
        : deltaPercent < 0
          ? TrendingDown
          : Sparkles;
  const deltaTone =
    deltaPercent === null
      ? "text-emerald-700 dark:text-emerald-300"
      : deltaPercent > 0
        ? "text-emerald-700 dark:text-emerald-300"
        : deltaPercent < 0
          ? "text-red-700 dark:text-red-300"
          : "text-muted-foreground";
  const deltaLabel =
    deltaPercent === null
      ? "Nový růst"
      : `${deltaPercent > 0 ? "+" : ""}${deltaPercent}% za týden`;

  const favoriteCellValue =
    typeof favoritesCount === "number" ? (
      String(favoritesCount)
    ) : (
      <span aria-label="Žádná data">—</span>
    );

  return (
    <Card
      className={`rounded-2xl border-[#B8860B]/25 bg-[#B8860B]/5 ${className}`}
      data-testid="listing-analytics-card"
    >
      <CardContent className="p-4 md:p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-semibold text-base sm:text-lg leading-tight">
              Statistika inzerátu
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Pouze pro vlastníka
            </p>
          </div>
          <div className="inline-flex rounded-lg border border-[#B8860B]/30 bg-background overflow-hidden shrink-0">
            {RANGE_BUTTONS.map((btn) => (
              <button
                key={btn.value}
                type="button"
                onClick={() => setWindowDays(btn.value)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  windowDays === btn.value
                    ? "bg-[#B8860B] text-white"
                    : "text-muted-foreground hover:bg-[#B8860B]/10"
                }`}
                aria-pressed={windowDays === btn.value}
                data-testid={`analytics-range-${btn.value}`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          <StatTile
            icon={Eye}
            label="Zobrazení"
            value={displayViews(totals.views)}
            hint={`${totals.views} celkem`}
            testId="analytics-stat-views"
          />
          <StatTile
            icon={Phone}
            label="Kontakty"
            value={totalContacts}
            hint={
              totalContacts > 0
                ? `tel ${totals.contactClicks} · WA ${totals.whatsappClicks} · TG ${totals.telegramClicks}`
                : "zatím žádné"
            }
            testId="analytics-stat-contacts"
          />
          <StatTile
            icon={Percent}
            label="CTR"
            value={`${ctr}%`}
            hint="kontakt / zobrazení"
            testId="analytics-stat-ctr"
          />
          <StatTile
            icon={Heart}
            label="V oblíbených"
            value={favoriteCellValue}
            hint={
              typeof favoritesCount === "number"
                ? undefined
                : "připravujeme"
            }
            testId="analytics-stat-favorites"
            accent={typeof favoritesCount === "number" ? "default" : "muted"}
          />
        </div>

        <div
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${deltaTone}`}
          data-testid="analytics-wow"
        >
          {(() => {
            const Icon = deltaIcon;
            return <Icon className="h-3.5 w-3.5" />;
          })()}
          <span>{deltaLabel}</span>
          {prevWeek > 0 || lastWeek > 0 ? (
            <span className="text-muted-foreground">
              ({lastWeek} vs {prevWeek})
            </span>
          ) : null}
        </div>

        <div className="rounded-lg border bg-background/70 p-2.5">
          {dailyQuery.isLoading && !data ? (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              <span className="text-sm">Načítání grafu…</span>
            </div>
          ) : dailyQuery.isError || !data ? (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
              Graf nelze načíst.
            </div>
          ) : (
            <ListingViewsChart data={data.days} windowDays={data.window} />
          )}
        </div>

        <ListingCompletionScore listing={listing} variant="card" />
      </CardContent>
    </Card>
  );
}
