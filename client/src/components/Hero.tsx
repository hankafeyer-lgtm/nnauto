// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { MonthPicker } from "@/components/ui/month-picker";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Label } from "@/components/ui/label";
// import { Slider } from "@/components/ui/slider";
// import {
//   Search,
//   ChevronDown,
//   ChevronUp,
//   ChevronLeft,
//   ChevronRight,
//   Clock,
//   Sparkles,
//   Car,
//   Wind,
//   Package,
//   Wrench,
//   Mountain,
//   Sun,
//   CircleDot,
//   Zap,
//   Bot,
//   Activity,
//   ArrowUp,
//   ArrowDown,
//   Grid3x3,
//   Compass,
//   Key,
// } from "lucide-react";
// import { useQuery } from "@tanstack/react-query";
// import type { Listing } from "@shared/schema";
// import { PriceRangeInput } from "@/components/PriceRangeInput";
// import { MileageRangeInput } from "@/components/MileageRangeInput";
// import { YearRangeInput } from "@/components/YearRangeInput";
// import { OwnersRangeInput } from "@/components/OwnersRangeInput";
// import { ListingAgeRangeInput } from "@/components/ListingAgeRangeInput";
// import { EngineRangeInput } from "@/components/EngineRangeInput";
// import { PowerRangeInput } from "@/components/PowerRangeInput";
// import { useLanguage } from "@/contexts/LanguageContext";
// import { useEffect, useState, useRef, memo } from "react";
// import { useLocation } from "wouter";
// import heroImage from "@assets/generated_images/Hero_background_dealership_5896f308.png";
// import convertibleIcon from "@assets/28299981-16D7-4B57-8C0A-67EE5A345CA1_1763441678210.png";
// import crossoverIcon from "@assets/0B62266D-D955-409B-96CC-D4C08E304D2E_1763441985403.png";
// import coupeIcon from "@assets/8F094302-25CC-4310-8D88-C1CFBA4FF415_1763442234994.png";
// import liftbackIcon from "@assets/5F30B3B5-85CD-464F-A96C-A3FBE8D16047_1763442438691.png";
// import pickupIcon from "@assets/BFC09E61-7B8F-4EF9-A0FC-1659F899D077_1763442665715.png";
// import minivanIcon from "@assets/41416F90-6B57-4125-96B7-A6FB8D640061_1763443070365.png";
// import vanIcon from "@assets/4E8B9722-D061-47D3-9C2F-2C8C1070F01B_1763443339270.png";
// import suvIcon from "@assets/0E073D5C-92A6-4128-9DB1-7736CCDBBB25_1763443580852.png";
// import wagonIcon from "@assets/D45BD5A2-3496-43D5-ADB4-A73CDDA709EA_1763443834199.png";
// import hatchbackIcon from "@assets/1E70E4A6-3A57-4039-86B7-F85E01E2C7F4_1763444099447.png";
// import sedanIcon from "@assets/539501B7-9335-431F-AE37-97524B2BC035_1763444682319.png";
// import motorcycleIcon from "@assets/44AD800C-C9BB-4F50-A278-5152E01D60BB_1763444856175.png";
// import truckGoldIcon from "@assets/8C9B6F5F-55BC-402E-9359-B2707FE2FB81_1763444987490.png";
// import carGoldIcon from "@assets/D545620E-B7EF-4EB5-AE03-389B4725412B_1763449648396.png";
// import newCarIcon from "@assets/3AAF8DD0-3B6D-4DA3-8A1E-2858FCC004A1_1763451350424.png";
// import partsIcon from "@assets/62A9ABBD-0474-469C-8089-FA93C3E7C2B4_1763450942216.png";
// import usedCarIcon from "@assets/ABAF6CAB-50AC-450D-8FE8-342C0DF354D6_1763451176037.png";
// import orderCarIcon from "@assets/A6BE7880-928D-4532-BCB1-3FA4A34F89CE_1763451456108.png";
// import { carBrands, carModels } from "@shared/carDatabase";
// import { useFilterParams } from "@/hooks/useFilterParams";
// import {
//   useTranslation,
//   useLocalizedOptions,
//   vehicleTypeBrands,
//   getModelsForVehicleType,
// } from "@/lib/translations";
// import { ModelCombobox } from "@/components/ModelCombobox";
// import { BrandCombobox } from "@/components/BrandCombobox";
// import { RegionCombobox } from "@/components/RegionCombobox";
// import {
//   brandIcons,
//   BrandIconEntry,
//   BrandIconRenderer,
// } from "@/lib/brandIcons";

// const ConvertibleIcon = ({ className }: { className?: string }) => (
//   <img
//     src={convertibleIcon}
//     alt="Convertible"
//     className={className}
//     style={{ objectFit: "contain" }}
//   />
// );

// const CrossoverIcon = ({ className }: { className?: string }) => (
//   <img
//     src={crossoverIcon}
//     alt="Crossover"
//     className={className}
//     style={{ objectFit: "contain" }}
//   />
// );

// const CoupeIcon = ({ className }: { className?: string }) => (
//   <img
//     src={coupeIcon}
//     alt="Coupe"
//     className={className}
//     style={{ objectFit: "contain" }}
//   />
// );

// const LiftbackIcon = ({ className }: { className?: string }) => (
//   <img
//     src={liftbackIcon}
//     alt="Liftback"
//     className={className}
//     style={{ objectFit: "contain" }}
//   />
// );

// const PickupIcon = ({ className }: { className?: string }) => (
//   <img
//     src={pickupIcon}
//     alt="Pickup"
//     className={className}
//     style={{ objectFit: "contain" }}
//   />
// );

// const MinivanIcon = ({ className }: { className?: string }) => (
//   <img
//     src={minivanIcon}
//     alt="Minivan"
//     className={className}
//     style={{ objectFit: "contain" }}
//   />
// );

// const VanIcon = ({ className }: { className?: string }) => (
//   <img
//     src={vanIcon}
//     alt="Van"
//     className={className}
//     style={{ objectFit: "contain" }}
//   />
// );

// const SuvIcon = ({ className }: { className?: string }) => (
//   <img
//     src={suvIcon}
//     alt="SUV"
//     className={className}
//     style={{ objectFit: "contain" }}
//   />
// );

// const WagonIcon = ({ className }: { className?: string }) => (
//   <img
//     src={wagonIcon}
//     alt="Wagon"
//     className={className}
//     style={{ objectFit: "contain" }}
//   />
// );

// const HatchbackIcon = ({ className }: { className?: string }) => (
//   <img
//     src={hatchbackIcon}
//     alt="Hatchback"
//     className={className}
//     style={{ objectFit: "contain" }}
//   />
// );

// const SedanIcon = ({ className }: { className?: string }) => (
//   <img
//     src={sedanIcon}
//     alt="Sedan"
//     className={className}
//     style={{ objectFit: "contain" }}
//   />
// );

// const MotorcycleIcon = ({ className }: { className?: string }) => (
//   <img
//     src={motorcycleIcon}
//     alt="Motorcycle"
//     className={className}
//     style={{ objectFit: "contain" }}
//   />
// );

// const TruckGoldIcon = ({ className }: { className?: string }) => (
//   <img
//     src={truckGoldIcon}
//     alt="Truck"
//     className={className}
//     style={{ objectFit: "contain" }}
//   />
// );

// const CarGoldIcon = ({ className }: { className?: string }) => (
//   <img
//     src={carGoldIcon}
//     alt="Car"
//     className={className}
//     style={{ objectFit: "contain" }}
//   />
// );

// const VanGoldIcon = ({ className }: { className?: string }) => (
//   <img
//     src={vanIcon}
//     alt="Van"
//     className={className}
//     style={{ objectFit: "contain" }}
//   />
// );

// const NewCarIcon = ({ className }: { className?: string }) => (
//   <img
//     src={newCarIcon}
//     alt="New Car"
//     className={className}
//     style={{ objectFit: "contain" }}
//   />
// );

// const PartsIcon = ({ className }: { className?: string }) => (
//   <img
//     src={partsIcon}
//     alt="Parts"
//     className={className}
//     style={{ objectFit: "contain" }}
//   />
// );

// const UsedCarIcon = ({ className }: { className?: string }) => (
//   <img
//     src={usedCarIcon}
//     alt="Used Car"
//     className={className}
//     style={{ objectFit: "contain" }}
//   />
// );

// const OrderCarIcon = ({ className }: { className?: string }) => (
//   <img
//     src={orderCarIcon}
//     alt="Order Car"
//     className={className}
//     style={{ objectFit: "contain" }}
//   />
// );

// function Hero() {
//   const t = useTranslation();
//   const localizedOptions = useLocalizedOptions();
//   const { language } = useLanguage();
//   const [, setLocation] = useLocation();
//   const {
//     filters,
//     setFilters,
//     setCategory,
//     setVehicleType,
//     setBrand,
//     setModel,
//     setPriceRange,
//     setYearRange,
//     setMileageRange,
//     setFuel,
//     setBodyType,
//     setTransmission,
//     setColor,
//     setTrim,
//     setRegion,
//     setDriveType,
//     setEngineRange,
//     setPowerRange,
//     setDoorsRange,
//     setSeatsRange,
//     setOwnersRange,
//     setSellerType,
//     setListingAgeRange,
//     setCondition,
//     setExtras,
//     setEquipment,
//     setEuroEmission,
//     setStkValidUntil,
//     setHasServiceBook,
//   } = useFilterParams();
//   const [showMoreFilters, setShowMoreFilters] = useState(false);
//   const [showAllConditions, setShowAllConditions] = useState(false);
//   const [mileageFilterType, setMileageFilterType] = useState<
//     "50k" | "100k" | "250k" | "custom" | ""
//   >("");
//   const [priceFilterType, setPriceFilterType] = useState<
//     "100k" | "300k" | "500k" | "1M" | "custom" | ""
//   >("");
//   const [yearFilterType, setYearFilterType] = useState<
//     "3" | "6" | "10" | "20" | "custom" | ""
//   >("");
//   const [doorsFilterType, setDoorsFilterType] = useState<
//     "3" | "5" | "custom" | ""
//   >("");
//   const [seatsFilterType, setSeatsFilterType] = useState<
//     "5" | "7" | "custom" | ""
//   >("");

//   const vehicleTypeScrollRef = useRef<HTMLDivElement>(null);

//   const scrollVehicleTypes = (direction: "left" | "right") => {
//     if (vehicleTypeScrollRef.current) {
//       const scrollAmount = 200;
//       vehicleTypeScrollRef.current.scrollBy({
//         left: direction === "left" ? -scrollAmount : scrollAmount,
//         behavior: "smooth",
//       });
//     }
//   };

//   const [priceMinValue, setPriceMinValue] = useState("");
//   const [priceMaxValue, setPriceMaxValue] = useState("");
//   const [mileageMinValue, setMileageMinValue] = useState("");
//   const [mileageMaxValue, setMileageMaxValue] = useState("");

//   const fuelTypes = [
//     { value: "benzin", label: t("hero.benzin") },
//     { value: "diesel", label: t("hero.diesel") },
//     { value: "hybrid", label: t("hero.hybrid") },
//     { value: "electric", label: t("hero.electric") },
//     { value: "lpg", label: t("hero.lpg") },
//     { value: "cng", label: t("hero.cng") },
//   ];

//   const transmissionTypes = [
//     { value: "manual", label: t("filters.manual"), icon: CircleDot },
//     { value: "automatic", label: t("filters.automatic"), icon: Zap },
//     { value: "robot", label: t("filters.robot"), icon: Bot },
//     { value: "cvt", label: t("filters.cvt"), icon: Activity },
//   ];

//   const trimLevels = [
//     { value: "base", label: t("trims.base") },
//     { value: "classic", label: t("trims.classic") },
//     { value: "standard", label: t("trims.standard") },
//     { value: "comfort", label: t("trims.comfort") },
//     { value: "ambition", label: t("trims.ambition") },
//     { value: "style", label: t("trims.style") },
//     { value: "sport", label: t("trims.sport") },
//     { value: "luxury", label: t("trims.luxury") },
//     { value: "premium", label: t("trims.premium") },
//     { value: "executive", label: t("trims.executive") },
//     { value: "performance", label: t("trims.performance") },
//     { value: "limited", label: t("trims.limited") },
//     { value: "special", label: t("trims.special") },
//     { value: "gt", label: "GT" },
//     { value: "rs", label: "RS" },
//     { value: "m-sport", label: "M Sport" },
//     { value: "amg", label: "AMG" },
//     { value: "quattro", label: "Quattro" },
//     { value: "4motion", label: "4Motion" },
//     { value: "xdrive", label: "xDrive" },
//     { value: "raptor", label: "Raptor" },
//   ];

//   const bodyTypes = localizedOptions.getBodyTypes();
//   const colors = localizedOptions.getColors();
//   const regions = localizedOptions.getRegions();
//   const driveTypes = localizedOptions.getDriveTypes();

//   const formatNumber = (value: number): string => {
//     return new Intl.NumberFormat(
//       language === "cs" ? "cs-CZ" : language === "uk" ? "uk-UA" : "en-US",
//     ).format(value);
//   };

//   const parseNumber = (value: string): number => {
//     const cleaned = value.replace(/\s/g, "").replace(/,/g, "");
//     return parseInt(cleaned) || 0;
//   };

//   useEffect(() => {
//     const priceMin = filters.priceMin ?? 10000;
//     const priceMax = filters.priceMax ?? 20000000;

//     if (priceMin > 10000 || priceMax < 20000000) {
//       setPriceMinValue(priceMin > 10000 ? formatNumber(priceMin) : "");
//       setPriceMaxValue(priceMax < 20000000 ? formatNumber(priceMax) : "");
//     }
//   }, [filters.priceMin, filters.priceMax, language]);

//   const bodyTypeIcons: Record<string, any> = {
//     sedan: SedanIcon,
//     hatchback: HatchbackIcon,
//     wagon: WagonIcon,
//     suv: SuvIcon,
//     crossover: CrossoverIcon,
//     coupe: CoupeIcon,
//     convertible: ConvertibleIcon,
//     minivan: MinivanIcon,
//     pickup: PickupIcon,
//     van: VanIcon,
//     liftback: LiftbackIcon,
//   };

//   const driveTypeIcons: Record<string, any> = {
//     fwd: ArrowUp,
//     rwd: ArrowDown,
//     awd: Grid3x3,
//     "4wd": Compass,
//   };

