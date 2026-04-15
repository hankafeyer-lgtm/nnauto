"use client";

import Providers from "../providers";
import { ScrollToTop } from "@/components/ScrollToTop";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <ScrollToTop />
      {children}
    </Providers>
  );
}
