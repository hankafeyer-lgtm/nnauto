import { useMemo, useState } from "react";
import { format } from "date-fns";
import { cs } from "date-fns/locale";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/lib/translations";
import { useQuery } from "@tanstack/react-query";
import { apiRequest, parseApiError } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "@/lib/navigation";
import { buildListingPath } from "@/lib/listingUrl";
import { cn } from "@/lib/utils";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { EnrichedPayment } from "@shared/schema";
import {
  Car,
  CreditCard,
  Crown,
  Download,
  ExternalLink,
  FileText,
  Loader2,
  Search,
  X,
} from "lucide-react";

type ServiceFilter = "all" | "invoice" | "publish" | "top";

function paymentAmountKc(payment: EnrichedPayment) {
  if (typeof payment.amountKc === "number" && Number.isFinite(payment.amountKc)) {
    return payment.amountKc;
  }
  const value = Number(payment.amount) / 100;
  return Number.isFinite(value) ? value : 0;
}

function formatKc(payment: EnrichedPayment) {
  return `${new Intl.NumberFormat("cs-CZ").format(paymentAmountKc(payment))} Kč`;
}

function formatDate(iso: string | Date) {
  try {
    return format(new Date(iso), "dd.MM.yyyy HH:mm");
  } catch {
    return String(iso);
  }
}

function formatDateShort(iso: string | Date) {
  try {
    return format(new Date(iso), "dd.MM.yyyy");
  } catch {
    return String(iso);
  }
}

function monthKey(date: Date | string) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string) {
  const [y, m] = key.split("-").map(Number);
  const label = format(new Date(y, m - 1, 1), "LLLL yyyy", { locale: cs });
  return label.charAt(0).toUpperCase() + label.slice(1);
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

function ServiceChips({ payment }: { payment: EnrichedPayment }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {payment.includesPublishFee ? (
        <Badge
          variant="secondary"
          className="rounded-full border border-[#B8860B]/20 bg-[#B8860B]/10 font-medium text-[#8a6a10]"
        >
          Zveřejnění
        </Badge>
      ) : null}
      {payment.includesTop ? (
        <Badge className="rounded-full border-0 bg-gradient-to-r from-[#B8860B] to-[#D4AF37] font-medium text-white shadow-sm">
          <Crown className="mr-1 h-3 w-3" />
          TOP
        </Badge>
      ) : null}
    </div>
  );
}

function StatusBadge({ payment }: { payment: EnrichedPayment }) {
  if (payment.status === "completed") {
    return (
      <Badge className="rounded-full bg-emerald-600/90 hover:bg-emerald-600/90">
        Zaplaceno
      </Badge>
    );
  }
  if (payment.status === "pending") {
    return <Badge variant="secondary">Čeká</Badge>;
  }
  return <Badge variant="destructive">{payment.status}</Badge>;
}

