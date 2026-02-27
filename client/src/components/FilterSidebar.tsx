// // import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// // import { Label } from "@/components/ui/label";
// // import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// // import { Slider } from "@/components/ui/slider";
// // import { Checkbox } from "@/components/ui/checkbox";
// // import { Button } from "@/components/ui/button";
// // import { Input } from "@/components/ui/input";
// // import { MonthPicker } from "@/components/ui/month-picker";
// // import { ScrollArea } from "@/components/ui/scroll-area";
// // import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
// // import { ChevronDown, Sparkles, Car, Package, Wrench, CircleDot, Zap, Bot, Activity, ArrowUp, ArrowDown, Grid3x3, Compass, Key } from "lucide-react";
// // import { useState, useEffect, memo } from "react";
// // import { carBrands, carModels } from "@shared/carDatabase";
// // import { useLanguage } from "@/contexts/LanguageContext";
// // import newCarIcon from "@assets/3AAF8DD0-3B6D-4DA3-8A1E-2858FCC004A1_1763451350424.png";
// // import partsIcon from "@assets/62A9ABBD-0474-469C-8089-FA93C3E7C2B4_1763450942216.png";
// // import usedCarIcon from "@assets/ABAF6CAB-50AC-450D-8FE8-342C0DF354D6_1763451176037.png";
// // import orderCarIcon from "@assets/A6BE7880-928D-4532-BCB1-3FA4A34F89CE_1763451456108.png";
// // import motorcycleIcon from "@assets/44AD800C-C9BB-4F50-A278-5152E01D60BB_1763444856175.png";
// // import truckGoldIcon from "@assets/8C9B6F5F-55BC-402E-9359-B2707FE2FB81_1763444987490.png";
// // import carGoldIcon from "@assets/D545620E-B7EF-4EB5-AE03-389B4725412B_1763449648396.png";
// // import vanIcon from "@assets/4E8B9722-D061-47D3-9C2F-2C8C1070F01B_1763443339270.png";
// // import { useFilterParams } from "@/hooks/useFilterParams";
// // import { useTranslation, useLocalizedOptions, vehicleTypeBrands, getModelsForVehicleType } from "@/lib/translations";
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

// // function FilterSidebar() {
// //   const t = useTranslation();
// //   const localizedOptions = useLocalizedOptions();
// //   const { language } = useLanguage();

// //   const colors = localizedOptions.getColors();
// //   const driveTypes = localizedOptions.getDriveTypes();
// //   const regions = localizedOptions.getRegions();
// //   const { filters, setFilters, setCategory, setBrand, setModel, setPriceRange, setYearRange, setMileageRange, setEngineRange, setPowerRange, setDoorsRange, setSeatsRange, setOwnersRange, setSellerType, setListingAgeRange, setTrim, setCondition, setEquipment, setRegion, setColor, setFuel, setTransmission, setDriveType, setBodyType, setVehicleType, setEuroEmission, setStkValidUntil, setHasServiceBook, resetFilters, applyFilters } = useFilterParams();

// //   const bodyTypes = localizedOptions.getBodyTypes();

// //   const trimLevels = [
// //     { value: "base", label: t("trims.base") },
// //     { value: "classic", label: t("trims.classic") },
// //     { value: "standard", label: t("trims.standard") },
// //     { value: "comfort", label: t("trims.comfort") },
// //     { value: "ambition", label: t("trims.ambition") },
// //     { value: "style", label: t("trims.style") },
// //     { value: "sport", label: t("trims.sport") },
// //     { value: "luxury", label: t("trims.luxury") },
// //     { value: "premium", label: t("trims.premium") },
// //     { value: "executive", label: t("trims.executive") },
// //     { value: "performance", label: t("trims.performance") },
// //     { value: "limited", label: t("trims.limited") },
// //     { value: "special", label: t("trims.special") },
// //     { value: "gt", label: "GT" },
// //     { value: "rs", label: "RS" },
// //     { value: "m-sport", label: "M Sport" },
// //     { value: "amg", label: "AMG" },
// //     { value: "quattro", label: "Quattro" },
// //     { value: "4motion", label: "4Motion" },
// //     { value: "xdrive", label: "xDrive" },
// //     { value: "raptor", label: "Raptor" },
// //   ];

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
// //     console.log("Filters reset");
// //   };

// //   const handleApply = () => {
// //     applyFilters();
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

// //   return (
// //     <Card className="sticky top-24 rounded-2xl shadow-xl">
// //       <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-6">
// //         <CardTitle className="text-xl font-semibold truncate">{t("filters.title")}</CardTitle>
// //         <Button variant="ghost" size="sm" className="rounded-xl shrink-0" onClick={handleReset} data-testid="button-reset-filters">
// //           {t("filters.reset")}
// //         </Button>
// //       </CardHeader>
// //       <ScrollArea className="h-[calc(100vh-200px)]">
// //         <CardContent className="space-y-6 pr-6">
// //           <Collapsible open={openSections.condition} onOpenChange={() => toggleSection('condition')}>
// //             <CollapsibleTrigger className="flex items-center justify-between gap-2 w-full py-2 hover-elevate rounded-xl px-3">
// //               <h3 className="text-lg font-semibold truncate">{t("filters.conditionAndOwners")}</h3>
// //               <ChevronDown className={`h-5 w-5 shrink-0 transition-transform ${openSections.condition ? 'rotate-180' : ''}`} />
// //             </CollapsibleTrigger>
// //             <CollapsibleContent className="space-y-6 pt-4">
// //               <div className="space-y-4">
// //                 <div className="grid grid-cols-2 gap-3">
// //                   {[
// //                     { label: t("filters.conditionNew"), key: "Nové", icon: Sparkles, customIcon: NewCarIcon },
// //                     { label: t("filters.conditionUsed"), key: "Ojeté", icon: Car, customIcon: UsedCarIcon },
// //                     { label: t("filters.conditionOrder"), key: "Na objednávku", icon: Package, customIcon: OrderCarIcon },
// //                     { label: t("filters.conditionParts"), key: "Na náhradní díly", icon: Wrench, customIcon: PartsIcon },
// //                     ...(showAllConditions ? [
// //                       { label: t("filters.conditionRental"), key: "Pronájem", icon: Key, customIcon: null },
// //                       { label: t("filters.conditionDamaged"), key: "Havarované", icon: Wrench, customIcon: null },
// //                       { label: t("filters.conditionHistoric"), key: "Historické", icon: Sparkles, customIcon: null }
// //                     ] : [])
// //                   ].map((condition) => {
// //                     const isSelected = filters.condition?.includes(condition.key) || false;
// //                     const Icon = condition.icon;
// //                     const CustomIcon = condition.customIcon;
// //                     return (
// //                       <Button
// //                         key={condition.key}
// //                         type="button"
// //                         variant={isSelected ? "default" : "outline"}
// //                         className={`h-auto py-3 px-4 flex flex-col items-center gap-2 text-center ${isSelected ? 'toggle-elevated' : ''} toggle-elevate`}
// //                         onClick={() => handleConditionChange(condition.key)}
// //                         data-testid={`button-condition-${condition.key.toLowerCase().replace(/\s+/g, '-')}`}
// //                       >
// //                         {CustomIcon ? (
// //                           <CustomIcon className="h-10 w-10" />
// //                         ) : (
// //                           <Icon className="h-7 w-7 text-[#B8860B]" />
// //                         )}
// //                         <span className="text-xs font-medium leading-tight text-black dark:text-white">{condition.label}</span>
// //                       </Button>
// //                     );
// //                   })}
// //                   <Button
// //                     type="button"
// //                     variant="ghost"
// //                     className="col-span-2 h-auto py-2 flex items-center justify-center gap-2"
// //                     onClick={() => setShowAllConditions(!showAllConditions)}
// //                     data-testid="button-toggle-conditions"
// //                   >
// //                     <span className="text-sm font-medium text-[#B8860B]">
// //                       {showAllConditions ? t("filters.showLess") : t("filters.showMore")}
// //                     </span>
// //                     <ChevronDown className={`h-4 w-4 text-[#B8860B] transition-transform ${showAllConditions ? 'rotate-180' : ''}`} />
// //                   </Button>
// //                 </div>
// //               </div>
// //             </CollapsibleContent>
// //           </Collapsible>

// //           <Collapsible open={openSections.vehicleType} onOpenChange={() => toggleSection('vehicleType')}>
// //             <CollapsibleTrigger className="flex items-center justify-between gap-2 w-full py-2 hover-elevate rounded-xl px-3">
// //               <h3 className="text-lg font-semibold truncate">{t("listing.vehicleType")} / {t("filters.bodyType")}</h3>
// //               <ChevronDown className={`h-5 w-5 shrink-0 transition-transform ${openSections.vehicleType ? 'rotate-180' : ''}`} />
// //             </CollapsibleTrigger>
// //             <CollapsibleContent className="space-y-6 pt-4">
// //               <div className="space-y-4">
// //                 <div className="grid grid-cols-3 gap-2">
// //                   <button
// //                     type="button"
// //                     onClick={() => {
// //                       const currentTypes = filters.vehicleType ? filters.vehicleType.split(',').filter(Boolean) : [];
// //                       const isSelected = currentTypes.includes("osobni-auta");
// //                       const newTypes = isSelected
// //                         ? currentTypes.filter(t => t !== "osobni-auta")
// //                         : [...currentTypes, "osobni-auta"];
// //                       setFilters(prev => ({ ...prev, vehicleType: newTypes.join(',') || "", bodyType: undefined }));
// //                     }}
// //                     className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg border-2 transition-colors hover-elevate active-elevate-2 ${
// //                       filters.vehicleType?.split(',').includes("osobni-auta")
// //                         ? "bg-primary text-primary-foreground border-primary-border"
// //                         : "bg-background border-input text-black dark:text-white"
// //                     }`}
// //                     data-testid="button-sidebar-vehicle-cars"
// //                   >
// //                     <CarGoldIcon className="w-8 h-8" />
// //                     <span className={`text-xs text-center leading-tight ${!filters.vehicleType?.split(',').includes("osobni-auta") ? 'text-black dark:text-white' : ''}`}>{t("hero.cars")}</span>
// //                   </button>
// //                   <button
// //                     type="button"
// //                     onClick={() => {
// //                       const currentTypes = filters.vehicleType ? filters.vehicleType.split(',').filter(Boolean) : [];
// //                       const isSelected = currentTypes.includes("dodavky");
// //                       const newTypes = isSelected
// //                         ? currentTypes.filter(t => t !== "dodavky")
// //                         : [...currentTypes, "dodavky"];
// //                       setFilters(prev => ({ ...prev, vehicleType: newTypes.join(',') || "", bodyType: undefined }));
// //                     }}
// //                     className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg border-2 transition-colors hover-elevate active-elevate-2 ${
// //                       filters.vehicleType?.split(',').includes("dodavky")
// //                         ? "bg-primary text-primary-foreground border-primary-border"
// //                         : "bg-background border-input text-black dark:text-white"
// //                     }`}
// //                     data-testid="button-sidebar-vehicle-dodavky"
// //                   >
// //                     <VanGoldIcon className="w-8 h-8" />
// //                     <span className={`text-xs text-center leading-tight ${!filters.vehicleType?.split(',').includes("dodavky") ? 'text-black dark:text-white' : ''}`}>{t("hero.dodavky")}</span>
// //                   </button>
// //                   <button
// //                     type="button"
// //                     onClick={() => {
// //                       const currentTypes = filters.vehicleType ? filters.vehicleType.split(',').filter(Boolean) : [];
// //                       const isSelected = currentTypes.includes("nakladni-vozy");
// //                       const newTypes = isSelected
// //                         ? currentTypes.filter(t => t !== "nakladni-vozy")
// //                         : [...currentTypes, "nakladni-vozy"];
// //                       setFilters(prev => ({ ...prev, vehicleType: newTypes.join(',') || "", bodyType: undefined }));
// //                     }}
// //                     className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg border-2 transition-colors hover-elevate active-elevate-2 ${
// //                       filters.vehicleType?.split(',').includes("nakladni-vozy")
// //                         ? "bg-primary text-primary-foreground border-primary-border"
// //                         : "bg-background border-input text-black dark:text-white"
// //                     }`}
// //                     data-testid="button-sidebar-vehicle-trucks"
// //                   >
// //                     <TruckGoldIcon className="w-8 h-8" />
// //                     <span className={`text-xs text-center leading-tight ${!filters.vehicleType?.split(',').includes("nakladni-vozy") ? 'text-black dark:text-white' : ''}`}>{t("hero.trucks")}</span>
// //                   </button>
// //                   <button
// //                     type="button"
// //                     onClick={() => {
// //                       const currentTypes = filters.vehicleType ? filters.vehicleType.split(',').filter(Boolean) : [];
// //                       const isSelected = currentTypes.includes("motorky");
// //                       const newTypes = isSelected
// //                         ? currentTypes.filter(t => t !== "motorky")
// //                         : [...currentTypes, "motorky"];
// //                       setFilters(prev => ({ ...prev, vehicleType: newTypes.join(',') || "", bodyType: undefined }));
// //                     }}
// //                     className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg border-2 transition-colors hover-elevate active-elevate-2 ${
// //                       filters.vehicleType?.split(',').includes("motorky")
// //                         ? "bg-primary text-primary-foreground border-primary-border"
// //                         : "bg-background border-input text-black dark:text-white"
// //                     }`}
// //                     data-testid="button-sidebar-vehicle-motorky"
// //                   >
// //                     <MotorcycleIcon className="w-8 h-8" />
// //                     <span className={`text-xs text-center leading-tight ${!filters.vehicleType?.split(',').includes("motorky") ? 'text-black dark:text-white' : ''}`}>{t("hero.motorky")}</span>
// //                   </button>
// //                   {bodyTypes.map((type) => {
// //                     const IconComponent = bodyTypeIcons[type.value] || Car;
// //                     const isSelected = filters.bodyType?.includes(type.value) || false;
// //                     return (
// //                       <button
// //                         key={type.value}
// //                         type="button"
// //                         onClick={() => {
// //                           setFilters(prev => {
// //                             const current = prev.bodyType || [];
// //                             const alreadySelected = current.includes(type.value);
// //                             const newBodyType = alreadySelected
// //                               ? current.filter(v => v !== type.value)
// //                               : [...current, type.value];
// //                             return {
// //                               ...prev,
// //                               vehicleType: newBodyType.length > 0 ? "osobni-auta" : prev.vehicleType,
// //                               bodyType: newBodyType.length > 0 ? newBodyType : undefined
// //                             };
// //                           });
// //                         }}
// //                         className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg border-2 transition-colors hover-elevate active-elevate-2 ${
// //                           isSelected
// //                             ? "bg-primary text-primary-foreground border-primary-border"
// //                             : "bg-background border-input text-black dark:text-white"
// //                         }`}
// //                         data-testid={`button-sidebar-body-type-${type.value}`}
// //                       >
// //                         <IconComponent className="w-8 h-8" />
// //                         <span className={`text-xs text-center leading-tight ${!isSelected ? 'text-black dark:text-white' : ''}`}>{type.label}</span>
// //                       </button>
// //                     );
// //                   })}
// //                 </div>
// //               </div>
// //             </CollapsibleContent>
// //           </Collapsible>

