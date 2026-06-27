import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/lib/translations";
import { useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient, parseApiError } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "@/lib/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  History,
  Download,
  Loader2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Mail,
  Clock,
} from "lucide-react";

type CebiaReportItem = {
  id: string;
  vin: string;
  status: string;
  hasPdf: boolean;
  createdAt: string;
};

// States that are genuinely being generated (paid). `created` means checkout
// was started but never paid, so it must not be polled or shown as "processing".
const PENDING_STATES = new Set(["paid", "requesting", "requested"]);

export default function CebiaReportsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const t = useTranslation();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data, isLoading } = useQuery<CebiaReportItem[]>({
    queryKey: ["/api/cebia/reports"],
    enabled: isAuthenticated,
  });

  if (!isAuthenticated && !authLoading) {
    navigate("/");
    return null;
  }

  const reports = Array.isArray(data) ? data : [];

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString("cs-CZ", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  const downloadPdf = async (report: CebiaReportItem) => {
    setDownloadingId(report.id);
    try {
      const res = await apiRequest(
        "GET",
        `/api/cebia/reports/${report.id}/pdf?download=1`,
      );
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cebia-${report.vin}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (e) {
      toast({
        variant: "destructive",
        title: t("cebiaReports.statusFailed"),
        description: parseApiError(e).message,
      });
    } finally {
      setDownloadingId(null);
    }
  };

  const refresh = async () => {
    setIsRefreshing(true);
    try {
      // Nudge any still-processing reports forward, then reload the list.
      const pending = reports.filter(
        (r) => !r.hasPdf && PENDING_STATES.has(r.status),
      );
      await Promise.all(
        pending.map((r) =>
          apiRequest("POST", `/api/cebia/reports/${r.id}/poll`, {}).catch(
            () => null,
          ),
        ),
      );
      await queryClient.invalidateQueries({
        queryKey: ["/api/cebia/reports"],
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const renderStatus = (report: CebiaReportItem) => {
    if (report.hasPdf || report.status === "ready") {
      return (
        <span className="inline-flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400">
          <CheckCircle2 className="h-4 w-4" />
          {t("cebiaReports.statusReady")}
        </span>
      );
    }
    if (report.status === "failed") {
      return (
        <span className="inline-flex items-center gap-1.5 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4" />
          {t("cebiaReports.statusFailed")}
        </span>
      );
    }
    // Checkout started but never paid — show as unpaid, not "processing".
    if (report.status === "created") {
      return (
        <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground/70">
          <Clock className="h-4 w-4" />
          {t("cebiaReports.statusUnpaid")}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        {t("cebiaReports.statusPending")}
      </span>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO title={t("cebiaReports.title")} noindex />
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 sm:py-12">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1
                className="text-3xl sm:text-4xl font-bold tracking-tight flex items-center gap-2"
                data-testid="text-cebia-reports-title"
              >
                <History className="h-7 w-7 text-primary" />
                {t("cebiaReports.title")}
              </h1>
              <p className="text-muted-foreground mt-2">
                {t("cebiaReports.subtitle")}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refresh}
              disabled={isRefreshing || isLoading}
              className="gap-2 shrink-0"
              data-testid="button-cebia-refresh"
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">{t("cebiaReports.refresh")}</span>
            </Button>
          </div>

          <div className="flex items-start gap-2 rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground">
            <Mail className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{t("cebiaReports.emailNote")}</span>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              {t("cebiaReports.loading")}
            </div>
          ) : reports.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center space-y-2">
                <History className="h-10 w-10 mx-auto text-muted-foreground/50" />
                <p className="font-medium">{t("cebiaReports.empty")}</p>
                <p className="text-sm text-muted-foreground">
                  {t("cebiaReports.emptyHint")}
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0 divide-y">
                {reports.map((report) => {
                  const ready = report.hasPdf || report.status === "ready";
                  return (
                    <div
                      key={report.id}
                      className="flex flex-wrap items-center gap-3 p-4"
                      data-testid={`cebia-report-row-${report.id}`}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-mono font-medium truncate">
                          {report.vin}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatDate(report.createdAt)}
                        </p>
                      </div>
                      <div className="shrink-0">{renderStatus(report)}</div>
                      <div className="shrink-0">
                        {ready ? (
                          <Button
                            size="sm"
                            onClick={() => downloadPdf(report)}
                            disabled={downloadingId === report.id}
                            className="gap-2"
                            data-testid={`button-download-${report.id}`}
                          >
                            {downloadingId === report.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Download className="h-4 w-4" />
                            )}
                            {t("cebiaReports.download")}
                          </Button>
                        ) : PENDING_STATES.has(report.status) ? (
                          <span className="text-xs text-muted-foreground">
                            {t("cebiaReports.preparing")}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