//   // Build query params for listings count
//   const buildQueryParams = () => {
//     const params = new URLSearchParams();
//     if (filters.category) params.set("category", filters.category);
//     if (filters.vehicleType) params.set("vehicleType", filters.vehicleType);
//     if (filters.brand) params.set("brand", filters.brand);
//     if (filters.model) params.set("model", filters.model);
//     if (filters.priceMin) params.set("priceMin", filters.priceMin.toString());
//     if (filters.priceMax) params.set("priceMax", filters.priceMax.toString());
//     if (filters.yearMin) params.set("yearMin", filters.yearMin.toString());
//     if (filters.yearMax) params.set("yearMax", filters.yearMax.toString());
//     if (filters.mileageMin)
//       params.set("mileageMin", filters.mileageMin.toString());
//     if (filters.mileageMax)
//       params.set("mileageMax", filters.mileageMax.toString());
//     if (filters.fuel) params.set("fuel", filters.fuel);
//     if (filters.bodyType && filters.bodyType.length > 0)
//       params.set("bodyType", filters.bodyType.join(","));
//     if (filters.transmission) params.set("transmission", filters.transmission);
//     if (filters.color) params.set("color", filters.color);
//     if (filters.trim) params.set("trim", filters.trim);
//     if (filters.region) params.set("region", filters.region);
//     if (filters.driveType) params.set("driveType", filters.driveType);
//     if (filters.engineMin)
//       params.set("engineMin", filters.engineMin.toString());
//     if (filters.engineMax)
//       params.set("engineMax", filters.engineMax.toString());
//     if (filters.powerMin) params.set("powerMin", filters.powerMin.toString());
//     if (filters.powerMax) params.set("powerMax", filters.powerMax.toString());
//     if (filters.doorsMin) params.set("doorsMin", filters.doorsMin.toString());
//     if (filters.doorsMax) params.set("doorsMax", filters.doorsMax.toString());
//     if (filters.seatsMin) params.set("seatsMin", filters.seatsMin.toString());
//     if (filters.seatsMax) params.set("seatsMax", filters.seatsMax.toString());
//     if (filters.ownersMin)
//       params.set("ownersMin", filters.ownersMin.toString());
//     if (filters.ownersMax)
//       params.set("ownersMax", filters.ownersMax.toString());
//     if (filters.condition && filters.condition.length > 0)
//       params.set("condition", filters.condition.join(","));
//     if (filters.extras && filters.extras.length > 0)
//       params.set("extras", filters.extras.join(","));
//     if (filters.equipment && filters.equipment.length > 0)
//       params.set("equipment", filters.equipment.join(","));
//     return params.toString();
//   };

//   const queryString = buildQueryParams();

//   // Query to get listings count for current filters
//   // const { data: listingsData } = useQuery<{
//   //   listings: Listing[];
//   //   total: number;
//   // }>({
//   //   queryKey: ["/api/listings", queryString],
//   //   staleTime: 5 * 60 * 1000, // 5 minutes - reduce API calls
//   // });
//   const { data: listingsData } = useQuery<{
//     listings: Listing[];
//     pagination?: { total: number };
//     total?: number;
//   }>({
//     queryKey: ["/api/listings", queryString],
//     staleTime: 5 * 60 * 1000,
//   });

//   // const baseListingsCount =
//   //   listingsData?.total ?? listingsData?.listings?.length ?? 0;

//   // const listingsCount = baseListingsCount > 0 ? baseListingsCount + 98 : 0;

//   const baseListingsCount =
//     listingsData?.pagination?.total ??
//     listingsData?.total ??
//     listingsData?.listings?.length ??
//     0;

//   const listingsCount = baseListingsCount > 0 ? baseListingsCount + 98 : 0;
//   const handleCheckboxChange = (
//     category: "condition" | "extras" | "equipment",
//     value: string,
//   ) => {
//     const currentValues = filters[category] || [];
//     const newValues = currentValues.includes(value)
//       ? currentValues.filter((v) => v !== value)
//       : [...currentValues, value];

//     if (category === "condition") setCondition(newValues);
//     else if (category === "extras") setExtras(newValues);
//     else if (category === "equipment") setEquipment(newValues);
//   };

//   const handleMileagePresetChange = (
//     type: "50k" | "100k" | "150k" | "200k" | "custom",
//   ) => {
//     if (mileageFilterType === type) {
//       setMileageFilterType("");
//       setMileageRange(0, 600000);
//       setMileageMinValue("");
//       setMileageMaxValue("");
//       return;
//     }
//     setMileageFilterType(type as any);
//     if (type === "50k") {
//       setMileageRange(0, 50000);
//       setMileageMinValue("");
//       setMileageMaxValue(formatNumber(50000));
//     } else if (type === "100k") {
//       setMileageRange(0, 100000);
//       setMileageMinValue("");
//       setMileageMaxValue(formatNumber(100000));
//     } else if (type === "150k") {
//       setMileageRange(0, 150000);
//       setMileageMinValue("");
//       setMileageMaxValue(formatNumber(150000));
//     } else if (type === "200k") {
//       setMileageRange(0, 200000);
//       setMileageMinValue("");
//       setMileageMaxValue(formatNumber(200000));
//     }
//   };

//   const handlePricePresetChange = (
//     type: "100k" | "300k" | "500k" | "1M" | "custom",
//   ) => {
//     if (priceFilterType === type) {
//       setPriceFilterType("");
//       setPriceRange(0, 20000000);
//       setPriceMinValue("");
//       setPriceMaxValue("");
//       return;
//     }
//     setPriceFilterType(type);
//     if (type === "100k") {
//       setPriceRange(0, 100000);
//       setPriceMinValue("");
//       setPriceMaxValue(formatNumber(100000));
//     } else if (type === "300k") {
//       setPriceRange(0, 300000);
//       setPriceMinValue("");
//       setPriceMaxValue(formatNumber(300000));
//     } else if (type === "500k") {
//       setPriceRange(0, 500000);
//       setPriceMinValue("");
//       setPriceMaxValue(formatNumber(500000));
//     } else if (type === "1M") {
//       setPriceRange(0, 1000000);
//       setPriceMinValue("");
//       setPriceMaxValue(formatNumber(1000000));
//     }
//   };

//   const handlePriceMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setPriceMinValue(e.target.value);
//   };

//   const handlePriceMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setPriceMaxValue(e.target.value);
//   };

//   const handlePriceMinBlur = () => {
//     const parsed = parseNumber(priceMinValue);
//     const priceMax = filters.priceMax ?? 20000000;
//     const clamped = Math.max(10000, Math.min(parsed, priceMax));
//     setPriceMinValue(formatNumber(clamped));
//     setPriceRange(clamped, priceMax);
//   };

//   const handlePriceMaxBlur = () => {
//     const parsed = parseNumber(priceMaxValue);
//     const priceMin = filters.priceMin ?? 10000;
//     const clamped = Math.max(priceMin, Math.min(parsed, 20000000));
//     setPriceMaxValue(formatNumber(clamped));
//     setPriceRange(priceMin, clamped);
//   };

//   const handleMileageMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setMileageMinValue(e.target.value);
//   };

//   const handleMileageMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setMileageMaxValue(e.target.value);
//   };

//   const handleMileageMinBlur = () => {
//     const parsed = parseNumber(mileageMinValue);
//     const mileageMax = filters.mileageMax ?? 600000;
//     const clamped = Math.max(0, Math.min(parsed, mileageMax));
//     if (clamped > 0) {
//       setMileageMinValue(formatNumber(clamped));
//     } else {
//       setMileageMinValue("");
//     }
//     setMileageRange(clamped, mileageMax);
//   };

//   const handleMileageMaxBlur = () => {
//     const parsed = parseNumber(mileageMaxValue);
//     const mileageMin = filters.mileageMin ?? 0;
//     const clamped = Math.max(mileageMin, Math.min(parsed, 600000));
//     if (clamped > 0 && clamped < 600000) {
//       setMileageMaxValue(formatNumber(clamped));
//     } else {
//       setMileageMaxValue("");
//     }
//     setMileageRange(mileageMin, clamped);
//   };

//   const handleDoorsPresetChange = (type: "3" | "5" | "custom") => {
//     if (doorsFilterType === type) {
//       setDoorsFilterType("");
//       setDoorsRange(2, 6);
//       return;
//     }
//     setDoorsFilterType(type);
//     if (type === "3") {
//       setDoorsRange(3, 3);
//     } else if (type === "5") {
//       setDoorsRange(5, 5);
//     }
//   };

//   const handleSeatsPresetChange = (type: "5" | "7" | "custom") => {
//     if (seatsFilterType === type) {
//       setSeatsFilterType("");
//       setSeatsRange(2, 9);
//       return;
//     }
//     setSeatsFilterType(type);
//     if (type === "5") {
//       setSeatsRange(5, 5);
//     } else if (type === "7") {
//       setSeatsRange(7, 7);
//     }
//   };

//   const handleYearPresetChange = (type: "3" | "6" | "10" | "20" | "custom") => {
//     if (yearFilterType === type) {
//       setYearFilterType("");
//       setYearRange(1990, 2026);
//       return;
//     }
//     setYearFilterType(type);
//     const currentYear = 2026;
//     if (type === "3") {
//       setYearRange(currentYear - 3, currentYear);
//     } else if (type === "6") {
//       setYearRange(currentYear - 6, currentYear);
//     } else if (type === "10") {
//       setYearRange(currentYear - 10, currentYear);
//     } else if (type === "20") {
//       setYearRange(currentYear - 20, currentYear);
//     }
//   };

//   const handleSearch = (e: React.FormEvent) => {
//     e.preventDefault();

//     // Build query string from current filters
//     const params = new URLSearchParams();
//     if (filters.category) params.set("category", filters.category);
//     if (filters.vehicleType) params.set("vehicleType", filters.vehicleType);
//     if (filters.brand) params.set("brand", filters.brand);
//     if (filters.model) params.set("model", filters.model);
//     if (filters.priceMin) params.set("priceMin", filters.priceMin.toString());
//     if (filters.priceMax) params.set("priceMax", filters.priceMax.toString());
//     if (filters.yearMin) params.set("yearMin", filters.yearMin.toString());
//     if (filters.yearMax) params.set("yearMax", filters.yearMax.toString());
//     if (filters.mileageMin)
//       params.set("mileageMin", filters.mileageMin.toString());
//     if (filters.mileageMax)
//       params.set("mileageMax", filters.mileageMax.toString());
//     if (filters.fuel) params.set("fuel", filters.fuel);
//     if (filters.bodyType && filters.bodyType.length > 0)
//       params.set("bodyType", filters.bodyType.join(","));
//     if (filters.transmission) params.set("transmission", filters.transmission);
//     if (filters.color) params.set("color", filters.color);
//     if (filters.trim) params.set("trim", filters.trim);
//     if (filters.region) params.set("region", filters.region);
//     if (filters.driveType) params.set("driveType", filters.driveType);
//     if (filters.engineMin)
//       params.set("engineMin", filters.engineMin.toString());
//     if (filters.engineMax)
//       params.set("engineMax", filters.engineMax.toString());
//     if (filters.powerMin) params.set("powerMin", filters.powerMin.toString());
//     if (filters.powerMax) params.set("powerMax", filters.powerMax.toString());
//     if (filters.doorsMin) params.set("doorsMin", filters.doorsMin.toString());
//     if (filters.doorsMax) params.set("doorsMax", filters.doorsMax.toString());
//     if (filters.seatsMin) params.set("seatsMin", filters.seatsMin.toString());
//     if (filters.seatsMax) params.set("seatsMax", filters.seatsMax.toString());
//     if (filters.ownersMin)
//       params.set("ownersMin", filters.ownersMin.toString());
//     if (filters.ownersMax)
//       params.set("ownersMax", filters.ownersMax.toString());
//     if (filters.condition && filters.condition.length > 0)
//       params.set("condition", filters.condition.join(","));
//     if (filters.extras && filters.extras.length > 0)
//       params.set("extras", filters.extras.join(","));
//     if (filters.equipment && filters.equipment.length > 0)
//       params.set("equipment", filters.equipment.join(","));

//     const queryString = params.toString();
//     const url = queryString ? `/listings?${queryString}` : "/listings";
//     setLocation(url);
//   };

//   const availableModels = filters.brand
//     ? getModelsForVehicleType(filters.brand, filters.vehicleType)
//     : [];

//   return (
//     <div
//       className={`relative flex items-center justify-center transition-all duration-300 pt-16 sm:pt-20 lg:pt-24 pb-6 sm:pb-8 lg:pb-10 ${
//         showMoreFilters
//           ? "min-h-[500px] sm:min-h-[550px] lg:min-h-[600px]"
//           : "min-h-[400px] sm:min-h-[480px] lg:min-h-[550px]"
//       }`}
//     >
//       <div
//         className="absolute inset-0 bg-cover bg-center -z-10"
//         style={{ backgroundImage: `url(${heroImage})` }}
//       />
//       <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70 -z-10" />

//       <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="max-w-7xl mx-auto text-center mb-4 sm:mb-6 lg:mb-8">
//           <div className="bg-background/30 backdrop-blur-md rounded-xl px-4 py-5 sm:px-6 sm:py-6 lg:px-10 lg:py-10 border border-white/10">
//             <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-primary mb-2 sm:mb-3 lg:mb-5 tracking-tight leading-tight">
//               {t("hero.title")}
//             </h1>
//             <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/95 font-light leading-relaxed">
//               {t("hero.subtitle")}
//             </p>
//           </div>
//         </div>

//         <div className="max-w-7xl mx-auto">
//           <form
//             onSubmit={handleSearch}
//             className="bg-background/95 backdrop-blur-2xl rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 shadow-2xl border border-white/10"
//           >
//             <div className="mb-3 sm:mb-4 lg:mb-5">
//               <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 lg:gap-3 mb-4">
//                 {[
//                   {
//                     label: t("filters.conditionNew"),
//                     key: "Nové",
//                     icon: Sparkles,
//                     customIcon: NewCarIcon,
//                   },
//                   {
//                     label: t("filters.conditionUsed"),
//                     key: "Ojeté",
//                     icon: Car,
//                     customIcon: UsedCarIcon,
//                   },
//                   {
//                     label: t("hero.motorky"),
//                     key: "motorky",
//                     icon: MotorcycleIcon,
//                     customIcon: MotorcycleIcon,
//                   },
//                   {
//                     label: t("filters.conditionOrder"),
//                     key: "Na objednávku",
//                     icon: Package,
//                     customIcon: OrderCarIcon,
//                   },

//                   ...(showAllConditions
//                     ? [
//                         {
//                           label: t("filters.conditionParts"),
//                           key: "Na náhradní díly",
//                           icon: Wrench,
//                           customIcon: PartsIcon,
//                         },
//                         {
//                           label: t("filters.conditionRental"),
//                           key: "Pronájem",
//                           icon: Key,
//                           customIcon: null,
//                         },
//                         {
//                           label: t("filters.conditionDamaged"),
//                           key: "Havarované",
//                           icon: Wrench,
//                           customIcon: null,
//                         },
//                         {
//                           label: t("filters.conditionHistoric"),
//                           key: "Historické",
//                           icon: Sparkles,
//                           customIcon: null,
//                         },
//                       ]
//                     : []),
//                 ].map((condition) => {
//                   const isSelected =
//                     filters.condition?.includes(condition.key) || false;
//                   const Icon = condition.icon;
//                   const CustomIcon = condition.customIcon;
//                   return (
//                     <Button
//                       key={condition.key}
//                       type="button"
//                       variant={isSelected ? "default" : "outline"}
//                       className={`h-auto py-3 px-3 lg:py-4 lg:px-5 flex flex-col items-center gap-1.5 lg:gap-2.5 text-center bg-background/80 backdrop-blur-sm border-primary/30 hover:border-primary/50 ${!isSelected ? "text-black dark:text-white" : ""} ${isSelected ? "toggle-elevated bg-primary text-primary-foreground" : ""} toggle-elevate`}
//                       onClick={() =>
//                         handleCheckboxChange("condition", condition.key)
//                       }
//                       data-testid={`button-condition-${condition.key.toLowerCase().replace(/\s+/g, "-")}`}
//                     >
//                       {CustomIcon ? (
//                         <CustomIcon className="h-9 w-9 lg:h-11 lg:w-11" />
//                       ) : (
//                         <Icon className="h-7 w-7 lg:h-9 lg:w-9 text-[#B8860B]" />
//                       )}
//                       <span
//                         className={`text-xs lg:text-sm font-medium leading-tight ${!isSelected ? "text-black dark:text-white" : ""}`}
//                       >
//                         {condition.label}
//                       </span>
//                     </Button>
//                   );
//                 })}
//               </div>
//               <div className="flex justify-center">
//                 <Button
//                   type="button"
//                   variant="ghost"
//                   className="h-auto py-2 flex items-center justify-center gap-2 text-[#B8860B]"
//                   onClick={() => setShowAllConditions(!showAllConditions)}
//                   data-testid="button-hero-toggle-conditions"
//                 >
//                   <span className="text-sm font-medium">
//                     {showAllConditions
//                       ? t("filters.showLess")
//                       : t("filters.showMore")}
//                   </span>
//                   <ChevronDown
//                     className={`h-4 w-4 transition-transform ${showAllConditions ? "rotate-180" : ""}`}
//                   />
//                 </Button>
//               </div>

