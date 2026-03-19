import { ComponentType } from "react";
import { Bike, Car, Truck } from "lucide-react";

export type BrandIconEntry = 
  | { type: "component"; component: ComponentType<{ className?: string }> }
  | { type: "image"; src: string; alt: string };

export const BrandIconRenderer = ({ icon, className = "w-4 h-4" }: { icon?: BrandIconEntry; className?: string }) => {
  if (!icon) return null;
  
  if (icon.type === "component") {
    const Icon = icon.component;
    return <Icon className={className} />;
  }
  
  return (
    <img 
      src={icon.src} 
      alt={icon.alt} 
      className={className}
      loading="lazy"
      decoding="async"
      draggable={false}
      style={{ objectFit: "contain" }}
    />
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
  acura: brandLogo("Acura_brand_logo_original_6c3bebd7.png", "Acura"),
  "alfa-romeo": brandLogo("Alfa_Romeo_logo_original_086a45c9.png", "Alfa Romeo"),
  "aston-martin": brandLogo("Aston_Martin_logo_b013e7bd.png", "Aston Martin"),
  audi: brandLogo("Audi_logo_original_147691ca.png", "Audi"),
  bentley: brandLogo("Bentley_logo_original_d9a96e45.png", "Bentley"),
  bmw: brandLogo("BMW_logo_original_da68f302.png", "BMW"),
  bugatti: brandLogo("Bugatti_logo_original_6db30359.png", "Bugatti"),
  buick: brandLogo("Buick_logo_color_feadaa67.png", "Buick"),
  cadillac: brandLogo("Cadillac_logo_original_fed89930.png", "Cadillac"),
  chevrolet: brandLogo("Chevrolet_logo_original_57f93929.png", "Chevrolet"),
  chrysler: brandLogo("Chrysler_logo_original_ade81f2e.png", "Chrysler"),
  citroen: brandLogo("Citroen_logo_original_355ef247.png", "Citroen"),
  dacia: brandLogo("Dacia_logo_original_b8df5efa.png", "Dacia"),
  daewoo: brandLogo("Daewoo_logo_color_54f95085.png", "Daewoo"),
  daihatsu: brandLogo("Daihatsu_logo_color_a902adb5.png", "Daihatsu"),
  dodge: brandLogo("Dodge_logo_color_ef37c49c.png", "Dodge"),
  ferrari: brandLogo("Ferrari_logo_original_ece7e384.png", "Ferrari"),
  fiat: brandLogo("Fiat_logo_original_3bbafc73.png", "Fiat"),
  ford: brandLogo("Ford_logo_original_6f5cf8f4.png", "Ford"),
  genesis: brandLogo("Genesis_logo_color_faa280dc.png", "Genesis"),
  gmc: brandLogo("GMC_logo_color_17710e6b.png", "GMC"),
  honda: brandLogo("Honda_logo_original_e8c5ec3b.png", "Honda"),
  hummer: brandLogo("Hummer_logo_color_f0752a0e.png", "Hummer"),
  hyundai: brandLogo("Hyundai_logo_original_c07927e9.png", "Hyundai"),
  infiniti: brandLogo("Infiniti_logo_original_f75d7e81.png", "Infiniti"),
  isuzu: brandLogo("Isuzu_logo_color_3cdb4047.png", "Isuzu"),
  jaguar: brandLogo("Jaguar_logo_original_9a59d0b8.png", "Jaguar"),
  jeep: brandLogo("Jeep_logo_original_e52b641b.png", "Jeep"),
  kia: brandLogo("Kia_logo_original_9e22ddfb.png", "Kia"),
  lada: brandLogo("Lada_logo_color_b35bd85b.png", "Lada"),
  lamborghini: brandLogo("Lamborghini_logo_original_b578d0d2.png", "Lamborghini"),
  lancia: brandLogo("Lancia_logo_color_f4fec5bd.png", "Lancia"),
  "land-rover": brandLogo("Land_Rover_logo_61fcb4ec.png", "Land Rover"),
  lexus: brandLogo("Lexus_logo_color_5fea4016.png", "Lexus"),
  lincoln: brandLogo("Lincoln_logo_color_f90256c5.png", "Lincoln"),
  lotus: brandLogo("Lotus_logo_color_11110c83.png", "Lotus"),
  maserati: brandLogo("Maserati_logo_original_fdd12123.png", "Maserati"),
  maybach: brandLogo("Maybach_logo_color_0f4f6bf6.png", "Maybach"),
  mazda: brandLogo("Mazda_logo_original_eec10ee3.png", "Mazda"),
  mclaren: brandLogo("McLaren_logo_original_e939cb1a.png", "McLaren"),
  "mercedes-benz": brandLogo("Mercedes_logo_original_6c294c84.png", "Mercedes-Benz"),
  mg: brandLogo("MG_logo_color_cd9c2803.png", "MG"),
  mini: brandLogo("MINI_logo_original_f0f8fbf8.png", "MINI"),
  mitsubishi: brandLogo("Mitsubishi_logo_original_ecfcc00d.png", "Mitsubishi"),
  nissan: brandLogo("Nissan_logo_original_ca5b3ec4.png", "Nissan"),
  opel: brandLogo("Opel_logo_original_55520476.png", "Opel"),
  peugeot: brandLogo("Peugeot_logo_original_49276848.png", "Peugeot"),
  porsche: brandLogo("Porsche_logo_original_20663cc0.png", "Porsche"),
  ram: brandLogo("RAM_logo_original_01d5325e.png", "RAM"),
  renault: brandLogo("Renault_logo_original_5f790e40.png", "Renault"),
  "rolls-royce": brandLogo("Rolls-Royce_logo_b3b6a8b1.png", "Rolls-Royce"),
  rover: brandLogo("Rover_logo_color_0c669a58.png", "Rover"),
  saab: brandLogo("Saab_logo_color_c663d669.png", "Saab"),
  seat: brandLogo("Seat_logo_original_187ae0be.png", "SEAT"),
  skoda: brandLogo("Skoda_logo_original_1371d0f2.png", "Skoda"),
  smart: brandLogo("Smart_logo_color_ea825808.png", "Smart"),
  ssangyong: brandLogo("SsangYong_logo_color_691effcf.png", "SsangYong"),
  subaru: brandLogo("Subaru_logo_original_cb416dff.png", "Subaru"),
  suzuki: brandLogo("Suzuki_logo_original_a2a3d37d.png", "Suzuki"),
  tesla: brandLogo("Tesla_logo_original_1206b5d7.png", "Tesla"),
  toyota: brandLogo("Toyota_logo_original_3d98b809.png", "Toyota"),
  uaz: brandLogo("UAZ_logo_color_444aca90.png", "UAZ"),
  volkswagen: brandLogo("Volkswagen_logo_original_3c9ab739.png", "Volkswagen"),
  volvo: brandLogo("Volvo_logo_original_8e608d2c.png", "Volvo"),
  tatra: brandLogo("tatra_truck_company_logo.png", "Tatra"),
  man: brandLogo("man_truck_company_logo.png", "MAN"),
  iveco: brandLogo("iveco_truck_company_logo.png", "Iveco"),
  avia: brandLogo("avia_truck_company_logo.png", "Avia"),
  daf: brandLogo("daf_truck_company_logo.png", "DAF"),
  scania: brandLogo("scania_truck_company_logo.png", "Scania"),
  liaz: brandLogo("liaz_truck_company_logo.png", "Liaz"),
  praga: brandLogo("praga_truck_company_logo.png", "Praga"),
  ifa: brandLogo("ifa_truck_company_logo.png", "IFA"),
  agm: brandLogo("agm_truck_company_logo.png", "AGM"),
  aro: brandLogo("aro_vehicle_company_logo.png", "ARO"),
  fuso: brandLogo("fuso_truck_company_logo.png", "Fuso"),
  jawa: brandLogo("jawa_motorcycle_company_logo.png", "Jawa"),
  yamaha: brandLogo("yamaha_motorcycle_company_logo.png", "Yamaha"),
  "harley-davidson": brandLogo("harley-davidson_motorcycle_logo.png", "Harley-Davidson"),
  kawasaki: brandLogo("kawasaki_motorcycle_company_logo.png", "Kawasaki"),
  ktm: brandLogo("ktm_motorcycle_company_logo.png", "KTM"),
  triumph: brandLogo("triumph_motorcycle_company_logo.png", "Triumph"),
  ducati: brandLogo("ducati_motorcycle_company_logo.png", "Ducati"),
  aprilia: brandLogo("aprilia_motorcycle_company_logo.png", "Aprilia"),
  piaggio: brandLogo("piaggio_scooter_company_logo.png", "Piaggio"),
  kymco: brandLogo("kymco_scooter_company_logo.png", "Kymco"),
  access: brandLogo("access_motor_company_logo.png", "Access"),
  adams: brandLogo("adams_motorcycle_company_logo.png", "Adams"),
  aeon: brandLogo("aeon_motor_company_logo.png", "Aeon"),
  bedna: brandLogo("bedna_motorcycle_company_logo.png", "Bedna"),
  mbp: brandLogo("mbp_motorcycle_brand_logo.png", "MBP"),
  brixton: brandLogo("brixton_motorcycle_company_logo.png", "Brixton"),
  yuki: brandLogo("yuki_motorcycle_company_logo.png", "Yuki"),
  maxus: brandLogo("maxus_commercial_vehicle_logo.png", "Maxus"),
  gaz: brandLogo("gaz_russian_auto_brand_logo.png", "GAZ"),
  ldv: brandLogo("ldv_commercial_vehicle_logo.png", "LDV"),
  kamaz: brandLogo("kamaz_truck_manufacturer_logo.png", "Kamaz"),
};
