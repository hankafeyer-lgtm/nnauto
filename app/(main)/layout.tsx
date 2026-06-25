"use client";

import Providers from "../providers";
import { ScrollToTop } from "@/components/ScrollToTop";
import ClarityLoader from "@/components/ClarityLoader";
import CookieConsentBanner from "@/components/CookieConsentBanner";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <ScrollToTop />
      <ClarityLoader />
      {children}
      <CookieConsentBanner />
    </Providers>
  );
}
