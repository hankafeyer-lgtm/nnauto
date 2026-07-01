/**
 * SEO facet definitions for /auta/{facet} and /auta/{brand}/{facet} pages.
 * A page is only indexable when inventory >= MIN_FACET_LISTINGS.
 */

export const MIN_FACET_LISTINGS = 3;

export type FacetKind =
  | "fuel"
  | "transmission"
  | "body"
  | "drive"
  | "priceMax"
  | "year";

export type FacetDefinition = {
  slug: string;
  kind: FacetKind;
  value: string | number;
  /** Czech label for H1 / titles */
  label: string;
  /** Short label for breadcrumbs */
  shortLabel: string;
  /** Global /auta/{slug} */
  global: boolean;
  /** Allowed on /auta/{brand}/{slug} */
  brandLevel: boolean;
};

const FACETS: FacetDefinition[] = [
  { slug: "diesel", kind: "fuel", value: "diesel", label: "Nafta", shortLabel: "Diesel", global: true, brandLevel: true },
  { slug: "benzin", kind: "fuel", value: "benzin", label: "Benzín", shortLabel: "Benzín", global: true, brandLevel: true },
  { slug: "hybrid", kind: "fuel", value: "hybrid", label: "Hybrid", shortLabel: "Hybrid", global: true, brandLevel: true },
  { slug: "elektro", kind: "fuel", value: "elektro", label: "Elektro", shortLabel: "Elektro", global: true, brandLevel: true },
  { slug: "automat", kind: "transmission", value: "automat", label: "Automat", shortLabel: "Automat", global: true, brandLevel: true },
  { slug: "manual", kind: "transmission", value: "manual", label: "Manuál", shortLabel: "Manuál", global: true, brandLevel: true },
  { slug: "suv", kind: "body", value: "suv", label: "SUV", shortLabel: "SUV", global: true, brandLevel: true },
  { slug: "kombi", kind: "body", value: "kombi", label: "Kombi", shortLabel: "Kombi", global: true, brandLevel: true },
  { slug: "sedan", kind: "body", value: "sedan", label: "Sedan", shortLabel: "Sedan", global: true, brandLevel: true },
  { slug: "hatchback", kind: "body", value: "hatchback", label: "Hatchback", shortLabel: "Hatchback", global: true, brandLevel: false },
  { slug: "4x4", kind: "drive", value: "4x4", label: "4x4", shortLabel: "4x4", global: true, brandLevel: true },
  { slug: "do-200000", kind: "priceMax", value: 200000, label: "Do 200 000 Kč", shortLabel: "Do 200 000 Kč", global: true, brandLevel: true },
  { slug: "do-300000", kind: "priceMax", value: 300000, label: "Do 300 000 Kč", shortLabel: "Do 300 000 Kč", global: true, brandLevel: true },
  { slug: "do-500000", kind: "priceMax", value: 500000, label: "Do 500 000 Kč", shortLabel: "Do 500 000 Kč", global: true, brandLevel: true },
  { slug: "2018", kind: "year", value: 2018, label: "Ročník 2018", shortLabel: "2018", global: true, brandLevel: true },
  { slug: "2019", kind: "year", value: 2019, label: "Ročník 2019", shortLabel: "2019", global: true, brandLevel: true },
  { slug: "2020", kind: "year", value: 2020, label: "Ročník 2020", shortLabel: "2020", global: true, brandLevel: true },
  { slug: "2021", kind: "year", value: 2021, label: "Ročník 2021", shortLabel: "2021", global: true, brandLevel: true },
  { slug: "2022", kind: "year", value: 2022, label: "Ročník 2022", shortLabel: "2022", global: true, brandLevel: true },
  { slug: "2023", kind: "year", value: 2023, label: "Ročník 2023", shortLabel: "2023", global: true, brandLevel: true },
];

const BY_SLUG = new Map(FACETS.map((f) => [f.slug, f]));

