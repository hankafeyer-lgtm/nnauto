// // import { useState, useEffect, memo } from "react";
// // import { Button } from "@/components/ui/button";
// // import { useLanguage } from "@/contexts/LanguageContext";
// // import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
// // import { ScrollArea } from "@/components/ui/scroll-area";
// // import { Label } from "@/components/ui/label";
// // import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// // import { Slider } from "@/components/ui/slider";
// // import { Checkbox } from "@/components/ui/checkbox";
// // import { Input } from "@/components/ui/input";
// // import { MonthPicker } from "@/components/ui/month-picker";
// // import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
// // import { ChevronDown, SlidersHorizontal, X, Sparkles, Car, Package, Wrench, CircleDot, Zap, Bot, Activity, ArrowUp, ArrowDown, Grid3x3, Compass, Key } from "lucide-react";
// // import { carBrands, carModels } from "@shared/carDatabase";
// // import { useTranslation, useLocalizedOptions, vehicleTypeBrands, getModelsForVehicleType } from "@/lib/translations";
// // import newCarIcon from "@assets/3AAF8DD0-3B6D-4DA3-8A1E-2858FCC004A1_1763451350424.png";
// // import partsIcon from "@assets/62A9ABBD-0474-469C-8089-FA93C3E7C2B4_1763450942216.png";
// // import usedCarIcon from "@assets/ABAF6CAB-50AC-450D-8FE8-342C0DF354D6_1763451176037.png";
// // import orderCarIcon from "@assets/A6BE7880-928D-4532-BCB1-3FA4A34F89CE_1763451456108.png";
// // import motorcycleIcon from "@assets/44AD800C-C9BB-4F50-A278-5152E01D60BB_1763444856175.png";
// // import truckGoldIcon from "@assets/8C9B6F5F-55BC-402E-9359-B2707FE2FB81_1763444987490.png";
// // import carGoldIcon from "@assets/D545620E-B7EF-4EB5-AE03-389B4725412B_1763449648396.png";
// // import vanIcon from "@assets/4E8B9722-D061-47D3-9C2F-2C8C1070F01B_1763443339270.png";
// // import { useLocation } from "wouter";
// // import { useFilterParams } from "@/hooks/useFilterParams";
// // import { brandIcons, BrandIconRenderer } from "@/lib/brandIcons";
// // import { bodyTypeIcons } from "@/lib/bodyTypeIcons";
// // import { PriceRangeInput } from "@/components/PriceRangeInput";
// // import { MileageRangeInput } from "@/components/MileageRangeInput";
// // import { YearRangeInput } from "@/components/YearRangeInput";
// // import { OwnersRangeInput } from "@/components/OwnersRangeInput";
// // import { ListingAgeRangeInput } from "@/components/ListingAgeRangeInput";
// // import { EngineRangeInput } from "@/components/EngineRangeInput";
// // import { PowerRangeInput } from "@/components/PowerRangeInput";
// // import { ModelCombobox } from "@/components/ModelCombobox";
// // import { BrandCombobox } from "@/components/BrandCombobox";
// // import { RegionCombobox } from "@/components/RegionCombobox";

// // const NewCarIcon = ({ className }: { className?: string }) => (
// //   <img
// //     src={newCarIcon}
// //     alt="New Car"
// //     className={className}
// //     style={{ objectFit: "contain" }}
// //   />
// // );

// // const PartsIcon = ({ className }: { className?: string }) => (
// //   <img
// //     src={partsIcon}
// //     alt="Parts"
// //     className={className}
// //     style={{ objectFit: "contain" }}
// //   />
// // );

// // const UsedCarIcon = ({ className }: { className?: string }) => (
// //   <img
// //     src={usedCarIcon}
// //     alt="Used Car"
// //     className={className}
// //     style={{ objectFit: "contain" }}
// //   />
// // );

// // const OrderCarIcon = ({ className }: { className?: string }) => (
// //   <img
// //     src={orderCarIcon}
// //     alt="Order Car"
// //     className={className}
// //     style={{ objectFit: "contain" }}
// //   />
// // );

// // const MotorcycleIcon = ({ className }: { className?: string }) => (
// //   <img
// //     src={motorcycleIcon}
// //     alt="Motorcycle"
// //     className={className}
// //     style={{ objectFit: "contain" }}
// //   />
// // );

// // const TruckGoldIcon = ({ className }: { className?: string }) => (
// //   <img
// //     src={truckGoldIcon}
// //     alt="Truck"
// //     className={className}
// //     style={{ objectFit: "contain" }}
// //   />
// // );

// // const CarGoldIcon = ({ className }: { className?: string }) => (
// //   <img
// //     src={carGoldIcon}
// //     alt="Car"
// //     className={className}
// //     style={{ objectFit: "contain" }}
// //   />
// // );

// // const VanGoldIcon = ({ className }: { className?: string }) => (
// //   <img
// //     src={vanIcon}
// //     alt="Van"
// //     className={className}
// //     style={{ objectFit: "contain" }}
// //   />
// // );

// // interface MobileFiltersProps {
// //   variant?: "hero" | "compact";
// // }

// // function MobileFilters({ variant = "compact" }: MobileFiltersProps) {
// //   const t = useTranslation();
// //   const localizedOptions = useLocalizedOptions();
// //   const { language } = useLanguage();
// //   const [, setLocation] = useLocation();
// //   const {
// //     filters,
// //     setFilters,
// //     setCategory,
// //     setBrand,
// //     setModel,
// //     setPriceRange,
// //     setYearRange,
// //     setMileageRange,
// //     setEngineRange,
// //     setPowerRange,
// //     setOwnersRange,
// //     setSellerType,
// //     setListingAgeRange,
// //     setBodyType,
// //     setVehicleType,
// //     setColor,
// //     setRegion,
// //     setDriveType,
// //     setFuel,
// //     setTransmission,
// //     setTrim,
// //     setCondition,
// //     setExtras,
// //     setEquipment,
// //     setDoorsRange,
// //     setSeatsRange,
// //     setEuroEmission,
// //     setStkValidUntil,
// //     setHasServiceBook,
// //     resetFilters,
// //     applyFilters
// //   } = useFilterParams();

// //   const bodyTypes = localizedOptions.getBodyTypes();
// //   const colors = localizedOptions.getColors();
// //   const driveTypes = localizedOptions.getDriveTypes();
// //   const regions = localizedOptions.getRegions();
// //   const [open, setOpen] = useState(false);

// //   const [openSections, setOpenSections] = useState({
// //     vehicleType: true,
// //     basic: true,
// //     price: true,
// //     technical: true,
// //     appearance: true,
// //     condition: true,
// //     equipment: true,
// //     extras: true,
// //     region: true,
// //   });
// //   const [showAllConditions, setShowAllConditions] = useState(false);
// //   const [mileageFilterType, setMileageFilterType] = useState<'50k' | '100k' | '250k' | 'custom' | ''>('');
// //   const [priceFilterType, setPriceFilterType] = useState<'100k' | '300k' | '500k' | '1M' | 'custom' | ''>('');
// //   const [yearFilterType, setYearFilterType] = useState<'3' | '6' | '10' | '20' | 'custom' | ''>('');
// //   const [doorsFilterType, setDoorsFilterType] = useState<'3' | '5' | 'custom' | ''>('');
// //   const [seatsFilterType, setSeatsFilterType] = useState<'5' | '7' | 'custom' | ''>('');

// //   const [priceMinValue, setPriceMinValue] = useState("");
// //   const [priceMaxValue, setPriceMaxValue] = useState("");

// //   const formatNumber = (value: number): string => {
// //     return new Intl.NumberFormat(language === "cs" ? "cs-CZ" : language === "uk" ? "uk-UA" : "en-US").format(value);
// //   };

// //   const parseNumber = (value: string): number => {
// //     const cleaned = value.replace(/\s/g, "").replace(/,/g, "");
// //     return parseInt(cleaned) || 0;
// //   };

// //   useEffect(() => {
// //     const priceMin = filters.priceMin ?? 10000;
// //     const priceMax = filters.priceMax ?? 20000000;

// //     if (priceMin > 10000 || priceMax < 20000000) {
// //       setPriceMinValue(priceMin > 10000 ? formatNumber(priceMin) : "");
// //       setPriceMaxValue(priceMax < 20000000 ? formatNumber(priceMax) : "");
// //     }
// //   }, [filters.priceMin, filters.priceMax, language]);

// //   const toggleSection = (section: string) => {
// //     setOpenSections(prev => ({
// //       ...prev,
// //       [section]: !prev[section as keyof typeof prev]
// //     }));
// //   };

// //   const handleMileagePresetChange = (type: '50k' | '100k' | '250k' | 'custom') => {
// //     if (mileageFilterType === type) {
// //       setMileageFilterType('');
// //       setMileageRange(0, 600000);
// //       return;
// //     }
// //     setMileageFilterType(type);
// //     if (type === '50k') {
// //       setMileageRange(0, 50000);
// //     } else if (type === '100k') {
// //       setMileageRange(0, 100000);
// //     } else if (type === '250k') {
// //       setMileageRange(0, 250000);
// //     }
// //   };

// //   const handlePricePresetChange = (type: '100k' | '300k' | '500k' | '1M' | 'custom') => {
// //     if (priceFilterType === type) {
// //       setPriceFilterType('');
// //       setPriceRange(0, 20000000);
// //       setPriceMinValue("");
// //       setPriceMaxValue("");
// //       return;
// //     }
// //     setPriceFilterType(type);
// //     if (type === '100k') {
// //       setPriceRange(0, 100000);
// //       setPriceMinValue("");
// //       setPriceMaxValue(formatNumber(100000));
// //     } else if (type === '300k') {
// //       setPriceRange(0, 300000);
// //       setPriceMinValue("");
// //       setPriceMaxValue(formatNumber(300000));
// //     } else if (type === '500k') {
// //       setPriceRange(0, 500000);
// //       setPriceMinValue("");
// //       setPriceMaxValue(formatNumber(500000));
// //     } else if (type === '1M') {
// //       setPriceRange(0, 1000000);
// //       setPriceMinValue("");
// //       setPriceMaxValue(formatNumber(1000000));
// //     }
// //   };

// //   const handlePriceMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
// //     setPriceMinValue(e.target.value);
// //   };

// //   const handlePriceMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
// //     setPriceMaxValue(e.target.value);
// //   };

// //   const handlePriceMinBlur = () => {
// //     const parsed = parseNumber(priceMinValue);
// //     const priceMax = filters.priceMax ?? 20000000;
// //     const clamped = Math.max(10000, Math.min(parsed, priceMax));
// //     setPriceMinValue(formatNumber(clamped));
// //     setPriceRange(clamped, priceMax);
// //   };

// //   const handlePriceMaxBlur = () => {
// //     const parsed = parseNumber(priceMaxValue);
// //     const priceMin = filters.priceMin ?? 10000;
// //     const clamped = Math.max(priceMin, Math.min(parsed, 20000000));
// //     setPriceMaxValue(formatNumber(clamped));
// //     setPriceRange(priceMin, clamped);
// //   };

// //   const handleDoorsPresetChange = (type: '3' | '5' | 'custom') => {
// //     if (doorsFilterType === type) {
// //       setDoorsFilterType('');
// //       setDoorsRange(2, 6);
// //       return;
// //     }
// //     setDoorsFilterType(type);
// //     if (type === '3') {
// //       setDoorsRange(3, 3);
// //     } else if (type === '5') {
// //       setDoorsRange(5, 5);
// //     }
// //   };

// //   const handleSeatsPresetChange = (type: '5' | '7' | 'custom') => {
// //     if (seatsFilterType === type) {
// //       setSeatsFilterType('');
// //       setSeatsRange(2, 9);
// //       return;
// //     }
// //     setSeatsFilterType(type);
// //     if (type === '5') {
// //       setSeatsRange(5, 5);
// //     } else if (type === '7') {
// //       setSeatsRange(7, 7);
// //     }
// //   };

// //   const handleYearPresetChange = (type: '3' | '6' | '10' | '20' | 'custom') => {
// //     if (yearFilterType === type) {
// //       setYearFilterType('');
// //       setYearRange(1990, 2026);
// //       return;
// //     }
// //     setYearFilterType(type);
// //     const currentYear = 2026;
// //     if (type === '3') {
// //       setYearRange(currentYear - 3, currentYear);
// //     } else if (type === '6') {
// //       setYearRange(currentYear - 6, currentYear);
// //     } else if (type === '10') {
// //       setYearRange(currentYear - 10, currentYear);
// //     } else if (type === '20') {
// //       setYearRange(currentYear - 20, currentYear);
// //     }
// //   };

// //   const handleReset = () => {
// //     resetFilters();
// //     setMileageFilterType('');
// //     setPriceFilterType('');
// //     setYearFilterType('');
// //     setDoorsFilterType('');
// //     setSeatsFilterType('');
// //   };

// //   const handleApply = () => {
// //     applyFilters();
// //     setOpen(false);
// //   };

// //   const handleFuelChange = (value: string) => {
// //     const currentValues = filters.fuel ? filters.fuel.split(',') : [];
// //     const newValues = currentValues.includes(value)
// //       ? currentValues.filter(v => v !== value)
// //       : [...currentValues, value];
// //     setFuel(newValues.join(','));
// //   };

// //   const handleTransmissionChange = (value: string) => {
// //     const currentValues = filters.transmission ? filters.transmission.split(',') : [];
// //     const newValues = currentValues.includes(value)
// //       ? currentValues.filter(v => v !== value)
// //       : [...currentValues, value];
// //     setTransmission(newValues.join(','));
// //   };

// //   const handleDriveTypeChange = (value: string) => {
// //     const currentValues = filters.driveType ? filters.driveType.split(',') : [];
// //     const newValues = currentValues.includes(value)
// //       ? currentValues.filter(v => v !== value)
// //       : [...currentValues, value];
// //     setDriveType(newValues.join(','));
// //   };

// //   const handleConditionChange = (value: string) => {
// //     const currentValues = filters.condition || [];
// //     const newValues = currentValues.includes(value)
// //       ? currentValues.filter(v => v !== value)
// //       : [...currentValues, value];
// //     setCondition(newValues);
// //   };

// //   const handleEquipmentChange = (value: string) => {
// //     const currentValues = filters.equipment || [];
// //     const newValues = currentValues.includes(value)
// //       ? currentValues.filter(v => v !== value)
// //       : [...currentValues, value];
// //     setEquipment(newValues);
// //   };

// //   const handleExtrasChange = (value: string) => {
// //     const currentValues = filters.extras || [];
// //     const newValues = currentValues.includes(value)
// //       ? currentValues.filter(v => v !== value)
// //       : [...currentValues, value];
// //     setExtras(newValues);
// //   };

// //   const availableModels = filters.brand ? getModelsForVehicleType(filters.brand, filters.vehicleType) : [];

// //   const priceMin = filters.priceMin ?? 10000;
// //   const priceMax = filters.priceMax ?? 20000000;
// //   const yearMin = filters.yearMin ?? 1980;
// //   const yearMax = filters.yearMax ?? 2026;
// //   const mileageMin = filters.mileageMin ?? 0;
// //   const mileageMax = filters.mileageMax ?? 600000;
// //   const engineMin = filters.engineMin ?? 0;
// //   const engineMax = filters.engineMax ?? 6.0;
// //   const powerMin = filters.powerMin ?? 0;
// //   const powerMax = filters.powerMax ?? 1000;
// //   const ownersMin = filters.ownersMin ?? 1;
// //   const ownersMax = filters.ownersMax ?? 4;
// //   const doorsMin = filters.doorsMin ?? 2;
// //   const doorsMax = filters.doorsMax ?? 6;
// //   const seatsMin = filters.seatsMin ?? 2;
// //   const seatsMax = filters.seatsMax ?? 8;

// //   const isHero = variant === "hero";

// //   return (
// //     <>
// //       <Button
// //         variant="outline"
// //         className={`lg:hidden gap-2 shadow-sm ${
// //           isHero
// //             ? "w-full h-12 sm:h-14 rounded-lg sm:rounded-xl text-base sm:text-lg"
// //             : "h-12 rounded-xl"
// //         }`}
// //         onClick={() => setOpen(true)}
// //         data-testid="button-open-mobile-filters"
// //       >
// //         <SlidersHorizontal className="h-5 w-5" />
// //         <span>{isHero ? t("hero.moreFilters") : t("filters.title")}</span>
// //       </Button>

// //       <Drawer open={open} onOpenChange={setOpen}>
// //         <DrawerContent className="max-h-[90vh]">
// //           <DrawerHeader className="border-b pb-4">
// //             <div className="flex items-center justify-between">
// //               <DrawerTitle className="text-xl font-semibold">{t("filters.title")}</DrawerTitle>
// //               <div className="flex items-center gap-2">
// //                 <Button variant="ghost" size="sm" onClick={handleReset} data-testid="button-reset-mobile-filters">
// //                   {t("filters.reset")}
// //                 </Button>
// //                 <DrawerClose asChild>
// //                   <Button variant="ghost" size="icon" data-testid="button-close-mobile-filters">
// //                     <X className="h-5 w-5" />
// //                   </Button>
// //                 </DrawerClose>
// //               </div>
// //             </div>
// //             <DrawerDescription className="sr-only">
// //               {t("filters.title")}
// //             </DrawerDescription>
// //           </DrawerHeader>

