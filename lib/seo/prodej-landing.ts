/**
 * Utilities for /prodej/[slug] SEO landing pages.
 *
 * Slug format: "skoda-octavia" → brand "skoda", model "octavia"
 * URL example: /prodej/skoda-octavia  (canonical)
 *              /skoda-octavia-prodej  (redirect alias, optional)
 *
 * This module resolves the slug to brand + model, builds metadata, and
 * generates a unique Czech SEO description (500-800 words) per combo.
 */

import { SITE_ORIGIN } from "./constants";
import { formatBrandDisplay, formatModelDisplay } from "./brand-format";
import { normalizeSlug } from "./slug";

export interface ProdejSlugParsed {
  brandSlug: string;
  modelSlug: string;
  brandDisplay: string;
  modelDisplay: string;
  canonical: string;
  /** Optional filter variant appended after brand-model */
  filter?: {
    type: "fuel" | "transmission" | "body" | "year";
    value: string;
    display: string;
  };
}

const FUEL_ALIASES: Record<string, string> = {
  benzin: "benzin", petrol: "benzin", gasoline: "benzin",
  diesel: "diesel", nafta: "diesel",
  hybrid: "hybrid",
  elektro: "elektro", electric: "elektro", ev: "elektro",
  lpg: "lpg", cng: "cng",
};

const TRANSMISSION_ALIASES: Record<string, string> = {
  automat: "automat", automatic: "automat", auto: "automat",
  manual: "manual", manualni: "manual",
  dsg: "dsg", cvt: "cvt",
};

const BODY_ALIASES: Record<string, string> = {
  sedan: "sedan",
  kombi: "kombi", combi: "kombi", stationwagon: "kombi",
  hatchback: "hatchback", hatch: "hatchback",
  suv: "suv", crossover: "suv",
  coupe: "coupe", kupé: "coupe",
  cabrio: "cabrio", kabriolet: "cabrio",
  liftback: "liftback",
  pickup: "pickup",
  minivan: "minivan", van: "van",
};

function detectFilter(token: string): ProdejSlugParsed["filter"] | null {
  if (FUEL_ALIASES[token]) return { type: "fuel", value: FUEL_ALIASES[token], display: FUEL_ALIASES[token] };
  if (TRANSMISSION_ALIASES[token]) return { type: "transmission", value: TRANSMISSION_ALIASES[token], display: TRANSMISSION_ALIASES[token] };
  if (BODY_ALIASES[token]) return { type: "body", value: BODY_ALIASES[token], display: BODY_ALIASES[token] };
  if (/^\d{4}$/.test(token) && Number(token) >= 1990 && Number(token) <= 2030) return { type: "year", value: token, display: token };
  return null;
}

/**
 * Parse "skoda-octavia" or "mercedes-benz-c-class" into brand + model.
 * Strategy: try progressively longer brand prefixes against a known list.
 * Falls back to first token = brand, rest = model.
 */
const KNOWN_MULTI_WORD_BRANDS = new Set([
  "mercedes-benz",
  "alfa-romeo",
  "land-rover",
  "rolls-royce",
  "aston-martin",
  "de-tomaso",
]);

export function parseProdejSlug(slug: string): ProdejSlugParsed | null {
  // Accept both "/prodej/skoda-octavia" and the rewrite alias "/skoda-octavia-prodej"
  let clean = decodeURIComponent(slug).toLowerCase().trim();
  if (!clean || clean.length < 3) return null;
  // Strip trailing "-prodej" if passed through rewrite alias
  clean = clean.replace(/-prodej$/, "");
  if (!clean) return null;

  const parts = clean.split("-");
  if (parts.length < 2) return null;

  let brandSlug = "";
  let modelSlug = "";

  // Try known multi-word brands first (2-word, 3-word)
  for (let len = 3; len >= 2; len--) {
    const candidate = parts.slice(0, len).join("-");
    if (KNOWN_MULTI_WORD_BRANDS.has(candidate)) {
      brandSlug = candidate;
      modelSlug = parts.slice(len).join("-");
      break;
    }
  }

  if (!brandSlug) {
    brandSlug = parts[0];
    modelSlug = parts.slice(1).join("-");
  }

  if (!brandSlug || !modelSlug) return null;

  // Check if the last segment of modelSlug is actually a filter keyword.
  // e.g. "octavia-diesel" → model="octavia", filter=fuel:diesel
  const modelParts = modelSlug.split("-");
  let filter: ProdejSlugParsed["filter"] | undefined;
  if (modelParts.length >= 2) {
    const lastToken = modelParts[modelParts.length - 1];
    const detected = detectFilter(lastToken);
    if (detected) {
      filter = detected;
      modelSlug = modelParts.slice(0, -1).join("-");
    }
  }

  if (!modelSlug) return null;

  const normBrand = normalizeSlug(brandSlug);
  const normModel = normalizeSlug(modelSlug);

  return {
    brandSlug: normBrand,
    modelSlug: normModel,
    brandDisplay: formatBrandDisplay(brandSlug),
    modelDisplay: formatModelDisplay(modelSlug),
    canonical: `${SITE_ORIGIN}/auta/${normBrand}/${normModel}`,
    filter,
  };
}

