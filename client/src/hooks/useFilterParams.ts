// import { useState, useEffect, useCallback, useRef } from "react";
// import { useLocation } from "wouter";

// export interface FilterParams {
//   search?: string;
//   category?: string;
//   vehicleType?: string;
//   brand?: string;
//   model?: string;
//   priceMin?: number;
//   priceMax?: number;
//   yearMin?: number;
//   yearMax?: number;
//   mileageMin?: number;
//   mileageMax?: number;
//   fuel?: string;
//   bodyType?: string[];
//   transmission?: string;
//   color?: string;
//   trim?: string;
//   region?: string;
//   driveType?: string;
//   engineMin?: number;
//   engineMax?: number;
//   powerMin?: number;
//   powerMax?: number;
//   doorsMin?: number;
//   doorsMax?: number;
//   seatsMin?: number;
//   seatsMax?: number;
//   ownersMin?: number;
//   ownersMax?: number;
//   airbagsMin?: number;
//   airbagsMax?: number;
//   sellerType?: string;
//   listingAgeMin?: number;
//   listingAgeMax?: number;
//   condition?: string[];
//   extras?: string[];
//   equipment?: string[];
//   vatDeductible?: boolean;
//   euroEmission?: string;
//   stkValidUntil?: string;
//   hasServiceBook?: boolean;
// }

// // Custom event name for filter URL changes
// const FILTER_URL_CHANGE_EVENT = 'filterUrlChange';

// export function useFilterParams() {
//   const [location, setLocation] = useLocation();
//   const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
//   const [urlSearchState, setUrlSearchState] = useState(window.location.search);

//   const parseFiltersFromURL = useCallback((): FilterParams => {
//     const params = new URLSearchParams(window.location.search);

//     return {
//       search: params.get('search') || undefined,
//       category: params.get('category') || undefined,
//       vehicleType: params.get('vehicleType') || undefined,
//       brand: params.get('brand') || undefined,
//       model: params.get('model') || undefined,
//       priceMin: params.get('priceMin') ? parseInt(params.get('priceMin')!) : undefined,
//       priceMax: params.get('priceMax') ? parseInt(params.get('priceMax')!) : undefined,
//       yearMin: params.get('yearMin') ? parseInt(params.get('yearMin')!) : undefined,
//       yearMax: params.get('yearMax') ? parseInt(params.get('yearMax')!) : undefined,
//       mileageMin: params.get('mileageMin') ? parseInt(params.get('mileageMin')!) : undefined,
//       mileageMax: params.get('mileageMax') ? parseInt(params.get('mileageMax')!) : undefined,
//       fuel: params.get('fuel') || undefined,
//       bodyType: params.get('bodyType') ? params.get('bodyType')!.split(',') : undefined,
//       transmission: params.get('transmission') || undefined,
//       color: params.get('color') || undefined,
//       trim: params.get('trim') || undefined,
//       region: params.get('region') || undefined,
//       driveType: params.get('driveType') || undefined,
//       engineMin: params.get('engineMin') ? parseFloat(params.get('engineMin')!) : undefined,
//       engineMax: params.get('engineMax') ? parseFloat(params.get('engineMax')!) : undefined,
//       powerMin: params.get('powerMin') ? parseInt(params.get('powerMin')!) : undefined,
//       powerMax: params.get('powerMax') ? parseInt(params.get('powerMax')!) : undefined,
//       doorsMin: params.get('doorsMin') ? parseInt(params.get('doorsMin')!) : undefined,
//       doorsMax: params.get('doorsMax') ? parseInt(params.get('doorsMax')!) : undefined,
//       seatsMin: params.get('seatsMin') ? parseInt(params.get('seatsMin')!) : undefined,
//       seatsMax: params.get('seatsMax') ? parseInt(params.get('seatsMax')!) : undefined,
//       ownersMin: params.get('ownersMin') ? parseInt(params.get('ownersMin')!) : undefined,
//       ownersMax: params.get('ownersMax') ? parseInt(params.get('ownersMax')!) : undefined,
//       airbagsMin: params.get('airbagsMin') ? parseInt(params.get('airbagsMin')!) : undefined,
//       airbagsMax: params.get('airbagsMax') ? parseInt(params.get('airbagsMax')!) : undefined,
//       sellerType: params.get('sellerType') || undefined,
//       listingAgeMin: params.get('listingAgeMin') ? parseInt(params.get('listingAgeMin')!) : undefined,
//       listingAgeMax: params.get('listingAgeMax') ? parseInt(params.get('listingAgeMax')!) : undefined,
//       condition: params.get('condition') ? params.get('condition')!.split(',') : undefined,
//       extras: params.get('extras') ? params.get('extras')!.split(',') : undefined,
//       equipment: params.get('equipment') ? params.get('equipment')!.split(',') : undefined,
//       vatDeductible: params.get('vatDeductible') === 'true' ? true : undefined,
//       euroEmission: params.get('euroEmission') || undefined,
//       stkValidUntil: params.get('stkValidUntil') || undefined,
//       hasServiceBook: params.get('hasServiceBook') === 'true' ? true : undefined,
//     };
//   }, []);

//   const [filters, setFiltersState] = useState<FilterParams>(parseFiltersFromURL);

//   // Listen for URL changes from various sources
//   useEffect(() => {
//     const handleUrlChange = () => {
//       setUrlSearchState(window.location.search);
//     };

//     // Browser back/forward navigation
//     window.addEventListener('popstate', handleUrlChange);
//     // Custom event for programmatic navigation
//     window.addEventListener(FILTER_URL_CHANGE_EVENT, handleUrlChange);

//     return () => {
//       window.removeEventListener('popstate', handleUrlChange);
//       window.removeEventListener(FILTER_URL_CHANGE_EVENT, handleUrlChange);
//     };
//   }, []);

//   // Re-parse filters when URL changes
//   useEffect(() => {
//     const updatedFilters = parseFiltersFromURL();
//     setFiltersState(updatedFilters);
//   }, [location, urlSearchState, parseFiltersFromURL]);

//   const updateURL = useCallback((newFilters: FilterParams) => {
//     // Build URL exclusively from newFilters to avoid stale query string issues
//     // Only preserve non-filter params like userId from current URL
//     const currentParams = new URLSearchParams(window.location.search);
//     const userId = currentParams.get('userId');

//     // Start with a fresh URLSearchParams and build from newFilters only
//     const params = new URLSearchParams();