//               <div className="flex items-center gap-2">
//                 <Button
//                   type="button"
//                   variant="outline"
//                   size="icon"
//                   className="h-9 w-9 rounded-full bg-background/90 backdrop-blur-sm shadow-md shrink-0 hidden lg:flex"
//                   onClick={() => scrollVehicleTypes("left")}
//                   data-testid="button-scroll-vehicle-left"
//                 >
//                   <ChevronLeft className="h-4 w-4" />
//                 </Button>

//                 <div
//                   ref={vehicleTypeScrollRef}
//                   className="flex-1 flex gap-1.5 sm:gap-2 lg:gap-2.5 overflow-x-auto pb-2 scrollbar-hide"
//                 >
//                   <button
//                     type="button"
//                     onClick={() => {
//                       const currentTypes = filters.vehicleType
//                         ? filters.vehicleType.split(",").filter(Boolean)
//                         : [];
//                       const isSelected = currentTypes.includes("osobni-auta");
//                       const newTypes = isSelected
//                         ? currentTypes.filter((t) => t !== "osobni-auta")
//                         : [...currentTypes, "osobni-auta"];
//                       setFilters((prev) => ({
//                         ...prev,
//                         vehicleType: newTypes.join(",") || "",
//                         bodyType: undefined,
//                       }));
//                     }}
//                     data-testid="button-vehicle-cars"
//                     className={`w-20 h-20 sm:w-[88px] sm:h-[88px] lg:w-24 lg:h-24 rounded-md font-medium border-2 flex flex-col items-center justify-center gap-1 sm:gap-1.5 flex-shrink-0 p-2 cursor-pointer transition-colors hover-elevate active-elevate-2 ${
//                       filters.vehicleType?.split(",").includes("osobni-auta")
//                         ? "bg-primary text-primary-foreground border-primary-border"
//                         : "bg-background border-input text-black dark:text-white"
//                     }`}
//                   >
//                     <CarGoldIcon className="w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12" />
//                     <span
//                       className={`text-xs sm:text-sm ${!filters.vehicleType?.split(",").includes("osobni-auta") ? "text-black dark:text-white" : ""}`}
//                     >
//                       {t("hero.cars")}
//                     </span>
//                   </button>
//                   <button
//                     type="button"
//                     onClick={() => {
//                       const currentTypes = filters.vehicleType
//                         ? filters.vehicleType.split(",").filter(Boolean)
//                         : [];
//                       const isSelected = currentTypes.includes("dodavky");
//                       const newTypes = isSelected
//                         ? currentTypes.filter((t) => t !== "dodavky")
//                         : [...currentTypes, "dodavky"];
//                       setFilters((prev) => ({
//                         ...prev,
//                         vehicleType: newTypes.join(",") || "",
//                         bodyType: undefined,
//                       }));
//                     }}
//                     data-testid="button-vehicle-dodavky"
//                     className={`w-20 h-20 sm:w-[88px] sm:h-[88px] lg:w-24 lg:h-24 rounded-md font-medium border-2 flex flex-col items-center justify-center gap-1 sm:gap-1.5 flex-shrink-0 p-2 cursor-pointer transition-colors hover-elevate active-elevate-2 ${
//                       filters.vehicleType?.split(",").includes("dodavky")
//                         ? "bg-primary text-primary-foreground border-primary-border"
//                         : "bg-background border-input text-black dark:text-white"
//                     }`}
//                   >
//                     <VanGoldIcon className="w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12" />
//                     <span
//                       className={`text-xs sm:text-sm ${!filters.vehicleType?.split(",").includes("dodavky") ? "text-black dark:text-white" : ""}`}
//                     >
//                       {t("hero.dodavky")}
//                     </span>
//                   </button>
//                   <button
//                     type="button"
//                     onClick={() => {
//                       const currentTypes = filters.vehicleType
//                         ? filters.vehicleType.split(",").filter(Boolean)
//                         : [];
//                       const isSelected = currentTypes.includes("nakladni-vozy");
//                       const newTypes = isSelected
//                         ? currentTypes.filter((t) => t !== "nakladni-vozy")
//                         : [...currentTypes, "nakladni-vozy"];
//                       setFilters((prev) => ({
//                         ...prev,
//                         vehicleType: newTypes.join(",") || "",
//                         bodyType: undefined,
//                       }));
//                     }}
//                     data-testid="button-vehicle-trucks"
//                     className={`w-20 h-20 sm:w-[88px] sm:h-[88px] lg:w-24 lg:h-24 rounded-md font-medium border-2 flex flex-col items-center justify-center gap-1 sm:gap-1.5 flex-shrink-0 p-2 cursor-pointer transition-colors hover-elevate active-elevate-2 ${
//                       filters.vehicleType?.split(",").includes("nakladni-vozy")
//                         ? "bg-primary text-primary-foreground border-primary-border"
//                         : "bg-background border-input text-black dark:text-white"
//                     }`}
//                   >
//                     <TruckGoldIcon className="w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12" />
//                     <span
//                       className={`text-xs sm:text-sm ${!filters.vehicleType?.split(",").includes("nakladni-vozy") ? "text-black dark:text-white" : ""}`}
//                     >
//                       {t("hero.trucks")}
//                     </span>
//                   </button>
//                   <button
//                     type="button"
//                     onClick={() => {
//                       const currentTypes = filters.vehicleType
//                         ? filters.vehicleType.split(",").filter(Boolean)
//                         : [];
//                       const isSelected = currentTypes.includes("motorky");
//                       const newTypes = isSelected
//                         ? currentTypes.filter((t) => t !== "motorky")
//                         : [...currentTypes, "motorky"];
//                       setFilters((prev) => ({
//                         ...prev,
//                         vehicleType: newTypes.join(",") || "",
//                         bodyType: undefined,
//                       }));
//                     }}
//                     data-testid="button-vehicle-motorky"
//                     className={`w-20 h-20 sm:w-[88px] sm:h-[88px] lg:w-24 lg:h-24 rounded-md font-medium border-2 flex flex-col items-center justify-center gap-1 sm:gap-1.5 flex-shrink-0 p-2 cursor-pointer transition-colors hover-elevate active-elevate-2 ${
//                       filters.vehicleType?.split(",").includes("motorky")
//                         ? "bg-primary text-primary-foreground border-primary-border"
//                         : "bg-background border-input text-black dark:text-white"
//                     }`}
//                   >
//                     <MotorcycleIcon className="w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12" />
//                     <span
//                       className={`text-xs sm:text-sm ${!filters.vehicleType?.split(",").includes("motorky") ? "text-black dark:text-white" : ""}`}
//                     >
//                       {t("hero.motorky")}
//                     </span>
//                   </button>
//                   {bodyTypes.map((type) => {
//                     const IconComponent = bodyTypeIcons[type.value] || Car;
//                     const isSelected =
//                       filters.bodyType?.includes(type.value) || false;
//                     const isCustomIcon = true;
//                     return (
//                       <button
//                         key={type.value}
//                         type="button"
//                         onClick={() => {
//                           setFilters((prev) => {
//                             const current = prev.bodyType || [];
//                             const alreadySelected = current.includes(
//                               type.value,
//                             );
//                             const newBodyType = alreadySelected
//                               ? current.filter((v) => v !== type.value)
//                               : [...current, type.value];
//                             return {
//                               ...prev,
//                               vehicleType:
//                                 newBodyType.length > 0
//                                   ? "osobni-auta"
//                                   : prev.vehicleType,
//                               bodyType:
//                                 newBodyType.length > 0
//                                   ? newBodyType
//                                   : undefined,
//                             };
//                           });
//                         }}
//                         className={`w-20 h-20 sm:w-[88px] sm:h-[88px] lg:w-24 lg:h-24 rounded-md font-medium border-2 flex flex-col items-center justify-center gap-1 sm:gap-1.5 flex-shrink-0 p-2 cursor-pointer transition-colors hover-elevate active-elevate-2 ${
//                           isSelected
//                             ? "bg-primary text-primary-foreground border-primary-border"
//                             : "bg-background border-input text-black dark:text-white"
//                         }`}
//                         data-testid={`button-body-type-${type.value}`}
//                       >
//                         <IconComponent
//                           className={
//                             isCustomIcon
//                               ? `w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12`
//                               : `w-8 h-8 sm:w-9 sm:h-9 lg:w-9 lg:h-9 text-black dark:text-white`
//                           }
//                         />
//                         <span
//                           className={`text-xs sm:text-sm ${!isSelected ? "text-black dark:text-white" : ""}`}
//                         >
//                           {type.label}
//                         </span>
//                       </button>
//                     );
//                   })}
//                 </div>

//                 <Button
//                   type="button"
//                   variant="outline"
//                   size="icon"
//                   className="h-9 w-9 rounded-full bg-background/90 backdrop-blur-sm shadow-md shrink-0 hidden lg:flex"
//                   onClick={() => scrollVehicleTypes("right")}
//                   data-testid="button-scroll-vehicle-right"
//                 >
//                   <ChevronRight className="h-4 w-4" />
//                 </Button>
//               </div>
//             </div>

//             <div className="w-full lg:w-1/2 xl:w-2/5 2xl:w-1/3 mb-3 sm:mb-4 space-y-3">
//               <div className="space-y-2">
//                 <BrandCombobox
//                   brands={carBrands
//                     .filter((brand) => {
//                       if (
//                         filters.vehicleType &&
//                         vehicleTypeBrands[filters.vehicleType]
//                       ) {
//                         return vehicleTypeBrands[filters.vehicleType].includes(
//                           brand.value,
//                         );
//                       }
//                       return true;
//                     })
//                     .map((brand) => ({
//                       ...brand,
//                       icon: brandIcons[brand.value],
//                     }))}
//                   value={filters.brand || ""}
//                   onValueChange={setBrand}
//                   placeholder={t("hero.brand")}
//                   emptyMessage={t("hero.noBrandsFound")}
//                   className="w-full"
//                   testId="select-hero-brand"
//                 />

//                 <ModelCombobox
//                   models={availableModels}
//                   value={filters.model || ""}
//                   onValueChange={setModel}
//                   disabled={!filters.brand}
//                   placeholder={
//                     filters.brand ? t("hero.model") : t("hero.selectBrand")
//                   }
//                   emptyMessage={t("hero.noModelsFound")}
//                   className="w-full"
//                   testId="select-model"
//                 />

//                 <Button
//                   type="button"
//                   variant="outline"
//                   className="w-full h-10 sm:h-11 lg:h-11 rounded-md sm:rounded-lg text-sm sm:text-base lg:text-sm font-medium bg-white/10 backdrop-blur-sm border-primary text-primary hover:bg-white/15"
//                   onClick={() => setShowMoreFilters(!showMoreFilters)}
//                   data-testid="button-more-filters"
//                 >
//                   {showMoreFilters ? (
//                     <>
//                       <ChevronUp className="mr-2 h-4 w-4 lg:h-5 lg:w-5" />
//                       {t("hero.lessFilters")}
//                     </>
//                   ) : (
//                     <>
//                       <ChevronDown className="mr-2 h-4 w-4 lg:h-5 lg:w-5" />
//                       {t("hero.moreFilters")}
//                     </>
//                   )}
//                 </Button>
//               </div>
//             </div>

//             <div
//               className={`transition-all duration-300 ease-in-out ${
//                 showMoreFilters
//                   ? "max-h-[2500px] opacity-100 mb-3 sm:mb-4"
//                   : "max-h-0 opacity-0 mb-0"
//               }`}
//               style={{ overflow: showMoreFilters ? "visible" : "hidden" }}
//             >
//               <div className="w-full lg:w-1/2 xl:w-2/5 2xl:w-1/3 space-y-3">
//                 <div className="space-y-2">
//                   <Label className="text-sm sm:text-base font-medium text-primary">
//                     {t("filters.price")}
//                   </Label>
//                   <PriceRangeInput
//                     minValue={filters.priceMin}
//                     maxValue={filters.priceMax}
//                     onMinChange={(value) =>
//                       setPriceRange(
//                         value || 10000,
//                         filters.priceMax || 20000000,
//                       )
//                     }
//                     onMaxChange={(value) =>
//                       setPriceRange(
//                         filters.priceMin || 10000,
//                         value || 20000000,
//                       )
//                     }
//                     variant="hero"
//                     testIdPrefix="hero-price"
//                   />

//                   <div className="flex items-center space-x-2 pt-2">
//                     <Checkbox
//                       id="hero-vat-deductible"
//                       checked={filters.vatDeductible || false}
//                       onCheckedChange={(checked) =>
//                         setFilters((prev) => ({
//                           ...prev,
//                           vatDeductible: checked === true ? true : undefined,
//                         }))
//                       }
//                       data-testid="checkbox-hero-vat-deductible"
//                     />
//                     <label
//                       htmlFor="hero-vat-deductible"
//                       className="text-xs sm:text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-black dark:text-white"
//                     >
//                       {t("filters.vatDeductible")}
//                     </label>
//                   </div>
//                 </div>

//                 <div className="space-y-2">
//                   <Label className="text-sm sm:text-base font-medium text-primary">
//                     {t("filters.mileage")}
//                   </Label>
//                   <MileageRangeInput
//                     minValue={filters.mileageMin || 0}
//                     maxValue={filters.mileageMax || 600000}
//                     onMinChange={(value) =>
//                       setMileageRange(value, filters.mileageMax || 600000)
//                     }
//                     onMaxChange={(value) =>
//                       setMileageRange(filters.mileageMin || 0, value)
//                     }
//                     variant="hero"
//                     testIdPrefix="hero-mileage"
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label className="text-sm sm:text-base font-medium text-primary">
//                     {t("filters.yearOfManufacture")}
//                   </Label>
//                   <YearRangeInput
//                     minValue={filters.yearMin || 1980}
//                     maxValue={filters.yearMax || 2026}
//                     onMinChange={(value) =>
//                       setYearRange(value, filters.yearMax || 2026)
//                     }
//                     onMaxChange={(value) =>
//                       setYearRange(filters.yearMin || 1980, value)
//                     }
//                     variant="hero"
//                     testIdPrefix="hero-year"
//                   />
//                 </div>