// //           <Collapsible open={openSections.basic} onOpenChange={() => toggleSection('basic')}>
// //             <CollapsibleTrigger className="flex items-center justify-between gap-2 w-full py-2 hover-elevate rounded-xl px-3">
// //               <h3 className="text-lg font-semibold truncate">{t("filters.basicFilters")}</h3>
// //               <ChevronDown className={`h-5 w-5 shrink-0 transition-transform ${openSections.basic ? 'rotate-180' : ''}`} />
// //             </CollapsibleTrigger>
// //             <CollapsibleContent className="space-y-6 pt-4">
// //               <div className="space-y-4">
// //                 <Label className="text-base font-medium">{t("filters.brand")}</Label>
// //                 <BrandCombobox
// //                   brands={carBrands
// //                     .filter(brand => {
// //                       if (filters.vehicleType && vehicleTypeBrands[filters.vehicleType]) {
// //                         return vehicleTypeBrands[filters.vehicleType].includes(brand.value);
// //                       }
// //                       return true;
// //                     })
// //                     .map(brand => ({
// //                       ...brand,
// //                       icon: brandIcons[brand.value]
// //                     }))}
// //                   value={filters.brand || ""}
// //                   onValueChange={setBrand}
// //                   placeholder={t("hero.allBrands")}
// //                   emptyMessage={t("hero.noBrandsFound")}
// //                   testId="select-filter-brand"
// //                 />
// //               </div>

// //               <div className="space-y-4">
// //                 <Label className="text-base font-medium">{t("filters.model")}</Label>
// //                 <ModelCombobox
// //                   models={availableModels}
// //                   value={filters.model || ""}
// //                   onValueChange={setModel}
// //                   disabled={!filters.brand}
// //                   placeholder={filters.brand ? t("hero.allModels") : t("hero.selectBrand")}
// //                   emptyMessage={t("hero.noModelsFound")}
// //                   testId="select-filter-model"
// //                 />
// //               </div>
// //             </CollapsibleContent>
// //           </Collapsible>

// //         <Collapsible open={openSections.price} onOpenChange={() => toggleSection('price')}>
// //             <CollapsibleTrigger className="flex items-center justify-between gap-2 w-full py-2 hover-elevate rounded-xl px-3">
// //               <h3 className="text-lg font-semibold truncate">{t("filters.priceAndYear")}</h3>
// //               <ChevronDown className={`h-5 w-5 shrink-0 transition-transform ${openSections.price ? 'rotate-180' : ''}`} />
// //             </CollapsibleTrigger>
// //             <CollapsibleContent className="space-y-6 pt-4">
// //               <div className="space-y-4">
// //                 <Label className="text-base font-medium">{t("filters.price")}</Label>
// //                 <PriceRangeInput
// //                   minValue={filters.priceMin}
// //                   maxValue={filters.priceMax}
// //                   onMinChange={(value) => setPriceRange(value || 10000, filters.priceMax || 20000000)}
// //                   onMaxChange={(value) => setPriceRange(filters.priceMin || 10000, value || 20000000)}
// //                   variant="sidebar"
// //                   testIdPrefix="sidebar-price"
// //                 />
// //                 <div className="flex items-center space-x-2 pt-2">
// //                   <Checkbox
// //                     id="sidebar-vat-deductible"
// //                     checked={filters.vatDeductible || false}
// //                     onCheckedChange={(checked) => setFilters(prev => ({ ...prev, vatDeductible: checked === true ? true : undefined }))}
// //                     data-testid="checkbox-sidebar-vat-deductible"
// //                   />
// //                   <label
// //                     htmlFor="sidebar-vat-deductible"
// //                     className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-black dark:text-white"
// //                   >
// //                     {t("filters.vatDeductible")}
// //                   </label>
// //                 </div>
// //               </div>

// //               <div className="space-y-4">
// //                 <Label className="text-base font-medium">{t("filters.mileage")}</Label>
// //                 <MileageRangeInput
// //                   minValue={mileageMin}
// //                   maxValue={mileageMax}
// //                   onMinChange={(value) => setMileageRange(value, mileageMax)}
// //                   onMaxChange={(value) => setMileageRange(mileageMin, value)}
// //                   variant="sidebar"
// //                   testIdPrefix="sidebar-mileage"
// //                 />
// //               </div>

// //               <div className="space-y-4">
// //                 <Label className="text-base font-medium">{t("filters.yearOfManufacture")}</Label>
// //                 <YearRangeInput
// //                   minValue={yearMin}
// //                   maxValue={yearMax}
// //                   onMinChange={(value) => setYearRange(value, yearMax)}
// //                   onMaxChange={(value) => setYearRange(yearMin, value)}
// //                   variant="sidebar"
// //                   testIdPrefix="sidebar-year"
// //                 />
// //               </div>
// //             </CollapsibleContent>
// //           </Collapsible>

// //         <Collapsible open={openSections.technical} onOpenChange={() => toggleSection('technical')}>
// //             <CollapsibleTrigger className="flex items-center justify-between gap-2 w-full py-2 hover-elevate rounded-xl px-3">
// //               <h3 className="text-lg font-semibold truncate">{t("filters.technicalParams")}</h3>
// //               <ChevronDown className={`h-5 w-5 shrink-0 transition-transform ${openSections.technical ? 'rotate-180' : ''}`} />
// //             </CollapsibleTrigger>
// //             <CollapsibleContent className="space-y-6 pt-4">
// //               <div className="space-y-4">
// //                 <Label className="text-base font-medium">{t("filters.engineVolume")}</Label>
// //                 <EngineRangeInput
// //                   minValue={engineMin}
// //                   maxValue={engineMax}
// //                   onMinChange={(value) => setEngineRange(value, engineMax)}
// //                   onMaxChange={(value) => setEngineRange(engineMin, value)}
// //                   variant="sidebar"
// //                   testIdPrefix="sidebar-engine"
// //                 />
// //               </div>

// //               <div className="space-y-4">
// //                 <Label className="text-base font-medium">{t("filters.power")}</Label>
// //                 <PowerRangeInput
// //                   minValue={powerMin}
// //                   maxValue={powerMax}
// //                   onMinChange={(value) => setPowerRange(value, powerMax)}
// //                   onMaxChange={(value) => setPowerRange(powerMin, value)}
// //                   variant="sidebar"
// //                   testIdPrefix="sidebar-power"
// //                 />
// //               </div>

// //               <div className="space-y-4">
// //                 <Label className="text-base font-medium">{t("filters.fuelType")}</Label>
// //                 <div className="space-y-3">
// //                   {[
// //                     { label: t("hero.benzin"), key: "benzin" },
// //                     { label: t("hero.diesel"), key: "diesel" },
// //                     { label: t("hero.hybrid"), key: "hybrid" },
// //                     { label: t("hero.electric"), key: "electric" },
// //                     { label: t("hero.lpg"), key: "lpg" },
// //                     { label: t("hero.cng"), key: "cng" }
// //                   ].map((fuel) => {
// //                     const currentValues = filters.fuel ? filters.fuel.split(',') : [];
// //                     const isChecked = currentValues.includes(fuel.key);
// //                     return (
// //                       <div key={fuel.key} className="flex items-center space-x-2">
// //                         <Checkbox
// //                           id={`fuel-${fuel.key}`}
// //                           data-testid={`checkbox-fuel-${fuel.key.toLowerCase()}`}
// //                           checked={isChecked}
// //                           onCheckedChange={(checked) => {
// //                             const current = filters.fuel ? filters.fuel.split(',') : [];
// //                             const newValues = checked === true
// //                               ? [...current, fuel.key]
// //                               : current.filter(v => v !== fuel.key);
// //                             setFuel(newValues.join(','));
// //                           }}
// //                         />
// //                         <label
// //                           htmlFor={`fuel-${fuel.key}`}
// //                           className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-black dark:text-white"
// //                         >
// //                           {fuel.label}
// //                         </label>
// //                       </div>
// //                     );
// //                   })}
// //                 </div>
// //               </div>

// //               <div className="space-y-4">
// //                 <Label className="text-base font-medium">{t("filters.transmission")}</Label>
// //                 <div className="space-y-3">
// //                   {[
// //                     { label: t("filters.manual"), key: "manual", icon: CircleDot },
// //                     { label: t("filters.automatic"), key: "automatic", icon: Zap },
// //                     { label: t("filters.robot"), key: "robot", icon: Bot },
// //                     { label: t("filters.cvt"), key: "cvt", icon: Activity }
// //                   ].map((trans) => {
// //                     const Icon = trans.icon;
// //                     const currentValues = filters.transmission ? filters.transmission.split(',') : [];
// //                     const isChecked = currentValues.includes(trans.key);
// //                     return (
// //                       <div key={trans.key} className="flex items-center space-x-2">
// //                         <Checkbox
// //                           id={`trans-${trans.key}`}
// //                           data-testid={`checkbox-transmission-${trans.key.toLowerCase()}`}
// //                           checked={isChecked}
// //                           onCheckedChange={(checked) => {
// //                             const current = filters.transmission ? filters.transmission.split(',') : [];
// //                             const newValues = checked === true
// //                               ? [...current, trans.key]
// //                               : current.filter(v => v !== trans.key);
// //                             setTransmission(newValues.join(','));
// //                           }}
// //                         />
// //                         <label
// //                           htmlFor={`trans-${trans.key}`}
// //                           className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-black dark:text-white flex items-center gap-2"
// //                         >
// //                           <Icon className="w-4 h-4 text-[#B8860B]" />
// //                           <span>{trans.label}</span>
// //                         </label>
// //                       </div>
// //                     );
// //                   })}
// //                 </div>
// //               </div>

// //               <div className="space-y-4">
// //                 <Label className="text-base font-medium">{t("filters.driveType")}</Label>
// //                 <div className="space-y-3">
// //                   {driveTypes.map((drive) => {
// //                     const driveTypeIcons: Record<string, any> = {
// //                       fwd: ArrowUp,
// //                       rwd: ArrowDown,
// //                       awd: Grid3x3,
// //                       "4wd": Compass,
// //                     };
// //                     const Icon = driveTypeIcons[drive.value];
// //                     const currentValues = filters.driveType ? filters.driveType.split(',') : [];
// //                     const isChecked = currentValues.includes(drive.value);
// //                     return (
// //                       <div key={drive.value} className="flex items-center space-x-2">
// //                         <Checkbox
// //                           id={`drive-${drive.value}`}
// //                           data-testid={`checkbox-drive-${drive.value}`}
// //                           checked={isChecked}
// //                           onCheckedChange={(checked) => {
// //                             const current = filters.driveType ? filters.driveType.split(',') : [];
// //                             const newValues = checked === true
// //                               ? [...current, drive.value]
// //                               : current.filter(v => v !== drive.value);
// //                             setDriveType(newValues.join(','));
// //                           }}
// //                         />
// //                         <label
// //                           htmlFor={`drive-${drive.value}`}
// //                           className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-black dark:text-white flex items-center gap-2"
// //                         >
// //                           {Icon && <Icon className="w-4 h-4 text-[#B8860B]" />}
// //                           <span>{drive.label}</span>
// //                         </label>
// //                       </div>
// //                     );
// //                   })}
// //                 </div>
// //               </div>

