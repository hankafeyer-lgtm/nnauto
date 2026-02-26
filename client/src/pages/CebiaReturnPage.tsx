import { useEffect, useMemo, useState } from "react";
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

  const openPdf = (reportId: string, token: string) => {
    window.open(
      `/api/cebia/guest/reports/${encodeURIComponent(
        reportId,
      )}/pdf?token=${encodeURIComponent(token)}`,
      "_blank",
    );
  };

  const process = async () => {
    if (!last) {
      setError("V tomto prohlížeči nebyla nalezena platba. Vraťte se na detail inzerátu.");
      return;
    }
    setIsWorking(true);
    setError(null);
    try {
      // Minimal “happy path”: request then poll a few times from the browser
      await apiRequest(
        "POST",
        `/api/cebia/guest/reports/${encodeURIComponent(last.reportId)}/request`,
        { token: last.token },
      ).catch(() => null);

      for (let i = 0; i < 8; i++) {
        const res = await apiRequest(
          "POST",
          `/api/cebia/guest/reports/${encodeURIComponent(last.reportId)}/poll`,
          { token: last.token },
        );
        const data = await res.json();
        if (data?.status === "ready") {
          openPdf(last.reportId, last.token);
          if (last.listingId) setLocation(`/listing/${last.listingId}`);
          return;
        }
        await new Promise((r) => setTimeout(r, 3000));
      }

      // Not ready yet, but keep user oriented
      if (last.listingId) setLocation(`/listing/${last.listingId}`);
    } catch (e: any) {
      setError(parseApiError(e).message);
    } finally {
      setIsWorking(false);
    }
  };

  useEffect(() => {
    // Try to complete automatically on return
    process();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="container max-w-xl py-10">
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-1">
            <p className="text-lg font-semibold">Platba přijata</p>
            <p className="text-sm text-muted-foreground">
              Dokončuji generování VIN reportu. Pokud se PDF neotevře automaticky,
              použijte tlačítko níže.
            </p>
          </div>

          {error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : null}

          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={process} disabled={isWorking}>
              {isWorking ? "Zpracovávám…" : "Otevřít VIN report"}
            </Button>
            {last?.listingId ? (
              <Button
                variant="outline"
                onClick={() => setLocation(`/listing/${last.listingId}`)}
                disabled={isWorking}
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