//     // Restore non-filter params first
//     if (userId) params.set('userId', userId);

//     if (newFilters.search) params.set('search', newFilters.search);
//     if (newFilters.category) params.set('category', newFilters.category);
//     if (newFilters.vehicleType) params.set('vehicleType', newFilters.vehicleType);
//     if (newFilters.brand) params.set('brand', newFilters.brand);
//     if (newFilters.model) params.set('model', newFilters.model);
//     if (newFilters.priceMin !== undefined && !isNaN(newFilters.priceMin)) params.set('priceMin', String(newFilters.priceMin));
//     if (newFilters.priceMax !== undefined && !isNaN(newFilters.priceMax)) params.set('priceMax', String(newFilters.priceMax));
//     if (newFilters.yearMin !== undefined && !isNaN(newFilters.yearMin)) params.set('yearMin', String(newFilters.yearMin));
//     if (newFilters.yearMax !== undefined && !isNaN(newFilters.yearMax)) params.set('yearMax', String(newFilters.yearMax));
//     if (newFilters.mileageMin !== undefined && !isNaN(newFilters.mileageMin)) params.set('mileageMin', String(newFilters.mileageMin));
//     if (newFilters.mileageMax !== undefined && !isNaN(newFilters.mileageMax)) params.set('mileageMax', String(newFilters.mileageMax));
//     if (newFilters.fuel) params.set('fuel', newFilters.fuel);
//     if (newFilters.bodyType && newFilters.bodyType.length > 0) params.set('bodyType', newFilters.bodyType.join(','));
//     if (newFilters.transmission) params.set('transmission', newFilters.transmission);
//     if (newFilters.color) params.set('color', newFilters.color);
//     if (newFilters.trim) params.set('trim', newFilters.trim);
//     if (newFilters.region) params.set('region', newFilters.region);
//     if (newFilters.driveType) params.set('driveType', newFilters.driveType);
//     if (newFilters.engineMin !== undefined && !isNaN(newFilters.engineMin)) params.set('engineMin', String(newFilters.engineMin));
//     if (newFilters.engineMax !== undefined && !isNaN(newFilters.engineMax)) params.set('engineMax', String(newFilters.engineMax));
//     if (newFilters.powerMin !== undefined && !isNaN(newFilters.powerMin)) params.set('powerMin', String(newFilters.powerMin));
//     if (newFilters.powerMax !== undefined && !isNaN(newFilters.powerMax)) params.set('powerMax', String(newFilters.powerMax));
//     if (newFilters.doorsMin !== undefined && !isNaN(newFilters.doorsMin)) params.set('doorsMin', String(newFilters.doorsMin));
//     if (newFilters.doorsMax !== undefined && !isNaN(newFilters.doorsMax)) params.set('doorsMax', String(newFilters.doorsMax));
//     if (newFilters.seatsMin !== undefined && !isNaN(newFilters.seatsMin)) params.set('seatsMin', String(newFilters.seatsMin));
//     if (newFilters.seatsMax !== undefined && !isNaN(newFilters.seatsMax)) params.set('seatsMax', String(newFilters.seatsMax));
//     if (newFilters.ownersMin !== undefined && !isNaN(newFilters.ownersMin)) params.set('ownersMin', String(newFilters.ownersMin));
//     if (newFilters.ownersMax !== undefined && !isNaN(newFilters.ownersMax)) params.set('ownersMax', String(newFilters.ownersMax));
//     if (newFilters.airbagsMin !== undefined && !isNaN(newFilters.airbagsMin)) params.set('airbagsMin', String(newFilters.airbagsMin));
//     if (newFilters.airbagsMax !== undefined && !isNaN(newFilters.airbagsMax)) params.set('airbagsMax', String(newFilters.airbagsMax));
//     if (newFilters.sellerType) params.set('sellerType', newFilters.sellerType);
//     if (newFilters.listingAgeMin !== undefined && !isNaN(newFilters.listingAgeMin)) params.set('listingAgeMin', String(newFilters.listingAgeMin));
//     if (newFilters.listingAgeMax !== undefined && !isNaN(newFilters.listingAgeMax)) params.set('listingAgeMax', String(newFilters.listingAgeMax));
//     if (newFilters.condition && newFilters.condition.length > 0) params.set('condition', newFilters.condition.join(','));
//     if (newFilters.extras && newFilters.extras.length > 0) params.set('extras', newFilters.extras.join(','));
//     if (newFilters.equipment && newFilters.equipment.length > 0) params.set('equipment', newFilters.equipment.join(','));
//     if (newFilters.vatDeductible) params.set('vatDeductible', 'true');
//     if (newFilters.euroEmission) params.set('euroEmission', newFilters.euroEmission);
//     if (newFilters.stkValidUntil) params.set('stkValidUntil', newFilters.stkValidUntil);
//     if (newFilters.hasServiceBook) params.set('hasServiceBook', 'true');

//     const queryString = params.toString();
//     const currentPath = location.includes('?') ? location.split('?')[0] : location;
//     const newPath = queryString ? `${currentPath}?${queryString}` : currentPath;
//     setLocation(newPath);

//     // Dispatch custom event to notify all hook instances of URL change
//     setTimeout(() => {
//       window.dispatchEvent(new CustomEvent(FILTER_URL_CHANGE_EVENT));
//     }, 0);
//   }, [location, setLocation]);

//   const setFilters = useCallback((updater: FilterParams | ((prev: FilterParams) => FilterParams), shouldDebounce = false) => {
//     setFiltersState((prev) => {
//       const newFilters = typeof updater === 'function' ? updater(prev) : updater;

//       if (shouldDebounce) {
//         if (debounceTimerRef.current) {
//           clearTimeout(debounceTimerRef.current);
//         }
//         debounceTimerRef.current = setTimeout(() => {
//           updateURL(newFilters);
//         }, 300);
//       } else {
//         updateURL(newFilters);
//       }

//       return newFilters;
//     });
//   }, [updateURL]);

//   const setCategory = useCallback((category: string) => {
//     setFilters(prev => ({ ...prev, category }));
//   }, [setFilters]);

//   const setBrand = useCallback((brand: string) => {
//     setFilters(prev => ({ ...prev, brand, model: undefined }));
//   }, [setFilters]);

//   const setModel = useCallback((model: string) => {
//     setFilters(prev => ({ ...prev, model }));
//   }, [setFilters]);

//   const setPriceRange = useCallback((min: number | undefined, max: number | undefined) => {
//     setFilters(prev => ({ ...prev, priceMin: min, priceMax: max }), true);
//   }, [setFilters]);

