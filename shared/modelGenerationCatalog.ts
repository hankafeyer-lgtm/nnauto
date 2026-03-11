export type BrandModelGenerationCatalog = Record<string, Record<string, string[]>>;

export const MODEL_GENERATION_CATALOG: BrandModelGenerationCatalog = {
  bmw: {
    "5-series": ["520", "525", "530", "535", "540", "550", "M5"],
    "3-series": ["316", "318", "320", "325", "330", "335", "340", "M3"],
    x5: ["xDrive30d", "xDrive40d", "xDrive45e", "xDrive50e", "M50d", "X5 M"],
  },
  audi: {
    a6: ["C5", "C6", "C7", "C8", "RS6"],
    a4: ["B6", "B7", "B8", "B9", "S4", "RS4"],
    a3: ["8L", "8P", "8V", "8Y", "S3", "RS3"],
  },
  skoda: {
    superb: ["Superb I", "Superb II", "Superb III", "Superb IV"],
    octavia: ["Octavia I", "Octavia II", "Octavia III", "Octavia IV", "vRS"],
    fabia: ["Fabia I", "Fabia II", "Fabia III", "Fabia IV", "Monte Carlo"],
  },
  volkswagen: {
    golf: ["Golf 4", "Golf 5", "Golf 6", "Golf 7", "Golf 8", "GTI", "R"],
    passat: ["B5", "B6", "B7", "B8", "B9", "Alltrack"],
    tiguan: ["Tiguan I", "Tiguan II", "Tiguan III", "R-Line"],
  },
  "mercedes-benz": {
    "c-class": ["W203", "W204", "W205", "W206", "AMG C43", "AMG C63"],
    "e-class": ["W211", "W212", "W213", "W214", "AMG E53", "AMG E63"],
    "s-class": ["W220", "W221", "W222", "W223", "Maybach"],
  },
};
