"use client";

import { useEffect } from "react";
import Providers from "../providers";
import { ScrollToTop } from "@/components/ScrollToTop";
import ClarityLoader from "@/components/ClarityLoader";
import CookieConsentBanner from "@/components/CookieConsentBanner";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Mark hydration success for every (main) route as soon as this client
  // layout mounts. The `no-hydrate` diagnostic in app/layout.tsx watches
  // `window.__nn_mounted`; without this, routes that don't use <NoSSR>
  // (e.g. /add-listing) falsely report "no-hydrate" after 7s.
  useEffect(() => {
    try {
      (window as unknown as { __nn_mounted?: boolean }).__nn_mounted = true;
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <Providers>
      <ScrollToTop />
      <ClarityLoader />
      {children}
      <CookieConsentBanner />
    </Providers>
  );
}