function PaymentMobileCard({
  payment,
  busy,
  serviceLabel,
  onDownload,
  t,
}: {
  payment: EnrichedPayment;
  busy: boolean;
  serviceLabel: string;
  onDownload: () => void;
  t: (key: string) => string;
}) {
  const href = listingHref(payment);
  const canDownload = !!payment.hasInvoice && !!payment.pdfUrl;

  return (
    <article
      className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_10px_28px_rgba(40,30,10,0.06)] dark:border-white/10 dark:bg-card"
      data-testid={`user-payment-row-${payment.id}`}
    >
      <div className="flex items-start justify-between gap-3 border-b border-[#B8860B]/10 bg-gradient-to-r from-[#B8860B]/[0.07] to-transparent px-4 py-3">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">
            {formatDate(payment.createdAt)}
          </p>
          <p className="mt-1 text-xl font-semibold tracking-tight">
            {formatKc(payment)}
          </p>
        </div>
        <StatusBadge payment={payment} />
      </div>

      <div className="space-y-3.5 px-4 py-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#B8860B]/12 text-[#8a6a10]">
            <Car className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="font-semibold leading-snug break-words">
              {carLabel(payment)}
            </p>
            {href ? (
              <Link
                href={href}
                className="mt-1 inline-flex items-center gap-1 text-sm text-[#8a6a10] hover:underline"
              >
                {t("userPayments.openListing")}
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            ) : null}
          </div>
        </div>

        <div className="rounded-xl bg-[#B8860B]/[0.05] px-3 py-3">
          <p className="text-sm font-medium leading-snug">{serviceLabel}</p>
          <div className="mt-2">
            <ServiceChips payment={payment} />
          </div>
        </div>

        {canDownload ? (
          <Button
            className="h-11 w-full rounded-xl bg-gradient-to-r from-[#B8860B] to-[#D4AF37] text-white hover:brightness-105"
            onClick={onDownload}
            disabled={busy}
            data-testid={`button-download-invoice-${payment.id}`}
          >
            {busy ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-1.5 h-4 w-4" />
            )}
            {t("userPayments.downloadInvoice")}
          </Button>
        ) : (
          <div className="flex items-center gap-2 rounded-xl border border-dashed px-3 py-2.5 text-sm text-muted-foreground">
            <FileText className="h-4 w-4 shrink-0 opacity-60" />
            {t("userPayments.noInvoice")}
          </div>
        )}
      </div>
    </article>
  );
}