// //           <ScrollArea className="flex-1 overflow-y-auto">
// //             <div className="space-y-6 p-4">
// //               <Collapsible open={openSections.condition} onOpenChange={() => toggleSection('condition')}>
// //                 <CollapsibleTrigger className="flex items-center justify-between w-full py-2 hover-elevate rounded-xl px-3">
// //                   <h3 className="text-lg font-semibold">{t("filters.conditionAndOwners")}</h3>
// //                   <ChevronDown className={`h-5 w-5 transition-transform ${openSections.condition ? 'rotate-180' : ''}`} />
// //                 </CollapsibleTrigger>
// //                 <CollapsibleContent className="space-y-6 pt-4">
// //                   <div className="space-y-4">
// //                     <div className="grid grid-cols-2 gap-3">
// //                       {[
// //                         { label: t("filters.conditionNew"), key: "Nové", icon: Sparkles, customIcon: NewCarIcon },
// //                         { label: t("filters.conditionUsed"), key: "Ojeté", icon: Car, customIcon: UsedCarIcon },
// //                         { label: t("filters.conditionOrder"), key: "Na objednávku", icon: Package, customIcon: OrderCarIcon },
// //                         { label: t("filters.conditionParts"), key: "Na náhradní díly", icon: Wrench, customIcon: PartsIcon },
// //                         ...(showAllConditions ? [
// //                           { label: t("filters.conditionRental"), key: "Pronájem", icon: Key, customIcon: null },
// //                           { label: t("filters.conditionDamaged"), key: "Havarované", icon: Wrench, customIcon: null },
// //                           { label: t("filters.conditionHistoric"), key: "Historické", icon: Sparkles, customIcon: null }
// //                         ] : [])
// //                       ].map((condition) => {
// //                         const isSelected = filters.condition?.includes(condition.key) || false;
// //                         const Icon = condition.icon;
// //                         const CustomIcon = condition.customIcon;
// //                         return (
// //                           <Button
// //                             key={condition.key}
// //                             type="button"
// //                             variant={isSelected ? "default" : "outline"}
// //                             className={`h-auto py-3 px-4 flex flex-col items-center gap-2 text-center ${isSelected ? 'toggle-elevated' : ''} toggle-elevate`}
// //                             onClick={() => handleConditionChange(condition.key)}
// //                             data-testid={`button-mobile-condition-${condition.key.toLowerCase().replace(/\s+/g, '-')}`}
// //                           >
// //                             {CustomIcon ? (
// //                               <CustomIcon className="h-10 w-10" />
// //                             ) : (
// //                               <Icon className="h-7 w-7 text-[#B8860B]" />
// //                             )}
// //                             <span className="text-xs font-medium leading-tight text-black dark:text-white">{condition.label}</span>
// //                           </Button>
// //                         );
// //                       })}
// //                       <Button
// //                         type="button"
// //                         variant="ghost"
// //                         className="col-span-2 h-auto py-2 flex items-center justify-center gap-2"
// //                         onClick={() => setShowAllConditions(!showAllConditions)}
// //                         data-testid="button-mobile-toggle-conditions"
// //                       >
// //                         <span className="text-sm font-medium text-[#B8860B]">
// //                           {showAllConditions ? t("filters.showLess") : t("filters.showMore")}
// //                         </span>
// //                         <ChevronDown className={`h-4 w-4 text-[#B8860B] transition-transform ${showAllConditions ? 'rotate-180' : ''}`} />
// //                       </Button>
// //                     </div>
// //                   </div>
// //                 </CollapsibleContent>
// //               </Collapsible>

// //               <Collapsible open={openSections.vehicleType} onOpenChange={() => toggleSection('vehicleType')}>
// //                 <CollapsibleTrigger className="flex items-center justify-between w-full py-2 hover-elevate rounded-xl px-3">
// //                   <h3 className="text-lg font-semibold">{t("listing.vehicleType")} / {t("filters.bodyType")}</h3>
// //                   <ChevronDown className={`h-5 w-5 transition-transform ${openSections.vehicleType ? 'rotate-180' : ''}`} />
// //                 </CollapsibleTrigger>
// //                 <CollapsibleContent className="space-y-6 pt-4">
// //                   <div className="space-y-4">
// //                     <div className="grid grid-cols-3 gap-2">
// //                       <button
// //                         type="button"
// //                         onClick={() => {
// //                           const currentTypes = filters.vehicleType ? filters.vehicleType.split(',').filter(Boolean) : [];
// //                           const isSelected = currentTypes.includes("osobni-auta");
// //                           const newTypes = isSelected
// //                             ? currentTypes.filter(t => t !== "osobni-auta")
// //                             : [...currentTypes, "osobni-auta"];
// //                           setFilters(prev => ({ ...prev, vehicleType: newTypes.join(',') || "", bodyType: undefined }));
// //                         }}
// //                         className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg border-2 transition-colors hover-elevate active-elevate-2 ${
// //                           filters.vehicleType?.split(',').includes("osobni-auta")
// //                             ? "bg-primary text-primary-foreground border-primary-border"
// //                             : "bg-background border-input text-black dark:text-white"
// //                         }`}
// //                         data-testid="button-mobile-vehicle-cars"
// //                       >
// //                         <CarGoldIcon className="w-8 h-8" />
// //                         <span className={`text-xs text-center leading-tight ${!filters.vehicleType?.split(',').includes("osobni-auta") ? 'text-black dark:text-white' : ''}`}>{t("hero.cars")}</span>
// //                       </button>
// //                       <button
// //                         type="button"
// //                         onClick={() => {
// //                           const currentTypes = filters.vehicleType ? filters.vehicleType.split(',').filter(Boolean) : [];
// //                           const isSelected = currentTypes.includes("dodavky");
// //                           const newTypes = isSelected
// //                             ? currentTypes.filter(t => t !== "dodavky")
// //                             : [...currentTypes, "dodavky"];
// //                           setFilters(prev => ({ ...prev, vehicleType: newTypes.join(',') || "", bodyType: undefined }));
// //                         }}
// //                         className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg border-2 transition-colors hover-elevate active-elevate-2 ${
// //                           filters.vehicleType?.split(',').includes("dodavky")
// //                             ? "bg-primary text-primary-foreground border-primary-border"
// //                             : "bg-background border-input text-black dark:text-white"
// //                         }`}
// //                         data-testid="button-mobile-vehicle-dodavky"
// //                       >
// //                         <VanGoldIcon className="w-8 h-8" />
// //                         <span className={`text-xs text-center leading-tight ${!filters.vehicleType?.split(',').includes("dodavky") ? 'text-black dark:text-white' : ''}`}>{t("hero.dodavky")}</span>
// //                       </button>
// //                       <button
// //                         type="button"
// //                         onClick={() => {
// //                           const currentTypes = filters.vehicleType ? filters.vehicleType.split(',').filter(Boolean) : [];
// //                           const isSelected = currentTypes.includes("nakladni-vozy");
// //                           const newTypes = isSelected
// //                             ? currentTypes.filter(t => t !== "nakladni-vozy")
// //                             : [...currentTypes, "nakladni-vozy"];
// //                           setFilters(prev => ({ ...prev, vehicleType: newTypes.join(',') || "", bodyType: undefined }));
// //                         }}
// //                         className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg border-2 transition-colors hover-elevate active-elevate-2 ${
// //                           filters.vehicleType?.split(',').includes("nakladni-vozy")
// //                             ? "bg-primary text-primary-foreground border-primary-border"
// //                             : "bg-background border-input text-black dark:text-white"
// //                         }`}
// //                         data-testid="button-mobile-vehicle-trucks"
// //                       >
// //                         <TruckGoldIcon className="w-8 h-8" />
// //                         <span className={`text-xs text-center leading-tight ${!filters.vehicleType?.split(',').includes("nakladni-vozy") ? 'text-black dark:text-white' : ''}`}>{t("hero.trucks")}</span>
// //                       </button>
// //                       <button
// //                         type="button"
// //                         onClick={() => {
// //                           const currentTypes = filters.vehicleType ? filters.vehicleType.split(',').filter(Boolean) : [];
// //                           const isSelected = currentTypes.includes("motorky");
// //                           const newTypes = isSelected
// //                             ? currentTypes.filter(t => t !== "motorky")
// //                             : [...currentTypes, "motorky"];
// //                           setFilters(prev => ({ ...prev, vehicleType: newTypes.join(',') || "", bodyType: undefined }));
// //                         }}
// //                         className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg border-2 transition-colors hover-elevate active-elevate-2 ${
// //                           filters.vehicleType?.split(',').includes("motorky")
// //                             ? "bg-primary text-primary-foreground border-primary-border"
// //                             : "bg-background border-input text-black dark:text-white"
// //                         }`}
// //                         data-testid="button-mobile-vehicle-motorky"
// //                       >
// //                         <MotorcycleIcon className="w-8 h-8" />
// //                         <span className={`text-xs text-center leading-tight ${!filters.vehicleType?.split(',').includes("motorky") ? 'text-black dark:text-white' : ''}`}>{t("hero.motorky")}</span>
// //                       </button>
// //                       {bodyTypes.map((type) => {
// //                         const IconComponent = bodyTypeIcons[type.value] || Car;
// //                         const isSelected = filters.bodyType?.includes(type.value) || false;
// //                         return (
// //                           <button
// //                             key={type.value}
// //                             type="button"
// //                             onClick={() => {
// //                               setFilters(prev => {
// //                                 const current = prev.bodyType || [];
// //                                 const alreadySelected = current.includes(type.value);
// //                                 const newBodyType = alreadySelected
// //                                   ? current.filter(v => v !== type.value)
// //                                   : [...current, type.value];
// //                                 return {
// //                                   ...prev,
// //                                   vehicleType: newBodyType.length > 0 ? "osobni-auta" : prev.vehicleType,
// //                                   bodyType: newBodyType.length > 0 ? newBodyType : undefined
// //                                 };
// //                               });
// //                             }}
// //                             className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg border-2 transition-colors hover-elevate active-elevate-2 ${
// //                               isSelected
// //                                 ? "bg-primary text-primary-foreground border-primary-border"
// //                                 : "bg-background border-input text-black dark:text-white"
// //                             }`}
// //                             data-testid={`button-mobile-body-type-${type.value}`}
// //                           >
// //                             <IconComponent className="w-8 h-8" />
// //                             <span className={`text-xs text-center leading-tight ${!isSelected ? 'text-black dark:text-white' : ''}`}>{type.label}</span>
// //                           </button>
// //                         );
// //                       })}
// //                     </div>
// //                   </div>
// //                 </CollapsibleContent>
// //               </Collapsible>

// //               <Collapsible open={openSections.basic} onOpenChange={() => toggleSection('basic')}>
// //                 <CollapsibleTrigger className="flex items-center justify-between w-full py-2 hover-elevate rounded-xl px-3">
// //                   <h3 className="text-lg font-semibold">{t("filters.basicFilters")}</h3>
// //                   <ChevronDown className={`h-5 w-5 transition-transform ${openSections.basic ? 'rotate-180' : ''}`} />
// //                 </CollapsibleTrigger>
// //                 <CollapsibleContent className="space-y-6 pt-4">
// //                   <div className="space-y-4">
// //                     <Label className="text-base font-medium">{t("filters.brand")}</Label>
// //                     <BrandCombobox
// //                       brands={carBrands
// //                         .filter(brand => {
// //                           if (filters.vehicleType && vehicleTypeBrands[filters.vehicleType]) {
// //                             return vehicleTypeBrands[filters.vehicleType].includes(brand.value);
// //                           }
// //                           return true;
// //                         })
// //                         .map(brand => ({
// //                           ...brand,
// //                           icon: brandIcons[brand.value]
// //                         }))}
// //                       value={filters.brand || ""}
// //                       onValueChange={setBrand}
// //                       placeholder={t("hero.allBrands")}
// //                       emptyMessage={t("hero.noBrandsFound")}
// //                       testId="select-mobile-filter-brand"
// //                     />
// //                   </div>

// //                   <div className="space-y-4">
// //                     <Label className="text-base font-medium">{t("filters.model")}</Label>
// //                     <ModelCombobox
// //                       models={availableModels}
// //                       value={filters.model || ""}
// //                       onValueChange={setModel}
// //                       disabled={!filters.brand}
// //                       placeholder={filters.brand ? t("hero.allModels") : t("hero.selectBrand")}
// //                       emptyMessage={t("hero.noModelsFound")}
// //                       testId="select-mobile-filter-model"
// //                     />
// //                   </div>
// //                 </CollapsibleContent>
// //               </Collapsible>

// //               <Collapsible open={openSections.price} onOpenChange={() => toggleSection('price')}>
// //                 <CollapsibleTrigger className="flex items-center justify-between w-full py-2 hover-elevate rounded-xl px-3">
// //                   <h3 className="text-lg font-semibold">{t("filters.priceAndYear")}</h3>
// //                   <ChevronDown className={`h-5 w-5 transition-transform ${openSections.price ? 'rotate-180' : ''}`} />
// //                 </CollapsibleTrigger>
// //                 <CollapsibleContent className="space-y-6 pt-4">
// //                   <div className="space-y-4">
// //                     <Label className="text-base font-medium">{t("filters.price")}</Label>
// //                     <PriceRangeInput
// //                       minValue={filters.priceMin}
// //                       maxValue={filters.priceMax}
// //                       onMinChange={(value) => setPriceRange(value || 10000, filters.priceMax || 20000000)}
// //                       onMaxChange={(value) => setPriceRange(filters.priceMin || 10000, value || 20000000)}
// //                       variant="mobile"
// //                       testIdPrefix="mobile-price"
// //                     />
// //                     <div className="flex items-center space-x-2 pt-2">
// //                       <Checkbox
// //                         id="mobile-vat-deductible"
// //                         checked={filters.vatDeductible || false}
// //                         onCheckedChange={(checked) => setFilters(prev => ({ ...prev, vatDeductible: checked === true ? true : undefined }))}
// //                         data-testid="checkbox-mobile-vat-deductible"
// //                       />
// //                       <label
// //                         htmlFor="mobile-vat-deductible"
// //                         className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-black dark:text-white"
// //                       >
// //                         {t("filters.vatDeductible")}
// //                       </label>
// //                     </div>
// //                   </div>

// //                   <div className="space-y-4">
// //                     <Label className="text-base font-medium">{t("filters.mileage")}</Label>
// //                     <MileageRangeInput
// //                       minValue={mileageMin}
// //                       maxValue={mileageMax}
// //                       onMinChange={(value) => setMileageRange(value, mileageMax)}
// //                       onMaxChange={(value) => setMileageRange(mileageMin, value)}
// //                       variant="mobile"
// //                       testIdPrefix="mobile-mileage"
// //                     />
// //                   </div>

// //                   <div className="space-y-4">
// //                     <Label className="text-base font-medium">{t("filters.yearOfManufacture")}</Label>
// //                     <YearRangeInput
// //                       minValue={yearMin}
// //                       maxValue={yearMax}
// //                       onMinChange={(value) => setYearRange(value, yearMax)}
// //                       onMaxChange={(value) => setYearRange(yearMin, value)}
// //                       variant="mobile"
// //                       testIdPrefix="mobile-year"
// //                     />
// //                   </div>
// //                 </CollapsibleContent>
// //               </Collapsible>

// //               <Collapsible open={openSections.technical} onOpenChange={() => toggleSection('technical')}>
// //                 <CollapsibleTrigger className="flex items-center justify-between w-full py-2 hover-elevate rounded-xl px-3">
// //                   <h3 className="text-lg font-semibold">{t("filters.technicalParams")}</h3>
// //                   <ChevronDown className={`h-5 w-5 transition-transform ${openSections.technical ? 'rotate-180' : ''}`} />
// //                 </CollapsibleTrigger>
// //                 <CollapsibleContent className="space-y-6 pt-4">
// //                   <div className="space-y-4">
// //                     <Label className="text-base font-medium">{t("filters.engineVolume")}</Label>
// //                     <EngineRangeInput
// //                       minValue={engineMin}
// //                       maxValue={engineMax}
// //                       onMinChange={(value) => setEngineRange(value, engineMax)}
// //                       onMaxChange={(value) => setEngineRange(engineMin, value)}
// //                       variant="mobile"
// //                       testIdPrefix="mobile-engine"
// //                     />
// //                   </div>

// //                   <div className="space-y-4">
// //                     <Label className="text-base font-medium">{t("filters.power")}</Label>
// //                     <PowerRangeInput
// //                       minValue={powerMin}
// //                       maxValue={powerMax}
// //                       onMinChange={(value) => setPowerRange(value, powerMax)}
// //                       onMaxChange={(value) => setPowerRange(powerMin, value)}
// //                       variant="mobile"
// //                       testIdPrefix="mobile-power"
// //                     />
// //                   </div>

