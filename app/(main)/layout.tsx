"use client";

import Providers from "../providers";
import { ScrollToTop } from "@/components/ScrollToTop";
import ClarityLoader from "@/components/ClarityLoader";

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
    </Providers>
  );
}
