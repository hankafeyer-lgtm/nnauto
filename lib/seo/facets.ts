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
  | "priceRange"
  | "priceMin"
  | "mileageMax"
  | "region"
  | "year";

export type FacetDefinition = {
  slug: string;
  kind: FacetKind;
  value: string | number | readonly string[];
  minValue?: number;
  maxValue?: number;
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
  { slug: "plug-in-hybrid", kind: "fuel", value: ["plug-in hybrid", "plugin hybrid", "phev", "plug in hybrid"], label: "Plug-in hybrid", shortLabel: "Plug-in hybrid", global: true, brandLevel: true },
  { slug: "elektro", kind: "fuel", value: ["elektro", "electric", "ev", "elektricke"], label: "Elektro", shortLabel: "Elektro", global: true, brandLevel: true },
  { slug: "lpg", kind: "fuel", value: "lpg", label: "LPG", shortLabel: "LPG", global: true, brandLevel: true },
  { slug: "cng", kind: "fuel", value: "cng", label: "CNG", shortLabel: "CNG", global: true, brandLevel: true },
  { slug: "automat", kind: "transmission", value: ["automat", "automatic", "automaticka", "automatická"], label: "Automat", shortLabel: "Automat", global: true, brandLevel: true },
  { slug: "manual", kind: "transmission", value: "manual", label: "Manuál", shortLabel: "Manuál", global: true, brandLevel: true },
  { slug: "suv", kind: "body", value: "suv", label: "SUV", shortLabel: "SUV", global: true, brandLevel: true },
  { slug: "kombi", kind: "body", value: "kombi", label: "Kombi", shortLabel: "Kombi", global: true, brandLevel: true },
  { slug: "sedan", kind: "body", value: "sedan", label: "Sedan", shortLabel: "Sedan", global: true, brandLevel: true },
  { slug: "hatchback", kind: "body", value: "hatchback", label: "Hatchback", shortLabel: "Hatchback", global: true, brandLevel: true },
  { slug: "coupe", kind: "body", value: ["coupe", "kupé", "kupe"], label: "Coupe", shortLabel: "Coupe", global: true, brandLevel: true },
  { slug: "kabriolet", kind: "body", value: ["kabriolet", "cabrio", "convertible"], label: "Kabriolet", shortLabel: "Kabriolet", global: true, brandLevel: true },
  { slug: "pickup", kind: "body", value: ["pickup", "pick-up"], label: "Pickup", shortLabel: "Pickup", global: true, brandLevel: true },
  { slug: "mpv", kind: "body", value: ["mpv", "minivan"], label: "MPV", shortLabel: "MPV", global: true, brandLevel: true },
  { slug: "van", kind: "body", value: "van", label: "Van", shortLabel: "Van", global: true, brandLevel: true },
  { slug: "4x4", kind: "drive", value: "4x4", label: "4x4", shortLabel: "4x4", global: true, brandLevel: true },
  { slug: "awd", kind: "drive", value: "awd", label: "AWD", shortLabel: "AWD", global: true, brandLevel: true },
  { slug: "predni-nahon", kind: "drive", value: ["fwd", "přední náhon", "predni nahon"], label: "Přední náhon", shortLabel: "Přední náhon", global: true, brandLevel: true },
  { slug: "zadni-nahon", kind: "drive", value: ["rwd", "zadní náhon", "zadni nahon"], label: "Zadní náhon", shortLabel: "Zadní náhon", global: true, brandLevel: true },
  { slug: "do-100000", kind: "priceMax", value: 100000, label: "Do 100 000 Kč", shortLabel: "Do 100 000 Kč", global: true, brandLevel: true },
  { slug: "do-200000", kind: "priceMax", value: 200000, label: "Do 200 000 Kč", shortLabel: "Do 200 000 Kč", global: true, brandLevel: true },
  { slug: "do-300000", kind: "priceMax", value: 300000, label: "Do 300 000 Kč", shortLabel: "Do 300 000 Kč", global: true, brandLevel: true },
  { slug: "do-500000", kind: "priceMax", value: 500000, label: "Do 500 000 Kč", shortLabel: "Do 500 000 Kč", global: true, brandLevel: true },
  { slug: "500-700-tisic", kind: "priceRange", value: "500-700-tisic", minValue: 500000, maxValue: 700000, label: "500–700 tisíc Kč", shortLabel: "500–700 tisíc Kč", global: true, brandLevel: true },
  { slug: "700-tisic-1-milion", kind: "priceRange", value: "700-tisic-1-milion", minValue: 700000, maxValue: 1000000, label: "700 tisíc–1 milion Kč", shortLabel: "700 tisíc–1 milion Kč", global: true, brandLevel: true },
  { slug: "nad-1-milion", kind: "priceMin", value: 1000000, label: "Nad 1 milion Kč", shortLabel: "Nad 1 milion Kč", global: true, brandLevel: true },
  { slug: "do-50000-km", kind: "mileageMax", value: 50000, label: "Do 50 000 km", shortLabel: "Do 50 000 km", global: true, brandLevel: true },
  { slug: "do-100000-km", kind: "mileageMax", value: 100000, label: "Do 100 000 km", shortLabel: "Do 100 000 km", global: true, brandLevel: true },
  { slug: "do-150000-km", kind: "mileageMax", value: 150000, label: "Do 150 000 km", shortLabel: "Do 150 000 km", global: true, brandLevel: true },
  { slug: "do-200000-km", kind: "mileageMax", value: 200000, label: "Do 200 000 km", shortLabel: "Do 200 000 km", global: true, brandLevel: true },
  { slug: "do-300000-km", kind: "mileageMax", value: 300000, label: "Do 300 000 km", shortLabel: "Do 300 000 km", global: true, brandLevel: true },
  { slug: "praha", kind: "region", value: ["praha", "hlavní město praha", "hlavni mesto praha"], label: "Praha", shortLabel: "Praha", global: true, brandLevel: true },
  { slug: "brno", kind: "region", value: ["brno", "jihomoravský kraj", "jihomoravsky kraj"], label: "Brno", shortLabel: "Brno", global: true, brandLevel: true },
  { slug: "ostrava", kind: "region", value: ["ostrava", "moravskoslezský kraj", "moravskoslezsky kraj"], label: "Ostrava", shortLabel: "Ostrava", global: true, brandLevel: true },
  { slug: "plzen", kind: "region", value: ["plzeň", "plzen", "plzeňský kraj", "plzensky kraj"], label: "Plzeň", shortLabel: "Plzeň", global: true, brandLevel: true },
  { slug: "liberec", kind: "region", value: ["liberec", "liberecký kraj", "liberecky kraj"], label: "Liberec", shortLabel: "Liberec", global: true, brandLevel: true },
  { slug: "olomouc", kind: "region", value: ["olomouc", "olomoucký kraj", "olomoucky kraj"], label: "Olomouc", shortLabel: "Olomouc", global: true, brandLevel: true },
  { slug: "pardubice", kind: "region", value: ["pardubice", "pardubický kraj", "pardubicky kraj"], label: "Pardubice", shortLabel: "Pardubice", global: true, brandLevel: true },
  { slug: "hradec-kralove", kind: "region", value: ["hradec králové", "hradec kralove", "královéhradecký kraj", "kralovehradecky kraj"], label: "Hradec Králové", shortLabel: "Hradec Králové", global: true, brandLevel: true },
  { slug: "ceske-budejovice", kind: "region", value: ["české budějovice", "ceske budejovice", "jihočeský kraj", "jihocesky kraj"], label: "České Budějovice", shortLabel: "České Budějovice", global: true, brandLevel: true },
  { slug: "2010", kind: "year", value: 2010, label: "Ročník 2010", shortLabel: "2010", global: true, brandLevel: true },
  { slug: "2011", kind: "year", value: 2011, label: "Ročník 2011", shortLabel: "2011", global: true, brandLevel: true },
  { slug: "2012", kind: "year", value: 2012, label: "Ročník 2012", shortLabel: "2012", global: true, brandLevel: true },
  { slug: "2013", kind: "year", value: 2013, label: "Ročník 2013", shortLabel: "2013", global: true, brandLevel: true },
  { slug: "2014", kind: "year", value: 2014, label: "Ročník 2014", shortLabel: "2014", global: true, brandLevel: true },
  { slug: "2015", kind: "year", value: 2015, label: "Ročník 2015", shortLabel: "2015", global: true, brandLevel: true },
  { slug: "2016", kind: "year", value: 2016, label: "Ročník 2016", shortLabel: "2016", global: true, brandLevel: true },
  { slug: "2017", kind: "year", value: 2017, label: "Ročník 2017", shortLabel: "2017", global: true, brandLevel: true },
  { slug: "2018", kind: "year", value: 2018, label: "Ročník 2018", shortLabel: "2018", global: true, brandLevel: true },
  { slug: "2019", kind: "year", value: 2019, label: "Ročník 2019", shortLabel: "2019", global: true, brandLevel: true },
  { slug: "2020", kind: "year", value: 2020, label: "Ročník 2020", shortLabel: "2020", global: true, brandLevel: true },
  { slug: "2021", kind: "year", value: 2021, label: "Ročník 2021", shortLabel: "2021", global: true, brandLevel: true },
  { slug: "2022", kind: "year", value: 2022, label: "Ročník 2022", shortLabel: "2022", global: true, brandLevel: true },
  { slug: "2023", kind: "year", value: 2023, label: "Ročník 2023", shortLabel: "2023", global: true, brandLevel: true },
  { slug: "2024", kind: "year", value: 2024, label: "Ročník 2024", shortLabel: "2024", global: true, brandLevel: true },
  { slug: "2025", kind: "year", value: 2025, label: "Ročník 2025", shortLabel: "2025", global: true, brandLevel: true },
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
    if (facet.slug === "suv") {
      return `${brandName} SUV na prodej | Ojeté SUV vozy | NNAuto`;
    }
    return `${brandName} ${facet.label} na prodej | NNAuto`;
  }
  if (facet.slug === "suv") {
    return "SUV auta na prodej | Ojeté SUV vozy v ČR | NNAuto";
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
  if (facet.kind === "region") {
    return `Auta ${facet.label} na prodej | Ojeté vozy v okolí | NNAuto`;
  }
  if (facet.kind === "mileageMax") {
    return `Auta ${facet.shortLabel} | Ojeté vozy s nízkým nájezdem | NNAuto`;
  }
  if (facet.kind === "priceRange" || facet.kind === "priceMin") {
    return `Auta ${facet.shortLabel} | Ojeté vozy v ČR | NNAuto`;
  }
  return `Auta ${facet.label} na prodej | NNAuto`;
}