// //                   <div className="space-y-4">
// //                     <Label className="text-base font-medium">{t("filters.fuelType")}</Label>
// //                     <div className="space-y-3">
// //                       {[
// //                         { label: t("hero.benzin"), key: "benzin" },
// //                         { label: t("hero.diesel"), key: "diesel" },
// //                         { label: t("hero.hybrid"), key: "hybrid" },
// //                         { label: t("hero.electric"), key: "electric" },
// //                         { label: t("hero.lpg"), key: "lpg" },
// //                         { label: t("hero.cng"), key: "cng" }
// //                       ].map((fuel) => (
// //                         <div key={fuel.key} className="flex items-center space-x-2">
// //                           <Checkbox
// //                             id={`mobile-fuel-${fuel.key}`}
// //                             checked={filters.fuel?.split(',').includes(fuel.key) || false}
// //                             onCheckedChange={() => handleFuelChange(fuel.key)}
// //                             data-testid={`checkbox-mobile-fuel-${fuel.key.toLowerCase()}`}
// //                           />
// //                           <label
// //                             htmlFor={`mobile-fuel-${fuel.key}`}
// //                             className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-black dark:text-white"
// //                           >
// //                             {fuel.label}
// //                           </label>
// //                         </div>
// //                       ))}
// //                     </div>
// //                   </div>

// //                   <div className="space-y-4">
// //                     <Label className="text-base font-medium">{t("filters.transmission")}</Label>
// //                     <div className="space-y-3">
// //                       {[
// //                         { label: t("filters.manual"), key: "manual", icon: CircleDot },
// //                         { label: t("filters.automatic"), key: "automatic", icon: Zap },
// //                         { label: t("filters.robot"), key: "robot", icon: Bot },
// //                         { label: t("filters.cvt"), key: "cvt", icon: Activity }
// //                       ].map((trans) => {
// //                         const Icon = trans.icon;
// //                         return (
// //                           <div key={trans.key} className="flex items-center space-x-2">
// //                             <Checkbox
// //                               id={`mobile-trans-${trans.key}`}
// //                               checked={filters.transmission?.split(',').includes(trans.key) || false}
// //                               onCheckedChange={() => handleTransmissionChange(trans.key)}
// //                               data-testid={`checkbox-mobile-transmission-${trans.key.toLowerCase()}`}
// //                             />
// //                             <label
// //                               htmlFor={`mobile-trans-${trans.key}`}
// //                               className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-black dark:text-white flex items-center gap-2"
// //                             >
// //                               <Icon className="w-4 h-4 text-[#B8860B]" />
// //                               <span>{trans.label}</span>
// //                             </label>
// //                           </div>
// //                         );
// //                       })}
// //                     </div>
// //                   </div>

// //                   <div className="space-y-4">
// //                     <Label className="text-base font-medium">{t("filters.driveType")}</Label>
// //                     <div className="space-y-3">
// //                       {driveTypes.map((drive) => {
// //                         const driveTypeIcons: Record<string, any> = {
// //                           fwd: ArrowUp,
// //                           rwd: ArrowDown,
// //                           awd: Grid3x3,
// //                           "4wd": Compass,
// //                         };
// //                         const Icon = driveTypeIcons[drive.value];
// //                         return (
// //                           <div key={drive.value} className="flex items-center space-x-2">
// //                             <Checkbox
// //                               id={`mobile-drive-${drive.value}`}
// //                               checked={filters.driveType?.split(',').includes(drive.value) || false}
// //                               onCheckedChange={() => handleDriveTypeChange(drive.value)}
// //                               data-testid={`checkbox-mobile-drive-${drive.value}`}
// //                             />
// //                             <label
// //                               htmlFor={`mobile-drive-${drive.value}`}
// //                               className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-black dark:text-white flex items-center gap-2"
// //                             >
// //                               {Icon && <Icon className="w-4 h-4 text-[#B8860B]" />}
// //                               <span>{drive.label}</span>
// //                             </label>
// //                           </div>
// //                         );
// //                       })}
// //                     </div>
// //                   </div>

// //                   <div className="space-y-4">
// //                     <Label className="text-base font-medium">{t("filters.owners")}</Label>
// //                     <OwnersRangeInput
// //                       minValue={ownersMin}
// //                       maxValue={ownersMax}
// //                       onMinChange={(value) => setOwnersRange(value, ownersMax)}
// //                       onMaxChange={(value) => setOwnersRange(ownersMin, value)}
// //                       variant="mobile"
// //                       testIdPrefix="mobile-owners"
// //                     />
// //                   </div>

// //                   <div className="space-y-4">
// //                     <Label className="text-base font-medium">{t("filters.sellerType")}</Label>
// //                     <div className="grid grid-cols-2 gap-2">
// //                       {[
// //                         { key: 'private' as const, label: t("filters.sellerPrivate") },
// //                         { key: 'dealer' as const, label: t("filters.sellerDealer") }
// //                       ].map((option) => {
// //                         const isSelected = filters.sellerType === option.key;
// //                         return (
// //                           <Button
// //                             key={option.key}
// //                             type="button"
// //                             variant={isSelected ? "default" : "outline"}
// //                             className={`h-auto py-2 px-3 text-xs ${!isSelected ? 'text-black dark:text-white' : ''} ${isSelected ? 'toggle-elevated' : ''} toggle-elevate`}
// //                             onClick={() => setSellerType(isSelected ? '' : option.key)}
// //                             data-testid={`button-mobile-seller-${option.key}`}
// //                           >
// //                             {option.label}
// //                           </Button>
// //                         );
// //                       })}
// //                     </div>
// //                   </div>

// //                   <div className="space-y-4">
// //                     <Label className="text-base font-medium">{t("filters.listingAge")}</Label>
// //                     <ListingAgeRangeInput
// //                       minValue={filters.listingAgeMin || 0}
// //                       maxValue={filters.listingAgeMax || 365}
// //                       onMinChange={(value) => setListingAgeRange(value, filters.listingAgeMax || 365)}
// //                       onMaxChange={(value) => setListingAgeRange(filters.listingAgeMin || 0, value)}
// //                       variant="mobile"
// //                       testIdPrefix="mobile-listing-age"
// //                     />
// //                   </div>

// //                   {/* Euro Emission */}
// //                   <div className="space-y-4">
// //                     <Label className="text-base font-medium">{t("filters.euroEmission")}</Label>
// //                     <Select value={filters.euroEmission || "all"} onValueChange={(value) => setEuroEmission(value === "all" ? "" : value)}>
// //                       <SelectTrigger className="h-12 rounded-xl text-black dark:text-white" data-testid="select-mobile-filter-euro-emission">
// //                         <SelectValue placeholder={t("filters.allEuroNorms")} />
// //                       </SelectTrigger>
// //                       <SelectContent>
// //                         <SelectItem value="all" className="text-black dark:text-white">{t("filters.allEuroNorms")}</SelectItem>
// //                         <SelectItem value="euro1" className="text-black dark:text-white">{t("filters.euro1")}</SelectItem>
// //                         <SelectItem value="euro2" className="text-black dark:text-white">{t("filters.euro2")}</SelectItem>
// //                         <SelectItem value="euro3" className="text-black dark:text-white">{t("filters.euro3")}</SelectItem>
// //                         <SelectItem value="euro4" className="text-black dark:text-white">{t("filters.euro4")}</SelectItem>
// //                         <SelectItem value="euro5" className="text-black dark:text-white">{t("filters.euro5")}</SelectItem>
// //                         <SelectItem value="euro6" className="text-black dark:text-white">{t("filters.euro6")}</SelectItem>
// //                         <SelectItem value="euro6d" className="text-black dark:text-white">{t("filters.euro6d")}</SelectItem>
// //                       </SelectContent>
// //                     </Select>
// //                   </div>

// //                   {/* STK Validity */}
// //                   <div className="space-y-4">
// //                     <Label className="text-base font-medium">{t("filters.stkValidUntil")}</Label>
// //                     <MonthPicker
// //                       value={filters.stkValidUntil || ""}
// //                       onChange={(value) => setStkValidUntil(value)}
// //                       data-testid="input-mobile-stk-valid"
// //                     />
// //                   </div>

// //                   {/* Service Book */}
// //                   <div className="flex items-center space-x-2 py-2">
// //                     <Checkbox
// //                       id="mobile-filter-has-service-book"
// //                       checked={filters.hasServiceBook || false}
// //                       onCheckedChange={(checked) => setHasServiceBook(!!checked)}
// //                       data-testid="checkbox-mobile-filter-service-book"
// //                     />
// //                     <label
// //                       htmlFor="mobile-filter-has-service-book"
// //                       className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-black dark:text-white"
// //                     >
// //                       {t("filters.hasServiceBook")}
// //                     </label>
// //                   </div>
// //                 </CollapsibleContent>
// //               </Collapsible>

// //               <Collapsible open={openSections.appearance} onOpenChange={() => toggleSection('appearance')}>
// //                 <CollapsibleTrigger className="flex items-center justify-between w-full py-2 hover-elevate rounded-xl px-3">
// //                   <h3 className="text-lg font-semibold">{t("filters.appearance")}</h3>
// //                   <ChevronDown className={`h-5 w-5 transition-transform ${openSections.appearance ? 'rotate-180' : ''}`} />
// //                 </CollapsibleTrigger>
// //                 <CollapsibleContent className="space-y-6 pt-4">
// //                   <div className="space-y-4">
// //                     <Label className="text-base font-medium">{t("filters.color")}</Label>
// //                     <Select value={filters.color || "all"} onValueChange={(value) => setColor(value === "all" ? "" : value)}>
// //                       <SelectTrigger className="h-12 rounded-xl text-black dark:text-white" data-testid="select-mobile-filter-color">
// //                         <SelectValue placeholder={t("filters.allColors")} />
// //                       </SelectTrigger>
// //                       <SelectContent>
// //                         <SelectItem value="all">{t("filters.allColors")}</SelectItem>
// //                         {colors.map((color) => (
// //                           <SelectItem key={color.value} value={color.value} className="text-black dark:text-white">
// //                             <div className="flex items-center gap-2">
// //                               <div
// //                                 className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600 flex-shrink-0"
// //                                 style={{
// //                                   backgroundColor: color.hex,
// //                                   boxShadow: color.value === 'white' || color.value === 'ivory' ? 'inset 0 0 0 1px rgba(0,0,0,0.1)' : 'none'
// //                                 }}
// //                               />
// //                               <span>{color.label}</span>
// //                             </div>
// //                           </SelectItem>
// //                         ))}
// //                       </SelectContent>
// //                     </Select>
// //                   </div>

// //                   <div className="space-y-4">
// //                     <Label className="text-base font-medium">{t("filters.doors")}</Label>
// //                     <div className="grid grid-cols-2 gap-2">
// //                       <Input
// //                         type="number"
// //                         min="2"
// //                         max="6"
// //                         placeholder={t("hero.from")}
// //                         value={filters.doorsMin || ""}
// //                         onChange={(e) => {
// //                           const value = e.target.value ? parseInt(e.target.value) : undefined;
// //                           setDoorsRange(value, filters.doorsMax);
// //                         }}
// //                         className="h-10 text-black dark:text-white"
// //                         data-testid="input-mobile-doors-min"
// //                       />
// //                       <Input
// //                         type="number"
// //                         min="2"
// //                         max="6"
// //                         placeholder={t("hero.to")}
// //                         value={filters.doorsMax || ""}
// //                         onChange={(e) => {
// //                           const value = e.target.value ? parseInt(e.target.value) : undefined;
// //                           setDoorsRange(filters.doorsMin, value);
// //                         }}
// //                         className="h-10 text-black dark:text-white"
// //                         data-testid="input-mobile-doors-max"
// //                       />
// //                     </div>
// //                   </div>

// //                   <div className="space-y-4">
// //                     <Label className="text-base font-medium">{t("filters.seats")}</Label>
// //                     <div className="grid grid-cols-2 gap-2">
// //                       <Input
// //                         type="number"
// //                         min="2"
// //                         max="9"
// //                         placeholder={t("hero.from")}
// //                         value={filters.seatsMin || ""}
// //                         onChange={(e) => {
// //                           const value = e.target.value ? parseInt(e.target.value) : undefined;
// //                           setSeatsRange(value, filters.seatsMax);
// //                         }}
// //                         className="h-10 text-black dark:text-white"
// //                         data-testid="input-mobile-seats-min"
// //                       />
// //                       <Input
// //                         type="number"
// //                         min="2"
// //                         max="9"
// //                         placeholder={t("hero.to")}
// //                         value={filters.seatsMax || ""}
// //                         onChange={(e) => {
// //                           const value = e.target.value ? parseInt(e.target.value) : undefined;
// //                           setSeatsRange(filters.seatsMin, value);
// //                         }}
// //                         className="h-10 text-black dark:text-white"
// //                         data-testid="input-mobile-seats-max"
// //                       />
// //                     </div>
// //                   </div>
// //                 </CollapsibleContent>
// //               </Collapsible>

// //               <Collapsible open={openSections.equipment} onOpenChange={() => toggleSection('equipment')}>
// //                 <CollapsibleTrigger className="flex items-center justify-between w-full py-2 hover-elevate rounded-xl px-3">
// //                   <h3 className="text-lg font-semibold">{t("filters.equipment")}</h3>
// //                   <ChevronDown className={`h-5 w-5 transition-transform ${openSections.equipment ? 'rotate-180' : ''}`} />
// //                 </CollapsibleTrigger>
// //                 <CollapsibleContent className="space-y-6 pt-4">
// //                   <div className="space-y-3">
// //                     {[
// //                       { label: t("filters.heatedSeats"), key: "heated-seats" },
// //                       { label: t("filters.electricWindows"), key: "electric-windows" },
// //                       { label: t("filters.leatherInterior"), key: "leather-interior" },
// //                       { label: t("filters.climateControl"), key: "climate-control" },
// //                       { label: t("filters.cruiseControl"), key: "cruise-control" },
// //                       { label: t("filters.parkingSensors"), key: "parking-sensors" },
// //                       { label: t("filters.rearCamera"), key: "rear-camera" },
// //                       { label: t("filters.navigationSystem"), key: "navigation" },
// //                       { label: t("filters.bluetooth"), key: "bluetooth" },
// //                       { label: t("filters.keylessEntry"), key: "keyless-entry" },
// //                       { label: t("filters.ledHeadlights"), key: "led-headlights" },
// //                       { label: t("filters.sunroof"), key: "sunroof" },
// //                       { label: t("filters.alloyWheels"), key: "alloy-wheels" },
// //                       { label: t("filters.ventilatedSeats"), key: "ventilated-seats" },
// //                       { label: t("filters.memorySeats"), key: "memory-seats" },
// //                       { label: t("filters.massageSeats"), key: "massage-seats" },
// //                       { label: t("filters.adaptiveCruise"), key: "adaptive-cruise" },
// //                       { label: t("filters.laneKeeping"), key: "lane-keeping" },
// //                       { label: t("filters.blindSpot"), key: "blind-spot" },
// //                       { label: t("filters.rainSensor"), key: "rain-sensor" },
// //                       { label: t("filters.lightSensor"), key: "light-sensor" },
// //                       { label: t("filters.heatedSteeringWheel"), key: "heated-steering" },
// //                       { label: t("filters.panoramicRoof"), key: "panoramic-roof" },
// //                       { label: t("filters.electricSeats"), key: "electric-seats" },
// //                       { label: t("filters.parkingAssist"), key: "parking-assist" },
// //                       { label: t("filters.headUpDisplay"), key: "head-up-display" },
// //                       { label: t("filters.wirelessCharging"), key: "wireless-charging" },
// //                       { label: t("filters.towHitch"), key: "tow-hitch" }
// //                     ].map((equipment) => (
// //                       <div key={equipment.key} className="flex items-center space-x-2">
// //                         <Checkbox
// //                           id={`mobile-equipment-${equipment.key}`}
// //                           checked={filters.equipment?.includes(equipment.key) || false}
// //                           onCheckedChange={() => handleEquipmentChange(equipment.key)}
// //                           data-testid={`checkbox-mobile-equipment-${equipment.key}`}
// //                         />
// //                         <label
// //                           htmlFor={`mobile-equipment-${equipment.key}`}
// //                           className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-black dark:text-white"
// //                         >
// //                           {equipment.label}
// //                         </label>
// //                       </div>
// //                     ))}
// //                   </div>
// //                 </CollapsibleContent>
// //               </Collapsible>

