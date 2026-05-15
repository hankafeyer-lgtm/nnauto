import { useMemo } from "react";
import {
  AlignLeft,
  Camera,
  CheckCircle2,
  DollarSign,
  FileText,
  Settings2,
  Sparkles,
  Video,
} from "lucide-react";
import {
  computeListingCompletion,
  type CompletionItem,
  type CompletionListingInput,
} from "@/lib/listingCompletion";

const ICONS = {
  Camera,
  FileText,
  AlignLeft,
  Settings2,
  DollarSign,
  Video,
} as const;

type Variant = "compact" | "card";

interface ListingCompletionScoreProps {
  listing: CompletionListingInput;
  /**
   * `compact` — single-row golden bar with %, no recommendation list.
   *              Used inside the listing cards row.
   * `card`     — full block with header + bar + recommendations,
   *              used on the listing detail page (owner-only).
   */
  variant?: Variant;
  className?: string;
}

function scoreColor(score: number): { fg: string; bg: string; label: string } {
  if (score >= 85)
    return {
      fg: "text-emerald-700 dark:text-emerald-300",
      bg: "bg-emerald-500",
      label: "Vynikající",
    };
  if (score >= 60)
    return {
      fg: "text-[#B8860B] dark:text-[#D4AF37]",
      bg: "bg-[#B8860B]",
      label: "Dobré",
    };
  if (score >= 35)
    return {
      fg: "text-amber-700 dark:text-amber-300",
      bg: "bg-amber-500",
      label: "Lze vylepšit",
    };
  return {
    fg: "text-red-700 dark:text-red-300",
    bg: "bg-red-500",
    label: "Doplňte údaje",
  };
}

function RecommendationRow({ item }: { item: CompletionItem }) {
  const Icon = ICONS[item.icon];
  return (
    <li className="flex items-start gap-2.5 py-1.5">
      <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#B8860B]/10 text-[#B8860B] dark:text-[#D4AF37]">
        <Icon className="h-3.5 w-3.5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium leading-tight text-black dark:text-white">
          {item.label}
        </p>
        <p className="text-[12px] leading-snug text-muted-foreground mt-0.5">
          {item.suggestion}
        </p>
      </div>
    </li>
  );
}

export default function ListingCompletionScore({
  listing,
  variant = "card",
  className = "",
}: ListingCompletionScoreProps) {
  const result = useMemo(() => computeListingCompletion(listing), [listing]);
  const color = scoreColor(result.score);

  if (variant === "compact") {
    return (
      <div
        className={`flex items-center gap-2 ${className}`}
        data-testid="listing-completion-compact"
        aria-label={`Vyplněno na ${result.score} %`}
      >
        <Sparkles className={`h-3.5 w-3.5 shrink-0 ${color.fg}`} />
        <div className="flex-1 min-w-0">
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full ${color.bg} transition-[width] duration-500`}
              style={{ width: `${result.score}%` }}
            />
          </div>
        </div>
        <span className={`text-[11px] font-semibold tabular-nums ${color.fg}`}>
          {result.score}%
        </span>
      </div>
    );
  }

  const completedCount = result.items.length - result.missing.length;

  return (
    <div
      className={`rounded-xl border border-[#B8860B]/30 bg-[#B8860B]/5 p-4 ${className}`}
      data-testid="listing-completion-card"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="text-[11px] sm:text-xs font-semibold text-[#6b5a2a] dark:text-[#D4AF37] uppercase tracking-wide">
            Kvalita inzerátu
          </p>
          <p className="text-sm text-muted-foreground mt-0.5">
            {completedCount} z {result.items.length} polí · {color.label}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p
            className={`text-2xl sm:text-3xl font-bold tabular-nums leading-none ${color.fg}`}
          >
            {result.score}%
          </p>
          <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wide">
            Vyplněno
          </p>
        </div>
      </div>

      <div
        className="h-2 w-full rounded-full bg-background overflow-hidden mb-3"
        role="progressbar"
        aria-valuenow={result.score}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Vyplnění inzerátu: ${result.score} %`}
      >
        <div
          className={`h-full ${color.bg} transition-[width] duration-500`}
          style={{ width: `${result.score}%` }}
        />
      </div>

      {result.missing.length === 0 ? (
        <div className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>Inzerát je plně vyplněn — žádná doporučení.</span>
        </div>
      ) : (
        <div>
          <p className="text-[11px] font-semibold text-[#6b5a2a] dark:text-[#D4AF37] uppercase tracking-wide mb-1.5">
            Doporučení ({result.missing.length})
          </p>
          <ul className="divide-y divide-[#B8860B]/15">
            {result.missing.map((item) => (
              <RecommendationRow key={item.key} item={item} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
