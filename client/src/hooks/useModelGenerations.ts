import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

type CatalogGenerationRow = {
  id: string;
  slug: string;
  name: string;
};

type CatalogGenerationsResponse = {
  generations?: CatalogGenerationRow[];
};

export function useModelGenerations(brand?: string, model?: string) {
  const brandKey = (brand || "").trim();
  const modelKey = (model || "").trim();
  const query = useQuery({
    queryKey: ["/api/catalog/generations", brandKey, modelKey],
    enabled: !!brandKey && !!modelKey,
    staleTime: 10 * 60 * 1000,
    queryFn: async (): Promise<string[]> => {
      const res = await fetch(
        `/api/catalog/generations?brand=${encodeURIComponent(
          brandKey,
        )}&model=${encodeURIComponent(modelKey)}`,
        {
          credentials: "include",
        },
      );
      if (!res.ok) {
        throw new Error(`Failed to load generations: ${res.status}`);
      }
      const data = (await res.json()) as CatalogGenerationsResponse;
      return (data.generations || []).map((row) => row.name).filter(Boolean);
    },
  });

  const generations = useMemo(() => query.data || [], [query.data]);
  return {
    generations,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
