import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "@/lib/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/lib/translations";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { apiRequest, parseApiError } from "@/lib/queryClient";
import { Loader2, CheckCircle2 } from "lucide-react";

type LastGuest = {
  listingId?: string;
  reportId: string;
  token: string;
  ts?: number;
};

export default function CebiaReturnPage() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const t = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const [isWorking, setIsWorking] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [resolvedGuest, setResolvedGuest] = useState<LastGuest | null>(null);
  const autoDeliveredRef = useRef(false);
  const openedTabRef = useRef<Window | null>(null);

  const last = useMemo((): LastGuest | null => {
    try {
      const raw = localStorage.getItem("cebia:last");
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (
        parsed &&
        typeof parsed.reportId === "string" &&
        typeof parsed.token === "string"
      ) {
        return parsed as LastGuest;
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  const urlParams = useMemo(() => {
    if (typeof window === "undefined") return new URLSearchParams();
    return new URLSearchParams(window.location.search);
  }, []);

  const sessionIdParam = urlParams.get("session_id") || "";
  const reportIdParam =
    urlParams.get("report_id") || urlParams.get("nnauto_report_id") || "";

  const buildPdfUrl = useCallback((reportId: string, token: string, download = false) => {
    const base = `/api/cebia/guest/reports/${encodeURIComponent(
      reportId,
    )}/pdf?token=${encodeURIComponent(token)}`;
    return download ? `${base}&download=1` : base;
  }, []);

  const openPdfInBrowser = useCallback((reportId: string, token: string) => {
    const url = buildPdfUrl(reportId, token, false);
    if (openedTabRef.current && !openedTabRef.current.closed) {
      openedTabRef.current.location.href = url;
      return;
    }
    const opened = window.open(url, "_blank", "noopener,noreferrer");
    if (opened) {
      openedTabRef.current = opened;
      return;
    }
    // Fallback for aggressive popup blockers: ensure user still sees the report.
    window.location.assign(url);
  }, [buildPdfUrl]);

  const triggerPdfDownload = useCallback((reportId: string, token: string) => {
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = buildPdfUrl(reportId, token, true);
    document.body.appendChild(iframe);
    window.setTimeout(() => {
      iframe.remove();
    }, 25000);
  }, [buildPdfUrl]);
  const navigateToListingWithState = useCallback((listingId: string) => {
    window.location.assign(`/listing/${listingId}`);
  }, []);

  const resolveGuest = useCallback(async (): Promise<LastGuest | null> => {
    if (resolvedGuest) return resolvedGuest;
    if (last?.reportId && last?.token) {
      setResolvedGuest(last);
      return last;
    }
    if (!sessionIdParam && !reportIdParam) return null;

    try {
      const res = await apiRequest("POST", "/api/cebia/guest/resolve-return", {
        sessionId: sessionIdParam || undefined,
        reportId: reportIdParam || undefined,
      });
      const data = await res.json();
      if (!data?.reportId || !data?.token) return null;

      const resolved: LastGuest = {
        reportId: data.reportId,
        token: data.token,
        listingId:
          typeof data.listingId === "string" && data.listingId.trim()
            ? data.listingId
            : undefined,
        ts: Date.now(),
      };
      setResolvedGuest(resolved);
      try {
        localStorage.setItem("cebia:last", JSON.stringify(resolved));
      } catch {
        // ignore
      }
      return resolved;
    } catch {
      return null;
    }
  }, [last, reportIdParam, resolvedGuest, sessionIdParam]);

  // Authenticated delivery: download the PDF through apiRequest (which carries
  // the JWT) and both open it inline and trigger a file download.
  const deliverAuthedPdf = useCallback(async (reportId: string) => {
    const res = await apiRequest(
      "GET",
      `/api/cebia/reports/${encodeURIComponent(reportId)}/pdf?download=1`,
    );
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    if (openedTabRef.current && !openedTabRef.current.closed) {
      openedTabRef.current.location.href = url;
    } else {
      window.open(url, "_blank", "noopener,noreferrer");
    }
    const a = document.createElement("a");
    a.href = url;
    a.download = `cebia-${reportId}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  }, []);

  const processAuthed = useCallback(async (forceDeliver = false) => {
    setIsWorking(true);
    setError(null);
    try {
      const reportId =
        reportIdParam || (resolvedGuest ? resolvedGuest.reportId : "");
      if (!reportId) {
        setError(t("cebiaReturn.notFound"));
        return;
      }

      await apiRequest(
        "POST",
        `/api/cebia/reports/${encodeURIComponent(reportId)}/request`,
        {},
      ).catch(() => null);

      for (let i = 0; i < 40; i++) {
        const res = await apiRequest(
          "POST",
          `/api/cebia/reports/${encodeURIComponent(reportId)}/poll`,
          {},
        );
        const data = await res.json();
        if (data?.status === "ready") {
          setIsReady(true);
          if (!autoDeliveredRef.current || forceDeliver) {
            autoDeliveredRef.current = true;
            await deliverAuthedPdf(reportId);
          }
          return;
        }
        await new Promise((r) => setTimeout(r, 3000));
      }
      setError(t("cebiaReturn.stillPreparing"));
    } catch (e: any) {
      setError(parseApiError(e).message);
    } finally {
      setIsWorking(false);
    }
  }, [deliverAuthedPdf, reportIdParam, resolvedGuest, t]);

  const processGuest = useCallback(async (forceDeliver = false) => {
    setIsWorking(true);
    setError(null);
    try {
      const guest = await resolveGuest();
      if (!guest) {
        setError(t("cebiaReturn.notFound"));
        return;
      }

      await apiRequest(
        "POST",
        `/api/cebia/guest/reports/${encodeURIComponent(guest.reportId)}/request`,
        { token: guest.token },
      ).catch(() => null);

      for (let i = 0; i < 40; i++) {
        const res = await apiRequest(
          "POST",
          `/api/cebia/guest/reports/${encodeURIComponent(guest.reportId)}/poll`,
          { token: guest.token },
        );
        const data = await res.json();
        if (data?.status === "ready") {
          setIsReady(true);
          if (!autoDeliveredRef.current || forceDeliver) {
            autoDeliveredRef.current = true;
            openPdfInBrowser(guest.reportId, guest.token);
            triggerPdfDownload(guest.reportId, guest.token);
          }
          return;
        }
        await new Promise((r) => setTimeout(r, 3000));
      }

      setError(t("cebiaReturn.stillPreparing"));
    } catch (e: any) {
      setError(parseApiError(e).message);
    } finally {
      setIsWorking(false);
    }
  }, [openPdfInBrowser, resolveGuest, t, triggerPdfDownload]);

  const process = useCallback(
    (forceDeliver = false) => {
      if (isAuthenticated) return processAuthed(forceDeliver);
      return processGuest(forceDeliver);
    },
    [isAuthenticated, processAuthed, processGuest],
  );

  useEffect(() => {
    // Wait until auth state is resolved so we pick the right (authed vs guest) flow.
    if (authLoading || authReady) return;
    setAuthReady(true);
    process();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading]);

  useEffect(() => {
    // Some browsers block async popups; reserve a tab as early as possible.
    if (openedTabRef.current && !openedTabRef.current.closed) return;
    const opened = window.open("", "_blank", "noopener,noreferrer");
    if (opened) {
      opened.document.title = "VIN report";
      openedTabRef.current = opened;
    }
  }, []);

  const listingId = resolvedGuest?.listingId || last?.listingId;

  return (
    <div className="container max-w-3xl py-4 sm:py-8 lg:py-10 px-3 sm:px-4">
      <SEO
        title="Cebia návrat"
        description="Technická návratová stránka pro dokončení a doručení Cebia reportu."
        url="https://nnauto.cz/cebia/return"
        noindex
      />
      <Card className="overflow-hidden">
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="space-y-1">
            <p className="text-lg font-semibold">{t("cebiaReturn.title")}</p>
            <p className="text-sm text-muted-foreground">
              {t("cebiaReturn.subtitle")}
            </p>
            <p className="text-sm text-muted-foreground">
              {isAuthenticated
                ? t("cebiaReturn.alsoCabinetEmail")
                : t("cebiaReturn.alsoEmail")}
            </p>
            <p className="text-sm text-muted-foreground">
              {t("cebiaReturn.support")}{" "}
              <a
                href="mailto:info@nnauto.cz"
                className="font-medium text-primary underline underline-offset-2"
              >
                info@nnauto.cz
              </a>
            </p>
          </div>

          {isWorking ? (
            <div className="flex items-center gap-3 rounded-lg border bg-muted/40 p-4">
              <Loader2 className="h-5 w-5 animate-spin text-primary shrink-0" />
              <span className="text-sm text-muted-foreground">
                {t("cebiaReturn.generating")}
              </span>
            </div>
          ) : isReady ? (
            <div className="flex items-center gap-3 rounded-lg border border-green-600/30 bg-green-600/10 p-4">
              <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
              <span className="text-sm text-green-700 dark:text-green-400">
                {t("cebiaReturn.ready")}
              </span>
            </div>
          ) : null}

          {error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : null}

          <div className="flex flex-wrap items-stretch gap-2 sm:gap-3">
            <Button
              onClick={() => process(true)}
              disabled={isWorking}
              className="w-full sm:w-auto whitespace-normal text-left sm:text-center"
            >
              {isWorking ? t("cebiaReturn.processing") : t("cebiaReturn.openDownload")}
            </Button>

            {isAuthenticated ? (
              <Button
                variant="outline"
                onClick={() => setLocation("/cebia-reports")}
                disabled={isWorking}
                className="w-full sm:w-auto whitespace-normal text-left sm:text-center"
              >
                {t("cebiaReturn.openCabinet")}
              </Button>
            ) : (resolvedGuest || last) ? (
              <Button
                variant="outline"
                onClick={() => {
                  const guest = resolvedGuest || last;
                  if (!guest) return;
                  openPdfInBrowser(guest.reportId, guest.token);
                  triggerPdfDownload(guest.reportId, guest.token);
                }}
                disabled={isWorking}
                className="w-full sm:w-auto whitespace-normal text-left sm:text-center"
              >
                {t("cebiaReturn.downloadAgain")}
              </Button>
            ) : null}

            {!isAuthenticated && listingId ? (
              <Button
                variant="outline"
                onClick={() => navigateToListingWithState(listingId)}
                disabled={isWorking}
                className="w-full sm:w-auto whitespace-normal text-left sm:text-center"
              >
                {t("cebiaReturn.backToListing")}
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
