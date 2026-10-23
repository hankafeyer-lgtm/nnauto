import { Button } from "@/components/ui/button";
import { Check, type LucideIcon } from "lucide-react";

interface PricingCardProps {
  title: string;
  description: string;
  price: string;
  period?: string;
  features: string[];
  highlighted?: boolean;
  badge?: string;
  buttonText: string;
  onSelect: (planTitle: string) => void;
  featureTextColor?: string;
  promoHighlight?: boolean;
  icon?: LucideIcon;
}

function splitPrice(price: string): { amount: string; suffix: string } {
  const match = price.trim().match(/^(\d+(?:[.,]\d+)?)\s*(.*)$/);
  if (!match) return { amount: price, suffix: "" };
  return { amount: match[1], suffix: match[2] || "" };
}

export default function PricingCard({
  title,
  description,
  price,
  period,
  features,
  highlighted = false,
  badge,
  buttonText,
  onSelect,
  featureTextColor = "text-sm text-foreground",
  promoHighlight = false,
  icon: Icon,
}: PricingCardProps) {
  const handleClick = () => {
    onSelect(title);
  };

  const slug = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const { amount, suffix } = splitPrice(price);

  return (
    <article
      className={[
        "group relative flex h-full flex-col overflow-hidden rounded-[1.5rem]",
        "border backdrop-blur-[2px]",
        "transition-[transform,box-shadow,border-color] duration-500 ease-out",
        "motion-safe:hover:-translate-y-1.5",
        highlighted
          ? [
              "border-[#B8860B]/80",
              "bg-[linear-gradient(165deg,rgba(212,175,55,0.22)_0%,rgba(255,255,255,0.97)_28%,rgba(255,255,255,1)_100%)]",
              "dark:bg-[linear-gradient(165deg,rgba(184,134,11,0.28)_0%,rgba(24,24,24,0.98)_34%,rgba(24,24,24,1)_100%)]",
              "shadow-[0_22px_60px_rgba(184,134,11,0.22)]",
              "ring-1 ring-[#D4AF37]/40",
              "md:z-10 md:scale-[1.03]",
            ].join(" ")
          : [
              "border-black/[0.06] bg-white/90 dark:border-white/10 dark:bg-card/90",
              "shadow-[0_14px_40px_rgba(40,30,10,0.07)]",
              "hover:border-[#B8860B]/45",
              "hover:shadow-[0_22px_50px_rgba(184,134,11,0.14)]",
            ].join(" "),
      ].join(" ")}
      data-testid={`pricing-card-${slug}`}
    >
      {highlighted ? (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-[#D4AF37]/25 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-[#F0D78C] to-transparent"
          />
        </>
      ) : (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#B8860B]/[0.04] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        />
      )}

      <div className="relative flex h-full flex-col p-5 sm:p-6 lg:p-7">
        {badge ? (
          <div className="mb-4 flex justify-end sm:mb-5">
            <span
              className={
                highlighted
                  ? "inline-flex items-center rounded-full bg-gradient-to-r from-[#B8860B] to-[#D4AF37] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-white shadow-[0_6px_16px_rgba(184,134,11,0.35)] sm:text-xs"
                  : "inline-flex items-center rounded-full border border-[#B8860B]/30 bg-[#B8860B]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#8a6a10] dark:text-[#D4AF37] sm:text-xs"
              }
              data-testid="badge-plan"
            >
              {badge}
            </span>
          </div>
        ) : (
          <div className="mb-4 hidden sm:mb-5 md:block md:h-7" aria-hidden />
        )}

        <header className="flex items-start gap-3.5 sm:gap-4">
          {Icon ? (
            <div
              className={[
                "relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
                highlighted
                  ? "bg-gradient-to-br from-[#B8860B] to-[#D4AF37] text-white shadow-[0_10px_22px_rgba(184,134,11,0.4)]"
                  : "bg-[#B8860B]/10 text-[#8a6a10] ring-1 ring-[#B8860B]/15 dark:text-[#D4AF37]",
              ].join(" ")}
            >
              <Icon className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2} />
            </div>
          ) : null}
          <div className="min-w-0 pt-0.5">
            <h3 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
              {title}
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>
        </header>

        <div
          className={[
            "mt-5 rounded-2xl px-4 py-4 sm:mt-6 sm:px-5 sm:py-5",
            highlighted
              ? "bg-white/70 ring-1 ring-[#B8860B]/20 dark:bg-black/20"
              : "bg-[#B8860B]/[0.05] ring-1 ring-[#B8860B]/10",
          ].join(" ")}
        >
          <div className="flex flex-wrap items-end gap-x-2 gap-y-0.5">
            <span
              className={[
                "text-4xl font-semibold leading-none tracking-tight sm:text-5xl",
                highlighted
                  ? "bg-gradient-to-br from-[#7a5a08] via-[#B8860B] to-[#D4AF37] bg-clip-text text-transparent dark:from-[#F0D78C] dark:via-[#D4AF37] dark:to-[#B8860B]"
                  : "text-foreground",
              ].join(" ")}
            >
              {amount}
            </span>
            {suffix ? (
              <span className="pb-1 text-lg font-semibold text-[#8a6a10] dark:text-[#D4AF37] sm:text-xl">
                {suffix}
              </span>
            ) : null}
          </div>
          {period ? (
            <p className="mt-2 text-sm text-muted-foreground">{period}</p>
          ) : null}
        </div>

        <ul className="mt-5 flex-1 space-y-3 sm:mt-6 sm:space-y-3.5">
          {features.map((feature) => (
            <li key={feature} className="flex items-start gap-2.5 sm:gap-3">
              <span
                className={[
                  "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full sm:h-6 sm:w-6",
                  highlighted
                    ? "bg-gradient-to-br from-[#B8860B] to-[#D4AF37] text-white shadow-sm"
                    : "bg-[#B8860B]/12 text-[#B8860B]",
                ].join(" ")}
              >
                <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5" strokeWidth={3} />
              </span>
              <span className={`${featureTextColor} leading-snug`}>{feature}</span>
            </li>
          ))}
        </ul>

        <div className="mt-6 sm:mt-7">
          <Button
            type="button"
            className={
              highlighted || promoHighlight
                ? "h-12 w-full rounded-xl border-0 bg-gradient-to-r from-[#B8860B] via-[#C9A227] to-[#D4AF37] text-sm font-semibold text-white shadow-[0_12px_28px_rgba(184,134,11,0.38)] transition-all hover:brightness-[1.03] hover:shadow-[0_16px_32px_rgba(184,134,11,0.45)] sm:h-[3.35rem] sm:text-base"
                : "h-12 w-full rounded-xl border-2 border-[#B8860B]/35 bg-transparent text-sm font-semibold text-[#8a6a10] transition-all hover:border-[#B8860B] hover:bg-[#B8860B]/10 dark:text-[#D4AF37] sm:h-[3.35rem] sm:text-base"
            }
            variant={highlighted || promoHighlight ? "default" : "outline"}
            onClick={handleClick}
            data-testid={`button-plan-${title.toLowerCase()}`}
          >
            {buttonText}
          </Button>
        </div>
      </div>
    </article>
  );
}
