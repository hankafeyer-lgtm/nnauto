import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

type CatalogModelRow = {
  id: string;
  slug: string;
  name: string;
};

type CatalogModelsResponse = {
  models?: CatalogModelRow[];
};

export function useBrandModels(brand?: string) {
  const brandKey = (brand || "").trim();
  const query = useQuery({
    queryKey: ["/api/catalog/models", brandKey],
    enabled: !!brandKey,
    staleTime: 10 * 60 * 1000,
    queryFn: async (): Promise<string[]> => {
      const res = await fetch(
        `/api/catalog/models?brand=${encodeURIComponent(brandKey)}`,
        {
          credentials: "include",
        },
      );
      if (!res.ok) {
        throw new Error(`Failed to load models: ${res.status}`);
      }
      const data = (await res.json()) as CatalogModelsResponse;
      return (data.models || []).map((row) => row.name).filter(Boolean);
    },
  });

  const models = useMemo(() => query.data || [], [query.data]);
  return {
    models,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