// //               <div className="space-y-4">
// //                 <Label className="text-base font-medium">{t("filters.owners")}</Label>
// //                 <OwnersRangeInput
// //                   minValue={filters.ownersMin || 0}
// //                   maxValue={filters.ownersMax || 10}
// //                   onMinChange={(value) => setOwnersRange(value, filters.ownersMax || 10)}
// //                   onMaxChange={(value) => setOwnersRange(filters.ownersMin || 0, value)}
// //                   variant="sidebar"
// //                   testIdPrefix="sidebar-owners"
// //                 />
// //               </div>

// //               <div className="space-y-4">
// //                 <Label className="text-base font-medium">{t("filters.sellerType")}</Label>
// //                 <div className="grid grid-cols-2 gap-2">
// //                   {[
// //                     { key: 'private' as const, label: t("filters.sellerPrivate") },
// //                     { key: 'dealer' as const, label: t("filters.sellerDealer") }
// //                   ].map((option) => {
// //                     const isSelected = filters.sellerType === option.key;
// //                     return (
// //                       <Button
// //                         key={option.key}
// //                         type="button"
// //                         variant={isSelected ? "default" : "outline"}
// //                         className={`h-auto py-2 px-3 text-xs ${!isSelected ? 'text-black dark:text-white' : ''} ${isSelected ? 'toggle-elevated' : ''} toggle-elevate`}
// //                         onClick={() => setSellerType(isSelected ? '' : option.key)}
// //                         data-testid={`button-sidebar-seller-${option.key}`}
// //                       >
// //                         {option.label}
// //                       </Button>
// //                     );
// //                   })}
// //                 </div>
// //               </div>

// //               <div className="space-y-4">
// //                 <Label className="text-base font-medium">{t("filters.listingAge")}</Label>
// //                 <ListingAgeRangeInput
// //                   minValue={filters.listingAgeMin || 0}
// //                   maxValue={filters.listingAgeMax || 365}
// //                   onMinChange={(value) => setListingAgeRange(value, filters.listingAgeMax || 365)}
// //                   onMaxChange={(value) => setListingAgeRange(filters.listingAgeMin || 0, value)}
// //                   variant="sidebar"
// //                   testIdPrefix="sidebar-listing-age"
// //                 />
// //               </div>

// //               {/* Euro Emission */}
// //               <div className="space-y-4">
// //                 <Label className="text-base font-medium">{t("filters.euroEmission")}</Label>
// //                 <Select value={filters.euroEmission || "all"} onValueChange={(value) => setEuroEmission(value === "all" ? "" : value)}>
// //                   <SelectTrigger className="h-12 rounded-xl text-black dark:text-white" data-testid="select-filter-euro-emission">
// //                     <SelectValue placeholder={t("filters.allEuroNorms")} />
// //                   </SelectTrigger>
// //                   <SelectContent>
// //                     <SelectItem value="all" className="text-black dark:text-white">{t("filters.allEuroNorms")}</SelectItem>
// //                     <SelectItem value="euro1" className="text-black dark:text-white">{t("filters.euro1")}</SelectItem>
// //                     <SelectItem value="euro2" className="text-black dark:text-white">{t("filters.euro2")}</SelectItem>
// //                     <SelectItem value="euro3" className="text-black dark:text-white">{t("filters.euro3")}</SelectItem>
// //                     <SelectItem value="euro4" className="text-black dark:text-white">{t("filters.euro4")}</SelectItem>
// //                     <SelectItem value="euro5" className="text-black dark:text-white">{t("filters.euro5")}</SelectItem>
// //                     <SelectItem value="euro6" className="text-black dark:text-white">{t("filters.euro6")}</SelectItem>
// //                     <SelectItem value="euro6d" className="text-black dark:text-white">{t("filters.euro6d")}</SelectItem>
// //                   </SelectContent>
// //                 </Select>
// //               </div>

// //               {/* STK Validity */}
// //               <div className="space-y-4">
// //                 <Label className="text-base font-medium">{t("filters.stkValidUntil")}</Label>
// //                 <MonthPicker
// //                   value={filters.stkValidUntil || ""}
// //                   onChange={(value) => setStkValidUntil(value)}
// //                   data-testid="input-sidebar-stk-valid"
// //                 />
// //               </div>

// //               {/* Service Book */}
// //               <div className="flex items-center space-x-2 py-2">
// //                 <Checkbox
// //                   id="filter-has-service-book"
// //                   checked={filters.hasServiceBook || false}
// //                   onCheckedChange={(checked) => setHasServiceBook(!!checked)}
// //                   data-testid="checkbox-filter-service-book"
// //                 />
// //                 <label
// //                   htmlFor="filter-has-service-book"
// //                   className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-black dark:text-white"
// //                 >
// //                   {t("filters.hasServiceBook")}
// //                 </label>
// //               </div>
// //             </CollapsibleContent>
// //           </Collapsible>

// //         <Collapsible open={openSections.appearance} onOpenChange={() => toggleSection('appearance')}>
// //             <CollapsibleTrigger className="flex items-center justify-between gap-2 w-full py-2 hover-elevate rounded-xl px-3">
// //               <h3 className="text-lg font-semibold truncate">{t("filters.appearance")}</h3>
// //               <ChevronDown className={`h-5 w-5 shrink-0 transition-transform ${openSections.appearance ? 'rotate-180' : ''}`} />
// //             </CollapsibleTrigger>
// //             <CollapsibleContent className="space-y-6 pt-4">
// //               <div className="space-y-4">
// //                 <Label className="text-base font-medium">{t("filters.color")}</Label>
// //                 <Select value={filters.color || "all"} onValueChange={(value) => setColor(value === "all" ? "" : value)}>
// //                   <SelectTrigger className="h-12 rounded-xl text-black dark:text-white" data-testid="select-filter-color">
// //                     <SelectValue placeholder={t("filters.allColors")} />
// //                   </SelectTrigger>
// //                   <SelectContent>
// //                     <SelectItem value="all" className="text-black dark:text-white">{t("filters.allColors")}</SelectItem>
// //                     {colors.map((color) => (
// //                       <SelectItem key={color.value} value={color.value} className="text-black dark:text-white">
// //                         <div className="flex items-center gap-2">
// //                           <div
// //                             className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600 flex-shrink-0"
// //                             style={{
// //                               backgroundColor: color.hex,
// //                               boxShadow: color.value === 'white' || color.value === 'ivory' ? 'inset 0 0 0 1px rgba(0,0,0,0.1)' : 'none'
// //                             }}
// //                           />
// //                           <span>{color.label}</span>
// //                         </div>
// //                       </SelectItem>
// //                     ))}
// //                   </SelectContent>
// //                 </Select>
// //               </div>

// //               <div className="space-y-4">
// //                 <Label className="text-base font-medium">{t("filters.trim")}</Label>
// //                 <Select value={filters.trim || ""} onValueChange={setTrim}>
// //                   <SelectTrigger className="h-12 rounded-xl text-black dark:text-white" data-testid="select-filter-trim">
// //                     <SelectValue placeholder={t("filters.allTrims")} />
// //                   </SelectTrigger>
// //                   <SelectContent>
// //                     {trimLevels.map((trim) => (
// //                       <SelectItem key={trim.value} value={trim.value} className="text-black dark:text-white">
// //                         {trim.label}
// //                       </SelectItem>
// //                     ))}
// //                   </SelectContent>
// //                 </Select>
// //               </div>

// //               <div className="space-y-4">
// //                 <Label className="text-base font-medium">{t("filters.doors")}</Label>
// //                 <div className="grid grid-cols-2 gap-2">
// //                   <Input
// //                     type="number"
// //                     min="2"
// //                     max="6"
// //                     placeholder={t("hero.from")}
// //                     value={filters.doorsMin || ""}
// //                     onChange={(e) => {
// //                       const value = e.target.value ? parseInt(e.target.value) : undefined;
// //                       setDoorsRange(value, filters.doorsMax);
// //                     }}
// //                     className="h-10 text-black dark:text-white"
// //                     data-testid="input-doors-min"
// //                   />
// //                   <Input
// //                     type="number"
// //                     min="2"
// //                     max="6"
// //                     placeholder={t("hero.to")}
// //                     value={filters.doorsMax || ""}
// //                     onChange={(e) => {
// //                       const value = e.target.value ? parseInt(e.target.value) : undefined;
// //                       setDoorsRange(filters.doorsMin, value);
// //                     }}
// //                     className="h-10 text-black dark:text-white"
// //                     data-testid="input-doors-max"
// //                   />
// //                 </div>
// //               </div>

// //               <div className="space-y-4">
// //                 <Label className="text-base font-medium">{t("filters.seats")}</Label>
// //                 <div className="grid grid-cols-2 gap-2">
// //                   <Input
// //                     type="number"
// //                     min="2"
// //                     max="9"
// //                     placeholder={t("hero.from")}
// //                     value={filters.seatsMin || ""}
// //                     onChange={(e) => {
// //                       const value = e.target.value ? parseInt(e.target.value) : undefined;
// //                       setSeatsRange(value, filters.seatsMax);
// //                     }}
// //                     className="h-10 text-black dark:text-white"
// //                     data-testid="input-seats-min"
// //                   />
// //                   <Input
// //                     type="number"
// //                     min="2"
// //                     max="9"
// //                     placeholder={t("hero.to")}
// //                     value={filters.seatsMax || ""}
// //                     onChange={(e) => {
// //                       const value = e.target.value ? parseInt(e.target.value) : undefined;
// //                       setSeatsRange(filters.seatsMin, value);
// //                     }}
// //                     className="h-10 text-black dark:text-white"
// //                     data-testid="input-seats-max"
// //                   />
// //                 </div>
// //               </div>
// //             </CollapsibleContent>
// //           </Collapsible>

// //           <Collapsible open={openSections.equipment} onOpenChange={() => toggleSection('equipment')}>
// //             <CollapsibleTrigger className="flex items-center justify-between gap-2 w-full py-2 hover-elevate rounded-xl px-3">
// //               <h3 className="text-lg font-semibold truncate">{t("filters.equipment")}</h3>
// //               <ChevronDown className={`h-5 w-5 shrink-0 transition-transform ${openSections.equipment ? 'rotate-180' : ''}`} />
// //             </CollapsibleTrigger>
// //             <CollapsibleContent className="space-y-6 pt-4">
// //               <div className="space-y-3">
// //                 {[
// //                   { label: t("filters.heatedSeats"), key: "heated-seats" },
// //                   { label: t("filters.electricWindows"), key: "electric-windows" },
// //                   { label: t("filters.leatherInterior"), key: "leather-interior" },
// //                   { label: t("filters.climateControl"), key: "climate-control" },
// //                   { label: t("filters.cruiseControl"), key: "cruise-control" },
// //                   { label: t("filters.parkingSensors"), key: "parking-sensors" },
// //                   { label: t("filters.rearCamera"), key: "rear-camera" },
// //                   { label: t("filters.navigationSystem"), key: "navigation" },
// //                   { label: t("filters.bluetooth"), key: "bluetooth" },
// //                   { label: t("filters.keylessEntry"), key: "keyless-entry" },
// //                   { label: t("filters.ledHeadlights"), key: "led-headlights" },
// //                   { label: t("filters.sunroof"), key: "sunroof" },
// //                   { label: t("filters.alloyWheels"), key: "alloy-wheels" },
// //                   { label: t("filters.ventilatedSeats"), key: "ventilated-seats" },
// //                   { label: t("filters.memorySeats"), key: "memory-seats" },
// //                   { label: t("filters.massageSeats"), key: "massage-seats" },
// //                   { label: t("filters.adaptiveCruise"), key: "adaptive-cruise" },
// //                   { label: t("filters.laneKeeping"), key: "lane-keeping" },
// //                   { label: t("filters.blindSpot"), key: "blind-spot" },
// //                   { label: t("filters.rainSensor"), key: "rain-sensor" },
// //                   { label: t("filters.lightSensor"), key: "light-sensor" },
// //                   { label: t("filters.heatedSteeringWheel"), key: "heated-steering" },
// //                   { label: t("filters.panoramicRoof"), key: "panoramic-roof" },
// //                   { label: t("filters.electricSeats"), key: "electric-seats" },
// //                   { label: t("filters.parkingAssist"), key: "parking-assist" },
// //                   { label: t("filters.headUpDisplay"), key: "head-up-display" },
// //                   { label: t("filters.wirelessCharging"), key: "wireless-charging" },
// //                   { label: t("filters.towHitch"), key: "tow-hitch" }
// //                 ].map((equipment) => (
// //                   <div key={equipment.key} className="flex items-center space-x-2">
// //                     <Checkbox
// //                       id={`equipment-${equipment.key}`}
// //                       checked={filters.equipment?.includes(equipment.key) || false}
// //                       onCheckedChange={() => handleEquipmentChange(equipment.key)}
// //                       data-testid={`checkbox-equipment-${equipment.key}`}
// //                     />
// //                     <label
// //                       htmlFor={`equipment-${equipment.key}`}
// //                       className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-black dark:text-white"
// //                     >
// //                       {equipment.label}
// //                     </label>
// //                   </div>
// //                 ))}
// //               </div>
// //             </CollapsibleContent>
// //           </Collapsible>

