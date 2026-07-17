import { normalizeSlug } from "./slug";

export type ModelMetadataOverride = {
  titleKeyword: string;
  searchPhrase: string;
  descriptionLead: string;
};

const MODEL_METADATA_OVERRIDES: Record<string, ModelMetadataOverride> = {
  "skoda-kodiaq": {
    titleKeyword: "Škoda Kodiaq na prodej",
    searchPhrase: "skoda kodiaq prodej",
    descriptionLead:
      "Porovnejte aktuální SUV Škoda Kodiaq na prodej v ČR podle ceny, roku výroby, nájezdu a výbavy.",
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
    titleKeyword: "Golf GTI na prodej",
    searchPhrase: "golf gti na prodej",
    descriptionLead:
      "Porovnejte sportovní Volkswagen Golf GTI na prodej podle ceny, výkonu, nájezdu a technického stavu.",
  },
  "renault-megane": {
    titleKeyword: "Renault Megane na prodej",
    searchPhrase: "renault megane prodej",
    descriptionLead:
      "Najděte Renault Megane na prodej v ČR a porovnejte aktuální inzeráty podle ceny, výbavy a regionu.",
  },
  "renault-scenic": {
    titleKeyword: "Renault Scenic na prodej",
    searchPhrase: "renault scenic prodej",
    descriptionLead:
      "Prohlédněte si rodinné vozy Renault Scenic na prodej od soukromých prodejců i autobazarů.",
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