export default function UserPaymentsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const t = useTranslation();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [service, setService] = useState<ServiceFilter>("all");

  const { data, isLoading } = useQuery<EnrichedPayment[]>({
    queryKey: ["/api/payments"],
    enabled: isAuthenticated,
  });

  const payments = Array.isArray(data) ? data : [];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return payments.filter((p) => {
      if (service === "invoice" && !p.hasInvoice) return false;
      if (service === "publish" && !p.includesPublishFee) return false;
      if (service === "top" && !p.includesTop) return false;
      if (!q) return true;
      const haystack = [
        p.listingTitle,
        p.listingBrand,
        p.listingModel,
        p.listingVin,
        p.paymentTypeLabel,
        p.serviceDescription,
        p.id,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [payments, query, service]);

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
    const invoiceCount = payments.filter((p) => p.hasInvoice).length;
    const totalKc = payments.reduce((sum, p) => sum + paymentAmountKc(p), 0);
    return {
      count: payments.length,
      invoiceCount,
      totalKc,
    };
  }, [payments]);

  if (!isAuthenticated && !authLoading) {
    navigate("/");
    return null;
  }

  const hasActiveFilters = query.trim().length > 0 || service !== "all";

  const serviceLabel = (payment: EnrichedPayment) =>
    payment.paymentTypeLabel ||
    payment.serviceDescription ||
    t("userPayments.fallbackService");

  const downloadInvoice = async (payment: EnrichedPayment) => {
    if (!payment.hasInvoice || !payment.pdfUrl) return;
    setDownloadingId(payment.id);
    try {
      const res = await apiRequest(
        "GET",
        `${payment.pdfUrl}${payment.pdfUrl.includes("?") ? "&" : "?"}download=1`,
      );
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `faktura-${payment.id.slice(0, 8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (e) {
      toast({
        variant: "destructive",
        title: t("userPayments.downloadError"),
        description: parseApiError(e).message,
      });
    } finally {
      setDownloadingId(null);
    }
  };

  const filterChips: { id: ServiceFilter; label: string }[] = [
    { id: "all", label: t("userPayments.filterAll") },
    { id: "invoice", label: t("userPayments.filterInvoice") },
    { id: "publish", label: t("userPayments.filterPublish") },
    { id: "top", label: t("userPayments.filterTop") },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <SEO title={t("userPayments.title")} noindex />
      <Header />
      <main className="flex-1 bg-[radial-gradient(ellipse_at_top,_rgba(184,134,11,0.06),_transparent_55%)]">
        <div className="container mx-auto px-4 py-6 sm:py-10">
          <div className="mx-auto max-w-5xl space-y-5 sm:space-y-6">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#B8860B]/12 text-[#8a6a10]">
                  <CreditCard className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <h1
                    className="text-2xl font-bold tracking-tight sm:text-3xl"
                    data-testid="text-user-payments-title"
                  >
                    {t("userPayments.title")}
                  </h1>
                  <p className="mt-1 text-sm text-muted-foreground sm:text-base">
                    {t("userPayments.subtitle")}
                  </p>
                </div>
              </div>

              {payments.length > 0 ? (
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  <div className="rounded-2xl border bg-white/80 px-3 py-3 dark:bg-card/80">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground sm:text-xs">
                      {t("userPayments.statCount")}
                    </p>
                    <p className="mt-1 text-lg font-semibold sm:text-xl">
                      {stats.count}
                    </p>
                  </div>
                  <div className="rounded-2xl border bg-white/80 px-3 py-3 dark:bg-card/80">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground sm:text-xs">
                      {t("userPayments.statInvoices")}
                    </p>
                    <p className="mt-1 text-lg font-semibold sm:text-xl">
                      {stats.invoiceCount}
                    </p>
                  </div>
                  <div className="rounded-2xl border bg-white/80 px-3 py-3 dark:bg-card/80">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground sm:text-xs">
                      {t("userPayments.statTotal")}
                    </p>
                    <p className="mt-1 text-lg font-semibold sm:text-xl">
                      {new Intl.NumberFormat("cs-CZ").format(stats.totalKc)}{" "}
                      <span className="text-sm font-medium text-muted-foreground">
                        Kč
                      </span>
                    </p>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="flex items-start gap-2 rounded-2xl border bg-muted/40 px-3 py-3 text-sm text-muted-foreground sm:px-4">
              <FileText className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{t("userPayments.invoiceNote")}</span>
            </div>

            {payments.length > 0 ? (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t("userPayments.searchPlaceholder")}
                    className="h-11 rounded-xl pl-9 pr-10"
                    data-testid="input-user-payments-search"
                  />
                  {query ? (
                    <button
                      type="button"
                      onClick={() => setQuery("")}
                      className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
                      aria-label={t("userPayments.clearSearch")}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>

                <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {filterChips.map((chip) => (
                    <button
                      key={chip.id}
                      type="button"
                      onClick={() => setService(chip.id)}
                      className={cn(
                        "h-9 shrink-0 rounded-full border px-3.5 text-sm font-medium transition",
                        service === chip.id
                          ? "border-[#B8860B]/40 bg-[#B8860B]/15 text-[#8a6a10]"
                          : "border-border bg-background text-muted-foreground hover:bg-muted",
                      )}
                      data-testid={`filter-user-payments-${chip.id}`}
                    >
                      {chip.label}
                    </button>
                  ))}
                  {hasActiveFilters ? (
                    <button
                      type="button"
                      onClick={() => {
                        setQuery("");
                        setService("all");
                      }}
                      className="h-9 shrink-0 rounded-full border border-dashed px-3.5 text-sm text-muted-foreground hover:bg-muted"
                    >
                      {t("userPayments.clearFilters")}
                    </button>
                  ) : null}
                </div>
              </div>
            ) : null}

            {authLoading || isLoading ? (
              <div className="flex items-center justify-center py-16 text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                {t("userPayments.loading")}
              </div>
            ) : payments.length === 0 ? (
              <Card className="rounded-2xl">
                <CardContent className="space-y-2 py-14 text-center">
                  <CreditCard className="mx-auto h-10 w-10 text-muted-foreground/50" />
                  <p className="font-medium">{t("userPayments.empty")}</p>
                  <p className="text-sm text-muted-foreground">
                    {t("userPayments.emptyHint")}
                  </p>
                </CardContent>
              </Card>
            ) : filtered.length === 0 ? (
              <Card className="rounded-2xl">
                <CardContent className="space-y-3 py-12 text-center">
                  <p className="font-medium">{t("userPayments.noResults")}</p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setQuery("");
                      setService("all");
                    }}
                  >
                    {t("userPayments.clearFilters")}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Mobile cards */}
                <div className="space-y-6 md:hidden">
                  {groupedByMonth.map(([key, items]) => (
                    <section key={key} className="space-y-3">
                      <div className="flex items-center justify-between gap-2 px-0.5">
                        <h2 className="text-sm font-semibold text-foreground">
                          {monthLabel(key)}
                        </h2>
                        <span className="text-xs text-muted-foreground">
                          {items.length}×
                        </span>
                      </div>
                      <div className="space-y-3">
                        {items.map((payment) => (
                          <PaymentMobileCard
                            key={payment.id}
                            payment={payment}
                            busy={downloadingId === payment.id}
                            serviceLabel={serviceLabel(payment)}
                            onDownload={() => downloadInvoice(payment)}
                            t={t}
                          />
                        ))}
                      </div>
                    </section>
                  ))}
                </div>

                {/* Desktop table */}
                <div className="hidden overflow-hidden rounded-2xl border bg-white shadow-[0_10px_28px_rgba(40,30,10,0.05)] dark:bg-card md:block">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-[#B8860B]/[0.04] hover:bg-[#B8860B]/[0.04]">
                        <TableHead className="w-[140px]">
                          {t("userPayments.colDate")}
                        </TableHead>
                        <TableHead>{t("userPayments.colService")}</TableHead>
                        <TableHead>{t("userPayments.colListing")}</TableHead>
                        <TableHead className="text-right">
                          {t("userPayments.colAmount")}
                        </TableHead>
                        <TableHead className="w-[220px] text-right">
                          {t("userPayments.colInvoice")}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((payment) => {
                        const href = listingHref(payment);
                        const canDownload =
                          !!payment.hasInvoice && !!payment.pdfUrl;
                        const busy = downloadingId === payment.id;
                        return (
                          <TableRow
                            key={payment.id}
                            data-testid={`user-payment-row-${payment.id}`}
                          >
                            <TableCell className="align-top text-sm text-muted-foreground">
                              <div>{formatDateShort(payment.createdAt)}</div>
                              <div className="text-xs">
                                {format(new Date(payment.createdAt), "HH:mm")}
                              </div>
                            </TableCell>
                            <TableCell className="align-top">
                              <p className="font-medium leading-snug">
                                {serviceLabel(payment)}
                              </p>
                              <div className="mt-1.5">
                                <ServiceChips payment={payment} />
                              </div>
                            </TableCell>
                            <TableCell className="align-top">
                              <p className="font-medium leading-snug">
                                {carLabel(payment)}
                              </p>
                              {href ? (
                                <Link
                                  href={href}
                                  className="mt-1 inline-flex items-center gap-1 text-sm text-[#8a6a10] hover:underline"
                                >
                                  {t("userPayments.openListing")}
                                  <ExternalLink className="h-3.5 w-3.5" />
                                </Link>
                              ) : null}
                            </TableCell>
                            <TableCell className="align-top text-right">
                              <p className="font-semibold">{formatKc(payment)}</p>
                              <div className="mt-1 flex justify-end">
                                <StatusBadge payment={payment} />
                              </div>
                            </TableCell>
                            <TableCell className="align-top text-right">
                              {canDownload ? (
                                <Button
                                  size="sm"
                                  className="rounded-xl bg-gradient-to-r from-[#B8860B] to-[#D4AF37] text-white hover:brightness-105"
                                  onClick={() => downloadInvoice(payment)}
                                  disabled={busy}
                                  data-testid={`button-download-invoice-${payment.id}`}
                                >
                                  {busy ? (
                                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                                  ) : (
                                    <Download className="mr-1.5 h-4 w-4" />
                                  )}
                                  {t("userPayments.downloadInvoice")}
                                </Button>
                              ) : (
                                <span className="text-xs text-muted-foreground">
                                  {t("userPayments.noInvoice")}
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
