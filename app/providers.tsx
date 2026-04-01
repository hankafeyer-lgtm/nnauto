"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            staleTime: 10 * 60 * 1000,
            gcTime: 60 * 60 * 1000,
            retry: 1,
            retryDelay: 1000,
          },
          mutations: { retry: false },
        },
      }),
  );

  return (
    <LanguageProvider>
      <QueryClientProvider client={queryClient}>
        <FavoritesProvider>
          <TooltipProvider>
            <Toaster />
            {children}
          </TooltipProvider>
        </FavoritesProvider>
      </QueryClientProvider>
    </LanguageProvider>
  );
}
