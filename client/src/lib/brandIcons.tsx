import { ComponentType } from "react";
import { Bike, Car, Truck } from "lucide-react";

export type BrandIconEntry =
  | { type: "component"; component: ComponentType<{ className?: string }> }
  | { type: "image"; src: string; alt: string }
  | { type: "letter"; letter: string; color: string; alt: string }
  | { type: "fallback"; alt: string };

/** Deterministic palette so the same brand always gets the same colour. */
const LETTER_PALETTE = [
  "#6366F1", // indigo
  "#0EA5E9", // sky
  "#14B8A6", // teal
  "#10B981", // emerald
  "#F59E0B", // amber
  "#F97316", // orange
  "#EF4444", // red
  "#EC4899", // pink
  "#8B5CF6", // violet
  "#22C55E", // green
  "#0891B2", // cyan
  "#B45309", // yellow-700
];

function colorForBrand(brand: string): string {
  let hash = 0;
  for (let i = 0; i < brand.length; i++) {
    hash = (hash * 31 + brand.charCodeAt(i)) >>> 0;
  }
  return LETTER_PALETTE[hash % LETTER_PALETTE.length];
}

export function letterIcon(label: string): BrandIconEntry {
  // Brands without a downloaded logo: fall back to a generic gold car icon
  // matching the NNAuto brand colour, instead of a coloured letter circle —
  // visually consistent with the rest of the dropdown.
  return { type: "fallback", alt: (label || "").trim() };
}

/**
 * Rewrite /brand-logos/<name>.png → /brand-logos-webp/<name>.webp.
 * We keep the original URL structure for back-compat (and as PNG fallback) but
 * prefer the lightweight WebP which is roughly 100x smaller than the source PNGs.
 */
function toWebpUrl(src: string): string {
  try {
    if (src.startsWith("/brand-logos/")) {
      return src
        .replace("/brand-logos/", "/brand-logos-webp/")
        .replace(/\.(png|jpg|jpeg)$/i, ".webp");
    }
  } catch {
    /* ignore, fallback to original */
  }
  return src;
}

export const BrandIconRenderer = ({
  icon,
  className = "w-4 h-4",
  loading = "lazy",
}: {
  icon?: BrandIconEntry;
  className?: string;
  loading?: "lazy" | "eager";
}) => {
  if (!icon) return null;

  if (icon.type === "component") {
    const Icon = icon.component;
    return <Icon className={className} />;
  }

  if (icon.type === "letter") {
    return (
      <span
        aria-label={icon.alt}
        className={`${className} inline-flex items-center justify-center rounded-full text-white font-semibold leading-none select-none`}
        style={{
          background: `linear-gradient(135deg, ${icon.color}, ${icon.color}cc)`,
          fontSize: "0.7em",
          letterSpacing: "0.02em",
        }}
      >
        {icon.letter}
      </span>
    );
  }

  if (icon.type === "fallback") {
    // Generic car silhouette in the NNAuto gold (#B8860B) for brands
    // we couldn't find a logo for. Same dimensions as the real PNG/WebP
    // logos so the dropdown layout stays uniform.
    return (
      <span
        aria-label={icon.alt}
        className={`${className} inline-flex items-center justify-center rounded-full select-none`}
        style={{
          background: "linear-gradient(135deg, #FFFBEC 0%, #F4E2A6 100%)",
          color: "#B8860B",
        }}
      >
        <Car className="h-[60%] w-[60%]" strokeWidth={2.25} />
      </span>
    );
  }

  const webpSrc = toWebpUrl(icon.src);
  const isWebp = webpSrc !== icon.src;

  if (!isWebp) {
    return (
      <img
        src={icon.src}
        alt={icon.alt}
        className={className}
        loading={loading}
        decoding="async"
        draggable={false}
        style={{ objectFit: "contain" }}
      />
    );
  }

  // <picture> keeps a PNG fallback for browsers where WebP is unavailable.
  return (
    <picture>
      <source srcSet={webpSrc} type="image/webp" />
      <img
        src={icon.src}
        alt={icon.alt}
        className={className}
        loading={loading}
        decoding="async"
        draggable={false}
        style={{ objectFit: "contain" }}
      />
    </picture>
  );
};

