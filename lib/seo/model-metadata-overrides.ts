import { normalizeSlug } from "./slug";

export type ModelMetadataOverride = {
  titleKeyword: string;
  searchPhrase: string;
  descriptionLead: string;
};

const MODEL_METADATA_OVERRIDES: Record<string, ModelMetadataOverride> = {
  "skoda-kodiaq": {
    titleKeyword: "Škoda Kodiaq bazar – SUV na prodej",
    searchPhrase: "skoda kodiaq bazar",
    descriptionLead:
      "Škoda Kodiaq bazar: 7místné SUV na prodej v ČR. Porovnejte ceny, ročníky, nájezd a výbavu ojetých Kodiaqů.",
  },
  "skoda-octavia": {
    titleKeyword: "Škoda Octavia na prodej",
    searchPhrase: "skoda octavia prodej",
    descriptionLead:
      "Najděte aktuální nabídky Škoda Octavia na prodej od soukromých prodejců i autobazarů v ČR.",
  },
  "bmw-x5": {
    titleKeyword: "BMW X5 na prodej",
    searchPhrase: "bmw x5 prodej",
    descriptionLead:
      "Prohlédněte si aktuální vozy BMW X5 na prodej v ČR včetně cen, fotografií, ročníků a parametrů.",
  },
  "volkswagen-golf-gti": {
    titleKeyword: "Golf GTI bazar – na prodej",
    searchPhrase: "golf gti na prodej",
    descriptionLead:
      "Golf GTI bazar: sportovní Volkswagen Golf GTI na prodej. Ceny, výkon, nájezd a stav – porovnejte inzeráty v ČR.",
  },
  "renault-megane": {
    titleKeyword: "Renault Megane bazar – na prodej",
    searchPhrase: "renault megane prodej",
    descriptionLead:
      "Renault Megane bazar a prodej v ČR: porovnejte ojeté Megane podle ceny, výbavy, paliva a regionu.",
  },
  "renault-scenic": {
    titleKeyword: "Renault Scenic bazar – rodinné auto",
    searchPhrase: "renault scenic prodej",
    descriptionLead:
      "Renault Scenic bazar: rodinné a 7místné vozy na prodej. Ceny, fotografie a přímý kontakt na prodejce.",
  },
  "mercedes-benz-c-class": {
    titleKeyword: "Mercedes C na prodej",
    searchPhrase: "mercedes c prodej",
    descriptionLead:
      "Porovnejte vozy Mercedes-Benz třídy C na prodej podle ceny, ročníku, nájezdu a výbavy.",
  },
  "volkswagen-passat": {
    titleKeyword: "Volkswagen Passat na prodej",
    searchPhrase: "volkswagen passat prodej",
    descriptionLead:
      "Najděte Volkswagen Passat na prodej v ČR včetně aktuálních cen, fotografií a kontaktu na prodejce.",
  },
  "audi-a3": {
    titleKeyword: "Audi A3 na prodej",
    searchPhrase: "audi a3 prodej",
    descriptionLead:
      "Prohlédněte si Audi A3 na prodej od soukromých prodejců i autobazarů v České republice.",
  },
  "ford-kuga": {
    titleKeyword: "Ford Kuga na prodej",
    searchPhrase: "ford kuga prodej",
    descriptionLead:
      "Porovnejte SUV Ford Kuga na prodej podle ceny, roku výroby, nájezdu, paliva a regionu prodejce.",
  },
};

export function getModelMetadataOverride(
  brandSlug: string,
  modelSlug: string,
): ModelMetadataOverride | null {
  const key = `${normalizeSlug(brandSlug)}-${normalizeSlug(modelSlug)}`;
  return MODEL_METADATA_OVERRIDES[key] ?? null;
}