// //           <Collapsible open={openSections.extras} onOpenChange={() => toggleSection('extras')}>
// //             <CollapsibleTrigger className="flex items-center justify-between gap-2 w-full py-2 hover-elevate rounded-xl px-3">
// //               <h3 className="text-lg font-semibold truncate">{t("filters.additionalOptions")}</h3>
// //               <ChevronDown className={`h-5 w-5 shrink-0 transition-transform ${openSections.extras ? 'rotate-180' : ''}`} />
// //             </CollapsibleTrigger>
// //             <CollapsibleContent className="space-y-6 pt-4">
// //               <div className="space-y-4">
// //                 <Label className="text-base font-medium">{t("filters.extras")}</Label>
// //                 <div className="space-y-3">
// //                   {[
// //                     { label: t("filters.serviceBook"), key: "Servisní knížka" },
// //                     { label: t("filters.notDamaged"), key: "Nepoškozený" },
// //                     { label: t("filters.notPainted"), key: "Nelakovaný" },
// //                     { label: t("filters.warranty"), key: "Záruka" },
// //                     { label: t("filters.exchange"), key: "Výměna" }
// //                   ].map((extra) => (
// //                     <div key={extra.key} className="flex items-center space-x-2">
// //                       <Checkbox id={`extra-${extra.key}`} data-testid={`checkbox-extra-${extra.key.toLowerCase()}`} />
// //                       <label
// //                         htmlFor={`extra-${extra.key}`}
// //                         className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-black dark:text-white"
// //                       >
// //                         {extra.label}
// //                       </label>
// //                     </div>
// //                   ))}
// //                 </div>
// //               </div>
// //             </CollapsibleContent>
// //           </Collapsible>

// //           <Collapsible open={openSections.region} onOpenChange={() => toggleSection('region')}>
// //             <CollapsibleTrigger className="flex items-center justify-between gap-2 w-full py-2 hover-elevate rounded-xl px-3">
// //               <h3 className="text-lg font-semibold truncate">{t("filters.region")}</h3>
// //               <ChevronDown className={`h-5 w-5 shrink-0 transition-transform ${openSections.region ? 'rotate-180' : ''}`} />
// //             </CollapsibleTrigger>
// //             <CollapsibleContent className="space-y-6 pt-4">
// //               <div className="space-y-4">
// //                 <RegionCombobox
// //                   value={filters.region || ""}
// //                   onValueChange={setRegion}
// //                   regions={regions}
// //                   placeholder={t("filters.allRegions")}
// //                   emptyMessage={t("hero.noRegionsFound")}
// //                   testId="select-filter-region"
// //                 />
// //               </div>
// //             </CollapsibleContent>
// //           </Collapsible>

// //         <Button className="w-full h-12 rounded-xl shadow-md" onClick={handleApply} data-testid="button-apply-filters">
// //           {t("filters.apply")}
// //         </Button>
// //         </CardContent>
// //       </ScrollArea>
// //     </Card>
// //   );
// // }

// // export default memo(FilterSidebar);
// "use client";

// import { memo, useMemo, useState } from "react";

// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { MonthPicker } from "@/components/ui/month-picker";
// import {
//   Collapsible,
//   CollapsibleContent,
//   CollapsibleTrigger,
// } from "@/components/ui/collapsible";

// import {
//   ChevronDown,
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

// import { carBrands } from "@shared/carDatabase";

// import { useLanguage } from "@/contexts/LanguageContext";
// import { useFilterParams } from "@/hooks/useFilterParams";
// import {
//   useTranslation,
//   useLocalizedOptions,
//   vehicleTypeBrands,
//   getModelsForVehicleType,
// } from "@/lib/translations";

// import newCarIcon from "@assets/3AAF8DD0-3B6D-4DA3-8A1E-2858FCC004A1_1763451350424.png";
// import partsIcon from "@assets/62A9ABBD-0474-469C-8089-FA93C3E7C2B4_1763450942216.png";
// import usedCarIcon from "@assets/ABAF6CAB-50AC-450D-8FE8-342C0DF354D6_1763451176037.png";
// import orderCarIcon from "@assets/A6BE7880-928D-4532-BCB1-3FA4A34F89CE_1763451456108.png";
// import motorcycleIcon from "@assets/44AD800C-C9BB-4F50-A278-5152E01D60BB_1763444856175.png";
// import truckGoldIcon from "@assets/8C9B6F5F-55BC-402E-9359-B2707FE2FB81_1763444987490.png";
// import carGoldIcon from "@assets/D545620E-B7EF-4EB5-AE03-389B4725412B_1763449648396.png";
// import vanIcon from "@assets/4E8B9722-D061-47D3-9C2F-2C8C1070F01B_1763443339270.png";

// import { brandIcons } from "@/lib/brandIcons";
// import { bodyTypeIcons } from "@/lib/bodyTypeIcons";

// import { PriceRangeInput } from "@/components/PriceRangeInput";
// import { MileageRangeInput } from "@/components/MileageRangeInput";
// import { YearRangeInput } from "@/components/YearRangeInput";
// import { OwnersRangeInput } from "@/components/OwnersRangeInput";
// import { ListingAgeRangeInput } from "@/components/ListingAgeRangeInput";
// import { EngineRangeInput } from "@/components/EngineRangeInput";
// import { PowerRangeInput } from "@/components/PowerRangeInput";

// import { ModelCombobox } from "@/components/ModelCombobox";
// import { BrandCombobox } from "@/components/BrandCombobox";
// import { RegionCombobox } from "@/components/RegionCombobox";

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

// function FilterSidebar() {
//   const t = useTranslation();
//   const localizedOptions = useLocalizedOptions();
//   const { language } = useLanguage();

//   const colors = localizedOptions.getColors();
//   const driveTypes = localizedOptions.getDriveTypes();
//   const regions = localizedOptions.getRegions();
//   const bodyTypes = localizedOptions.getBodyTypes();

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
//     setTrim,
//     setCondition,
//     setEquipment,
//     setRegion,
//     setColor,
//     setFuel,
//     setTransmission,
//     setDriveType,
//     setEuroEmission,
//     setStkValidUntil,
//     setHasServiceBook,
//     resetFilters,
//     applyFilters,
//   } = useFilterParams();

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

//   const availableModels = useMemo(() => {
//     return filters.brand
//       ? getModelsForVehicleType(filters.brand, filters.vehicleType)
//       : [];
//   }, [filters.brand, filters.vehicleType]);

//   const trimLevels = useMemo(
//     () => [
//       { value: "base", label: t("trims.base") },
//       { value: "classic", label: t("trims.classic") },
//       { value: "standard", label: t("trims.standard") },
//       { value: "comfort", label: t("trims.comfort") },
//       { value: "ambition", label: t("trims.ambition") },
//       { value: "style", label: t("trims.style") },
//       { value: "sport", label: t("trims.sport") },
//       { value: "luxury", label: t("trims.luxury") },
//       { value: "premium", label: t("trims.premium") },
//       { value: "executive", label: t("trims.executive") },
//       { value: "performance", label: t("trims.performance") },
//       { value: "limited", label: t("trims.limited") },
//       { value: "special", label: t("trims.special") },
//       { value: "gt", label: "GT" },
//       { value: "rs", label: "RS" },
//       { value: "m-sport", label: "M Sport" },
//       { value: "amg", label: "AMG" },
//       { value: "quattro", label: "Quattro" },
//       { value: "4motion", label: "4Motion" },
//       { value: "xdrive", label: "xDrive" },
//       { value: "raptor", label: "Raptor" },
//     ],
//     [t],
//   );

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

//   const handleConditionToggle = (value: string) => {
//     const next = toggleInArray(filters.condition, value) ?? [];
//     setCondition(next);
//   };

//   const handleEquipmentToggle = (value: string) => {
//     const next = toggleInArray(filters.equipment, value) ?? [];
//     setEquipment(next);
//   };

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
//       return {
//         ...prev,
//         vehicleType: nextBodyTypes?.length ? "osobni-auta" : prev.vehicleType, // якщо обрали кузов — це легкові
//         bodyType: nextBodyTypes,
//       };
//     });
//   };

//   const handleFuelToggle = (key: string) => {
//     const next = toggleInCommaList(filters.fuel, key);
//     setFuel(next);
//   };

//   const handleTransmissionToggle = (key: string) => {
//     const next = toggleInCommaList(filters.transmission, key);
//     setTransmission(next);
//   };

//   const handleDriveToggle = (key: string) => {
//     const next = toggleInCommaList(filters.driveType, key);
//     setDriveType(next);
//   };

//   const filteredBrands = useMemo(() => {
//     return carBrands
//       .filter((brand) => {
//         if (filters.vehicleType && vehicleTypeBrands[filters.vehicleType]) {
//           return vehicleTypeBrands[filters.vehicleType].includes(brand.value);
//         }
//         return true;
//       })
//       .map((brand) => ({
//         ...brand,
//         icon: brandIcons[brand.value],
//       }));
//   }, [filters.vehicleType]);

//   return (
//     // ✅ Білий фон + тягнеться по висоті колонки/сторінки (без внутрішнього "обрізання" через ScrollArea)
//     <Card className="rounded-2xl shadow-xl bg-white dark:bg-background h-full flex flex-col">
//       <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-6">
//         <CardTitle className="text-xl font-semibold truncate">
//           {t("filters.title")}
//         </CardTitle>
//         <Button
//           variant="ghost"
//           size="sm"
//           className="rounded-xl shrink-0"
//           onClick={() => resetFilters()}
//           data-testid="button-reset-filters"
//         >
//           {t("filters.reset")}
//         </Button>
//       </CardHeader>

//       <CardContent className="space-y-6 pr-6 pb-6 flex-1">
//         {/* CONDITION */}
//         <Collapsible
//           open={openSections.condition}
//           onOpenChange={() => toggleSection("condition")}
//         >
//           <CollapsibleTrigger className="flex items-center justify-between gap-2 w-full py-2 hover-elevate rounded-xl px-3">
//             <h3 className="text-lg font-semibold truncate">
//               {t("filters.conditionAndOwners")}
//             </h3>
//             <ChevronDown
//               className={`h-5 w-5 shrink-0 transition-transform ${openSections.condition ? "rotate-180" : ""}`}
//             />
//           </CollapsibleTrigger>

//           <CollapsibleContent className="space-y-6 pt-4">
//             <div className="grid grid-cols-2 gap-3">
//               {[
//                 {
//                   label: t("filters.conditionNew"),
//                   key: "Nové",
//                   icon: Sparkles,
//                   img: newCarIcon,
//                 },
//                 {
//                   label: t("filters.conditionUsed"),
//                   key: "Ojeté",
//                   icon: Car,
//                   img: usedCarIcon,
//                 },
//                 {
//                   label: t("filters.conditionOrder"),
//                   key: "Na objednávku",
//                   icon: Package,
//                   img: orderCarIcon,
//                 },
//                 {
//                   label: t("filters.conditionParts"),
//                   key: "Na náhradní díly",
//                   icon: Wrench,
//                   img: partsIcon,
//                 },
//                 ...(showAllConditions
//                   ? [
//                       {
//                         label: t("filters.conditionRental"),
//                         key: "Pronájem",
//                         icon: Key as any,
//                         img: "",
//                       },
//                       {
//                         label: t("filters.conditionDamaged"),
//                         key: "Havarované",
//                         icon: Wrench as any,
//                         img: "",
//                       },
//                       {
//                         label: t("filters.conditionHistoric"),
//                         key: "Historické",
//                         icon: Sparkles as any,
//                         img: "",
//                       },
//                     ]
//                   : []),
//               ].map((condition) => {
//                 const isSelected =
//                   filters.condition?.includes(condition.key) || false;
//                 const Icon = condition.icon;