//   const setYearRange = useCallback((min: number | undefined, max: number | undefined) => {
//     setFilters(prev => ({ ...prev, yearMin: min, yearMax: max }), true);
//   }, [setFilters]);

//   const setMileageRange = useCallback((min: number | undefined, max: number | undefined) => {
//     setFilters(prev => ({ ...prev, mileageMin: min, mileageMax: max }), true);
//   }, [setFilters]);

//   const setVehicleType = useCallback((vehicleType: string) => {
//     setFilters(prev => ({ ...prev, vehicleType }));
//   }, [setFilters]);

//   const setFuel = useCallback((fuel: string) => {
//     setFilters(prev => ({ ...prev, fuel }));
//   }, [setFilters]);

//   const setBodyType = useCallback((bodyType: string[]) => {
//     setFilters(prev => ({ ...prev, bodyType }));
//   }, [setFilters]);

//   const toggleBodyType = useCallback((value: string) => {
//     setFilters(prev => {
//       const current = prev.bodyType || [];
//       const newBodyType = current.includes(value)
//         ? current.filter(v => v !== value)
//         : [...current, value];
//       return { ...prev, bodyType: newBodyType.length > 0 ? newBodyType : undefined };
//     });
//   }, [setFilters]);

//   const setTransmission = useCallback((transmission: string) => {
//     setFilters(prev => ({ ...prev, transmission }));
//   }, [setFilters]);

//   const setColor = useCallback((color: string) => {
//     setFilters(prev => ({ ...prev, color }));
//   }, [setFilters]);

//   const setTrim = useCallback((trim: string) => {
//     setFilters(prev => ({ ...prev, trim }));
//   }, [setFilters]);

//   const setRegion = useCallback((region: string) => {
//     setFilters(prev => ({ ...prev, region }));
//   }, [setFilters]);

//   const setDriveType = useCallback((driveType: string) => {
//     setFilters(prev => ({ ...prev, driveType }));
//   }, [setFilters]);

//   const setEngineRange = useCallback((min: number | undefined, max: number | undefined) => {
//     setFilters(prev => ({ ...prev, engineMin: min, engineMax: max }), true);
//   }, [setFilters]);

//   const setPowerRange = useCallback((min: number | undefined, max: number | undefined) => {
//     setFilters(prev => ({ ...prev, powerMin: min, powerMax: max }), true);
//   }, [setFilters]);

//   const setDoorsRange = useCallback((min: number | undefined, max: number | undefined) => {
//     setFilters(prev => ({ ...prev, doorsMin: min, doorsMax: max }), true);
//   }, [setFilters]);

//   const setSeatsRange = useCallback((min: number | undefined, max: number | undefined) => {
//     setFilters(prev => ({ ...prev, seatsMin: min, seatsMax: max }), true);
//   }, [setFilters]);

//   const setOwnersRange = useCallback((min: number | undefined, max: number | undefined) => {
//     setFilters(prev => ({ ...prev, ownersMin: min, ownersMax: max }), true);
//   }, [setFilters]);

//   const setAirbagsRange = useCallback((min: number | undefined, max: number | undefined) => {
//     setFilters(prev => ({ ...prev, airbagsMin: min, airbagsMax: max }), true);
//   }, [setFilters]);

//   const setSellerType = useCallback((sellerType: string) => {
//     setFilters(prev => ({ ...prev, sellerType }));
//   }, [setFilters]);

//   const setListingAgeRange = useCallback((min: number | undefined, max: number | undefined) => {
//     setFilters(prev => ({ ...prev, listingAgeMin: min, listingAgeMax: max }), true);
//   }, [setFilters]);

//   const setCondition = useCallback((condition: string[]) => {
//     setFilters(prev => ({ ...prev, condition }));
//   }, [setFilters]);

//   const setExtras = useCallback((extras: string[]) => {
//     setFilters(prev => ({ ...prev, extras }));
//   }, [setFilters]);

//   const setEquipment = useCallback((equipment: string[]) => {
//     setFilters(prev => ({ ...prev, equipment }));
//   }, [setFilters]);

//   const setEuroEmission = useCallback((euroEmission: string) => {
//     setFilters(prev => ({ ...prev, euroEmission: euroEmission || undefined }));
//   }, [setFilters]);

//   const setStkValidUntil = useCallback((stkValidUntil: string) => {
//     setFilters(prev => ({ ...prev, stkValidUntil: stkValidUntil || undefined }));
//   }, [setFilters]);

//   const setHasServiceBook = useCallback((hasServiceBook: boolean) => {
//     setFilters(prev => ({ ...prev, hasServiceBook: hasServiceBook || undefined }));
//   }, [setFilters]);

//   const setSearch = useCallback((search: string) => {
//     setFilters(prev => ({ ...prev, search: search || undefined }));
//   }, [setFilters]);

//   const resetFilters = useCallback(() => {
//     setFilters({});
//   }, [setFilters]);

//   const applyFilters = useCallback(() => {
//     const params = new URLSearchParams();

