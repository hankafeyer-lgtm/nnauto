import { XMLParser } from "fast-xml-parser";

/**
 * Universal XML feed importer.
 *
 * Dealers export inventory in many different XML shapes (different root/item
 * tags, different field names, different languages). This module auto-detects
 * the repeating item element, maps each item's fields to our internal listing
 * shape using a dictionary of synonyms, and normalizes values (fuel, gearbox,
 * drive, price, mileage, engine volume, …) to the canonical values the site
 * uses for filtering.
 *
 * The output is intentionally "best effort": missing required fields are left
 * undefined and the caller (sync route) fills in dealer-level defaults and runs
 * Zod validation, reporting per-item errors instead of failing the whole feed.
 */

export interface MappedVehicle {
  externalId?: string;
  title?: string;
  brand?: string;
  model?: string;
  year?: number;
  mileage?: number;
  price?: string;
  fuelType?: string[];
  transmission?: string[];
  bodyType?: string;
  color?: string;
  driveType?: string[];
  engineVolume?: string;
  power?: number;
  doors?: number;
  seats?: number;
  condition?: string;
  vehicleType?: string;
  vin?: string;
  region?: string;
  phone?: string;
  description?: string;
  photos?: string[];
}

export interface ParseResult {
  items: MappedVehicle[];
  itemCount: number;
  /** Per target-field how many items had a value (for the preview/coverage). */
  coverage: Record<string, number>;
  warnings: string[];
}

// ── Field synonym dictionaries ───────────────────────────────────────────────
// Keys are normalized (lowercased, non-alphanumerics stripped) before matching,
// so "engine_volume", "engineVolume" and "engine-volume" all match "enginevolume".

const FIELD_ALIASES: Record<keyof MappedVehicle, string[]> = {
  externalId: [
    "id", "externalid", "vehicleid", "carid", "adid", "advertid", "inzeratid",
    "idvozidla", "guid", "sku", "ref", "reference", "stockid", "stocknumber",
    "offerid", "code", "kod", "uid",
  ],
  title: ["title", "name", "nazev", "headline", "fulltitle", "caption", "subject"],
  brand: ["brand", "make", "marka", "manufacturer", "znacka", "vyrobce", "marke", "mark"],
  model: ["model", "modelname", "modell", "modeldesc", "typ"],
  year: [
    "year", "rok", "rokvyroby", "yearofmanufacture", "manufactureyear", "baujahr",
    "registrationyear", "firstregistration", "rokregistrace", "datefirstregistration",
    "datumprvniregistrace", "vyrobenrok", "modelyear",
  ],
  mileage: [
    "mileage", "km", "najeto", "najetokm", "tachometr", "odometer", "kilometers",
    "kilometraz", "laufleistung", "probeh", "stavtachometru", "mileageכm",
  ],
  price: [
    "price", "cena", "priceczk", "amount", "preis", "cenasdph", "cenavczk",
    "cenakc", "cenaeur", "sellingprice", "pricewithvat", "cenacelkem",
  ],
  fuelType: ["fuel", "fueltype", "palivo", "kraftstoff", "druhpaliva", "typpaliva"],
  transmission: [
    "transmission", "gearbox", "prevodovka", "getriebe", "typprevodovky", "kpp",
    "gear", "prevod",
  ],
  bodyType: [
    "bodytype", "body", "karoserie", "typkaroserie", "bauart", "kuzov", "carbody",
    "bodystyle", "typkaroserie",
  ],
  color: ["color", "colour", "barva", "farbe", "exteriorcolor", "barvavozu", "barvavnejsi"],
  driveType: ["drive", "drivetype", "pohon", "antrieb", "druhpohonu", "typpohonu", "drivenwheels"],
  engineVolume: [
    "enginevolume", "objem", "objemmotoru", "ccm", "hubraum", "displacement",
    "objemvalcu", "cubiccapacity", "enginesize", "objemccm",
  ],
  power: [
    "power", "vykon", "kw", "leistung", "enginepower", "vykonmotoru", "ps",
    "horsepower", "hp", "powerkw", "vykonkw",
  ],
  doors: ["doors", "dvere", "pocetdveri", "tueren", "numberofdoors"],
  seats: ["seats", "mista", "pocetmist", "sitze", "pocetsedadel", "numberofseats"],
  condition: ["condition", "stav", "state", "zustand", "stavvozidla"],
  vehicleType: [
    "vehicletype", "typvozidla", "category", "kategorie", "druhvozidla",
    "fahrzeugart", "type",
  ],
  vin: ["vin", "vincode", "vinkod", "fin", "vincislo"],
  region: ["region", "kraj", "location", "lokalita", "mesto", "city", "ort", "place"],
  phone: ["phone", "telefon", "tel", "mobil", "phonenumber", "telefonni", "contactphone"],
  description: [
    "description", "popis", "text", "beschreibung", "note", "poznamka",
    "fulldescription", "detail", "comment", "info",
  ],
  photos: [
    "photos", "images", "image", "img", "photo", "foto", "fotky", "obrazky",
    "bilder", "picture", "pictures", "media", "gallery", "fotogalerie", "url",
  ],
};