//                 return (
//                   <Button
//                     key={condition.key}
//                     type="button"
//                     variant={isSelected ? "default" : "outline"}
//                     className={`h-auto py-3 px-4 flex flex-col items-center gap-2 text-center ${
//                       isSelected ? "toggle-elevated" : ""
//                     } toggle-elevate`}
//                     onClick={() => handleConditionToggle(condition.key)}
//                     data-testid={`button-condition-${condition.key.toLowerCase().replace(/\s+/g, "-")}`}
//                   >
//                     {condition.img ? (
//                       <ImgIcon
//                         src={condition.img}
//                         alt={condition.key}
//                         className="h-10 w-10"
//                       />
//                     ) : (
//                       <Icon className="h-7 w-7 text-[#B8860B]" />
//                     )}
//                     <span className="text-xs font-medium leading-tight text-black dark:text-white">
//                       {condition.label}
//                     </span>
//                   </Button>
//                 );
//               })}

//               <Button
//                 type="button"
//                 variant="ghost"
//                 className="col-span-2 h-auto py-2 flex items-center justify-center gap-2"
//                 onClick={() => setShowAllConditions((v) => !v)}
//                 data-testid="button-toggle-conditions"
//               >
//                 <span className="text-sm font-medium text-[#B8860B]">
//                   {showAllConditions
//                     ? t("filters.showLess")
//                     : t("filters.showMore")}
//                 </span>
//                 <ChevronDown
//                   className={`h-4 w-4 text-[#B8860B] transition-transform ${showAllConditions ? "rotate-180" : ""}`}
//                 />
//               </Button>
//             </div>
//           </CollapsibleContent>
//         </Collapsible>

//         {/* VEHICLE TYPE + BODY TYPE */}
//         <Collapsible
//           open={openSections.vehicleType}
//           onOpenChange={() => toggleSection("vehicleType")}
//         >
//           <CollapsibleTrigger className="flex items-center justify-between gap-2 w-full py-2 hover-elevate rounded-xl px-3">
//             <h3 className="text-lg font-semibold truncate">
//               {t("listing.vehicleType")} / {t("filters.bodyType")}
//             </h3>
//             <ChevronDown
//               className={`h-5 w-5 shrink-0 transition-transform ${openSections.vehicleType ? "rotate-180" : ""}`}
//             />
//           </CollapsibleTrigger>

//           <CollapsibleContent className="space-y-6 pt-4">
//             <div className="grid grid-cols-3 gap-2">
//               {[
//                 {
//                   key: "osobni-auta",
//                   label: t("hero.cars"),
//                   img: carGoldIcon,
//                   testId: "button-sidebar-vehicle-cars",
//                 },
//                 {
//                   key: "dodavky",
//                   label: t("hero.dodavky"),
//                   img: vanIcon,
//                   testId: "button-sidebar-vehicle-dodavky",
//                 },
//                 {
//                   key: "nakladni-vozy",
//                   label: t("hero.trucks"),
//                   img: truckGoldIcon,
//                   testId: "button-sidebar-vehicle-trucks",
//                 },
//                 {
//                   key: "motorky",
//                   label: t("hero.motorky"),
//                   img: motorcycleIcon,
//                   testId: "button-sidebar-vehicle-motorky",
//                 },
//               ].map((item) => {
//                 const selected = splitComma(filters.vehicleType).includes(
//                   item.key,
//                 );

//                 return (
//                   <button
//                     key={item.key}
//                     type="button"
//                     onClick={() => handleVehicleTypeToggle(item.key)}
//                     className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg border-2 transition-colors hover-elevate active-elevate-2 ${
//                       selected
//                         ? "bg-primary text-primary-foreground border-primary-border"
//                         : "bg-background border-input text-black dark:text-white"
//                     }`}
//                     data-testid={item.testId}
//                   >
//                     <ImgIcon
//                       src={item.img}
//                       alt={item.key}
//                       className="w-8 h-8"
//                     />
//                     <span
//                       className={`text-xs text-center leading-tight ${!selected ? "text-black dark:text-white" : ""}`}
//                     >
//                       {item.label}
//                     </span>
//                   </button>
//                 );
//               })}

//               {bodyTypes.map((type) => {
//                 const IconComponent = bodyTypeIcons[type.value] || Car;
//                 const isSelected =
//                   filters.bodyType?.includes(type.value) || false;

//                 return (
//                   <button
//                     key={type.value}
//                     type="button"
//                     onClick={() => handleBodyTypeToggle(type.value)}
//                     className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg border-2 transition-colors hover-elevate active-elevate-2 ${
//                       isSelected
//                         ? "bg-primary text-primary-foreground border-primary-border"
//                         : "bg-background border-input text-black dark:text-white"
//                     }`}
//                     data-testid={`button-sidebar-body-type-${type.value}`}
//                   >
//                     <IconComponent className="w-8 h-8" />
//                     <span
//                       className={`text-xs text-center leading-tight ${!isSelected ? "text-black dark:text-white" : ""}`}
//                     >
//                       {type.label}
//                     </span>
//                   </button>
//                 );
//               })}
//             </div>
//           </CollapsibleContent>
//         </Collapsible>

//         {/* BASIC */}
//         <Collapsible
//           open={openSections.basic}
//           onOpenChange={() => toggleSection("basic")}
//         >
//           <CollapsibleTrigger className="flex items-center justify-between gap-2 w-full py-2 hover-elevate rounded-xl px-3">
//             <h3 className="text-lg font-semibold truncate">
//               {t("filters.basicFilters")}
//             </h3>
//             <ChevronDown
//               className={`h-5 w-5 shrink-0 transition-transform ${openSections.basic ? "rotate-180" : ""}`}
//             />
//           </CollapsibleTrigger>

//           <CollapsibleContent className="space-y-6 pt-4">
//             <div className="space-y-4">
//               <Label className="text-base font-medium">
//                 {t("filters.brand")}
//               </Label>
//               <BrandCombobox
//                 brands={filteredBrands}
//                 value={filters.brand || ""}
//                 onValueChange={setBrand}
//                 placeholder={t("hero.allBrands")}
//                 emptyMessage={t("hero.noBrandsFound")}
//                 testId="select-filter-brand"
//               />
//             </div>

//             <div className="space-y-4">
//               <Label className="text-base font-medium">
//                 {t("filters.model")}
//               </Label>
//               <ModelCombobox
//                 models={availableModels}
//                 value={filters.model || ""}
//                 onValueChange={setModel}
//                 disabled={!filters.brand}
//                 placeholder={
//                   filters.brand ? t("hero.allModels") : t("hero.selectBrand")
//                 }
//                 emptyMessage={t("hero.noModelsFound")}
//                 testId="select-filter-model"
//               />
//             </div>
//           </CollapsibleContent>
//         </Collapsible>

//         {/* PRICE + YEAR */}
//         <Collapsible
//           open={openSections.price}
//           onOpenChange={() => toggleSection("price")}
//         >
//           <CollapsibleTrigger className="flex items-center justify-between gap-2 w-full py-2 hover-elevate rounded-xl px-3">
//             <h3 className="text-lg font-semibold truncate">
//               {t("filters.priceAndYear")}
//             </h3>
//             <ChevronDown
//               className={`h-5 w-5 shrink-0 transition-transform ${openSections.price ? "rotate-180" : ""}`}
//             />
//           </CollapsibleTrigger>

//           <CollapsibleContent className="space-y-6 pt-4">
//             <div className="space-y-4">
//               <Label className="text-base font-medium">
//                 {t("filters.price")}
//               </Label>
//               <PriceRangeInput
//                 minValue={priceMin}
//                 maxValue={priceMax}
//                 onMinChange={(value) => setPriceRange(value || 10000, priceMax)}
//                 onMaxChange={(value) =>
//                   setPriceRange(priceMin, value || 20000000)
//                 }
//                 variant="sidebar"
//                 testIdPrefix="sidebar-price"
//               />

//               <div className="flex items-center space-x-2 pt-2">
//                 <Checkbox
//                   id="sidebar-vat-deductible"
//                   checked={filters.vatDeductible || false}
//                   onCheckedChange={(checked) =>
//                     setFilters((prev) => ({
//                       ...prev,
//                       vatDeductible: checked === true ? true : undefined,
//                     }))
//                   }
//                   data-testid="checkbox-sidebar-vat-deductible"
//                 />
//                 <label
//                   htmlFor="sidebar-vat-deductible"
//                   className="text-sm font-medium leading-none cursor-pointer text-black dark:text-white"
//                 >
//                   {t("filters.vatDeductible")}
//                 </label>
//               </div>
//             </div>

//             <div className="space-y-4">
//               <Label className="text-base font-medium">
//                 {t("filters.mileage")}
//               </Label>
//               <MileageRangeInput
//                 minValue={mileageMin}
//                 maxValue={mileageMax}
//                 onMinChange={(value) => setMileageRange(value, mileageMax)}
//                 onMaxChange={(value) => setMileageRange(mileageMin, value)}
//                 variant="sidebar"
//                 testIdPrefix="sidebar-mileage"
//               />
//             </div>

//             <div className="space-y-4">
//               <Label className="text-base font-medium">
//                 {t("filters.yearOfManufacture")}
//               </Label>
//               <YearRangeInput
//                 minValue={yearMin}
//                 maxValue={yearMax}
//                 onMinChange={(value) => setYearRange(value, yearMax)}
//                 onMaxChange={(value) => setYearRange(yearMin, value)}
//                 variant="sidebar"
//                 testIdPrefix="sidebar-year"
//               />
//             </div>
//           </CollapsibleContent>
//         </Collapsible>

//         {/* TECHNICAL */}
//         <Collapsible
//           open={openSections.technical}
//           onOpenChange={() => toggleSection("technical")}
//         >
//           <CollapsibleTrigger className="flex items-center justify-between gap-2 w-full py-2 hover-elevate rounded-xl px-3">
//             <h3 className="text-lg font-semibold truncate">
//               {t("filters.technicalParams")}
//             </h3>
//             <ChevronDown
//               className={`h-5 w-5 shrink-0 transition-transform ${openSections.technical ? "rotate-180" : ""}`}
//             />
//           </CollapsibleTrigger>

//           <CollapsibleContent className="space-y-6 pt-4">
//             <div className="space-y-4">
//               <Label className="text-base font-medium">
//                 {t("filters.engineVolume")}
//               </Label>
//               <EngineRangeInput
//                 minValue={engineMin}
//                 maxValue={engineMax}
//                 onMinChange={(value) => setEngineRange(value, engineMax)}
//                 onMaxChange={(value) => setEngineRange(engineMin, value)}
//                 variant="sidebar"
//                 testIdPrefix="sidebar-engine"
//               />
//             </div>

//             <div className="space-y-4">
//               <Label className="text-base font-medium">
//                 {t("filters.power")}
//               </Label>
//               <PowerRangeInput
//                 minValue={powerMin}
//                 maxValue={powerMax}
//                 onMinChange={(value) => setPowerRange(value, powerMax)}
//                 onMaxChange={(value) => setPowerRange(powerMin, value)}
//                 variant="sidebar"
//                 testIdPrefix="sidebar-power"
//               />
//             </div>

//             {/* FUEL */}
//             <div className="space-y-4">
//               <Label className="text-base font-medium">
//                 {t("filters.fuelType")}
//               </Label>
//               <div className="space-y-3">
//                 {[
//                   { label: t("hero.benzin"), key: "benzin" },
//                   { label: t("hero.diesel"), key: "diesel" },
//                   { label: t("hero.hybrid"), key: "hybrid" },
//                   { label: t("hero.electric"), key: "electric" },
//                   { label: t("hero.lpg"), key: "lpg" },
//                   { label: t("hero.cng"), key: "cng" },
//                 ].map((fuel) => {
//                   const isChecked = splitComma(filters.fuel).includes(fuel.key);
//                   return (
//                     <div key={fuel.key} className="flex items-center space-x-2">
//                       <Checkbox
//                         id={`fuel-${fuel.key}`}
//                         data-testid={`checkbox-fuel-${fuel.key.toLowerCase()}`}
//                         checked={isChecked}
//                         onCheckedChange={() => handleFuelToggle(fuel.key)}
//                       />
//                       <label
//                         htmlFor={`fuel-${fuel.key}`}
//                         className="text-sm font-medium cursor-pointer text-black dark:text-white"
//                       >
//                         {fuel.label}
//                       </label>
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>

//             {/* TRANSMISSION */}
//             <div className="space-y-4">
//               <Label className="text-base font-medium">
//                 {t("filters.transmission")}
//               </Label>
//               <div className="space-y-3">
//                 {[
//                   {
//                     label: t("filters.manual"),
//                     key: "manual",
//                     icon: CircleDot,
//                   },
//                   {
//                     label: t("filters.automatic"),
//                     key: "automatic",
//                     icon: Zap,
//                   },
//                   { label: t("filters.robot"), key: "robot", icon: Bot },
//                   { label: t("filters.cvt"), key: "cvt", icon: Activity },
//                 ].map((trans) => {
//                   const Icon = trans.icon;
//                   const isChecked = splitComma(filters.transmission).includes(
//                     trans.key,
//                   );
//                   return (
//                     <div
//                       key={trans.key}
//                       className="flex items-center space-x-2"
//                     >
//                       <Checkbox
//                         id={`trans-${trans.key}`}
//                         data-testid={`checkbox-transmission-${trans.key.toLowerCase()}`}
//                         checked={isChecked}
//                         onCheckedChange={() =>
//                           handleTransmissionToggle(trans.key)
//                         }
//                       />
//                       <label
//                         htmlFor={`trans-${trans.key}`}
//                         className="text-sm font-medium cursor-pointer text-black dark:text-white flex items-center gap-2"
//                       >
//                         <Icon className="w-4 h-4 text-[#B8860B]" />
//                         <span>{trans.label}</span>
//                       </label>
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>

