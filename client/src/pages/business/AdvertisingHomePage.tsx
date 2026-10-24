"use client";

import { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard,
  List,
  Plus,
  Receipt,
  ChevronRight,
} from "lucide-react";
import { BusinessAdsShell, formatCzk } from "./BusinessAdsShell";
import { Link } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { fetchMyCampaigns } from "@/lib/ads/api";
import type { AdCampaign } from "@/lib/ads";

const ACTIONS = [
  {
    href: "/business/advertising/create",
    title: "Nová kampaň",
    desc: "Místo na webu → kreativita → spuštění",
    Icon: Plus,
    primary: true,
  },
  {
    href: "/business/advertising/campaigns",
    title: "Kampaně",
    desc: "Správa, pauza a úpravy",
    Icon: List,
  },
  {
    href: "/business/advertising/prehled",
    title: "Přehled",
    desc: "Výkon, zobrazení a rozpočet",
    Icon: LayoutDashboard,
  },
  {
    href: "/business/advertising/fakturace",
    title: "Faktury",
    desc: "Platby a doklady",
    Icon: Receipt,
  },
] as const;

export default function AdvertisingHomePage() {
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchMyCampaigns()
      .then((list) => {
        if (!cancelled) setCampaigns(list);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const snap = useMemo(() => {
    const active = campaigns.filter((c) => c.status === "active").length;
    const waiting = campaigns.filter(
      (c) =>
        c.status === "pending_approval" ||
        c.status === "pending_review" ||
        c.status === "pending_payment",
    ).length;
    const spend = campaigns.reduce((s, c) => s + (c.spend || 0), 0);
    return { total: campaigns.length, active, waiting, spend };
  }, [campaigns]);

  return (
    <BusinessAdsShell title="Reklama na NNAuto" compactTitle>
      <section className="mx-auto w-full max-w-md sm:max-w-lg">
        <header className="mb-4 sm:mb-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9a7209]">
            Pro firmy
          </p>
          <h2 className="mt-1.5 text-[1.35rem] font-semibold leading-snug tracking-tight text-neutral-900 sm:text-xl">
            Reklama na NNAuto
          </h2>
          <p className="mt-2 max-w-prose text-[13px] leading-relaxed text-neutral-600 sm:text-sm">
            Banner na homepage, mezi inzeráty i další místa. Vytvořte kampaň,
            sledujte výkon a mějte faktury pohromadě.
          </p>
        </header>

        {snap.total > 0 ? (
          <div className="mb-4 grid grid-cols-3 gap-2">
            <MiniStat label="Kampaně" value={String(snap.total)} />
            <MiniStat label="Aktivní" value={String(snap.active)} />
            <MiniStat
              label={snap.waiting > 0 ? "Čeká" : "Utraceno"}
              value={
                snap.waiting > 0
                  ? String(snap.waiting)
                  : snap.spend > 0
                    ? formatCzk(snap.spend)
                    : "—"
              }
              highlight={snap.waiting > 0}
            />
          </div>
        ) : null}

        <Link
          href="/business/advertising/create"
          scroll
          className="mb-4 flex min-h-[3.25rem] items-center justify-between gap-3 rounded-2xl bg-[#B8860B] px-4 py-3.5 text-white shadow-[0_1px_0_rgba(255,255,255,0.2)_inset,0_8px_24px_-12px_rgba(184,134,11,0.55)] transition active:scale-[0.99] hover:bg-[#9a7209]"
        >
          <span className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
              <Plus className="h-5 w-5" strokeWidth={2.25} />
            </span>
            <span>
              <span className="block text-[15px] font-semibold tracking-tight">
                Nová kampaň
              </span>
              <span className="block text-xs text-white/80">
                Spustit reklamu na webu
              </span>
            </span>
          </span>
          <ChevronRight className="h-5 w-5 shrink-0 text-white/70" />
        </Link>

        <p className="mb-2.5 px-0.5 text-[11px] font-medium uppercase tracking-[0.12em] text-neutral-500">
          Moje reklama
        </p>

        <ul className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white divide-y divide-neutral-100">
          {ACTIONS.filter((a) => !a.primary).map(
            ({ href, title, desc, Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  scroll
                  className={cn(
                    "flex min-h-[3.5rem] items-center gap-3 px-3.5 py-3.5 transition",
                    "active:bg-neutral-50 hover:bg-[#B8860B]/5",
                  )}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-50 text-[#9a7209] ring-1 ring-neutral-200/70">
                    <Icon className="h-4 w-4" strokeWidth={1.75} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-medium tracking-tight text-neutral-900">
                      {title}
                      {title === "Kampaně" && snap.waiting > 0 ? (
                        <span className="ml-2 rounded-full bg-violet-100 px-1.5 py-0.5 text-[10px] font-semibold text-violet-800">
                          {snap.waiting} čeká
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-0.5 block text-xs text-neutral-500">
                      {desc}
                    </span>
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-neutral-300" />
                </Link>
              </li>
            ),
          )}
        </ul>
      </section>
    </BusinessAdsShell>
  );
}

function MiniStat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-white px-2.5 py-2.5 text-center shadow-sm",
        highlight && "border-violet-200 bg-violet-50/60",
      )}
    >
      <p className="text-[10px] text-neutral-500">{label}</p>
      <p className="mt-0.5 text-sm font-semibold tabular-nums text-neutral-900">
        {value}
      </p>
    </div>
  );
}