// ── Value normalization dictionaries ─────────────────────────────────────────

const FUEL_MAP: Array<[RegExp, string]> = [
  [/diesel|nafta|дизель|tdi/i, "diesel"],
  [/hybrid|hev|phev|plugin|гибрид|гібрид/i, "hybrid"],
  [/electric|elektro|elektr|^ev$|\bev\b|bev|электро|електро/i, "electric"],
  [/lpg/i, "lpg"],
  [/cng/i, "cng"],
  [/benz|petrol|gasolin|essence|бензин|gas\b/i, "benzin"],
];

const TRANSMISSION_MAP: Array<[RegExp, string]> = [
  [/auto|dsg|tiptronic|cvt|dct|steptronic|s.?tronic|pdk|автомат/i, "automatic"],
  [/manu|mechan|schalt|ručn|rucn|механ|\bmt\b/i, "manual"],
];

const DRIVE_MAP: Array<[RegExp, string]> = [
  [/awd|4x4|4wd|allwheel|allrad|quattro|4motion|xdrive|všechna|vsechna|повн|4matic/i, "awd"],
  [/rwd|zadn|rear|heck|задн/i, "rwd"],
  [/fwd|predn|přední|front|передн/i, "fwd"],
];

const CONDITION_MAP: Array<[RegExp, string]> = [
  [/new|nov[éýa]|neu|нов|0\s?km|brandnew|unused/i, "new"],
  [/used|ojet|gebraucht|second|\bбу\b|вживан|pre.?owned|vorf/i, "used"],
];

const BODY_MAP: Array<[RegExp, string]> = [
  [/sedan|limous|седан/i, "sedan"],
  [/hatch|liftback/i, "hatchback"],
  [/kombi|estate|combi|tour|univers|караван|wagon/i, "kombi"],
  [/suv|crossover|terrain|geland|offroad/i, "suv"],
  [/coupe|kupé|kupe/i, "coupe"],
  [/cabrio|convert|roadster|kabriolet/i, "cabrio"],
  [/\bmpv\b|\bvan\b|minivan|dodáv|dodav|kleinbus|microbus/i, "mpv"],
  [/pickup|pick.?up|valník|valnik/i, "pickup"],
];

function applyMap(value: string, map: Array<[RegExp, string]>): string | null {
  for (const [re, out] of map) {
    if (re.test(value)) return out;
  }
  return null;
}

function normalizeKey(key: string): string {
  return key.toLowerCase().replace(/[^a-z0-9а-яёіїєґ]/gi, "");
}

