import convertibleIcon from "@assets/28299981-16D7-4B57-8C0A-67EE5A345CA1_1763441678210.png";
import crossoverIcon from "@assets/0B62266D-D955-409B-96CC-D4C08E304D2E_1763441985403.png";
import coupeIcon from "@assets/8F094302-25CC-4310-8D88-C1CFBA4FF415_1763442234994.png";
import liftbackIcon from "@assets/5F30B3B5-85CD-464F-A96C-A3FBE8D16047_1763442438691.png";
import pickupIcon from "@assets/BFC09E61-7B8F-4EF9-A0FC-1659F899D077_1763442665715.png";
import minivanIcon from "@assets/41416F90-6B57-4125-96B7-A6FB8D640061_1763443070365.png";
import vanIcon from "@assets/4E8B9722-D061-47D3-9C2F-2C8C1070F01B_1763443339270.png";
import suvIcon from "@assets/0E073D5C-92A6-4128-9DB1-7736CCDBBB25_1763443580852.png";
import wagonIcon from "@assets/D45BD5A2-3496-43D5-ADB4-A73CDDA709EA_1763443834199.png";
import hatchbackIcon from "@assets/1E70E4A6-3A57-4039-86B7-F85E01E2C7F4_1763444099447.png";
import sedanIcon from "@assets/539501B7-9335-431F-AE37-97524B2BC035_1763444682319.png";
import motorcycleIcon from "@assets/44AD800C-C9BB-4F50-A278-5152E01D60BB_1763444856175.png";
import truckGoldIcon from "@assets/8C9B6F5F-55BC-402E-9359-B2707FE2FB81_1763444987490.png";

export const bodyTypeIconSources = {
  sedan: sedanIcon,
  hatchback: hatchbackIcon,
  wagon: wagonIcon,
  suv: suvIcon,
  crossover: crossoverIcon,
  coupe: coupeIcon,
  convertible: convertibleIcon,
  minivan: minivanIcon,
  pickup: pickupIcon,
  van: vanIcon,
  liftback: liftbackIcon,
  truck: truckGoldIcon,
  chassis: truckGoldIcon,
  tipper: truckGoldIcon,
  sport: motorcycleIcon,
  cruiser: motorcycleIcon,
  touring: motorcycleIcon,
  enduro: motorcycleIcon,
  naked: motorcycleIcon,
  chopper: motorcycleIcon,
  scooter: motorcycleIcon,
  classic: motorcycleIcon,
};

export type BodyTypeIconProps = {
  className?: string;
};

export const ConvertibleIcon = ({ className }: BodyTypeIconProps) => (
  <img src={convertibleIcon} alt="Convertible" className={className} style={{ objectFit: "contain" }} />
);

export const CrossoverIcon = ({ className }: BodyTypeIconProps) => (
  <img src={crossoverIcon} alt="Crossover" className={className} style={{ objectFit: "contain" }} />
);

export const CoupeIcon = ({ className }: BodyTypeIconProps) => (
  <img src={coupeIcon} alt="Coupe" className={className} style={{ objectFit: "contain" }} />
);

export const LiftbackIcon = ({ className }: BodyTypeIconProps) => (
  <img src={liftbackIcon} alt="Liftback" className={className} style={{ objectFit: "contain" }} />
);

export const PickupIcon = ({ className }: BodyTypeIconProps) => (
  <img src={pickupIcon} alt="Pickup" className={className} style={{ objectFit: "contain" }} />
);

export const MinivanIcon = ({ className }: BodyTypeIconProps) => (
  <img src={minivanIcon} alt="Minivan" className={className} style={{ objectFit: "contain" }} />
);

export const VanIcon = ({ className }: BodyTypeIconProps) => (
  <img src={vanIcon} alt="Van" className={className} style={{ objectFit: "contain" }} />
);

export const SuvIcon = ({ className }: BodyTypeIconProps) => (
  <img src={suvIcon} alt="SUV" className={className} style={{ objectFit: "contain" }} />
);

export const WagonIcon = ({ className }: BodyTypeIconProps) => (
  <img src={wagonIcon} alt="Wagon" className={className} style={{ objectFit: "contain" }} />
);

export const HatchbackIcon = ({ className }: BodyTypeIconProps) => (
  <img src={hatchbackIcon} alt="Hatchback" className={className} style={{ objectFit: "contain" }} />
);

export const SedanIcon = ({ className }: BodyTypeIconProps) => (
  <img src={sedanIcon} alt="Sedan" className={className} style={{ objectFit: "contain" }} />
);

export const TruckIcon = ({ className }: BodyTypeIconProps) => (
  <img src={truckGoldIcon} alt="Truck" className={className} style={{ objectFit: "contain" }} />
);

export const ChassisIcon = ({ className }: BodyTypeIconProps) => (
  <img src={truckGoldIcon} alt="Chassis" className={className} style={{ objectFit: "contain" }} />
);

export const TipperIcon = ({ className }: BodyTypeIconProps) => (
  <img src={truckGoldIcon} alt="Tipper" className={className} style={{ objectFit: "contain" }} />
);

export const SportBikeIcon = ({ className }: BodyTypeIconProps) => (
  <img src={motorcycleIcon} alt="Sport" className={className} style={{ objectFit: "contain" }} />
);

export const CruiserIcon = ({ className }: BodyTypeIconProps) => (
  <img src={motorcycleIcon} alt="Cruiser" className={className} style={{ objectFit: "contain" }} />
);

export const TouringIcon = ({ className }: BodyTypeIconProps) => (
  <img src={motorcycleIcon} alt="Touring" className={className} style={{ objectFit: "contain" }} />
);

export const EnduroIcon = ({ className }: BodyTypeIconProps) => (
  <img src={motorcycleIcon} alt="Enduro" className={className} style={{ objectFit: "contain" }} />
);

export const NakedIcon = ({ className }: BodyTypeIconProps) => (
  <img src={motorcycleIcon} alt="Naked" className={className} style={{ objectFit: "contain" }} />
);

export const ChopperIcon = ({ className }: BodyTypeIconProps) => (
  <img src={motorcycleIcon} alt="Chopper" className={className} style={{ objectFit: "contain" }} />
);

export const ScooterIcon = ({ className }: BodyTypeIconProps) => (
  <img src={motorcycleIcon} alt="Scooter" className={className} style={{ objectFit: "contain" }} />
);

export const ClassicBikeIcon = ({ className }: BodyTypeIconProps) => (
  <img src={motorcycleIcon} alt="Classic" className={className} style={{ objectFit: "contain" }} />
);

export const bodyTypeIcons: Record<string, React.ComponentType<BodyTypeIconProps>> = {
  sedan: SedanIcon,
  hatchback: HatchbackIcon,
  wagon: WagonIcon,
  suv: SuvIcon,
  crossover: CrossoverIcon,
  coupe: CoupeIcon,
  convertible: ConvertibleIcon,
  minivan: MinivanIcon,
  pickup: PickupIcon,
  van: VanIcon,
  liftback: LiftbackIcon,
  truck: TruckIcon,
  chassis: ChassisIcon,
  tipper: TipperIcon,
  sport: SportBikeIcon,
  cruiser: CruiserIcon,
  touring: TouringIcon,
  enduro: EnduroIcon,
  naked: NakedIcon,
  chopper: ChopperIcon,
  scooter: ScooterIcon,
  classic: ClassicBikeIcon,
};