//                 <Select value={filters.fuel || ""} onValueChange={setFuel}>
//                   <SelectTrigger
//                     className="h-12 sm:h-14 rounded-lg sm:rounded-xl text-black dark:text-white data-[placeholder]:text-black dark:data-[placeholder]:text-white"
//                     data-testid="select-fuel-type"
//                   >
//                     <SelectValue placeholder={t("hero.fuelType")} />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {fuelTypes.map((fuel) => (
//                       <SelectItem
//                         key={fuel.value}
//                         value={fuel.value}
//                         className="text-black dark:text-white"
//                       >
//                         {fuel.label}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>

//                 <Select
//                   value={filters.transmission || ""}
//                   onValueChange={setTransmission}
//                 >
//                   <SelectTrigger
//                     className="h-12 sm:h-14 rounded-lg sm:rounded-xl text-black dark:text-white data-[placeholder]:text-black dark:data-[placeholder]:text-white"
//                     data-testid="select-transmission"
//                   >
//                     <SelectValue placeholder={t("filters.transmission")} />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {transmissionTypes.map((trans) => {
//                       const Icon = trans.icon;
//                       return (
//                         <SelectItem
//                           key={trans.value}
//                           value={trans.value}
//                           className="text-black dark:text-white"
//                         >
//                           <div className="flex items-center gap-2">
//                             <Icon className="w-4 h-4 text-[#B8860B]" />
//                             <span>{trans.label}</span>
//                           </div>
//                         </SelectItem>
//                       );
//                     })}
//                   </SelectContent>
//                 </Select>

//                 <Select
//                   value={filters.color || "all"}
//                   onValueChange={(value) =>
//                     setColor(value === "all" ? "" : value)
//                   }
//                 >
//                   <SelectTrigger
//                     className="h-12 sm:h-14 rounded-lg sm:rounded-xl text-black dark:text-white"
//                     data-testid="select-color"
//                   >
//                     <SelectValue placeholder={t("filters.color")} />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem
//                       value="all"
//                       className="text-black dark:text-white"
//                     >
//                       {t("filters.allColors")}
//                     </SelectItem>
//                     {colors.map((color) => (
//                       <SelectItem
//                         key={color.value}
//                         value={color.value}
//                         className="text-black dark:text-white"
//                       >
//                         <div className="flex items-center gap-2">
//                           <div
//                             className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600 flex-shrink-0"
//                             style={{
//                               backgroundColor: color.hex,
//                               boxShadow:
//                                 color.value === "white" ||
//                                 color.value === "ivory"
//                                   ? "inset 0 0 0 1px rgba(0,0,0,0.1)"
//                                   : "none",
//                             }}
//                           />
//                           <span>{color.label}</span>
//                         </div>
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>

//                 <Select
//                   value={filters.driveType || ""}
//                   onValueChange={setDriveType}
//                 >
//                   <SelectTrigger
//                     className="h-12 sm:h-14 rounded-lg sm:rounded-xl text-black dark:text-white data-[placeholder]:text-black dark:data-[placeholder]:text-white"
//                     data-testid="select-drive-type"
//                   >
//                     <SelectValue placeholder={t("filters.driveType")} />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {driveTypes.map((drive) => {
//                       const Icon = driveTypeIcons[drive.value];
//                       return (
//                         <SelectItem
//                           key={drive.value}
//                           value={drive.value}
//                           className="text-black dark:text-white"
//                         >
//                           <div className="flex items-center gap-2">
//                             {Icon && (
//                               <Icon className="w-4 h-4 text-[#B8860B]" />
//                             )}
//                             <span>{drive.label}</span>
//                           </div>
//                         </SelectItem>
//                       );
//                     })}
//                   </SelectContent>
//                 </Select>

//                 <div className="col-span-1 sm:col-span-2 lg:col-span-3">
//                   <Label className="text-base sm:text-lg font-medium text-primary mb-3 block">
//                     {t("filters.owners")}
//                   </Label>
//                   <OwnersRangeInput
//                     minValue={filters.ownersMin || 0}
//                     maxValue={filters.ownersMax || 10}
//                     onMinChange={(value) =>
//                       setOwnersRange(value, filters.ownersMax || 10)
//                     }
//                     onMaxChange={(value) =>
//                       setOwnersRange(filters.ownersMin || 0, value)
//                     }
//                     variant="hero"
//                     testIdPrefix="hero-owners"
//                   />
//                 </div>

//                 <div className="space-y-3">
//                   <Label className="text-base sm:text-lg font-medium text-primary">
//                     {t("filters.sellerType")}
//                   </Label>
//                   <div className="grid grid-cols-2 gap-2">
//                     {[
//                       {
//                         key: "private" as const,
//                         label: t("filters.sellerPrivate"),
//                       },
//                       {
//                         key: "dealer" as const,
//                         label: t("filters.sellerDealer"),
//                       },
//                     ].map((option) => {
//                       const isSelected = filters.sellerType === option.key;
//                       return (
//                         <Button
//                           key={option.key}
//                           type="button"
//                           variant={isSelected ? "default" : "outline"}
//                           className={`h-auto py-2 px-3 text-xs sm:text-sm ${!isSelected ? "text-black dark:text-white" : ""} ${isSelected ? "toggle-elevated" : ""} toggle-elevate`}
//                           onClick={() =>
//                             setSellerType(isSelected ? "" : option.key)
//                           }
//                           data-testid={`button-hero-seller-${option.key}`}
//                         >
//                           {option.label}
//                         </Button>
//                       );
//                     })}
//                   </div>
//                 </div>

//                 <div className="space-y-3">
//                   <Label className="text-base sm:text-lg font-medium text-primary">
//                     {t("filters.listingAge")}
//                   </Label>
//                   <ListingAgeRangeInput
//                     minValue={filters.listingAgeMin || 0}
//                     maxValue={filters.listingAgeMax || 365}
//                     onMinChange={(value) =>
//                       setListingAgeRange(value, filters.listingAgeMax || 365)
//                     }
//                     onMaxChange={(value) =>
//                       setListingAgeRange(filters.listingAgeMin || 0, value)
//                     }
//                     variant="hero"
//                     testIdPrefix="hero-listing-age"
//                   />
//                 </div>

//                 {/* Euro Emission */}
//                 <div className="space-y-3">
//                   <Label className="text-base sm:text-lg font-medium text-primary">
//                     {t("filters.euroEmission")}
//                   </Label>
//                   <Select
//                     value={filters.euroEmission || "all"}
//                     onValueChange={(value) =>
//                       setEuroEmission(value === "all" ? "" : value)
//                     }
//                   >
//                     <SelectTrigger
//                       className="h-12 sm:h-14 rounded-lg sm:rounded-xl text-black dark:text-white"
//                       data-testid="select-hero-euro-emission"
//                     >
//                       <SelectValue placeholder={t("filters.allEuroNorms")} />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem
//                         value="all"
//                         className="text-black dark:text-white"
//                       >
//                         {t("filters.allEuroNorms")}
//                       </SelectItem>
//                       <SelectItem
//                         value="euro1"
//                         className="text-black dark:text-white"
//                       >
//                         {t("filters.euro1")}
//                       </SelectItem>
//                       <SelectItem
//                         value="euro2"
//                         className="text-black dark:text-white"
//                       >
//                         {t("filters.euro2")}
//                       </SelectItem>
//                       <SelectItem
//                         value="euro3"
//                         className="text-black dark:text-white"
//                       >
//                         {t("filters.euro3")}
//                       </SelectItem>
//                       <SelectItem
//                         value="euro4"
//                         className="text-black dark:text-white"
//                       >
//                         {t("filters.euro4")}
//                       </SelectItem>
//                       <SelectItem
//                         value="euro5"
//                         className="text-black dark:text-white"
//                       >
//                         {t("filters.euro5")}
//                       </SelectItem>
//                       <SelectItem
//                         value="euro6"
//                         className="text-black dark:text-white"
//                       >
//                         {t("filters.euro6")}
//                       </SelectItem>
//                       <SelectItem
//                         value="euro6d"
//                         className="text-black dark:text-white"
//                       >
//                         {t("filters.euro6d")}
//                       </SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 {/* STK Validity */}
//                 <div className="space-y-3">
//                   <Label className="text-base sm:text-lg font-medium text-primary">
//                     {t("filters.stkValidUntil")}
//                   </Label>
//                   <MonthPicker
//                     value={filters.stkValidUntil || ""}
//                     onChange={(value) => setStkValidUntil(value)}
//                     data-testid="input-hero-stk-valid"
//                   />
//                 </div>

//                 {/* Service Book */}
//                 <div className="flex items-center space-x-3 py-2">
//                   <Checkbox
//                     id="hero-filter-has-service-book"
//                     checked={filters.hasServiceBook || false}
//                     onCheckedChange={(checked) => setHasServiceBook(!!checked)}
//                     data-testid="checkbox-hero-service-book"
//                   />
//                   <label
//                     htmlFor="hero-filter-has-service-book"
//                     className="text-sm sm:text-base font-medium leading-none cursor-pointer text-primary"
//                   >
//                     {t("filters.hasServiceBook")}
//                   </label>
//                 </div>

//                 <div className="space-y-2">
//                   <Label className="text-sm sm:text-base font-medium text-primary">
//                     {t("filters.engineVolume")}
//                   </Label>
//                   <EngineRangeInput
//                     minValue={filters.engineMin || 0}
//                     maxValue={filters.engineMax || 6.0}
//                     onMinChange={(value) =>
//                       setEngineRange(value, filters.engineMax || 6.0)
//                     }
//                     onMaxChange={(value) =>
//                       setEngineRange(filters.engineMin || 0, value)
//                     }
//                     variant="hero"
//                     testIdPrefix="hero-engine"
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label className="text-sm sm:text-base font-medium text-primary">
//                     {t("filters.power")}
//                   </Label>
//                   <PowerRangeInput
//                     minValue={filters.powerMin || 0}
//                     maxValue={filters.powerMax || 1000}
//                     onMinChange={(value) =>
//                       setPowerRange(value, filters.powerMax || 1000)
//                     }
//                     onMaxChange={(value) =>
//                       setPowerRange(filters.powerMin || 0, value)
//                     }
//                     variant="hero"
//                     testIdPrefix="hero-power"
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label className="text-sm sm:text-base font-medium text-primary">
//                     {t("filters.doors")}
//                   </Label>
//                   <div className="grid grid-cols-2 gap-2">
//                     <Input
//                       type="number"
//                       min="2"
//                       max="6"
//                       placeholder={t("hero.from")}
//                       value={filters.doorsMin || ""}
//                       onChange={(e) => {
//                         const value = e.target.value
//                           ? parseInt(e.target.value)
//                           : undefined;
//                         setDoorsRange(value, filters.doorsMax);
//                       }}
//                       className="h-10 bg-white/10 border-primary/30 text-black dark:text-white"
//                       data-testid="input-hero-doors-min"
//                     />
//                     <Input
//                       type="number"
//                       min="2"
//                       max="6"
//                       placeholder={t("hero.to")}
//                       value={filters.doorsMax || ""}
//                       onChange={(e) => {
//                         const value = e.target.value
//                           ? parseInt(e.target.value)
//                           : undefined;
//                         setDoorsRange(filters.doorsMin, value);
//                       }}
//                       className="h-10 bg-white/10 border-primary/30 text-black dark:text-white"
//                       data-testid="input-hero-doors-max"
//                     />
//                   </div>
//                 </div>

//                 <div className="space-y-2">
//                   <Label className="text-sm sm:text-base font-medium text-primary">
//                     {t("filters.seats")}
//                   </Label>
//                   <div className="grid grid-cols-2 gap-2">
//                     <Input
//                       type="number"
//                       min="2"
//                       max="9"
//                       placeholder={t("hero.from")}
//                       value={filters.seatsMin || ""}
//                       onChange={(e) => {
//                         const value = e.target.value
//                           ? parseInt(e.target.value)
//                           : undefined;
//                         setSeatsRange(value, filters.seatsMax);
//                       }}
//                       className="h-10 bg-white/10 border-primary/30 text-black dark:text-white"
//                       data-testid="input-hero-seats-min"
//                     />
//                     <Input
//                       type="number"
//                       min="2"
//                       max="9"
//                       placeholder={t("hero.to")}
//                       value={filters.seatsMax || ""}
//                       onChange={(e) => {
//                         const value = e.target.value
//                           ? parseInt(e.target.value)
//                           : undefined;
//                         setSeatsRange(filters.seatsMin, value);
//                       }}
//                       className="h-10 bg-white/10 border-primary/30 text-black dark:text-white"
//                       data-testid="input-hero-seats-max"
//                     />
//                   </div>
//                 </div>

//                 <div className="col-span-1 sm:col-span-2 lg:col-span-3">
//                   <Label className="text-base sm:text-lg font-medium text-primary mb-3 block">
//                     {t("filters.extras")}
//                   </Label>
//                   <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
//                     {[
//                       { label: t("filters.serviceBook"), key: "service" },
//                       { label: t("filters.notDamaged"), key: "notdamaged" },
//                       { label: t("filters.notPainted"), key: "notpainted" },
//                       { label: t("filters.warranty"), key: "warranty" },
//                       { label: t("filters.exchange"), key: "exchange" },
//                     ].map((extra) => (
//                       <div
//                         key={extra.key}
//                         className="flex items-center space-x-2"
//                       >
//                         <Checkbox
//                           id={`extra-${extra.key}`}
//                           checked={filters.extras?.includes(extra.key) || false}
//                           onCheckedChange={() =>
//                             handleCheckboxChange("extras", extra.key)
//                           }
//                           data-testid={`checkbox-extra-${extra.key}`}
//                         />
//                         <label
//                           htmlFor={`extra-${extra.key}`}
//                           className="text-sm sm:text-base font-medium text-black dark:text-white cursor-pointer"
//                         >
//                           {extra.label}
//                         </label>
//                       </div>
//                     ))}
//                   </div>
//                 </div>

