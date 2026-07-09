"use client";

import { useCallback, useEffect, useState } from "react";
import { apiRequest, parseApiError } from "@/lib/queryClient";
import { Download, Loader2, Printer } from "lucide-react";
import Link from "next/link";

export default function DealerInvoiceClient({ number }: { number: string }) {
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiRequest(
          "GET",
          `/api/dealer/invoices/by-number/${encodeURIComponent(number)}?embed=1`,
        );
        const text = await res.text();
        if (!cancelled) setHtml(text);
      } catch (err) {
        if (!cancelled) {
          const { message } = parseApiError(err);
          setError(message);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [number]);

  const downloadPdf = useCallback(async () => {
    setDownloading(true);
    try {
      const res = await apiRequest(
        "GET",
        `/api/dealer/invoices/by-number/${encodeURIComponent(number)}?format=pdf&download=1`,
      );
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${number}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      const { message } = parseApiError(err);
      setError(message);
    } finally {
      setDownloading(false);
    }
  }, [number]);

  if (error) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center p-6">
        <div className="max-w-md rounded-3xl border bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-stone-900">Faktura není dostupná</h1>
          <p className="mt-3 text-sm text-stone-600">{error}</p>
          <Link
            href="/dealer?tab=billing"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-2xl bg-amber-700 px-5 text-sm font-semibold text-white"
          >
            Zpět na fakturaci
          </Link>
        </div>
      </div>
    );
  }

  if (!html) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-700" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100">
      <div className="sticky top-0 z-20 border-b border-stone-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Link
            href="/dealer?tab=billing"
            className="text-sm font-semibold text-stone-700 hover:text-amber-800"
          >
            ← Zpět na fakturaci
          </Link>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-2xl border border-stone-200 bg-white px-4 text-sm font-semibold text-stone-700"
              onClick={() => {
                const frame = document.getElementById("dealer-invoice-frame") as HTMLIFrameElement | null;
                frame?.contentWindow?.print();
              }}
            >
              <Printer className="h-4 w-4" />
              Tisk
            </button>
            <button
              type="button"
              disabled={downloading}
              className="inline-flex h-10 items-center gap-2 rounded-2xl px-4 text-sm font-semibold text-white disabled:opacity-60"
              style={{ backgroundColor: "#B65A3A" }}
              onClick={downloadPdf}
            >
              {downloading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Stáhnout PDF
            </button>
          </div>
        </div>
      </div>
      <iframe
        id="dealer-invoice-frame"
        title={`Faktura ${number}`}
        srcDoc={html}
        className="mx-auto block min-h-[calc(100vh-64px)] w-full max-w-5xl border-0"
      />
    </div>
  );
}