/**
 * Reduce any XML value (string, number, object with #text / cdata / url, array)
 * to a trimmed string. Returns "" when nothing usable is found.
 */
function coerceText(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) {
    for (const v of value) {
      const t = coerceText(v);
      if (t) return t;
    }
    return "";
  }
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    for (const k of ["#text", "value", "_", "cdata", "url", "href", "src"]) {
      if (obj[k] != null) {
        const t = coerceText(obj[k]);
        if (t) return t;
      }
    }
  }
  return "";
}

// ── Item detection ───────────────────────────────────────────────────────────

const ITEM_TAG_HINTS = [
  "vozidlo", "vozidla", "auto", "car", "vehicle", "inzerat", "inzeraty",
  "nabidka", "advert", "offer", "produkt", "product", "item", "ad", "listing",
];

/** Collect every array-of-objects in the tree. */
function collectObjectArrays(node: unknown, out: unknown[][]): void {
  if (Array.isArray(node)) {
    if (node.length > 0 && node.every((n) => n != null && typeof n === "object" && !Array.isArray(n))) {
      out.push(node);
    }
    for (const n of node) collectObjectArrays(n, out);
    return;
  }
  if (node != null && typeof node === "object") {
    for (const v of Object.values(node as Record<string, unknown>)) {
      collectObjectArrays(v, out);
    }
  }
}

/** Find single-object item under a hinted tag name (feeds with exactly 1 car). */
function findHintedSingle(node: unknown): unknown[] | null {
  if (node == null || typeof node !== "object" || Array.isArray(node)) return null;
  for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
    if (ITEM_TAG_HINTS.includes(normalizeKey(k)) && v != null && typeof v === "object" && !Array.isArray(v)) {
      return [v];
    }
    const nested = findHintedSingle(v);
    if (nested) return nested;
  }
  return null;
}

function detectItems(root: unknown): unknown[] {
  const arrays: unknown[][] = [];
  collectObjectArrays(root, arrays);
  if (arrays.length > 0) {
    // Pick the largest array of objects — that's almost always the vehicle list.
    arrays.sort((a, b) => b.length - a.length);
    return arrays[0];
  }
  const single = findHintedSingle(root);
  return single ?? [];
}

// ── Per-item field flattening ────────────────────────────────────────────────

/**
 * Walk an item object and build a flat map of normalizedKey -> string value
 * (first occurrence wins). Handles feeds that nest fields under sub-elements
 * like <identification><make>…</make></identification>.
 */
function flattenItem(item: unknown, out: Map<string, string>, depth = 0): void {
  if (depth > 6 || item == null || typeof item !== "object") return;
  if (Array.isArray(item)) {
    for (const v of item) flattenItem(v, out, depth + 1);
    return;
  }
  for (const [rawKey, value] of Object.entries(item as Record<string, unknown>)) {
    const key = normalizeKey(rawKey);
    if (!key) continue;
    if (value != null && typeof value === "object" && !Array.isArray(value)) {
      // Object may itself be a scalar wrapper (#text). Record its text, then recurse.
      const text = coerceText(value);
      if (text && !out.has(key)) out.set(key, text);
      flattenItem(value, out, depth + 1);
    } else if (Array.isArray(value)) {
      flattenItem(value, out, depth + 1);
    } else {
      const text = coerceText(value);
      if (text && !out.has(key)) out.set(key, text);
    }
  }
}

function pick(flat: Map<string, string>, aliases: string[]): string {
  for (const alias of aliases) {
    const v = flat.get(normalizeKey(alias));
    if (v) return v;
  }
  return "";
}

// ── Photo extraction ─────────────────────────────────────────────────────────

const PHOTO_KEY_RE = /(photo|image|img|foto|obrazek|obrazky|bild|picture|media|gallery|fotky)/i;
const URL_RE = /^(https?:)?\/\/.+|^\/.+\.(jpe?g|png|webp|gif|avif)/i;