// //               <Collapsible open={openSections.extras} onOpenChange={() => toggleSection('extras')}>
// //                 <CollapsibleTrigger className="flex items-center justify-between w-full py-2 hover-elevate rounded-xl px-3">
// //                   <h3 className="text-lg font-semibold">{t("filters.additionalOptions")}</h3>
// //                   <ChevronDown className={`h-5 w-5 transition-transform ${openSections.extras ? 'rotate-180' : ''}`} />
// //                 </CollapsibleTrigger>
// //                 <CollapsibleContent className="space-y-6 pt-4">
// //                   <div className="space-y-4">
// //                     <Label className="text-base font-medium">{t("filters.extras")}</Label>
// //                     <div className="space-y-3">
// //                       {[
// //                         { label: t("filters.serviceBook"), key: "Servisní knížka" },
// //                         { label: t("filters.notDamaged"), key: "Nepoškozený" },
// //                         { label: t("filters.notPainted"), key: "Nelakovaný" },
// //                         { label: t("filters.warranty"), key: "Záruka" },
// //                         { label: t("filters.exchange"), key: "Výměna" }
// //                       ].map((extra) => (
// //                         <div key={extra.key} className="flex items-center space-x-2">
// //                           <Checkbox
// //                             id={`mobile-extra-${extra.key}`}
// //                             checked={filters.extras?.includes(extra.key) || false}
// //                             onCheckedChange={() => handleExtrasChange(extra.key)}
// //                             data-testid={`checkbox-mobile-extra-${extra.key.toLowerCase()}`}
// //                           />
// //                           <label
// //                             htmlFor={`mobile-extra-${extra.key}`}
// //                             className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-black dark:text-white"
// //                           >
// //                             {extra.label}
// //                           </label>
// //                         </div>
// //                       ))}
// //                     </div>
// //                   </div>
// //                 </CollapsibleContent>
// //               </Collapsible>

// //               <Collapsible open={openSections.region} onOpenChange={() => toggleSection('region')}>
// //                 <CollapsibleTrigger className="flex items-center justify-between w-full py-2 hover-elevate rounded-xl px-3">
// //                   <h3 className="text-lg font-semibold">{t("filters.region")}</h3>
// //                   <ChevronDown className={`h-5 w-5 transition-transform ${openSections.region ? 'rotate-180' : ''}`} />
// //                 </CollapsibleTrigger>
// //                 <CollapsibleContent className="space-y-6 pt-4">
// //                   <div className="space-y-4">
// //                     <RegionCombobox
// //                       value={filters.region || ""}
// //                       onValueChange={setRegion}
// //                       regions={regions}
// //                       placeholder={t("filters.allRegions")}
// //                       emptyMessage={t("hero.noRegionsFound")}
// //                       testId="select-mobile-filter-region"
// //                     />
// //                   </div>
// //                 </CollapsibleContent>
// //               </Collapsible>
// //             </div>
// //           </ScrollArea>

// //           <DrawerFooter className="border-t pt-4">
// //             <Button className="w-full h-12 rounded-xl shadow-md" onClick={handleApply} data-testid="button-apply-mobile-filters">
// //               {t("filters.apply")}
// //             </Button>
// //           </DrawerFooter>
// //         </DrawerContent>
// //       </Drawer>
// //     </>
// //   );
// // }

// // export default memo(MobileFilters);
// "use client";

// import { memo, useEffect, useMemo, useRef, useState } from "react";

// import { Button } from "@/components/ui/button";
// import {
//   Drawer,
//   DrawerClose,
//   DrawerContent,
//   DrawerDescription,
//   DrawerFooter,
//   DrawerHeader,
//   DrawerTitle,
// } from "@/components/ui/drawer";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { Label } from "@/components/ui/label";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Input } from "@/components/ui/input";
// import { MonthPicker } from "@/components/ui/month-picker";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Collapsible,
//   CollapsibleContent,
//   CollapsibleTrigger,
// } from "@/components/ui/collapsible";

// import {
//   ChevronDown,
//   SlidersHorizontal,
//   X,
//   Sparkles,
//   Car,
//   Package,
//   Wrench,
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

// import { useLanguage } from "@/contexts/LanguageContext";
// import { useFilterParams } from "@/hooks/useFilterParams";
// import {
//   useTranslation,
//   useLocalizedOptions,
//   vehicleTypeBrands,
//   getModelsForVehicleType,
// } from "@/lib/translations";

// import { carBrands } from "@shared/carDatabase";
// import { brandIcons } from "@/lib/brandIcons";
// import { bodyTypeIcons } from "@/lib/bodyTypeIcons";

// import { BrandCombobox } from "@/components/BrandCombobox";
// import { ModelCombobox } from "@/components/ModelCombobox";
// import { RegionCombobox } from "@/components/RegionCombobox";

// import { PriceRangeInput } from "@/components/PriceRangeInput";
// import { MileageRangeInput } from "@/components/MileageRangeInput";
// import { YearRangeInput } from "@/components/YearRangeInput";
// import { OwnersRangeInput } from "@/components/OwnersRangeInput";
// import { ListingAgeRangeInput } from "@/components/ListingAgeRangeInput";
// import { EngineRangeInput } from "@/components/EngineRangeInput";
// import { PowerRangeInput } from "@/components/PowerRangeInput";

// import newCarIcon from "@assets/3AAF8DD0-3B6D-4DA3-8A1E-2858FCC004A1_1763451350424.png";
// import partsIcon from "@assets/62A9ABBD-0474-469C-8089-FA93C3E7C2B4_1763450942216.png";
// import usedCarIcon from "@assets/ABAF6CAB-50AC-450D-8FE8-342C0DF354D6_1763451176037.png";
// import orderCarIcon from "@assets/A6BE7880-928D-4532-BCB1-3FA4A34F89CE_1763451456108.png";
// import motorcycleIcon from "@assets/44AD800C-C9BB-4F50-A278-5152E01D60BB_1763444856175.png";
// import truckGoldIcon from "@assets/8C9B6F5F-55BC-402E-9359-B2707FE2FB81_1763444987490.png";
// import carGoldIcon from "@assets/D545620E-B7EF-4EB5-AE03-389B4725412B_1763449648396.png";
// import vanIcon from "@assets/4E8B9722-D061-47D3-9C2F-2C8C1070F01B_1763443339270.png";

// function ImgIcon({
//   src,
//   alt,
//   className,
// }: {
//   src: string;
//   alt: string;
//   className?: string;
// }) {
//   return (
//     <img
//       src={src}
//       alt={alt}
//       className={className}
//       style={{ objectFit: "contain" }}
//     />
//   );
// }

// const splitComma = (v?: string) =>
//   v
//     ? v
//         .split(",")
//         .map((x) => x.trim())
//         .filter(Boolean)
//     : [];

// const joinComma = (arr: string[]) => arr.filter(Boolean).join(",");

// const toggleInCommaList = (current: string | undefined, value: string) => {
//   const arr = splitComma(current);
//   const next = arr.includes(value)
//     ? arr.filter((x) => x !== value)
//     : [...arr, value];
//   return joinComma(next);
// };

// const toggleInArray = (current: string[] | undefined, value: string) => {
//   const arr = current ?? [];
//   const next = arr.includes(value)
//     ? arr.filter((x) => x !== value)
//     : [...arr, value];
//   return next.length ? next : undefined;
// };

// // ✅ прибираємо службові поля, щоб auto-apply не зациклювався
// const buildStableFiltersKey = (filters: any) => {
//   const {
//     page,
//     limit,
//     offset,
//     sort,
//     order,
//     view,
//     // додай сюди будь-які поля, які НЕ мають тригерити apply
//     ...rest
//   } = filters || {};
//   return JSON.stringify(rest);
// };

// interface MobileFiltersProps {
//   variant?: "hero" | "compact";
// }

// function MobileFilters({ variant = "compact" }: MobileFiltersProps) {
//   const t = useTranslation();
//   const localizedOptions = useLocalizedOptions();
//   const { language } = useLanguage();
//   const [canType, setCanType] = useState(false);
//   const {
//     filters,
//     setFilters,

//     setBrand,
//     setModel,

//     setPriceRange,
//     setYearRange,
//     setMileageRange,
//     setEngineRange,
//     setPowerRange,

//     setDoorsRange,
//     setSeatsRange,
//     setOwnersRange,

//     setSellerType,
//     setListingAgeRange,

//     setColor,
//     setRegion,
//     setDriveType,
//     setFuel,
//     setTransmission,
//     setTrim,

//     setCondition,
//     setEquipment,
//     setExtras,

//     setEuroEmission,
//     setStkValidUntil,
//     setHasServiceBook,

//     resetFilters,
//     applyFilters,
//   } = useFilterParams();

//   const bodyTypes = localizedOptions.getBodyTypes();
//   const colors = localizedOptions.getColors();
//   const driveTypes = localizedOptions.getDriveTypes();
//   const regions = localizedOptions.getRegions();

//   const [open, setOpen] = useState(false);

//   const [openSections, setOpenSections] = useState({
//     vehicleType: true,
//     basic: true,
//     price: true,
//     technical: true,
//     appearance: true,
//     condition: true,
//     equipment: true,
//     extras: true,
//     region: true,
//   });

//   const [showAllConditions, setShowAllConditions] = useState(false);

//   const toggleSection = (section: keyof typeof openSections) => {
//     setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
//   };

//   const selectedVehicleTypes = useMemo(
//     () => splitComma(filters.vehicleType),
//     [filters.vehicleType],
//   );

//   // ✅ Бренди під обрані типи авто (union)
//   const filteredBrands = useMemo(() => {
//     if (!selectedVehicleTypes.length) {
//       return carBrands.map((b) => ({ ...b, icon: brandIcons[b.value] }));
//     }

//     const allowed = new Set<string>();
//     for (const vt of selectedVehicleTypes) {
//       const list = (vehicleTypeBrands as any)[vt] as string[] | undefined;
//       if (Array.isArray(list)) {
//         for (const x of list) allowed.add(x);
//       }
//     }

//     // якщо не знайшли мапінг — не фільтруємо
//     const base = allowed.size
//       ? carBrands.filter((b) => allowed.has(b.value))
//       : carBrands;

//     return base.map((b) => ({ ...b, icon: brandIcons[b.value] }));
//   }, [selectedVehicleTypes]);

//   const primaryVehicleTypeForModels = useMemo(() => {
//     // якщо вибрано кілька типів — беремо перший для getModelsForVehicleType
//     return selectedVehicleTypes[0] || filters.vehicleType || "";
//   }, [selectedVehicleTypes, filters.vehicleType]);

//   const availableModels = useMemo(() => {
//     return filters.brand
//       ? getModelsForVehicleType(filters.brand, primaryVehicleTypeForModels)
//       : [];
//   }, [filters.brand, primaryVehicleTypeForModels]);

//   // ====== числові дефолти (щоб інпути не отримували undefined)
//   const priceMin = filters.priceMin ?? 10000;
//   const priceMax = filters.priceMax ?? 20000000;

//   const yearMin = filters.yearMin ?? 1980;
//   const yearMax = filters.yearMax ?? new Date().getFullYear();

//   const mileageMin = filters.mileageMin ?? 0;
//   const mileageMax = filters.mileageMax ?? 600000;

//   const engineMin = filters.engineMin ?? 0;
//   const engineMax = filters.engineMax ?? 6.0;

//   const powerMin = filters.powerMin ?? 0;
//   const powerMax = filters.powerMax ?? 1000;

//   const ownersMin = filters.ownersMin ?? 0;
//   const ownersMax = filters.ownersMax ?? 10;

//   // ====== handlers
//   const handleVehicleTypeToggle = (type: string) => {
//     setFilters((prev) => ({
//       ...prev,
//       vehicleType: toggleInCommaList(prev.vehicleType, type) || "",
//       bodyType: undefined, // при зміні типу авто — скидаємо кузов
//     }));
//   };

//   const handleBodyTypeToggle = (bodyType: string) => {
//     setFilters((prev) => {
//       const nextBodyTypes = toggleInArray(prev.bodyType, bodyType);

//       // якщо вибираємо кузов — гарантуємо osobni-auta в vehicleType
//       let nextVehicleType = prev.vehicleType || "";
//       if (nextBodyTypes?.length) {
//         const types = new Set([...splitComma(nextVehicleType), "osobni-auta"]);
//         nextVehicleType = joinComma([...types]);
//       }

//       return {
//         ...prev,
//         vehicleType: nextVehicleType,
//         bodyType: nextBodyTypes,
//       };
//     });
//   };

//   const handleFuelToggle = (key: string) => {
//     setFuel(toggleInCommaList(filters.fuel, key));
//   };

//   const handleTransmissionToggle = (key: string) => {
//     setTransmission(toggleInCommaList(filters.transmission, key));
//   };

//   const handleDriveToggle = (key: string) => {
//     setDriveType(toggleInCommaList(filters.driveType, key));
//   };

//   const handleConditionToggle = (value: string) => {
//     const next = toggleInArray(filters.condition, value) ?? [];
//     setCondition(next);
//   };

//   const handleEquipmentToggle = (value: string) => {
//     const next = toggleInArray(filters.equipment, value) ?? [];
//     setEquipment(next);
//   };

//   const handleExtrasToggle = (value: string) => {
//     const next = toggleInArray(filters.extras, value) ?? [];
//     setExtras(next);
//   };

//   const handleReset = () => {
//     resetFilters();
//     setShowAllConditions(false);
//   };

//   // =========================
//   // ✅ AUTO APPLY (як у sidebar)
//   // =========================
//   const APPLY_DEBOUNCE_MS = 350;

//   const applyRef = useRef(applyFilters);
//   useEffect(() => {
//     applyRef.current = applyFilters;
//   }, [applyFilters]);

//   const stableFiltersKey = useMemo(
//     () => buildStableFiltersKey(filters),
//     [filters],
//   );

//   const firstRenderRef = useRef(true);
//   useEffect(() => {
//     if (firstRenderRef.current) {
//       firstRenderRef.current = false;
//       return;
//     }

//     const id = window.setTimeout(() => {
//       applyRef.current();
//     }, APPLY_DEBOUNCE_MS);

//     return () => window.clearTimeout(id);
//   }, [stableFiltersKey]);

//   const isHero = variant === "hero";

//   return (
//     <>
//       <Button
//         variant="outline"
//         className={`lg:hidden gap-2 shadow-sm ${
//           isHero
//             ? "w-full h-12 sm:h-14 rounded-lg sm:rounded-xl text-base sm:text-lg"
//             : "h-12 rounded-xl"
//         }`}
//         onClick={() => setOpen(true)}
//         data-testid="button-open-mobile-filters"
//       >
//         <SlidersHorizontal className="h-5 w-5" />
//         <span>{isHero ? t("hero.moreFilters") : t("filters.title")}</span>
//       </Button>

//       <Drawer open={open} onOpenChange={setOpen}>
//         <DrawerContent className="max-h-[90vh]">
//           <DrawerHeader className="border-b pb-4">
//             <div className="flex items-center justify-between gap-2">
//               <DrawerTitle className="text-xl font-semibold">
//                 {t("filters.title")}
//               </DrawerTitle>

//               <div className="flex items-center gap-2">
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   onClick={handleReset}
//                   data-testid="button-reset-mobile-filters"
//                 >
//                   {t("filters.reset")}
//                 </Button>

//                 <DrawerClose asChild>
//                   <Button
//                     variant="ghost"
//                     size="icon"
//                     data-testid="button-close-mobile-filters"
//                   >
//                     <X className="h-5 w-5" />
//                   </Button>
//                 </DrawerClose>
//               </div>
//             </div>

//             <DrawerDescription className="sr-only">
//               {t("filters.title")}
//             </DrawerDescription>
//           </DrawerHeader>

//           <ScrollArea className="flex-1 overflow-y-auto">
//             <div className="space-y-6 p-4">
//               {/* CONDITION */}
//               <Collapsible
//                 open={openSections.condition}
//                 onOpenChange={() => toggleSection("condition")}
//               >
//                 <CollapsibleTrigger className="flex items-center justify-between w-full py-2 hover-elevate rounded-xl px-3">
//                   <h3 className="text-lg font-semibold">
//                     {t("filters.conditionAndOwners")}
//                   </h3>
//                   <ChevronDown
//                     className={`h-5 w-5 transition-transform ${
//                       openSections.condition ? "rotate-180" : ""
//                     }`}
//                   />
//                 </CollapsibleTrigger>

//                 <CollapsibleContent className="space-y-6 pt-4">
//                   <div className="grid grid-cols-2 gap-3">
//                     {[
//                       {
//                         label: t("filters.conditionNew"),
//                         key: "Nové",
//                         icon: Sparkles,
//                         img: newCarIcon,
//                       },
//                       {
//                         label: t("filters.conditionUsed"),
//                         key: "Ojeté",
//                         icon: Car,
//                         img: usedCarIcon,
//                       },
//                       {
//                         label: t("filters.conditionOrder"),
//                         key: "Na objednávku",
//                         icon: Package,
//                         img: orderCarIcon,
//                       },
//                       {
//                         label: t("filters.conditionParts"),
//                         key: "Na náhradní díly",
//                         icon: Wrench,
//                         img: partsIcon,
//                       },
//                       ...(showAllConditions
//                         ? [
//                             {
//                               label: t("filters.conditionRental"),
//                               key: "Pronájem",
//                               icon: Key,
//                               img: "",
//                             },
//                             {
//                               label: t("filters.conditionDamaged"),
//                               key: "Havarované",
//                               icon: Wrench,
//                               img: "",
//                             },
//                             {
//                               label: t("filters.conditionHistoric"),
//                               key: "Historické",
//                               icon: Sparkles,
//                               img: "",
//                             },
//                           ]
//                         : []),
//                     ].map((condition) => {
//                       const isSelected =
//                         filters.condition?.includes(condition.key) || false;
//                       const Icon = condition.icon;

