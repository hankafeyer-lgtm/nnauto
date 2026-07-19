"use client";

import { useEffect, useState } from "react";
import ListingsPage from "@/pages/ListingsPage";
import type { FilterParams } from "@/hooks/useFilterParams";

type SeoCatalogClientProps = {
  defaultFilters: FilterParams;
};

function SeoCatalogRuntime({ defaultFilters }: SeoCatalogClientProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    window.__NNAUTO_DEFAULT_FILTERS__ = defaultFilters;
    setReady(true);

    return () => {
      delete window.__NNAUTO_DEFAULT_FILTERS__;
    };
  }, [defaultFilters]);

  if (!ready) {
    return (
      <div className="min-h-[50vh] bg-background" aria-label="Načítání katalogu" />
    );
  }

  return <ListingsPage suppressSeo suppressFooter />;
}

export default function SeoCatalogClient(props: SeoCatalogClientProps) {
  return <SeoCatalogRuntime {...props} />;
}
