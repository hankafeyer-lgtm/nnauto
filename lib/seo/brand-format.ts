/**
 * Brand / model display formatting for SEO surfaces (title, H1, alt, meta).
 *
 * IMPORTANT: This module is *display-only*. It MUST NOT be used for slugs,
 * URL building, filter values, DB queries or anything that compares against
 * stored brand strings. Slugs stay lowercase as they are today.
 */

/**
 * Canonical capitalization for known brands. Stored values in DB are lowercase
 * slugs (e.g. "bmw", "mercedes-benz", "vw"). The values here are what we want
 * Google / users to see in titles, headings and alt texts.
 */
const BRAND_CANONICAL: Record<string, string> = {
  bmw: "BMW",
  audi: "Audi",
  skoda: "Škoda",
  "škoda": "Škoda",
  "mercedes-benz": "Mercedes-Benz",
  mercedes: "Mercedes-Benz",
  volkswagen: "Volkswagen",
  vw: "Volkswagen",
  seat: "SEAT",
  cupra: "Cupra",
  volvo: "Volvo",
  ford: "Ford",
  jeep: "Jeep",
  opel: "Opel",
  peugeot: "Peugeot",
  citroen: "Citroën",
  "citroën": "Citroën",
  renault: "Renault",
  fiat: "Fiat",
  alfa: "Alfa Romeo",
  "alfa-romeo": "Alfa Romeo",
  toyota: "Toyota",
  honda: "Honda",
  nissan: "Nissan",
  mazda: "Mazda",
  mitsubishi: "Mitsubishi",
  subaru: "Subaru",
  suzuki: "Suzuki",
  hyundai: "Hyundai",
  kia: "Kia",
  lexus: "Lexus",
  infiniti: "Infiniti",
  porsche: "Porsche",
  ferrari: "Ferrari",
  lamborghini: "Lamborghini",
  maserati: "Maserati",
  bentley: "Bentley",
  "rolls-royce": "Rolls-Royce",
  jaguar: "Jaguar",
  "land-rover": "Land Rover",
  "land rover": "Land Rover",
  landrover: "Land Rover",
  mini: "MINI",
  smart: "smart",
  tesla: "Tesla",
  chevrolet: "Chevrolet",
  cadillac: "Cadillac",
  chrysler: "Chrysler",
  dodge: "Dodge",
  ram: "RAM",
  gmc: "GMC",
  buick: "Buick",
  lincoln: "Lincoln",
  saab: "Saab",
  mg: "MG",
  dacia: "Dacia",
  lada: "Lada",
  tatra: "Tatra",
  iveco: "Iveco",
  isuzu: "Isuzu",
  "great-wall": "Great Wall",
  byd: "BYD",
  geely: "Geely",
  chery: "Chery",
  haval: "Haval",
  "ds-automobiles": "DS Automobiles",
  ds: "DS",
};

/**
 * Special-case canonical capitalizations for popular models that look bad
 * with naive first-letter capitalization (e.g. "octavia" → "Octavia",
 * "rs6" → "RS6"). Only used for display.
 */
const MODEL_CANONICAL: Record<string, string> = {
  octavia: "Octavia",
  fabia: "Fabia",
  superb: "Superb",
  rapid: "Rapid",
  yeti: "Yeti",
  kodiaq: "Kodiaq",
  karoq: "Karoq",
  kamiq: "Kamiq",
  citigo: "Citigo",
  scala: "Scala",
  enyaq: "Enyaq",
  roomster: "Roomster",
  felicia: "Felicia",
  passat: "Passat",
  golf: "Golf",
  "golf-gti": "Golf GTI",
  "golf-gtd": "Golf GTD",
  "golf-r": "Golf R",
  polo: "Polo",
  jetta: "Jetta",
  tiguan: "Tiguan",
  touareg: "Touareg",
  touran: "Touran",
  caddy: "Caddy",
  arteon: "Arteon",
  amarok: "Amarok",
  transporter: "Transporter",
  multivan: "Multivan",
  caravelle: "Caravelle",
  crafter: "Crafter",
  beetle: "Beetle",
  scirocco: "Scirocco",
  sharan: "Sharan",

  // Mercedes-Benz class line-up — naming convention uses a hyphen.
  "a-class": "A-Class",
  "b-class": "B-Class",
  "c-class": "C-Class",
  "e-class": "E-Class",
  "g-class": "G-Class",
  "m-class": "M-Class",
  "s-class": "S-Class",
  "v-class": "V-Class",
  "x-class": "X-Class",
  "t-class": "T-Class",
  cla: "CLA",
  cls: "CLS",
  gla: "GLA",
  glb: "GLB",
  glc: "GLC",
  gle: "GLE",
  gls: "GLS",
  slc: "SLC",
  slk: "SLK",
  amg: "AMG",
  "amg-gt": "AMG GT",
  eqa: "EQA",
  eqb: "EQB",
  eqc: "EQC",
  eqe: "EQE",
  eqs: "EQS",
  eqv: "EQV",
};

/**
 * Format a brand for SEO display.
 * - "bmw"  → "BMW"
 * - "skoda" → "Škoda"
 * - "mercedes-benz" → "Mercedes-Benz"
 * Falls back to a "Title Case" rendering of the raw slug (kebab-aware).
 */
export function formatBrandDisplay(raw: string | null | undefined): string {
  if (!raw) return "";
  const key = raw.trim().toLowerCase();
  if (!key) return "";
  if (BRAND_CANONICAL[key]) return BRAND_CANONICAL[key];

  // Fallback: split on hyphen / space and capitalize each piece.
  return key
    .split(/[-\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

/**
 * Format a model for SEO display. Keeps trailing alphanumerics intact
 * (e.g. "rs6" → "RS6", "a4" → "A4") via a simple heuristic for short tokens.
 */
export function formatModelDisplay(raw: string | null | undefined): string {
  if (!raw) return "";
  const key = raw.trim().toLowerCase();
  if (!key) return "";
  if (MODEL_CANONICAL[key]) return MODEL_CANONICAL[key];

  return key
    .split(/[-\s]+/)
    .filter(Boolean)
    .map((part) => {
      // Popular trim abbreviations should stay uppercase in snippets.
      if (/^(gti|gtd|gtr|rs|rsq|amg|m|m-sport|st|sti|opc|cupra|fr|r-line)$/.test(part)) {
        return part.toUpperCase();
      }
      // Tokens like "rs6", "m3", "a4", "x5" are usually all-uppercase.
      if (/^[a-z]{1,2}\d+$/.test(part)) return part.toUpperCase();
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join(" ");
}

/** Card/list heading: brand + model only (year shown separately in metadata). */
export function formatVehicleCardHeading(
  brand: string | null | undefined,
  model: string | null | undefined,
): string {
  return [formatBrandDisplay(brand), formatModelDisplay(model)]
    .filter(Boolean)
    .join(" ")
    .trim();
}

/** Helper: combined "Brand Model Year" with proper capitalization. */
export function formatVehicleTitle(
  brand: string | null | undefined,
  model: string | null | undefined,
  year: number | string | null | undefined,
): string {
  return [formatVehicleCardHeading(brand, model), year ? String(year) : ""]
    .filter(Boolean)
    .join(" ")
    .trim();
}