//     if (filters.search) params.set('search', filters.search);
//     if (filters.category) params.set('category', filters.category);
//     if (filters.vehicleType) params.set('vehicleType', filters.vehicleType);
//     if (filters.brand) params.set('brand', filters.brand);
//     if (filters.model) params.set('model', filters.model);
//     if (filters.priceMin !== undefined && !isNaN(filters.priceMin)) params.set('priceMin', String(filters.priceMin));
//     if (filters.priceMax !== undefined && !isNaN(filters.priceMax)) params.set('priceMax', String(filters.priceMax));
//     if (filters.yearMin !== undefined && !isNaN(filters.yearMin)) params.set('yearMin', String(filters.yearMin));
//     if (filters.yearMax !== undefined && !isNaN(filters.yearMax)) params.set('yearMax', String(filters.yearMax));
//     if (filters.mileageMin !== undefined && !isNaN(filters.mileageMin)) params.set('mileageMin', String(filters.mileageMin));
//     if (filters.mileageMax !== undefined && !isNaN(filters.mileageMax)) params.set('mileageMax', String(filters.mileageMax));
//     if (filters.fuel) params.set('fuel', filters.fuel);
//     if (filters.bodyType && filters.bodyType.length > 0) params.set('bodyType', filters.bodyType.join(','));
//     if (filters.transmission) params.set('transmission', filters.transmission);
//     if (filters.color) params.set('color', filters.color);
//     if (filters.trim) params.set('trim', filters.trim);
//     if (filters.region) params.set('region', filters.region);
//     if (filters.driveType) params.set('driveType', filters.driveType);
//     if (filters.engineMin !== undefined && !isNaN(filters.engineMin)) params.set('engineMin', String(filters.engineMin));
//     if (filters.engineMax !== undefined && !isNaN(filters.engineMax)) params.set('engineMax', String(filters.engineMax));
//     if (filters.powerMin !== undefined && !isNaN(filters.powerMin)) params.set('powerMin', String(filters.powerMin));
//     if (filters.powerMax !== undefined && !isNaN(filters.powerMax)) params.set('powerMax', String(filters.powerMax));
//     if (filters.doorsMin !== undefined && !isNaN(filters.doorsMin)) params.set('doorsMin', String(filters.doorsMin));
//     if (filters.doorsMax !== undefined && !isNaN(filters.doorsMax)) params.set('doorsMax', String(filters.doorsMax));
//     if (filters.seatsMin !== undefined && !isNaN(filters.seatsMin)) params.set('seatsMin', String(filters.seatsMin));
//     if (filters.seatsMax !== undefined && !isNaN(filters.seatsMax)) params.set('seatsMax', String(filters.seatsMax));
//     if (filters.ownersMin !== undefined && !isNaN(filters.ownersMin)) params.set('ownersMin', String(filters.ownersMin));
//     if (filters.ownersMax !== undefined && !isNaN(filters.ownersMax)) params.set('ownersMax', String(filters.ownersMax));
//     if (filters.airbagsMin !== undefined && !isNaN(filters.airbagsMin)) params.set('airbagsMin', String(filters.airbagsMin));
//     if (filters.airbagsMax !== undefined && !isNaN(filters.airbagsMax)) params.set('airbagsMax', String(filters.airbagsMax));
//     if (filters.sellerType) params.set('sellerType', filters.sellerType);
//     if (filters.listingAgeMin !== undefined && !isNaN(filters.listingAgeMin)) params.set('listingAgeMin', String(filters.listingAgeMin));
//     if (filters.listingAgeMax !== undefined && !isNaN(filters.listingAgeMax)) params.set('listingAgeMax', String(filters.listingAgeMax));
//     if (filters.condition && filters.condition.length > 0) params.set('condition', filters.condition.join(','));
//     if (filters.extras && filters.extras.length > 0) params.set('extras', filters.extras.join(','));
//     if (filters.equipment && filters.equipment.length > 0) params.set('equipment', filters.equipment.join(','));
//     if (filters.vatDeductible) params.set('vatDeductible', 'true');
//     if (filters.euroEmission) params.set('euroEmission', filters.euroEmission);
//     if (filters.stkValidUntil) params.set('stkValidUntil', filters.stkValidUntil);
//     if (filters.hasServiceBook) params.set('hasServiceBook', 'true');

//     const queryString = params.toString();
//     const targetUrl = queryString ? `/listings?${queryString}` : '/listings';
//     setLocation(targetUrl);

//     // Dispatch custom event to notify all hook instances of URL change
//     // Use setTimeout to ensure URL has been updated before event fires
//     setTimeout(() => {
//       window.dispatchEvent(new CustomEvent(FILTER_URL_CHANGE_EVENT));
//     }, 0);
//   }, [filters, setLocation]);

//   return {
//     filters,
//     setFilters,
//     setSearch,
//     setCategory,
//     setVehicleType,
//     setBrand,
//     setModel,
//     setPriceRange,
//     setYearRange,
//     setMileageRange,
//     setFuel,
//     setBodyType,
//     toggleBodyType,
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
//     setAirbagsRange,
//     setSellerType,
//     setListingAgeRange,
//     setCondition,
//     setExtras,
//     setEquipment,
//     setEuroEmission,
//     setStkValidUntil,
//     setHasServiceBook,
//     resetFilters,
//     applyFilters,
//   };
// }
import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "@/lib/navigation";

export interface FilterParams {
  search?: string;
  category?: string;
  vehicleType?: string;
  brand?: string;
  model?: string;
  generation?: string;
  priceMin?: number;
  priceMax?: number;
  yearMin?: number;
  yearMax?: number;
  mileageMin?: number;
  mileageMax?: number;
  fuel?: string;
  bodyType?: string[];
  transmission?: string;
  color?: string;
  trim?: string;
  region?: string;
  driveType?: string;
  engineMin?: number;
  engineMax?: number;
  powerMin?: number;
  powerMax?: number;
  doorsMin?: number;
  doorsMax?: number;
  seatsMin?: number;
  seatsMax?: number;
  ownersMin?: number;
  ownersMax?: number;
  airbagsMin?: number;
  airbagsMax?: number;
  sellerType?: string;
  listingAgeMin?: number;
  listingAgeMax?: number;
  condition?: string[];
  extras?: string[];
  equipment?: string[];
  vatDeductible?: boolean;
  euroEmission?: string;
  stkValidUntil?: string;
  hasServiceBook?: boolean;
}

const FILTERS_URL_CHANGE_EVENT = "nnauto:filters-url-change";

const normalizeSingleVehicleType = (
  vehicleType?: string | null,
): string | undefined => {
  if (!vehicleType) return undefined;
  const normalizeVehicleTypeKey = (rawType: string): string => {
    const normalized = rawType
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[\s_/]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    const aliases: Record<string, string> = {
      "osobni-auta": "osobni-auta",
      "osobni-auto": "osobni-auta",
      "osobni": "osobni-auta",
      "dodavky": "dodavky",
      "dodavka": "dodavky",
      "nakladni-vozy": "nakladni-vozy",
      "nakladni-vuz": "nakladni-vozy",
      "nakladni": "nakladni-vozy",
      "motorky": "motorky",
      "motorka": "motorky",
      moto: "motorky",
      "suv-offroad": "suv-offroad",
      "suv-off-road": "suv-offroad",
      suv: "suv-offroad",
      offroad: "suv-offroad",
      elektro: "elektro",
      elektricke: "elektro",
      electric: "elektro",
    };

    return aliases[normalized] || normalized;
  };

  const parts = vehicleType
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  if (!parts.length) return undefined;
  // Keep the most recently selected type when legacy comma lists are present.
  return normalizeVehicleTypeKey(parts[parts.length - 1]);
};