export function getFacetBySlug(slug: string): FacetDefinition | undefined {
  return BY_SLUG.get(slug.toLowerCase());
}

export function isGlobalFacetSlug(slug: string): boolean {
  const f = getFacetBySlug(slug);
  return Boolean(f?.global);
}

export function isBrandFacetSlug(slug: string): boolean {
  const f = getFacetBySlug(slug);
  return Boolean(f?.brandLevel);
}

export function listGlobalFacets(): FacetDefinition[] {
  return FACETS.filter((f) => f.global);
}

export function listBrandFacets(): FacetDefinition[] {
  return FACETS.filter((f) => f.brandLevel);
}

export function buildGlobalFacetPath(slug: string): string {
  return `/auta/${slug}`;
}

export function buildBrandFacetPath(brandSlug: string, facetSlug: string): string {
  return `/auta/${brandSlug}/${facetSlug}`;
}

export function buildFacetTitle(
  facet: FacetDefinition,
  brandName?: string,
): string {
  if (brandName) {
    return `${brandName} ${facet.label} na prodej | NNAuto`;
  }
  if (facet.kind === "fuel" || facet.kind === "body" || facet.kind === "drive") {
    return `Auta ${facet.label} na prodej | Ojeté vozy | NNAuto`;
  }
  if (facet.kind === "priceMax") {
    return `Auta ${facet.shortLabel} | Ojeté vozy v ČR | NNAuto`;
  }
  if (facet.kind === "year") {
    return `Auta ${facet.value} na prodej | Ojeté vozy | NNAuto`;
  }
  return `Auta ${facet.label} na prodej | NNAuto`;
}

export function buildFacetH1(facet: FacetDefinition, brandName?: string): string {
  if (brandName) {
    return `${brandName} ${facet.label} na prodej`;
  }
  if (facet.kind === "year") return `Auta ${facet.value} na prodej`;
  if (facet.kind === "priceMax") return `Auta ${facet.shortLabel}`;
  return `Auta ${facet.label} na prodej`;
}

export function buildFacetDescription(
  facet: FacetDefinition,
  total: number,
  brandName?: string,
): string {
  const scope = brandName ? `${brandName} ` : "";
  return `Prohlédněte si ${total} inzerátů ${scope}${facet.label.toLowerCase()} na NNAuto.cz. Aktuální ceny, fotografie a parametry ojetých vozů od ověřených prodejců.`;
}

/** Related facet links for internal linking clusters */
export function getRelatedFacetLinks(
  current: FacetDefinition,
  brandSlug?: string,
  limit = 8,
): { label: string; href: string }[] {
  const pool = brandSlug
    ? listBrandFacets().filter((f) => f.slug !== current.slug)
    : listGlobalFacets().filter((f) => f.slug !== current.slug);

  const sameKind = pool.filter((f) => f.kind === current.kind);
  const other = pool.filter((f) => f.kind !== current.kind);
  const ordered = [...sameKind, ...other];

  return ordered.slice(0, limit).map((f) => ({
    label: brandSlug
      ? `${f.label}`
      : f.kind === "year"
        ? `Auta ${f.value}`
        : f.kind === "priceMax"
          ? `Auta ${f.shortLabel}`
          : `Auta ${f.label}`,
    href: brandSlug
      ? buildBrandFacetPath(brandSlug, f.slug)
      : buildGlobalFacetPath(f.slug),
  }));
}

export function getBrandFacetClusterLinks(
  brandSlug: string,
  brandName: string,
): { label: string; href: string }[] {
  const priority = ["suv", "diesel", "benzin", "kombi", "automat", "do-300000", "4x4"];
  return priority
    .map((slug) => getFacetBySlug(slug))
    .filter((f): f is FacetDefinition => Boolean(f?.brandLevel))
    .map((f) => ({
      label: `${brandName} ${f.label}`,
      href: buildBrandFacetPath(brandSlug, f.slug),
    }));
}