function collectPhotos(node: unknown, out: string[], underPhotoKey = false): void {
  if (node == null) return;
  if (typeof node === "string") {
    const s = node.trim();
    if (underPhotoKey && s && (URL_RE.test(s) || /\.(jpe?g|png|webp|gif|avif)(\?|$)/i.test(s))) {
      out.push(s);
    }
    return;
  }
  if (Array.isArray(node)) {
    for (const v of node) collectPhotos(v, out, underPhotoKey);
    return;
  }
  if (typeof node === "object") {
    for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
      const isPhotoKey = underPhotoKey || PHOTO_KEY_RE.test(k);
      collectPhotos(v, out, isPhotoKey);
    }
  }
}

// ── Value parsers ────────────────────────────────────────────────────────────

function parseIntSafe(value: string): number | undefined {
  const digits = value.replace(/[^\d]/g, "");
  if (!digits) return undefined;
  const n = parseInt(digits, 10);
  return Number.isFinite(n) ? n : undefined;
}

function parseYear(value: string): number | undefined {
  const m = value.match(/\b(19|20)\d{2}\b/);
  if (m) return parseInt(m[0], 10);
  return parseIntSafe(value);
}

function parsePrice(value: string): string | undefined {
  // Keep digits only (drop currency, spaces, thousand separators, decimals).
  const cleaned = value.replace(/[^\d.,]/g, "").replace(/[.,](?=\d{3}\b)/g, "");
  const intPart = cleaned.replace(/[.,]\d+$/, "").replace(/[^\d]/g, "");
  if (!intPart) return undefined;
  const n = parseInt(intPart, 10);
  return n > 0 ? String(n) : undefined;
}

function parsePower(value: string): number | undefined {
  // Feeds give either kW or PS/HP. Heuristic: if "ps"/"hp"/"k" present convert
  // PS->kW (×0.7355). Plain numbers are assumed to already be kW.
  const n = parseIntSafe(value);
  if (n == null) return undefined;
  if (/\b(ps|hp|k)\b|koní|kon[eí]/i.test(value) && !/kw/i.test(value)) {
    return Math.round(n * 0.7355);
  }
  return n;
}

function parseEngineVolume(value: string): string | undefined {
  const n = parseIntSafe(value);
  if (n == null) {
    // Maybe already "2.0" style.
    const m = value.match(/\d+([.,]\d+)?/);
    return m ? m[0].replace(",", ".") : undefined;
  }
  // ccm (e.g. 1968) -> liters "2.0"; values already in liters stay as-is.
  if (n > 100) return (n / 1000).toFixed(1);
  if (n > 10) return (n / 10).toFixed(1); // e.g. "20" -> 2.0
  return String(n);
}

function mapMulti(value: string, map: Array<[RegExp, string]>): string[] | undefined {
  const mapped = applyMap(value, map);
  if (mapped) return [mapped];
  const raw = value.trim().toLowerCase();
  return raw ? [raw] : undefined;
}

// ── Public API ───────────────────────────────────────────────────────────────

