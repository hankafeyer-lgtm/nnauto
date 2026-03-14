import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { MODEL_GENERATION_CATALOG } from "@shared/modelGenerationCatalog";
import { carModels } from "@shared/carDatabase";

type CatalogGenerationRow = {
  id: string;
  slug: string;
  name: string;
};

type CatalogGenerationsResponse = {
  generations?: CatalogGenerationRow[];
};

const slugify = (value: string) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const ROMAN_LEVELS = ["I", "II", "III", "IV", "V"];

const buildGenericGenerations = (modelLabel: string) => {
  const name = String(modelLabel || "").trim();
  if (!name) return [];

  const generated = [name];
  for (const level of ROMAN_LEVELS) {
    generated.push(`${name} ${level}`);
  }
  generated.push(`${name} Facelift`);
  generated.push(`${name} Sport`);

  return Array.from(new Set(generated));
};

const resolveModelNameForBrand = (brandSlug: string, modelInput: string) => {
  const brandModels = carModels[brandSlug] || [];
  if (!brandModels.length) return String(modelInput || "").trim();

  const wantedSlug = slugify(modelInput);
  const exact = brandModels.find((m) => slugify(m) === wantedSlug);
  return exact || String(modelInput || "").trim();
};

const getCatalogFallbackGenerations = (brand?: string, model?: string) => {
  const brandSlug = slugify(brand || "");
  const modelSlug = slugify(model || "");
  if (!brandSlug || !modelSlug) return [];

  const specific = MODEL_GENERATION_CATALOG[brandSlug]?.[modelSlug];
  if (specific && specific.length > 0) return specific;

  const resolvedModelName = resolveModelNameForBrand(brandSlug, model || "");
  const generic = buildGenericGenerations(resolvedModelName);
  return generic.length > 0 ? generic : ["Standard"];
};

export function useModelGenerations(brand?: string, model?: string) {
  const brandKey = (brand || "").trim();
  const modelKey = (model || "").trim();
  const query = useQuery({
    queryKey: ["/api/catalog/generations", brandKey, modelKey],
    enabled: !!brandKey && !!modelKey,
    staleTime: 10 * 60 * 1000,
    queryFn: async (): Promise<string[]> => {
      const fallback = getCatalogFallbackGenerations(brandKey, modelKey);
      const res = await fetch(
        `/api/catalog/generations?brand=${encodeURIComponent(
          brandKey,
        )}&model=${encodeURIComponent(modelKey)}`,
        {
          credentials: "include",
        },
      );
      if (!res.ok) {
        return fallback;
      }
      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        return fallback;
      }
      try {
        const data = (await res.json()) as CatalogGenerationsResponse;
        const apiGenerations = (data.generations || [])
          .map((row) => row.name)
          .filter(Boolean);
        return apiGenerations.length > 0 ? apiGenerations : fallback;
      } catch {
        return fallback;
      }
    },
  });

  const generations = useMemo(() => query.data || [], [query.data]);
  return {
    generations,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
