import { formatBrandDisplay, formatModelDisplay } from "./brand-format";
import { normalizeSlug } from "./slug";

/**
 * Hardcoded priority list of brand-model slugs that are the most searched
 * on Google CZ (based on typical SEO keyword volume for the Czech auto
 * market). Used to reorder UI lists and prioritize internal linking.
 *
 * The order here IS the priority — index 0 = highest.
 */
export const TOP_MODEL_SLUGS: readonly string[] = [
  "skoda-octavia",
  "skoda-kodiaq",
  "renault-megane",
  "renault-scenic",
  "skoda-superb",
  "volkswagen-golf",
  "volkswagen-golf-gti",
  "volkswagen-passat",
  "volkswagen-touran",
  "volvo-xc60",
  "volvo-xc90",
  "volvo-v90",
  "volvo-v60",
  "mercedes-benz-c-class",
  "bmw-3-series",
  "bmw-5-series",
  "bmw-x5",
  "bmw-x3",
  "audi-a4",
  "audi-a6",
  "audi-q5",
  "audi-q7",
  "mercedes-benz-e-class",
  "toyota-rav4",
  "toyota-corolla",
  "ford-focus",
  "ford-mondeo",
  "opel-insignia",
  "peugeot-5008",
  "kia-ceed",
  "hyundai-tucson",
  "peugeot-508",
  "citroen-c5",
  "dacia-duster",
] as const;

const TOP_SET = new Set(TOP_MODEL_SLUGS);

export function isTopModel(brandSlug: string, modelSlug: string): boolean {
  return TOP_SET.has(`${normalizeSlug(brandSlug)}-${normalizeSlug(modelSlug)}`);
}

/**
 * Sort an array of { brand, model, ... } so that TOP models come first
 * (in the priority order above), followed by the rest in their original
 * order. Non-destructive — returns a new array.
 */
export function sortByTopPriority<T extends { brand: string; model: string }>(
  rows: T[],
): T[] {
  const slugIndex = new Map<string, number>();
  TOP_MODEL_SLUGS.forEach((s, i) => slugIndex.set(s, i));

  return [...rows].sort((a, b) => {
    const sa = `${normalizeSlug(a.brand)}-${normalizeSlug(a.model)}`;
    const sb = `${normalizeSlug(b.brand)}-${normalizeSlug(b.model)}`;
    const ia = slugIndex.get(sa) ?? Infinity;
    const ib = slugIndex.get(sb) ?? Infinity;
    return ia - ib;
  });
}

export interface TopModelLink {
  slug: string;
  href: string;
  label: string;
}

/**
 * Build display-ready link objects for the top models list.
 * Useful for "Nejčastěji hledané vozy" blocks.
 */
export function getTopModelLinks(): TopModelLink[] {
  return TOP_MODEL_SLUGS.map((slug) => {
    const parts = slug.split("-");
    // Multi-word brands
    let brandRaw: string;
    let modelRaw: string;
    const twoWord = parts.slice(0, 2).join("-");
    const threeWord = parts.slice(0, 3).join("-");
    if (["mercedes-benz", "alfa-romeo", "land-rover"].includes(twoWord)) {
      brandRaw = twoWord;
      modelRaw = parts.slice(2).join("-");
    } else if (threeWord === "aston-martin") {
      brandRaw = threeWord;
      modelRaw = parts.slice(3).join("-");
    } else {
      brandRaw = parts[0];
      modelRaw = parts.slice(1).join("-");
    }
    const brandDisplay = formatBrandDisplay(brandRaw);
    const modelDisplay = formatModelDisplay(modelRaw);
    return {
      slug,
      href: `/auta/${normalizeSlug(brandRaw)}/${normalizeSlug(modelRaw)}`,
      label: `${brandDisplay} ${modelDisplay} na prodej`,
    };
  });
}

/**
 * Extract top models for a specific brand slug.
 */
export function getTopModelLinksForBrand(brandSlug: string): TopModelLink[] {
  const norm = normalizeSlug(brandSlug);
  return getTopModelLinks().filter((l) => l.slug.startsWith(`${norm}-`));
}