//                 <div className="space-y-2 sm:col-span-2 lg:col-span-3">
//                   <Label className="text-sm sm:text-base font-medium text-primary">
//                     {t("filters.equipment")}
//                   </Label>
//                   <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
//                     {[
//                       { label: t("filters.heatedSeats"), key: "heated-seats" },
//                       {
//                         label: t("filters.electricWindows"),
//                         key: "electric-windows",
//                       },
//                       {
//                         label: t("filters.leatherInterior"),
//                         key: "leather-interior",
//                       },
//                       {
//                         label: t("filters.climateControl"),
//                         key: "climate-control",
//                       },
//                       {
//                         label: t("filters.cruiseControl"),
//                         key: "cruise-control",
//                       },
//                       {
//                         label: t("filters.parkingSensors"),
//                         key: "parking-sensors",
//                       },
//                       { label: t("filters.rearCamera"), key: "rear-camera" },
//                       {
//                         label: t("filters.navigationSystem"),
//                         key: "navigation",
//                       },
//                       { label: t("filters.bluetooth"), key: "bluetooth" },
//                       {
//                         label: t("filters.keylessEntry"),
//                         key: "keyless-entry",
//                       },
//                       {
//                         label: t("filters.ledHeadlights"),
//                         key: "led-headlights",
//                       },
//                       { label: t("filters.sunroof"), key: "sunroof" },
//                       { label: t("filters.alloyWheels"), key: "alloy-wheels" },
//                       {
//                         label: t("filters.ventilatedSeats"),
//                         key: "ventilated-seats",
//                       },
//                       { label: t("filters.memorySeats"), key: "memory-seats" },
//                       {
//                         label: t("filters.massageSeats"),
//                         key: "massage-seats",
//                       },
//                       {
//                         label: t("filters.adaptiveCruise"),
//                         key: "adaptive-cruise",
//                       },
//                       { label: t("filters.laneKeeping"), key: "lane-keeping" },
//                       { label: t("filters.blindSpot"), key: "blind-spot" },
//                       { label: t("filters.rainSensor"), key: "rain-sensor" },
//                       { label: t("filters.lightSensor"), key: "light-sensor" },
//                       {
//                         label: t("filters.heatedSteeringWheel"),
//                         key: "heated-steering",
//                       },
//                       {
//                         label: t("filters.panoramicRoof"),
//                         key: "panoramic-roof",
//                       },
//                       {
//                         label: t("filters.electricSeats"),
//                         key: "electric-seats",
//                       },
//                       {
//                         label: t("filters.parkingAssist"),
//                         key: "parking-assist",
//                       },
//                       {
//                         label: t("filters.headUpDisplay"),
//                         key: "head-up-display",
//                       },
//                       {
//                         label: t("filters.wirelessCharging"),
//                         key: "wireless-charging",
//                       },
//                       { label: t("filters.towHitch"), key: "tow-hitch" },
//                     ].map((equipment) => (
//                       <div
//                         key={equipment.key}
//                         className="flex items-center space-x-2"
//                       >
//                         <Checkbox
//                           id={`hero-equipment-${equipment.key}`}
//                           checked={
//                             filters.equipment?.includes(equipment.key) || false
//                           }
//                           onCheckedChange={() =>
//                             handleCheckboxChange("equipment", equipment.key)
//                           }
//                           data-testid={`checkbox-hero-equipment-${equipment.key}`}
//                         />
//                         <label
//                           htmlFor={`hero-equipment-${equipment.key}`}
//                           className="text-xs sm:text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-black dark:text-white"
//                         >
//                           {equipment.label}
//                         </label>
//                       </div>
//                     ))}
//                   </div>
//                 </div>

//                 <RegionCombobox
//                   value={filters.region || ""}
//                   onValueChange={setRegion}
//                   regions={regions}
//                   placeholder={t("filters.allRegions")}
//                   emptyMessage={t("hero.noRegionsFound")}
//                   testId="select-region"
//                   className="h-10 sm:h-11 lg:h-10 rounded-md sm:rounded-lg"
//                 />
//               </div>
//             </div>

//             <Button
//               type="submit"
//               className="w-full h-12 sm:h-14 lg:h-14 rounded-md sm:rounded-lg text-base sm:text-lg lg:text-lg font-semibold shadow-lg bg-transparent border-2 border-primary text-primary hover:bg-primary/10 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 backdrop-blur-sm animate-pulse-slow"
//               data-testid="button-hero-search"
//             >
//               <Search className="mr-2 h-5 w-5 sm:h-6 sm:w-6 lg:h-6 lg:w-6" />
//               {t("hero.search")}
//               {listingsCount > 0 && (
//                 <span className="ml-2 bg-primary text-primary-foreground rounded-full px-2.5 py-0.5 text-sm font-bold">
//                   {listingsCount}
//                 </span>
//               )}
//             </Button>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default memo(Hero);
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MonthPicker } from "@/components/ui/month-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Search,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
  Car,
  Wind,
  Package,
  Wrench,
  Mountain,
  Sun,
  CircleDot,
  Zap,
  Bot,
  Activity,
  ArrowUp,
  ArrowDown,
  Grid3x3,
  Compass,
  Key,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Listing } from "@shared/schema";
import { PriceRangeInput } from "@/components/PriceRangeInput";
import { MileageRangeInput } from "@/components/MileageRangeInput";
import { YearRangeInput } from "@/components/YearRangeInput";
import { OwnersRangeInput } from "@/components/OwnersRangeInput";
import { ListingAgeRangeInput } from "@/components/ListingAgeRangeInput";
import { EngineRangeInput } from "@/components/EngineRangeInput";
import { PowerRangeInput } from "@/components/PowerRangeInput";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState, useRef, memo } from "react";
import { useLocation } from "wouter";
import heroImage from "@assets/generated_images/Hero_background_dealership_5896f308.png";
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
import carGoldIcon from "@assets/D545620E-B7EF-4EB5-AE03-389B4725412B_1763449648396.png";
import newCarIcon from "@assets/3AAF8DD0-3B6D-4DA3-8A1E-2858FCC004A1_1763451350424.png";
import partsIcon from "@assets/62A9ABBD-0474-469C-8089-FA93C3E7C2B4_1763450942216.png";
import usedCarIcon from "@assets/ABAF6CAB-50AC-450D-8FE8-342C0DF354D6_1763451176037.png";
import orderCarIcon from "@assets/A6BE7880-928D-4532-BCB1-3FA4A34F89CE_1763451456108.png";
import { carBrands, carModels } from "@shared/carDatabase";
import { useFilterParams } from "@/hooks/useFilterParams";
import {
  useTranslation,
  useLocalizedOptions,
  vehicleTypeBrands,
  getModelsForVehicleType,
} from "@/lib/translations";
import { ModelCombobox } from "@/components/ModelCombobox";
import { BrandCombobox } from "@/components/BrandCombobox";
import { RegionCombobox } from "@/components/RegionCombobox";
import {
  brandIcons,
  BrandIconEntry,
  BrandIconRenderer,
} from "@/lib/brandIcons";

const ConvertibleIcon = ({ className }: { className?: string }) => (
  <img
    src={convertibleIcon}
    alt="Convertible"
    className={className}
    style={{ objectFit: "contain" }}
  />
);

const CrossoverIcon = ({ className }: { className?: string }) => (
  <img
    src={crossoverIcon}
    alt="Crossover"
    className={className}
    style={{ objectFit: "contain" }}
  />
);

const CoupeIcon = ({ className }: { className?: string }) => (
  <img
    src={coupeIcon}
    alt="Coupe"
    className={className}
    style={{ objectFit: "contain" }}
  />
);

const LiftbackIcon = ({ className }: { className?: string }) => (
  <img
    src={liftbackIcon}
    alt="Liftback"
    className={className}
    style={{ objectFit: "contain" }}
  />
);

const PickupIcon = ({ className }: { className?: string }) => (
  <img
    src={pickupIcon}
    alt="Pickup"
    className={className}
    style={{ objectFit: "contain" }}
  />
);

const MinivanIcon = ({ className }: { className?: string }) => (
  <img
    src={minivanIcon}
    alt="Minivan"
    className={className}
    style={{ objectFit: "contain" }}
  />
);

const VanIcon = ({ className }: { className?: string }) => (
  <img
    src={vanIcon}
    alt="Van"
    className={className}
    style={{ objectFit: "contain" }}
  />
);

const SuvIcon = ({ className }: { className?: string }) => (
  <img
    src={suvIcon}
    alt="SUV"
    className={className}
    style={{ objectFit: "contain" }}
  />
);

const WagonIcon = ({ className }: { className?: string }) => (
  <img
    src={wagonIcon}
    alt="Wagon"
    className={className}
    style={{ objectFit: "contain" }}
  />
);

const HatchbackIcon = ({ className }: { className?: string }) => (
  <img
    src={hatchbackIcon}
    alt="Hatchback"
    className={className}
    style={{ objectFit: "contain" }}
  />
);

const SedanIcon = ({ className }: { className?: string }) => (
  <img
    src={sedanIcon}
    alt="Sedan"
    className={className}
    style={{ objectFit: "contain" }}
  />
);

const MotorcycleIcon = ({ className }: { className?: string }) => (
  <img
    src={motorcycleIcon}
    alt="Motorcycle"
    className={className}
    style={{ objectFit: "contain" }}
  />
);

const TruckGoldIcon = ({ className }: { className?: string }) => (
  <img
    src={truckGoldIcon}
    alt="Truck"
    className={className}
    style={{ objectFit: "contain" }}
  />
);

const CarGoldIcon = ({ className }: { className?: string }) => (
  <img
    src={carGoldIcon}
    alt="Car"
    className={className}
    style={{ objectFit: "contain" }}
  />
);

const VanGoldIcon = ({ className }: { className?: string }) => (
  <img
    src={vanIcon}
    alt="Van"
    className={className}
    style={{ objectFit: "contain" }}
  />
);

const NewCarIcon = ({ className }: { className?: string }) => (
  <img
    src={newCarIcon}
    alt="New Car"
    className={className}
    style={{ objectFit: "contain" }}
  />
);

const PartsIcon = ({ className }: { className?: string }) => (
  <img
    src={partsIcon}
    alt="Parts"
    className={className}
    style={{ objectFit: "contain" }}
  />
);

const UsedCarIcon = ({ className }: { className?: string }) => (
  <img
    src={usedCarIcon}
    alt="Used Car"
    className={className}
    style={{ objectFit: "contain" }}
  />
);

const OrderCarIcon = ({ className }: { className?: string }) => (
  <img
    src={orderCarIcon}
    alt="Order Car"
    className={className}
    style={{ objectFit: "contain" }}
  />
);

