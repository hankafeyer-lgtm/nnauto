import { ComponentType } from "react";
import { Bike, Car, Truck } from "lucide-react";
import {
  SiAcura,
  SiAlfaromeo,
  SiAstonmartin,
  SiAudi,
  SiBentley,
  SiBmw,
  SiBugatti,
  SiCadillac,
  SiChevrolet,
  SiChrysler,
  SiCitroen,
  SiDacia,
  SiFerrari,
  SiFiat,
  SiFord,
  SiHonda,
  SiHyundai,
  SiInfiniti,
  SiJaguar,
  SiJeep,
  SiKia,
  SiLamborghini,
  SiLandrover,
  SiMaserati,
  SiMazda,
  SiMclaren,
  SiMercedes,
  SiMini,
  SiMitsubishi,
  SiNissan,
  SiOpel,
  SiPeugeot,
  SiPorsche,
  SiRam,
  SiRenault,
  SiRollsroyce,
  SiSeat,
  SiSkoda,
  SiSubaru,
  SiSuzuki,
  SiTesla,
  SiToyota,
  SiVolkswagen,
  SiVolvo,
} from "react-icons/si";

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

const componentIcons: Record<string, ComponentType<{ className?: string }>> = {
  acura: SiAcura,
  "alfa-romeo": SiAlfaromeo,
  "aston-martin": SiAstonmartin,
  audi: SiAudi,
  bentley: SiBentley,
  bmw: SiBmw,
  bugatti: SiBugatti,
  cadillac: SiCadillac,
  chevrolet: SiChevrolet,
  chrysler: SiChrysler,
  citroen: SiCitroen,
  dacia: SiDacia,
  ferrari: SiFerrari,
  fiat: SiFiat,
  ford: SiFord,
  honda: SiHonda,
  hyundai: SiHyundai,
  infiniti: SiInfiniti,
  jaguar: SiJaguar,
  jeep: SiJeep,
  kia: SiKia,
  lamborghini: SiLamborghini,
  "land-rover": SiLandrover,
  maserati: SiMaserati,
  mazda: SiMazda,
  mclaren: SiMclaren,
  "mercedes-benz": SiMercedes,
  mini: SiMini,
  mitsubishi: SiMitsubishi,
  nissan: SiNissan,
  opel: SiOpel,
  peugeot: SiPeugeot,
  porsche: SiPorsche,
  ram: SiRam,
  renault: SiRenault,
  "rolls-royce": SiRollsroyce,
  seat: SiSeat,
  skoda: SiSkoda,
  subaru: SiSubaru,
  suzuki: SiSuzuki,
  tesla: SiTesla,
  toyota: SiToyota,
  volkswagen: SiVolkswagen,
  volvo: SiVolvo,
};

export const brandIcons: Record<string, BrandIconEntry> = new Proxy(
  {},
  {
    get: (_target, brand: string) => {
      const icon = componentIcons[brand];
      return icon ? { type: "component", component: icon } : genericIcon(brand);
    },
  },
) as Record<string, BrandIconEntry>;