//             {/* DRIVE */}
//             <div className="space-y-4">
//               <Label className="text-base font-medium">
//                 {t("filters.driveType")}
//               </Label>
//               <div className="space-y-3">
//                 {driveTypes.map((drive) => {
//                   const icons: Record<string, any> = {
//                     fwd: ArrowUp,
//                     rwd: ArrowDown,
//                     awd: Grid3x3,
//                     "4wd": Compass,
//                   };
//                   const Icon = icons[drive.value];
//                   const isChecked = splitComma(filters.driveType).includes(
//                     drive.value,
//                   );

//                   return (
//                     <div
//                       key={drive.value}
//                       className="flex items-center space-x-2"
//                     >
//                       <Checkbox
//                         id={`drive-${drive.value}`}
//                         data-testid={`checkbox-drive-${drive.value}`}
//                         checked={isChecked}
//                         onCheckedChange={() => handleDriveToggle(drive.value)}
//                       />
//                       <label
//                         htmlFor={`drive-${drive.value}`}
//                         className="text-sm font-medium cursor-pointer text-black dark:text-white flex items-center gap-2"
//                       >
//                         {Icon ? (
//                           <Icon className="w-4 h-4 text-[#B8860B]" />
//                         ) : null}
//                         <span>{drive.label}</span>
//                       </label>
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>

//             {/* OWNERS */}
//             <div className="space-y-4">
//               <Label className="text-base font-medium">
//                 {t("filters.owners")}
//               </Label>
//               <OwnersRangeInput
//                 minValue={filters.ownersMin || 0}
//                 maxValue={filters.ownersMax || 10}
//                 onMinChange={(value) =>
//                   setOwnersRange(value, filters.ownersMax || 10)
//                 }
//                 onMaxChange={(value) =>
//                   setOwnersRange(filters.ownersMin || 0, value)
//                 }
//                 variant="sidebar"
//                 testIdPrefix="sidebar-owners"
//               />
//             </div>

//             {/* SELLER TYPE */}
//             <div className="space-y-4">
//               <Label className="text-base font-medium">
//                 {t("filters.sellerType")}
//               </Label>
//               <div className="grid grid-cols-2 gap-2">
//                 {[
//                   {
//                     key: "private" as const,
//                     label: t("filters.sellerPrivate"),
//                   },
//                   { key: "dealer" as const, label: t("filters.sellerDealer") },
//                 ].map((option) => {
//                   const isSelected = filters.sellerType === option.key;
//                   return (
//                     <Button
//                       key={option.key}
//                       type="button"
//                       variant={isSelected ? "default" : "outline"}
//                       className={`h-auto py-2 px-3 text-xs ${!isSelected ? "text-black dark:text-white" : ""} ${
//                         isSelected ? "toggle-elevated" : ""
//                       } toggle-elevate`}
//                       onClick={() =>
//                         setSellerType(isSelected ? "" : option.key)
//                       }
//                       data-testid={`button-sidebar-seller-${option.key}`}
//                     >
//                       {option.label}
//                     </Button>
//                   );
//                 })}
//               </div>
//             </div>

//             {/* LISTING AGE */}
//             <div className="space-y-4">
//               <Label className="text-base font-medium">
//                 {t("filters.listingAge")}
//               </Label>
//               <ListingAgeRangeInput
//                 minValue={filters.listingAgeMin || 0}
//                 maxValue={filters.listingAgeMax || 365}
//                 onMinChange={(value) =>
//                   setListingAgeRange(value, filters.listingAgeMax || 365)
//                 }
//                 onMaxChange={(value) =>
//                   setListingAgeRange(filters.listingAgeMin || 0, value)
//                 }
//                 variant="sidebar"
//                 testIdPrefix="sidebar-listing-age"
//               />
//             </div>

//             {/* EURO */}
//             <div className="space-y-4">
//               <Label className="text-base font-medium">
//                 {t("filters.euroEmission")}
//               </Label>
//               <Select
//                 value={filters.euroEmission || "all"}
//                 onValueChange={(value) =>
//                   setEuroEmission(value === "all" ? "" : value)
//                 }
//               >
//                 <SelectTrigger
//                   className="h-12 rounded-xl text-black dark:text-white"
//                   data-testid="select-filter-euro-emission"
//                 >
//                   <SelectValue placeholder={t("filters.allEuroNorms")} />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem
//                     value="all"
//                     className="text-black dark:text-white"
//                   >
//                     {t("filters.allEuroNorms")}
//                   </SelectItem>
//                   {[
//                     "euro1",
//                     "euro2",
//                     "euro3",
//                     "euro4",
//                     "euro5",
//                     "euro6",
//                     "euro6d",
//                   ].map((v) => (
//                     <SelectItem
//                       key={v}
//                       value={v}
//                       className="text-black dark:text-white"
//                     >
//                       {t(`filters.${v}` as any)}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             {/* STK */}
//             <div className="space-y-4">
//               <Label className="text-base font-medium">
//                 {t("filters.stkValidUntil")}
//               </Label>
//               <MonthPicker
//                 value={filters.stkValidUntil || ""}
//                 onChange={(value) => setStkValidUntil(value)}
//                 data-testid="input-sidebar-stk-valid"
//               />
//             </div>

//             {/* SERVICE BOOK */}
//             <div className="flex items-center space-x-2 py-2">
//               <Checkbox
//                 id="filter-has-service-book"
//                 checked={filters.hasServiceBook || false}
//                 onCheckedChange={(checked) => setHasServiceBook(!!checked)}
//                 data-testid="checkbox-filter-service-book"
//               />
//               <label
//                 htmlFor="filter-has-service-book"
//                 className="text-sm font-medium cursor-pointer text-black dark:text-white"
//               >
//                 {t("filters.hasServiceBook")}
//               </label>
//             </div>
//           </CollapsibleContent>
//         </Collapsible>

//         {/* APPEARANCE */}
//         <Collapsible
//           open={openSections.appearance}
//           onOpenChange={() => toggleSection("appearance")}
//         >
//           <CollapsibleTrigger className="flex items-center justify-between gap-2 w-full py-2 hover-elevate rounded-xl px-3">
//             <h3 className="text-lg font-semibold truncate">
//               {t("filters.appearance")}
//             </h3>
//             <ChevronDown
//               className={`h-5 w-5 shrink-0 transition-transform ${openSections.appearance ? "rotate-180" : ""}`}
//             />
//           </CollapsibleTrigger>

//           <CollapsibleContent className="space-y-6 pt-4">
//             {/* COLOR */}
//             <div className="space-y-4">
//               <Label className="text-base font-medium">
//                 {t("filters.color")}
//               </Label>
//               <Select
//                 value={filters.color || "all"}
//                 onValueChange={(value) =>
//                   setColor(value === "all" ? "" : value)
//                 }
//               >
//                 <SelectTrigger
//                   className="h-12 rounded-xl text-black dark:text-white"
//                   data-testid="select-filter-color"
//                 >
//                   <SelectValue placeholder={t("filters.allColors")} />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem
//                     value="all"
//                     className="text-black dark:text-white"
//                   >
//                     {t("filters.allColors")}
//                   </SelectItem>
//                   {colors.map((color) => (
//                     <SelectItem
//                       key={color.value}
//                       value={color.value}
//                       className="text-black dark:text-white"
//                     >
//                       <div className="flex items-center gap-2">
//                         <div
//                           className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600 flex-shrink-0"
//                           style={{
//                             backgroundColor: color.hex,
//                             boxShadow:
//                               color.value === "white" || color.value === "ivory"
//                                 ? "inset 0 0 0 1px rgba(0,0,0,0.1)"
//                                 : "none",
//                           }}
//                         />
//                         <span>{color.label}</span>
//                       </div>
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             {/* TRIM */}
//             <div className="space-y-4">
//               <Label className="text-base font-medium">
//                 {t("filters.trim")}
//               </Label>
//               <Select value={filters.trim || ""} onValueChange={setTrim}>
//                 <SelectTrigger
//                   className="h-12 rounded-xl text-black dark:text-white"
//                   data-testid="select-filter-trim"
//                 >
//                   <SelectValue placeholder={t("filters.allTrims")} />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {trimLevels.map((trim) => (
//                     <SelectItem
//                       key={trim.value}
//                       value={trim.value}
//                       className="text-black dark:text-white"
//                     >
//                       {trim.label}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             {/* DOORS */}
//             <div className="space-y-4">
//               <Label className="text-base font-medium">
//                 {t("filters.doors")}
//               </Label>
//               <div className="grid grid-cols-2 gap-2">
//                 <Input
//                   type="number"
//                   min="2"
//                   max="6"
//                   placeholder={t("hero.from")}
//                   value={filters.doorsMin || ""}
//                   onChange={(e) => {
//                     const v = e.target.value
//                       ? Number(e.target.value)
//                       : undefined;
//                     setDoorsRange(v, filters.doorsMax);
//                   }}
//                   className="h-10 text-black dark:text-white"
//                   data-testid="input-doors-min"
//                 />
//                 <Input
//                   type="number"
//                   min="2"
//                   max="6"
//                   placeholder={t("hero.to")}
//                   value={filters.doorsMax || ""}
//                   onChange={(e) => {
//                     const v = e.target.value
//                       ? Number(e.target.value)
//                       : undefined;
//                     setDoorsRange(filters.doorsMin, v);
//                   }}
//                   className="h-10 text-black dark:text-white"
//                   data-testid="input-doors-max"
//                 />
//               </div>
//             </div>

//             {/* SEATS */}
//             <div className="space-y-4">
//               <Label className="text-base font-medium">
//                 {t("filters.seats")}
//               </Label>
//               <div className="grid grid-cols-2 gap-2">
//                 <Input
//                   type="number"
//                   min="2"
//                   max="9"
//                   placeholder={t("hero.from")}
//                   value={filters.seatsMin || ""}
//                   onChange={(e) => {
//                     const v = e.target.value
//                       ? Number(e.target.value)
//                       : undefined;
//                     setSeatsRange(v, filters.seatsMax);
//                   }}
//                   className="h-10 text-black dark:text-white"
//                   data-testid="input-seats-min"
//                 />
//                 <Input
//                   type="number"
//                   min="2"
//                   max="9"
//                   placeholder={t("hero.to")}
//                   value={filters.seatsMax || ""}
//                   onChange={(e) => {
//                     const v = e.target.value
//                       ? Number(e.target.value)
//                       : undefined;
//                     setSeatsRange(filters.seatsMin, v);
//                   }}
//                   className="h-10 text-black dark:text-white"
//                   data-testid="input-seats-max"
//                 />
//               </div>
//             </div>
//           </CollapsibleContent>
//         </Collapsible>

//         {/* EQUIPMENT */}
//         <Collapsible
//           open={openSections.equipment}
//           onOpenChange={() => toggleSection("equipment")}
//         >
//           <CollapsibleTrigger className="flex items-center justify-between gap-2 w-full py-2 hover-elevate rounded-xl px-3">
//             <h3 className="text-lg font-semibold truncate">
//               {t("filters.equipment")}
//             </h3>
//             <ChevronDown
//               className={`h-5 w-5 shrink-0 transition-transform ${openSections.equipment ? "rotate-180" : ""}`}
//             />
//           </CollapsibleTrigger>

