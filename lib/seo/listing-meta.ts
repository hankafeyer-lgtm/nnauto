import {
  formatBrandDisplay,
  formatModelDisplay,
} from "./brand-format";
import { sanitizeJsonLd } from "./sanitize-jsonld";
import { normalizeSlug } from "./slug";

export type ListingSeoInput = {
  id?: string;
  brand?: string | null;
  model?: string | null;
  year?: number | string | null;
  price?: string | number | null;
  mileage?: number | null;
  fuelType?: string[] | string | null;
  transmission?: string[] | string | null;
  region?: string | null;
  trim?: string | null;
  engineVolume?: string | number | null;
  power?: number | null;
  bodyType?: string | null;
  description?: string | null;
  isSold?: boolean | null;
};

const FUEL_CS: Record<string, string> = {
  benzin: "benzín",
  diesel: "nafta",
  hybrid: "hybrid",
  elektro: "elektro",
  electric: "elektro",
  lpg: "LPG",
  cng: "CNG",
  ethanol: "ethanol",
  hydrogen: "vodík",
};

const TRANSMISSION_CS: Record<string, string> = {
  manual: "manuální převodovka",
  automat: "automatická převodovka",
  automatic: "automatická převodovka",
  robot: "robotizovaná převodovka",
  dsg: "DSG",
  cvt: "CVT",
};

const BODY_CS: Record<string, string> = {
  sedan: "sedan",
  hatchback: "hatchback",
  kombi: "kombi",
  suv: "SUV",
  crossover: "crossover",
  coupe: "kupé",
  cabrio: "kabriolet",
  convertible: "kabriolet",
  minivan: "minivan",
  pickup: "pickup",
  van: "dodávka",
  liftback: "liftback",
};

function arr(v: unknown): string[] {
  if (Array.isArray(v)) return v.filter(Boolean).map(String);
  if (typeof v === "string" && v.trim()) return [v.trim()];
  return [];
}