//                       return (
//                         <Button
//                           key={condition.key}
//                           type="button"
//                           variant={isSelected ? "default" : "outline"}
//                           className={`h-auto py-3 px-4 flex flex-col items-center gap-2 text-center ${
//                             isSelected ? "toggle-elevated" : ""
//                           } toggle-elevate`}
//                           onClick={() => handleConditionToggle(condition.key)}
//                           data-testid={`button-mobile-condition-${condition.key
//                             .toLowerCase()
//                             .replace(/\s+/g, "-")}`}
//                         >
//                           {condition.img ? (
//                             <ImgIcon
//                               src={condition.img}
//                               alt={condition.key}
//                               className="h-10 w-10"
//                             />
//                           ) : (
//                             <Icon className="h-7 w-7 text-[#B8860B]" />
//                           )}

//                           <span className="text-xs font-medium leading-tight text-black dark:text-white">
//                             {condition.label}
//                           </span>
//                         </Button>
//                       );
//                     })}

//                     <Button
//                       type="button"
//                       variant="ghost"
//                       className="col-span-2 h-auto py-2 flex items-center justify-center gap-2"
//                       onClick={() => setShowAllConditions((v) => !v)}
//                       data-testid="button-mobile-toggle-conditions"
//                     >
//                       <span className="text-sm font-medium text-[#B8860B]">
//                         {showAllConditions
//                           ? t("filters.showLess")
//                           : t("filters.showMore")}
//                       </span>
//                       <ChevronDown
//                         className={`h-4 w-4 text-[#B8860B] transition-transform ${
//                           showAllConditions ? "rotate-180" : ""
//                         }`}
//                       />
//                     </Button>
//                   </div>
//                 </CollapsibleContent>
//               </Collapsible>

//               {/* VEHICLE TYPE + BODY TYPE */}
//               <Collapsible
//                 open={openSections.vehicleType}
//                 onOpenChange={() => toggleSection("vehicleType")}
//               >
//                 <CollapsibleTrigger className="flex items-center justify-between w-full py-2 hover-elevate rounded-xl px-3">
//                   <h3 className="text-lg font-semibold">
//                     {t("listing.vehicleType")} / {t("filters.bodyType")}
//                   </h3>
//                   <ChevronDown
//                     className={`h-5 w-5 transition-transform ${
//                       openSections.vehicleType ? "rotate-180" : ""
//                     }`}
//                   />
//                 </CollapsibleTrigger>

//                 <CollapsibleContent className="space-y-6 pt-4">
//                   <div className="grid grid-cols-3 gap-2">
//                     {[
//                       {
//                         key: "osobni-auta",
//                         label: t("hero.cars"),
//                         img: carGoldIcon,
//                         testId: "button-mobile-vehicle-cars",
//                       },
//                       {
//                         key: "dodavky",
//                         label: t("hero.dodavky"),
//                         img: vanIcon,
//                         testId: "button-mobile-vehicle-dodavky",
//                       },
//                       {
//                         key: "nakladni-vozy",
//                         label: t("hero.trucks"),
//                         img: truckGoldIcon,
//                         testId: "button-mobile-vehicle-trucks",
//                       },
//                       {
//                         key: "motorky",
//                         label: t("hero.motorky"),
//                         img: motorcycleIcon,
//                         testId: "button-mobile-vehicle-motorky",
//                       },
//                     ].map((item) => {
//                       const selected = selectedVehicleTypes.includes(item.key);

//                       return (
//                         <button
//                           key={item.key}
//                           type="button"
//                           onClick={() => handleVehicleTypeToggle(item.key)}
//                           className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg border-2 transition-colors hover-elevate active-elevate-2 ${
//                             selected
//                               ? "bg-primary text-primary-foreground border-primary-border"
//                               : "bg-background border-input text-black dark:text-white"
//                           }`}
//                           data-testid={item.testId}
//                         >
//                           <ImgIcon
//                             src={item.img}
//                             alt={item.key}
//                             className="w-8 h-8"
//                           />
//                           <span
//                             className={`text-xs text-center leading-tight ${
//                               !selected ? "text-black dark:text-white" : ""
//                             }`}
//                           >
//                             {item.label}
//                           </span>
//                         </button>
//                       );
//                     })}

//                     {bodyTypes.map((type) => {
//                       const IconComponent = bodyTypeIcons[type.value] || Car;
//                       const isSelected =
//                         filters.bodyType?.includes(type.value) || false;

//                       return (
//                         <button
//                           key={type.value}
//                           type="button"
//                           onClick={() => handleBodyTypeToggle(type.value)}
//                           className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg border-2 transition-colors hover-elevate active-elevate-2 ${
//                             isSelected
//                               ? "bg-primary text-primary-foreground border-primary-border"
//                               : "bg-background border-input text-black dark:text-white"
//                           }`}
//                           data-testid={`button-mobile-body-type-${type.value}`}
//                         >
//                           <IconComponent className="w-8 h-8" />
//                           <span
//                             className={`text-xs text-center leading-tight ${
//                               !isSelected ? "text-black dark:text-white" : ""
//                             }`}
//                           >
//                             {type.label}
//                           </span>
//                         </button>
//                       );
//                     })}
//                   </div>
//                 </CollapsibleContent>
//               </Collapsible>

//               {/* BASIC */}
//               <Collapsible
//                 open={openSections.basic}
//                 onOpenChange={() => toggleSection("basic")}
//               >
//                 <CollapsibleTrigger className="flex items-center justify-between w-full py-2 hover-elevate rounded-xl px-3">
//                   <h3 className="text-lg font-semibold">
//                     {t("filters.basicFilters")}
//                   </h3>
//                   <ChevronDown
//                     className={`h-5 w-5 transition-transform ${
//                       openSections.basic ? "rotate-180" : ""
//                     }`}
//                   />
//                 </CollapsibleTrigger>

//                 <CollapsibleContent className="space-y-6 pt-4">
//                   <div className="space-y-4">
//                     <Label className="text-base font-medium">
//                       {t("filters.brand")}
//                     </Label>

//                     <BrandCombobox
//                       brands={filteredBrands}
//                       value={filters.brand || ""}
//                       onValueChange={setBrand}
//                       placeholder={t("hero.allBrands")}
//                       emptyMessage={t("hero.noBrandsFound")}
//                       testId="select-mobile-filter-brand"
//                     />
//                   </div>

//                   <div className="space-y-4">
//                     <Label className="text-base font-medium">
//                       {t("filters.model")}
//                     </Label>

//                     <ModelCombobox
//                       models={availableModels}
//                       value={filters.model || ""}
//                       onValueChange={setModel}
//                       disabled={!filters.brand}
//                       placeholder={
//                         filters.brand
//                           ? t("hero.allModels")
//                           : t("hero.selectBrand")
//                       }
//                       emptyMessage={t("hero.noModelsFound")}
//                       testId="select-mobile-filter-model"
//                     />
//                   </div>
//                 </CollapsibleContent>
//               </Collapsible>

//               {/* PRICE + YEAR */}
//               <Collapsible
//                 open={openSections.price}
//                 onOpenChange={() => toggleSection("price")}
//               >
//                 <CollapsibleTrigger className="flex items-center justify-between w-full py-2 hover-elevate rounded-xl px-3">
//                   <h3 className="text-lg font-semibold">
//                     {t("filters.priceAndYear")}
//                   </h3>
//                   <ChevronDown
//                     className={`h-5 w-5 transition-transform ${
//                       openSections.price ? "rotate-180" : ""
//                     }`}
//                   />
//                 </CollapsibleTrigger>

//                 <CollapsibleContent className="space-y-6 pt-4">
//                   <div className="space-y-4">
//                     <Label className="text-base font-medium">
//                       {t("filters.price")}
//                     </Label>

//                     <PriceRangeInput
//                       minValue={priceMin}
//                       maxValue={priceMax}
//                       onMinChange={(value) =>
//                         setPriceRange(value || 10000, priceMax)
//                       }
//                       onMaxChange={(value) =>
//                         setPriceRange(priceMin, value || 20000000)
//                       }
//                       variant="mobile"
//                       testIdPrefix="mobile-price"
//                     />

//                     <div className="flex items-center space-x-2 pt-2">
//                       <Checkbox
//                         id="mobile-vat-deductible"
//                         checked={filters.vatDeductible || false}
//                         onCheckedChange={(checked) =>
//                           setFilters((prev) => ({
//                             ...prev,
//                             vatDeductible: checked === true ? true : undefined,
//                           }))
//                         }
//                         data-testid="checkbox-mobile-vat-deductible"
//                       />
//                       <label
//                         htmlFor="mobile-vat-deductible"
//                         className="text-sm font-medium cursor-pointer text-black dark:text-white"
//                       >
//                         {t("filters.vatDeductible")}
//                       </label>
//                     </div>
//                   </div>

//                   <div className="space-y-4">
//                     <Label className="text-base font-medium">
//                       {t("filters.mileage")}
//                     </Label>

//                     <MileageRangeInput
//                       minValue={mileageMin}
//                       maxValue={mileageMax}
//                       onMinChange={(value) =>
//                         setMileageRange(value, mileageMax)
//                       }
//                       onMaxChange={(value) =>
//                         setMileageRange(mileageMin, value)
//                       }
//                       variant="mobile"
//                       testIdPrefix="mobile-mileage"
//                     />
//                   </div>

//                   <div className="space-y-4">
//                     <Label className="text-base font-medium">
//                       {t("filters.yearOfManufacture")}
//                     </Label>

//                     <YearRangeInput
//                       minValue={yearMin}
//                       maxValue={yearMax}
//                       onMinChange={(value) => setYearRange(value, yearMax)}
//                       onMaxChange={(value) => setYearRange(yearMin, value)}
//                       variant="mobile"
//                       testIdPrefix="mobile-year"
//                     />
//                   </div>
//                 </CollapsibleContent>
//               </Collapsible>

//               {/* TECHNICAL */}
//               <Collapsible
//                 open={openSections.technical}
//                 onOpenChange={() => toggleSection("technical")}
//               >
//                 <CollapsibleTrigger className="flex items-center justify-between w-full py-2 hover-elevate rounded-xl px-3">
//                   <h3 className="text-lg font-semibold">
//                     {t("filters.technicalParams")}
//                   </h3>
//                   <ChevronDown
//                     className={`h-5 w-5 transition-transform ${
//                       openSections.technical ? "rotate-180" : ""
//                     }`}
//                   />
//                 </CollapsibleTrigger>

//                 <CollapsibleContent className="space-y-6 pt-4">
//                   <div className="space-y-4">
//                     <Label className="text-base font-medium">
//                       {t("filters.engineVolume")}
//                     </Label>
//                     <EngineRangeInput
//                       minValue={engineMin}
//                       maxValue={engineMax}
//                       onMinChange={(value) => setEngineRange(value, engineMax)}
//                       onMaxChange={(value) => setEngineRange(engineMin, value)}
//                       variant="mobile"
//                       testIdPrefix="mobile-engine"
//                     />
//                   </div>

//                   <div className="space-y-4">
//                     <Label className="text-base font-medium">
//                       {t("filters.power")}
//                     </Label>
//                     <PowerRangeInput
//                       minValue={powerMin}
//                       maxValue={powerMax}
//                       onMinChange={(value) => setPowerRange(value, powerMax)}
//                       onMaxChange={(value) => setPowerRange(powerMin, value)}
//                       variant="mobile"
//                       testIdPrefix="mobile-power"
//                     />
//                   </div>

//                   {/* FUEL */}
//                   <div className="space-y-4">
//                     <Label className="text-base font-medium">
//                       {t("filters.fuelType")}
//                     </Label>

//                     <div className="space-y-3">
//                       {[
//                         { label: t("hero.benzin"), key: "benzin" },
//                         { label: t("hero.diesel"), key: "diesel" },
//                         { label: t("hero.hybrid"), key: "hybrid" },
//                         { label: t("hero.electric"), key: "electric" },
//                         { label: t("hero.lpg"), key: "lpg" },
//                         { label: t("hero.cng"), key: "cng" },
//                       ].map((fuel) => {
//                         const checked = splitComma(filters.fuel).includes(
//                           fuel.key,
//                         );
//                         return (
//                           <div
//                             key={fuel.key}
//                             className="flex items-center space-x-2"
//                           >
//                             <Checkbox
//                               id={`mobile-fuel-${fuel.key}`}
//                               checked={checked}
//                               onCheckedChange={() => handleFuelToggle(fuel.key)}
//                               data-testid={`checkbox-mobile-fuel-${fuel.key}`}
//                             />
//                             <label
//                               htmlFor={`mobile-fuel-${fuel.key}`}
//                               className="text-sm font-medium cursor-pointer text-black dark:text-white"
//                             >
//                               {fuel.label}
//                             </label>
//                           </div>
//                         );
//                       })}
//                     </div>
//                   </div>

//                   {/* TRANSMISSION */}
//                   <div className="space-y-4">
//                     <Label className="text-base font-medium">
//                       {t("filters.transmission")}
//                     </Label>

//                     <div className="space-y-3">
//                       {[
//                         {
//                           label: t("filters.manual"),
//                           key: "manual",
//                           icon: CircleDot,
//                         },
//                         {
//                           label: t("filters.automatic"),
//                           key: "automatic",
//                           icon: Zap,
//                         },
//                         { label: t("filters.robot"), key: "robot", icon: Bot },
//                         { label: t("filters.cvt"), key: "cvt", icon: Activity },
//                       ].map((tr) => {
//                         const Icon = tr.icon;
//                         const checked = splitComma(
//                           filters.transmission,
//                         ).includes(tr.key);

//                         return (
//                           <div
//                             key={tr.key}
//                             className="flex items-center space-x-2"
//                           >
//                             <Checkbox
//                               id={`mobile-trans-${tr.key}`}
//                               checked={checked}
//                               onCheckedChange={() =>
//                                 handleTransmissionToggle(tr.key)
//                               }
//                               data-testid={`checkbox-mobile-transmission-${tr.key}`}
//                             />
//                             <label
//                               htmlFor={`mobile-trans-${tr.key}`}
//                               className="text-sm font-medium cursor-pointer text-black dark:text-white flex items-center gap-2"
//                             >
//                               <Icon className="w-4 h-4 text-[#B8860B]" />
//                               <span>{tr.label}</span>
//                             </label>
//                           </div>
//                         );
//                       })}
//                     </div>
//                   </div>

//                   {/* DRIVE */}
//                   <div className="space-y-4">
//                     <Label className="text-base font-medium">
//                       {t("filters.driveType")}
//                     </Label>

//                     <div className="space-y-3">
//                       {driveTypes.map((drive) => {
//                         const icons: Record<string, any> = {
//                           fwd: ArrowUp,
//                           rwd: ArrowDown,
//                           awd: Grid3x3,
//                           "4wd": Compass,
//                         };
//                         const Icon = icons[drive.value];
//                         const checked = splitComma(filters.driveType).includes(
//                           drive.value,
//                         );

//                         return (
//                           <div
//                             key={drive.value}
//                             className="flex items-center space-x-2"
//                           >
//                             <Checkbox
//                               id={`mobile-drive-${drive.value}`}
//                               checked={checked}
//                               onCheckedChange={() =>
//                                 handleDriveToggle(drive.value)
//                               }
//                               data-testid={`checkbox-mobile-drive-${drive.value}`}
//                             />
//                             <label
//                               htmlFor={`mobile-drive-${drive.value}`}
//                               className="text-sm font-medium cursor-pointer text-black dark:text-white flex items-center gap-2"
//                             >
//                               {Icon ? (
//                                 <Icon className="w-4 h-4 text-[#B8860B]" />
//                               ) : null}
//                               <span>{drive.label}</span>
//                             </label>
//                           </div>
//                         );
//                       })}
//                     </div>
//                   </div>

//                   {/* OWNERS */}
//                   <div className="space-y-4">
//                     <Label className="text-base font-medium">
//                       {t("filters.owners")}
//                     </Label>

//                     <OwnersRangeInput
//                       minValue={ownersMin}
//                       maxValue={ownersMax}
//                       onMinChange={(value) => setOwnersRange(value, ownersMax)}
//                       onMaxChange={(value) => setOwnersRange(ownersMin, value)}
//                       variant="mobile"
//                       testIdPrefix="mobile-owners"
//                     />
//                   </div>

//                   {/* SELLER TYPE */}
//                   <div className="space-y-4">
//                     <Label className="text-base font-medium">
//                       {t("filters.sellerType")}
//                     </Label>

