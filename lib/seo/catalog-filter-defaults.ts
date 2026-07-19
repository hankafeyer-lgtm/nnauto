import type { FilterParams } from "@/hooks/useFilterParams";
import type { FacetDefinition } from "@lib/seo/facets";

function firstFacetValue(facet: FacetDefinition) {
  return Array.isArray(facet.value) ? String(facet.value[0]) : String(facet.value);
}

function fuelFilterValue(facet: FacetDefinition) {
  if (facet.slug === "diesel") return "nafta,diesel";
  if (facet.slug === "benzin") return "benzin,benzín";
  if (facet.slug === "elektro") return "elektro,electric,ev";
  return Array.isArray(facet.value) ? facet.value.map(String).join(",") : String(facet.value);
}

function driveFilterValue(facet: FacetDefinition) {
  if (facet.slug === "4x4") return "4x4,awd,4wd";
  return Array.isArray(facet.value) ? facet.value.map(String).join(",") : String(facet.value);
}

export function filtersForFacet(facet: FacetDefinition): FilterParams {
  switch (facet.kind) {
    case "fuel":
      return { fuel: fuelFilterValue(facet) };
    case "transmission":
      return { transmission: firstFacetValue(facet) };
    case "body":
      return { vehicleType: "osobni-auta", bodyType: [facet.slug] };
    case "drive":
      return { driveType: driveFilterValue(facet) };
    case "priceMax":
      return { priceMax: Number(facet.value) };
    case "priceRange":
      return { priceMin: facet.minValue, priceMax: facet.maxValue };
    case "priceMin":
      return { priceMin: Number(facet.value) };
    case "mileageMax":
      return { mileageMax: Number(facet.value) };
    case "region":
      return { region: firstFacetValue(facet) };
    case "year":
      return { yearMin: Number(facet.value), yearMax: Number(facet.value) };
    default:
      return {};
  }
}

export function mergeCatalogFilters(...filters: FilterParams[]): FilterParams {
  return Object.assign({}, ...filters);
}
