import { normalizeSlug } from "./slug";
import { formatBrandDisplay } from "./brand-format";

export type BrandMetadataOverride = {
  /** Short SERP title stem before inventory count. */
  titleKeyword: string;
  descriptionLead: string;
  /** Optional visible lead under H1 — same layout, stronger copy. */
  pageLead?: string;
  /** Optional visible H1 override (defaults to «{Brand} na prodej»). */
  h1?: string;
  /** Extra keywords for metadata.keywords. */
  extraKeywords?: string[];
};

/**
 * CTR-focused metadata for brand hubs that already rank high but under-click
 * in GSC (Škoda, VW, Renault, BMW). Other brands keep the generic template.
 */
const BRAND_METADATA_OVERRIDES: Record<string, BrandMetadataOverride> = {
  skoda: {
    titleKeyword: "Škoda bazar – ojetá auta na prodej",
    descriptionLead:
      "Škoda bazar na NNAuto: ojetá Octavia, Kodiaq, Fabia a další na prodej v ČR. Porovnejte ceny, ročníky a kontaktujte prodejce přímo.",
    pageLead:
      "Škoda bazar s ověřenými inzeráty na NNAuto – ojeté Octavia, Kodiaq, Superb i Fabia od soukromých prodejců i autobazarů. Filtrujte podle ceny, roku, nájezdu a regionu a volejte prodejci přímo.",
  },
  volkswagen: {
    titleKeyword: "Volkswagen bazar – ojetá auta na prodej",
    descriptionLead:
      "Volkswagen bazar: Golf, Golf GTI, Passat, Tiguan a další ojetá VW na prodej. Aktuální ceny, fotografie a přímý kontakt na prodejce.",
    pageLead:
      "Volkswagen bazar na NNAuto – ojeté Golf, Passat, Tiguan i sportovní Golf GTI. Porovnejte ceny a parametry a spojte se s prodejcem bez mezičlánku.",
  },
  renault: {
    titleKeyword: "Renault bazar – ojetá auta na prodej",
    descriptionLead:
      "Renault bazar: Megane, Scenic, Clio a další ojeté Renaulty na prodej v ČR. Ceny, výbava a kontakt na prodejce na jednom místě.",
    pageLead:
      "Renault bazar s aktuální nabídkou Megane, Scenic a dalších modelů. Na NNAuto porovnáte ojetá auta podle ceny a ročníku a kontaktujete prodejce napřímo.",
  },
  bmw: {
    titleKeyword: "BMW bazar – ojetá auta na prodej",
    descriptionLead:
      "BMW bazar: řada 3, X5 a další ojeté BMW na prodej. Porovnejte ceny, nájezd a výbavu, volejte prodejci přímo přes NNAuto.",
    pageLead:
      "BMW bazar na NNAuto – ojeté sedaně, SUV i kupé. Filtrujte podle modelu, ceny a roku a domluvte prohlídku přímo s majitelem nebo autobazarem.",
  },
  volvo: {
    titleKeyword: "Volvo automat a bazar – ojetá Volvo na prodej",
    descriptionLead:
      "Volvo automat na prodej a Volvo bazar: XC60, XC90, V90, V60 s automatem i 4x4. Porovnejte ojetá Volvo v ČR – ceny, nájezd, výbava a přímý kontakt.",
    pageLead:
      "Hledáte Volvo automat nebo bezpečné ojeté Volvo? Na NNAuto najdete Volvo bazar s automatem, 4x4 a SUV (XC60, XC90) i kombi V90/V60. Filtrujte podle ceny a ročníku a volejte prodejci napřímo.",
    h1: "Volvo automat a ojetá Volvo na prodej",
    extraKeywords: [
      "volvo automat",
      "volvo automatická převodovka",
      "volvo 4x4",
      "volvo bazar",
      "volvo na prodej",
      "ojeté volvo",
      "volvo xc60",
      "volvo xc90",
      "volvo v90",
      "volvo suv",
    ],
  },
  "mercedes-benz": {
    titleKeyword: "Mercedes bazar – ojetá auta na prodej",
    descriptionLead:
      "Mercedes-Benz bazar: třída C, E, SUV a další ojeté Mercedesy na prodej v ČR včetně aut do 300 000 Kč.",
    pageLead:
      "Mercedes bazar na NNAuto – ojeté sedaně i SUV. Filtrujte podle ceny, ročníku a výbavy a kontaktujte prodejce přímo.",
  },
  toyota: {
    titleKeyword: "Toyota bazar – ojetá auta na prodej",
    descriptionLead:
      "Toyota bazar: RAV4, Corolla, Yaris a další ojeté Toyoty na prodej. Spolehlivé vozy, ceny a kontakt na prodejce.",
    pageLead:
      "Toyota bazar na NNAuto – ojeté SUV i hatchbacky. Porovnejte RAV4 a další modely podle ceny a nájezdu.",
  },
};

export function getBrandMetadataOverride(
  brandSlug: string,
): BrandMetadataOverride | null {
  const key = normalizeSlug(brandSlug);
  return BRAND_METADATA_OVERRIDES[key] ?? null;
}

/** Fallback title keyword when no override exists. */
export function defaultBrandTitleKeyword(brandSlug: string): string {
  return `${formatBrandDisplay(brandSlug)} na prodej`;
}
