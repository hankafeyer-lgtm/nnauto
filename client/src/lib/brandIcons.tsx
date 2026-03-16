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
  | {
      type: "component";
      component: ComponentType<{ className?: string }>;
      color?: string;
    }
  | { type: "image"; src: string; alt: string };

export const BrandIconRenderer = ({
  icon,
  className = "w-4 h-4",
}: {
  icon?: BrandIconEntry;
  className?: string;
}) => {
  if (!icon) return null;
  
  if (icon.type === "component") {
    const Icon = icon.component;
    // react-icons використовують currentColor; явно прокидаємо color, щоб не
    // залежати від кольору тексту батьківського елемента.
    return icon.color ? (
      <Icon className={className} color={icon.color} />
    ) : (
      <Icon className={className} />
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
  { component: ComponentType<{ className?: string }>; color?: string }
> = {
  acura: { component: SiAcura, color: "#000000" },
  "alfa-romeo": { component: SiAlfaromeo, color: "#981E32" },
  "aston-martin": { component: SiAstonmartin, color: "#005A2B" },
  audi: { component: SiAudi, color: "#BB0A30" },
  bentley: { component: SiBentley, color: "#000000" },
  bmw: { component: SiBmw, color: "#0066B1" },
  bugatti: { component: SiBugatti, color: "#D71A28" },
  cadillac: { component: SiCadillac, color: "#000000" },
  chevrolet: { component: SiChevrolet, color: "#F3C800" },
  chrysler: { component: SiChrysler, color: "#000000" },
  citroen: { component: SiCitroen, color: "#DA291C" },
  dacia: { component: SiDacia, color: "#004481" },
  ferrari: { component: SiFerrari, color: "#FF0000" },
  fiat: { component: SiFiat, color: "#931E38" },
  ford: { component: SiFord, color: "#003399" },
  honda: { component: SiHonda, color: "#E40521" },
  hyundai: { component: SiHyundai, color: "#002C5F" },
  infiniti: { component: SiInfiniti, color: "#330000" },
  jaguar: { component: SiJaguar, color: "#006633" },
  jeep: { component: SiJeep, color: "#4C4C4C" },
  kia: { component: SiKia, color: "#C4172C" },
  lamborghini: { component: SiLamborghini, color: "#DDB321" },
  "land-rover": { component: SiLandrover, color: "#005A2B" },
  maserati: { component: SiMaserati, color: "#0C2340" },
  mazda: { component: SiMazda, color: "#101010" },
  mclaren: { component: SiMclaren, color: "#FF7F00" },
  "mercedes-benz": { component: SiMercedes, color: "#00ADEF" },
  mini: { component: SiMini, color: "#000000" },
  mitsubishi: { component: SiMitsubishi, color: "#E60012" },
  nissan: { component: SiNissan, color: "#C3002F" },
  opel: { component: SiOpel, color: "#FFCB05" },
  peugeot: { component: SiPeugeot, color: "#002155" },
  porsche: { component: SiPorsche, color: "#B12B28" },
  ram: { component: SiRam, color: "#000000" },
  renault: { component: SiRenault, color: "#FFCC33" },
  "rolls-royce": { component: SiRollsroyce, color: "#2E2E2E" },
  seat: { component: SiSeat, color: "#AB1A1F" },
  skoda: { component: SiSkoda, color: "#00800D" },
  subaru: { component: SiSubaru, color: "#013C74" },
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
      const entry = componentIcons[brand];
      return entry
        ? { type: "component", component: entry.component, color: entry.color }
        : genericIcon(brand);
    },
  },
) as Record<string, BrandIconEntry>;
