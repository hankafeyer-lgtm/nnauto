import type { FacetDefinition, FacetKind } from "@lib/seo/facets";
import { getFacetBySlug } from "@lib/seo/facets";
import { formatBrandDisplay, formatModelDisplay } from "@lib/seo/brand-format";

type FacetGroup =
  | "body"
  | "fuel"
  | "transmission"
  | "drive"
  | "year"
  | "price"
  | "region";

const FACET_GROUP_ORDER: FacetGroup[] = [
  "body",
  "fuel",
  "transmission",
  "drive",
  "year",
  "price",
  "region",
];

const ALLOWED_FACET_PAIR_GROUPS = new Set([
  "body:fuel",
  "body:price",
  "body:region",
  "fuel:price",
  "fuel:region",
  "transmission:region",
  "transmission:price",
  "drive:price",
  "drive:region",
  "year:price",
  "year:region",
]);

const MODEL_FACET_GROUPS = new Set<FacetGroup>([
  "region",
  "fuel",
  "price",
  "transmission",
  "year",
  "body",
  "drive",
]);

export function facetGroup(kind: FacetKind): FacetGroup | null {
  if (kind === "priceMax" || kind === "priceRange" || kind === "priceMin") {
    return "price";
  }
  if (
    kind === "body" ||
    kind === "fuel" ||
    kind === "transmission" ||
    kind === "drive" ||
    kind === "year" ||
    kind === "region"
  ) {
    return kind;
  }
  return null;
}

function pairKey(first: FacetDefinition, second: FacetDefinition): string | null {
  const a = facetGroup(first.kind);
  const b = facetGroup(second.kind);
  if (!a || !b || a === b) return null;
  const ordered = [a, b].sort(
    (left, right) => FACET_GROUP_ORDER.indexOf(left) - FACET_GROUP_ORDER.indexOf(right),
  );
  return `${ordered[0]}:${ordered[1]}`;
}

export function getFacetPairBySlugs(
  firstSlug: string,
  secondSlug: string,
): readonly [FacetDefinition, FacetDefinition] | null {
  const first = getFacetBySlug(firstSlug);
  const second = getFacetBySlug(secondSlug);
  if (!first?.global || !second?.global) return null;
  const key = pairKey(first, second);
  if (!key || !ALLOWED_FACET_PAIR_GROUPS.has(key)) return null;

  const ordered = [first, second].sort((left, right) => {
    const leftGroup = facetGroup(left.kind);
    const rightGroup = facetGroup(right.kind);
    if (!leftGroup || !rightGroup) return 0;
    return FACET_GROUP_ORDER.indexOf(leftGroup) - FACET_GROUP_ORDER.indexOf(rightGroup);
  }) as [FacetDefinition, FacetDefinition];

  return ordered;
}

export function isModelFacet(facet: FacetDefinition | null | undefined): facet is FacetDefinition {
  const group = facet ? facetGroup(facet.kind) : null;
  return Boolean(facet?.global && group && MODEL_FACET_GROUPS.has(group));
}

export function facetPairPath(facets: readonly [FacetDefinition, FacetDefinition]) {
  return `/auta/${facets[0].slug}/${facets[1].slug}`;
}

export function modelFacetPath(brandSlug: string, modelSlug: string, facet: FacetDefinition) {
  return `/auta/${brandSlug}/${modelSlug}/${facet.slug}`;
}

export function buildFacetPairRelatedLinks(facets: readonly [FacetDefinition, FacetDefinition]) {
  return [
    { label: facets[0].label, href: `/auta/${facets[0].slug}` },
    { label: facets[1].label, href: `/auta/${facets[1].slug}` },
  ];
}

export function buildModelFacetRelatedLinks(
  brandSlug: string,
  modelSlug: string,
  facet: FacetDefinition,
) {
  const brandName = formatBrandDisplay(brandSlug);
  const modelName = formatModelDisplay(modelSlug);
  return [
    { label: `${brandName} ${modelName}`, href: `/auta/${brandSlug}/${modelSlug}` },
    { label: `Všechna ${brandName}`, href: `/auta/${brandSlug}` },
    { label: facet.label, href: `/auta/${facet.slug}` },
  ];
}
