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
    titleKeyword: "Škoda Octavia bazar – koupit ojeté",
    searchPhrase: "koupit skoda octavia",
    descriptionLead:
      "Koupit Škoda Octavia: aktuální bazar ojetých Octavií v ČR. Ceny, ročníky (včetně 2014+), nájezd a přímý kontakt.",
  },
  "skoda-superb": {
    titleKeyword: "Škoda Superb na prodej – bazar",
    searchPhrase: "superb na prodej",
    descriptionLead:
      "Škoda Superb na prodej a bazar v ČR. Porovnejte ojeté Superb podle ceny, ročníku, nájezdu a výbavy.",
  },
  "bmw-x5": {
    titleKeyword: "BMW X5 na prodej",
    searchPhrase: "bmw x5 prodej",
    descriptionLead:
      "Prohlédněte si aktuální vozy BMW X5 na prodej v ČR včetně cen, fotografií, ročníků a parametrů.",
  },
  "volkswagen-golf-gti": {
    titleKeyword: "Golf GTI bazar – na prodej",
    searchPhrase: "golf gti",
    descriptionLead:
      "Golf GTI bazar: sportovní Volkswagen Golf GTI na prodej. Ceny, výkon, nájezd a stav – porovnejte inzeráty v ČR.",
  },
  "volkswagen-touareg": {
    titleKeyword: "Touareg prodej – VW bazar",
    searchPhrase: "touareg prodej",
    descriptionLead:
      "Volkswagen Touareg na prodej: ojeté SUV v bazaru NNAuto. Ceny, 4x4, výbava a kontakt na prodejce.",
  },
  "renault-megane": {
    titleKeyword: "Renault Megane prodej – bazar",
    searchPhrase: "renault megane prodej",
    descriptionLead:
      "Renault Megane prodej a bazar v ČR: porovnejte ojeté Megane podle ceny, výbavy, paliva a regionu.",
  },
  "renault-scenic": {
    titleKeyword: "Renault Scenic prodej – bazar",
    searchPhrase: "renault scenic prodej",
    descriptionLead:
      "Renault Scenic na prodej: rodinné a 7místné vozy v bazaru. Ceny, fotografie a přímý kontakt na prodejce.",
  },
  "toyota-rav4": {
    titleKeyword: "Toyota RAV4 bazar – SUV na prodej",
    searchPhrase: "toyota rav4 bazar",
    descriptionLead:
      "Toyota RAV4 bazar: ojeté SUV na prodej v ČR. Porovnejte ceny, hybridy, nájezd a výbavu.",
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
  "genesis-g80": {
    titleKeyword: "Genesis G80 na prodej – bazar",
    searchPhrase: "genesis g80",
    descriptionLead:
      "Genesis G80 na prodej v ČR: aktuální inzeráty, ceny, ročníky a parametry ojetých G80.",
  },
  "volvo-xc60": {
    titleKeyword: "Volvo XC60 bazar – SUV na prodej",
    searchPhrase: "volvo xc60",
    descriptionLead:
      "Volvo XC60 bazar: ojeté SUV často s automatem a 4x4. Porovnejte ceny, nájezd a výbavu XC60 v ČR.",
  },
  "volvo-xc90": {
    titleKeyword: "Volvo XC90 bazar – 7místné SUV",
    searchPhrase: "volvo xc90",
    descriptionLead:
      "Volvo XC90 na prodej: velké SUV, často automat a 4x4. Aktuální bazar XC90 s cenami a kontaktem na prodejce.",
  },
  "volvo-v90": {
    titleKeyword: "Volvo V90 bazar – kombi na prodej",
    searchPhrase: "volvo v90",
    descriptionLead:
      "Volvo V90 na prodej: prémiové kombi, často s automatem. Porovnejte ojeté V90 podle ceny a nájezdu.",
  },
  "volvo-v60": {
    titleKeyword: "Volvo V60 bazar – kombi na prodej",
    searchPhrase: "volvo v60",
    descriptionLead:
      "Volvo V60 bazar: ojeté kombi na prodej v ČR. Ceny, automaty, výbava a přímý kontakt na prodejce.",
  },
};

export function getModelMetadataOverride(
  brandSlug: string,
  modelSlug: string,
): ModelMetadataOverride | null {
  const key = `${normalizeSlug(brandSlug)}-${normalizeSlug(modelSlug)}`;
  return MODEL_METADATA_OVERRIDES[key] ?? null;
}
