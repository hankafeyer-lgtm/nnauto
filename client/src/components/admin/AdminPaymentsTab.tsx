import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { cs } from "date-fns/locale";
import type { EnrichedPayment } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { buildListingPath } from "@/lib/listingUrl";
import { Link } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import {
  Car,
  ChevronDown,
  ChevronRight,
  CreditCard,
  Crown,
  Download,
  ExternalLink,
  FileText,
  Mail,
  Phone,
  Search,
  UserRound,
  X,
} from "lucide-react";

type Props = {
  payments: EnrichedPayment[];
  isLoading: boolean;
};

type ServiceFilter = "all" | "publish" | "top";

function formatKc(amountKc: number | undefined, fallbackAmount: string) {
  const value =
    typeof amountKc === "number" && Number.isFinite(amountKc)
      ? amountKc
      : Number(fallbackAmount) / 100;
  return `${new Intl.NumberFormat("cs-CZ").format(value)} Kč`;
}

function paymentAmountKc(payment: EnrichedPayment) {
  if (typeof payment.amountKc === "number" && Number.isFinite(payment.amountKc)) {
    return payment.amountKc;
  }
  const value = Number(payment.amount) / 100;
  return Number.isFinite(value) ? value : 0;
}

function monthKey(date: Date | string) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function yearFromMonthKey(key: string) {
  return key.slice(0, 4);
}

function monthLabel(key: string) {
  const [y, m] = key.split("-").map(Number);
  const date = new Date(y, m - 1, 1);
  const label = format(date, "LLLL", { locale: cs });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function monthLabelWithYear(key: string) {
  return `${monthLabel(key)} ${yearFromMonthKey(key)}`;
}

function carLabel(payment: EnrichedPayment) {
  const base =
    [payment.listingBrand, payment.listingModel].filter(Boolean).join(" ") ||
    payment.listingTitle ||
    "—";
  return payment.listingYear ? `${base} · ${payment.listingYear}` : base;
}

function listingHref(payment: EnrichedPayment) {
  if (!payment.listingId) return null;
  return buildListingPath({
    id: payment.listingId,
    brand: payment.listingBrand,
    model: payment.listingModel,
    year: payment.listingYear,
  });
}

function ServiceBadges({
  payment,
  onFilter,
}: {
  payment: EnrichedPayment;
  onFilter: (filter: ServiceFilter) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {payment.includesPublishFee ? (
        <button
          type="button"
          onClick={() => onFilter("publish")}
          className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B]/40"
          data-testid={`filter-badge-publish-${payment.id}`}
        >
          <Badge
            variant="secondary"
            className="cursor-pointer rounded-full border border-[#B8860B]/20 bg-[#B8860B]/10 font-medium text-[#8a6a10] transition hover:bg-[#B8860B]/20"
          >
            Zveřejnění
          </Badge>
        </button>
      ) : null}
      {payment.includesTop ? (
        <button
          type="button"
          onClick={() => onFilter("top")}
          className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B]/40"
          data-testid={`filter-badge-top-${payment.id}`}
        >
          <Badge className="cursor-pointer rounded-full border-0 bg-gradient-to-r from-[#B8860B] to-[#D4AF37] font-medium text-white shadow-sm hover:brightness-105">
            <Crown className="mr-1 h-3 w-3" />
            TOP
          </Badge>
        </button>
      ) : null}
      {!payment.includesPublishFee && !payment.includesTop ? (
        <Badge variant="outline" className="rounded-full">
          —
        </Badge>
      ) : null}
    </div>
  );
}

function StatusBadge({ payment }: { payment: EnrichedPayment }) {
  if (payment.status === "completed") {
    return (
      <Badge
        className="rounded-full bg-emerald-600/90 hover:bg-emerald-600/90"
        data-testid={`badge-completed-${payment.id}`}
      >
        Zaplaceno
      </Badge>
    );
  }
  if (payment.status === "pending") {
    return (
      <Badge variant="secondary" data-testid={`badge-pending-${payment.id}`}>
        Čeká
      </Badge>
    );
  }
  return (
    <Badge variant="destructive" data-testid={`badge-failed-${payment.id}`}>
      {payment.status}
    </Badge>
  );
}