//           <CollapsibleContent className="space-y-6 pt-4">
//             <div className="space-y-3">
//               {[
//                 { label: t("filters.heatedSeats"), key: "heated-seats" },
//                 {
//                   label: t("filters.electricWindows"),
//                   key: "electric-windows",
//                 },
//                 {
//                   label: t("filters.leatherInterior"),
//                   key: "leather-interior",
//                 },
//                 { label: t("filters.climateControl"), key: "climate-control" },
//                 { label: t("filters.cruiseControl"), key: "cruise-control" },
//                 { label: t("filters.parkingSensors"), key: "parking-sensors" },
//                 { label: t("filters.rearCamera"), key: "rear-camera" },
//                 { label: t("filters.navigationSystem"), key: "navigation" },
//                 { label: t("filters.bluetooth"), key: "bluetooth" },
//                 { label: t("filters.keylessEntry"), key: "keyless-entry" },
//                 { label: t("filters.ledHeadlights"), key: "led-headlights" },
//                 { label: t("filters.sunroof"), key: "sunroof" },
//                 { label: t("filters.alloyWheels"), key: "alloy-wheels" },
//                 {
//                   label: t("filters.ventilatedSeats"),
//                   key: "ventilated-seats",
//                 },
//                 { label: t("filters.memorySeats"), key: "memory-seats" },
//                 { label: t("filters.massageSeats"), key: "massage-seats" },
//                 { label: t("filters.adaptiveCruise"), key: "adaptive-cruise" },
//                 { label: t("filters.laneKeeping"), key: "lane-keeping" },
//                 { label: t("filters.blindSpot"), key: "blind-spot" },
//                 { label: t("filters.rainSensor"), key: "rain-sensor" },
//                 { label: t("filters.lightSensor"), key: "light-sensor" },
//                 {
//                   label: t("filters.heatedSteeringWheel"),
//                   key: "heated-steering",
//                 },
//                 { label: t("filters.panoramicRoof"), key: "panoramic-roof" },
//                 { label: t("filters.electricSeats"), key: "electric-seats" },
//                 { label: t("filters.parkingAssist"), key: "parking-assist" },
//                 { label: t("filters.headUpDisplay"), key: "head-up-display" },
//                 {
//                   label: t("filters.wirelessCharging"),
//                   key: "wireless-charging",
//                 },
//                 { label: t("filters.towHitch"), key: "tow-hitch" },
//               ].map((equipment) => (
//                 <div
//                   key={equipment.key}
//                   className="flex items-center space-x-2"
//                 >
//                   <Checkbox
//                     id={`equipment-${equipment.key}`}
//                     checked={
//                       filters.equipment?.includes(equipment.key) || false
//                     }
//                     onCheckedChange={() => handleEquipmentToggle(equipment.key)}
//                     data-testid={`checkbox-equipment-${equipment.key}`}
//                   />
//                   <label
//                     htmlFor={`equipment-${equipment.key}`}
//                     className="text-sm font-medium cursor-pointer text-black dark:text-white"
//                   >
//                     {equipment.label}
//                   </label>
//                 </div>
//               ))}
//             </div>
//           </CollapsibleContent>
//         </Collapsible>

//         {/* EXTRAS (залишив як у тебе — якщо треба привʼязати до filters, скажи які поля в бекенді) */}
//         <Collapsible
//           open={openSections.extras}
//           onOpenChange={() => toggleSection("extras")}
//         >
//           <CollapsibleTrigger className="flex items-center justify-between gap-2 w-full py-2 hover-elevate rounded-xl px-3">
//             <h3 className="text-lg font-semibold truncate">
//               {t("filters.additionalOptions")}
//             </h3>
//             <ChevronDown
//               className={`h-5 w-5 shrink-0 transition-transform ${openSections.extras ? "rotate-180" : ""}`}
//             />
//           </CollapsibleTrigger>

//           <CollapsibleContent className="space-y-6 pt-4">
//             <div className="space-y-3">
//               {[
//                 { label: t("filters.serviceBook"), key: "Servisní knížka" },
//                 { label: t("filters.notDamaged"), key: "Nepoškozený" },
//                 { label: t("filters.notPainted"), key: "Nelakovaný" },
//                 { label: t("filters.warranty"), key: "Záruka" },
//                 { label: t("filters.exchange"), key: "Výměna" },
//               ].map((extra) => (
//                 <div key={extra.key} className="flex items-center space-x-2">
//                   <Checkbox
//                     id={`extra-${extra.key}`}
//                     data-testid={`checkbox-extra-${extra.key.toLowerCase()}`}
//                   />
//                   <label
//                     htmlFor={`extra-${extra.key}`}
//                     className="text-sm font-medium cursor-pointer text-black dark:text-white"
//                   >
//                     {extra.label}
//                   </label>
//                 </div>
//               ))}
//             </div>
//           </CollapsibleContent>
//         </Collapsible>

//         {/* REGION */}
//         <Collapsible
//           open={openSections.region}
//           onOpenChange={() => toggleSection("region")}
//         >
//           <CollapsibleTrigger className="flex items-center justify-between gap-2 w-full py-2 hover-elevate rounded-xl px-3">
//             <h3 className="text-lg font-semibold truncate">
//               {t("filters.region")}
//             </h3>
//             <ChevronDown
//               className={`h-5 w-5 shrink-0 transition-transform ${openSections.region ? "rotate-180" : ""}`}
//             />
//           </CollapsibleTrigger>

//           <CollapsibleContent className="space-y-6 pt-4">
//             <RegionCombobox
//               value={filters.region || ""}
//               onValueChange={setRegion}
//               regions={regions}
//               placeholder={t("filters.allRegions")}
//               emptyMessage={t("hero.noRegionsFound")}
//               testId="select-filter-region"
//             />
//           </CollapsibleContent>
//         </Collapsible>

//         {/* APPLY */}
//         <Button
//           className="w-full h-12 rounded-xl shadow-md"
//           onClick={applyFilters}
//           data-testid="button-apply-filters"
//         >
//           {t("filters.apply")}
//         </Button>
//       </CardContent>
//     </Card>
//   );
// }

// export default memo(FilterSidebar);
"use client";

