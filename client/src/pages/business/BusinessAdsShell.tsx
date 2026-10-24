"use client";

import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link, useLocation } from "@/lib/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowLeft, Shield } from "lucide-react";
import { setAdsDemoRole, useAdsDemoSession } from "@/lib/ads";

const HOME_HREF = "/business/advertising";

/** Only for /admin demo tabs — not shown in the advertiser cabinet. */
export function DemoRoleSwitcher({ className }: { className?: string }) {
  const { role, setRole } = useAdsDemoSession();
  return (
    <div
      className={cn("flex items-center gap-1.5", className)}
      data-testid="demo-ads-role-switcher"
    >
      <div className="flex rounded-lg border border-neutral-200 bg-neutral-100/80 p-0.5">
        <button
          type="button"
          onClick={() => setRole("ADVERTISER")}
          className={cn(
            "rounded-md px-2 py-1 text-[11px] font-medium transition sm:px-2.5",
            role === "ADVERTISER"
              ? "bg-white text-neutral-900 shadow-sm"
              : "text-neutral-500 hover:text-neutral-800",
          )}
          data-testid="demo-role-advertiser"
        >
          Inzerent
        </button>
        <button
          type="button"
          onClick={() => setRole("ADMIN")}
          className={cn(
            "rounded-md px-2 py-1 text-[11px] font-medium transition sm:px-2.5",
            role === "ADMIN"
              ? "bg-white text-neutral-900 shadow-sm"
              : "text-neutral-500 hover:text-neutral-800",
          )}
          data-testid="demo-role-admin"
        >
          Admin
        </button>
      </div>
      {role === "ADMIN" ? (
        <Link
          href="/admin"
          className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-[#B8860B] hover:bg-[#B8860B]/10"
          title="Administrace"
          aria-label="Administrace"
        >
          <Shield className="h-3.5 w-3.5" />
        </Link>
      ) : null}
    </div>
  );
}

export function BusinessAdsShell({
  children,
  title,
  subtitle,
  actions,
  compactTitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  /** Smaller sticky title — use on the home/intro screen */
  compactTitle?: boolean;
}) {
  const [location] = useLocation();
  const isHome = location === HOME_HREF;

  // Kabinet je jen pro inzerenty — admin schvaluje v /admin
  useEffect(() => {
    setAdsDemoRole("ADVERTISER");
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-[#F7F5F0]">
      <Header compactMobile showMobileSearch={false} />

      <div className="sticky top-0 z-30 border-b border-neutral-200/70 bg-white/90 backdrop-blur-md">
        <div className="container mx-auto max-w-5xl px-3 sm:px-4">
          <div
            className={cn(
              "flex items-center justify-between gap-3",
              compactTitle ? "py-2" : "py-2.5 sm:py-3",
            )}
          >
            <div className="flex min-w-0 items-center gap-2">
              {!isHome ? (
                <Link
                  href={HOME_HREF}
                  scroll
                  className="-ml-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200"
                  aria-label="Zpět na úvod"
                >
                  <ArrowLeft className="h-5 w-5" strokeWidth={2} />
                </Link>
              ) : null}
              <h1
                className={cn(
                  "min-w-0 truncate font-semibold tracking-tight text-neutral-900",
                  compactTitle
                    ? "text-sm sm:text-[15px]"
                    : "text-base sm:text-lg",
                )}
              >
                {title}
              </h1>
            </div>
            {actions ? (
              <div className="flex shrink-0 items-center gap-2">{actions}</div>
            ) : null}
          </div>

          {subtitle ? (
            <p className="hidden pb-2 text-sm text-muted-foreground md:block md:-mt-1">
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>

      <main className="container mx-auto max-w-5xl flex-1 px-3 py-3 sm:px-4 sm:py-7">
        {children}
      </main>

      <div className="hidden md:block">
        <Footer />
      </div>
    </div>
  );
}

export function formatCzk(n: number): string {
  return `${Math.round(n).toLocaleString("cs-CZ")} Kč`;
}

export function statusLabel(status: string): string {
  switch (status) {
    case "draft":
      return "Koncept";
    case "pending_review":
    case "pending_approval":
      return "Čeká na schválení";
    case "pending_payment":
      return "Čeká na platbu";
    case "approved":
      return "Schváleno";
    case "active":
      return "Aktivní";
    case "scheduled":
      return "Naplánováno";
    case "paused":
      return "Pozastaveno";
    case "completed":
      return "Dokončeno";
    case "rejected":
      return "Zamítnuto";
    default:
      return status;
  }
}

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    draft: "bg-slate-50 text-slate-700 border-slate-200",
    pending_review: "bg-violet-50 text-violet-800 border-violet-200",
    pending_approval: "bg-violet-50 text-violet-800 border-violet-200",
    pending_payment: "bg-orange-50 text-orange-900 border-orange-200",
    approved: "bg-sky-50 text-sky-800 border-sky-200",
    active: "bg-emerald-50 text-emerald-800 border-emerald-200",
    scheduled: "bg-sky-50 text-sky-800 border-sky-200",
    paused: "bg-amber-50 text-amber-900 border-amber-200",
    completed: "bg-muted text-muted-foreground border-border",
    rejected: "bg-red-50 text-red-800 border-red-200",
    cancelled: "bg-muted text-muted-foreground border-border",
  };
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium",
        styles[status] ?? styles.completed,
      )}
    >
      {statusLabel(status)}
    </span>
  );
}

export function invoiceStatusLabel(status: string): string {
  switch (status) {
    case "paid":
      return "Zaplaceno";
    case "pending":
      return "Čeká na platbu";
    case "cancelled":
      return "Stornováno";
    default:
      return status;
  }
}

export function InvoiceStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    paid: "bg-emerald-50 text-emerald-800 border-emerald-200",
    pending: "bg-amber-50 text-amber-900 border-amber-200",
    cancelled: "bg-muted text-muted-foreground border-border",
  };
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium",
        styles[status] ?? styles.cancelled,
      )}
    >
      {invoiceStatusLabel(status)}
    </span>
  );
}

export function PrimaryCta({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Button
      asChild
      className={cn(
        "h-9 rounded-lg bg-[#B8860B] px-3 text-sm text-white shadow-sm hover:bg-[#9a7209]",
        className,
      )}
    >
      <Link href={href} scroll>
        {children}
      </Link>
    </Button>
  );
}
