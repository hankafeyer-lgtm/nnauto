import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { apiRequest, parseApiError } from "@/lib/queryClient";

type LastGuest = {
  listingId?: string;
  reportId: string;
  token: string;
  ts?: number;
};

export default function CebiaReturnPage() {
  const [, setLocation] = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [isWorking, setIsWorking] = useState(false);
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

  const process = useCallback(async (forceDeliver = false) => {
    setIsWorking(true);
    setError(null);
    try {
      const guest = await resolveGuest();
      if (!guest) {
        setError(
          "Nepodařilo se dohledat tuto platbu. Otevřete prosím report z detailu inzerátu nebo nás kontaktujte.",
        );
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
          if (!autoDeliveredRef.current || forceDeliver) {
            autoDeliveredRef.current = true;
            openPdfInBrowser(guest.reportId, guest.token);
            triggerPdfDownload(guest.reportId, guest.token);
          }
          return;
        }
        await new Promise((r) => setTimeout(r, 3000));
      }

      setError("Report se stále připravuje. Klikněte prosím znovu na tlačítko níže.");
    } catch (e: any) {
      setError(parseApiError(e).message);
    } finally {
      setIsWorking(false);
    }
  }, [openPdfInBrowser, resolveGuest, triggerPdfDownload]);

  useEffect(() => {
    // Try to complete automatically on return from Stripe
    process();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Some browsers block async popups; reserve a tab as early as possible.
    if (openedTabRef.current && !openedTabRef.current.closed) return;
    const opened = window.open("", "_blank", "noopener,noreferrer");
    if (opened) {
      opened.document.title = "VIN report";
      openedTabRef.current = opened;
    }
  }, []);

  return (
    <div className="container max-w-3xl py-4 sm:py-8 lg:py-10 px-3 sm:px-4">
      <Card className="overflow-hidden">
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="space-y-1">
            <p className="text-lg font-semibold">Platba přijata</p>
            <p className="text-sm text-muted-foreground">
              Dokončuji generování VIN reportu. Jakmile je PDF připravené, otevřu ho
              v prohlížeči a zároveň spustím stažení.
            </p>
          </div>

          {error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : null}

          <div className="flex flex-wrap items-stretch gap-2 sm:gap-3">
            <Button
              onClick={() => process(true)}
              disabled={isWorking}
              className="w-full sm:w-auto whitespace-normal text-left sm:text-center"
            >
              {isWorking ? "Zpracovávám…" : "Otevřít + stáhnout VIN report"}
            </Button>
            {(resolvedGuest || last) ? (
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
                Stáhnout PDF znovu
              </Button>
            ) : null}
            {(resolvedGuest?.listingId || last?.listingId) ? (
              <Button
                variant="outline"
                onClick={() =>
                  setLocation(`/listing/${resolvedGuest?.listingId || last?.listingId}`)
                }
                disabled={isWorking}
                className="w-full sm:w-auto whitespace-normal text-left sm:text-center"
              >
                Zpět na inzerát
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