import { memo, useEffect, useMemo, useRef, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MonthPicker } from "@/components/ui/month-picker";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import {
  ChevronDown,
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

import { carBrands } from "@shared/carDatabase";

import { useFilterParams } from "@/hooks/useFilterParams";
import {
  useTranslation,
  useLocalizedOptions,
  vehicleTypeBrands,
  getModelsForVehicleType,
} from "@/lib/translations";

import newCarIcon from "@assets/3AAF8DD0-3B6D-4DA3-8A1E-2858FCC004A1_1763451350424.png";
import partsIcon from "@assets/62A9ABBD-0474-469C-8089-FA93C3E7C2B4_1763450942216.png";
import usedCarIcon from "@assets/ABAF6CAB-50AC-450D-8FE8-342C0DF354D6_1763451176037.png";
import orderCarIcon from "@assets/A6BE7880-928D-4532-BCB1-3FA4A34F89CE_1763451456108.png";
import motorcycleIcon from "@assets/44AD800C-C9BB-4F50-A278-5152E01D60BB_1763444856175.png";
import truckGoldIcon from "@assets/8C9B6F5F-55BC-402E-9359-B2707FE2FB81_1763444987490.png";
import carGoldIcon from "@assets/D545620E-B7EF-4EB5-AE03-389B4725412B_1763449648396.png";
import vanIcon from "@assets/4E8B9722-D061-47D3-9C2F-2C8C1070F01B_1763443339270.png";

import { brandIcons } from "@/lib/brandIcons";
import { bodyTypeIcons } from "@/lib/bodyTypeIcons";

import { PriceRangeInput } from "@/components/PriceRangeInput";
import { MileageRangeInput } from "@/components/MileageRangeInput";
import { YearRangeInput } from "@/components/YearRangeInput";
import { OwnersRangeInput } from "@/components/OwnersRangeInput";
import { ListingAgeRangeInput } from "@/components/ListingAgeRangeInput";
import { EngineRangeInput } from "@/components/EngineRangeInput";
import { PowerRangeInput } from "@/components/PowerRangeInput";

import { ModelCombobox } from "@/components/ModelCombobox";
import { BrandCombobox } from "@/components/BrandCombobox";
import { RegionCombobox } from "@/components/RegionCombobox";

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

// ✅ якщо в filters є "службові" поля (page, limit, sort) — і applyFilters їх сам ставить,
// то авто-аплай може зациклитися.
// Тут ми робимо "стабільний ключ" без службових полів:
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

function FilterSidebar() {
  const t = useTranslation();
  const localizedOptions = useLocalizedOptions();

  const colors = localizedOptions.getColors();
  const driveTypes = localizedOptions.getDriveTypes();
  const regions = localizedOptions.getRegions();
  const bodyTypes = localizedOptions.getBodyTypes();

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
    setTrim,
    setCondition,
    setEquipment,
    setRegion,
    setColor,
    setFuel,
    setTransmission,
    setDriveType,
    setEuroEmission,
    setStkValidUntil,
    setHasServiceBook,
    resetFilters,
    applyFilters,
  } = useFilterParams();

  const [openSections, setOpenSections] = useState({
    vehicleType: true,
    basic: true,
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

  const availableModels = useMemo(() => {
    return filters.brand
      ? getModelsForVehicleType(filters.brand, filters.vehicleType)
      : [];
  }, [filters.brand, filters.vehicleType]);

  const trimLevels = useMemo(
    () => [
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
    ],
    [t],
  );

  const priceMin = filters.priceMin;
  const priceMax = filters.priceMax;
  const yearMin = filters.yearMin ?? 1980;
  const yearMax = filters.yearMax ?? new Date().getFullYear();
  const mileageMin = filters.mileageMin ?? 0;
  const mileageMax = filters.mileageMax ?? 600000;
  const engineMin = filters.engineMin ?? 0;
  const engineMax = filters.engineMax ?? 6.0;
  const powerMin = filters.powerMin ?? 0;
  const powerMax = filters.powerMax ?? 1000;

  const handleConditionToggle = (value: string) => {
    const next = toggleInArray(filters.condition, value) ?? [];
    setCondition(next);
  };

  const handleEquipmentToggle = (value: string) => {
    const next = toggleInArray(filters.equipment, value) ?? [];
    setEquipment(next);
  };

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
      return {
        ...prev,
        vehicleType: nextBodyTypes?.length ? "osobni-auta" : prev.vehicleType,
        bodyType: nextBodyTypes,
      };
    });
  };

  const handleFuelToggle = (key: string) => {
    const next = toggleInCommaList(filters.fuel, key);
    setFuel(next);
  };

  const handleTransmissionToggle = (key: string) => {
    const next = toggleInCommaList(filters.transmission, key);
    setTransmission(next);
  };

  const handleDriveToggle = (key: string) => {
    const next = toggleInCommaList(filters.driveType, key);
    setDriveType(next);
  };

  const filteredBrands = useMemo(() => {
    return carBrands
      .filter((brand) => {
        if (filters.vehicleType && vehicleTypeBrands[filters.vehicleType]) {
          return vehicleTypeBrands[filters.vehicleType].includes(brand.value);
        }
        return true;
      })
      .map((brand) => ({
        ...brand,
        icon: brandIcons[brand.value],
      }));
  }, [filters.vehicleType]);

  // =========================
  // ✅ AUTO APPLY (без кнопки)
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

  return (
    <Card
      className={[
        "rounded-2xl shadow-xl bg-white dark:bg-background flex flex-col",
        "overflow-hidden",
        "max-h-[calc(100vh-1px)]",
      ].join(" ")}
    >
      <CardHeader className="shrink-0 flex flex-row items-center justify-between gap-2 space-y-0 pb-6">
        <CardTitle className="text-xl font-semibold truncate">
          {t("filters.title")}
        </CardTitle>

        <Button
          variant="ghost"
          size="sm"
          className="rounded-xl shrink-0"
          onClick={resetFilters}
          data-testid="button-reset-filters"
        >
          {t("filters.reset")}
        </Button>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto space-y-6 pr-4 pb-6 filters-scrollbar">
        {/* CONDITION */}
        <Collapsible
          open={openSections.condition}
          onOpenChange={() => toggleSection("condition")}
        >
          <CollapsibleTrigger className="flex items-center justify-between gap-2 w-full py-2 hover-elevate rounded-xl px-3">
            <h3 className="text-lg font-semibold truncate">
              {t("filters.conditionAndOwners")}
            </h3>
            <ChevronDown
              className={`h-5 w-5 shrink-0 transition-transform ${
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
                        icon: Key as any,
                        img: "",
                      },
                      {
                        label: t("filters.conditionDamaged"),
                        key: "Havarované",
                        icon: Wrench as any,
                        img: "",
                      },
                      {
                        label: t("filters.conditionHistoric"),
                        key: "Historické",
                        icon: Sparkles as any,
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
                    data-testid={`button-condition-${condition.key
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
                data-testid="button-toggle-conditions"
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
          <CollapsibleTrigger className="flex items-center justify-between gap-2 w-full py-2 hover-elevate rounded-xl px-3">
            <h3 className="text-lg font-semibold truncate">
              {t("listing.vehicleType")} / {t("filters.bodyType")}
            </h3>
            <ChevronDown
              className={`h-5 w-5 shrink-0 transition-transform ${
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
                  testId: "button-sidebar-vehicle-cars",
                },
                {
                  key: "dodavky",
                  label: t("hero.dodavky"),
                  img: vanIcon,
                  testId: "button-sidebar-vehicle-dodavky",
                },
                {
                  key: "nakladni-vozy",
                  label: t("hero.trucks"),
                  img: truckGoldIcon,
                  testId: "button-sidebar-vehicle-trucks",
                },
                {
                  key: "motorky",
                  label: t("hero.motorky"),
                  img: motorcycleIcon,
                  testId: "button-sidebar-vehicle-motorky",
                },
              ].map((item) => {
                const selected = splitComma(filters.vehicleType).includes(
                  item.key,
                );

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
                    data-testid={`button-sidebar-body-type-${type.value}`}
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
          <CollapsibleTrigger className="flex items-center justify-between gap-2 w-full py-2 hover-elevate rounded-xl px-3">
            <h3 className="text-lg font-semibold truncate">
              {t("filters.basicFilters")}
            </h3>
            <ChevronDown
              className={`h-5 w-5 shrink-0 transition-transform ${
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
                testId="select-filter-brand"
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
                  filters.brand ? t("hero.allModels") : t("hero.selectBrand")
                }
                emptyMessage={t("hero.noModelsFound")}
                testId="select-filter-model"
              />
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* PRICE + YEAR (always expanded; no toggle) */}
        <div className="pt-2">
          <div className="flex items-center justify-between gap-2 w-full py-2 rounded-xl px-3">
            <h3 className="text-lg font-semibold truncate">
              {t("filters.priceAndYear")}
            </h3>
          </div>

          <div className="space-y-6 pt-4">
            <div className="space-y-4">
              <PriceRangeInput
                minValue={priceMin}
                maxValue={priceMax}
                onMinChange={(value) => setPriceRange(value, priceMax)}
                onMaxChange={(value) => setPriceRange(priceMin, value)}
                variant="sidebar"
                testIdPrefix="sidebar-price"
              />

              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="sidebar-vat-deductible"
                  checked={filters.vatDeductible || false}
                  onCheckedChange={(checked) =>
                    setFilters((prev) => ({
                      ...prev,
                      vatDeductible: checked === true ? true : undefined,
                    }))
                  }
                  data-testid="checkbox-sidebar-vat-deductible"
                />
                <label
                  htmlFor="sidebar-vat-deductible"
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
                onMinChange={(value) => setMileageRange(value, mileageMax)}
                onMaxChange={(value) => setMileageRange(mileageMin, value)}
                variant="sidebar"
                testIdPrefix="sidebar-mileage"
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
                variant="sidebar"
                testIdPrefix="sidebar-year"
              />
            </div>
          </div>
        </div>

        {/* TECHNICAL */}
        <Collapsible
          open={openSections.technical}
          onOpenChange={() => toggleSection("technical")}
        >
          <CollapsibleTrigger className="flex items-center justify-between gap-2 w-full py-2 hover-elevate rounded-xl px-3">
            <h3 className="text-lg font-semibold truncate">
              {t("filters.technicalParams")}
            </h3>
            <ChevronDown
              className={`h-5 w-5 shrink-0 transition-transform ${
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
                variant="sidebar"
                testIdPrefix="sidebar-engine"
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
                variant="sidebar"
                testIdPrefix="sidebar-power"
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
                  const isChecked = splitComma(filters.fuel).includes(fuel.key);
                  return (
                    <div key={fuel.key} className="flex items-center space-x-2">
                      <Checkbox
                        id={`fuel-${fuel.key}`}
                        data-testid={`checkbox-fuel-${fuel.key.toLowerCase()}`}
                        checked={isChecked}
                        onCheckedChange={() => handleFuelToggle(fuel.key)}
                      />
                      <label
                        htmlFor={`fuel-${fuel.key}`}
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
                ].map((trans) => {
                  const Icon = trans.icon;
                  const isChecked = splitComma(filters.transmission).includes(
                    trans.key,
                  );
                  return (
                    <div
                      key={trans.key}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`trans-${trans.key}`}
                        data-testid={`checkbox-transmission-${trans.key.toLowerCase()}`}
                        checked={isChecked}
                        onCheckedChange={() =>
                          handleTransmissionToggle(trans.key)
                        }
                      />
                      <label
                        htmlFor={`trans-${trans.key}`}
                        className="text-sm font-medium cursor-pointer text-black dark:text-white flex items-center gap-2"
                      >
                        <Icon className="w-4 h-4 text-[#B8860B]" />
                        <span>{trans.label}</span>
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
                  const isChecked = splitComma(filters.driveType).includes(
                    drive.value,
                  );

                  return (
                    <div
                      key={drive.value}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`drive-${drive.value}`}
                        data-testid={`checkbox-drive-${drive.value}`}
                        checked={isChecked}
                        onCheckedChange={() => handleDriveToggle(drive.value)}
                      />
                      <label
                        htmlFor={`drive-${drive.value}`}
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
                minValue={filters.ownersMin || 0}
                maxValue={filters.ownersMax || 10}
                onMinChange={(value) =>
                  setOwnersRange(value, filters.ownersMax || 10)
                }
                onMaxChange={(value) =>
                  setOwnersRange(filters.ownersMin || 0, value)
                }
                variant="sidebar"
                testIdPrefix="sidebar-owners"
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
                  { key: "dealer" as const, label: t("filters.sellerDealer") },
                ].map((option) => {
                  const isSelected = filters.sellerType === option.key;
                  return (
                    <Button
                      key={option.key}
                      type="button"
                      variant={isSelected ? "default" : "outline"}
                      className={`h-auto py-2 px-3 text-xs ${
                        !isSelected ? "text-black dark:text-white" : ""
                      } ${isSelected ? "toggle-elevated" : ""} toggle-elevate`}
                      onClick={() =>
                        setSellerType(isSelected ? "" : option.key)
                      }
                      data-testid={`button-sidebar-seller-${option.key}`}
                    >
                      {option.label}
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
                variant="sidebar"
                testIdPrefix="sidebar-listing-age"
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
                  data-testid="select-filter-euro-emission"
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
                data-testid="input-sidebar-stk-valid"
              />
            </div>

            {/* SERVICE BOOK */}
            <div className="flex items-center space-x-2 py-2">
              <Checkbox
                id="filter-has-service-book"
                checked={filters.hasServiceBook || false}
                onCheckedChange={(checked) => setHasServiceBook(!!checked)}
                data-testid="checkbox-filter-service-book"
              />
              <label
                htmlFor="filter-has-service-book"
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
          <CollapsibleTrigger className="flex items-center justify-between gap-2 w-full py-2 hover-elevate rounded-xl px-3">
            <h3 className="text-lg font-semibold truncate">
              {t("filters.appearance")}
            </h3>
            <ChevronDown
              className={`h-5 w-5 shrink-0 transition-transform ${
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
                  data-testid="select-filter-color"
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
                              color.value === "white" || color.value === "ivory"
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
            </div>

            {/* TRIM */}
            <div className="space-y-4">
              <Label className="text-base font-medium">
                {t("filters.trim")}
              </Label>
              <Select value={filters.trim || ""} onValueChange={setTrim}>
                <SelectTrigger
                  className="h-12 rounded-xl text-black dark:text-white"
                  data-testid="select-filter-trim"
                >
                  <SelectValue placeholder={t("filters.allTrims")} />
                </SelectTrigger>
                <SelectContent>
                  {trimLevels.map((trim) => (
                    <SelectItem
                      key={trim.value}
                      value={trim.value}
                      className="text-black dark:text-white"
                    >
                      {trim.label}
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
                  value={filters.doorsMin || ""}
                  onChange={(e) => {
                    const v = e.target.value
                      ? Number(e.target.value)
                      : undefined;
                    setDoorsRange(v, filters.doorsMax);
                  }}
                  className="h-10 text-black dark:text-white"
                  data-testid="input-doors-min"
                />
                <Input
                  type="number"
                  min="2"
                  max="6"
                  placeholder={t("hero.to")}
                  value={filters.doorsMax || ""}
                  onChange={(e) => {
                    const v = e.target.value
                      ? Number(e.target.value)
                      : undefined;
                    setDoorsRange(filters.doorsMin, v);
                  }}
                  className="h-10 text-black dark:text-white"
                  data-testid="input-doors-max"
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
                  value={filters.seatsMin || ""}
                  onChange={(e) => {
                    const v = e.target.value
                      ? Number(e.target.value)
                      : undefined;
                    setSeatsRange(v, filters.seatsMax);
                  }}
                  className="h-10 text-black dark:text-white"
                  data-testid="input-seats-min"
                />
                <Input
                  type="number"
                  min="2"
                  max="9"
                  placeholder={t("hero.to")}
                  value={filters.seatsMax || ""}
                  onChange={(e) => {
                    const v = e.target.value
                      ? Number(e.target.value)
                      : undefined;
                    setSeatsRange(filters.seatsMin, v);
                  }}
                  className="h-10 text-black dark:text-white"
                  data-testid="input-seats-max"
                />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* EQUIPMENT */}
        <Collapsible
          open={openSections.equipment}
          onOpenChange={() => toggleSection("equipment")}
        >
          <CollapsibleTrigger className="flex items-center justify-between gap-2 w-full py-2 hover-elevate rounded-xl px-3">
            <h3 className="text-lg font-semibold truncate">
              {t("filters.equipment")}
            </h3>
            <ChevronDown
              className={`h-5 w-5 shrink-0 transition-transform ${
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
                { label: t("filters.climateControl"), key: "climate-control" },
                { label: t("filters.cruiseControl"), key: "cruise-control" },
                { label: t("filters.parkingSensors"), key: "parking-sensors" },
                { label: t("filters.rearCamera"), key: "rear-camera" },
                { label: t("filters.navigationSystem"), key: "navigation" },
                { label: t("filters.bluetooth"), key: "bluetooth" },
                { label: t("filters.keylessEntry"), key: "keyless-entry" },
                { label: t("filters.ledHeadlights"), key: "led-headlights" },
                { label: t("filters.sunroof"), key: "sunroof" },
                { label: t("filters.alloyWheels"), key: "alloy-wheels" },
                {
                  label: t("filters.ventilatedSeats"),
                  key: "ventilated-seats",
                },
                { label: t("filters.memorySeats"), key: "memory-seats" },
                { label: t("filters.massageSeats"), key: "massage-seats" },
                { label: t("filters.adaptiveCruise"), key: "adaptive-cruise" },
                { label: t("filters.laneKeeping"), key: "lane-keeping" },
                { label: t("filters.blindSpot"), key: "blind-spot" },
                { label: t("filters.rainSensor"), key: "rain-sensor" },
                { label: t("filters.lightSensor"), key: "light-sensor" },
                {
                  label: t("filters.heatedSteeringWheel"),
                  key: "heated-steering",
                },
                { label: t("filters.panoramicRoof"), key: "panoramic-roof" },
                { label: t("filters.electricSeats"), key: "electric-seats" },
                { label: t("filters.parkingAssist"), key: "parking-assist" },
                { label: t("filters.headUpDisplay"), key: "head-up-display" },
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
                    id={`equipment-${equipment.key}`}
                    checked={
                      filters.equipment?.includes(equipment.key) || false
                    }
                    onCheckedChange={() => handleEquipmentToggle(equipment.key)}
                    data-testid={`checkbox-equipment-${equipment.key}`}
                  />
                  <label
                    htmlFor={`equipment-${equipment.key}`}
                    className="text-sm font-medium cursor-pointer text-black dark:text-white"
                  >
                    {equipment.label}
                  </label>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* EXTRAS (не привʼязані до filters як і було) */}
        <Collapsible
          open={openSections.extras}
          onOpenChange={() => toggleSection("extras")}
        >
          <CollapsibleTrigger className="flex items-center justify-between gap-2 w-full py-2 hover-elevate rounded-xl px-3">
            <h3 className="text-lg font-semibold truncate">
              {t("filters.additionalOptions")}
            </h3>
            <ChevronDown
              className={`h-5 w-5 shrink-0 transition-transform ${
                openSections.extras ? "rotate-180" : ""
              }`}
            />
          </CollapsibleTrigger>

          <CollapsibleContent className="space-y-6 pt-4">
            <div className="space-y-3">
              {[
                { label: t("filters.serviceBook"), key: "Servisní knížka" },
                { label: t("filters.notDamaged"), key: "Nepoškozený" },
                { label: t("filters.notPainted"), key: "Nelakovaný" },
                { label: t("filters.warranty"), key: "Záruka" },
                { label: t("filters.exchange"), key: "Výměna" },
              ].map((extra) => (
                <div key={extra.key} className="flex items-center space-x-2">
                  <Checkbox
                    id={`extra-${extra.key}`}
                    data-testid={`checkbox-extra-${extra.key.toLowerCase()}`}
                  />
                  <label
                    htmlFor={`extra-${extra.key}`}
                    className="text-sm font-medium cursor-pointer text-black dark:text-white"
                  >
                    {extra.label}
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
          <CollapsibleTrigger className="flex items-center justify-between gap-2 w-full py-2 hover-elevate rounded-xl px-3">
            <h3 className="text-lg font-semibold truncate">
              {t("filters.region")}
            </h3>
            <ChevronDown
              className={`h-5 w-5 shrink-0 transition-transform ${
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
              testId="select-filter-region"
            />
          </CollapsibleContent>
        </Collapsible>

        {/* ✅ КНОПКУ APPLY ПРИБРАЛИ — тепер все застосовується автоматично */}
      </CardContent>
    </Card>
  );
}

export default memo(FilterSidebar);