function titleCaseCs(value: string): string {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function formatFuelCs(listing: ListingSeoInput): string {
  const raw = arr(listing.fuelType)[0]?.toLowerCase() ?? "";
  return FUEL_CS[raw] || titleCaseCs(raw);
}

export function formatTransmissionCs(listing: ListingSeoInput): string {
  const raw = arr(listing.transmission)[0]?.toLowerCase() ?? "";
  return TRANSMISSION_CS[raw] || titleCaseCs(raw);
}

export function formatBodyCs(listing: ListingSeoInput): string {
  const raw = String(listing.bodyType ?? "").trim().toLowerCase();
  return BODY_CS[raw] || titleCaseCs(raw);
}

export function formatRegionCs(region: string | null | undefined): string {
  if (!region) return "";
  return region
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatListingPrice(
  listing: ListingSeoInput,
  locale = "cs-CZ",
): string {
  const price = Number(listing.price);
  if (!Number.isFinite(price) || price <= 0) return "";
  return price.toLocaleString(locale);
}

function trimDetail(listing: ListingSeoInput): string {
  const trim = String(listing.trim ?? "").trim();
  if (trim) return trim;
  const engine = listing.engineVolume
    ? `${listing.engineVolume}`.replace(/\.0$/, "")
    : "";
  if (engine) return `${engine} l`;
  return "";
}

function powerDetail(listing: ListingSeoInput): string {
  const power = listing.power;
  if (!power || power <= 0) return "";
  return `${power} kW`;
}

/** Visible H1: Brand Model [Trim] Year */
export function buildListingH1(listing: ListingSeoInput): string {
  const brand = formatBrandDisplay(listing.brand);
  const model = formatModelDisplay(listing.model);
  const detail = trimDetail(listing);
  const year = listing.year ? String(listing.year) : "";
  return [brand, model, detail, year].filter(Boolean).join(" ").trim();
}

const MAX_TITLE_LEN = 62;

/** SEO title: Brand Model Year na prodej | Price Kč | NNAuto */
export function buildListingSeoTitle(listing: ListingSeoInput): string {
  const brand = formatBrandDisplay(listing.brand);
  const model = formatModelDisplay(listing.model);
  const year = listing.year ? String(listing.year) : "";
  const price = formatListingPrice(listing);
  const detail = trimDetail(listing);
  const power = powerDetail(listing);

  const rich = [brand, model, detail, year].filter(Boolean).join(" ");
  const richSuffix = power ? ` | ${power}` : "";
  const richTitle = price
    ? `${rich} na prodej${richSuffix} | ${price} Kč | NNAuto`
    : `${rich} na prodej | NNAuto`;

  if (richTitle.length <= MAX_TITLE_LEN + 8) return richTitle;

  const standard = [brand, model, year].filter(Boolean).join(" ");
  const standardTitle = price
    ? `${standard} na prodej | ${price} Kč | NNAuto`
    : `${standard} na prodej | NNAuto`;

  if (standardTitle.length <= MAX_TITLE_LEN + 6) return standardTitle;

  if (price) {
    const compact = `${standard} | ${price} Kč | NNAuto`;
    if (compact.length <= MAX_TITLE_LEN + 10) return compact;
  }

  return `${standard} | NNAuto`;
}

/** Meta description in Czech with optional fields only when present. */
export function buildListingSeoDescription(listing: ListingSeoInput): string {
  const brand = formatBrandDisplay(listing.brand);
  const model = formatModelDisplay(listing.model);
  const year = listing.year ? String(listing.year) : "";
  const price = formatListingPrice(listing);
  const mileage =
    listing.mileage != null
      ? listing.mileage.toLocaleString("cs-CZ")
      : "";
  const fuel = formatFuelCs(listing);
  const transmission = formatTransmissionCs(listing);
  const region = formatRegionCs(listing.region);

  const parts: string[] = [];
  const vehicle = [brand, model, year].filter(Boolean).join(" ");
  if (vehicle && price) {
    parts.push(`Koupit ${vehicle} za ${price} Kč.`);
  } else if (vehicle) {
    parts.push(`Koupit ${vehicle} na NNAuto.cz.`);
  }

  const specs: string[] = [];
  if (mileage) specs.push(`najeto ${mileage} km`);
  if (fuel) specs.push(fuel);
  if (transmission) specs.push(transmission);
  if (region) specs.push(`lokalita ${region}`);

  if (specs.length) {
    parts.push(`${specs.join(", ")}.`);
  }

  parts.push("Ověřené vozy na NNAuto.cz.");

  return parts.join(" ").replace(/\s+/g, " ").trim().slice(0, 300);
}

export function buildListingImageAlt(
  listing: ListingSeoInput,
  photoIndex = 0,
): string {
  const parts = [
    formatBrandDisplay(listing.brand),
    formatModelDisplay(listing.model),
    listing.year ? String(listing.year) : "",
  ].filter(Boolean);
  const base = parts.join(" ");
  if (!base) return "";
  if (photoIndex <= 0) return `${base} na prodej – hlavní fotografie`;
  return `${base} – fotografie vozu`;
}

function hashSeed(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) >>> 0;
  }
  return h;
}