export function buildFacetH1(facet: FacetDefinition, brandName?: string): string {
  if (brandName) {
    if (facet.slug === "suv") return `${brandName} SUV na prodej`;
    return `${brandName} ${facet.label} na prodej`;
  }
  if (facet.slug === "suv") return "SUV auta na prodej";
  if (facet.kind === "region") return `Auta ${facet.label} na prodej`;
  if (facet.kind === "mileageMax") return `Auta ${facet.shortLabel}`;
  if (facet.kind === "year") return `Auta ${facet.value} na prodej`;
  if (facet.kind === "priceMax") return `Auta ${facet.shortLabel}`;
  if (facet.kind === "priceRange" || facet.kind === "priceMin") return `Auta ${facet.shortLabel}`;
  return `Auta ${facet.label} na prodej`;
}

export function buildFacetDescription(
  facet: FacetDefinition,
  total: number,
  brandName?: string,
): string {
  if (facet.slug === "suv") {
    const scope = brandName ? `${brandName} SUV` : "SUV auta";
    return `Prohlédněte si ${total} inzerátů ${scope} na prodej v ČR. Aktuální ceny, fotografie, výbava a parametry ojetých SUV vozů od ověřených prodejců na NNAuto.cz.`;
  }
  if (facet.kind === "region") {
    return `Prohlédněte si ${total} inzerátů aut v lokalitě ${facet.label}. Aktuální nabídka ojetých vozů v okolí, ceny, fotografie, výbava a kontakt přímo na prodejce.`;
  }
  if (facet.kind === "mileageMax") {
    return `Prohlédněte si ${total} inzerátů aut ${facet.shortLabel}. Ojeté vozy s nižším nájezdem, aktuální ceny, fotografie, výbava a parametry na NNAuto.cz.`;
  }
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