//                     <div className="grid grid-cols-2 gap-2">
//                       {[
//                         {
//                           key: "private" as const,
//                           label: t("filters.sellerPrivate"),
//                         },
//                         {
//                           key: "dealer" as const,
//                           label: t("filters.sellerDealer"),
//                         },
//                       ].map((opt) => {
//                         const selected = filters.sellerType === opt.key;
//                         return (
//                           <Button
//                             key={opt.key}
//                             type="button"
//                             variant={selected ? "default" : "outline"}
//                             className={`h-auto py-2 px-3 text-xs ${
//                               !selected ? "text-black dark:text-white" : ""
//                             } ${selected ? "toggle-elevated" : ""} toggle-elevate`}
//                             onClick={() =>
//                               setSellerType(selected ? "" : opt.key)
//                             }
//                             data-testid={`button-mobile-seller-${opt.key}`}
//                           >
//                             {opt.label}
//                           </Button>
//                         );
//                       })}
//                     </div>
//                   </div>

//                   {/* LISTING AGE */}
//                   <div className="space-y-4">
//                     <Label className="text-base font-medium">
//                       {t("filters.listingAge")}
//                     </Label>

//                     <ListingAgeRangeInput
//                       minValue={filters.listingAgeMin || 0}
//                       maxValue={filters.listingAgeMax || 365}
//                       onMinChange={(value) =>
//                         setListingAgeRange(value, filters.listingAgeMax || 365)
//                       }
//                       onMaxChange={(value) =>
//                         setListingAgeRange(filters.listingAgeMin || 0, value)
//                       }
//                       variant="mobile"
//                       testIdPrefix="mobile-listing-age"
//                     />
//                   </div>

//                   {/* EURO */}
//                   <div className="space-y-4">
//                     <Label className="text-base font-medium">
//                       {t("filters.euroEmission")}
//                     </Label>

//                     <Select
//                       value={filters.euroEmission || "all"}
//                       onValueChange={(value) =>
//                         setEuroEmission(value === "all" ? "" : value)
//                       }
//                     >
//                       <SelectTrigger
//                         className="h-12 rounded-xl text-black dark:text-white"
//                         data-testid="select-mobile-filter-euro-emission"
//                       >
//                         <SelectValue placeholder={t("filters.allEuroNorms")} />
//                       </SelectTrigger>

//                       <SelectContent>
//                         <SelectItem
//                           value="all"
//                           className="text-black dark:text-white"
//                         >
//                           {t("filters.allEuroNorms")}
//                         </SelectItem>
//                         {[
//                           "euro1",
//                           "euro2",
//                           "euro3",
//                           "euro4",
//                           "euro5",
//                           "euro6",
//                           "euro6d",
//                         ].map((v) => (
//                           <SelectItem
//                             key={v}
//                             value={v}
//                             className="text-black dark:text-white"
//                           >
//                             {t(`filters.${v}` as any)}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </div>

//                   {/* STK */}
//                   <div className="space-y-4">
//                     <Label className="text-base font-medium">
//                       {t("filters.stkValidUntil")}
//                     </Label>

//                     <MonthPicker
//                       value={filters.stkValidUntil || ""}
//                       onChange={(value) => setStkValidUntil(value)}
//                       data-testid="input-mobile-stk-valid"
//                     />
//                   </div>

//                   {/* SERVICE BOOK */}
//                   <div className="flex items-center space-x-2 py-2">
//                     <Checkbox
//                       id="mobile-filter-has-service-book"
//                       checked={filters.hasServiceBook || false}
//                       onCheckedChange={(checked) =>
//                         setHasServiceBook(!!checked)
//                       }
//                       data-testid="checkbox-mobile-filter-service-book"
//                     />
//                     <label
//                       htmlFor="mobile-filter-has-service-book"
//                       className="text-sm font-medium cursor-pointer text-black dark:text-white"
//                     >
//                       {t("filters.hasServiceBook")}
//                     </label>
//                   </div>
//                 </CollapsibleContent>
//               </Collapsible>

//               {/* APPEARANCE */}
//               <Collapsible
//                 open={openSections.appearance}
//                 onOpenChange={() => toggleSection("appearance")}
//               >
//                 <CollapsibleTrigger className="flex items-center justify-between w-full py-2 hover-elevate rounded-xl px-3">
//                   <h3 className="text-lg font-semibold">
//                     {t("filters.appearance")}
//                   </h3>
//                   <ChevronDown
//                     className={`h-5 w-5 transition-transform ${
//                       openSections.appearance ? "rotate-180" : ""
//                     }`}
//                   />
//                 </CollapsibleTrigger>

//                 <CollapsibleContent className="space-y-6 pt-4">
//                   {/* COLOR */}
//                   <div className="space-y-4">
//                     <Label className="text-base font-medium">
//                       {t("filters.color")}
//                     </Label>

//                     <Select
//                       value={filters.color || "all"}
//                       onValueChange={(value) =>
//                         setColor(value === "all" ? "" : value)
//                       }
//                     >
//                       <SelectTrigger
//                         className="h-12 rounded-xl text-black dark:text-white"
//                         data-testid="select-mobile-filter-color"
//                       >
//                         <SelectValue placeholder={t("filters.allColors")} />
//                       </SelectTrigger>

//                       <SelectContent>
//                         <SelectItem
//                           value="all"
//                           className="text-black dark:text-white"
//                         >
//                           {t("filters.allColors")}
//                         </SelectItem>

//                         {colors.map((c) => (
//                           <SelectItem
//                             key={c.value}
//                             value={c.value}
//                             className="text-black dark:text-white"
//                           >
//                             <div className="flex items-center gap-2">
//                               <div
//                                 className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600 flex-shrink-0"
//                                 style={{
//                                   backgroundColor: c.hex,
//                                   boxShadow:
//                                     c.value === "white" || c.value === "ivory"
//                                       ? "inset 0 0 0 1px rgba(0,0,0,0.1)"
//                                       : "none",
//                                 }}
//                               />
//                               <span>{c.label}</span>
//                             </div>
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </div>

//                   {/* DOORS */}
//                   <div className="space-y-4">
//                     <Label className="text-base font-medium">
//                       {t("filters.doors")}
//                     </Label>
//                     <div className="grid grid-cols-2 gap-2">
//                       <Input
//                         type="number"
//                         min="2"
//                         max="6"
//                         placeholder={t("hero.from")}
//                         value={filters.doorsMin ?? ""}
//                         onChange={(e) => {
//                           const v = e.target.value
//                             ? Number(e.target.value)
//                             : undefined;
//                           setDoorsRange(v, filters.doorsMax);
//                         }}
//                         className="h-10 text-black dark:text-white"
//                         data-testid="input-mobile-doors-min"
//                       />
//                       <Input
//                         type="number"
//                         min="2"
//                         max="6"
//                         placeholder={t("hero.to")}
//                         value={filters.doorsMax ?? ""}
//                         onChange={(e) => {
//                           const v = e.target.value
//                             ? Number(e.target.value)
//                             : undefined;
//                           setDoorsRange(filters.doorsMin, v);
//                         }}
//                         className="h-10 text-black dark:text-white"
//                         data-testid="input-mobile-doors-max"
//                       />
//                     </div>
//                   </div>

//                   {/* SEATS */}
//                   <div className="space-y-4">
//                     <Label className="text-base font-medium">
//                       {t("filters.seats")}
//                     </Label>
//                     <div className="grid grid-cols-2 gap-2">
//                       <Input
//                         type="number"
//                         min="2"
//                         max="9"
//                         placeholder={t("hero.from")}
//                         value={filters.seatsMin ?? ""}
//                         onChange={(e) => {
//                           const v = e.target.value
//                             ? Number(e.target.value)
//                             : undefined;
//                           setSeatsRange(v, filters.seatsMax);
//                         }}
//                         className="h-10 text-black dark:text-white"
//                         data-testid="input-mobile-seats-min"
//                       />
//                       <Input
//                         type="number"
//                         min="2"
//                         max="9"
//                         placeholder={t("hero.to")}
//                         value={filters.seatsMax ?? ""}
//                         onChange={(e) => {
//                           const v = e.target.value
//                             ? Number(e.target.value)
//                             : undefined;
//                           setSeatsRange(filters.seatsMin, v);
//                         }}
//                         className="h-10 text-black dark:text-white"
//                         data-testid="input-mobile-seats-max"
//                       />
//                     </div>
//                   </div>

//                   {/* TRIM */}
//                   <div className="space-y-4">
//                     <Label className="text-base font-medium">
//                       {t("filters.trim")}
//                     </Label>

//                     <Input
//                       value={filters.trim || ""}
//                       onChange={(e) => setTrim(e.target.value)}
//                       placeholder={t("filters.allTrims")}
//                       className="h-10 text-black dark:text-white"
//                       data-testid="input-mobile-trim"
//                     />
//                   </div>
//                 </CollapsibleContent>
//               </Collapsible>

//               {/* EQUIPMENT */}
//               <Collapsible
//                 open={openSections.equipment}
//                 onOpenChange={() => toggleSection("equipment")}
//               >
//                 <CollapsibleTrigger className="flex items-center justify-between w-full py-2 hover-elevate rounded-xl px-3">
//                   <h3 className="text-lg font-semibold">
//                     {t("filters.equipment")}
//                   </h3>
//                   <ChevronDown
//                     className={`h-5 w-5 transition-transform ${
//                       openSections.equipment ? "rotate-180" : ""
//                     }`}
//                   />
//                 </CollapsibleTrigger>

//                 <CollapsibleContent className="space-y-6 pt-4">
//                   <div className="space-y-3">
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
//                         label: t("filters.panoramicRoof"),
//                         key: "panoramic-roof",
//                       },
//                       { label: t("filters.towHitch"), key: "tow-hitch" },
//                     ].map((item) => (
//                       <div
//                         key={item.key}
//                         className="flex items-center space-x-2"
//                       >
//                         <Checkbox
//                           id={`mobile-equipment-${item.key}`}
//                           checked={
//                             filters.equipment?.includes(item.key) || false
//                           }
//                           onCheckedChange={() =>
//                             handleEquipmentToggle(item.key)
//                           }
//                           data-testid={`checkbox-mobile-equipment-${item.key}`}
//                         />
//                         <label
//                           htmlFor={`mobile-equipment-${item.key}`}
//                           className="text-sm font-medium cursor-pointer text-black dark:text-white"
//                         >
//                           {item.label}
//                         </label>
//                       </div>
//                     ))}
//                   </div>
//                 </CollapsibleContent>
//               </Collapsible>

//               {/* EXTRAS */}
//               <Collapsible
//                 open={openSections.extras}
//                 onOpenChange={() => toggleSection("extras")}
//               >
//                 <CollapsibleTrigger className="flex items-center justify-between w-full py-2 hover-elevate rounded-xl px-3">
//                   <h3 className="text-lg font-semibold">
//                     {t("filters.additionalOptions")}
//                   </h3>
//                   <ChevronDown
//                     className={`h-5 w-5 transition-transform ${
//                       openSections.extras ? "rotate-180" : ""
//                     }`}
//                   />
//                 </CollapsibleTrigger>

//                 <CollapsibleContent className="space-y-6 pt-4">
//                   <div className="space-y-3">
//                     {[
//                       {
//                         label: t("filters.serviceBook"),
//                         key: "Servisní knížka",
//                       },
//                       { label: t("filters.notDamaged"), key: "Nepoškozený" },
//                       { label: t("filters.notPainted"), key: "Nelakovaný" },
//                       { label: t("filters.warranty"), key: "Záruka" },
//                       { label: t("filters.exchange"), key: "Výměna" },
//                     ].map((item) => (
//                       <div
//                         key={item.key}
//                         className="flex items-center space-x-2"
//                       >
//                         <Checkbox
//                           id={`mobile-extra-${item.key}`}
//                           checked={filters.extras?.includes(item.key) || false}
//                           onCheckedChange={() => handleExtrasToggle(item.key)}
//                           data-testid={`checkbox-mobile-extra-${item.key
//                             .toLowerCase()
//                             .replace(/\s+/g, "-")}`}
//                         />
//                         <label
//                           htmlFor={`mobile-extra-${item.key}`}
//                           className="text-sm font-medium cursor-pointer text-black dark:text-white"
//                         >
//                           {item.label}
//                         </label>
//                       </div>
//                     ))}
//                   </div>
//                 </CollapsibleContent>
//               </Collapsible>

//               {/* REGION */}
//               <Collapsible
//                 open={openSections.region}
//                 onOpenChange={() => toggleSection("region")}
//               >
//                 <CollapsibleTrigger className="flex items-center justify-between w-full py-2 hover-elevate rounded-xl px-3">
//                   <h3 className="text-lg font-semibold">
//                     {t("filters.region")}
//                   </h3>
//                   <ChevronDown
//                     className={`h-5 w-5 transition-transform ${
//                       openSections.region ? "rotate-180" : ""
//                     }`}
//                   />
//                 </CollapsibleTrigger>

//                 <CollapsibleContent className="space-y-6 pt-4">
//                   <RegionCombobox
//                     value={filters.region || ""}
//                     onValueChange={setRegion}
//                     regions={regions}
//                     placeholder={t("filters.allRegions")}
//                     emptyMessage={t("hero.noRegionsFound")}
//                     testId="select-mobile-filter-region"
//                   />
//                 </CollapsibleContent>
//               </Collapsible>
//             </div>
//           </ScrollArea>

//           <DrawerFooter className="border-t pt-4">
//             {/* ✅ Apply кнопка більше не потрібна — все застосовується автоматично */}
//             <DrawerClose asChild>
//               <Button
//                 className="w-full h-12 rounded-xl shadow-md"
//                 data-testid="button-close-mobile-filters-bottom"
//               >
//                 {t("filters.close")}
//               </Button>
//             </DrawerClose>
//           </DrawerFooter>
//         </DrawerContent>
//       </Drawer>
//     </>
//   );
// }

// export default memo(MobileFilters);
"use client";

import { memo, useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { MonthPicker } from "@/components/ui/month-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import {
  ChevronDown,
  SlidersHorizontal,
  X,
  Sparkles,
  Car,
  Package,
  Wrench,
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

import { useLanguage } from "@/contexts/LanguageContext";
import { useFilterParams } from "@/hooks/useFilterParams";
import {
  useTranslation,
  useLocalizedOptions,
  vehicleTypeBrands,
  getModelsForVehicleType,
} from "@/lib/translations";

import { carBrands } from "@shared/carDatabase";
import { brandIcons } from "@/lib/brandIcons";
import { bodyTypeIcons } from "@/lib/bodyTypeIcons";

import { BrandCombobox } from "@/components/BrandCombobox";
import { ModelCombobox } from "@/components/ModelCombobox";
import { RegionCombobox } from "@/components/RegionCombobox";

import { PriceRangeInput } from "@/components/PriceRangeInput";
import { MileageRangeInput } from "@/components/MileageRangeInput";
import { YearRangeInput } from "@/components/YearRangeInput";
import { OwnersRangeInput } from "@/components/OwnersRangeInput";
import { ListingAgeRangeInput } from "@/components/ListingAgeRangeInput";
import { EngineRangeInput } from "@/components/EngineRangeInput";
import { PowerRangeInput } from "@/components/PowerRangeInput";

import newCarIcon from "@assets/3AAF8DD0-3B6D-4DA3-8A1E-2858FCC004A1_1763451350424.png";
import partsIcon from "@assets/62A9ABBD-0474-469C-8089-FA93C3E7C2B4_1763450942216.png";
import usedCarIcon from "@assets/ABAF6CAB-50AC-450D-8FE8-342C0DF354D6_1763451176037.png";
import orderCarIcon from "@assets/A6BE7880-928D-4532-BCB1-3FA4A34F89CE_1763451456108.png";
import motorcycleIcon from "@assets/44AD800C-C9BB-4F50-A278-5152E01D60BB_1763444856175.png";
import truckGoldIcon from "@assets/8C9B6F5F-55BC-402E-9359-B2707FE2FB81_1763444987490.png";
import carGoldIcon from "@assets/D545620E-B7EF-4EB5-AE03-389B4725412B_1763449648396.png";
import vanIcon from "@assets/4E8B9722-D061-47D3-9C2F-2C8C1070F01B_1763443339270.png";

function ImgIcon({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={{ objectFit: "contain" }}
    />
  );
}

const splitComma = (v?: string) =>
  v
    ? v
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean)
    : [];

const joinComma = (arr: string[]) => arr.filter(Boolean).join(",");

const toggleInCommaList = (current: string | undefined, value: string) => {
  const arr = splitComma(current);
  const next = arr.includes(value)
    ? arr.filter((x) => x !== value)
    : [...arr, value];
  return joinComma(next);
};

const toggleInArray = (current: string[] | undefined, value: string) => {
  const arr = current ?? [];
  const next = arr.includes(value)
    ? arr.filter((x) => x !== value)
    : [...arr, value];
  return next.length ? next : undefined;
};

// ✅ прибираємо службові поля, щоб auto-apply не зациклювався
const buildStableFiltersKey = (filters: any) => {
  const {
    page,
    limit,
    offset,
    sort,
    order,
    view,
    // додай сюди будь-які поля, які НЕ мають тригерити apply
    ...rest
  } = filters || {};
  return JSON.stringify(rest);
};

