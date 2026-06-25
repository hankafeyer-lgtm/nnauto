"use client";

import { useEffect } from "react";
import { runWhenConsent } from "@/lib/cookieConsent";

/**
 * Microsoft Clarity loader.
 *
 * Reads project id from /api/analytics/config (env CLARITY_PROJECT_ID on the
 * server) and injects the official Clarity tag once per page lifetime.
 *
 * Idempotent: if Clarity is already on window we exit early.
 *
 * The fetch is intentionally deferred until requestIdleCallback so it never
 * blocks LCP or hydration on slow connections.
 */
export default function ClarityLoader() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const w = window as Window & { clarity?: (...args: unknown[]) => void };
    if (typeof w.clarity === "function") return;

    let cancelled = false;

    const init = async () => {
      try {
        const res = await fetch("/api/analytics/config", {
          credentials: "same-origin",
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = (await res.json()) as { clarityProjectId?: string | null };
        const projectId = (data?.clarityProjectId || "").trim();
        if (!projectId || cancelled) return;
        const cw = window as Window & {
          clarity?: (...args: unknown[]) => void;
        };
        if (typeof cw.clarity === "function") return;

        (function (
          c: Window & { clarity?: unknown; [key: string]: unknown },
          l: Document,
          a: string,
          r: string,
          i: string,
        ) {
          c[a] = c[a] || function () {
            const q = (c[a] as { q?: unknown[] }).q || [];
            q.push(arguments);
            (c[a] as { q?: unknown[] }).q = q;
          };
          const t = l.createElement(r) as HTMLScriptElement;
          t.async = true;
          t.src = `https://www.clarity.ms/tag/${i}`;
          const y = l.getElementsByTagName(r)[0];
          y?.parentNode?.insertBefore(t, y);
        })(
          window as unknown as Window & { clarity?: unknown; [key: string]: unknown },
          document,
          "clarity",
          "script",
          projectId,
        );
      } catch {
        // analytics must never break the app
      }
    };

    // Clarity is analytics — only load it once the visitor has consented.
    const off = runWhenConsent("analytics", () => {
      const idleApi = window as Window & {
        requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      };
      if (typeof idleApi.requestIdleCallback === "function") {
        idleApi.requestIdleCallback(init, { timeout: 2500 });
      } else {
        window.setTimeout(init, 1500);
      }
    });

    return () => {
      cancelled = true;
      off();
    };
  }, []);

  return null;
}
