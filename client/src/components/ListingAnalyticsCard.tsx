import { useMemo } from "react";
import {
  Eye,
  Phone,
  Percent,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useListingStats } from "@/hooks/useListingStats";
import { displayViews } from "@/lib/displayStats";
import ListingCompletionScore from "@/components/ListingCompletionScore";
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

function StatTile({
  icon: Icon,
  label,
  value,
  testId,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
  testId?: string;
}) {
  return (
    <div
      className="rounded-xl border bg-white/80 px-3 py-2"
      data-testid={testId}
    >
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3 w-3 shrink-0" />
        <span>{label}</span>
      </div>
      <p
        className="mt-0.5 text-base font-black tabular-nums leading-tight text-black dark:text-white sm:text-lg"
      >
        {value}
      </p>
    </div>
  );
}

/**
 * Owner-facing "Statistika inzerátu" block — combines aggregate counts,
 * a daily views chart for the entire listing lifetime, week-over-week growth,
 * CTR, and the completion score with recommendations.
 */
export default function ListingAnalyticsCard({
  listingId,
  listing,
  favoritesCount,
  className = "",
}: ListingAnalyticsCardProps) {
  const totalsQuery = useListingStats(listingId);

  const totals = totalsQuery.stats ?? {
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

  return (
    <Card
      className={`rounded-2xl border-[#B8860B]/20 bg-[#B8860B]/5 shadow-sm ${className}`}
      data-testid="listing-analytics-card"
    >
      <CardContent className="space-y-2.5 p-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-black leading-tight">
              Statistika inzerátu
            </p>
            <p className="mt-0.5 text-[10px] text-muted-foreground">
              Pouze pro vlastníka
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <StatTile
            icon={Eye}
            label="Zobrazení"
            value={displayViews(totals.views)}
            testId="analytics-stat-views"
          />
          <StatTile
            icon={Phone}
            label="Kontakty"
            value={totalContacts}
            testId="analytics-stat-contacts"
          />
          <StatTile
            icon={Percent}
            label="CTR"
            value={`${ctr}%`}
            testId="analytics-stat-ctr"
          />
        </div>

        <div className="rounded-xl border border-[#B8860B]/20 bg-white/80 px-3 py-2">
          <div className="mb-1 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wide text-[#6b5a2a] dark:text-[#D4AF37]">
            <Sparkles className="h-3 w-3" />
            Kvalita
          </div>
          <ListingCompletionScore listing={listing} variant="compact" />
        </div>
      </CardContent>
    </Card>
  );
}