const BRAND_LOGO_BASE_PATH = "/brand-logos";
const brandLogo = (fileName: string, alt: string): BrandIconEntry => ({
  type: "image",
  src: `${BRAND_LOGO_BASE_PATH}/${fileName}`,
  alt,
});

const motorcycleBrands = new Set([
  "access",
  "adams",
  "aeon",
  "aprilia",
  "bedna",
  "brixton",
  "ducati",
  "harley-davidson",
  "jawa",
  "kawasaki",
  "ktm",
  "kymco",
  "mbp",
  "piaggio",
  "triumph",
  "yamaha",
  "yuki",
]);

const truckBrands = new Set([
  "agm",
  "avia",
  "daf",
  "fuso",
  "ifa",
  "iveco",
  "kamaz",
  "liaz",
  "man",
  "maxus",
  "praga",
  "scania",
  "tatra",
]);

const genericIcon = (brand: string): BrandIconEntry => {
  if (motorcycleBrands.has(brand)) {
    return { type: "component", component: Bike };
  }

  if (truckBrands.has(brand)) {
    return { type: "component", component: Truck };
  }

  return { type: "component", component: Car };
};

export const brandIcons: Record<string, BrandIconEntry> = {
  abarth: brandLogo("abarth.png", "Abarth"),
  access: brandLogo("access_motor_company_logo.png", "Access"),
  "across-car": letterIcon("Across Car"),
  acura: brandLogo("Acura_brand_logo_original_6c3bebd7.png", "Acura"),
  adams: brandLogo("adams_motorcycle_company_logo.png", "Adams"),
  aeon: brandLogo("aeon_motor_company_logo.png", "Aeon"),
  agm: brandLogo("agm_truck_company_logo.png", "AGM"),
  aiways: brandLogo("aiways.png", "Aiways"),
  aixam: brandLogo("aixam.png", "Aixam"),
  "alfa-romeo": brandLogo("Alfa_Romeo_logo_original_086a45c9.png", "Alfa Romeo"),
  alpina: brandLogo("alpina.png", "Alpina"),
  alpine: brandLogo("alpine.png", "Alpine"),
  aprilia: brandLogo("aprilia_motorcycle_company_logo.png", "Aprilia"),
  aro: brandLogo("aro_vehicle_company_logo.png", "ARO"),
  "aston-martin": brandLogo("Aston_Martin_logo_b013e7bd.png", "Aston Martin"),
  audi: brandLogo("Audi_logo_original_147691ca.png", "Audi"),
  austin: brandLogo("austin.png", "Austin"),
  "austro-fiat": letterIcon("Austro Fiat"),
  "austro-daimler": letterIcon("Austro-Daimler"),
  auverland: brandLogo("auverland.png", "Auverland"),
  avatr: letterIcon("Avatr"),
  avia: brandLogo("avia_truck_company_logo.png", "Avia"),
  baic: brandLogo("baic.png", "BAIC"),
  bedna: brandLogo("bedna_motorcycle_company_logo.png", "Bedna"),
  bellier: brandLogo("bellier.png", "Bellier"),
  bentley: brandLogo("Bentley_logo_original_d9a96e45.png", "Bentley"),
  bestune: brandLogo("bestune.png", "Bestune"),
  bitter: brandLogo("bitter.png", "Bitter"),
  bmw: brandLogo("BMW_logo_original_da68f302.png", "BMW"),
  brixton: brandLogo("brixton_motorcycle_company_logo.png", "Brixton"),
  bugatti: brandLogo("Bugatti_logo_original_6db30359.png", "Bugatti"),
  buick: brandLogo("Buick_logo_color_feadaa67.png", "Buick"),
  byd: brandLogo("byd.png", "BYD"),
  cadillac: brandLogo("Cadillac_logo_original_fed89930.png", "Cadillac"),
  casalini: brandLogo("casalini.png", "Casalini"),
  caterham: brandLogo("caterham.png", "Caterham"),
  changhe: brandLogo("changhe.png", "Changhe"),
  chatenet: brandLogo("chatenet.png", "Chatenet"),
  chery: brandLogo("chery.png", "Chery"),
  chevrolet: brandLogo("Chevrolet_logo_original_57f93929.png", "Chevrolet"),
  chrysler: brandLogo("Chrysler_logo_original_ade81f2e.png", "Chrysler"),
  citroen: brandLogo("Citroen_logo_original_355ef247.png", "Citroen"),
  cupra: brandLogo("cupra.png", "Cupra"),
  dacia: brandLogo("Dacia_logo_original_b8df5efa.png", "Dacia"),
  daelim: brandLogo("daelim.png", "DAELIM"),
  daewoo: brandLogo("Daewoo_logo_color_54f95085.png", "Daewoo"),
  daf: brandLogo("daf_truck_company_logo.png", "DAF"),
  daihatsu: brandLogo("Daihatsu_logo_color_a902adb5.png", "Daihatsu"),
  delage: brandLogo("delage.png", "Delage"),
  denza: letterIcon("Denza"),
  dodge: brandLogo("Dodge_logo_color_ef37c49c.png", "Dodge"),
  dongfeng: brandLogo("dongfeng.png", "Dongfeng"),
  dr: brandLogo("dr.png", "DR"),
  ds: brandLogo("ds.png", "DS"),
  ducati: brandLogo("ducati_motorcycle_company_logo.png", "Ducati"),
  eagle: brandLogo("eagle.png", "Eagle"),
  elblesk: letterIcon("elBlesk"),
  evo: letterIcon("EVO"),
  ferrari: brandLogo("Ferrari_logo_original_ece7e384.png", "Ferrari"),
  fiat: brandLogo("Fiat_logo_original_3bbafc73.png", "Fiat"),
  fisker: brandLogo("fisker.png", "Fisker"),
  ford: brandLogo("Ford_logo_original_6f5cf8f4.png", "Ford"),
  foton: brandLogo("foton.png", "FOTON"),
  fuso: brandLogo("fuso_truck_company_logo.png", "Fuso"),
  gaz: brandLogo("gaz_russian_auto_brand_logo.png", "GAZ"),
  geely: brandLogo("geely.png", "Geely"),
  genesis: brandLogo("Genesis_logo_color_faa280dc.png", "Genesis"),
  gmc: brandLogo("GMC_logo_color_17710e6b.png", "GMC"),
  gonow: brandLogo("gonow.png", "Gonow"),
  gordon: brandLogo("gordon.png", "Gordon"),
  "great-wall": brandLogo("great-wall.png", "Great Wall"),
  grecav: brandLogo("grecav.png", "Grecav"),
  "harley-davidson": brandLogo("harley-davidson_motorcycle_logo.png", "Harley-Davidson"),
  "hispano-suiza": brandLogo("hispano-suiza.png", "Hispano-Suiza"),
  holden: brandLogo("holden.png", "Holden"),
  honda: brandLogo("Honda_logo_original_e8c5ec3b.png", "Honda"),
  hongqi: brandLogo("hongqi.png", "Hongqi"),
  honker: brandLogo("honker.png", "Honker"),
  hummer: brandLogo("Hummer_logo_color_f0752a0e.png", "Hummer"),
  hurtan: brandLogo("hurtan.png", "Hurtan"),
  hyundai: brandLogo("Hyundai_logo_original_c07927e9.png", "Hyundai"),
  "ich-x": letterIcon("ICH-X"),
  ifa: brandLogo("ifa_truck_company_logo.png", "IFA"),
  ineos: letterIcon("Ineos"),
  infiniti: brandLogo("Infiniti_logo_original_f75d7e81.png", "Infiniti"),
  isuzu: brandLogo("Isuzu_logo_color_3cdb4047.png", "Isuzu"),
  italcar: brandLogo("italcar.png", "Italcar"),
  iveco: brandLogo("iveco_truck_company_logo.png", "Iveco"),
  jac: brandLogo("jac.png", "JAC"),
  jaecoo: brandLogo("jaecoo.png", "Jaecoo"),
  jaguar: brandLogo("Jaguar_logo_original_9a59d0b8.png", "Jaguar"),
  jawa: brandLogo("jawa_motorcycle_company_logo.png", "Jawa"),
  jdm: letterIcon("JDM"),
  jeep: brandLogo("Jeep_logo_original_e52b641b.png", "Jeep"),
  kaipan: brandLogo("kaipan.png", "Kaipan"),
  kamaz: brandLogo("kamaz_truck_manufacturer_logo.png", "Kamaz"),
  kawasaki: brandLogo("kawasaki_motorcycle_company_logo.png", "Kawasaki"),
  kgm: letterIcon("KGM"),
  kia: brandLogo("Kia_logo_original_9e22ddfb.png", "Kia"),
  koenigsegg: brandLogo("koenigsegg.png", "Koenigsegg"),
  ktm: brandLogo("ktm_motorcycle_company_logo.png", "KTM"),
  kymco: brandLogo("kymco_scooter_company_logo.png", "Kymco"),
  lada: brandLogo("Lada_logo_color_b35bd85b.png", "Lada"),
  lamborghini: brandLogo("Lamborghini_logo_original_b578d0d2.png", "Lamborghini"),
  lancia: brandLogo("Lancia_logo_color_f4fec5bd.png", "Lancia"),
  "land-rover": brandLogo("Land_Rover_logo_61fcb4ec.png", "Land Rover"),
  ldv: brandLogo("ldv_commercial_vehicle_logo.png", "LDV"),
  leapmotor: brandLogo("leapmotor.png", "Leapmotor"),
  lexus: brandLogo("Lexus_logo_color_5fea4016.png", "Lexus"),
  "li-auto": letterIcon("Li Auto"),
  liaz: brandLogo("liaz_truck_company_logo.png", "Liaz"),
  ligier: brandLogo("ligier.png", "Ligier"),
  lincoln: brandLogo("Lincoln_logo_color_f90256c5.png", "Lincoln"),
  lotus: brandLogo("Lotus_logo_color_11110c83.png", "Lotus"),
  "lynk-co": letterIcon("Lynk & Co"),
  mahindra: brandLogo("mahindra.png", "Mahindra"),
  man: brandLogo("man_truck_company_logo.png", "MAN"),
  marcos: brandLogo("marcos.png", "Marcos"),
  "martin-motors": letterIcon("Martin Motors"),
  maruti: brandLogo("maruti.png", "Maruti"),
  maserati: brandLogo("Maserati_logo_original_fdd12123.png", "Maserati"),
  masuria: letterIcon("Masuria"),
  maxus: brandLogo("maxus_commercial_vehicle_logo.png", "Maxus"),
  maybach: brandLogo("Maybach_logo_color_0f4f6bf6.png", "Maybach"),
  mazda: brandLogo("Mazda_logo_original_eec10ee3.png", "Mazda"),
  mbp: brandLogo("mbp_motorcycle_brand_logo.png", "MBP"),
  mclaren: brandLogo("McLaren_logo_original_e939cb1a.png", "McLaren"),
  "mercedes-benz": brandLogo("Mercedes_logo_original_6c294c84.png", "Mercedes-Benz"),
  mercury: brandLogo("mercury.png", "Mercury"),
  mg: brandLogo("MG_logo_color_cd9c2803.png", "MG"),
  microcar: brandLogo("microcar.png", "Microcar"),
  minerva: brandLogo("minerva.png", "Minerva"),
  mini: brandLogo("MINI_logo_original_f0f8fbf8.png", "MINI"),
  mitsubishi: brandLogo("Mitsubishi_logo_original_ecfcc00d.png", "Mitsubishi"),
  morgan: brandLogo("morgan.png", "Morgan"),
  moskvic: brandLogo("moskvic.png", "Moskvič"),
  mtx: brandLogo("mtx.png", "MTX"),
  nio: brandLogo("nio.png", "NIO"),
  nissan: brandLogo("Nissan_logo_original_ca5b3ec4.png", "Nissan"),
  oldsmobile: brandLogo("oldsmobile.png", "Oldsmobile"),
  oltcit: brandLogo("oltcit.png", "Oltcit"),
  omoda: brandLogo("omoda.png", "Omoda"),
  opel: brandLogo("Opel_logo_original_55520476.png", "Opel"),
  ostatni: letterIcon("Ostatní"),
  pagani: brandLogo("pagani.png", "Pagani"),
  peugeot: brandLogo("Peugeot_logo_original_49276848.png", "Peugeot"),
  piaggio: brandLogo("piaggio_scooter_company_logo.png", "Piaggio"),
  plymouth: brandLogo("plymouth.png", "Plymouth"),
  polestar: brandLogo("polestar.png", "Polestar"),
  "polski-fiat": letterIcon("Polski Fiat"),
  pontiac: brandLogo("pontiac.png", "Pontiac"),
  porsche: brandLogo("Porsche_logo_original_20663cc0.png", "Porsche"),
  praga: brandLogo("praga_truck_company_logo.png", "Praga"),
  proton: brandLogo("proton.png", "Proton"),
  ram: brandLogo("RAM_logo_original_01d5325e.png", "RAM"),
  "rayton-fissore": letterIcon("Rayton Fissore"),
  renault: brandLogo("Renault_logo_original_5f790e40.png", "Renault"),
  riddara: letterIcon("Riddara"),
  "rising-auto": letterIcon("Rising Auto"),
  "rolls-royce": brandLogo("Rolls-Royce_logo_b3b6a8b1.png", "Rolls-Royce"),
  rover: brandLogo("Rover_logo_color_0c669a58.png", "Rover"),
  saab: brandLogo("Saab_logo_color_c663d669.png", "Saab"),
  santana: brandLogo("santana.png", "Santana"),
  saturn: brandLogo("saturn.png", "Saturn"),
  scania: brandLogo("scania_truck_company_logo.png", "Scania"),
  scion: brandLogo("scion.png", "Scion"),
  seat: brandLogo("Seat_logo_original_187ae0be.png", "SEAT"),
  shuanghuan: brandLogo("shuanghuan.png", "Shuanghuan"),
  simca: brandLogo("simca.png", "Simca"),
  skoda: brandLogo("Skoda_logo_original_1371d0f2.png", "Skoda"),
  smart: brandLogo("Smart_logo_color_ea825808.png", "Smart"),
  sportequipe: letterIcon("Sportequipe"),
  ssangyong: brandLogo("SsangYong_logo_color_691effcf.png", "SsangYong"),
  subaru: brandLogo("Subaru_logo_original_cb416dff.png", "Subaru"),
  suzuki: brandLogo("Suzuki_logo_original_a2a3d37d.png", "Suzuki"),
  swm: brandLogo("swm.png", "SWM"),
  tata: brandLogo("tata.png", "Tata"),
  tatra: brandLogo("tatra_truck_company_logo.png", "Tatra"),
  tavria: brandLogo("tavria.png", "Tavria"),
  tesla: brandLogo("Tesla_logo_original_1206b5d7.png", "Tesla"),
  toyota: brandLogo("Toyota_logo_original_3d98b809.png", "Toyota"),
  trabant: brandLogo("trabant.png", "Trabant"),
  triumph: brandLogo("triumph_motorcycle_company_logo.png", "Triumph"),
  tvr: brandLogo("tvr.png", "TVR"),
  uaz: brandLogo("UAZ_logo_color_444aca90.png", "UAZ"),
  ultima: brandLogo("ultima.png", "Ultima"),
  vaz: letterIcon("VAZ"),
  volkswagen: brandLogo("Volkswagen_logo_original_3c9ab739.png", "Volkswagen"),
  volvo: brandLogo("Volvo_logo_original_8e608d2c.png", "Volvo"),
  voyah: brandLogo("voyah.png", "Voyah"),
  wartburg: brandLogo("wartburg.png", "Wartburg"),
  xev: letterIcon("XEV"),
  xiaomi: letterIcon("Xiaomi"),
  xpeng: brandLogo("xpeng.png", "XPENG"),
  yamaha: brandLogo("yamaha_motorcycle_company_logo.png", "Yamaha"),
  yugo: brandLogo("yugo.png", "Yugo"),
  yuki: brandLogo("yuki_motorcycle_company_logo.png", "Yuki"),
  zastava: brandLogo("zastava.png", "Zastava"),
  zeekr: brandLogo("zeekr.png", "Zeekr"),
  zhidou: brandLogo("zhidou.png", "ZhiDou"),
};

/**
 * Resolve a brand icon entry, falling back to a coloured letter circle for
 * brands that don't have a downloaded PNG/WebP logo. This guarantees every
 * brand in `carBrands` shows *some* visual marker in dropdowns and avoids
 * the empty-icon look on newly added brands (Cupra, BYD, Polestar, etc.).
 */
export function getBrandIcon(
  brandValue: string,
  brandLabel?: string,
): BrandIconEntry {
  const existing = brandIcons[brandValue];
  if (existing) return existing;
  return letterIcon(brandLabel || brandValue);
}