export function parseFeedXml(xml: string): ParseResult {
  const warnings: string[] = [];
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
    textNodeName: "#text",
    parseTagValue: false,
    parseAttributeValue: false,
    trimValues: true,
    cdataPropName: "cdata",
  });

  let root: unknown;
  try {
    root = parser.parse(xml);
  } catch (e) {
    throw new Error(
      `XML se nepodařilo načíst / Не вдалося розпарсити XML: ${(e as Error).message}`,
    );
  }

  const rawItems = detectItems(root);
  if (rawItems.length === 0) {
    warnings.push("Nenašli jsme žádné vozy ve feedu / У фіді не знайдено жодного авто");
  }

  const coverage: Record<string, number> = {};
  const bump = (k: string) => { coverage[k] = (coverage[k] || 0) + 1; };

  const items: MappedVehicle[] = rawItems.map((raw) => {
    const flat = new Map<string, string>();
    flattenItem(raw, flat);

    const v: MappedVehicle = {};

    const externalId = pick(flat, FIELD_ALIASES.externalId);
    if (externalId) { v.externalId = externalId; bump("externalId"); }

    const title = pick(flat, FIELD_ALIASES.title);
    if (title) { v.title = title; bump("title"); }

    const brand = pick(flat, FIELD_ALIASES.brand);
    if (brand) { v.brand = brand; bump("brand"); }

    const model = pick(flat, FIELD_ALIASES.model);
    if (model) { v.model = model; bump("model"); }

    const year = parseYear(pick(flat, FIELD_ALIASES.year));
    if (year) { v.year = year; bump("year"); }

    const mileage = parseIntSafe(pick(flat, FIELD_ALIASES.mileage));
    if (mileage != null) { v.mileage = mileage; bump("mileage"); }

    const price = parsePrice(pick(flat, FIELD_ALIASES.price));
    if (price) { v.price = price; bump("price"); }

    const fuelRaw = pick(flat, FIELD_ALIASES.fuelType);
    if (fuelRaw) { v.fuelType = mapMulti(fuelRaw, FUEL_MAP); bump("fuelType"); }

    const transRaw = pick(flat, FIELD_ALIASES.transmission);
    if (transRaw) { v.transmission = mapMulti(transRaw, TRANSMISSION_MAP); bump("transmission"); }

    const bodyRaw = pick(flat, FIELD_ALIASES.bodyType);
    if (bodyRaw) { v.bodyType = applyMap(bodyRaw, BODY_MAP) ?? bodyRaw.trim().toLowerCase(); bump("bodyType"); }

    const color = pick(flat, FIELD_ALIASES.color);
    if (color) { v.color = color.trim().toLowerCase(); bump("color"); }

    const driveRaw = pick(flat, FIELD_ALIASES.driveType);
    if (driveRaw) { v.driveType = mapMulti(driveRaw, DRIVE_MAP); bump("driveType"); }

    const engine = parseEngineVolume(pick(flat, FIELD_ALIASES.engineVolume));
    if (engine) { v.engineVolume = engine; bump("engineVolume"); }

    const power = parsePower(pick(flat, FIELD_ALIASES.power));
    if (power) { v.power = power; bump("power"); }

    const doors = parseIntSafe(pick(flat, FIELD_ALIASES.doors));
    if (doors != null) v.doors = doors;

    const seats = parseIntSafe(pick(flat, FIELD_ALIASES.seats));
    if (seats != null) v.seats = seats;

    const condRaw = pick(flat, FIELD_ALIASES.condition);
    if (condRaw) { v.condition = applyMap(condRaw, CONDITION_MAP) ?? "used"; bump("condition"); }

    const vehType = pick(flat, FIELD_ALIASES.vehicleType);
    if (vehType) { v.vehicleType = vehType.trim().toLowerCase(); bump("vehicleType"); }

    const vinRaw = pick(flat, FIELD_ALIASES.vin);
    if (vinRaw) {
      const vin = vinRaw.trim().toUpperCase();
      if (/^[A-HJ-NPR-Z0-9]{17}$/.test(vin)) v.vin = vin;
    }

    const region = pick(flat, FIELD_ALIASES.region);
    if (region) { v.region = region; bump("region"); }

    const phone = pick(flat, FIELD_ALIASES.phone);
    if (phone) { v.phone = phone; bump("phone"); }

    const description = pick(flat, FIELD_ALIASES.description);
    if (description) { v.description = description; bump("description"); }

    const photos: string[] = [];
    collectPhotos(raw, photos);
    const uniquePhotos = Array.from(new Set(photos)).slice(0, 30);
    if (uniquePhotos.length) { v.photos = uniquePhotos; bump("photos"); }

    return v;
  });

  return { items, itemCount: items.length, coverage, warnings };
}