const normalizeFilters = (filters: FilterParams): Record<string, unknown> => {
  const normalized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null) continue;
    if (typeof value === "string" && value.trim() === "") continue;
    if (Array.isArray(value) && value.length === 0) continue;
    normalized[key] = value;
  }
  return normalized;
};

const areFiltersEqual = (left: FilterParams, right: FilterParams): boolean => {
  const a = normalizeFilters(left);
  const b = normalizeFilters(right);
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);

  if (aKeys.length !== bKeys.length) return false;

  for (const key of aKeys) {
    if (!(key in b)) return false;
    const aValue = a[key];
    const bValue = b[key];

    if (Array.isArray(aValue) || Array.isArray(bValue)) {
      if (!Array.isArray(aValue) || !Array.isArray(bValue)) return false;
      if (aValue.length !== bValue.length) return false;
      for (let i = 0; i < aValue.length; i += 1) {
        if (aValue[i] !== bValue[i]) return false;
      }
      continue;
    }

    if (aValue !== bValue) return false;
  }

  return true;
};

export function useFilterParams(options?: { autoNavigate?: boolean }) {
  const autoNavigate = options?.autoNavigate ?? true;

  const [location, setLocation] = useLocation();
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [urlSearchState, setUrlSearchState] = useState(
    typeof window !== "undefined" ? window.location.search : "",
  );

  // Prevent a pending debounced URL update from firing after unmount (e.g. user opens a listing)
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    };
  }, []);

  const parseFiltersFromURL = useCallback((): FilterParams => {
    const params = new URLSearchParams(window.location.search);

    return {
      search: params.get("search") || undefined,
      // Legacy category filter is no longer used in UI filtering flow.
      category: undefined,
      vehicleType: normalizeSingleVehicleType(
        params.get("vehicleType") || params.get("vehicle_type"),
      ),
      brand: params.get("brand") || undefined,
      model: params.get("model") || undefined,
      generation: params.get("generation") || undefined,
      priceMin: params.get("priceMin")
        ? parseInt(params.get("priceMin")!)
        : undefined,
      priceMax: params.get("priceMax")
        ? parseInt(params.get("priceMax")!)
        : undefined,
      yearMin: params.get("yearMin")
        ? parseInt(params.get("yearMin")!)
        : undefined,
      yearMax: params.get("yearMax")
        ? parseInt(params.get("yearMax")!)
        : undefined,
      mileageMin: params.get("mileageMin")
        ? parseInt(params.get("mileageMin")!)
        : undefined,
      mileageMax: params.get("mileageMax")
        ? parseInt(params.get("mileageMax")!)
        : undefined,
      fuel: params.get("fuel") || undefined,
      bodyType: params.get("bodyType")
        ? params.get("bodyType")!.split(",")
        : undefined,
      transmission: params.get("transmission") || undefined,
      color: params.get("color") || undefined,
      trim: params.get("trim") || undefined,
      region: params.get("region") || undefined,
      driveType: params.get("driveType") || undefined,
      engineMin: params.get("engineMin")
        ? parseFloat(params.get("engineMin")!)
        : undefined,
      engineMax: params.get("engineMax")
        ? parseFloat(params.get("engineMax")!)
        : undefined,
      powerMin: params.get("powerMin")
        ? parseInt(params.get("powerMin")!)
        : undefined,
      powerMax: params.get("powerMax")
        ? parseInt(params.get("powerMax")!)
        : undefined,
      doorsMin: params.get("doorsMin")
        ? parseInt(params.get("doorsMin")!)
        : undefined,
      doorsMax: params.get("doorsMax")
        ? parseInt(params.get("doorsMax")!)
        : undefined,
      seatsMin: params.get("seatsMin")
        ? parseInt(params.get("seatsMin")!)
        : undefined,
      seatsMax: params.get("seatsMax")
        ? parseInt(params.get("seatsMax")!)
        : undefined,
      ownersMin: params.get("ownersMin")
        ? parseInt(params.get("ownersMin")!)
        : undefined,
      ownersMax: params.get("ownersMax")
        ? parseInt(params.get("ownersMax")!)
        : undefined,
      airbagsMin: params.get("airbagsMin")
        ? parseInt(params.get("airbagsMin")!)
        : undefined,
      airbagsMax: params.get("airbagsMax")
        ? parseInt(params.get("airbagsMax")!)
        : undefined,
      sellerType: params.get("sellerType") || undefined,
      listingAgeMin: params.get("listingAgeMin")
        ? parseInt(params.get("listingAgeMin")!)
        : undefined,
      listingAgeMax: params.get("listingAgeMax")
        ? parseInt(params.get("listingAgeMax")!)
        : undefined,
      condition: params.get("condition")
        ? params.get("condition")!.split(",")
        : undefined,
      extras: params.get("extras")
        ? params.get("extras")!.split(",")
        : undefined,
      equipment: params.get("equipment")
        ? params.get("equipment")!.split(",")
        : undefined,
      vatDeductible: params.get("vatDeductible") === "true" ? true : undefined,
      euroEmission: params.get("euroEmission") || undefined,
      stkValidUntil: params.get("stkValidUntil") || undefined,
      hasServiceBook:
        params.get("hasServiceBook") === "true" ? true : undefined,
    };
  }, []);

  const initialFilters = parseFiltersFromURL();
  const [filters, setFiltersState] = useState<FilterParams>(() => initialFilters);
  const latestFiltersRef = useRef<FilterParams>(initialFilters);

  // Listen for browser URL changes
  useEffect(() => {
    const handleUrlChange = () => {
      setUrlSearchState(window.location.search);
    };

    window.addEventListener("popstate", handleUrlChange);
    window.addEventListener(FILTERS_URL_CHANGE_EVENT, handleUrlChange);

    return () => {
      window.removeEventListener("popstate", handleUrlChange);
      window.removeEventListener(FILTERS_URL_CHANGE_EVENT, handleUrlChange);
    };
  }, []);

  // Re-parse filters when URL changes
  useEffect(() => {
    const updatedFilters = parseFiltersFromURL();
    latestFiltersRef.current = updatedFilters;
    setFiltersState((prev) =>
      areFiltersEqual(prev, updatedFilters) ? prev : updatedFilters,
    );
  }, [location, urlSearchState, parseFiltersFromURL]);

  const updateURL = useCallback(
    (newFilters: FilterParams) => {
      if (!autoNavigate) return;
      // Build URL exclusively from newFilters to avoid stale query string issues
      // Only preserve non-filter params like userId from current URL
      const currentParams = new URLSearchParams(window.location.search);
      const userId = currentParams.get("userId");

      // Start with a fresh URLSearchParams and build from newFilters only
      const params = new URLSearchParams();

      // Restore non-filter params first
      if (userId) params.set("userId", userId);

      if (newFilters.search) params.set("search", newFilters.search);
      const normalizedVehicleType = normalizeSingleVehicleType(
        newFilters.vehicleType,
      );
      if (normalizedVehicleType)
        params.set("vehicleType", normalizedVehicleType);
      if (newFilters.brand) params.set("brand", newFilters.brand);
      if (newFilters.model) params.set("model", newFilters.model);
      if (newFilters.generation) params.set("generation", newFilters.generation);
      if (newFilters.priceMin !== undefined && !isNaN(newFilters.priceMin))
        params.set("priceMin", String(newFilters.priceMin));
      if (newFilters.priceMax !== undefined && !isNaN(newFilters.priceMax))
        params.set("priceMax", String(newFilters.priceMax));
      if (newFilters.yearMin !== undefined && !isNaN(newFilters.yearMin))
        params.set("yearMin", String(newFilters.yearMin));
      if (newFilters.yearMax !== undefined && !isNaN(newFilters.yearMax))
        params.set("yearMax", String(newFilters.yearMax));
      if (newFilters.mileageMin !== undefined && !isNaN(newFilters.mileageMin))
        params.set("mileageMin", String(newFilters.mileageMin));
      if (newFilters.mileageMax !== undefined && !isNaN(newFilters.mileageMax))
        params.set("mileageMax", String(newFilters.mileageMax));
      if (newFilters.fuel) params.set("fuel", newFilters.fuel);
      if (newFilters.bodyType && newFilters.bodyType.length > 0)
        params.set("bodyType", newFilters.bodyType.join(","));
      if (newFilters.transmission)
        params.set("transmission", newFilters.transmission);
      if (newFilters.color) params.set("color", newFilters.color);
      if (newFilters.trim) params.set("trim", newFilters.trim);
      if (newFilters.region) params.set("region", newFilters.region);
      if (newFilters.driveType) params.set("driveType", newFilters.driveType);
      if (newFilters.engineMin !== undefined && !isNaN(newFilters.engineMin))
        params.set("engineMin", String(newFilters.engineMin));
      if (newFilters.engineMax !== undefined && !isNaN(newFilters.engineMax))
        params.set("engineMax", String(newFilters.engineMax));
      if (newFilters.powerMin !== undefined && !isNaN(newFilters.powerMin))
        params.set("powerMin", String(newFilters.powerMin));
      if (newFilters.powerMax !== undefined && !isNaN(newFilters.powerMax))
        params.set("powerMax", String(newFilters.powerMax));
      if (newFilters.doorsMin !== undefined && !isNaN(newFilters.doorsMin))
        params.set("doorsMin", String(newFilters.doorsMin));
      if (newFilters.doorsMax !== undefined && !isNaN(newFilters.doorsMax))
        params.set("doorsMax", String(newFilters.doorsMax));
      if (newFilters.seatsMin !== undefined && !isNaN(newFilters.seatsMin))
        params.set("seatsMin", String(newFilters.seatsMin));
      if (newFilters.seatsMax !== undefined && !isNaN(newFilters.seatsMax))
        params.set("seatsMax", String(newFilters.seatsMax));
      if (newFilters.ownersMin !== undefined && !isNaN(newFilters.ownersMin))
        params.set("ownersMin", String(newFilters.ownersMin));
      if (newFilters.ownersMax !== undefined && !isNaN(newFilters.ownersMax))
        params.set("ownersMax", String(newFilters.ownersMax));
      if (newFilters.airbagsMin !== undefined && !isNaN(newFilters.airbagsMin))
        params.set("airbagsMin", String(newFilters.airbagsMin));
      if (newFilters.airbagsMax !== undefined && !isNaN(newFilters.airbagsMax))
        params.set("airbagsMax", String(newFilters.airbagsMax));
      if (newFilters.sellerType)
        params.set("sellerType", newFilters.sellerType);
      if (
        newFilters.listingAgeMin !== undefined &&
        !isNaN(newFilters.listingAgeMin)
      )
        params.set("listingAgeMin", String(newFilters.listingAgeMin));
      if (
        newFilters.listingAgeMax !== undefined &&
        !isNaN(newFilters.listingAgeMax)
      )
        params.set("listingAgeMax", String(newFilters.listingAgeMax));
      if (newFilters.condition && newFilters.condition.length > 0)
        params.set("condition", newFilters.condition.join(","));
      if (newFilters.extras && newFilters.extras.length > 0)
        params.set("extras", newFilters.extras.join(","));
      if (newFilters.equipment && newFilters.equipment.length > 0)
        params.set("equipment", newFilters.equipment.join(","));
      if (newFilters.vatDeductible) params.set("vatDeductible", "true");
      if (newFilters.euroEmission)
        params.set("euroEmission", newFilters.euroEmission);
      if (newFilters.stkValidUntil)
        params.set("stkValidUntil", newFilters.stkValidUntil);
      if (newFilters.hasServiceBook) params.set("hasServiceBook", "true");

      const queryString = params.toString();
      // Always derive path from browser URL to avoid stale route state
      // and keep user on the currently opened page after refresh.
      const currentPath = window.location.pathname;
      const newPath = queryString
        ? `${currentPath}?${queryString}`
        : currentPath;
      const currentPathWithSearch = `${window.location.pathname}${window.location.search}`;
      if (newPath === currentPathWithSearch) {
        return;
      }
      setLocation(newPath);
      window.dispatchEvent(new Event(FILTERS_URL_CHANGE_EVENT));
    },
    [autoNavigate, setLocation],
  );

  const setFilters = useCallback(
    (
      updater: FilterParams | ((prev: FilterParams) => FilterParams),
      shouldDebounce = false,
    ) => {
      const prevFilters = latestFiltersRef.current;
      const newFilters =
        typeof updater === "function" ? updater(prevFilters) : updater;
      latestFiltersRef.current = newFilters;
      setFiltersState(newFilters);
      if (!autoNavigate) return;

      if (shouldDebounce) {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
        debounceTimerRef.current = setTimeout(() => {
          updateURL(newFilters);
        }, 300);
      } else {
        updateURL(newFilters);
      }
    },
    [autoNavigate, updateURL],
  );

  const setCategory = useCallback(
    (category: string) => {
      setFilters((prev) => ({ ...prev, category }));
    },
    [setFilters],
  );

  const setBrand = useCallback(
    (brand: string) => {
      setFilters((prev) => ({
        ...prev,
        brand,
        model: undefined,
        generation: undefined,
      }));
    },
    [setFilters],
  );

  const setModel = useCallback(
    (model: string) => {
      setFilters((prev) => ({ ...prev, model, generation: undefined }));
    },
    [setFilters],
  );

  const setGeneration = useCallback(
    (generation: string) => {
      setFilters((prev) => ({ ...prev, generation: generation || undefined }));
    },
    [setFilters],
  );

  const setPriceRange = useCallback(
    (min: number | undefined, max: number | undefined) => {
      setFilters((prev) => ({ ...prev, priceMin: min, priceMax: max }), true);
    },
    [setFilters],
  );

  const setYearRange = useCallback(
    (min: number | undefined, max: number | undefined) => {
      setFilters((prev) => ({ ...prev, yearMin: min, yearMax: max }), true);
    },
    [setFilters],
  );

  const setMileageRange = useCallback(
    (min: number | undefined, max: number | undefined) => {
      setFilters(
        (prev) => ({ ...prev, mileageMin: min, mileageMax: max }),
        true,
      );
    },
    [setFilters],
  );

  const setVehicleType = useCallback(
    (vehicleType: string) => {
      setFilters((prev) => ({
        ...prev,
        vehicleType: normalizeSingleVehicleType(vehicleType),
      }));
    },
    [setFilters],
  );

  const setFuel = useCallback(
    (fuel: string) => {
      setFilters((prev) => ({ ...prev, fuel }));
    },
    [setFilters],
  );

  const setBodyType = useCallback(
    (bodyType: string[]) => {
      setFilters((prev) => ({ ...prev, bodyType }));
    },
    [setFilters],
  );

  const toggleBodyType = useCallback(
    (value: string) => {
      setFilters((prev) => {
        const current = prev.bodyType || [];
        const newBodyType = current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value];
        return {
          ...prev,
          bodyType: newBodyType.length > 0 ? newBodyType : undefined,
        };
      });
    },
    [setFilters],
  );

  const setTransmission = useCallback(
    (transmission: string) => {
      setFilters((prev) => ({ ...prev, transmission }));
    },
    [setFilters],
  );

  const setColor = useCallback(
    (color: string) => {
      setFilters((prev) => ({ ...prev, color }));
    },
    [setFilters],
  );

  const setTrim = useCallback(
    (trim: string) => {
      setFilters((prev) => ({ ...prev, trim }));
    },
    [setFilters],
  );

  const setRegion = useCallback(
    (region: string) => {
      setFilters((prev) => ({ ...prev, region }));
    },
    [setFilters],
  );

  const setDriveType = useCallback(
    (driveType: string) => {
      setFilters((prev) => ({ ...prev, driveType }));
    },
    [setFilters],
  );

  const setEngineRange = useCallback(
    (min: number | undefined, max: number | undefined) => {
      setFilters((prev) => ({ ...prev, engineMin: min, engineMax: max }), true);
    },
    [setFilters],
  );

  const setPowerRange = useCallback(
    (min: number | undefined, max: number | undefined) => {
      setFilters((prev) => ({ ...prev, powerMin: min, powerMax: max }), true);
    },
    [setFilters],
  );

  const setDoorsRange = useCallback(
    (min: number | undefined, max: number | undefined) => {
      setFilters((prev) => ({ ...prev, doorsMin: min, doorsMax: max }), true);
    },
    [setFilters],
  );

  const setSeatsRange = useCallback(
    (min: number | undefined, max: number | undefined) => {
      setFilters((prev) => ({ ...prev, seatsMin: min, seatsMax: max }), true);
    },
    [setFilters],
  );

  const setOwnersRange = useCallback(
    (min: number | undefined, max: number | undefined) => {
      setFilters((prev) => ({ ...prev, ownersMin: min, ownersMax: max }), true);
    },
    [setFilters],
  );

  const setAirbagsRange = useCallback(
    (min: number | undefined, max: number | undefined) => {
      setFilters(
        (prev) => ({ ...prev, airbagsMin: min, airbagsMax: max }),
        true,
      );
    },
    [setFilters],
  );

  const setSellerType = useCallback(
    (sellerType: string) => {
      setFilters((prev) => ({ ...prev, sellerType }));
    },
    [setFilters],
  );

  const setListingAgeRange = useCallback(
    (min: number | undefined, max: number | undefined) => {
      setFilters(
        (prev) => ({ ...prev, listingAgeMin: min, listingAgeMax: max }),
        true,
      );
    },
    [setFilters],
  );

  const setCondition = useCallback(
    (condition: string[]) => {
      setFilters((prev) => ({ ...prev, condition }));
    },
    [setFilters],
  );

  const setExtras = useCallback(
    (extras: string[]) => {
      setFilters((prev) => ({ ...prev, extras }));
    },
    [setFilters],
  );

  const setEquipment = useCallback(
    (equipment: string[]) => {
      setFilters((prev) => ({ ...prev, equipment }));
    },
    [setFilters],
  );

  const setEuroEmission = useCallback(
    (euroEmission: string) => {
      setFilters((prev) => ({
        ...prev,
        euroEmission: euroEmission || undefined,
      }));
    },
    [setFilters],
  );

  const setStkValidUntil = useCallback(
    (stkValidUntil: string) => {
      setFilters((prev) => ({
        ...prev,
        stkValidUntil: stkValidUntil || undefined,
      }));
    },
    [setFilters],
  );

  const setHasServiceBook = useCallback(
    (hasServiceBook: boolean) => {
      setFilters((prev) => ({
        ...prev,
        hasServiceBook: hasServiceBook || undefined,
      }));
    },
    [setFilters],
  );

  const setSearch = useCallback(
    (search: string) => {
      setFilters((prev) => ({ ...prev, search: search || undefined }));
    },
    [setFilters],
  );

  const resetFilters = useCallback(() => {
    setFilters({});
  }, [setFilters]);

  const applyFilters = useCallback(() => {
    const currentFilters = latestFiltersRef.current;
    const currentParams = new URLSearchParams(window.location.search);
    const userId = currentParams.get("userId");
    const params = new URLSearchParams();

    // Preserve user cabinet context when applying filters on "moje inzeraty".
    if (userId) params.set("userId", userId);

    if (currentFilters.search) params.set("search", currentFilters.search);
    const normalizedVehicleType = normalizeSingleVehicleType(
      currentFilters.vehicleType,
    );
    if (normalizedVehicleType)
      params.set("vehicleType", normalizedVehicleType);
    if (currentFilters.brand) params.set("brand", currentFilters.brand);
    if (currentFilters.model) params.set("model", currentFilters.model);
    if (currentFilters.generation)
      params.set("generation", currentFilters.generation);
    if (currentFilters.priceMin !== undefined && !isNaN(currentFilters.priceMin))
      params.set("priceMin", String(currentFilters.priceMin));
    if (currentFilters.priceMax !== undefined && !isNaN(currentFilters.priceMax))
      params.set("priceMax", String(currentFilters.priceMax));
    if (currentFilters.yearMin !== undefined && !isNaN(currentFilters.yearMin))
      params.set("yearMin", String(currentFilters.yearMin));
    if (currentFilters.yearMax !== undefined && !isNaN(currentFilters.yearMax))
      params.set("yearMax", String(currentFilters.yearMax));
    if (
      currentFilters.mileageMin !== undefined &&
      !isNaN(currentFilters.mileageMin)
    )
      params.set("mileageMin", String(currentFilters.mileageMin));
    if (
      currentFilters.mileageMax !== undefined &&
      !isNaN(currentFilters.mileageMax)
    )
      params.set("mileageMax", String(currentFilters.mileageMax));
    if (currentFilters.fuel) params.set("fuel", currentFilters.fuel);
    if (currentFilters.bodyType && currentFilters.bodyType.length > 0)
      params.set("bodyType", currentFilters.bodyType.join(","));
    if (currentFilters.transmission)
      params.set("transmission", currentFilters.transmission);
    if (currentFilters.color) params.set("color", currentFilters.color);
    if (currentFilters.trim) params.set("trim", currentFilters.trim);
    if (currentFilters.region) params.set("region", currentFilters.region);
    if (currentFilters.driveType)
      params.set("driveType", currentFilters.driveType);
    if (
      currentFilters.engineMin !== undefined &&
      !isNaN(currentFilters.engineMin)
    )
      params.set("engineMin", String(currentFilters.engineMin));
    if (
      currentFilters.engineMax !== undefined &&
      !isNaN(currentFilters.engineMax)
    )
      params.set("engineMax", String(currentFilters.engineMax));
    if (
      currentFilters.powerMin !== undefined &&
      !isNaN(currentFilters.powerMin)
    )
      params.set("powerMin", String(currentFilters.powerMin));
    if (
      currentFilters.powerMax !== undefined &&
      !isNaN(currentFilters.powerMax)
    )
      params.set("powerMax", String(currentFilters.powerMax));
    if (
      currentFilters.doorsMin !== undefined &&
      !isNaN(currentFilters.doorsMin)
    )
      params.set("doorsMin", String(currentFilters.doorsMin));
    if (
      currentFilters.doorsMax !== undefined &&
      !isNaN(currentFilters.doorsMax)
    )
      params.set("doorsMax", String(currentFilters.doorsMax));
    if (
      currentFilters.seatsMin !== undefined &&
      !isNaN(currentFilters.seatsMin)
    )
      params.set("seatsMin", String(currentFilters.seatsMin));
    if (
      currentFilters.seatsMax !== undefined &&
      !isNaN(currentFilters.seatsMax)
    )
      params.set("seatsMax", String(currentFilters.seatsMax));
    if (
      currentFilters.ownersMin !== undefined &&
      !isNaN(currentFilters.ownersMin)
    )
      params.set("ownersMin", String(currentFilters.ownersMin));
    if (
      currentFilters.ownersMax !== undefined &&
      !isNaN(currentFilters.ownersMax)
    )
      params.set("ownersMax", String(currentFilters.ownersMax));
    if (
      currentFilters.airbagsMin !== undefined &&
      !isNaN(currentFilters.airbagsMin)
    )
      params.set("airbagsMin", String(currentFilters.airbagsMin));
    if (
      currentFilters.airbagsMax !== undefined &&
      !isNaN(currentFilters.airbagsMax)
    )
      params.set("airbagsMax", String(currentFilters.airbagsMax));
    if (currentFilters.sellerType)
      params.set("sellerType", currentFilters.sellerType);
    if (
      currentFilters.listingAgeMin !== undefined &&
      !isNaN(currentFilters.listingAgeMin)
    )
      params.set("listingAgeMin", String(currentFilters.listingAgeMin));
    if (
      currentFilters.listingAgeMax !== undefined &&
      !isNaN(currentFilters.listingAgeMax)
    )
      params.set("listingAgeMax", String(currentFilters.listingAgeMax));
    if (currentFilters.condition && currentFilters.condition.length > 0)
      params.set("condition", currentFilters.condition.join(","));
    if (currentFilters.extras && currentFilters.extras.length > 0)
      params.set("extras", currentFilters.extras.join(","));
    if (currentFilters.equipment && currentFilters.equipment.length > 0)
      params.set("equipment", currentFilters.equipment.join(","));
    if (currentFilters.vatDeductible) params.set("vatDeductible", "true");
    if (currentFilters.euroEmission)
      params.set("euroEmission", currentFilters.euroEmission);
    if (currentFilters.stkValidUntil)
      params.set("stkValidUntil", currentFilters.stkValidUntil);
    if (currentFilters.hasServiceBook) params.set("hasServiceBook", "true");

    const queryString = params.toString();
    const targetUrl = queryString ? `/listings?${queryString}` : "/listings";
    const currentPathWithSearch = `${window.location.pathname}${window.location.search}`;
    if (targetUrl === currentPathWithSearch) {
      return;
    }
    setLocation(targetUrl);
    window.dispatchEvent(new Event(FILTERS_URL_CHANGE_EVENT));
  }, [setLocation]);

  const getLatestFilters = useCallback(() => latestFiltersRef.current, []);

  return {
    filters,
    getLatestFilters,
    setFilters,
    setSearch,
    setCategory,
    setVehicleType,
    setBrand,
    setModel,
    setGeneration,
    setPriceRange,
    setYearRange,
    setMileageRange,
    setFuel,
    setBodyType,
    toggleBodyType,
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
    setAirbagsRange,
    setSellerType,
    setListingAgeRange,
    setCondition,
    setExtras,
    setEquipment,
    setEuroEmission,
    setStkValidUntil,
    setHasServiceBook,
    resetFilters,
    applyFilters,
  };
}