interface MobileFiltersProps {
  variant?: "hero" | "compact";
}

function MobileFilters({ variant = "compact" }: MobileFiltersProps) {
  const t = useTranslation();
  const localizedOptions = useLocalizedOptions();
  const { language } = useLanguage();
  const [canType, setCanType] = useState(false);
  const {
    filters,
    setFilters,

    setBrand,
    setModel,

    setPriceRange,
    setYearRange,
    setMileageRange,
    setEngineRange,
    setPowerRange,

    setDoorsRange,
    setSeatsRange,
    setOwnersRange,

    setSellerType,
    setListingAgeRange,

    setColor,
    setRegion,
    setDriveType,
    setFuel,
    setTransmission,
    setTrim,

    setCondition,
    setEquipment,
    setExtras,

    setEuroEmission,
    setStkValidUntil,
    setHasServiceBook,

    resetFilters,
    applyFilters,
  } = useFilterParams();

  const bodyTypes = localizedOptions.getBodyTypes();
  const colors = localizedOptions.getColors();
  const driveTypes = localizedOptions.getDriveTypes();
  const regions = localizedOptions.getRegions();

  const [open, setOpen] = useState(false);
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  useEffect(() => {
    if (!open) return;

    const vv = window.visualViewport;
    if (!vv) return;

    const update = () => {
      // Скільки “з’їла” клавіатура (і адресний бар/панелі)
      const offset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      setKeyboardOffset(offset);
    };

    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update); // iOS інколи змінює offsetTop

    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, [open]);

  const [openSections, setOpenSections] = useState({
    vehicleType: true,
    basic: true,
    price: true,
    technical: true,
    appearance: true,
    condition: true,
    equipment: true,
    extras: true,
    region: true,
  });

  const [showAllConditions, setShowAllConditions] = useState(false);

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const selectedVehicleTypes = useMemo(
    () => splitComma(filters.vehicleType),
    [filters.vehicleType],
  );

  // ✅ Бренди під обрані типи авто (union)
  const filteredBrands = useMemo(() => {
    if (!selectedVehicleTypes.length) {
      return carBrands.map((b) => ({ ...b, icon: brandIcons[b.value] }));
    }

    const allowed = new Set<string>();
    for (const vt of selectedVehicleTypes) {
      const list = (vehicleTypeBrands as any)[vt] as string[] | undefined;
      if (Array.isArray(list)) {
        for (const x of list) allowed.add(x);
      }
    }

    // якщо не знайшли мапінг — не фільтруємо
    const base = allowed.size
      ? carBrands.filter((b) => allowed.has(b.value))
      : carBrands;

    return base.map((b) => ({ ...b, icon: brandIcons[b.value] }));
  }, [selectedVehicleTypes]);

  const primaryVehicleTypeForModels = useMemo(() => {
    // якщо вибрано кілька типів — беремо перший для getModelsForVehicleType
    return selectedVehicleTypes[0] || filters.vehicleType || "";
  }, [selectedVehicleTypes, filters.vehicleType]);

  const availableModels = useMemo(() => {
    return filters.brand
      ? getModelsForVehicleType(filters.brand, primaryVehicleTypeForModels)
      : [];
  }, [filters.brand, primaryVehicleTypeForModels]);

  // ====== числові дефолти (щоб інпути не отримували undefined)
  const priceMin = filters.priceMin ?? 10000;
  const priceMax = filters.priceMax ?? 20000000;

  const yearMin = filters.yearMin ?? 1980;
  const yearMax = filters.yearMax ?? new Date().getFullYear();

  const mileageMin = filters.mileageMin ?? 0;
  const mileageMax = filters.mileageMax ?? 600000;

  const engineMin = filters.engineMin ?? 0;
  const engineMax = filters.engineMax ?? 6.0;

  const powerMin = filters.powerMin ?? 0;
  const powerMax = filters.powerMax ?? 1000;

  const ownersMin = filters.ownersMin ?? 0;
  const ownersMax = filters.ownersMax ?? 10;

  // ====== handlers
  const handleVehicleTypeToggle = (type: string) => {
    setFilters((prev) => ({
      ...prev,
      vehicleType: toggleInCommaList(prev.vehicleType, type) || "",
      bodyType: undefined, // при зміні типу авто — скидаємо кузов
    }));
  };

  const handleBodyTypeToggle = (bodyType: string) => {
    setFilters((prev) => {
      const nextBodyTypes = toggleInArray(prev.bodyType, bodyType);

      // якщо вибираємо кузов — гарантуємо osobni-auta в vehicleType
      let nextVehicleType = prev.vehicleType || "";
      if (nextBodyTypes?.length) {
        const types = new Set([...splitComma(nextVehicleType), "osobni-auta"]);
        nextVehicleType = joinComma([...types]);
      }

      return {
        ...prev,
        vehicleType: nextVehicleType,
        bodyType: nextBodyTypes,
      };
    });
  };

  const handleFuelToggle = (key: string) => {
    setFuel(toggleInCommaList(filters.fuel, key));
  };

  const handleTransmissionToggle = (key: string) => {
    setTransmission(toggleInCommaList(filters.transmission, key));
  };

  const handleDriveToggle = (key: string) => {
    setDriveType(toggleInCommaList(filters.driveType, key));
  };

  const handleConditionToggle = (value: string) => {
    const next = toggleInArray(filters.condition, value) ?? [];
    setCondition(next);
  };

  const handleEquipmentToggle = (value: string) => {
    const next = toggleInArray(filters.equipment, value) ?? [];
    setEquipment(next);
  };

  const handleExtrasToggle = (value: string) => {
    const next = toggleInArray(filters.extras, value) ?? [];
    setExtras(next);
  };

  const handleReset = () => {
    resetFilters();
    setShowAllConditions(false);
  };

  // =========================
  // ✅ AUTO APPLY (як у sidebar)
  // =========================
  const APPLY_DEBOUNCE_MS = 350;

  const applyRef = useRef(applyFilters);
  useEffect(() => {
    applyRef.current = applyFilters;
  }, [applyFilters]);

  const stableFiltersKey = useMemo(
    () => buildStableFiltersKey(filters),
    [filters],
  );

  const firstRenderRef = useRef(true);
  useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      return;
    }

    const id = window.setTimeout(() => {
      applyRef.current();
    }, APPLY_DEBOUNCE_MS);

    return () => window.clearTimeout(id);
  }, [stableFiltersKey]);

  const isHero = variant === "hero";

  return (
    <>
      <Button
        variant="outline"
        className={`lg:hidden gap-2 shadow-sm ${
          isHero
            ? "w-full h-12 sm:h-14 rounded-lg sm:rounded-xl text-base sm:text-lg"
            : "h-12 rounded-xl"
        }`}
        onClick={() => setOpen(true)}
        data-testid="button-open-mobile-filters"
      >
        <SlidersHorizontal className="h-5 w-5" />
        <span>{isHero ? t("hero.moreFilters") : t("filters.title")}</span>
      </Button>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent
          style={{ bottom: keyboardOffset }}
          className="bg-background h-[100dvh] max-h-[100dvh] overflow-hidden flex flex-col"
        >
          {" "}
          <DrawerHeader className="border-b pb-4 shrink-0">
            <div className="flex items-center justify-between gap-2">
              <DrawerTitle className="text-xl font-semibold">
                {t("filters.title")}
              </DrawerTitle>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  data-testid="button-reset-mobile-filters"
                >
                  {t("filters.reset")}
                </Button>

                <DrawerClose asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    data-testid="button-close-mobile-filters"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </DrawerClose>
              </div>
            </div>

            <DrawerDescription className="sr-only">
              {t("filters.title")}
            </DrawerDescription>
          </DrawerHeader>
          <ScrollArea className="flex-1 min-h-0 overflow-y-auto overscroll-contain ios-scroll">
            <div className="space-y-6 p-4">
              {/* CONDITION */}
              <Collapsible
                open={openSections.condition}
                onOpenChange={() => toggleSection("condition")}
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full py-2 hover-elevate rounded-xl px-3">
                  <h3 className="text-lg font-semibold">
                    {t("filters.conditionAndOwners")}
                  </h3>
                  <ChevronDown
                    className={`h-5 w-5 transition-transform ${
                      openSections.condition ? "rotate-180" : ""
                    }`}
                  />
                </CollapsibleTrigger>

                <CollapsibleContent className="space-y-6 pt-4">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      {
                        label: t("filters.conditionNew"),
                        key: "Nové",
                        icon: Sparkles,
                        img: newCarIcon,
                      },
                      {
                        label: t("filters.conditionUsed"),
                        key: "Ojeté",
                        icon: Car,
                        img: usedCarIcon,
                      },
                      {
                        label: t("filters.conditionOrder"),
                        key: "Na objednávku",
                        icon: Package,
                        img: orderCarIcon,
                      },
                      {
                        label: t("filters.conditionParts"),
                        key: "Na náhradní díly",
                        icon: Wrench,
                        img: partsIcon,
                      },
                      ...(showAllConditions
                        ? [
                            {
                              label: t("filters.conditionRental"),
                              key: "Pronájem",
                              icon: Key,
                              img: "",
                            },
                            {
                              label: t("filters.conditionDamaged"),
                              key: "Havarované",
                              icon: Wrench,
                              img: "",
                            },
                            {
                              label: t("filters.conditionHistoric"),
                              key: "Historické",
                              icon: Sparkles,
                              img: "",
                            },
                          ]
                        : []),
                    ].map((condition) => {
                      const isSelected =
                        filters.condition?.includes(condition.key) || false;
                      const Icon = condition.icon;

                      return (
                        <Button
                          key={condition.key}
                          type="button"
                          variant={isSelected ? "default" : "outline"}
                          className={`h-auto py-3 px-4 flex flex-col items-center gap-2 text-center ${
                            isSelected ? "toggle-elevated" : ""
                          } toggle-elevate`}
                          onClick={() => handleConditionToggle(condition.key)}
                          data-testid={`button-mobile-condition-${condition.key
                            .toLowerCase()
                            .replace(/\s+/g, "-")}`}
                        >
                          {condition.img ? (
                            <ImgIcon
                              src={condition.img}
                              alt={condition.key}
                              className="h-10 w-10"
                            />
                          ) : (
                            <Icon className="h-7 w-7 text-[#B8860B]" />
                          )}

                          <span className="text-xs font-medium leading-tight text-black dark:text-white">
                            {condition.label}
                          </span>
                        </Button>
                      );
                    })}

                    <Button
                      type="button"
                      variant="ghost"
                      className="col-span-2 h-auto py-2 flex items-center justify-center gap-2"
                      onClick={() => setShowAllConditions((v) => !v)}
                      data-testid="button-mobile-toggle-conditions"
                    >
                      <span className="text-sm font-medium text-[#B8860B]">
                        {showAllConditions
                          ? t("filters.showLess")
                          : t("filters.showMore")}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 text-[#B8860B] transition-transform ${
                          showAllConditions ? "rotate-180" : ""
                        }`}
                      />
                    </Button>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* VEHICLE TYPE + BODY TYPE */}
              <Collapsible
                open={openSections.vehicleType}
                onOpenChange={() => toggleSection("vehicleType")}
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full py-2 hover-elevate rounded-xl px-3">
                  <h3 className="text-lg font-semibold">
                    {t("listing.vehicleType")} / {t("filters.bodyType")}
                  </h3>
                  <ChevronDown
                    className={`h-5 w-5 transition-transform ${
                      openSections.vehicleType ? "rotate-180" : ""
                    }`}
                  />
                </CollapsibleTrigger>

                <CollapsibleContent className="space-y-6 pt-4">
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      {
                        key: "osobni-auta",
                        label: t("hero.cars"),
                        img: carGoldIcon,
                        testId: "button-mobile-vehicle-cars",
                      },
                      {
                        key: "dodavky",
                        label: t("hero.dodavky"),
                        img: vanIcon,
                        testId: "button-mobile-vehicle-dodavky",
                      },
                      {
                        key: "nakladni-vozy",
                        label: t("hero.trucks"),
                        img: truckGoldIcon,
                        testId: "button-mobile-vehicle-trucks",
                      },
                      {
                        key: "motorky",
                        label: t("hero.motorky"),
                        img: motorcycleIcon,
                        testId: "button-mobile-vehicle-motorky",
                      },
                    ].map((item) => {
                      const selected = selectedVehicleTypes.includes(item.key);

                      return (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => handleVehicleTypeToggle(item.key)}
                          className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg border-2 transition-colors hover-elevate active-elevate-2 ${
                            selected
                              ? "bg-primary text-primary-foreground border-primary-border"
                              : "bg-background border-input text-black dark:text-white"
                          }`}
                          data-testid={item.testId}
                        >
                          <ImgIcon
                            src={item.img}
                            alt={item.key}
                            className="w-8 h-8"
                          />
                          <span
                            className={`text-xs text-center leading-tight ${
                              !selected ? "text-black dark:text-white" : ""
                            }`}
                          >
                            {item.label}
                          </span>
                        </button>
                      );
                    })}

                    {bodyTypes.map((type) => {
                      const IconComponent = bodyTypeIcons[type.value] || Car;
                      const isSelected =
                        filters.bodyType?.includes(type.value) || false;

                      return (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => handleBodyTypeToggle(type.value)}
                          className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg border-2 transition-colors hover-elevate active-elevate-2 ${
                            isSelected
                              ? "bg-primary text-primary-foreground border-primary-border"
                              : "bg-background border-input text-black dark:text-white"
                          }`}
                          data-testid={`button-mobile-body-type-${type.value}`}
                        >
                          <IconComponent className="w-8 h-8" />
                          <span
                            className={`text-xs text-center leading-tight ${
                              !isSelected ? "text-black dark:text-white" : ""
                            }`}
                          >
                            {type.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* BASIC */}
              <Collapsible
                open={openSections.basic}
                onOpenChange={() => toggleSection("basic")}
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full py-2 hover-elevate rounded-xl px-3">
                  <h3 className="text-lg font-semibold">
                    {t("filters.basicFilters")}
                  </h3>
                  <ChevronDown
                    className={`h-5 w-5 transition-transform ${
                      openSections.basic ? "rotate-180" : ""
                    }`}
                  />
                </CollapsibleTrigger>

                <CollapsibleContent className="space-y-6 pt-4">
                  <div className="space-y-4">
                    <Label className="text-base font-medium">
                      {t("filters.brand")}
                    </Label>

                    <BrandCombobox
                      brands={filteredBrands}
                      value={filters.brand || ""}
                      onValueChange={setBrand}
                      placeholder={t("hero.allBrands")}
                      emptyMessage={t("hero.noBrandsFound")}
                      testId="select-mobile-filter-brand"
                    />
                  </div>

                  <div className="space-y-4">
                    <Label className="text-base font-medium">
                      {t("filters.model")}
                    </Label>

                    <ModelCombobox
                      models={availableModels}
                      value={filters.model || ""}
                      onValueChange={setModel}
                      disabled={!filters.brand}
                      placeholder={
                        filters.brand
                          ? t("hero.allModels")
                          : t("hero.selectBrand")
                      }
                      emptyMessage={t("hero.noModelsFound")}
                      testId="select-mobile-filter-model"
                    />
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* PRICE + YEAR */}
              <Collapsible
                open={openSections.price}
                onOpenChange={() => toggleSection("price")}
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full py-2 hover-elevate rounded-xl px-3">
                  <h3 className="text-lg font-semibold">
                    {t("filters.priceAndYear")}
                  </h3>
                  <ChevronDown
                    className={`h-5 w-5 transition-transform ${
                      openSections.price ? "rotate-180" : ""
                    }`}
                  />
                </CollapsibleTrigger>

                <CollapsibleContent className="space-y-6 pt-4">
                  <div className="space-y-4">
                    <Label className="text-base font-medium">
                      {t("filters.price")}
                    </Label>

                    <PriceRangeInput
                      minValue={priceMin}
                      maxValue={priceMax}
                      onMinChange={(value) =>
                        setPriceRange(value || 10000, priceMax)
                      }
                      onMaxChange={(value) =>
                        setPriceRange(priceMin, value || 20000000)
                      }
                      variant="mobile"
                      testIdPrefix="mobile-price"
                    />

                    <div className="flex items-center space-x-2 pt-2">
                      <Checkbox
                        id="mobile-vat-deductible"
                        checked={filters.vatDeductible || false}
                        onCheckedChange={(checked) =>
                          setFilters((prev) => ({
                            ...prev,
                            vatDeductible: checked === true ? true : undefined,
                          }))
                        }
                        data-testid="checkbox-mobile-vat-deductible"
                      />
                      <label
                        htmlFor="mobile-vat-deductible"
                        className="text-sm font-medium cursor-pointer text-black dark:text-white"
                      >
                        {t("filters.vatDeductible")}
                      </label>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-base font-medium">
                      {t("filters.mileage")}
                    </Label>

                    <MileageRangeInput
                      minValue={mileageMin}
                      maxValue={mileageMax}
                      onMinChange={(value) =>
                        setMileageRange(value, mileageMax)
                      }
                      onMaxChange={(value) =>
                        setMileageRange(mileageMin, value)
                      }
                      variant="mobile"
                      testIdPrefix="mobile-mileage"
                    />
                  </div>

                  <div className="space-y-4">
                    <Label className="text-base font-medium">
                      {t("filters.yearOfManufacture")}
                    </Label>

                    <YearRangeInput
                      minValue={yearMin}
                      maxValue={yearMax}
                      onMinChange={(value) => setYearRange(value, yearMax)}
                      onMaxChange={(value) => setYearRange(yearMin, value)}
                      variant="mobile"
                      testIdPrefix="mobile-year"
                    />
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* TECHNICAL */}
              <Collapsible
                open={openSections.technical}
                onOpenChange={() => toggleSection("technical")}
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full py-2 hover-elevate rounded-xl px-3">
                  <h3 className="text-lg font-semibold">
                    {t("filters.technicalParams")}
                  </h3>
                  <ChevronDown
                    className={`h-5 w-5 transition-transform ${
                      openSections.technical ? "rotate-180" : ""
                    }`}
                  />
                </CollapsibleTrigger>

                <CollapsibleContent className="space-y-6 pt-4">
                  <div className="space-y-4">
                    <Label className="text-base font-medium">
                      {t("filters.engineVolume")}
                    </Label>
                    <EngineRangeInput
                      minValue={engineMin}
                      maxValue={engineMax}
                      onMinChange={(value) => setEngineRange(value, engineMax)}
                      onMaxChange={(value) => setEngineRange(engineMin, value)}
                      variant="mobile"
                      testIdPrefix="mobile-engine"
                    />
                  </div>

                  <div className="space-y-4">
                    <Label className="text-base font-medium">
                      {t("filters.power")}
                    </Label>
                    <PowerRangeInput
                      minValue={powerMin}
                      maxValue={powerMax}
                      onMinChange={(value) => setPowerRange(value, powerMax)}
                      onMaxChange={(value) => setPowerRange(powerMin, value)}
                      variant="mobile"
                      testIdPrefix="mobile-power"
                    />
                  </div>

                  {/* FUEL */}
                  <div className="space-y-4">
                    <Label className="text-base font-medium">
                      {t("filters.fuelType")}
                    </Label>

                    <div className="space-y-3">
                      {[
                        { label: t("hero.benzin"), key: "benzin" },
                        { label: t("hero.diesel"), key: "diesel" },
                        { label: t("hero.hybrid"), key: "hybrid" },
                        { label: t("hero.electric"), key: "electric" },
                        { label: t("hero.lpg"), key: "lpg" },
                        { label: t("hero.cng"), key: "cng" },
                      ].map((fuel) => {
                        const checked = splitComma(filters.fuel).includes(
                          fuel.key,
                        );
                        return (
                          <div
                            key={fuel.key}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`mobile-fuel-${fuel.key}`}
                              checked={checked}
                              onCheckedChange={() => handleFuelToggle(fuel.key)}
                              data-testid={`checkbox-mobile-fuel-${fuel.key}`}
                            />
                            <label
                              htmlFor={`mobile-fuel-${fuel.key}`}
                              className="text-sm font-medium cursor-pointer text-black dark:text-white"
                            >
                              {fuel.label}
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* TRANSMISSION */}
                  <div className="space-y-4">
                    <Label className="text-base font-medium">
                      {t("filters.transmission")}
                    </Label>

                    <div className="space-y-3">
                      {[
                        {
                          label: t("filters.manual"),
                          key: "manual",
                          icon: CircleDot,
                        },
                        {
                          label: t("filters.automatic"),
                          key: "automatic",
                          icon: Zap,
                        },
                        { label: t("filters.robot"), key: "robot", icon: Bot },
                        { label: t("filters.cvt"), key: "cvt", icon: Activity },
                      ].map((tr) => {
                        const Icon = tr.icon;
                        const checked = splitComma(
                          filters.transmission,
                        ).includes(tr.key);

                        return (
                          <div
                            key={tr.key}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`mobile-trans-${tr.key}`}
                              checked={checked}
                              onCheckedChange={() =>
                                handleTransmissionToggle(tr.key)
                              }
                              data-testid={`checkbox-mobile-transmission-${tr.key}`}
                            />
                            <label
                              htmlFor={`mobile-trans-${tr.key}`}
                              className="text-sm font-medium cursor-pointer text-black dark:text-white flex items-center gap-2"
                            >
                              <Icon className="w-4 h-4 text-[#B8860B]" />
                              <span>{tr.label}</span>
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* DRIVE */}
                  <div className="space-y-4">
                    <Label className="text-base font-medium">
                      {t("filters.driveType")}
                    </Label>

                    <div className="space-y-3">
                      {driveTypes.map((drive) => {
                        const icons: Record<string, any> = {
                          fwd: ArrowUp,
                          rwd: ArrowDown,
                          awd: Grid3x3,
                          "4wd": Compass,
                        };
                        const Icon = icons[drive.value];
                        const checked = splitComma(filters.driveType).includes(
                          drive.value,
                        );

                        return (
                          <div
                            key={drive.value}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`mobile-drive-${drive.value}`}
                              checked={checked}
                              onCheckedChange={() =>
                                handleDriveToggle(drive.value)
                              }
                              data-testid={`checkbox-mobile-drive-${drive.value}`}
                            />
                            <label
                              htmlFor={`mobile-drive-${drive.value}`}
                              className="text-sm font-medium cursor-pointer text-black dark:text-white flex items-center gap-2"
                            >
                              {Icon ? (
                                <Icon className="w-4 h-4 text-[#B8860B]" />
                              ) : null}
                              <span>{drive.label}</span>
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* OWNERS */}
                  <div className="space-y-4">
                    <Label className="text-base font-medium">
                      {t("filters.owners")}
                    </Label>

                    <OwnersRangeInput
                      minValue={ownersMin}
                      maxValue={ownersMax}
                      onMinChange={(value) => setOwnersRange(value, ownersMax)}
                      onMaxChange={(value) => setOwnersRange(ownersMin, value)}
                      variant="mobile"
                      testIdPrefix="mobile-owners"
                    />
                  </div>

                  {/* SELLER TYPE */}
                  <div className="space-y-4">
                    <Label className="text-base font-medium">
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
                      ].map((opt) => {
                        const selected = filters.sellerType === opt.key;
                        return (
                          <Button
                            key={opt.key}
                            type="button"
                            variant={selected ? "default" : "outline"}
                            className={`h-auto py-2 px-3 text-xs ${
                              !selected ? "text-black dark:text-white" : ""
                            } ${selected ? "toggle-elevated" : ""} toggle-elevate`}
                            onClick={() =>
                              setSellerType(selected ? "" : opt.key)
                            }
                            data-testid={`button-mobile-seller-${opt.key}`}
                          >
                            {opt.label}
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  {/* LISTING AGE */}
                  <div className="space-y-4">
                    <Label className="text-base font-medium">
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
                      variant="mobile"
                      testIdPrefix="mobile-listing-age"
                    />
                  </div>

                  {/* EURO */}
                  <div className="space-y-4">
                    <Label className="text-base font-medium">
                      {t("filters.euroEmission")}
                    </Label>

                    <Select
                      value={filters.euroEmission || "all"}
                      onValueChange={(value) =>
                        setEuroEmission(value === "all" ? "" : value)
                      }
                    >
                      <SelectTrigger
                        className="h-12 rounded-xl text-black dark:text-white"
                        data-testid="select-mobile-filter-euro-emission"
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
                        {[
                          "euro1",
                          "euro2",
                          "euro3",
                          "euro4",
                          "euro5",
                          "euro6",
                          "euro6d",
                        ].map((v) => (
                          <SelectItem
                            key={v}
                            value={v}
                            className="text-black dark:text-white"
                          >
                            {t(`filters.${v}` as any)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* STK */}
                  <div className="space-y-4">
                    <Label className="text-base font-medium">
                      {t("filters.stkValidUntil")}
                    </Label>

                    <MonthPicker
                      value={filters.stkValidUntil || ""}
                      onChange={(value) => setStkValidUntil(value)}
                      data-testid="input-mobile-stk-valid"
                    />
                  </div>

                  {/* SERVICE BOOK */}
                  <div className="flex items-center space-x-2 py-2">
                    <Checkbox
                      id="mobile-filter-has-service-book"
                      checked={filters.hasServiceBook || false}
                      onCheckedChange={(checked) =>
                        setHasServiceBook(!!checked)
                      }
                      data-testid="checkbox-mobile-filter-service-book"
                    />
                    <label
                      htmlFor="mobile-filter-has-service-book"
                      className="text-sm font-medium cursor-pointer text-black dark:text-white"
                    >
                      {t("filters.hasServiceBook")}
                    </label>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* APPEARANCE */}
              <Collapsible
                open={openSections.appearance}
                onOpenChange={() => toggleSection("appearance")}
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full py-2 hover-elevate rounded-xl px-3">
                  <h3 className="text-lg font-semibold">
                    {t("filters.appearance")}
                  </h3>
                  <ChevronDown
                    className={`h-5 w-5 transition-transform ${
                      openSections.appearance ? "rotate-180" : ""
                    }`}
                  />
                </CollapsibleTrigger>

                <CollapsibleContent className="space-y-6 pt-4">
                  {/* COLOR */}
                  <div className="space-y-4">
                    <Label className="text-base font-medium">
                      {t("filters.color")}
                    </Label>

                    <Select
                      value={filters.color || "all"}
                      onValueChange={(value) =>
                        setColor(value === "all" ? "" : value)
                      }
                    >
                      <SelectTrigger
                        className="h-12 rounded-xl text-black dark:text-white"
                        data-testid="select-mobile-filter-color"
                      >
                        <SelectValue placeholder={t("filters.allColors")} />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem
                          value="all"
                          className="text-black dark:text-white"
                        >
                          {t("filters.allColors")}
                        </SelectItem>

                        {colors.map((c) => (
                          <SelectItem
                            key={c.value}
                            value={c.value}
                            className="text-black dark:text-white"
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600 flex-shrink-0"
                                style={{
                                  backgroundColor: c.hex,
                                  boxShadow:
                                    c.value === "white" || c.value === "ivory"
                                      ? "inset 0 0 0 1px rgba(0,0,0,0.1)"
                                      : "none",
                                }}
                              />
                              <span>{c.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* DOORS */}
                  <div className="space-y-4">
                    <Label className="text-base font-medium">
                      {t("filters.doors")}
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        min="2"
                        max="6"
                        placeholder={t("hero.from")}
                        value={filters.doorsMin ?? ""}
                        onChange={(e) => {
                          const v = e.target.value
                            ? Number(e.target.value)
                            : undefined;
                          setDoorsRange(v, filters.doorsMax);
                        }}
                        className="h-10 text-black dark:text-white"
                        data-testid="input-mobile-doors-min"
                      />
                      <Input
                        type="number"
                        min="2"
                        max="6"
                        placeholder={t("hero.to")}
                        value={filters.doorsMax ?? ""}
                        onChange={(e) => {
                          const v = e.target.value
                            ? Number(e.target.value)
                            : undefined;
                          setDoorsRange(filters.doorsMin, v);
                        }}
                        className="h-10 text-black dark:text-white"
                        data-testid="input-mobile-doors-max"
                      />
                    </div>
                  </div>

                  {/* SEATS */}
                  <div className="space-y-4">
                    <Label className="text-base font-medium">
                      {t("filters.seats")}
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        min="2"
                        max="9"
                        placeholder={t("hero.from")}
                        value={filters.seatsMin ?? ""}
                        onChange={(e) => {
                          const v = e.target.value
                            ? Number(e.target.value)
                            : undefined;
                          setSeatsRange(v, filters.seatsMax);
                        }}
                        className="h-10 text-black dark:text-white"
                        data-testid="input-mobile-seats-min"
                      />
                      <Input
                        type="number"
                        min="2"
                        max="9"
                        placeholder={t("hero.to")}
                        value={filters.seatsMax ?? ""}
                        onChange={(e) => {
                          const v = e.target.value
                            ? Number(e.target.value)
                            : undefined;
                          setSeatsRange(filters.seatsMin, v);
                        }}
                        className="h-10 text-black dark:text-white"
                        data-testid="input-mobile-seats-max"
                      />
                    </div>
                  </div>

                  {/* TRIM */}
                  <div className="space-y-4">
                    <Label className="text-base font-medium">
                      {t("filters.trim")}
                    </Label>

                    <Input
                      value={filters.trim || ""}
                      onChange={(e) => setTrim(e.target.value)}
                      placeholder={t("filters.allTrims")}
                      className="h-10 text-black dark:text-white"
                      data-testid="input-mobile-trim"
                    />
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* EQUIPMENT */}
              <Collapsible
                open={openSections.equipment}
                onOpenChange={() => toggleSection("equipment")}
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full py-2 hover-elevate rounded-xl px-3">
                  <h3 className="text-lg font-semibold">
                    {t("filters.equipment")}
                  </h3>
                  <ChevronDown
                    className={`h-5 w-5 transition-transform ${
                      openSections.equipment ? "rotate-180" : ""
                    }`}
                  />
                </CollapsibleTrigger>

                <CollapsibleContent className="space-y-6 pt-4">
                  <div className="space-y-3">
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
                        label: t("filters.panoramicRoof"),
                        key: "panoramic-roof",
                      },
                      { label: t("filters.towHitch"), key: "tow-hitch" },
                    ].map((item) => (
                      <div
                        key={item.key}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`mobile-equipment-${item.key}`}
                          checked={
                            filters.equipment?.includes(item.key) || false
                          }
                          onCheckedChange={() =>
                            handleEquipmentToggle(item.key)
                          }
                          data-testid={`checkbox-mobile-equipment-${item.key}`}
                        />
                        <label
                          htmlFor={`mobile-equipment-${item.key}`}
                          className="text-sm font-medium cursor-pointer text-black dark:text-white"
                        >
                          {item.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* EXTRAS */}
              <Collapsible
                open={openSections.extras}
                onOpenChange={() => toggleSection("extras")}
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full py-2 hover-elevate rounded-xl px-3">
                  <h3 className="text-lg font-semibold">
                    {t("filters.additionalOptions")}
                  </h3>
                  <ChevronDown
                    className={`h-5 w-5 transition-transform ${
                      openSections.extras ? "rotate-180" : ""
                    }`}
                  />
                </CollapsibleTrigger>

                <CollapsibleContent className="space-y-6 pt-4">
                  <div className="space-y-3">
                    {[
                      {
                        label: t("filters.serviceBook"),
                        key: "Servisní knížka",
                      },
                      { label: t("filters.notDamaged"), key: "Nepoškozený" },
                      { label: t("filters.notPainted"), key: "Nelakovaný" },
                      { label: t("filters.warranty"), key: "Záruka" },
                      { label: t("filters.exchange"), key: "Výměna" },
                    ].map((item) => (
                      <div
                        key={item.key}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`mobile-extra-${item.key}`}
                          checked={filters.extras?.includes(item.key) || false}
                          onCheckedChange={() => handleExtrasToggle(item.key)}
                          data-testid={`checkbox-mobile-extra-${item.key
                            .toLowerCase()
                            .replace(/\s+/g, "-")}`}
                        />
                        <label
                          htmlFor={`mobile-extra-${item.key}`}
                          className="text-sm font-medium cursor-pointer text-black dark:text-white"
                        >
                          {item.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* REGION */}
              <Collapsible
                open={openSections.region}
                onOpenChange={() => toggleSection("region")}
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full py-2 hover-elevate rounded-xl px-3">
                  <h3 className="text-lg font-semibold">
                    {t("filters.region")}
                  </h3>
                  <ChevronDown
                    className={`h-5 w-5 transition-transform ${
                      openSections.region ? "rotate-180" : ""
                    }`}
                  />
                </CollapsibleTrigger>

                <CollapsibleContent className="space-y-6 pt-4">
                  <RegionCombobox
                    value={filters.region || ""}
                    onValueChange={setRegion}
                    regions={regions}
                    placeholder={t("filters.allRegions")}
                    emptyMessage={t("hero.noRegionsFound")}
                    testId="select-mobile-filter-region"
                  />
                </CollapsibleContent>
              </Collapsible>
            </div>
          </ScrollArea>
          {/* <DrawerFooter className="border-t pt-4 sticky bottom-0 bg-background pb-[calc(env(safe-area-inset-bottom)+12px)]">
            <DrawerClose asChild>
              <Button
                className="w-full h-12 rounded-xl shadow-md"
                data-testid="button-close-mobile-filters-bottom"
              >
                {t("filters.close")}
              </Button>
            </DrawerClose>
          </DrawerFooter> */}
          <DrawerFooter className="border-t pt-4 bg-background mt-auto pb-0 shrink-0">
            <DrawerClose asChild>
              <Button className="w-full h-12 rounded-xl shadow-md">
                {t("filters.close")}
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export default memo(MobileFilters);