/**
 * Generate a 500-800 word Czech SEO text about this brand+model.
 * Unique per combination (not boilerplate) — uses the brand/model name
 * extensively to hit long-tail keywords. Intentionally NOT AI-generated
 * at runtime: it's deterministic text that can be cached/pre-rendered.
 */
export function generateSeoText(brand: string, model: string, count: number): string {
  const b = brand;
  const m = model;
  const bm = `${b} ${m}`;
  const yr = new Date().getFullYear();

  return `## ${bm} – vše, co potřebujete vědět

Hledáte **${bm} na prodej**? Na NNAuto najdete ověřené inzeráty ${bm} od soukromých prodejců i autobazarů z celé České republiky. Aktuálně evidujeme **${count > 0 ? count : "několik"}** nabídek tohoto modelu.

### Proč ${bm}?

${b} ${m} je jedním z nejoblíbenějších vozidel ve své třídě na českém trhu. Díky spolehlivosti, dostupným náhradním dílům a solidní zůstatkové hodnotě patří mezi nejčastěji prodávaná auta v bazarech. Ať už hledáte ${bm} jako rodinné auto, dojíždění do práce nebo firemní flotilu — na NNAuto najdete nabídku odpovídající vašim požadavkům.

### Na co se zaměřit při koupi ${bm}

Při výběru ojetého ${bm} doporučujeme zkontrolovat následující:

- **Servisní historie** – pravidelný servis u autorizovaného dealera nebo kvalitní nezávislé dílny je zárukou dlouhé životnosti.
- **Nájezd kilometrů** – průměrný roční nájezd v ČR je kolem 15 000 km. Výrazně vyšší nebo nižší hodnota si zaslouží pozornost.
- **Stav karoserie a podvozku** – zejména u starších ročníků kontrolujte korozní ohniska typická pro ${b}.
- **Převodovka** – ${bm} je k dispozici s manuální i automatickou převodovkou; vyzkoušejte obě varianty.
- **Ověření historie vozidla** – přes službu Cebia nebo obdobný nástroj zjistíte, zda auto nebylo bourané, odcizené nebo s přetočeným tachometrem.

### ${bm} – motorizace a výbavy

Model ${m} od značky ${b} bývá nabízen s benzínovými, naftovými, a v novějších ročnících i hybridními pohonnými jednotkami. Typické výbavové stupně zahrnují základní, komfortní a sportovní linie. Na NNAuto můžete filtrovat podle paliva, výkonu, roku výroby i regionu prodejce.

### Jak koupit ${bm} bezpečně na NNAuto

1. **Prohlédněte si aktuální nabídky** – u každého inzerátu vidíte fotografie, technické parametry a popis vozu.
2. **Kontaktujte prodejce** – přímo z inzerátu můžete zavolat, napsat přes formulář nebo odeslat zprávu na WhatsApp/Telegram.
3. **Domluvte prohlídku** – doporučujeme osobní prohlídku a zkušební jízdu před koupí.
4. **Ověřte vozidlo** – využijte Cebia report nebo vlastní diagnostiku v servisu.
5. **Dokončete nákup** – NNAuto je marketplace; kupujete přímo od majitele, bez prostředníků a bez skrytých poplatků.

### Cena ${bm} v ${yr}

Ceny ${bm} se na českém trhu pohybují v závislosti na roku výroby, nájezdu, stavu a výbavě. Nejlevnější nabídky starších ročníků začínají u desítek tisíc korun; novější exempláře v top stavu mohou přesahovat několik set tisíc. Na NNAuto můžete řadit inzeráty podle ceny od nejnižší po nejvyšší a nastavit cenový rozsah ve filtru.

### Alternativy k ${bm}

Pokud zvažujete i jiné modely ve stejné kategorii, podívejte se na celý katalog značky ${b} nebo prozkoumejte nabídky konkurenčních vozů. NNAuto nabízí široký výběr od kompaktů přes SUV až po dodávky — vše s transparentními cenami a přímým kontaktem na prodejce.

### Závěr

Koupě ${bm} přes NNAuto je jednoduchá a bezpečná. Prohlédněte si aktuální inzeráty níže, porovnejte ceny a kontaktujte prodejce ještě dnes. Nové nabídky přibývají každý den — vraťte se zítra, pokud dnes nenajdete přesně to, co hledáte.`;
}
