import type { ComponentType, CSSProperties } from "react";
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
  | {
      type: "component";
      component: ComponentType<{ className?: string; style?: CSSProperties }>;
      color?: string;
    }
  | { type: "image"; src: string; alt: string };

export const BrandIconRenderer = ({ icon, className = "w-4 h-4" }: { icon?: BrandIconEntry; className?: string }) => {
  if (!icon) return null;
  
  if (icon.type === "component") {
    const Icon = icon.component;
    return (
      <Icon
        className={`${className} shrink-0`}
        style={icon.color ? { color: icon.color } : undefined}
      />
    );
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

const componentIcons: Record<
  string,
  {
      component: ComponentType<{ className?: string; style?: CSSProperties }>;
    color?: string;
  }
> = {
  acura: { component: SiAcura, color: "#000000" },
  "alfa-romeo": { component: SiAlfaromeo, color: "#981E32" },
  "aston-martin": { component: SiAstonmartin, color: "#00665E" },
  audi: { component: SiAudi, color: "#000000" },
  bentley: { component: SiBentley, color: "#0B5A51" },
  bmw: { component: SiBmw, color: "#0066B1" },
  bugatti: { component: SiBugatti, color: "#D10A11" },
  cadillac: { component: SiCadillac, color: "#0A2351" },
  chevrolet: { component: SiChevrolet, color: "#C4A14A" },
  chrysler: { component: SiChrysler, color: "#222222" },
  citroen: { component: SiCitroen, color: "#DA291C" },
  dacia: { component: SiDacia, color: "#004B93" },
  ferrari: { component: SiFerrari, color: "#D40000" },
  fiat: { component: SiFiat, color: "#9B1C2C" },
  ford: { component: SiFord, color: "#003478" },
  honda: { component: SiHonda, color: "#CC0000" },
  hyundai: { component: SiHyundai, color: "#002C5F" },
  infiniti: { component: SiInfiniti, color: "#020B24" },
  jaguar: { component: SiJaguar, color: "#000000" },
  jeep: { component: SiJeep, color: "#3A5F0B" },
  kia: { component: SiKia, color: "#BB162B" },
  lamborghini: { component: SiLamborghini, color: "#B8A15A" },
  "land-rover": { component: SiLandrover, color: "#005A2B" },
  maserati: { component: SiMaserati, color: "#001D3D" },
  mazda: { component: SiMazda, color: "#1E1E1E" },
  mclaren: { component: SiMclaren, color: "#FF8700" },
  "mercedes-benz": { component: SiMercedes, color: "#222222" },
  mini: { component: SiMini, color: "#1A1A1A" },
  mitsubishi: { component: SiMitsubishi, color: "#E60012" },
  nissan: { component: SiNissan, color: "#C3002F" },
  opel: { component: SiOpel, color: "#F7C600" },
  peugeot: { component: SiPeugeot, color: "#1C3F95" },
  porsche: { component: SiPorsche, color: "#B12B28" },
  ram: { component: SiRam, color: "#111111" },
  renault: { component: SiRenault, color: "#FFCC00" },
  "rolls-royce": { component: SiRollsroyce, color: "#1A1A1A" },
  seat: { component: SiSeat, color: "#D50032" },
  skoda: { component: SiSkoda, color: "#009A44" },
  subaru: { component: SiSubaru, color: "#003399" },
  suzuki: { component: SiSuzuki, color: "#E30613" },
  tesla: { component: SiTesla, color: "#CC0000" },
  toyota: { component: SiToyota, color: "#EB0A1E" },
  volkswagen: { component: SiVolkswagen, color: "#001E50" },
  volvo: { component: SiVolvo, color: "#003057" },
};

export const brandIcons: Record<string, BrandIconEntry> = new Proxy(
  {},
  {
    get: (_target, brand: string) => {
      const icon = componentIcons[brand];
      return icon
        ? { type: "component", component: icon.component, color: icon.color }
        : genericIcon(brand);
    },
  },
) as Record<string, BrandIconEntry>;