/** Natural Czech SEO paragraph with light variation per listing. */
export function buildListingSeoParagraph(listing: ListingSeoInput): string {
  const brand = formatBrandDisplay(listing.brand);
  const model = formatModelDisplay(listing.model);
  const year = listing.year ? String(listing.year) : "";
  const mileage =
    listing.mileage != null
      ? listing.mileage.toLocaleString("cs-CZ")
      : "";
  const fuel = formatFuelCs(listing);
  const transmission = formatTransmissionCs(listing);
  const body = formatBodyCs(listing);
  const engine = listing.engineVolume ? `${listing.engineVolume} l` : "";
  const power = powerDetail(listing);
  const vehicle = [brand, model, year].filter(Boolean).join(" ");

  const seed = hashSeed(
    `${listing.id ?? ""}:${listing.brand ?? ""}:${listing.model ?? ""}`,
  );
  const variant = seed % 4;

  const intros = [
    `${vehicle} je praktický vůz vhodný pro každodenní používání i delší cesty.`,
    `${vehicle} nabízí vyváženou kombinaci komfortu, výbavy a provozních nákladů.`,
    `${vehicle} je atraktivní volbou pro řidiče, kteří hledají spolehlivé auto s jasnými parametry.`,
    `${vehicle} patří mezi oblíbené vozy ve své kategorii díky prostoru a jízdním vlastnostem.`,
  ];

  const sentences: string[] = [intros[variant] ?? intros[0]];

  const specBits: string[] = [];
  if (mileage) specBits.push(`najeto ${mileage} km`);
  if (engine) specBits.push(`motor ${engine}`);
  else if (power) specBits.push(`výkon ${power}`);
  if (fuel) specBits.push(`palivo ${fuel}`);
  if (transmission) specBits.push(`převodovka ${transmission}`);

  if (specBits.length) {
    sentences.push(`Tento vůz má ${specBits.join(", ")}.`);
  }

  if (body) {
    const bodyLines = [
      `Díky karoserii ${body} je vhodnou volbou pro rodinu i praktické využití.`,
      `Karoserie ${body} přináší dobrý kompromis mezi prostorem a ovladatelností.`,
      `Jako ${body} nabízí dostatek místa pro cestující i zavazadla.`,
      `Pro řidiče, kteří preferují ${body}, jde o vyváženou volbu na trhu ojetin.`,
    ];
    sentences.push(bodyLines[variant] ?? bodyLines[0]);
  }

  sentences.push(
    "Na NNAuto.cz najdete aktuální fotografie, technické parametry a možnost kontaktovat prodejce přímo.",
  );

  return sentences.join(" ");
}

export type ListingInternalLink = {
  label: string;
  href: string;
};

export function buildListingInternalLinks(
  listing: ListingSeoInput,
): ListingInternalLink[] {
  const brandSlug = normalizeSlug(listing.brand ?? "");
  const modelSlug = normalizeSlug(listing.model ?? "");
  const brand = formatBrandDisplay(listing.brand);
  const model = formatModelDisplay(listing.model);
  const year = listing.year ? String(listing.year) : "";
  const fuel = arr(listing.fuelType)[0];
  const body = listing.bodyType ? String(listing.bodyType) : "";
  const price = Number(listing.price);
  const links: ListingInternalLink[] = [];

  if (brandSlug) {
    links.push({
      label: `Další vozy ${brand}`,
      href: `/auta/${brandSlug}`,
    });
  }
  if (brandSlug && modelSlug) {
    links.push({
      label: "Podobné modely",
      href: `/auta/${brandSlug}/${modelSlug}`,
    });
  }
  if (Number.isFinite(price) && price > 0) {
    const spread = Math.max(50000, Math.round(price * 0.15));
    const priceMin = Math.max(0, price - spread);
    const priceMax = price + spread;
    links.push({
      label: "Vozy do podobné ceny",
      href: `/listings?priceMin=${priceMin}&priceMax=${priceMax}`,
    });
  }
  if (year) {
    links.push({
      label: "Vozy z podobného roku",
      href: `/listings?yearMin=${year}&yearMax=${year}`,
    });
  }
  if (fuel) {
    links.push({
      label: "Vozy se stejným palivem",
      href: `/listings?fuelType=${encodeURIComponent(fuel)}`,
    });
  }
  if (body) {
    links.push({
      label: "Vozy se stejnou karoserií",
      href: `/listings?bodyType=${encodeURIComponent(body)}`,
    });
  }

  return links;
}

export function stripUndefined<T extends Record<string, unknown>>(
  obj: T,
): Partial<T> {
  return (sanitizeJsonLd(obj) ?? {}) as Partial<T>;
}