function PdfActions({
  payment,
  busy,
  onView,
  onDownload,
}: {
  payment: EnrichedPayment;
  busy: boolean;
  onView: () => void;
  onDownload: () => void;
}) {
  return (
    <div className="flex w-full gap-2 sm:w-auto sm:justify-end">
      <Button
        variant="outline"
        size="sm"
        disabled={busy}
        onClick={onView}
        className="h-10 flex-1 rounded-xl border-[#B8860B]/30 sm:h-9 sm:flex-none"
        data-testid={`button-payment-pdf-view-${payment.id}`}
      >
        <FileText className="mr-1.5 h-3.5 w-3.5" />
        PDF
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={busy}
        onClick={onDownload}
        className="h-10 flex-1 rounded-xl border-[#B8860B]/30 bg-[#B8860B]/5 sm:h-9 sm:flex-none"
        data-testid={`button-payment-pdf-download-${payment.id}`}
      >
        <Download className="mr-1.5 h-3.5 w-3.5" />
        {busy ? "…" : "Stáhnout"}
      </Button>
    </div>
  );
}

function ListingBlock({
  payment,
  compact = false,
}: {
  payment: EnrichedPayment;
  compact?: boolean;
}) {
  const href = listingHref(payment);
  const title = (
    <span
      className="font-semibold leading-snug capitalize"
      data-testid={`text-listing-${payment.id}`}
    >
      {carLabel(payment)}
    </span>
  );

  return (
    <div className={cn("min-w-0", compact ? "" : "")}>
      {href ? (
        <Link
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex max-w-full items-center gap-1.5 text-foreground hover:text-[#8a6a10]"
          data-testid={`link-listing-${payment.id}`}
        >
          <span className="truncate underline-offset-2 group-hover:underline">
            {title}
          </span>
          <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-60 group-hover:opacity-100" />
        </Link>
      ) : (
        title
      )}
      {payment.listingTitle ? (
        <p className="mt-0.5 truncate text-sm text-muted-foreground">
          {payment.listingTitle}
        </p>
      ) : null}
      {payment.listingPrice ? (
        <p className="mt-0.5 text-xs text-muted-foreground">
          Cena vozu:{" "}
          {new Intl.NumberFormat("cs-CZ").format(Number(payment.listingPrice))}{" "}
          Kč
        </p>
      ) : null}
      {payment.listingVin ? (
        <p className="mt-0.5 break-all font-mono text-[11px] text-muted-foreground">
          VIN {payment.listingVin}
        </p>
      ) : null}
      {href ? (
        <Link
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1.5 inline-flex text-xs font-medium text-[#8a6a10] hover:underline"
        >
          Otevřít inzerát
        </Link>
      ) : null}
    </div>
  );
}

function PaymentMobileCard({
  payment,
  busy,
  onView,
  onDownload,
  onServiceFilter,
}: {
  payment: EnrichedPayment;
  busy: boolean;
  onView: () => void;
  onDownload: () => void;
  onServiceFilter: (filter: ServiceFilter) => void;
}) {
  return (
    <article
      className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_10px_28px_rgba(40,30,10,0.06)] dark:border-white/10 dark:bg-card"
      data-testid={`row-payment-${payment.id}`}
    >
      <div className="flex items-start justify-between gap-3 border-b border-[#B8860B]/10 bg-gradient-to-r from-[#B8860B]/[0.07] to-transparent px-4 py-3">
        <div>
          <p className="text-xs text-muted-foreground">
            {format(new Date(payment.createdAt), "dd.MM.yyyy HH:mm")}
          </p>
          <p
            className="mt-1 text-xl font-semibold tracking-tight text-foreground"
            data-testid={`text-amount-${payment.id}`}
          >
            {formatKc(payment.amountKc, payment.amount)}
          </p>
        </div>
        <StatusBadge payment={payment} />
      </div>

      <div className="space-y-3.5 px-4 py-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#B8860B]/12 text-[#8a6a10]">
            <UserRound className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p
              className="font-semibold leading-snug"
              data-testid={`text-buyer-name-${payment.id}`}
            >
              {payment.buyerFullName || payment.buyerUsername || "—"}
            </p>
            <p
              className="mt-0.5 flex items-center gap-1.5 truncate text-sm text-muted-foreground"
              data-testid={`text-buyer-email-${payment.id}`}
            >
              <Mail className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{payment.buyerEmail || "—"}</span>
            </p>
            {payment.buyerPhone ? (
              <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                <Phone className="h-3.5 w-3.5 shrink-0" />
                {payment.buyerPhone}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#B8860B]/12 text-[#8a6a10]">
            <Car className="h-4 w-4" />
          </span>
          <ListingBlock payment={payment} />
        </div>

        <div className="rounded-xl bg-[#B8860B]/[0.05] px-3 py-3">
          <p className="text-sm font-medium leading-snug">
            {payment.paymentTypeLabel || "Platba"}
          </p>
          <div className="mt-2">
            <ServiceBadges payment={payment} onFilter={onServiceFilter} />
          </div>
        </div>

        <PdfActions
          payment={payment}
          busy={busy}
          onView={onView}
          onDownload={onDownload}
        />
      </div>
    </article>
  );
}

export default function AdminPaymentsTab({ payments, isLoading }: Props) {
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [month, setMonth] = useState<string>("all");
  const [service, setService] = useState<ServiceFilter>("all");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [expandedYears, setExpandedYears] = useState<Set<string>>(new Set());
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());

  const yearTree = useMemo(() => {
    const years = new Map<
      string,
      { count: number; months: Map<string, number> }
    >();
    for (const p of payments) {
      const mKey = monthKey(p.createdAt);
      const y = yearFromMonthKey(mKey);
      const yearEntry = years.get(y) || { count: 0, months: new Map() };
      yearEntry.count += 1;
      yearEntry.months.set(mKey, (yearEntry.months.get(mKey) || 0) + 1);
      years.set(y, yearEntry);
    }
    return [...years.entries()]
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([year, data]) => ({
        year,
        count: data.count,
        months: [...data.months.entries()]
          .sort((a, b) => b[0].localeCompare(a[0]))
          .map(([key, count]) => ({
            key,
            count,
            label: monthLabel(key),
          })),
      }));
  }, [payments]);

  useEffect(() => {
    if (yearTree.length === 0) return;
    const latestYear = yearTree[0].year;
    const latestMonth = yearTree[0].months[0]?.key;
    setExpandedYears((prev) => {
      if (prev.size > 0) return prev;
      return new Set([latestYear]);
    });
    setExpandedMonths((prev) => {
      if (prev.size > 0) return prev;
      return latestMonth ? new Set([latestMonth]) : prev;
    });
  }, [yearTree]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return payments.filter((p) => {
      if (month !== "all" && monthKey(p.createdAt) !== month) return false;
      if (service === "publish" && !p.includesPublishFee) return false;
      if (service === "top" && !p.includesTop) return false;
      if (!q) return true;
      const haystack = [
        p.buyerEmail,
        p.buyerFullName,
        p.buyerUsername,
        p.buyerPhone,
        p.listingTitle,
        p.listingBrand,
        p.listingModel,
        p.listingVin,
        p.paymentTypeLabel,
        p.serviceDescription,
        p.stripeSessionId,
        p.id,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [payments, query, month, service]);

  const groupedByMonth = useMemo(() => {
    const groups = new Map<string, EnrichedPayment[]>();
    for (const p of filtered) {
      const key = monthKey(p.createdAt);
      const list = groups.get(key) || [];
      list.push(p);
      groups.set(key, list);
    }
    return [...groups.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtered]);

  const stats = useMemo(() => {
    const scoped =
      month === "all"
        ? payments
        : payments.filter((p) => monthKey(p.createdAt) === month);
    const top = scoped.filter((p) => p.includesTop).length;
    const publish = scoped.filter((p) => p.includesPublishFee).length;
    const totalKc = scoped.reduce((sum, p) => sum + paymentAmountKc(p), 0);
    return { top, publish, totalKc, count: scoped.length };
  }, [payments, month]);

  const clearFilters = () => {
    setQuery("");
    setMonth("all");
    setService("all");
  };

  const hasActiveFilters =
    query.trim().length > 0 || month !== "all" || service !== "all";

  const toggleYear = (year: string) => {
    setExpandedYears((prev) => {
      const next = new Set(prev);
      if (next.has(year)) next.delete(year);
      else next.add(year);
      return next;
    });
  };

  const toggleMonth = (key: string) => {
    setExpandedMonths((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
    setMonth(key);
  };

  const selectAllMonths = () => {
    setMonth("all");
  };

  const fetchPdfBlob = async (payment: EnrichedPayment, download: boolean) => {
    const base =
      payment.pdfUrl || `/api/admin/payments/${payment.id}?format=pdf`;
    const pdfUrl = download
      ? base.includes("?")
        ? `${base}&download=1`
        : `${base}?download=1`
      : base;
    const res = await apiRequest("GET", pdfUrl);
    return res.blob();
  };

  const downloadPdf = async (payment: EnrichedPayment) => {
    setDownloadingId(payment.id);
    try {
      const blob = await fetchPdfBlob(payment, true);
      const objectUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = `doklad-platby-${payment.id.slice(0, 8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(objectUrl);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Chyba",
        description: error?.message || "PDF se nepodařilo stáhnout",
      });
    } finally {
      setDownloadingId(null);
    }
  };

  const viewPdf = async (payment: EnrichedPayment) => {
    setDownloadingId(payment.id);
    try {
      const blob = await fetchPdfBlob(payment, false);
      const objectUrl = window.URL.createObjectURL(
        new Blob([blob], { type: "application/pdf" }),
      );
      window.open(objectUrl, "_blank", "noopener,noreferrer");
      window.setTimeout(() => window.URL.revokeObjectURL(objectUrl), 60_000);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Chyba",
        description: error?.message || "PDF se nepodařilo otevřít",
      });
    } finally {
      setDownloadingId(null);
    }
  };

  const renderPaymentList = (items: EnrichedPayment[]) => (
    <>
      <div className="space-y-3 md:hidden">
        {items.map((payment) => (
          <PaymentMobileCard
            key={payment.id}
            payment={payment}
            busy={downloadingId === payment.id}
            onView={() => viewPdf(payment)}
            onDownload={() => downloadPdf(payment)}
            onServiceFilter={setService}
          />
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-2xl border border-black/5 dark:border-white/10 md:block">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#B8860B]/[0.04] hover:bg-[#B8860B]/[0.04]">
                <TableHead className="whitespace-nowrap">Datum</TableHead>
                <TableHead>Plátce</TableHead>
                <TableHead>Vozidlo / inzerát</TableHead>
                <TableHead>Služba</TableHead>
                <TableHead>Částka</TableHead>
                <TableHead>Stav</TableHead>
                <TableHead className="text-right">Doklad</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((payment) => (
                <TableRow
                  key={payment.id}
                  className="align-top"
                  data-testid={`row-payment-${payment.id}`}
                >
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                    {format(new Date(payment.createdAt), "dd.MM.yyyy HH:mm")}
                  </TableCell>
                  <TableCell>
                    <div className="min-w-[170px] max-w-[230px]">
                      <p
                        className="font-medium leading-snug"
                        data-testid={`text-buyer-name-${payment.id}`}
                      >
                        {payment.buyerFullName || payment.buyerUsername || "—"}
                      </p>
                      <p
                        className="truncate text-sm text-muted-foreground"
                        data-testid={`text-buyer-email-${payment.id}`}
                      >
                        {payment.buyerEmail || "—"}
                      </p>
                      {payment.buyerPhone ? (
                        <p className="text-xs text-muted-foreground">
                          {payment.buyerPhone}
                        </p>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="min-w-[190px] max-w-[280px]">
                      <ListingBlock payment={payment} compact />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex min-w-[150px] flex-col gap-1.5">
                      <span className="text-sm font-medium leading-snug">
                        {payment.paymentTypeLabel || "Platba"}
                      </span>
                      <ServiceBadges
                        payment={payment}
                        onFilter={setService}
                      />
                    </div>
                  </TableCell>
                  <TableCell
                    className="whitespace-nowrap font-semibold tabular-nums"
                    data-testid={`text-amount-${payment.id}`}
                  >
                    {formatKc(payment.amountKc, payment.amount)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge payment={payment} />
                  </TableCell>
                  <TableCell className="text-right">
                    <PdfActions
                      payment={payment}
                      busy={downloadingId === payment.id}
                      onView={() => viewPdf(payment)}
                      onDownload={() => downloadPdf(payment)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );

  return (
    <div className="space-y-4 sm:space-y-5">
      <Card className="overflow-hidden border-black/5 shadow-[0_14px_40px_rgba(40,30,10,0.06)] dark:border-white/10">
        <CardHeader className="gap-4 border-b border-[#B8860B]/10 bg-gradient-to-br from-[#B8860B]/[0.08] via-transparent to-transparent pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#B8860B]/25 bg-white/70 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#8a6a10] dark:bg-black/20 dark:text-[#D4AF37]">
              <CreditCard className="h-3.5 w-3.5" />
              Platby
            </div>
            <CardTitle className="text-xl sm:text-2xl">Platby inzerátů</CardTitle>
            <CardDescription className="mt-1.5 max-w-2xl text-sm leading-relaxed">
              Rozbalte rok a měsíc, filtrujte TOP / zveřejnění, nebo otevřete
              inzerát přímo z platby.
            </CardDescription>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Hledat email, jméno, auto…"
              className="h-11 rounded-xl border-[#B8860B]/20 bg-white/90 pl-9 dark:bg-background"
              data-testid="input-admin-payments-search"
            />
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-5 sm:space-y-5">
          {!isLoading && payments.length > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setService("all")}
                  className={cn(
                    "rounded-2xl border px-3 py-3 text-left transition sm:px-4",
                    service === "all"
                      ? "border-[#B8860B]/45 bg-[#B8860B]/12 shadow-sm"
                      : "border-black/5 bg-[#B8860B]/[0.04] hover:border-[#B8860B]/25 dark:border-white/10",
                  )}
                  data-testid="filter-stat-all"
                >
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Celkem plateb
                  </p>
                  <p className="mt-1 text-base font-semibold tabular-nums sm:text-lg">
                    {stats.count}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setService((prev) =>
                      prev === "publish" ? "all" : "publish",
                    )
                  }
                  className={cn(
                    "rounded-2xl border px-3 py-3 text-left transition sm:px-4",
                    service === "publish"
                      ? "border-[#B8860B]/45 bg-[#B8860B]/12 shadow-sm"
                      : "border-black/5 bg-[#B8860B]/[0.04] hover:border-[#B8860B]/25 dark:border-white/10",
                  )}
                  data-testid="filter-stat-publish"
                >
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Se zveřejněním
                  </p>
                  <p className="mt-1 text-base font-semibold tabular-nums sm:text-lg">
                    {stats.publish}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setService((prev) => (prev === "top" ? "all" : "top"))
                  }
                  className={cn(
                    "rounded-2xl border px-3 py-3 text-left transition sm:px-4",
                    service === "top"
                      ? "border-[#B8860B]/45 bg-[#B8860B]/12 shadow-sm"
                      : "border-black/5 bg-[#B8860B]/[0.04] hover:border-[#B8860B]/25 dark:border-white/10",
                  )}
                  data-testid="filter-stat-top"
                >
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    S TOP
                  </p>
                  <p className="mt-1 text-base font-semibold tabular-nums sm:text-lg">
                    {stats.top}
                  </p>
                </button>

                <div className="rounded-2xl border border-black/5 bg-[#B8860B]/[0.04] px-3 py-3 dark:border-white/10 sm:px-4">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Součet
                  </p>
                  <p className="mt-1 text-base font-semibold tabular-nums sm:text-lg">
                    {new Intl.NumberFormat("cs-CZ").format(
                      Math.round(stats.totalKc),
                    )}{" "}
                    Kč
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Rok / měsíc
                  </p>
                  {hasActiveFilters ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="h-8 rounded-lg px-2 text-xs"
                      data-testid="button-clear-payment-filters"
                    >
                      <X className="mr-1 h-3.5 w-3.5" />
                      Zrušit filtry
                    </Button>
                  ) : null}
                </div>

                <div className="overflow-hidden rounded-2xl border border-[#B8860B]/20 bg-white/80 dark:bg-card/80">
                  <button
                    type="button"
                    onClick={selectAllMonths}
                    className={cn(
                      "flex w-full items-center justify-between px-3 py-2.5 text-left text-sm font-medium transition",
                      month === "all"
                        ? "bg-[#B8860B]/12 text-[#8a6a10]"
                        : "hover:bg-[#B8860B]/[0.05]",
                    )}
                    data-testid="filter-month-all"
                  >
                    <span>Všechny měsíce</span>
                    <span className="text-xs text-muted-foreground">
                      {payments.length}
                    </span>
                  </button>

                  {yearTree.map((yearItem) => {
                    const yearOpen = expandedYears.has(yearItem.year);
                    return (
                      <div
                        key={yearItem.year}
                        className="border-t border-[#B8860B]/15"
                      >
                        <button
                          type="button"
                          onClick={() => toggleYear(yearItem.year)}
                          className="flex w-full items-center gap-2 px-3 py-2.5 text-left transition hover:bg-[#B8860B]/[0.05]"
                          data-testid={`toggle-year-${yearItem.year}`}
                        >
                          {yearOpen ? (
                            <ChevronDown className="h-4 w-4 text-[#B8860B]" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-[#B8860B]" />
                          )}
                          <span className="font-semibold">{yearItem.year}</span>
                          <span className="ml-auto text-xs text-muted-foreground">
                            {yearItem.count} plateb
                          </span>
                        </button>

                        {yearOpen ? (
                          <div className="space-y-0.5 bg-[#B8860B]/[0.03] px-2 pb-2">
                            {yearItem.months.map((m) => {
                              const monthOpen =
                                expandedMonths.has(m.key) || month === m.key;
                              const monthPayments =
                                groupedByMonth.find(([key]) => key === m.key)?.[1] ||
                                [];
                              return (
                                <div
                                  key={m.key}
                                  className="overflow-hidden rounded-xl border border-transparent"
                                >
                                  <button
                                    type="button"
                                    onClick={() => toggleMonth(m.key)}
                                    className={cn(
                                      "flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition",
                                      month === m.key
                                        ? "bg-[#B8860B] text-white"
                                        : "hover:bg-white dark:hover:bg-background",
                                    )}
                                    data-testid={`filter-month-${m.key}`}
                                  >
                                    {monthOpen ? (
                                      <ChevronDown className="h-3.5 w-3.5 opacity-80" />
                                    ) : (
                                      <ChevronRight className="h-3.5 w-3.5 opacity-80" />
                                    )}
                                    <span className="font-medium">{m.label}</span>
                                    <span
                                      className={cn(
                                        "ml-auto text-xs",
                                        month === m.key
                                          ? "text-white/80"
                                          : "text-muted-foreground",
                                      )}
                                    >
                                      {m.count}
                                    </span>
                                  </button>

                                  {month === m.key && monthOpen ? (
                                    <div className="px-1 pb-2 pt-2">
                                      {monthPayments.length > 0 ? (
                                        renderPaymentList(monthPayments)
                                      ) : (
                                        <p className="px-2 py-3 text-center text-xs text-muted-foreground">
                                          V tomto měsíci nic neodpovídá filtrům.
                                        </p>
                                      )}
                                    </div>
                                  ) : null}
                                </div>
                              );
                            })}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>

              {(service !== "all" || month !== "all") && (
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Aktivní filtr:</span>
                  {month !== "all" ? (
                    <Badge variant="secondary" className="rounded-full">
                      {monthLabelWithYear(month)}
                    </Badge>
                  ) : null}
                  {service === "publish" ? (
                    <Badge
                      variant="secondary"
                      className="rounded-full border border-[#B8860B]/20 bg-[#B8860B]/10 text-[#8a6a10]"
                    >
                      Zveřejnění
                    </Badge>
                  ) : null}
                  {service === "top" ? (
                    <Badge className="rounded-full bg-gradient-to-r from-[#B8860B] to-[#D4AF37] text-white">
                      TOP
                    </Badge>
                  ) : null}
                </div>
              )}
            </>
          ) : null}

          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#B8860B]/30 border-t-[#B8860B]" />
              <p className="text-sm">Načítám platby…</p>
            </div>
          ) : month === "all" ? (
            filtered.length > 0 ? (
              <div className="space-y-6">
                {groupedByMonth.map(([key, items]) => (
                  <section key={key} className="space-y-3">
                    <div className="sticky top-0 z-[1] -mx-1 flex items-center justify-between gap-2 rounded-xl bg-background/95 px-1 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/80">
                      <button
                        type="button"
                        onClick={() => toggleMonth(key)}
                        className="text-left text-sm font-semibold text-foreground hover:text-[#8a6a10] sm:text-base"
                      >
                        {monthLabelWithYear(key)}
                      </button>
                      <span className="text-xs text-muted-foreground">
                        {items.length}{" "}
                        {items.length === 1 ? "platba" : "plateb"}
                      </span>
                    </div>
                    {renderPaymentList(items)}
                  </section>
                ))}
              </div>
            ) : (
              <p className="py-12 text-center text-muted-foreground">
                {hasActiveFilters
                  ? "Žádná platba neodpovídá filtrům."
                  : "Zatím nejsou žádné platby."}
              </p>
            )
          ) : null}

          {payments.length > 0 ? (
            <p className="text-center text-xs text-muted-foreground sm:text-left">
              Zobrazeno {filtered.length} z {payments.length} plateb
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