function Hero() {
  const t = useTranslation();
  const localizedOptions = useLocalizedOptions();
  const { language } = useLanguage();
  const [, setLocation] = useLocation();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const {
    filters,
    setFilters,
    setCategory,
    setVehicleType,
    setBrand,
    setModel,
    setPriceRange,
    setYearRange,
    setMileageRange,
    setFuel,
    setBodyType,
    setTransmission,
    setColor,
    setTrim,
    setRegion,
    setDriveType,
    setEngineRange,
    setPowerRange,
    setDoorsRange,
    setSeatsRange,
    setOwnersRange,
    setSellerType,
    setListingAgeRange,
    setCondition,
    setExtras,
    setEquipment,
    setEuroEmission,
    setStkValidUntil,
    setHasServiceBook,
  } = useFilterParams({ autoNavigate: !isMobile });
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [showAllConditions, setShowAllConditions] = useState(false);
  const [mileageFilterType, setMileageFilterType] = useState<
    "50k" | "100k" | "250k" | "custom" | ""
  >("");
  const [priceFilterType, setPriceFilterType] = useState<
    "100k" | "300k" | "500k" | "1M" | "custom" | ""
  >("");
  const [yearFilterType, setYearFilterType] = useState<
    "3" | "6" | "10" | "20" | "custom" | ""
  >("");
  const [doorsFilterType, setDoorsFilterType] = useState<
    "3" | "5" | "custom" | ""
  >("");
  const [seatsFilterType, setSeatsFilterType] = useState<
    "5" | "7" | "custom" | ""
  >("");

  const vehicleTypeScrollRef = useRef<HTMLDivElement>(null);

  const scrollVehicleTypes = (direction: "left" | "right") => {
    if (vehicleTypeScrollRef.current) {
      const scrollAmount = 200;
      vehicleTypeScrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const [priceMinValue, setPriceMinValue] = useState("");
  const [priceMaxValue, setPriceMaxValue] = useState("");
  const [mileageMinValue, setMileageMinValue] = useState("");
  const [mileageMaxValue, setMileageMaxValue] = useState("");

  const fuelTypes = [
    { value: "benzin", label: t("hero.benzin") },
    { value: "diesel", label: t("hero.diesel") },
    { value: "hybrid", label: t("hero.hybrid") },
    { value: "electric", label: t("hero.electric") },
    { value: "lpg", label: t("hero.lpg") },
    { value: "cng", label: t("hero.cng") },
  ];

  const transmissionTypes = [
    { value: "manual", label: t("filters.manual"), icon: CircleDot },
    { value: "automatic", label: t("filters.automatic"), icon: Zap },
    { value: "robot", label: t("filters.robot"), icon: Bot },
    { value: "cvt", label: t("filters.cvt"), icon: Activity },
  ];

  const trimLevels = [
    { value: "base", label: t("trims.base") },
    { value: "classic", label: t("trims.classic") },
    { value: "standard", label: t("trims.standard") },
    { value: "comfort", label: t("trims.comfort") },
    { value: "ambition", label: t("trims.ambition") },
    { value: "style", label: t("trims.style") },
    { value: "sport", label: t("trims.sport") },
    { value: "luxury", label: t("trims.luxury") },
    { value: "premium", label: t("trims.premium") },
    { value: "executive", label: t("trims.executive") },
    { value: "performance", label: t("trims.performance") },
    { value: "limited", label: t("trims.limited") },
    { value: "special", label: t("trims.special") },
    { value: "gt", label: "GT" },
    { value: "rs", label: "RS" },
    { value: "m-sport", label: "M Sport" },
    { value: "amg", label: "AMG" },
    { value: "quattro", label: "Quattro" },
    { value: "4motion", label: "4Motion" },
    { value: "xdrive", label: "xDrive" },
    { value: "raptor", label: "Raptor" },
  ];

  const bodyTypes = localizedOptions.getBodyTypes();
  const colors = localizedOptions.getColors();
  const regions = localizedOptions.getRegions();
  const driveTypes = localizedOptions.getDriveTypes();

  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat(
      language === "cs" ? "cs-CZ" : language === "uk" ? "uk-UA" : "en-US",
    ).format(value);
  };

  const parseNumber = (value: string): number => {
    const cleaned = value.replace(/\s/g, "").replace(/,/g, "");
    return parseInt(cleaned) || 0;
  };

  useEffect(() => {
    const priceMin = filters.priceMin ?? 10000;
    const priceMax = filters.priceMax ?? 20000000;

    if (priceMin > 10000 || priceMax < 20000000) {
      setPriceMinValue(priceMin > 10000 ? formatNumber(priceMin) : "");
      setPriceMaxValue(priceMax < 20000000 ? formatNumber(priceMax) : "");
    }
  }, [filters.priceMin, filters.priceMax, language]);

  const bodyTypeIcons: Record<string, any> = {
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
  };

  const driveTypeIcons: Record<string, any> = {
    fwd: ArrowUp,
    rwd: ArrowDown,
    awd: Grid3x3,
    "4wd": Compass,
  };

  // Build query params for listings count
  const buildQueryParams = () => {
    const params = new URLSearchParams();
    if (filters.category) params.set("category", filters.category);
    if (filters.vehicleType) params.set("vehicleType", filters.vehicleType);
    if (filters.brand) params.set("brand", filters.brand);
    if (filters.model) params.set("model", filters.model);
    if (filters.priceMin) params.set("priceMin", filters.priceMin.toString());
    if (filters.priceMax) params.set("priceMax", filters.priceMax.toString());
    if (filters.yearMin) params.set("yearMin", filters.yearMin.toString());
    if (filters.yearMax) params.set("yearMax", filters.yearMax.toString());
    if (filters.mileageMin)
      params.set("mileageMin", filters.mileageMin.toString());
    if (filters.mileageMax)
      params.set("mileageMax", filters.mileageMax.toString());
    if (filters.fuel) params.set("fuel", filters.fuel);
    if (filters.bodyType && filters.bodyType.length > 0)
      params.set("bodyType", filters.bodyType.join(","));
    if (filters.transmission) params.set("transmission", filters.transmission);
    if (filters.color) params.set("color", filters.color);
    if (filters.trim) params.set("trim", filters.trim);
    if (filters.region) params.set("region", filters.region);
    if (filters.driveType) params.set("driveType", filters.driveType);
    if (filters.engineMin)
      params.set("engineMin", filters.engineMin.toString());
    if (filters.engineMax)
      params.set("engineMax", filters.engineMax.toString());
    if (filters.powerMin) params.set("powerMin", filters.powerMin.toString());
    if (filters.powerMax) params.set("powerMax", filters.powerMax.toString());
    if (filters.doorsMin) params.set("doorsMin", filters.doorsMin.toString());
    if (filters.doorsMax) params.set("doorsMax", filters.doorsMax.toString());
    if (filters.seatsMin) params.set("seatsMin", filters.seatsMin.toString());
    if (filters.seatsMax) params.set("seatsMax", filters.seatsMax.toString());
    if (filters.ownersMin)
      params.set("ownersMin", filters.ownersMin.toString());
    if (filters.ownersMax)
      params.set("ownersMax", filters.ownersMax.toString());
    if (filters.condition && filters.condition.length > 0)
      params.set("condition", filters.condition.join(","));
    if (filters.extras && filters.extras.length > 0)
      params.set("extras", filters.extras.join(","));
    if (filters.equipment && filters.equipment.length > 0)
      params.set("equipment", filters.equipment.join(","));
    return params.toString();
  };

  const queryString = buildQueryParams();

  // Query to get listings count for current filters
  // const { data: listingsData } = useQuery<{
  //   listings: Listing[];
  //   total: number;
  // }>({
  //   queryKey: ["/api/listings", queryString],
  //   staleTime: 5 * 60 * 1000, // 5 minutes - reduce API calls
  // });
  const { data: listingsData } = useQuery<{
    listings: Listing[];
    pagination?: { total: number };
    total?: number;
  }>({
    queryKey: ["/api/listings", queryString],
    staleTime: 5 * 60 * 1000,
  });

  // const baseListingsCount =
  //   listingsData?.total ?? listingsData?.listings?.length ?? 0;

  // const listingsCount = baseListingsCount > 0 ? baseListingsCount + 98 : 0;

  const baseListingsCount =
    listingsData?.pagination?.total ??
    listingsData?.total ??
    listingsData?.listings?.length ??
    0;

  const listingsCount = baseListingsCount > 0 ? baseListingsCount + 98 : 0;
  const handleCheckboxChange = (
    category: "condition" | "extras" | "equipment",
    value: string,
  ) => {
    const currentValues = filters[category] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];

    if (category === "condition") setCondition(newValues);
    else if (category === "extras") setExtras(newValues);
    else if (category === "equipment") setEquipment(newValues);
  };

  const handleMileagePresetChange = (
    type: "50k" | "100k" | "150k" | "200k" | "custom",
  ) => {
    if (mileageFilterType === type) {
      setMileageFilterType("");
      setMileageRange(0, 600000);
      setMileageMinValue("");
      setMileageMaxValue("");
      return;
    }
    setMileageFilterType(type as any);
    if (type === "50k") {
      setMileageRange(0, 50000);
      setMileageMinValue("");
      setMileageMaxValue(formatNumber(50000));
    } else if (type === "100k") {
      setMileageRange(0, 100000);
      setMileageMinValue("");
      setMileageMaxValue(formatNumber(100000));
    } else if (type === "150k") {
      setMileageRange(0, 150000);
      setMileageMinValue("");
      setMileageMaxValue(formatNumber(150000));
    } else if (type === "200k") {
      setMileageRange(0, 200000);
      setMileageMinValue("");
      setMileageMaxValue(formatNumber(200000));
    }
  };

  const handlePricePresetChange = (
    type: "100k" | "300k" | "500k" | "1M" | "custom",
  ) => {
    if (priceFilterType === type) {
      setPriceFilterType("");
      setPriceRange(0, 20000000);
      setPriceMinValue("");
      setPriceMaxValue("");
      return;
    }
    setPriceFilterType(type);
    if (type === "100k") {
      setPriceRange(0, 100000);
      setPriceMinValue("");
      setPriceMaxValue(formatNumber(100000));
    } else if (type === "300k") {
      setPriceRange(0, 300000);
      setPriceMinValue("");
      setPriceMaxValue(formatNumber(300000));
    } else if (type === "500k") {
      setPriceRange(0, 500000);
      setPriceMinValue("");
      setPriceMaxValue(formatNumber(500000));
    } else if (type === "1M") {
      setPriceRange(0, 1000000);
      setPriceMinValue("");
      setPriceMaxValue(formatNumber(1000000));
    }
  };

  const handlePriceMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPriceMinValue(e.target.value);
  };

  const handlePriceMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPriceMaxValue(e.target.value);
  };

  const handlePriceMinBlur = () => {
    const parsed = parseNumber(priceMinValue);
    const priceMax = filters.priceMax ?? 20000000;
    const clamped = Math.max(10000, Math.min(parsed, priceMax));
    setPriceMinValue(formatNumber(clamped));
    setPriceRange(clamped, priceMax);
  };

  const handlePriceMaxBlur = () => {
    const parsed = parseNumber(priceMaxValue);
    const priceMin = filters.priceMin ?? 10000;
    const clamped = Math.max(priceMin, Math.min(parsed, 20000000));
    setPriceMaxValue(formatNumber(clamped));
    setPriceRange(priceMin, clamped);
  };

  const handleMileageMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMileageMinValue(e.target.value);
  };

  const handleMileageMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMileageMaxValue(e.target.value);
  };

  const handleMileageMinBlur = () => {
    const parsed = parseNumber(mileageMinValue);
    const mileageMax = filters.mileageMax ?? 600000;
    const clamped = Math.max(0, Math.min(parsed, mileageMax));
    if (clamped > 0) {
      setMileageMinValue(formatNumber(clamped));
    } else {
      setMileageMinValue("");
    }
    setMileageRange(clamped, mileageMax);
  };

  const handleMileageMaxBlur = () => {
    const parsed = parseNumber(mileageMaxValue);
    const mileageMin = filters.mileageMin ?? 0;
    const clamped = Math.max(mileageMin, Math.min(parsed, 600000));
    if (clamped > 0 && clamped < 600000) {
      setMileageMaxValue(formatNumber(clamped));
    } else {
      setMileageMaxValue("");
    }
    setMileageRange(mileageMin, clamped);
  };

  const handleDoorsPresetChange = (type: "3" | "5" | "custom") => {
    if (doorsFilterType === type) {
      setDoorsFilterType("");
      setDoorsRange(2, 6);
      return;
    }
    setDoorsFilterType(type);
    if (type === "3") {
      setDoorsRange(3, 3);
    } else if (type === "5") {
      setDoorsRange(5, 5);
    }
  };

  const handleSeatsPresetChange = (type: "5" | "7" | "custom") => {
    if (seatsFilterType === type) {
      setSeatsFilterType("");
      setSeatsRange(2, 9);
      return;
    }
    setSeatsFilterType(type);
    if (type === "5") {
      setSeatsRange(5, 5);
    } else if (type === "7") {
      setSeatsRange(7, 7);
    }
  };

  const handleYearPresetChange = (type: "3" | "6" | "10" | "20" | "custom") => {
    if (yearFilterType === type) {
      setYearFilterType("");
      setYearRange(1990, 2026);
      return;
    }
    setYearFilterType(type);
    const currentYear = 2026;
    if (type === "3") {
      setYearRange(currentYear - 3, currentYear);
    } else if (type === "6") {
      setYearRange(currentYear - 6, currentYear);
    } else if (type === "10") {
      setYearRange(currentYear - 10, currentYear);
    } else if (type === "20") {
      setYearRange(currentYear - 20, currentYear);
    }
  };

  // const handleSearch = (e: React.FormEvent) => {
  //   e.preventDefault();

  //   // Build query string from current filters
  //   const params = new URLSearchParams();
  //   if (filters.category) params.set("category", filters.category);
  //   if (filters.vehicleType) params.set("vehicleType", filters.vehicleType);
  //   if (filters.brand) params.set("brand", filters.brand);
  //   if (filters.model) params.set("model", filters.model);
  //   if (filters.priceMin) params.set("priceMin", filters.priceMin.toString());
  //   if (filters.priceMax) params.set("priceMax", filters.priceMax.toString());
  //   if (filters.yearMin) params.set("yearMin", filters.yearMin.toString());
  //   if (filters.yearMax) params.set("yearMax", filters.yearMax.toString());
  //   if (filters.mileageMin)
  //     params.set("mileageMin", filters.mileageMin.toString());
  //   if (filters.mileageMax)
  //     params.set("mileageMax", filters.mileageMax.toString());
  //   if (filters.fuel) params.set("fuel", filters.fuel);
  //   if (filters.bodyType && filters.bodyType.length > 0)
  //     params.set("bodyType", filters.bodyType.join(","));
  //   if (filters.transmission) params.set("transmission", filters.transmission);
  //   if (filters.color) params.set("color", filters.color);
  //   if (filters.trim) params.set("trim", filters.trim);
  //   if (filters.region) params.set("region", filters.region);
  //   if (filters.driveType) params.set("driveType", filters.driveType);
  //   if (filters.engineMin)
  //     params.set("engineMin", filters.engineMin.toString());
  //   if (filters.engineMax)
  //     params.set("engineMax", filters.engineMax.toString());
  //   if (filters.powerMin) params.set("powerMin", filters.powerMin.toString());
  //   if (filters.powerMax) params.set("powerMax", filters.powerMax.toString());
  //   if (filters.doorsMin) params.set("doorsMin", filters.doorsMin.toString());
  //   if (filters.doorsMax) params.set("doorsMax", filters.doorsMax.toString());
  //   if (filters.seatsMin) params.set("seatsMin", filters.seatsMin.toString());
  //   if (filters.seatsMax) params.set("seatsMax", filters.seatsMax.toString());
  //   if (filters.ownersMin)
  //     params.set("ownersMin", filters.ownersMin.toString());
  //   if (filters.ownersMax)
  //     params.set("ownersMax", filters.ownersMax.toString());
  //   if (filters.condition && filters.condition.length > 0)
  //     params.set("condition", filters.condition.join(","));
  //   if (filters.extras && filters.extras.length > 0)
  //     params.set("extras", filters.extras.join(","));
  //   if (filters.equipment && filters.equipment.length > 0)
  //     params.set("equipment", filters.equipment.join(","));

  //   const queryString = params.toString();
  //   const url = queryString ? `/listings?${queryString}` : "/listings";
  //   setLocation(url);
  // };
  const handleSearch = (e: React.FormEvent, force = false) => {
    e.preventDefault();

    if (isMobile && !force) return;

    const params = new URLSearchParams();
    if (filters.category) params.set("category", filters.category);
    if (filters.vehicleType) params.set("vehicleType", filters.vehicleType);
    if (filters.brand) params.set("brand", filters.brand);
    if (filters.model) params.set("model", filters.model);
    if (filters.priceMin) params.set("priceMin", filters.priceMin.toString());
    if (filters.priceMax) params.set("priceMax", filters.priceMax.toString());
    if (filters.yearMin) params.set("yearMin", filters.yearMin.toString());
    if (filters.yearMax) params.set("yearMax", filters.yearMax.toString());
    if (filters.mileageMin)
      params.set("mileageMin", filters.mileageMin.toString());
    if (filters.mileageMax)
      params.set("mileageMax", filters.mileageMax.toString());
    if (filters.fuel) params.set("fuel", filters.fuel);
    if (filters.bodyType?.length)
      params.set("bodyType", filters.bodyType.join(","));
    if (filters.transmission) params.set("transmission", filters.transmission);
    if (filters.color) params.set("color", filters.color);
    if (filters.trim) params.set("trim", filters.trim);
    if (filters.region) params.set("region", filters.region);
    if (filters.driveType) params.set("driveType", filters.driveType);
    if (filters.engineMin)
      params.set("engineMin", filters.engineMin.toString());
    if (filters.engineMax)
      params.set("engineMax", filters.engineMax.toString());
    if (filters.powerMin) params.set("powerMin", filters.powerMin.toString());
    if (filters.powerMax) params.set("powerMax", filters.powerMax.toString());
    if (filters.doorsMin) params.set("doorsMin", filters.doorsMin.toString());
    if (filters.doorsMax) params.set("doorsMax", filters.doorsMax.toString());
    if (filters.seatsMin) params.set("seatsMin", filters.seatsMin.toString());
    if (filters.seatsMax) params.set("seatsMax", filters.seatsMax.toString());
    if (filters.ownersMin)
      params.set("ownersMin", filters.ownersMin.toString());
    if (filters.ownersMax)
      params.set("ownersMax", filters.ownersMax.toString());
    if (filters.condition?.length)
      params.set("condition", filters.condition.join(","));
    if (filters.extras?.length) params.set("extras", filters.extras.join(","));
    if (filters.equipment?.length)
      params.set("equipment", filters.equipment.join(","));

    const queryString = params.toString();
    setLocation(queryString ? `/listings?${queryString}` : "/listings");
  };

  const availableModels = filters.brand
    ? getModelsForVehicleType(filters.brand, filters.vehicleType)
    : [];

  return (
    <div
      className={`relative flex items-center justify-center transition-all duration-300 pt-16 sm:pt-20 lg:pt-24 pb-6 sm:pb-8 lg:pb-10 ${
        showMoreFilters
          ? "min-h-[500px] sm:min-h-[550px] lg:min-h-[600px]"
          : "min-h-[400px] sm:min-h-[480px] lg:min-h-[550px]"
      }`}
    >
      <div
        className="absolute inset-0 bg-cover bg-center -z-10"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70 -z-10" />

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center mb-4 sm:mb-6 lg:mb-8">
          <div className="bg-background/30 backdrop-blur-md rounded-xl px-4 py-5 sm:px-6 sm:py-6 lg:px-10 lg:py-10 border border-white/10">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-primary mb-2 sm:mb-3 lg:mb-5 tracking-tight leading-tight">
              {t("hero.title")}
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/95 font-light leading-relaxed">
              {t("hero.subtitle")}
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto">
          <form
            onSubmit={handleSearch}
            className="bg-background/95 backdrop-blur-2xl rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 shadow-2xl border border-white/10"
          >
            <div className="mb-3 sm:mb-4 lg:mb-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 lg:gap-3 mb-4">
                {[
                  {
                    label: t("filters.conditionNew"),
                    key: "Nové",
                    icon: Sparkles,
                    customIcon: NewCarIcon,
                  },
                  {
                    label: t("filters.conditionUsed"),
                    key: "Ojeté",
                    icon: Car,
                    customIcon: UsedCarIcon,
                  },
                  {
                    label: t("hero.motorky"),
                    key: "motorky",
                    icon: MotorcycleIcon,
                    customIcon: MotorcycleIcon,
                  },
                  {
                    label: t("filters.conditionOrder"),
                    key: "Na objednávku",
                    icon: Package,
                    customIcon: OrderCarIcon,
                  },

                  ...(showAllConditions
                    ? [
                        {
                          label: t("filters.conditionParts"),
                          key: "Na náhradní díly",
                          icon: Wrench,
                          customIcon: PartsIcon,
                        },
                        {
                          label: t("filters.conditionRental"),
                          key: "Pronájem",
                          icon: Key,
                          customIcon: null,
                        },
                        {
                          label: t("filters.conditionDamaged"),
                          key: "Havarované",
                          icon: Wrench,
                          customIcon: null,
                        },
                        {
                          label: t("filters.conditionHistoric"),
                          key: "Historické",
                          icon: Sparkles,
                          customIcon: null,
                        },
                      ]
                    : []),
                ].map((condition) => {
                  const isSelected =
                    filters.condition?.includes(condition.key) || false;
                  const Icon = condition.icon;
                  const CustomIcon = condition.customIcon;
                  return (
                    <Button
                      key={condition.key}
                      type="button"
                      variant={isSelected ? "default" : "outline"}
                      className={`h-auto py-3 px-3 lg:py-4 lg:px-5 flex flex-col items-center gap-1.5 lg:gap-2.5 text-center bg-background/80 backdrop-blur-sm border-primary/30 hover:border-primary/50 ${!isSelected ? "text-black dark:text-white" : ""} ${isSelected ? "toggle-elevated bg-primary text-primary-foreground" : ""} toggle-elevate`}
                      onClick={() =>
                        handleCheckboxChange("condition", condition.key)
                      }
                      data-testid={`button-condition-${condition.key.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      {CustomIcon ? (
                        <CustomIcon className="h-9 w-9 lg:h-11 lg:w-11" />
                      ) : (
                        <Icon className="h-7 w-7 lg:h-9 lg:w-9 text-[#B8860B]" />
                      )}
                      <span
                        className={`text-xs lg:text-sm font-medium leading-tight ${!isSelected ? "text-black dark:text-white" : ""}`}
                      >
                        {condition.label}
                      </span>
                    </Button>
                  );
                })}
              </div>
              <div className="flex justify-center">
                <Button
                  type="button"
                  variant="ghost"
                  className="h-auto py-2 flex items-center justify-center gap-2 text-[#B8860B]"
                  onClick={() => setShowAllConditions(!showAllConditions)}
                  data-testid="button-hero-toggle-conditions"
                >
                  <span className="text-sm font-medium">
                    {showAllConditions
                      ? t("filters.showLess")
                      : t("filters.showMore")}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${showAllConditions ? "rotate-180" : ""}`}
                  />
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 rounded-full bg-background/90 backdrop-blur-sm shadow-md shrink-0 hidden lg:flex"
                  onClick={() => scrollVehicleTypes("left")}
                  data-testid="button-scroll-vehicle-left"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div
                  ref={vehicleTypeScrollRef}
                  className="flex-1 flex gap-1.5 sm:gap-2 lg:gap-2.5 overflow-x-auto pb-2 scrollbar-hide"
                >
                  <button
                    type="button"
                    onClick={() => {
                      const currentTypes = filters.vehicleType
                        ? filters.vehicleType.split(",").filter(Boolean)
                        : [];
                      const isSelected = currentTypes.includes("osobni-auta");
                      const newTypes = isSelected
                        ? currentTypes.filter((t) => t !== "osobni-auta")
                        : [...currentTypes, "osobni-auta"];
                      setFilters((prev) => ({
                        ...prev,
                        vehicleType: newTypes.join(",") || "",
                        bodyType: undefined,
                      }));
                    }}
                    data-testid="button-vehicle-cars"
                    className={`w-20 h-20 sm:w-[88px] sm:h-[88px] lg:w-24 lg:h-24 rounded-md font-medium border-2 flex flex-col items-center justify-center gap-1 sm:gap-1.5 flex-shrink-0 p-2 cursor-pointer transition-colors hover-elevate active-elevate-2 ${
                      filters.vehicleType?.split(",").includes("osobni-auta")
                        ? "bg-primary text-primary-foreground border-primary-border"
                        : "bg-background border-input text-black dark:text-white"
                    }`}
                  >
                    <CarGoldIcon className="w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12" />
                    <span
                      className={`text-xs sm:text-sm ${!filters.vehicleType?.split(",").includes("osobni-auta") ? "text-black dark:text-white" : ""}`}
                    >
                      {t("hero.cars")}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const currentTypes = filters.vehicleType
                        ? filters.vehicleType.split(",").filter(Boolean)
                        : [];
                      const isSelected = currentTypes.includes("dodavky");
                      const newTypes = isSelected
                        ? currentTypes.filter((t) => t !== "dodavky")
                        : [...currentTypes, "dodavky"];
                      setFilters((prev) => ({
                        ...prev,
                        vehicleType: newTypes.join(",") || "",
                        bodyType: undefined,
                      }));
                    }}
                    data-testid="button-vehicle-dodavky"
                    className={`w-20 h-20 sm:w-[88px] sm:h-[88px] lg:w-24 lg:h-24 rounded-md font-medium border-2 flex flex-col items-center justify-center gap-1 sm:gap-1.5 flex-shrink-0 p-2 cursor-pointer transition-colors hover-elevate active-elevate-2 ${
                      filters.vehicleType?.split(",").includes("dodavky")
                        ? "bg-primary text-primary-foreground border-primary-border"
                        : "bg-background border-input text-black dark:text-white"
                    }`}
                  >
                    <VanGoldIcon className="w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12" />
                    <span
                      className={`text-xs sm:text-sm ${!filters.vehicleType?.split(",").includes("dodavky") ? "text-black dark:text-white" : ""}`}
                    >
                      {t("hero.dodavky")}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const currentTypes = filters.vehicleType
                        ? filters.vehicleType.split(",").filter(Boolean)
                        : [];
                      const isSelected = currentTypes.includes("nakladni-vozy");
                      const newTypes = isSelected
                        ? currentTypes.filter((t) => t !== "nakladni-vozy")
                        : [...currentTypes, "nakladni-vozy"];
                      setFilters((prev) => ({
                        ...prev,
                        vehicleType: newTypes.join(",") || "",
                        bodyType: undefined,
                      }));
                    }}
                    data-testid="button-vehicle-trucks"
                    className={`w-20 h-20 sm:w-[88px] sm:h-[88px] lg:w-24 lg:h-24 rounded-md font-medium border-2 flex flex-col items-center justify-center gap-1 sm:gap-1.5 flex-shrink-0 p-2 cursor-pointer transition-colors hover-elevate active-elevate-2 ${
                      filters.vehicleType?.split(",").includes("nakladni-vozy")
                        ? "bg-primary text-primary-foreground border-primary-border"
                        : "bg-background border-input text-black dark:text-white"
                    }`}
                  >
                    <TruckGoldIcon className="w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12" />
                    <span
                      className={`text-xs sm:text-sm ${!filters.vehicleType?.split(",").includes("nakladni-vozy") ? "text-black dark:text-white" : ""}`}
                    >
                      {t("hero.trucks")}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const currentTypes = filters.vehicleType
                        ? filters.vehicleType.split(",").filter(Boolean)
                        : [];
                      const isSelected = currentTypes.includes("motorky");
                      const newTypes = isSelected
                        ? currentTypes.filter((t) => t !== "motorky")
                        : [...currentTypes, "motorky"];
                      setFilters((prev) => ({
                        ...prev,
                        vehicleType: newTypes.join(",") || "",
                        bodyType: undefined,
                      }));
                    }}
                    data-testid="button-vehicle-motorky"
                    className={`w-20 h-20 sm:w-[88px] sm:h-[88px] lg:w-24 lg:h-24 rounded-md font-medium border-2 flex flex-col items-center justify-center gap-1 sm:gap-1.5 flex-shrink-0 p-2 cursor-pointer transition-colors hover-elevate active-elevate-2 ${
                      filters.vehicleType?.split(",").includes("motorky")
                        ? "bg-primary text-primary-foreground border-primary-border"
                        : "bg-background border-input text-black dark:text-white"
                    }`}
                  >
                    <MotorcycleIcon className="w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12" />
                    <span
                      className={`text-xs sm:text-sm ${!filters.vehicleType?.split(",").includes("motorky") ? "text-black dark:text-white" : ""}`}
                    >
                      {t("hero.motorky")}
                    </span>
                  </button>
                  {bodyTypes.map((type) => {
                    const IconComponent = bodyTypeIcons[type.value] || Car;
                    const isSelected =
                      filters.bodyType?.includes(type.value) || false;
                    const isCustomIcon = true;
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => {
                          setFilters((prev) => {
                            const current = prev.bodyType || [];
                            const alreadySelected = current.includes(
                              type.value,
                            );
                            const newBodyType = alreadySelected
                              ? current.filter((v) => v !== type.value)
                              : [...current, type.value];
                            return {
                              ...prev,
                              vehicleType:
                                newBodyType.length > 0
                                  ? "osobni-auta"
                                  : prev.vehicleType,
                              bodyType:
                                newBodyType.length > 0
                                  ? newBodyType
                                  : undefined,
                            };
                          });
                        }}
                        className={`w-20 h-20 sm:w-[88px] sm:h-[88px] lg:w-24 lg:h-24 rounded-md font-medium border-2 flex flex-col items-center justify-center gap-1 sm:gap-1.5 flex-shrink-0 p-2 cursor-pointer transition-colors hover-elevate active-elevate-2 ${
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary-border"
                            : "bg-background border-input text-black dark:text-white"
                        }`}
                        data-testid={`button-body-type-${type.value}`}
                      >
                        <IconComponent
                          className={
                            isCustomIcon
                              ? `w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12`
                              : `w-8 h-8 sm:w-9 sm:h-9 lg:w-9 lg:h-9 text-black dark:text-white`
                          }
                        />
                        <span
                          className={`text-xs sm:text-sm ${!isSelected ? "text-black dark:text-white" : ""}`}
                        >
                          {type.label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 rounded-full bg-background/90 backdrop-blur-sm shadow-md shrink-0 hidden lg:flex"
                  onClick={() => scrollVehicleTypes("right")}
                  data-testid="button-scroll-vehicle-right"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="w-full lg:w-1/2 xl:w-2/5 2xl:w-1/3 mb-3 sm:mb-4 space-y-3">
              <div className="space-y-2">
                <BrandCombobox
                  brands={carBrands
                    .filter((brand) => {
                      if (
                        filters.vehicleType &&
                        vehicleTypeBrands[filters.vehicleType]
                      ) {
                        return vehicleTypeBrands[filters.vehicleType].includes(
                          brand.value,
                        );
                      }
                      return true;
                    })
                    .map((brand) => ({
                      ...brand,
                      icon: brandIcons[brand.value],
                    }))}
                  value={filters.brand || ""}
                  onValueChange={setBrand}
                  placeholder={t("hero.brand")}
                  emptyMessage={t("hero.noBrandsFound")}
                  className="w-full"
                  testId="select-hero-brand"
                />

                <ModelCombobox
                  models={availableModels}
                  value={filters.model || ""}
                  onValueChange={setModel}
                  disabled={!filters.brand}
                  placeholder={
                    filters.brand ? t("hero.model") : t("hero.selectBrand")
                  }
                  emptyMessage={t("hero.noModelsFound")}
                  className="w-full"
                  testId="select-model"
                />

                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-10 sm:h-11 lg:h-11 rounded-md sm:rounded-lg text-sm sm:text-base lg:text-sm font-medium bg-white/10 backdrop-blur-sm border-primary text-primary hover:bg-white/15"
                  onClick={() => setShowMoreFilters(!showMoreFilters)}
                  data-testid="button-more-filters"
                >
                  {showMoreFilters ? (
                    <>
                      <ChevronUp className="mr-2 h-4 w-4 lg:h-5 lg:w-5" />
                      {t("hero.lessFilters")}
                    </>
                  ) : (
                    <>
                      <ChevronDown className="mr-2 h-4 w-4 lg:h-5 lg:w-5" />
                      {t("hero.moreFilters")}
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div
              className={`transition-all duration-300 ease-in-out ${
                showMoreFilters
                  ? "max-h-[2500px] opacity-100 mb-3 sm:mb-4"
                  : "max-h-0 opacity-0 mb-0"
              }`}
              style={{ overflow: showMoreFilters ? "visible" : "hidden" }}
            >
              <div className="w-full lg:w-1/2 xl:w-2/5 2xl:w-1/3 space-y-3">
                <div className="space-y-2">
                  <Label className="text-sm sm:text-base font-medium text-primary">
                    {t("filters.price")}
                  </Label>
                  <PriceRangeInput
                    minValue={filters.priceMin}
                    maxValue={filters.priceMax}
                    onMinChange={(value) =>
                      setPriceRange(
                        value || 10000,
                        filters.priceMax || 20000000,
                      )
                    }
                    onMaxChange={(value) =>
                      setPriceRange(
                        filters.priceMin || 10000,
                        value || 20000000,
                      )
                    }
                    variant="hero"
                    testIdPrefix="hero-price"
                  />

                  <div className="flex items-center space-x-2 pt-2">
                    <Checkbox
                      id="hero-vat-deductible"
                      checked={filters.vatDeductible || false}
                      onCheckedChange={(checked) =>
                        setFilters((prev) => ({
                          ...prev,
                          vatDeductible: checked === true ? true : undefined,
                        }))
                      }
                      data-testid="checkbox-hero-vat-deductible"
                    />
                    <label
                      htmlFor="hero-vat-deductible"
                      className="text-xs sm:text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-black dark:text-white"
                    >
                      {t("filters.vatDeductible")}
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm sm:text-base font-medium text-primary">
                    {t("filters.mileage")}
                  </Label>
                  <MileageRangeInput
                    minValue={filters.mileageMin || 0}
                    maxValue={filters.mileageMax || 600000}
                    onMinChange={(value) =>
                      setMileageRange(value, filters.mileageMax || 600000)
                    }
                    onMaxChange={(value) =>
                      setMileageRange(filters.mileageMin || 0, value)
                    }
                    variant="hero"
                    testIdPrefix="hero-mileage"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm sm:text-base font-medium text-primary">
                    {t("filters.yearOfManufacture")}
                  </Label>
                  <YearRangeInput
                    minValue={filters.yearMin || 1980}
                    maxValue={filters.yearMax || 2026}
                    onMinChange={(value) =>
                      setYearRange(value, filters.yearMax || 2026)
                    }
                    onMaxChange={(value) =>
                      setYearRange(filters.yearMin || 1980, value)
                    }
                    variant="hero"
                    testIdPrefix="hero-year"
                  />
                </div>

                <Select value={filters.fuel || ""} onValueChange={setFuel}>
                  <SelectTrigger
                    className="h-12 sm:h-14 rounded-lg sm:rounded-xl text-black dark:text-white data-[placeholder]:text-black dark:data-[placeholder]:text-white"
                    data-testid="select-fuel-type"
                  >
                    <SelectValue placeholder={t("hero.fuelType")} />
                  </SelectTrigger>
                  <SelectContent>
                    {fuelTypes.map((fuel) => (
                      <SelectItem
                        key={fuel.value}
                        value={fuel.value}
                        className="text-black dark:text-white"
                      >
                        {fuel.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={filters.transmission || ""}
                  onValueChange={setTransmission}
                >
                  <SelectTrigger
                    className="h-12 sm:h-14 rounded-lg sm:rounded-xl text-black dark:text-white data-[placeholder]:text-black dark:data-[placeholder]:text-white"
                    data-testid="select-transmission"
                  >
                    <SelectValue placeholder={t("filters.transmission")} />
                  </SelectTrigger>
                  <SelectContent>
                    {transmissionTypes.map((trans) => {
                      const Icon = trans.icon;
                      return (
                        <SelectItem
                          key={trans.value}
                          value={trans.value}
                          className="text-black dark:text-white"
                        >
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4 text-[#B8860B]" />
                            <span>{trans.label}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>

                <Select
                  value={filters.color || "all"}
                  onValueChange={(value) =>
                    setColor(value === "all" ? "" : value)
                  }
                >
                  <SelectTrigger
                    className="h-12 sm:h-14 rounded-lg sm:rounded-xl text-black dark:text-white"
                    data-testid="select-color"
                  >
                    <SelectValue placeholder={t("filters.color")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      value="all"
                      className="text-black dark:text-white"
                    >
                      {t("filters.allColors")}
                    </SelectItem>
                    {colors.map((color) => (
                      <SelectItem
                        key={color.value}
                        value={color.value}
                        className="text-black dark:text-white"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600 flex-shrink-0"
                            style={{
                              backgroundColor: color.hex,
                              boxShadow:
                                color.value === "white" ||
                                color.value === "ivory"
                                  ? "inset 0 0 0 1px rgba(0,0,0,0.1)"
                                  : "none",
                            }}
                          />
                          <span>{color.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={filters.driveType || ""}
                  onValueChange={setDriveType}
                >
                  <SelectTrigger
                    className="h-12 sm:h-14 rounded-lg sm:rounded-xl text-black dark:text-white data-[placeholder]:text-black dark:data-[placeholder]:text-white"
                    data-testid="select-drive-type"
                  >
                    <SelectValue placeholder={t("filters.driveType")} />
                  </SelectTrigger>
                  <SelectContent>
                    {driveTypes.map((drive) => {
                      const Icon = driveTypeIcons[drive.value];
                      return (
                        <SelectItem
                          key={drive.value}
                          value={drive.value}
                          className="text-black dark:text-white"
                        >
                          <div className="flex items-center gap-2">
                            {Icon && (
                              <Icon className="w-4 h-4 text-[#B8860B]" />
                            )}
                            <span>{drive.label}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>

                <div className="col-span-1 sm:col-span-2 lg:col-span-3">
                  <Label className="text-base sm:text-lg font-medium text-primary mb-3 block">
                    {t("filters.owners")}
                  </Label>
                  <OwnersRangeInput
                    minValue={filters.ownersMin || 0}
                    maxValue={filters.ownersMax || 10}
                    onMinChange={(value) =>
                      setOwnersRange(value, filters.ownersMax || 10)
                    }
                    onMaxChange={(value) =>
                      setOwnersRange(filters.ownersMin || 0, value)
                    }
                    variant="hero"
                    testIdPrefix="hero-owners"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-base sm:text-lg font-medium text-primary">
                    {t("filters.sellerType")}
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      {
                        key: "private" as const,
                        label: t("filters.sellerPrivate"),
                      },
                      {
                        key: "dealer" as const,
                        label: t("filters.sellerDealer"),
                      },
                    ].map((option) => {
                      const isSelected = filters.sellerType === option.key;
                      return (
                        <Button
                          key={option.key}
                          type="button"
                          variant={isSelected ? "default" : "outline"}
                          className={`h-auto py-2 px-3 text-xs sm:text-sm ${!isSelected ? "text-black dark:text-white" : ""} ${isSelected ? "toggle-elevated" : ""} toggle-elevate`}
                          onClick={() =>
                            setSellerType(isSelected ? "" : option.key)
                          }
                          data-testid={`button-hero-seller-${option.key}`}
                        >
                          {option.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-base sm:text-lg font-medium text-primary">
                    {t("filters.listingAge")}
                  </Label>
                  <ListingAgeRangeInput
                    minValue={filters.listingAgeMin || 0}
                    maxValue={filters.listingAgeMax || 365}
                    onMinChange={(value) =>
                      setListingAgeRange(value, filters.listingAgeMax || 365)
                    }
                    onMaxChange={(value) =>
                      setListingAgeRange(filters.listingAgeMin || 0, value)
                    }
                    variant="hero"
                    testIdPrefix="hero-listing-age"
                  />
                </div>

                {/* Euro Emission */}
                <div className="space-y-3">
                  <Label className="text-base sm:text-lg font-medium text-primary">
                    {t("filters.euroEmission")}
                  </Label>
                  <Select
                    value={filters.euroEmission || "all"}
                    onValueChange={(value) =>
                      setEuroEmission(value === "all" ? "" : value)
                    }
                  >
                    <SelectTrigger
                      className="h-12 sm:h-14 rounded-lg sm:rounded-xl text-black dark:text-white"
                      data-testid="select-hero-euro-emission"
                    >
                      <SelectValue placeholder={t("filters.allEuroNorms")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        value="all"
                        className="text-black dark:text-white"
                      >
                        {t("filters.allEuroNorms")}
                      </SelectItem>
                      <SelectItem
                        value="euro1"
                        className="text-black dark:text-white"
                      >
                        {t("filters.euro1")}
                      </SelectItem>
                      <SelectItem
                        value="euro2"
                        className="text-black dark:text-white"
                      >
                        {t("filters.euro2")}
                      </SelectItem>
                      <SelectItem
                        value="euro3"
                        className="text-black dark:text-white"
                      >
                        {t("filters.euro3")}
                      </SelectItem>
                      <SelectItem
                        value="euro4"
                        className="text-black dark:text-white"
                      >
                        {t("filters.euro4")}
                      </SelectItem>
                      <SelectItem
                        value="euro5"
                        className="text-black dark:text-white"
                      >
                        {t("filters.euro5")}
                      </SelectItem>
                      <SelectItem
                        value="euro6"
                        className="text-black dark:text-white"
                      >
                        {t("filters.euro6")}
                      </SelectItem>
                      <SelectItem
                        value="euro6d"
                        className="text-black dark:text-white"
                      >
                        {t("filters.euro6d")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* STK Validity */}
                <div className="space-y-3">
                  <Label className="text-base sm:text-lg font-medium text-primary">
                    {t("filters.stkValidUntil")}
                  </Label>
                  <MonthPicker
                    value={filters.stkValidUntil || ""}
                    onChange={(value) => setStkValidUntil(value)}
                    data-testid="input-hero-stk-valid"
                  />
                </div>

                {/* Service Book */}
                <div className="flex items-center space-x-3 py-2">
                  <Checkbox
                    id="hero-filter-has-service-book"
                    checked={filters.hasServiceBook || false}
                    onCheckedChange={(checked) => setHasServiceBook(!!checked)}
                    data-testid="checkbox-hero-service-book"
                  />
                  <label
                    htmlFor="hero-filter-has-service-book"
                    className="text-sm sm:text-base font-medium leading-none cursor-pointer text-primary"
                  >
                    {t("filters.hasServiceBook")}
                  </label>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm sm:text-base font-medium text-primary">
                    {t("filters.engineVolume")}
                  </Label>
                  <EngineRangeInput
                    minValue={filters.engineMin || 0}
                    maxValue={filters.engineMax || 6.0}
                    onMinChange={(value) =>
                      setEngineRange(value, filters.engineMax || 6.0)
                    }
                    onMaxChange={(value) =>
                      setEngineRange(filters.engineMin || 0, value)
                    }
                    variant="hero"
                    testIdPrefix="hero-engine"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm sm:text-base font-medium text-primary">
                    {t("filters.power")}
                  </Label>
                  <PowerRangeInput
                    minValue={filters.powerMin || 0}
                    maxValue={filters.powerMax || 1000}
                    onMinChange={(value) =>
                      setPowerRange(value, filters.powerMax || 1000)
                    }
                    onMaxChange={(value) =>
                      setPowerRange(filters.powerMin || 0, value)
                    }
                    variant="hero"
                    testIdPrefix="hero-power"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm sm:text-base font-medium text-primary">
                    {t("filters.doors")}
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      min="2"
                      max="6"
                      placeholder={t("hero.from")}
                      value={filters.doorsMin || ""}
                      onChange={(e) => {
                        const value = e.target.value
                          ? parseInt(e.target.value)
                          : undefined;
                        setDoorsRange(value, filters.doorsMax);
                      }}
                      className="h-10 bg-white/10 border-primary/30 text-black dark:text-white"
                      data-testid="input-hero-doors-min"
                    />
                    <Input
                      type="number"
                      min="2"
                      max="6"
                      placeholder={t("hero.to")}
                      value={filters.doorsMax || ""}
                      onChange={(e) => {
                        const value = e.target.value
                          ? parseInt(e.target.value)
                          : undefined;
                        setDoorsRange(filters.doorsMin, value);
                      }}
                      className="h-10 bg-white/10 border-primary/30 text-black dark:text-white"
                      data-testid="input-hero-doors-max"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm sm:text-base font-medium text-primary">
                    {t("filters.seats")}
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      min="2"
                      max="9"
                      placeholder={t("hero.from")}
                      value={filters.seatsMin || ""}
                      onChange={(e) => {
                        const value = e.target.value
                          ? parseInt(e.target.value)
                          : undefined;
                        setSeatsRange(value, filters.seatsMax);
                      }}
                      className="h-10 bg-white/10 border-primary/30 text-black dark:text-white"
                      data-testid="input-hero-seats-min"
                    />
                    <Input
                      type="number"
                      min="2"
                      max="9"
                      placeholder={t("hero.to")}
                      value={filters.seatsMax || ""}
                      onChange={(e) => {
                        const value = e.target.value
                          ? parseInt(e.target.value)
                          : undefined;
                        setSeatsRange(filters.seatsMin, value);
                      }}
                      className="h-10 bg-white/10 border-primary/30 text-black dark:text-white"
                      data-testid="input-hero-seats-max"
                    />
                  </div>
                </div>

                <div className="col-span-1 sm:col-span-2 lg:col-span-3">
                  <Label className="text-base sm:text-lg font-medium text-primary mb-3 block">
                    {t("filters.extras")}
                  </Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { label: t("filters.serviceBook"), key: "service" },
                      { label: t("filters.notDamaged"), key: "notdamaged" },
                      { label: t("filters.notPainted"), key: "notpainted" },
                      { label: t("filters.warranty"), key: "warranty" },
                      { label: t("filters.exchange"), key: "exchange" },
                    ].map((extra) => (
                      <div
                        key={extra.key}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`extra-${extra.key}`}
                          checked={filters.extras?.includes(extra.key) || false}
                          onCheckedChange={() =>
                            handleCheckboxChange("extras", extra.key)
                          }
                          data-testid={`checkbox-extra-${extra.key}`}
                        />
                        <label
                          htmlFor={`extra-${extra.key}`}
                          className="text-sm sm:text-base font-medium text-black dark:text-white cursor-pointer"
                        >
                          {extra.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 sm:col-span-2 lg:col-span-3">
                  <Label className="text-sm sm:text-base font-medium text-primary">
                    {t("filters.equipment")}
                  </Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { label: t("filters.heatedSeats"), key: "heated-seats" },
                      {
                        label: t("filters.electricWindows"),
                        key: "electric-windows",
                      },
                      {
                        label: t("filters.leatherInterior"),
                        key: "leather-interior",
                      },
                      {
                        label: t("filters.climateControl"),
                        key: "climate-control",
                      },
                      {
                        label: t("filters.cruiseControl"),
                        key: "cruise-control",
                      },
                      {
                        label: t("filters.parkingSensors"),
                        key: "parking-sensors",
                      },
                      { label: t("filters.rearCamera"), key: "rear-camera" },
                      {
                        label: t("filters.navigationSystem"),
                        key: "navigation",
                      },
                      { label: t("filters.bluetooth"), key: "bluetooth" },
                      {
                        label: t("filters.keylessEntry"),
                        key: "keyless-entry",
                      },
                      {
                        label: t("filters.ledHeadlights"),
                        key: "led-headlights",
                      },
                      { label: t("filters.sunroof"), key: "sunroof" },
                      { label: t("filters.alloyWheels"), key: "alloy-wheels" },
                      {
                        label: t("filters.ventilatedSeats"),
                        key: "ventilated-seats",
                      },
                      { label: t("filters.memorySeats"), key: "memory-seats" },
                      {
                        label: t("filters.massageSeats"),
                        key: "massage-seats",
                      },
                      {
                        label: t("filters.adaptiveCruise"),
                        key: "adaptive-cruise",
                      },
                      { label: t("filters.laneKeeping"), key: "lane-keeping" },
                      { label: t("filters.blindSpot"), key: "blind-spot" },
                      { label: t("filters.rainSensor"), key: "rain-sensor" },
                      { label: t("filters.lightSensor"), key: "light-sensor" },
                      {
                        label: t("filters.heatedSteeringWheel"),
                        key: "heated-steering",
                      },
                      {
                        label: t("filters.panoramicRoof"),
                        key: "panoramic-roof",
                      },
                      {
                        label: t("filters.electricSeats"),
                        key: "electric-seats",
                      },
                      {
                        label: t("filters.parkingAssist"),
                        key: "parking-assist",
                      },
                      {
                        label: t("filters.headUpDisplay"),
                        key: "head-up-display",
                      },
                      {
                        label: t("filters.wirelessCharging"),
                        key: "wireless-charging",
                      },
                      { label: t("filters.towHitch"), key: "tow-hitch" },
                    ].map((equipment) => (
                      <div
                        key={equipment.key}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`hero-equipment-${equipment.key}`}
                          checked={
                            filters.equipment?.includes(equipment.key) || false
                          }
                          onCheckedChange={() =>
                            handleCheckboxChange("equipment", equipment.key)
                          }
                          data-testid={`checkbox-hero-equipment-${equipment.key}`}
                        />
                        <label
                          htmlFor={`hero-equipment-${equipment.key}`}
                          className="text-xs sm:text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-black dark:text-white"
                        >
                          {equipment.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <RegionCombobox
                  value={filters.region || ""}
                  onValueChange={setRegion}
                  regions={regions}
                  placeholder={t("filters.allRegions")}
                  emptyMessage={t("hero.noRegionsFound")}
                  testId="select-region"
                  className="h-10 sm:h-11 lg:h-10 rounded-md sm:rounded-lg"
                />
              </div>
            </div>

            {/* <Button
              type="submit"
              className="w-full h-12 sm:h-14 lg:h-14 rounded-md sm:rounded-lg text-base sm:text-lg lg:text-lg font-semibold shadow-lg bg-transparent border-2 border-primary text-primary hover:bg-primary/10 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 backdrop-blur-sm animate-pulse-slow"
              data-testid="button-hero-search"
            >
              <Search className="mr-2 h-5 w-5 sm:h-6 sm:w-6 lg:h-6 lg:w-6" />
              {t("hero.search")}
              {listingsCount > 0 && (
                <span className="ml-2 bg-primary text-primary-foreground rounded-full px-2.5 py-0.5 text-sm font-bold">
                  {listingsCount}
                </span>
              )}
            </Button> */}
            <Button
              type="button"
              onClick={(e) => handleSearch(e as any, true)} // force=true
              className="w-full h-12 sm:h-14 lg:h-14 rounded-md sm:rounded-lg text-base sm:text-lg lg:text-lg font-semibold shadow-lg bg-transparent border-2 border-primary text-primary hover:bg-primary/10 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 backdrop-blur-sm animate-pulse-slow"
              data-testid="button-hero-search"
            >
              <Search className="mr-2 h-5 w-5 sm:h-6 sm:w-6 lg:h-6 lg:w-6" />
              {t("hero.search")}
              {listingsCount > 0 && (
                <span className="ml-2 bg-primary text-primary-foreground rounded-full px-2.5 py-0.5 text-sm font-bold">
                  {listingsCount}
                </span>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default memo(Hero);
