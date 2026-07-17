"use client";

import { useEffect, useState } from "react";
import ListingsPage from "@/pages/ListingsPage";
import { NoSSR } from "../../../no-ssr";

type ModelCatalogClientProps = {
  brandSlug: string;
  modelSlug: string;
};

function ModelCatalogRuntime({
  brandSlug,
  modelSlug,
}: ModelCatalogClientProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    window.__NNAUTO_DEFAULT_FILTERS__ = { brand: brandSlug, model: modelSlug };
    setReady(true);

    return () => {
      delete window.__NNAUTO_DEFAULT_FILTERS__;
    };
  }, [brandSlug, modelSlug]);

  if (!ready) {
    return (
      <div className="min-h-[50vh] bg-background" aria-label="Načítání katalogu" />
    );
  }

  return <ListingsPage suppressSeo suppressFooter />;
}

export default function ModelCatalogClient(props: ModelCatalogClientProps) {
  return (
    <NoSSR
      fallback={
        <div className="min-h-[50vh] bg-background" aria-label="Načítání katalogu" />
      }
    >
      <ModelCatalogRuntime {...props} />
    </NoSSR>
  );
}
