import { useState, useEffect, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertListingSchema, type InsertListing } from "@shared/schema";
import { carBrands, carModels } from "@shared/carDatabase";
import { useTranslation, useLocalizedOptions, vehicleTypeBrands, getModelsForVehicleType } from "@/lib/translations";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation, useSearch } from "@/lib/navigation";
import { buildListingPath } from "@/lib/listingUrl";
import { useAuth } from "@/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MonthPicker } from "@/components/ui/month-picker";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CarPhotoUploader } from "@/components/CarPhotoUploader";
import { VideoUploader } from "@/components/VideoUploader";
import { BrandCombobox } from "@/components/BrandCombobox";
import { brandIcons, getBrandIcon } from "@/lib/brandIcons";
import { ModelCombobox } from "@/components/ModelCombobox";
import { useModelGenerations } from "@/hooks/useModelGenerations";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LoginModal from "@/components/LoginModal";
import { Sparkles, Car, Package, Wrench, CircleDot, Zap, Bot, Activity, ArrowUp, ArrowDown, Grid3x3, Compass, Key, MapPin, Building2, ShieldCheck, Search, Camera, ImagePlus, Crown, Check, Info, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import newCarIcon from "@assets/3AAF8DD0-3B6D-4DA3-8A1E-2858FCC004A1_1763451350424.png";
import partsIcon from "@assets/62A9ABBD-0474-469C-8089-FA93C3E7C2B4_1763450942216.png";
import usedCarIcon from "@assets/ABAF6CAB-50AC-450D-8FE8-342C0DF354D6_1763451176037.png";
import orderCarIcon from "@assets/A6BE7880-928D-4532-BCB1-3FA4A34F89CE_1763451456108.png";
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
import elektroIcon from "@assets/7BF268AD-E859-4A28-8509-47319F8BCF33_1763450027820.png";

type VinDecodeResponse = {
  vin: string;
  source: string;
  found: boolean;
  make: string | null;
  model: string | null;
  year: number | null;
  fuelType:
    | "benzin"
    | "diesel"
    | "hybrid"
    | "electric"
    | "lpg"
    | "cng"
    | "ethanol"
    | "hydrogen"
    | "other"
    | null;
  bodyType:
    | "sedan"
    | "hatchback"
    | "wagon"
    | "suv"
    | "crossover"
    | "coupe"
    | "convertible"
    | "minivan"
    | "pickup"
    | "van"
    | "liftback"
    | null;
  doors: number | null;
  driveType: "fwd" | "rwd" | "awd" | "4wd" | null;
  transmission: "manual" | "automatic" | "robot" | "cvt" | null;
  engineVolume: string | null;
  power: number | null;
  vehicleType:
    | "osobni-auta"
    | "nakladni-vozy"
    | "motorky"
    | "suv-offroad"
    | "elektro"
    | null;
};

type CzLocationSuggestion = {
  id: string;
  label: string;
  city: string;
  region: string;
  country: string;
};

type CzLocationAutocompleteResponse = {
  items: CzLocationSuggestion[];
};

const normalizeLookup = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const modelToValue = (model: string): string =>
  model.toLowerCase().replace(/\s+/g, "-");

const findBrandByDecodedMake = (decodedMake: string | null): string | null => {
  if (!decodedMake) return null;
  const normalizedMake = normalizeLookup(decodedMake);
  if (!normalizedMake) return null;

  const aliases: Record<string, string> = {
    mercedes: "mercedes-benz",
    "mercedes benz": "mercedes-benz",
    skoda: "skoda",
    "land rover": "land-rover",
    "rolls royce": "rolls-royce",
    "ssang yong": "ssangyong",
  };
  if (aliases[normalizedMake]) return aliases[normalizedMake];

  const byValue = carBrands.find((b) => normalizeLookup(b.value) === normalizedMake);
  if (byValue) return byValue.value;

  const byLabel = carBrands.find((b) => normalizeLookup(b.label) === normalizedMake);
  if (byLabel) return byLabel.value;

  const includesLabel = carBrands.find((b) =>
    normalizeLookup(b.label).includes(normalizedMake),
  );
  return includesLabel?.value ?? null;
};

const findModelByDecodedModel = (
  brandValue: string | null,
  decodedModel: string | null,
): string | null => {
  if (!brandValue || !decodedModel) return null;
  const models = carModels[brandValue] || [];
  if (!models.length) return null;

  const normalizedDecodedModel = normalizeLookup(decodedModel);
  if (!normalizedDecodedModel) return null;

  const exact = models.find(
    (m) => normalizeLookup(m) === normalizedDecodedModel,
  );
  if (exact) return modelToValue(exact);

  const includes = models.find((m) =>
    normalizeLookup(m).includes(normalizedDecodedModel),
  );
  if (includes) return modelToValue(includes);

  return null;
};

/** Model slug remains valid when narrowing/setting vehicle type; avoid wiping early brand/model/trim picks. */
function isModelValidForVehicleType(
  brand: string,
  modelSlug: string,
  vehicleType: string,
): boolean {
  if (!brand || !modelSlug) return true;
  const allowed = getModelsForVehicleType(brand, vehicleType || undefined);
  return allowed.some((m) => modelToValue(m) === modelSlug);
}

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

const ElektroIcon = ({ className }: { className?: string }) => (
  <img
    src={elektroIcon}
    alt="Elektro"
    className={className}
    style={{ objectFit: "contain" }}
  />
);

export default function AddListingPage() {
  const t = useTranslation();
  const localizedOptions = useLocalizedOptions();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [photos, setPhotos] = useState<string[]>([]);
  const [video, setVideo] = useState<string | null>(null);
  const [ownersFilterType, setOwnersFilterType] = useState<'1' | '2' | 'custom' | ''>('');
  const [engineFilterType, setEngineFilterType] = useState<'1_5' | '2_0' | '3_0' | '5_0' | 'custom' | ''>('');
  const [powerFilterType, setPowerFilterType] = useState<'100' | '200' | '300' | '500' | '1000' | 'custom' | ''>('');
  const [doorsFilterType, setDoorsFilterType] = useState<'3' | '5' | 'custom' | ''>('');
  const [seatsFilterType, setSeatsFilterType] = useState<'5' | '7' | 'custom' | ''>('');
  const [regionSearch, setRegionSearch] = useState('');
  const [showRegionSuggestions, setShowRegionSuggestions] = useState(false);
  const [regionSuggestions, setRegionSuggestions] = useState<CzLocationSuggestion[]>([]);
  const [isRegionSuggestionsLoading, setIsRegionSuggestionsLoading] = useState(false);
  
  const [yearOpen, setYearOpen] = useState(false);
  const [mileageOpen, setMileageOpen] = useState(false);
  const [engineOpen, setEngineOpen] = useState(false);
  const [powerOpen, setPowerOpen] = useState(false);
  const [ownersOpen, setOwnersOpen] = useState(false);
  const navigateToListingWithState = useCallback(
    (listing: {
      id: string;
      brand?: string | null;
      model?: string | null;
      year?: number | null;
    }) => {
      const target = buildListingPath({
        id: listing.id,
        brand: listing.brand,
        model: listing.model,
        year: listing.year ?? undefined,
      });
      if (typeof window === "undefined") {
        setLocation(target);
        return;
      }
      const from = `${window.location.pathname}${window.location.search}`;
      const scrollY = Number.isFinite(window.scrollY) ? Math.max(0, window.scrollY) : 0;
      setLocation(target);
      const currentState =
        window.history.state && typeof window.history.state === "object"
          ? window.history.state
          : {};
      window.history.replaceState(
        { ...currentState, from, scrollY, listingId: listing.id },
        "",
        target,
      );
    },
    [setLocation],
  );
  
  const [yearCustom, setYearCustom] = useState(false);
  const [mileageCustom, setMileageCustom] = useState(false);
  const [engineCustom, setEngineCustom] = useState(false);
  const [powerCustom, setPowerCustom] = useState(false);
  const [ownersCustom, setOwnersCustom] = useState(false);
  
  const [showPaymentSuccessDialog, setShowPaymentSuccessDialog] = useState(false);
  const [stripeSessionId, setStripeSessionId] = useState<string | null>(null);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [isPhotosUploading, setIsPhotosUploading] = useState(false);
  const [isVideoUploading, setIsVideoUploading] = useState(false);
  const [topsPurchased, setTopsPurchased] = useState(1);
  const [guestAuthModalOpen, setGuestAuthModalOpen] = useState(true);
  const [vinStatus, setVinStatus] = useState<"idle" | "verified" | "failed">("idle");
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const submitLockRef = useRef(false);
  const submitLockToastTsRef = useRef(0);
  const { language } = useLanguage();
  const isMediaUploading = isPhotosUploading || isVideoUploading;
  
  const formatNumber = (value: number): string => {
    if (value === 0) return "";
    return new Intl.NumberFormat(
      language === "cs"
        ? "cs-CZ"
        : language === "uk"
          ? "uk-UA"
          : language === "de"
            ? "de-DE"
            : "en-US"
    ).format(value);
  };
  
  const formatPriceDisplay = (raw: string | number | undefined | null): string => {
    if (raw === undefined || raw === null || raw === "") return "";
    const [intPart, decPart] = String(raw).split(".");
    const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    return decPart !== undefined ? `${grouped},${decPart}` : grouped;
  };

  const formatPhoneDisplay = (raw: string | undefined | null): string => {
    if (!raw) return "";
    const trimmed = String(raw).trim();
    const hasPlus = trimmed.startsWith("+");
    const digits = trimmed.replace(/\D/g, "");
    if (!digits) return hasPlus ? "+" : "";
    // International format with country code (e.g. +420 777 555 333)
    if (hasPlus) {
      const cc = digits.slice(0, 3);
      const rest = digits.slice(3);
      const groups = rest.match(/.{1,3}/g) || [];
      return `+${cc}${groups.length ? " " + groups.join(" ") : ""}`.trimEnd();
    }
    // Local format grouped in threes (e.g. 777 555 333)
    const groups = digits.match(/.{1,3}/g) || [];
    return groups.join(" ");
  };

  const goldActivePill =
    "border-2 border-[#B8860B] bg-gradient-to-b from-[#B8860B]/15 to-[#D4AF37]/10 ring-2 ring-[#B8860B]/40 shadow-[0_4px_12px_rgba(184,134,11,0.2)] text-[#7a5a08] dark:text-[#D4AF37]";

  const InfoHint = ({ children }: { children: string }) => (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="inline-flex h-5 w-5 items-center justify-center rounded-full text-[#B8860B] hover:bg-[#B8860B]/10"
            aria-label="Nápověda"
          >
            <Info className="h-3.5 w-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p>{children}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: currentYear - 1979 }, (_, i) => currentYear - i);
  const mileageOptions = [0, 10000, 20000, 30000, 50000, 75000, 100000, 125000, 150000, 200000, 250000, 300000, 400000, 500000, 600000];
  const engineOptions = [0.8, 1.0, 1.2, 1.4, 1.5, 1.6, 1.8, 2.0, 2.2, 2.5, 3.0, 3.5, 4.0, 5.0, 6.0];
  const powerOptions = [50, 75, 100, 125, 150, 175, 200, 250, 300, 350, 400, 500, 600, 700, 800, 1000];
  const ownersOptions = [1, 2, 3, 4, 5];

  useEffect(() => {
    const params = new URLSearchParams(searchString);
    const payment = params.get('payment');
    const sessionId = params.get('session_id');
    
    if (payment === 'success' && sessionId) {
      setStripeSessionId(sessionId);
      setShowPaymentSuccessDialog(true);
      window.history.replaceState({}, '', '/add-listing');
    } else if (payment === 'cancelled') {
      toast({
        variant: "destructive",
        title: t("payment.cancelled") || "Platba zrušena",
        description: t("payment.cancelledDescription") || "Platba byla zrušena. Můžete zkusit znovu.",
      });
      window.history.replaceState({}, '', '/add-listing');
    }
  }, [searchString, toast, t]);

  const createListingMutation = useMutation({
    mutationFn: async (data: InsertListing) => {
      const res = await apiRequest("POST", "/api/listings", data);
      return await res.json();
    },
    onSuccess: (newListing) => {
      queryClient.invalidateQueries({ queryKey: ["/api/listings"] });
      toast({
        title: t("listing.success") || "Inzerát úspěšně vytvořen",
        description: t("listing.successDescription") || "Váš inzerát byl úspěšně publikován.",
      });
      setPhotos([]);
      navigateToListingWithState(newListing);
      setOwnersFilterType('');
      setEngineFilterType('');
      setPowerFilterType('');
      setDoorsFilterType('');
      setSeatsFilterType('');
      form.reset({
        userId: user?.id || "",
        title: "",
        description: undefined,
        price: "",
        brand: "",
        model: "",
        year: undefined,
        mileage: 0,
        fuelType: [],
        transmission: [],
        bodyType: undefined,
        color: undefined,
        driveType: [],
        engineVolume: undefined,
        power: undefined,
        doors: undefined,
        seats: undefined,
        owners: undefined,
        sellerType: undefined,
        condition: undefined,
        vehicleType: undefined,
        equipment: [],
        extras: [],
        region: undefined,
        isTopListing: false,
        vatDeductible: false,
        isImported: false,
        importCountry: undefined,
        financingAvailable: false,
        financingMonthlyPayment: undefined,
        financingDownPaymentPercent: undefined,
        financingTermMonths: undefined,
        financingProvider: undefined,
        financingOnlineApproval: false,
        financingForBusiness: false,
        financingForPrivate: false,
        photos: undefined,
      });
      // Redirect to the newly created listing page
      if (newListing?.id) {
        navigateToListingWithState(newListing);
      } else {
        setLocation("/listings");
      }
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: t("listing.error") || "Chyba",
        description: error.message || "Nepodařilo se vytvořit inzerát.",
      });
    },
  });

  const fuelTypes = [
    { value: "benzin", label: t("hero.benzin") },
    { value: "diesel", label: t("hero.diesel") },
    { value: "lpg", label: t("hero.lpg") },
    { value: "cng", label: t("hero.cng") },
    { value: "electric", label: t("hero.electric") },
    { value: "hybrid", label: t("hero.hybrid") },
    { value: "ethanol", label: t("hero.ethanol") },
    { value: "hydrogen", label: t("hero.hydrogen") },
    { value: "other", label: t("hero.otherFuel") },
  ];

  const transmissionTypes = [
    { value: "manual", label: t("filters.manual") },
    { value: "automatic", label: t("filters.automatic") },
    { value: "robot", label: t("filters.robot") },
    { value: "cvt", label: t("filters.cvt") },
  ];

  const conditionTypes = [
    { value: "Nové", label: t("filters.conditionNew") },
    { value: "Ojeté", label: t("filters.conditionUsed") },
    { value: "Na objednávku", label: t("filters.conditionOrder") },
    { value: "Na náhradní díly", label: t("filters.conditionParts") },
    { value: "Pronájem", label: t("filters.conditionRental") },
    { value: "Havarované", label: t("filters.conditionDamaged") },
    { value: "Historické", label: t("filters.conditionHistoric") },
  ];

  const vehicleTypes = [
    { value: "osobni-auta", label: t("hero.cars") },     // Osobní auta / Легкові / Cars
    { value: "nakladni-vozy", label: t("hero.trucks") }, // Nákladní vozy / Вантажівки / Trucks
    { value: "motorky", label: t("hero.motorky") }, // Motorky / Мотоцикли / Motorcycles
    { value: "suv-offroad", label: t("hero.suvOffroad") },
    { value: "elektro", label: t("hero.electric") },
  ];

  const sellerTypes = [
    { value: "private", label: t("listing.sellerPrivate") },
    { value: "dealer", label: t("listing.sellerDealer") },
  ];

  const equipmentGroups = [
    {
      title: "Bezpečnost",
      options: [
        { value: "abs", label: "ABS" },
        { value: "esp", label: "ESP" },
        { value: "asr", label: "ASR" },
        { value: "driverAirbag", label: "Airbag řidiče" },
        { value: "passengerAirbag", label: "Airbag spolujezdce" },
        { value: "sideAirbags", label: "Boční airbagy" },
        { value: "headAirbags", label: "Hlavové airbagy" },
        { value: "isofix", label: "Isofix" },
        { value: "emergencyBraking", label: "Nouzové brzdění" },
        { value: "laneKeeping", label: t("filters.laneKeeping") },
        { value: "trafficSignRecognition", label: "Rozpoznávání značek" },
        { value: "hillStartAssist", label: "Asistent rozjezdu do kopce" },
        { value: "hillDescentAssist", label: "Asistent sjíždění kopce" },
        { value: "tirePressureMonitoring", label: "Monitoring tlaku pneumatik" },
        { value: "driverFatigueMonitoring", label: "Hlídání únavy řidiče" },
        { value: "blindSpot", label: t("filters.blindSpot") },
      ],
    },
    {
      title: "Komfort",
      options: [
        { value: "heatedSeats", label: t("filters.heatedSeats") },
        { value: "ventilatedSeats", label: t("filters.ventilatedSeats") },
        { value: "memorySeats", label: t("filters.memorySeats") },
        { value: "massageSeats", label: t("filters.massageSeats") },
        { value: "electricSeats", label: t("filters.electricSeats") },
        { value: "electricWindows", label: t("filters.electricWindows") },
        { value: "leatherInterior", label: t("filters.leatherInterior") },
        { value: "climateControl", label: t("filters.climateControl") },
        { value: "dualZoneClimate", label: "Dvouzónová klimatizace" },
        { value: "threeZoneClimate", label: "Třízónová klimatizace" },
        { value: "fourZoneClimate", label: "Čtyřzónová klimatizace" },
        { value: "electricTailgate", label: "Elektrické víko kufru" },
        { value: "softClose", label: "Soft Close" },
        { value: "keylessEntry", label: t("filters.keylessEntry") },
        { value: "keylessStart", label: "Bezklíčové startování" },
        { value: "ambientLighting", label: "Ambientní osvětlení" },
        { value: "heatedWindshield", label: "Vyhřívané čelní sklo" },
        { value: "heatedRearSeats", label: "Vyhřívaná zadní sedadla" },
        { value: "digitalCockpit", label: "Digitální přístrojový štít" },
        { value: "heatedSteeringWheel", label: t("filters.heatedSteeringWheel") },
        { value: "panoramicRoof", label: t("filters.panoramicRoof") },
      ],
    },
    {
      title: "Multimédia",
      options: [
        { value: "navigationSystem", label: t("filters.navigationSystem") },
        { value: "bluetooth", label: t("filters.bluetooth") },
        { value: "appleCarPlay", label: "Apple CarPlay" },
        { value: "androidAuto", label: "Android Auto" },
        { value: "usb", label: "USB" },
        { value: "usbC", label: "USB-C" },
        { value: "wifi", label: "Wi-Fi" },
        { value: "handsfree", label: "Handsfree" },
        { value: "premiumAudio", label: "Premium Audio" },
        { value: "harmanKardon", label: "Harman Kardon" },
        { value: "bose", label: "Bose" },
        { value: "bangOlufsen", label: "Bang & Olufsen" },
        { value: "dabRadio", label: "DAB rádio" },
        { value: "wirelessCharging", label: t("filters.wirelessCharging") },
        { value: "headUpDisplay", label: t("filters.headUpDisplay") },
      ],
    },
    {
      title: "Osvětlení",
      options: [
        { value: "ledHeadlights", label: t("filters.ledHeadlights") },
        { value: "matrixLed", label: "Matrix LED" },
        { value: "laserLights", label: "Laserová světla" },
        { value: "biXenon", label: "Bi-Xenon" },
        { value: "adaptiveLights", label: "Adaptivní světla" },
        { value: "automaticHighBeam", label: "Automatické dálkové světlomety" },
        { value: "ledDaytimeRunningLights", label: "LED denní svícení" },
        { value: "rainSensor", label: t("filters.rainSensor") },
        { value: "lightSensor", label: t("filters.lightSensor") },
      ],
    },
    {
      title: "Parkování",
      options: [
        { value: "parkingSensors", label: t("filters.parkingSensors") },
        { value: "parkingSensorsFront", label: "Parkovací senzory vpředu" },
        { value: "parkingSensorsRear", label: "Parkovací senzory vzadu" },
        { value: "rearCamera", label: t("filters.rearCamera") },
        { value: "frontCamera", label: "Přední kamera" },
        { value: "camera360", label: "360° kamera" },
        { value: "parkingAssist", label: t("filters.parkingAssist") },
        { value: "automaticParking", label: "Automatické parkování" },
        { value: "alloyWheels", label: t("filters.alloyWheels") },
        { value: "towHitch", label: t("filters.towHitch") },
      ],
    },
  ];

  const equipmentOptions = equipmentGroups.flatMap((group) => group.options);

  const extrasOptions = [
    { value: "vinCheck", label: t("filters.vinCheck") },
    { value: "serviceBook", label: t("filters.serviceBook") },
    { value: "notDamaged", label: t("filters.notDamaged") },
    { value: "notPainted", label: t("filters.notPainted") },
    { value: "warranty", label: t("filters.warranty") },
    { value: "exchange", label: t("filters.exchange") },
    { value: "firstOwner", label: "První majitel" },
    { value: "boughtInCz", label: "Koupeno v ČR" },
    { value: "nonSmoking", label: "Po nekuřákovi" },
    { value: "originalPaint", label: "Originální lak" },
    { value: "completeServiceHistory", label: "Kompletní servisní historie" },
    { value: "garaged", label: "Garážované" },
    { value: "newBrakes", label: "Nové brzdy" },
    { value: "newTires", label: "Nové pneumatiky" },
    { value: "newStk", label: "Nová STK" },
    { value: "secondWheelSet", label: "Druhá sada kol" },
    { value: "winterWheels", label: "Zimní kola" },
    { value: "summerWheels", label: "Letní kola" },
    { value: "towHitchExtra", label: "Tažné zařízení" },
    { value: "authorizedServiceOnly", label: "Servis pouze v autorizovaném servisu" },
    { value: "fixedPrice", label: "Cena pevná" },
    { value: "negotiablePrice", label: "Cena k jednání" },
    { value: "reservationAvailable", label: "Rezervace možná" },
    { value: "leasingAvailable", label: "Možnost leasingu" },
    { value: "loanAvailable", label: "Možnost úvěru" },
    { value: "operationalLeasing", label: "Operativní leasing" },
    { value: "financialLeasing", label: "Finanční leasing" },
    { value: "onlineApproval", label: "Schválení online" },
    { value: "businessFinancing", label: "Financování pro podnikatele" },
    { value: "privateFinancing", label: "Financování pro soukromé osoby" },
  ];

  const saleOptionValues = [
    "fixedPrice",
    "negotiablePrice",
    "exchange",
    "reservationAvailable",
  ];
  const financingOptionValues = [
    "loanAvailable",
    "leasingAvailable",
    "operationalLeasing",
    "financialLeasing",
  ];
  const listingExtrasOptions = extrasOptions.filter(
    (option) =>
      !saleOptionValues.includes(option.value) &&
      !financingOptionValues.includes(option.value),
  );
  const saleOptions = extrasOptions.filter((option) =>
    saleOptionValues.includes(option.value),
  );
  const financingOptions = extrasOptions.filter((option) =>
    financingOptionValues.includes(option.value),
  );

  const colors = localizedOptions.getColors();
  const driveTypes = localizedOptions.getDriveTypes();
  const regions = localizedOptions.getRegions();
  const importCountries = localizedOptions.getImportCountries();

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
    truck: TruckGoldIcon,
    chassis: TruckGoldIcon,
    tipper: TruckGoldIcon,
    sport: MotorcycleIcon,
    cruiser: MotorcycleIcon,
    touring: MotorcycleIcon,
    enduro: MotorcycleIcon,
    naked: MotorcycleIcon,
    chopper: MotorcycleIcon,
    scooter: MotorcycleIcon,
    classic: MotorcycleIcon,
  };

  const form = useForm<InsertListing>({
    resolver: zodResolver(insertListingSchema),
    defaultValues: {
      userId: user?.id || "",
      title: "",
      description: "",
      price: "",
      brand: "",
      model: "",
      trim: undefined,
      year: undefined,
      mileage: 0,
      fuelType: [],
      transmission: [],
      bodyType: undefined,
      color: "",
      driveType: [],
      engineVolume: "",
      power: undefined,
      doors: undefined,
      seats: undefined,
      owners: undefined,
      airbags: undefined,
      sellerType: "",
      condition: "",
      vehicleType: "",
      equipment: [],
      extras: [],
      region: "",
      vin: "",
      euroEmission: undefined,
      stkValidUntil: undefined,
      hasServiceBook: false,
      isTopListing: false,
      vatDeductible: false,
      isImported: false,
      importCountry: undefined,
      financingAvailable: false,
      financingMonthlyPayment: undefined,
      financingDownPaymentPercent: undefined,
      financingTermMonths: undefined,
      financingProvider: "",
      financingOnlineApproval: false,
      financingForBusiness: false,
      financingForPrivate: false,
      photos: undefined,
    },
  });

  const selectedBrand = form.watch("brand");
  const selectedModel = form.watch("model");
  const selectedVehicleType = form.watch("vehicleType");
  const isTopListing = form.watch("isTopListing");
  const isImported = form.watch("isImported");
  const isFinancingEnabled = form.watch("financingAvailable");
  const selectedSellerType = form.watch("sellerType");
  const watchedValues = form.watch();
  const completionPercent = (() => {
    const v = watchedValues;
    const checks = [
      !!v.title?.trim(),
      !!(v.description && String(v.description).trim()),
      !!(v.price && parseFloat(v.price) > 0),
      !!v.condition,
      !!v.vehicleType,
      !!v.brand,
      !!v.model,
      !!(v.year && v.year >= 1900),
      v.mileage !== undefined && v.mileage !== null,
      !!(v.fuelType && v.fuelType.length),
      !!(v.transmission && v.transmission.length),
      !!(v.color && String(v.color).trim()),
      !!(v.driveType && v.driveType.length),
      !!(v.engineVolume && String(v.engineVolume).trim()),
      !!(v.power && v.power > 0),
      !!v.sellerType,
      !!(v.region && String(v.region).trim()),
      !!(v.phone && String(v.phone).trim()),
      photos.length > 0,
    ];
    const done = checks.filter(Boolean).length;
    return Math.round((done / checks.length) * 100);
  })();
  const bodyTypes = localizedOptions.getBodyTypes(selectedVehicleType ?? undefined);
  const availableModels = selectedBrand ? getModelsForVehicleType(selectedBrand, selectedVehicleType ?? undefined) : [];
  const dealerSellerChecklist =
    language === "uk"
      ? [
          "VIN і можливість перевірки",
          "STK, екологічний клас і сервісна книжка",
          "Кількість власників, походження і стан авто",
          "Комплектація, додаткові опції, DPH і фінансування",
        ]
      : language === "de"
        ? [
            "VIN und Fahrzeugprüfung",
            "TÜV/STK, Emissionsklasse und Serviceheft",
            "Anzahl Besitzer, Herkunft und Zustand",
            "Ausstattung, Extras, MwSt. und Finanzierung",
          ]
        : language === "en"
          ? [
              "VIN and vehicle check option",
              "STK, emission class and service book",
              "Owners, origin and vehicle condition",
              "Equipment, extras, VAT and financing",
            ]
          : [
              "VIN a možnost prověření",
              "STK, emisní třída a servisní knížka",
              "Počet majitelů, původ a stav vozu",
              "Výbava, extras, DPH a financování",
            ];
  const privateSellerChecklist =
    language === "uk"
      ? [
          "Фото з усіх сторін",
          "Реальний стан і короткий опис",
          "Телефон і регіон для швидкого контакту",
          "VIN добровільно для більшої довіри",
        ]
      : language === "de"
        ? [
            "Fotos von allen Seiten",
            "Ehrlicher Zustand und kurze Beschreibung",
            "Telefon und Region für schnellen Kontakt",
            "VIN optional für mehr Vertrauen",
          ]
        : language === "en"
          ? [
              "Photos from all sides",
              "Real condition and short description",
              "Phone and region for quick contact",
              "VIN optional for higher trust",
            ]
          : [
              "Fotografie ze všech stran",
              "Reálný stav a stručný popis",
              "Telefon a region pro rychlý kontakt",
              "VIN dobrovolně pro vyšší důvěru",
            ];
  const { generations: availableGenerations } = useModelGenerations(
    selectedBrand,
    selectedModel,
  );

  const handleVehicleCategoryChange = useCallback(
    (
      bodyTypeField: { onChange: (v: unknown) => void },
      nextType: string,
      isCurrentlySelected: boolean,
    ) => {
      if (isCurrentlySelected) {
        form.setValue("vehicleType", "" as any);
        form.setValue("bodyType", undefined as any);
        bodyTypeField.onChange(undefined);
        return;
      }
      form.setValue("vehicleType", nextType as any);
      form.setValue("bodyType", undefined as any);
      bodyTypeField.onChange(undefined);
      const brand = form.getValues("brand");
      const model = form.getValues("model");
      if (brand && model && !isModelValidForVehicleType(brand, model, nextType)) {
        form.setValue("model", "" as any);
        form.setValue("trim", undefined as any);
      }
    },
    [form],
  );

  useEffect(() => {
    if (!showRegionSuggestions) return;

    const query = regionSearch.trim();
    if (query.length < 2) {
      setRegionSuggestions([]);
      setIsRegionSuggestionsLoading(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        setIsRegionSuggestionsLoading(true);
        const response = await apiRequest(
          "GET",
          `/api/locations/cz/autocomplete?q=${encodeURIComponent(query)}`,
        );
        const data = (await response.json()) as CzLocationAutocompleteResponse;
        setRegionSuggestions(Array.isArray(data.items) ? data.items : []);
      } catch {
        setRegionSuggestions([]);
      } finally {
        setIsRegionSuggestionsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [regionSearch, showRegionSuggestions]);

  const completeTopListingMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const res = await apiRequest("POST", "/api/checkout/complete-top-listing", { 
        stripeSessionId: sessionId 
      });
      return await res.json();
    },
    onSuccess: (newListing) => {
      queryClient.invalidateQueries({ queryKey: ["/api/listings"] });
      toast({
        title: t("listing.success") || "Inzerát úspěšně vytvořen",
        description: t("listing.successDescriptionTop") || "Váš TOP inzerát byl úspěšně publikován.",
      });
      setShowPaymentSuccessDialog(false);
      setStripeSessionId(null);
      navigateToListingWithState(newListing);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: t("listing.error") || "Chyba",
        description: error.message || "Nepodařilo se vytvořit inzerát.",
      });
    },
  });

  useEffect(() => {
    const shouldWarn =
      isMediaUploading ||
      isProcessingCheckout ||
      createListingMutation.isPending ||
      completeTopListingMutation.isPending;
    if (!shouldWarn) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [
    isMediaUploading,
    isProcessingCheckout,
    createListingMutation.isPending,
    completeTopListingMutation.isPending,
  ]);

  const requiredFieldLabels: Record<string, { cs: string; uk: string; en: string }> = {
    title: { cs: "Název inzerátu", uk: "Назва оголошення", en: "Listing title" },
    description: { cs: "Popis", uk: "Опис", en: "Description" },
    price: { cs: "Cena", uk: "Ціна", en: "Price" },
    condition: { cs: "Stav vozidla", uk: "Стан авто", en: "Vehicle condition" },
    vehicleType: { cs: "Typ vozidla", uk: "Тип авто", en: "Vehicle type" },
    brand: { cs: "Značka", uk: "Марка", en: "Brand" },
    model: { cs: "Model", uk: "Модель", en: "Model" },
    year: { cs: "Rok výroby", uk: "Рік випуску", en: "Year" },
    mileage: { cs: "Najeto km", uk: "Пробіг", en: "Mileage" },
    fuelType: { cs: "Palivo", uk: "Паливо", en: "Fuel type" },
    transmission: { cs: "Převodovka", uk: "КПП", en: "Transmission" },
    color: { cs: "Barva", uk: "Колір", en: "Color" },
    driveType: { cs: "Pohon", uk: "Привід", en: "Drive type" },
    engineVolume: { cs: "Objem motoru", uk: "Об'єм двигуна", en: "Engine volume" },
    power: { cs: "Výkon", uk: "Потужність", en: "Power" },
    sellerType: { cs: "Typ prodejce", uk: "Тип продавця", en: "Seller type" },
    region: { cs: "Region", uk: "Регіон", en: "Region" },
    phone: { cs: "Telefon", uk: "Телефон", en: "Phone" },
  };

  const getFieldLabel = (field: string) => {
    const labels = requiredFieldLabels[field];
    if (!labels) return field;
    return labels[language as keyof typeof labels] || labels.en;
  };

  const validateRequiredFields = (): string[] => {
    const values = form.getValues();
    const missingFields: string[] = [];
    
    if (!values.title?.trim()) missingFields.push('title');
    if (!values.description?.trim()) missingFields.push('description');
    if (!values.price || parseFloat(values.price) <= 0) missingFields.push('price');
    if (!values.condition) missingFields.push('condition');
    if (!values.vehicleType) missingFields.push('vehicleType');
    if (!values.brand) missingFields.push('brand');
    if (!values.model) missingFields.push('model');
    if (!values.year || values.year < 1900) missingFields.push('year');
    if (values.mileage === undefined || values.mileage === null) missingFields.push('mileage');
    if (!values.fuelType?.length) missingFields.push('fuelType');
    if (!values.transmission?.length) missingFields.push('transmission');
    if (!values.color?.trim()) missingFields.push('color');
    if (!values.driveType?.length) missingFields.push('driveType');
    if (!values.engineVolume?.trim()) missingFields.push('engineVolume');
    if (!values.power || values.power <= 0) missingFields.push('power');
    if (!values.sellerType) missingFields.push('sellerType');
    if (!values.region?.trim()) missingFields.push('region');
    if (!values.phone?.trim()) missingFields.push('phone');
    
    return missingFields;
  };

  const scrollToFirstMissingField = (missingFields: string[]) => {
    if (typeof document === "undefined" || missingFields.length === 0) return;
    const testIdMap: Record<string, string> = {
      photos: "button-add-photos",
      title: "input-title",
      description: "input-description",
      price: "input-price",
      vehicleType: "button-vehicle-cars",
      condition: "button-condition-nové",
      brand: "select-brand",
      model: "select-model",
      year: "input-year",
      mileage: "input-mileage",
      color: "select-color",
      engineVolume: "input-engine-volume",
      power: "input-power",
      sellerType: "button-seller-type-private",
      region: "input-region",
      phone: "input-phone",
    };
    const selector = testIdMap[missingFields[0]];
    const element = selector
      ? document.querySelector(`[data-testid="${selector}"]`)
      : null;
    element?.scrollIntoView({ behavior: "smooth", block: "center" });
    if (element instanceof HTMLElement) {
      window.setTimeout(() => element.focus?.(), 350);
    }
  };

  const handleSubmitClick = async () => {
    if (submitLockRef.current) {
      const now = Date.now();
      if (now - submitLockToastTsRef.current > 1200) {
        toast({
          title:
            language === "uk"
              ? "Обробляємо запит"
              : language === "cs"
                ? "Zpracováváme požadavek"
                : "Processing request",
          description:
            language === "uk"
              ? "Зачекайте, будь ласка, форма вже надсилається."
              : language === "cs"
                ? "Počkejte prosím, formulář se už odesílá."
                : "Please wait, the form is already being submitted.",
        });
        submitLockToastTsRef.current = now;
      }
      return;
    }
    if (isMediaUploading) {
      toast({
        variant: "destructive",
        title: language === "uk" ? "Зачекайте" : language === "cs" ? "Počkejte" : "Please wait",
        description:
          language === "uk"
            ? "Завантаження медіа ще триває. Спробуйте знову після завершення."
            : language === "cs"
              ? "Nahrávání médií stále probíhá. Zkuste to znovu po dokončení."
              : "Media upload is still in progress. Try again when it completes.",
      });
      return;
    }
    const missingFields = validateRequiredFields();
    
    if (photos.length === 0) {
      missingFields.unshift('photos');
    }
    
    if (missingFields.length > 0) {
      const missingLabels = missingFields.map(f => {
        if (f === 'photos') {
          return language === 'uk' ? "Фото" : language === 'cs' ? "Fotografie" : "Photos";
        }
        return getFieldLabel(f);
      });
      
      toast({
        variant: "destructive",
        title: language === 'uk' ? "Заповніть обов'язкові поля" : language === 'cs' ? "Vyplňte povinná pole" : "Fill required fields",
        description: missingLabels.join(", "),
      });
      
      await form.trigger();
      scrollToFirstMissingField(missingFields);
      return;
    }

    setReviewDialogOpen(true);
  };

  const onSubmit = async (data: InsertListing) => {
    if (submitLockRef.current) return;
    submitLockRef.current = true;

    if (!user?.id) {
      toast({
        variant: "destructive",
        title: t("auth.loginRequired"),
        description: t("auth.loginRequiredDescription"),
      });
      submitLockRef.current = false;
      return;
    }
    
    if (photos.length === 0) {
      toast({
        variant: "destructive",
        title: language === 'uk' ? "Потрібне фото" : "Foto je povinné",
        description: language === 'uk' ? "Додайте щонайменше 1 фото автомобіля" : "Přidejte alespoň 1 fotografii vozidla",
      });
      submitLockRef.current = false;
      return;
    }

    if (isMediaUploading) {
      toast({
        variant: "destructive",
        title: language === "uk" ? "Зачекайте" : language === "cs" ? "Počkejte" : "Please wait",
        description:
          language === "uk"
            ? "Завантаження медіа ще триває. Спробуйте знову після завершення."
            : language === "cs"
              ? "Nahrávání médií stále probíhá. Zkuste to znovu po dokončení."
              : "Media upload is still in progress. Try again when it completes.",
      });
      submitLockRef.current = false;
      return;
    }
    
    if (data.isTopListing) {
      setIsProcessingCheckout(true);
      try {
        const res = await apiRequest("POST", "/api/checkout/new-top-listing", {
          ...data,
          userId: user.id,
          photos: photos.length > 0 ? photos : undefined,
          video: video || undefined,
        });
        const result = await res.json();
        
        if (result.url) {
          window.location.href = result.url;
        } else {
          throw new Error("Failed to create checkout session");
        }
      } catch (error: any) {
        setIsProcessingCheckout(false);
        submitLockRef.current = false;
        toast({
          variant: "destructive",
          title: t("payment.error") || "Chyba platby",
          description: error.message || "Nepodařilo se vytvořit platební relaci.",
        });
      }
    } else {
      try {
        await createListingMutation.mutateAsync({
          ...data,
          userId: user.id,
          photos: photos.length > 0 ? photos : undefined,
          video: video || undefined,
        });
      } finally {
        submitLockRef.current = false;
      }
    }
  };

  const handleBuyMoreTops = async () => {
    setIsProcessingCheckout(true);
    try {
      const formData = form.getValues();
      const res = await apiRequest("POST", "/api/checkout/new-top-listing", {
        ...formData,
        userId: user?.id,
        photos: photos.length > 0 ? photos : undefined,
        video: video || undefined,
      });
      const result = await res.json();
      
      if (result.url) {
        setTopsPurchased(prev => prev + 1);
        window.location.href = result.url;
      } else {
        throw new Error("Failed to create checkout session");
      }
    } catch (error: any) {
      setIsProcessingCheckout(false);
      toast({
        variant: "destructive",
        title: t("payment.error") || "Chyba platby",
        description: error.message || "Nepodařilo se vytvořit platební relaci.",
      });
    }
  };

  const handlePostListing = () => {
    if (stripeSessionId) {
      completeTopListingMutation.mutate(stripeSessionId);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-lg">{t("common.loading") || "Načítání..."}</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center gap-4 px-4 pb-12 text-center">
          <h1 className="text-xl font-semibold text-foreground">
            {t("auth.loginRequired")}
          </h1>
          <p className="text-muted-foreground max-w-md text-sm leading-relaxed">
            {t("auth.loginRequiredDescription")}
          </p>
          <Button
            type="button"
            onClick={() => setGuestAuthModalOpen(true)}
            className="mt-1"
          >
            {t("auth.register")} / {t("auth.login")}
          </Button>
        </main>
        <Footer />
        <LoginModal
          open={guestAuthModalOpen}
          onOpenChange={setGuestAuthModalOpen}
          initialTab="register"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8 sm:py-12 lg:py-16" translate="no">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <Card className="rounded-xl sm:rounded-2xl shadow-xl">
            <CardHeader className="pb-6 sm:pb-8">
              <CardTitle className="text-2xl sm:text-3xl font-semibold tracking-tight" data-testid="text-page-title">
                {t("listing.addTitle")}
              </CardTitle>
            </CardHeader>

            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmitClick();
                  }}
                  className="flex flex-col gap-7 sm:gap-9 [&_button]:touch-manipulation [&_button]:transition-all [&_button]:duration-200 [&_[role=button]]:touch-manipulation [&_label]:touch-manipulation [&_input:not([type=checkbox]):not([type=radio])]:h-12 [&_input:not([type=checkbox]):not([type=radio])]:rounded-xl [&_input:not([type=checkbox]):not([type=radio])]:px-4 [&_textarea]:rounded-xl [&_textarea]:px-4 [&_textarea]:py-3 [&_textarea]:min-h-[120px] [&_[role=combobox]]:h-12 [&_[role=combobox]]:rounded-xl [&_[role=combobox]]:px-4"
                >
                  <div className="space-y-4 order-[-1]">
                    <h3 className="text-lg font-medium">{t("listing.basicInfo")}</h3>

                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("listing.title")}</FormLabel>
                          <FormControl>
                            <Input
                              placeholder={t("listing.titlePlaceholder")}
                              data-testid="input-title"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("listing.description")}</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder={t("listing.descriptionPlaceholder")}
                              data-testid="input-description"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="inline-flex items-center gap-1.5">
                            {t("listing.price")} (Kč)
                            <InfoHint>Uveďte reálnou cenu v Kč. Částka se při psaní automaticky formátuje.</InfoHint>
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type="text"
                                inputMode="numeric"
                                placeholder="0"
                                className="pr-14 text-base font-semibold"
                                data-testid="input-price"
                                name={field.name}
                                ref={field.ref}
                                onBlur={field.onBlur}
                                value={formatPriceDisplay(field.value)}
                                onChange={(e) => {
                                  const cleaned = e.target.value.replace(/[^\d.,]/g, "").replace(",", ".");
                                  field.onChange(cleaned);
                                }}
                              />
                              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[#B8860B]">
                                Kč
                              </span>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="vatDeductible"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value === true}
                              onCheckedChange={(checked) => field.onChange(checked === true)}
                              data-testid="checkbox-vat-deductible"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              {t("listing.vatDeductible")}
                            </FormLabel>
                            <FormDescription>
                              {t("listing.vatDeductibleDesc")}
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4">
                    <h3 className="inline-flex items-center gap-1.5 text-lg font-medium">
                      {t("tips.photosTitle")}
                      <InfoHint>Nejrychleji se prodávají auta s alespoň 10 kvalitními fotografiemi.</InfoHint>
                    </h3>
                    <CarPhotoUploader 
                      photos={photos}
                      onPhotosChange={setPhotos}
                      maxPhotos={30}
                      onUploadingChange={setIsPhotosUploading}
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <h3 className="text-lg font-medium">{t("video.title")}</h3>
                      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#B8860B]">
                        <Sparkles className="h-4 w-4" />
                        {language === "uk"
                          ? "Відео підвищує шанс продажу."
                          : language === "de"
                            ? "Video erhöht die Verkaufschance."
                            : language === "en"
                              ? "Video increases the chance of selling."
                              : "Video zvyšuje šanci prodeje."}
                      </span>
                    </div>
                    <VideoUploader 
                      video={video}
                      onVideoChange={setVideo}
                      maxDurationSeconds={300}
                      onUploadingChange={setIsVideoUploading}
                    />
                  </div>

                  <div className="space-y-4 order-[-2]">
                    <h3 className="text-lg font-medium">{t("listing.vehicleDetails")}</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="bodyType"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormControl>
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <FormLabel>{t("listing.vehicleType")}</FormLabel>
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {/* Osobní auta */}
                                    {(() => {
                                      const isSelected = form.watch("vehicleType") === "osobni-auta";
                                      return (
                                        <Button
                                          type="button"
                                          variant="outline"
                                          className={`h-auto py-3 px-2 flex flex-col items-center gap-1 text-center ${!isSelected ? 'text-black dark:text-white' : ''} ${isSelected ? 'border-2 border-[#B8860B] bg-gradient-to-b from-[#B8860B]/15 to-[#D4AF37]/10 ring-2 ring-[#B8860B]/50 shadow-[0_6px_18px_rgba(184,134,11,0.28)] scale-[1.03] text-[#7a5a08] dark:text-[#D4AF37]' : ''} toggle-elevate`}
                                          onClick={() =>
                                            handleVehicleCategoryChange(
                                              field,
                                              "osobni-auta",
                                              isSelected,
                                            )
                                          }
                                          data-testid="button-vehicle-cars"
                                        >
                                          <CarGoldIcon className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0" />
                                          <span className="text-[10px] sm:text-xs font-medium leading-tight">{t("hero.cars")}</span>
                                        </Button>
                                      );
                                    })()}
                                    {/* Dodávky */}
                                    {(() => {
                                      const isSelected = form.watch("vehicleType") === "dodavky";
                                      return (
                                        <Button
                                          type="button"
                                          variant="outline"
                                          className={`h-auto py-3 px-2 flex flex-col items-center gap-1 text-center ${!isSelected ? 'text-black dark:text-white' : ''} ${isSelected ? 'border-2 border-[#B8860B] bg-gradient-to-b from-[#B8860B]/15 to-[#D4AF37]/10 ring-2 ring-[#B8860B]/50 shadow-[0_6px_18px_rgba(184,134,11,0.28)] scale-[1.03] text-[#7a5a08] dark:text-[#D4AF37]' : ''} toggle-elevate`}
                                          onClick={() =>
                                            handleVehicleCategoryChange(field, "dodavky", isSelected)
                                          }
                                          data-testid="button-vehicle-vans"
                                        >
                                          <VanIcon className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0" />
                                          <span className="text-[10px] sm:text-xs font-medium leading-tight">{t("hero.dodavky")}</span>
                                        </Button>
                                      );
                                    })()}
                                    {/* Nákladní vozy */}
                                    {(() => {
                                      const isSelected = form.watch("vehicleType") === "nakladni-vozy";
                                      return (
                                        <Button
                                          type="button"
                                          variant="outline"
                                          className={`h-auto py-3 px-2 flex flex-col items-center gap-1 text-center ${!isSelected ? 'text-black dark:text-white' : ''} ${isSelected ? 'border-2 border-[#B8860B] bg-gradient-to-b from-[#B8860B]/15 to-[#D4AF37]/10 ring-2 ring-[#B8860B]/50 shadow-[0_6px_18px_rgba(184,134,11,0.28)] scale-[1.03] text-[#7a5a08] dark:text-[#D4AF37]' : ''} toggle-elevate`}
                                          onClick={() =>
                                            handleVehicleCategoryChange(
                                              field,
                                              "nakladni-vozy",
                                              isSelected,
                                            )
                                          }
                                          data-testid="button-vehicle-trucks"
                                        >
                                          <TruckGoldIcon className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0" />
                                          <span className="text-[10px] sm:text-xs font-medium leading-tight">{t("hero.trucks")}</span>
                                        </Button>
                                      );
                                    })()}
                                    {/* Motorky */}
                                    {(() => {
                                      const isSelected = form.watch("vehicleType") === "motorky";
                                      return (
                                        <Button
                                          type="button"
                                          variant="outline"
                                          className={`h-auto py-3 px-2 flex flex-col items-center gap-1 text-center ${!isSelected ? 'text-black dark:text-white' : ''} ${isSelected ? 'border-2 border-[#B8860B] bg-gradient-to-b from-[#B8860B]/15 to-[#D4AF37]/10 ring-2 ring-[#B8860B]/50 shadow-[0_6px_18px_rgba(184,134,11,0.28)] scale-[1.03] text-[#7a5a08] dark:text-[#D4AF37]' : ''} toggle-elevate`}
                                          onClick={() =>
                                            handleVehicleCategoryChange(field, "motorky", isSelected)
                                          }
                                          data-testid="button-vehicle-motorky"
                                        >
                                          <MotorcycleIcon className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0" />
                                          <span className="text-[10px] sm:text-xs font-medium leading-tight">{t("hero.motorky")}</span>
                                        </Button>
                                      );
                                    })()}
                                    {/* SUV / Offroad */}
                                    {(() => {
                                      const isSelected = form.watch("vehicleType") === "suv-offroad";
                                      return (
                                        <Button
                                          type="button"
                                          variant="outline"
                                          className={`h-auto py-3 px-2 flex flex-col items-center gap-1 text-center ${!isSelected ? 'text-black dark:text-white' : ''} ${isSelected ? 'border-2 border-[#B8860B] bg-gradient-to-b from-[#B8860B]/15 to-[#D4AF37]/10 ring-2 ring-[#B8860B]/50 shadow-[0_6px_18px_rgba(184,134,11,0.28)] scale-[1.03] text-[#7a5a08] dark:text-[#D4AF37]' : ''} toggle-elevate`}
                                          onClick={() =>
                                            handleVehicleCategoryChange(
                                              field,
                                              "suv-offroad",
                                              isSelected,
                                            )
                                          }
                                          data-testid="button-vehicle-suv-offroad"
                                        >
                                          <SuvIcon className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0" />
                                          <span className="text-[10px] sm:text-xs font-medium leading-tight">{t("hero.suvOffroad")}</span>
                                        </Button>
                                      );
                                    })()}
                                    {/* Elektro */}
                                    {(() => {
                                      const isSelected = form.watch("vehicleType") === "elektro";
                                      return (
                                        <Button
                                          type="button"
                                          variant="outline"
                                          className={`h-auto py-3 px-2 flex flex-col items-center gap-1 text-center ${!isSelected ? 'text-black dark:text-white' : ''} ${isSelected ? 'border-2 border-[#B8860B] bg-gradient-to-b from-[#B8860B]/15 to-[#D4AF37]/10 ring-2 ring-[#B8860B]/50 shadow-[0_6px_18px_rgba(184,134,11,0.28)] scale-[1.03] text-[#7a5a08] dark:text-[#D4AF37]' : ''} toggle-elevate`}
                                          onClick={() =>
                                            handleVehicleCategoryChange(field, "elektro", isSelected)
                                          }
                                          data-testid="button-vehicle-elektro"
                                        >
                                          <ElektroIcon className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0" />
                                          <span className="text-[10px] sm:text-xs font-medium leading-tight">{t("hero.electric")}</span>
                                        </Button>
                                      );
                                    })()}
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <FormLabel>{t("filters.bodyType")}</FormLabel>
                                  <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-6 gap-2">
                                    {bodyTypes.map((type) => {
                                      const IconComponent = bodyTypeIcons[type.value] || Car;
                                      const isSelected = field.value === type.value;
                                      return (
                                        <Button
                                          key={type.value}
                                          type="button"
                                          variant="outline"
                                          className={`h-auto py-3 px-2 flex flex-col items-center gap-1 text-center ${!isSelected ? 'text-black dark:text-white' : ''} ${isSelected ? 'border-2 border-[#B8860B] bg-gradient-to-b from-[#B8860B]/15 to-[#D4AF37]/10 ring-2 ring-[#B8860B]/40 shadow-[0_5px_16px_rgba(184,134,11,0.22)] scale-[1.02] text-[#7a5a08] dark:text-[#D4AF37]' : ''} toggle-elevate`}
                                          onClick={() => {
                                            if (isSelected) {
                                              field.onChange(undefined);
                                            } else {
                                              field.onChange(type.value);
                                            }
                                          }}
                                          data-testid={`button-body-type-${type.value}`}
                                        >
                                          <IconComponent className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0" />
                                          <span className="text-[10px] sm:text-xs font-medium leading-tight">{type.label}</span>
                                        </Button>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="condition"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>{t("listing.condition")}</FormLabel>
                            <FormControl>
                              <div className="grid grid-cols-2 gap-3">
                                {[
                                  { label: t("filters.conditionNew"), value: "Nové", icon: Sparkles, customIcon: NewCarIcon },
                                  { label: t("filters.conditionUsed"), value: "Ojeté", icon: Car, customIcon: UsedCarIcon },
                                  { label: t("filters.conditionOrder"), value: "Na objednávku", icon: Package, customIcon: OrderCarIcon },
                                  { label: t("filters.conditionParts"), value: "Na náhradní díly", icon: Wrench, customIcon: PartsIcon },
                                  { label: t("filters.conditionRental"), value: "Pronájem", icon: Key, customIcon: null },
                                  { label: t("filters.conditionDamaged"), value: "Havarované", icon: Wrench, customIcon: null },
                                  { label: t("filters.conditionHistoric"), value: "Historické", icon: Sparkles, customIcon: null }
                                ].map((condition) => {
                                  const isSelected = field.value === condition.value;
                                  const Icon = condition.icon;
                                  const CustomIcon = condition.customIcon;
                                  return (
                                    <Button
                                      key={condition.value}
                                      type="button"
                                      variant="outline"
                                      className={`h-auto py-3 px-4 flex flex-col items-center gap-2 text-center ${isSelected ? 'border-2 border-[#B8860B] bg-gradient-to-b from-[#B8860B]/15 to-[#D4AF37]/10 ring-2 ring-[#B8860B]/40 shadow-[0_5px_16px_rgba(184,134,11,0.22)] scale-[1.02] text-[#7a5a08] dark:text-[#D4AF37]' : ''} toggle-elevate`}
                                      onClick={() => field.onChange(isSelected ? undefined : condition.value)}
                                      data-testid={`button-condition-${condition.value.toLowerCase().replace(/\s+/g, '-')}`}
                                    >
                                      {CustomIcon ? (
                                        <CustomIcon className="h-10 w-10" />
                                      ) : (
                                        <Icon className="h-7 w-7 text-[#B8860B]" />
                                      )}
                                      <span className="text-xs font-medium leading-tight text-black dark:text-white">{condition.label}</span>
                                    </Button>
                                  );
                                })}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:col-span-2">
                        <FormField
                          control={form.control}
                          name="brand"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("hero.brand")}</FormLabel>
                              <FormControl>
                                <BrandCombobox
                                  brands={carBrands
                                    .filter(brand => {
                                      const vehicleType = form.watch("vehicleType");
                                      if (vehicleType && vehicleTypeBrands[vehicleType]) {
                                        return vehicleTypeBrands[vehicleType].includes(brand.value);
                                      }
                                      return true;
                                    })
                                    .map(brand => ({
                                      value: brand.value,
                                      label: brand.label,
                                      icon: getBrandIcon(brand.value, brand.label)
                                    }))}
                                  value={field.value}
                                  onValueChange={(value) => {
                                    field.onChange(value);
                                    form.setValue("model", "");
                                    form.setValue("trim", undefined as any);
                                  }}
                                  placeholder={t("hero.allBrands")}
                                  emptyMessage={t("hero.noBrandsFound") || "Značka nenalezena"}
                                  className="w-full h-12"
                                  testId="select-brand"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="model"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("hero.model")}</FormLabel>
                              <FormControl>
                                <ModelCombobox
                                  models={availableModels}
                                  value={field.value}
                                  onValueChange={(value) => {
                                    field.onChange(value);
                                    form.setValue("trim", undefined as any);
                                  }}
                                  disabled={!selectedBrand}
                                  placeholder={selectedBrand ? t("hero.allModels") : t("hero.selectBrand")}
                                  emptyMessage={t("hero.noModelsFound") || "Model nenalezen"}
                                  className="w-full h-12"
                                  testId="select-model"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="trim"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Generace / Version</FormLabel>
                              <Select
                                value={field.value || "all"}
                                onValueChange={(value) =>
                                  field.onChange(value === "all" ? undefined : value)
                                }
                                disabled={!selectedModel}
                              >
                                <FormControl>
                                  <SelectTrigger data-testid="select-generation-add-listing">
                                    <SelectValue
                                      placeholder={
                                        selectedModel
                                          ? "Generace / Version"
                                          : "Nejdříve vyberte model"
                                      }
                                    />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="max-h-72 overflow-y-auto">
                                  <SelectItem value="all">Generace / Version</SelectItem>
                                  {availableGenerations.map((generation) => (
                                    <SelectItem key={generation} value={generation}>
                                      {generation}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">{t("listing.technicalData")}</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="year"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("listing.year")}</FormLabel>
                            <FormControl>
                              <div className="space-y-2">
                                <Popover open={yearOpen} onOpenChange={setYearOpen}>
                                  <PopoverTrigger asChild>
                                    <div className="relative cursor-pointer" onClick={() => setYearOpen(true)}>
                                      <Input
                                        type="text"
                                        value={field.value?.toString() || ""}
                                        readOnly
                                        placeholder={t("listing.year")}
                                        className="h-12 text-black dark:text-white pr-8 cursor-pointer"
                                        data-testid="input-year"
                                      />
                                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                                    </div>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-32 p-1 max-h-64 overflow-y-auto" align="start">
                                    <div className="flex flex-col">
                                      {yearOptions.map((year) => (
                                        <Button
                                          key={year}
                                          type="button"
                                          variant="ghost"
                                          className="justify-start h-8 px-2 text-sm font-normal hover-elevate"
                                          onClick={() => {
                                            field.onChange(year);
                                            setYearOpen(false);
                                            setYearCustom(false);
                                          }}
                                          data-testid={`option-year-${year}`}
                                        >
                                          {year}
                                        </Button>
                                      ))}
                                    </div>
                                  </PopoverContent>
                                </Popover>
                                <Button
                                  type="button"
                                  variant="outline"
                                  className={`w-full h-auto py-2 px-3 text-xs ${!yearCustom ? 'text-black dark:text-white' : ''} ${yearCustom ? 'border-2 border-[#B8860B] bg-gradient-to-b from-[#B8860B]/15 to-[#D4AF37]/10 ring-2 ring-[#B8860B]/40 shadow-[0_5px_16px_rgba(184,134,11,0.22)] scale-[1.02] text-[#7a5a08] dark:text-[#D4AF37]' : ''} toggle-elevate`}
                                  onClick={() => setYearCustom(!yearCustom)}
                                  data-testid="button-year-custom"
                                >
                                  {language === "cs" ? "vlastní výběr" : language === "uk" ? "власний вибір" : "custom"}
                                </Button>
                                {yearCustom && (
                                  <Input
                                    type="number"
                                    min="1900"
                                    max={currentYear}
                                    placeholder={t("listing.year")}
                                    value={field.value || ""}
                                    onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                                    className="h-12 text-black dark:text-white"
                                    data-testid="input-year-custom"
                                  />
                                )}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="mileage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="inline-flex items-center gap-1.5">
                              {t("listing.mileage")}
                              <InfoHint>Zadejte skutečný nájezd v kilometrech. Kupující často filtrují podle nájezdu.</InfoHint>
                            </FormLabel>
                            <FormControl>
                              <div className="space-y-2">
                                <Popover open={mileageOpen} onOpenChange={setMileageOpen}>
                                  <PopoverTrigger asChild>
                                    <div className="relative cursor-pointer" onClick={() => setMileageOpen(true)}>
                                      <Input
                                        type="text"
                                        value={field.value ? `${formatNumber(field.value)} km` : ""}
                                        readOnly
                                        placeholder={t("listing.mileage")}
                                        className="h-12 text-black dark:text-white pr-8 cursor-pointer"
                                        data-testid="input-mileage"
                                      />
                                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                                    </div>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-48 p-1 max-h-64 overflow-y-auto" align="start">
                                    <div className="flex flex-col">
                                      {mileageOptions.map((km) => (
                                        <Button
                                          key={km}
                                          type="button"
                                          variant="ghost"
                                          className="justify-start h-8 px-2 text-sm font-normal hover-elevate"
                                          onClick={() => {
                                            field.onChange(km);
                                            setMileageOpen(false);
                                            setMileageCustom(false);
                                          }}
                                          data-testid={`option-mileage-${km}`}
                                        >
                                          {km === 0 ? "-" : `${formatNumber(km)} km`}
                                        </Button>
                                      ))}
                                    </div>
                                  </PopoverContent>
                                </Popover>
                                <Button
                                  type="button"
                                  variant="outline"
                                  className={`w-full h-auto py-2 px-3 text-xs ${!mileageCustom ? 'text-black dark:text-white' : ''} ${mileageCustom ? 'border-2 border-[#B8860B] bg-gradient-to-b from-[#B8860B]/15 to-[#D4AF37]/10 ring-2 ring-[#B8860B]/40 shadow-[0_5px_16px_rgba(184,134,11,0.22)] scale-[1.02] text-[#7a5a08] dark:text-[#D4AF37]' : ''} toggle-elevate`}
                                  onClick={() => setMileageCustom(!mileageCustom)}
                                  data-testid="button-mileage-custom"
                                >
                                  {language === "cs" ? "vlastní výběr" : language === "uk" ? "власний вибір" : "custom"}
                                </Button>
                                {mileageCustom && (
                                  <Input
                                    type="number"
                                    min="0"
                                    placeholder={t("listing.mileage")}
                                    value={field.value || ""}
                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                    className="h-12 text-black dark:text-white"
                                    data-testid="input-mileage-custom"
                                  />
                                )}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="fuelType"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>{t("listing.fuelType")}</FormLabel>
                            <FormControl>
                              <div className="space-y-3">
                                {[
                                  { label: t("hero.benzin"), key: "benzin" },
                                  { label: t("hero.diesel"), key: "diesel" },
                                  { label: t("hero.lpg"), key: "lpg" },
                                  { label: t("hero.cng"), key: "cng" },
                                  { label: t("hero.electric"), key: "electric" },
                                  { label: t("hero.hybrid"), key: "hybrid" },
                                  { label: t("hero.ethanol"), key: "ethanol" },
                                  { label: t("hero.hydrogen"), key: "hydrogen" },
                                  { label: t("hero.otherFuel"), key: "other" },
                                ].map((fuel) => {
                                  const isChecked = (field.value as string[] || []).includes(fuel.key);
                                  return (
                                    <div key={fuel.key} className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`fuel-${fuel.key}`}
                                        checked={isChecked}
                                        onCheckedChange={(checked) => {
                                          const currentValues = Array.isArray(field.value) ? field.value : [];
                                          const newValues = checked === true
                                            ? [...currentValues, fuel.key]
                                            : currentValues.filter((v) => v !== fuel.key);
                                          field.onChange(newValues);
                                        }}
                                        data-testid={`checkbox-fuel-${fuel.key.toLowerCase()}`}
                                      />
                                      <label
                                        htmlFor={`fuel-${fuel.key}`}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-foreground"
                                      >
                                        {fuel.label}
                                      </label>
                                    </div>
                                  );
                                })}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="transmission"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>{t("listing.transmission")}</FormLabel>
                            <FormControl>
                              <div className="space-y-3">
                                {[
                                  { label: t("filters.manual"), key: "manual", icon: CircleDot },
                                  { label: t("filters.automatic"), key: "automatic", icon: Zap },
                                  { label: t("filters.robot"), key: "robot", icon: Bot },
                                  { label: t("filters.cvt"), key: "cvt", icon: Activity }
                                ].map((trans) => {
                                  const Icon = trans.icon;
                                  const isChecked = (field.value as string[] || []).includes(trans.key);
                                  return (
                                    <div key={trans.key} className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`trans-${trans.key}`}
                                        checked={isChecked}
                                        onCheckedChange={(checked) => {
                                          const currentValues = Array.isArray(field.value) ? field.value : [];
                                          const newValues = checked === true
                                            ? [...currentValues, trans.key]
                                            : currentValues.filter((v) => v !== trans.key);
                                          field.onChange(newValues);
                                        }}
                                        data-testid={`checkbox-transmission-${trans.key.toLowerCase()}`}
                                      />
                                      <label
                                        htmlFor={`trans-${trans.key}`}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-foreground flex items-center gap-2"
                                      >
                                        <Icon className="w-4 h-4 text-[#B8860B]" />
                                        <span>{trans.label}</span>
                                      </label>
                                    </div>
                                  );
                                })}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="color"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("listing.color")}</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || ""}>
                              <FormControl>
                                <SelectTrigger data-testid="select-color">
                                  <SelectValue placeholder={t("filters.allColors")} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {colors.map((color) => (
                                  <SelectItem key={color.value} value={color.value}>
                                    <div className="flex items-center gap-2">
                                      <div 
                                        className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600 flex-shrink-0" 
                                        style={{ 
                                          backgroundColor: color.hex,
                                          boxShadow: color.value === 'white' || color.value === 'ivory' ? 'inset 0 0 0 1px rgba(0,0,0,0.1)' : 'none'
                                        }}
                                      />
                                      <span>{color.label}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="driveType"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>{t("listing.driveType")}</FormLabel>
                            <FormControl>
                              <div className="space-y-3">
                                {driveTypes.map((drive) => {
                                  const driveTypeIcons: Record<string, any> = {
                                    fwd: ArrowUp,
                                    rwd: ArrowDown,
                                    awd: Grid3x3,
                                    "4wd": Compass,
                                  };
                                  const Icon = driveTypeIcons[drive.value];
                                  const isChecked = (field.value as string[] || []).includes(drive.value);
                                  return (
                                    <div key={drive.value} className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`drive-${drive.value}`}
                                        checked={isChecked}
                                        onCheckedChange={(checked) => {
                                          const currentValues = Array.isArray(field.value) ? field.value : [];
                                          const newValues = checked === true
                                            ? [...currentValues, drive.value]
                                            : currentValues.filter((v) => v !== drive.value);
                                          field.onChange(newValues);
                                        }}
                                        data-testid={`checkbox-drive-${drive.value}`}
                                      />
                                      <label
                                        htmlFor={`drive-${drive.value}`}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-foreground flex items-center gap-2"
                                      >
                                        {Icon && <Icon className="w-4 h-4 text-[#B8860B]" />}
                                        <span>{drive.label}</span>
                                      </label>
                                    </div>
                                  );
                                })}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="engineVolume"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("listing.engineVolume")}</FormLabel>
                            <FormControl>
                              <div className="space-y-2">
                                <Popover open={engineOpen} onOpenChange={setEngineOpen}>
                                  <PopoverTrigger asChild>
                                    <div className="relative cursor-pointer" onClick={() => setEngineOpen(true)}>
                                      <Input
                                        type="text"
                                        value={field.value ? `${field.value} L` : ""}
                                        readOnly
                                        placeholder={t("listing.engineVolume")}
                                        className="h-12 text-black dark:text-white pr-8 cursor-pointer"
                                        data-testid="input-engine-volume"
                                      />
                                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                                    </div>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-28 p-1 max-h-64 overflow-y-auto" align="start">
                                    <div className="flex flex-col">
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        className="justify-start h-8 px-2 text-sm font-normal hover-elevate"
                                        onClick={() => {
                                          field.onChange(undefined);
                                          setEngineOpen(false);
                                          setEngineCustom(false);
                                        }}
                                        data-testid="option-engine-clear"
                                      >
                                        -
                                      </Button>
                                      {engineOptions.map((volume) => (
                                        <Button
                                          key={volume}
                                          type="button"
                                          variant="ghost"
                                          className="justify-start h-8 px-2 text-sm font-normal hover-elevate"
                                          onClick={() => {
                                            field.onChange(volume.toFixed(1));
                                            setEngineOpen(false);
                                            setEngineCustom(false);
                                          }}
                                          data-testid={`option-engine-${volume}`}
                                        >
                                          {volume.toFixed(1)} L
                                        </Button>
                                      ))}
                                    </div>
                                  </PopoverContent>
                                </Popover>
                                <Button
                                  type="button"
                                  variant="outline"
                                  className={`w-full h-auto py-2 px-3 text-xs ${!engineCustom ? 'text-black dark:text-white' : ''} ${engineCustom ? 'border-2 border-[#B8860B] bg-gradient-to-b from-[#B8860B]/15 to-[#D4AF37]/10 ring-2 ring-[#B8860B]/40 shadow-[0_5px_16px_rgba(184,134,11,0.22)] scale-[1.02] text-[#7a5a08] dark:text-[#D4AF37]' : ''} toggle-elevate`}
                                  onClick={() => setEngineCustom(!engineCustom)}
                                  data-testid="button-engine-custom"
                                >
                                  {language === "cs" ? "vlastní výběr" : language === "uk" ? "власний вибір" : "custom"}
                                </Button>
                                {engineCustom && (
                                  <Input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    placeholder={t("listing.engineVolume")}
                                    value={field.value || ""}
                                    onChange={(e) => field.onChange(e.target.value)}
                                    className="h-12 text-black dark:text-white"
                                    data-testid="input-engine-custom"
                                  />
                                )}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="power"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("listing.power")}</FormLabel>
                            <FormControl>
                              <div className="space-y-2">
                                <Popover open={powerOpen} onOpenChange={setPowerOpen}>
                                  <PopoverTrigger asChild>
                                    <div className="relative cursor-pointer" onClick={() => setPowerOpen(true)}>
                                      <Input
                                        type="text"
                                        value={field.value ? `${field.value} kW` : ""}
                                        readOnly
                                        placeholder={t("listing.power")}
                                        className="h-12 text-black dark:text-white pr-8 cursor-pointer"
                                        data-testid="input-power"
                                      />
                                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                                    </div>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-28 p-1 max-h-64 overflow-y-auto" align="start">
                                    <div className="flex flex-col">
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        className="justify-start h-8 px-2 text-sm font-normal hover-elevate"
                                        onClick={() => {
                                          field.onChange(undefined);
                                          setPowerOpen(false);
                                          setPowerCustom(false);
                                        }}
                                        data-testid="option-power-clear"
                                      >
                                        -
                                      </Button>
                                      {powerOptions.map((kw) => (
                                        <Button
                                          key={kw}
                                          type="button"
                                          variant="ghost"
                                          className="justify-start h-8 px-2 text-sm font-normal hover-elevate"
                                          onClick={() => {
                                            field.onChange(kw);
                                            setPowerOpen(false);
                                            setPowerCustom(false);
                                          }}
                                          data-testid={`option-power-${kw}`}
                                        >
                                          {kw} kW
                                        </Button>
                                      ))}
                                    </div>
                                  </PopoverContent>
                                </Popover>
                                <Button
                                  type="button"
                                  variant="outline"
                                  className={`w-full h-auto py-2 px-3 text-xs ${!powerCustom ? 'text-black dark:text-white' : ''} ${powerCustom ? 'border-2 border-[#B8860B] bg-gradient-to-b from-[#B8860B]/15 to-[#D4AF37]/10 ring-2 ring-[#B8860B]/40 shadow-[0_5px_16px_rgba(184,134,11,0.22)] scale-[1.02] text-[#7a5a08] dark:text-[#D4AF37]' : ''} toggle-elevate`}
                                  onClick={() => setPowerCustom(!powerCustom)}
                                  data-testid="button-power-custom"
                                >
                                  {language === "cs" ? "vlastní výběr" : language === "uk" ? "власний вибір" : "custom"}
                                </Button>
                                {powerCustom && (
                                  <Input
                                    type="number"
                                    min="0"
                                    placeholder={t("listing.power")}
                                    value={field.value ?? ""}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      if (val === "") {
                                        field.onChange(undefined);
                                      } else {
                                        const parsed = parseInt(val);
                                        field.onChange(isNaN(parsed) ? undefined : parsed);
                                      }
                                    }}
                                    className="h-12 text-black dark:text-white"
                                    data-testid="input-power-custom"
                                  />
                                )}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="doors"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>{t("listing.doors")}</FormLabel>
                            <FormControl>
                              <div className="space-y-3">
                                <div className="flex flex-wrap gap-2">
                                  {[2, 3, 4, 5].map((num) => {
                                    const isSelected = doorsFilterType !== 'custom' && field.value === num;
                                    return (
                                      <Button
                                        key={num}
                                        type="button"
                                        variant="outline"
                                        className={`h-12 min-w-[3.5rem] rounded-xl px-4 text-base font-semibold ${!isSelected ? 'text-black dark:text-white' : ''} ${isSelected ? goldActivePill : ''} toggle-elevate`}
                                        onClick={() => {
                                          setDoorsFilterType('');
                                          field.onChange(field.value === num ? undefined : num);
                                        }}
                                        data-testid={`button-doors-${num}`}
                                      >
                                        {num}
                                      </Button>
                                    );
                                  })}
                                  <Button
                                    key="custom"
                                    type="button"
                                    variant="outline"
                                    className={`h-12 min-w-[3.5rem] rounded-xl px-4 text-base font-semibold ${doorsFilterType !== 'custom' ? 'text-black dark:text-white' : ''} ${doorsFilterType === 'custom' ? goldActivePill : ''} toggle-elevate`}
                                    onClick={() => setDoorsFilterType(doorsFilterType === 'custom' ? '' : 'custom')}
                                    data-testid="button-doors-custom"
                                  >
                                    6+
                                  </Button>
                                </div>

                                {doorsFilterType === 'custom' && (
                                  <Input
                                    type="number"
                                    placeholder={t("listing.doors")}
                                    data-testid="input-doors"
                                    value={field.value ?? ""}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      if (val === "") {
                                        field.onChange(undefined);
                                      } else {
                                        const parsed = parseInt(val);
                                        field.onChange(isNaN(parsed) ? undefined : parsed);
                                      }
                                    }}
                                  />
                                )}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="seats"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>{t("listing.seats")}</FormLabel>
                            <FormControl>
                              <div className="space-y-3">
                                <div className="flex flex-wrap gap-2">
                                  {[2, 4, 5, 7].map((num) => {
                                    const isSelected = seatsFilterType !== 'custom' && field.value === num;
                                    return (
                                      <Button
                                        key={num}
                                        type="button"
                                        variant="outline"
                                        className={`h-12 min-w-[3.5rem] rounded-xl px-4 text-base font-semibold ${!isSelected ? 'text-black dark:text-white' : ''} ${isSelected ? goldActivePill : ''} toggle-elevate`}
                                        onClick={() => {
                                          setSeatsFilterType('');
                                          field.onChange(field.value === num ? undefined : num);
                                        }}
                                        data-testid={`button-seats-${num}`}
                                      >
                                        {num}
                                      </Button>
                                    );
                                  })}
                                  <Button
                                    key="custom"
                                    type="button"
                                    variant="outline"
                                    className={`h-12 min-w-[3.5rem] rounded-xl px-4 text-base font-semibold ${seatsFilterType !== 'custom' ? 'text-black dark:text-white' : ''} ${seatsFilterType === 'custom' ? goldActivePill : ''} toggle-elevate`}
                                    onClick={() => setSeatsFilterType(seatsFilterType === 'custom' ? '' : 'custom')}
                                    data-testid="button-seats-custom"
                                  >
                                    9+
                                  </Button>
                                </div>

                                {seatsFilterType === 'custom' && (
                                  <Input
                                    type="number"
                                    placeholder={t("listing.seats")}
                                    data-testid="input-seats"
                                    value={field.value ?? ""}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      if (val === "") {
                                        field.onChange(undefined);
                                      } else {
                                        const parsed = parseInt(val);
                                        field.onChange(isNaN(parsed) ? undefined : parsed);
                                      }
                                    }}
                                  />
                                )}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="owners"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("listing.owners")}</FormLabel>
                            <FormControl>
                              <div className="space-y-2">
                                <Popover open={ownersOpen} onOpenChange={setOwnersOpen}>
                                  <PopoverTrigger asChild>
                                    <div className="relative cursor-pointer" onClick={() => setOwnersOpen(true)}>
                                      <Input
                                        type="text"
                                        value={field.value?.toString() || ""}
                                        readOnly
                                        placeholder={t("listing.owners")}
                                        className="h-12 text-black dark:text-white pr-8 cursor-pointer"
                                        data-testid="input-owners"
                                      />
                                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                                    </div>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-24 p-1 max-h-64 overflow-y-auto" align="start">
                                    <div className="flex flex-col">
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        className="justify-start h-8 px-2 text-sm font-normal hover-elevate"
                                        onClick={() => {
                                          field.onChange(undefined);
                                          setOwnersOpen(false);
                                          setOwnersCustom(false);
                                        }}
                                        data-testid="option-owners-clear"
                                      >
                                        -
                                      </Button>
                                      {ownersOptions.map((num) => (
                                        <Button
                                          key={num}
                                          type="button"
                                          variant="ghost"
                                          className="justify-start h-8 px-2 text-sm font-normal hover-elevate"
                                          onClick={() => {
                                            field.onChange(num);
                                            setOwnersOpen(false);
                                            setOwnersCustom(false);
                                          }}
                                          data-testid={`option-owners-${num}`}
                                        >
                                          {num}
                                        </Button>
                                      ))}
                                    </div>
                                  </PopoverContent>
                                </Popover>
                                <Button
                                  type="button"
                                  variant="outline"
                                  className={`w-full h-auto py-2 px-3 text-xs ${!ownersCustom ? 'text-black dark:text-white' : ''} ${ownersCustom ? 'border-2 border-[#B8860B] bg-gradient-to-b from-[#B8860B]/15 to-[#D4AF37]/10 ring-2 ring-[#B8860B]/40 shadow-[0_5px_16px_rgba(184,134,11,0.22)] scale-[1.02] text-[#7a5a08] dark:text-[#D4AF37]' : ''} toggle-elevate`}
                                  onClick={() => setOwnersCustom(!ownersCustom)}
                                  data-testid="button-owners-custom"
                                >
                                  {language === "cs" ? "vlastní výběr" : language === "uk" ? "власний вибір" : "custom"}
                                </Button>
                                {ownersCustom && (
                                  <Input
                                    type="number"
                                    min="1"
                                    placeholder={t("listing.owners")}
                                    value={field.value ?? ""}
                                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                    className="h-12 text-black dark:text-white"
                                    data-testid="input-owners-custom"
                                  />
                                )}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="sellerType"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>{t("listing.sellerType")}</FormLabel>
                            <FormControl>
                              <div className="grid grid-cols-2 gap-3">
                                {sellerTypes.map((seller) => {
                                  const isSelected = field.value === seller.value;
                                  return (
                                    <Button
                                      key={seller.value}
                                      type="button"
                                      variant="outline"
                                      className={`h-auto py-3 px-4 ${isSelected ? 'border-2 border-[#B8860B] bg-gradient-to-b from-[#B8860B]/15 to-[#D4AF37]/10 ring-2 ring-[#B8860B]/40 shadow-[0_5px_16px_rgba(184,134,11,0.22)] scale-[1.02] text-[#7a5a08] dark:text-[#D4AF37]' : ''} toggle-elevate text-black dark:text-white`}
                                      onClick={() => field.onChange(seller.value)}
                                      data-testid={`button-seller-type-${seller.value}`}
                                    >
                                      {seller.label}
                                    </Button>
                                  );
                                })}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {selectedSellerType && (
                        <div className="md:col-span-2 rounded-3xl border border-amber-200 bg-gradient-to-br from-white via-amber-50/60 to-white p-4 shadow-sm sm:p-5">
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-800">
                              {selectedSellerType === "dealer" ? (
                                <Building2 className="h-6 w-6" />
                              ) : (
                                <Car className="h-6 w-6" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-black uppercase tracking-[0.18em] text-amber-700">
                                {selectedSellerType === "dealer"
                                  ? language === "uk"
                                    ? "Оголошення автобазару"
                                    : language === "de"
                                      ? "Autohaus-Anzeige"
                                      : language === "en"
                                        ? "Dealer listing"
                                        : "Oznámení pro autobazar"
                                  : language === "uk"
                                    ? "Приватне оголошення"
                                    : language === "de"
                                      ? "Private Anzeige"
                                      : language === "en"
                                        ? "Private listing"
                                        : "Soukromý prodej"}
                              </p>
                              <h4 className="mt-1 text-lg font-black text-[#4b2d08]">
                                {selectedSellerType === "dealer"
                                  ? language === "uk"
                                    ? "Заповніть максимум даних, щоб оголошення виглядало як професійний автобазар."
                                    : language === "de"
                                      ? "Füllen Sie möglichst viele Angaben aus, damit die Anzeige professionell wirkt."
                                      : language === "en"
                                        ? "Fill in the full vehicle profile so the ad feels like a professional dealership offer."
                                        : "Vyplňte kompletní profil vozu, aby inzerát působil jako profesionální nabídka autobazaru."
                                  : language === "uk"
                                    ? "Для приватного продажу достатньо чітких фото, стану, ціни та контакту."
                                    : language === "de"
                                      ? "Für privaten Verkauf reichen klare Fotos, Zustand, Preis und Kontakt."
                                      : language === "en"
                                        ? "For a private sale, clear photos, condition, price and contact are the key fields."
                                        : "U soukromého prodeje jsou nejdůležitější jasné fotky, stav, cena a kontakt."}
                              </h4>
                              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                                {(selectedSellerType === "dealer"
                                  ? dealerSellerChecklist
                                  : privateSellerChecklist
                                ).map((item) => (
                                  <div key={item} className="flex items-center gap-2 rounded-2xl bg-white/80 px-3 py-2 text-sm font-semibold text-[#5c3b10]">
                                    <ShieldCheck className="h-4 w-4 shrink-0 text-amber-700" />
                                    {item}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      <FormField
                        control={form.control}
                        name="region"
                        render={({ field }) => {
                          const normalizedSearch = regionSearch.trim().toLowerCase();
                          const fallbackRegions = regions
                            .filter(
                              (region) =>
                                region.label.toLowerCase().includes(normalizedSearch) ||
                                region.value.toLowerCase().includes(normalizedSearch),
                            )
                            .slice(0, 12)
                            .map((region) => ({
                              id: `fallback-${region.value}`,
                              label: region.label,
                              city: region.label,
                              region: "",
                              country: "Czechia",
                            }));

                          const shownSuggestions =
                            normalizedSearch.length >= 2
                              ? regionSuggestions
                              : fallbackRegions;

                          return (
                            <FormItem>
                              <FormLabel>{t("listing.region")}</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    placeholder={
                                      language === "uk"
                                        ? "Почніть вводити місто або адресу в Чехії"
                                        : language === "cs"
                                          ? "Začněte psát město nebo adresu v Česku"
                                          : "Start typing city or address in Czechia"
                                    }
                                    value={regionSearch || field.value || ""}
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      setRegionSearch(value);
                                      setShowRegionSuggestions(true);
                                      field.onChange(value);
                                    }}
                                    onFocus={() => {
                                      setRegionSearch(field.value || "");
                                      setShowRegionSuggestions(true);
                                    }}
                                    onBlur={() => setTimeout(() => setShowRegionSuggestions(false), 200)}
                                    data-testid="input-region"
                                  />
                                  {showRegionSuggestions && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-xl shadow-lg z-50 overflow-hidden max-h-60 overflow-y-auto">
                                      {isRegionSuggestionsLoading ? (
                                        <div className="px-4 py-3 text-sm text-muted-foreground">
                                          {language === "uk"
                                            ? "Шукаємо адреси..."
                                            : language === "cs"
                                              ? "Hledám adresy..."
                                              : "Searching addresses..."}
                                        </div>
                                      ) : shownSuggestions.length > 0 ? (
                                        shownSuggestions.map((suggestion) => (
                                          <button
                                            key={suggestion.id}
                                            type="button"
                                            className={`w-full px-4 py-3 text-left hover:bg-accent flex items-center gap-3 border-b last:border-b-0 ${
                                              field.value === suggestion.label ? "bg-accent" : ""
                                            }`}
                                            onMouseDown={(e) => {
                                              e.preventDefault();
                                              field.onChange(suggestion.label);
                                              setRegionSearch(suggestion.label);
                                              setShowRegionSuggestions(false);
                                            }}
                                            data-testid={`region-option-${suggestion.id}`}
                                          >
                                            <MapPin className="w-4 h-4 text-[#B8860B]" />
                                            <span className="text-black dark:text-white font-medium">
                                              {suggestion.label}
                                            </span>
                                          </button>
                                        ))
                                      ) : (
                                        <div className="px-4 py-3 text-sm text-muted-foreground">
                                          {language === "uk"
                                            ? "Адреси не знайдено."
                                            : language === "cs"
                                              ? "Adresa nebyla nalezena."
                                              : "No addresses found."}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </FormControl>
                              <FormDescription>
                                {language === "uk"
                                  ? "Почніть вводити адресу або місто — список підтягується з відкритої бази Чехії."
                                  : language === "cs"
                                    ? "Začněte psát adresu nebo město — seznam se načítá z otevřené databáze pro Česko."
                                    : "Start typing an address or city — suggestions are loaded from open Czech location data."}
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("listing.phone")}</FormLabel>
                            <FormControl>
                              <Input
                                type="tel"
                                inputMode="tel"
                                placeholder={t("listing.phonePlaceholder") || "+420 777 555 333"}
                                name={field.name}
                                ref={field.ref}
                                onBlur={field.onBlur}
                                value={formatPhoneDisplay(field.value)}
                                onChange={(e) => field.onChange(formatPhoneDisplay(e.target.value))}
                                data-testid="input-phone"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="vin"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel className="inline-flex items-center gap-1.5">
                              {t("listing.vin")}
                              <InfoHint>VIN má 17 znaků. Automatické načtení údajů zapneme jen po ověření bezplatného VIN API.</InfoHint>
                            </FormLabel>
                            <FormControl>
                              <div className="flex flex-col sm:flex-row gap-2">
                                <Input
                                  placeholder={t("listing.vinPlaceholder")}
                                  {...field}
                                  value={field.value || ""}
                                  onChange={(e) => {
                                    const normalized = e.target.value
                                      .toUpperCase()
                                      .replace(/\s+/g, "")
                                      .replace(/[^A-Z0-9]/g, "")
                                      .replace(/[IOQ]/g, "")
                                      .slice(0, 17);
                                    field.onChange(normalized);
                                    setVinStatus("idle");
                                  }}
                                  maxLength={17}
                                  className="uppercase flex-1"
                                  data-testid="input-vin"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="h-12 shrink-0 gap-2 rounded-xl border-[#B8860B]/40 px-4 font-semibold text-[#B8860B] hover:bg-[#B8860B]/10 hover:text-[#B8860B] disabled:opacity-50"
                                  disabled={(field.value || "").length !== 17}
                                  onClick={() => {
                                    setVinStatus("failed");
                                    toast({
                                      title:
                                        language === "uk"
                                          ? "Готуємо функцію"
                                          : language === "de"
                                            ? "In Vorbereitung"
                                            : language === "en"
                                              ? "Coming soon"
                                              : "Připravujeme",
                                      description:
                                        language === "uk"
                                          ? "Автоматичне заповнення з VIN буде доступне найближчим часом."
                                          : language === "de"
                                            ? "Das automatische Ausfüllen aus der VIN ist bald verfügbar."
                                            : language === "en"
                                              ? "Automatic data loading from VIN will be available soon."
                                              : "Automatické načtení údajů z VIN bude brzy dostupné.",
                                    })
                                  }}
                                  data-testid="button-vin-decode"
                                >
                                  <Search className="h-4 w-4" />
                                  <span>
                                    {language === "uk"
                                      ? "Завантажити дані з VIN"
                                      : language === "de"
                                        ? "Daten aus VIN laden"
                                        : language === "en"
                                          ? "Load data from VIN"
                                          : "Načíst údaje z VIN"}
                                  </span>
                                </Button>
                              </div>
                            </FormControl>
                            <div className="mt-2 flex flex-col gap-1.5">
                              <FormDescription>{t("listing.vinHint")}</FormDescription>
                              {vinStatus === "verified" && (
                                <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
                                  <CheckCircle2 className="h-4 w-4" />
                                  VIN ověřen
                                </div>
                              )}
                              {vinStatus === "failed" && (
                                <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-700">
                                  <XCircle className="h-4 w-4" />
                                  VIN nebylo možné ověřit.
                                </div>
                              )}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                    </div>
                  </div>

                  <Accordion type="single" collapsible className="rounded-2xl border bg-card/40">
                    <AccordionItem value="vehicle-history" className="border-b-0">
                      <AccordionTrigger className="px-4 sm:px-5 text-lg font-semibold hover:no-underline">
                        <span className="flex items-center gap-2">
                          {language === "uk"
                            ? "Історія автомобіля"
                            : language === "de"
                              ? "Fahrzeughistorie"
                              : language === "en"
                                ? "Vehicle history"
                                : "Historie vozidla"}
                          {[
                            watchedValues.owners,
                            watchedValues.euroEmission,
                            watchedValues.stkValidUntil,
                            watchedValues.hasServiceBook,
                            watchedValues.isImported,
                            watchedValues.importCountry,
                          ].filter(Boolean).length > 0 && (
                            <span className="rounded-full bg-[#B8860B]/15 px-2 py-0.5 text-xs font-bold text-[#B8860B]">
                              {[
                                watchedValues.owners,
                                watchedValues.euroEmission,
                                watchedValues.stkValidUntil,
                                watchedValues.hasServiceBook,
                                watchedValues.isImported,
                                watchedValues.importCountry,
                              ].filter(Boolean).length}
                            </span>
                          )}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 sm:px-5">
                  <div className={`space-y-4 rounded-3xl border p-4 sm:p-5 ${
                    selectedSellerType === "dealer"
                      ? "border-amber-200 bg-amber-50/45"
                      : "border-border bg-muted/20"
                  }`}>
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-amber-800 shadow-sm">
                        <ShieldCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-[#4b2d08]">
                          {selectedSellerType === "dealer"
                            ? language === "uk"
                              ? "Професійні дані для автобазару"
                              : language === "de"
                                ? "Professionelle Angaben für Autohaus"
                                : language === "en"
                                  ? "Professional dealer information"
                                  : "Profesionální údaje pro autobazar"
                            : selectedSellerType === "private"
                              ? language === "uk"
                                ? "Довіра до оголошення"
                                : language === "de"
                                  ? "Vertrauen zur Anzeige"
                                  : language === "en"
                                    ? "Listing trust details"
                                    : "Důvěryhodnost inzerátu"
                              : language === "uk"
                                ? "Додаткові дані оголошення"
                                : language === "de"
                                  ? "Zusätzliche Angaben"
                                  : language === "en"
                                    ? "Additional listing details"
                                    : "Doplňující údaje inzerátu"}
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {selectedSellerType === "dealer"
                            ? language === "uk"
                              ? "Ці дані будуть показані в оголошенні як структурована інформація для покупця."
                              : language === "de"
                                ? "Diese Daten erscheinen in der Anzeige als strukturierte Käuferinformationen."
                                : language === "en"
                                  ? "These details are shown in the listing as structured buyer information."
                                  : "Tyto údaje se v inzerátu zobrazí jako přehledné informace pro kupujícího."
                            : selectedSellerType === "private"
                              ? language === "uk"
                                ? "Заповніть, якщо хочете підвищити довіру покупця."
                                : language === "de"
                                  ? "Ausfüllen, wenn Sie das Vertrauen des Käufers erhöhen möchten."
                                  : language === "en"
                                    ? "Fill these in to increase buyer trust."
                                    : "Vyplňte je, pokud chcete zvýšit důvěru kupujícího."
                              : language === "uk"
                                ? "Після вибору типу продавця покажемо, які дані важливі для цього оголошення."
                                : language === "de"
                                  ? "Nach Auswahl des Verkäufertyps zeigen wir die wichtigsten Daten."
                                  : language === "en"
                                    ? "After choosing seller type, we will show the most important details."
                                    : "Po výběru typu prodejce ukážeme nejdůležitější údaje pro tento inzerát."}
                        </p>
                      </div>
                    </div>

                  {/* Euro Emission, STK Validity, and Service Book */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    <FormField
                      control={form.control}
                      name="euroEmission"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("listing.euroEmission")}</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ""}>
                            <FormControl>
                              <SelectTrigger data-testid="select-euro-emission">
                                <SelectValue placeholder={t("listing.selectEuroEmission")} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="euro1">{t("filters.euro1")}</SelectItem>
                              <SelectItem value="euro2">{t("filters.euro2")}</SelectItem>
                              <SelectItem value="euro3">{t("filters.euro3")}</SelectItem>
                              <SelectItem value="euro4">{t("filters.euro4")}</SelectItem>
                              <SelectItem value="euro5">{t("filters.euro5")}</SelectItem>
                              <SelectItem value="euro6">{t("filters.euro6")}</SelectItem>
                              <SelectItem value="euro6d">{t("filters.euro6d")}</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="stkValidUntil"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("listing.stkValidUntil")}</FormLabel>
                          <FormControl>
                            <MonthPicker
                              value={field.value || ""}
                              onChange={field.onChange}
                              data-testid="input-stk-valid-until"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="hasServiceBook"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 h-fit">
                          <FormControl>
                            <Checkbox
                              checked={field.value === true}
                              onCheckedChange={(checked) => field.onChange(checked === true)}
                              data-testid="checkbox-has-service-book"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              {t("listing.hasServiceBook")}
                            </FormLabel>
                            <FormDescription>
                              {t("listing.hasServiceBookDesc")}
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="isImported"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value === true}
                            onCheckedChange={(checked) => field.onChange(checked === true)}
                            data-testid="checkbox-is-imported"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            {t("listing.isImported")}
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  {isImported && (
                    <FormField
                      control={form.control}
                      name="importCountry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("listing.importCountry")}</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ""}>
                            <FormControl>
                              <SelectTrigger data-testid="select-import-country">
                                <SelectValue placeholder={t("listing.importCountry")} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {importCountries.map((country) => (
                                <SelectItem key={country.value} value={country.value}>
                                  {country.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  <Accordion type="single" collapsible className="rounded-2xl border bg-card/40">
                    <AccordionItem value="equipment" className="border-b-0">
                      <AccordionTrigger className="px-4 sm:px-5 text-lg font-semibold hover:no-underline">
                        <span className="flex items-center gap-2">
                          {t("listing.equipment")}
                          {(watchedValues.equipment?.length || 0) > 0 && (
                            <span className="rounded-full bg-[#B8860B]/15 px-2 py-0.5 text-xs font-bold text-[#B8860B]">
                              {watchedValues.equipment?.length}
                            </span>
                          )}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 sm:px-5">
                    <FormField
                      control={form.control}
                      name="equipment"
                      render={() => (
                        <FormItem>
                          <div className="space-y-5">
                            {equipmentGroups.map((group) => (
                              <div key={group.title} className="space-y-3">
                                <div className="flex items-center gap-2">
                                  <div className="h-px flex-1 bg-border" />
                                  <h4 className="text-sm font-bold uppercase tracking-[0.14em] text-[#B8860B]">
                                    {group.title}
                                  </h4>
                                  <div className="h-px flex-1 bg-border" />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                  {group.options.map((option) => (
                                    <FormField
                                      key={option.value}
                                      control={form.control}
                                      name="equipment"
                                      render={({ field }) => {
                                        const isChecked = field.value?.includes(option.value);
                                        return (
                                          <FormItem
                                            key={option.value}
                                            className={`flex min-h-12 flex-row items-center space-x-3 space-y-0 rounded-xl border px-3 py-2.5 transition-all ${
                                              isChecked
                                                ? "border-[#B8860B] bg-[#B8860B]/10 shadow-sm"
                                                : "border-border bg-background hover:border-[#B8860B]/40"
                                            }`}
                                          >
                                            <FormControl>
                                              <Checkbox
                                                checked={isChecked}
                                                onCheckedChange={(checked) => {
                                                  const current = Array.isArray(field.value) ? field.value : [];
                                                  if (checked === true) {
                                                    if (!current.includes(option.value)) {
                                                      field.onChange([...current, option.value]);
                                                    }
                                                  } else {
                                                    field.onChange(current.filter((value) => value !== option.value));
                                                  }
                                                }}
                                                data-testid={`checkbox-equipment-${option.value}`}
                                              />
                                            </FormControl>
                                            <FormLabel className="cursor-pointer text-sm font-medium leading-snug">
                                              {option.label}
                                            </FormLabel>
                                          </FormItem>
                                        )
                                      }}
                                    />
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  <Accordion type="single" collapsible className="rounded-2xl border bg-card/40">
                    <AccordionItem value="extras" className="border-b-0">
                      <AccordionTrigger className="px-4 sm:px-5 text-lg font-semibold hover:no-underline">
                        <span className="flex items-center gap-2">
                          {t("listing.extras")}
                          {listingExtrasOptions.filter((option) => watchedValues.extras?.includes(option.value)).length > 0 && (
                            <span className="rounded-full bg-[#B8860B]/15 px-2 py-0.5 text-xs font-bold text-[#B8860B]">
                              {listingExtrasOptions.filter((option) => watchedValues.extras?.includes(option.value)).length}
                            </span>
                          )}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 sm:px-5">
                    <FormField
                      control={form.control}
                      name="extras"
                      render={() => (
                        <FormItem>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {listingExtrasOptions.map((option) => (
                              <FormField
                                key={option.value}
                                control={form.control}
                                name="extras"
                                render={({ field }) => {
                                  const isChecked = field.value?.includes(option.value);
                                  return (
                                    <FormItem
                                      key={option.value}
                                      className={`flex min-h-12 flex-row items-center space-x-3 space-y-0 rounded-xl border px-3 py-2.5 transition-all ${
                                        isChecked
                                          ? "border-[#B8860B] bg-[#B8860B]/10 shadow-sm"
                                          : "border-border bg-background hover:border-[#B8860B]/40"
                                      }`}
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={isChecked}
                                          onCheckedChange={(checked) => {
                                            const current = Array.isArray(field.value) ? field.value : [];
                                            if (checked === true) {
                                              if (!current.includes(option.value)) {
                                                field.onChange([...current, option.value]);
                                              }
                                            } else {
                                              field.onChange(current.filter((value) => value !== option.value));
                                            }
                                          }}
                                          data-testid={`checkbox-extra-${option.value}`}
                                        />
                                      </FormControl>
                                      <FormLabel className="cursor-pointer text-sm font-medium leading-snug">
                                        {option.label}
                                      </FormLabel>
                                    </FormItem>
                                  )
                                }}
                              />
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  <Accordion type="single" collapsible className="rounded-2xl border bg-card/40">
                    <AccordionItem value="sale-options" className="border-b-0">
                      <AccordionTrigger className="px-4 sm:px-5 text-lg font-semibold hover:no-underline">
                        <span className="flex items-center gap-2">
                          Možnosti prodeje
                          {saleOptions.filter((option) => watchedValues.extras?.includes(option.value)).length > 0 && (
                            <span className="rounded-full bg-[#B8860B]/15 px-2 py-0.5 text-xs font-bold text-[#B8860B]">
                              {saleOptions.filter((option) => watchedValues.extras?.includes(option.value)).length}
                            </span>
                          )}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 sm:px-5">
                        <FormField
                          control={form.control}
                          name="extras"
                          render={() => (
                            <FormItem>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {saleOptions.map((option) => (
                                  <FormField
                                    key={option.value}
                                    control={form.control}
                                    name="extras"
                                    render={({ field }) => {
                                      const isChecked = field.value?.includes(option.value);
                                      return (
                                        <FormItem
                                          className={`flex min-h-12 flex-row items-center space-x-3 space-y-0 rounded-xl border px-3 py-2.5 transition-all ${
                                            isChecked
                                              ? "border-[#B8860B] bg-[#B8860B]/10 shadow-sm"
                                              : "border-border bg-background hover:border-[#B8860B]/40"
                                          }`}
                                        >
                                          <FormControl>
                                            <Checkbox
                                              checked={isChecked}
                                              onCheckedChange={(checked) => {
                                                const current = Array.isArray(field.value) ? field.value : [];
                                                if (checked === true) {
                                                  if (!current.includes(option.value)) {
                                                    field.onChange([...current, option.value]);
                                                  }
                                                } else {
                                                  field.onChange(current.filter((value) => value !== option.value));
                                                }
                                              }}
                                              data-testid={`checkbox-sale-${option.value}`}
                                            />
                                          </FormControl>
                                          <FormLabel className="cursor-pointer text-sm font-medium leading-snug">
                                            {option.label}
                                          </FormLabel>
                                        </FormItem>
                                      );
                                    }}
                                  />
                                ))}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  <Accordion type="single" collapsible className="rounded-2xl border bg-card/40">
                    <AccordionItem value="financing-options" className="border-b-0">
                      <AccordionTrigger className="px-4 sm:px-5 text-lg font-semibold hover:no-underline">
                        <span className="flex items-center gap-2">
                          Možnosti financování
                          {[
                            watchedValues.financingAvailable,
                            watchedValues.financingMonthlyPayment,
                            watchedValues.financingDownPaymentPercent,
                            watchedValues.financingTermMonths,
                            watchedValues.financingProvider,
                            watchedValues.financingOnlineApproval,
                            watchedValues.financingForBusiness,
                            watchedValues.financingForPrivate,
                            ...financingOptions.filter((option) =>
                              watchedValues.extras?.includes(option.value),
                            ),
                          ].filter(Boolean).length > 0 && (
                            <span className="rounded-full bg-[#B8860B]/15 px-2 py-0.5 text-xs font-bold text-[#B8860B]">
                              {[
                                watchedValues.financingAvailable,
                                watchedValues.financingMonthlyPayment,
                                watchedValues.financingDownPaymentPercent,
                                watchedValues.financingTermMonths,
                                watchedValues.financingProvider,
                                watchedValues.financingOnlineApproval,
                                watchedValues.financingForBusiness,
                                watchedValues.financingForPrivate,
                                ...financingOptions.filter((option) =>
                                  watchedValues.extras?.includes(option.value),
                                ),
                              ].filter(Boolean).length}
                            </span>
                          )}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 sm:px-5">
                        <FormField
                          control={form.control}
                          name="financingAvailable"
                          render={({ field }) => (
                            <FormItem
                              className={`mb-4 flex min-h-12 flex-row items-center space-x-3 space-y-0 rounded-xl border px-3 py-2.5 transition-all ${
                                field.value
                                  ? "border-[#B8860B] bg-[#B8860B]/10 shadow-sm"
                                  : "border-border bg-background hover:border-[#B8860B]/40"
                              }`}
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value === true}
                                  onCheckedChange={(checked) => {
                                    const enabled = checked === true;
                                    field.onChange(enabled);
                                    if (!enabled) {
                                      form.setValue("financingMonthlyPayment", undefined);
                                      form.setValue("financingDownPaymentPercent", undefined);
                                      form.setValue("financingTermMonths", undefined);
                                      form.setValue("financingProvider", "");
                                      form.setValue("financingOnlineApproval", false);
                                      form.setValue("financingForBusiness", false);
                                      form.setValue("financingForPrivate", false);
                                      form.setValue(
                                        "extras",
                                        (form.getValues("extras") || []).filter(
                                          (value) => !financingOptionValues.includes(value),
                                        ),
                                      );
                                    }
                                  }}
                                  data-testid="checkbox-financing-available"
                                />
                              </FormControl>
                              <FormLabel className="cursor-pointer text-sm font-semibold leading-snug">
                                Chci nabídnout financování
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                        {isFinancingEnabled && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="financingMonthlyPayment"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Financování od (Kč / měsíc)</FormLabel>
                                    <FormControl>
                                      <div className="relative">
                                        <Input
                                          type="text"
                                          inputMode="numeric"
                                          placeholder="např. 3 990"
                                          className="pr-28 font-semibold"
                                          value={formatPriceDisplay(field.value)}
                                          onChange={(e) => {
                                            const cleaned = e.target.value.replace(/[^\d]/g, "");
                                            field.onChange(cleaned ? Number(cleaned) : undefined);
                                          }}
                                          data-testid="input-financing-monthly-payment"
                                        />
                                        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[#B8860B]">
                                          Kč / měsíc
                                        </span>
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="financingDownPaymentPercent"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Akontace od (%)</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        min={0}
                                        max={100}
                                        placeholder="např. 10"
                                        value={field.value ?? ""}
                                        onChange={(e) =>
                                          field.onChange(e.target.value ? Number(e.target.value) : undefined)
                                        }
                                        data-testid="input-financing-down-payment"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="financingTermMonths"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Doba splácení (měsíce)</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        min={0}
                                        placeholder="např. 72"
                                        value={field.value ?? ""}
                                        onChange={(e) =>
                                          field.onChange(e.target.value ? Number(e.target.value) : undefined)
                                        }
                                        data-testid="input-financing-term"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="financingProvider"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Poskytovatel financování</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="nepovinné"
                                        {...field}
                                        value={field.value || ""}
                                        data-testid="input-financing-provider"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {financingOptions.map((option) => (
                                <FormField
                                  key={option.value}
                                  control={form.control}
                                  name="extras"
                                  render={({ field }) => {
                                    const isChecked = field.value?.includes(option.value);
                                    return (
                                      <FormItem
                                        className={`flex min-h-12 flex-row items-center space-x-3 space-y-0 rounded-xl border px-3 py-2.5 transition-all ${
                                          isChecked
                                            ? "border-[#B8860B] bg-[#B8860B]/10 shadow-sm"
                                            : "border-border bg-background hover:border-[#B8860B]/40"
                                        }`}
                                      >
                                        <FormControl>
                                          <Checkbox
                                            checked={isChecked}
                                            onCheckedChange={(checked) => {
                                              const current = Array.isArray(field.value) ? field.value : [];
                                              if (checked === true) {
                                                if (!current.includes(option.value)) {
                                                  field.onChange([...current, option.value]);
                                                }
                                              } else {
                                                field.onChange(current.filter((value) => value !== option.value));
                                              }
                                            }}
                                            data-testid={`checkbox-financing-${option.value}`}
                                          />
                                        </FormControl>
                                        <FormLabel className="cursor-pointer text-sm font-medium leading-snug">
                                          {option.label}
                                        </FormLabel>
                                      </FormItem>
                                    );
                                  }}
                                />
                              ))}
                              {[
                                ["financingOnlineApproval", "Schválení online"],
                                ["financingForBusiness", "Financování pro podnikatele"],
                                ["financingForPrivate", "Financování pro soukromé osoby"],
                              ].map(([name, label]) => (
                                <FormField
                                  key={name}
                                  control={form.control}
                                  name={name as any}
                                  render={({ field }) => (
                                    <FormItem
                                      className={`flex min-h-12 flex-row items-center space-x-3 space-y-0 rounded-xl border px-3 py-2.5 transition-all ${
                                        field.value
                                          ? "border-[#B8860B] bg-[#B8860B]/10 shadow-sm"
                                          : "border-border bg-background hover:border-[#B8860B]/40"
                                      }`}
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value === true}
                                          onCheckedChange={(checked) =>
                                            field.onChange(checked === true)
                                          }
                                          data-testid={`checkbox-${name}`}
                                        />
                                      </FormControl>
                                      <FormLabel className="cursor-pointer text-sm font-medium leading-snug">
                                        {label}
                                      </FormLabel>
                                    </FormItem>
                                  )}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  <FormField
                    control={form.control}
                    name="isTopListing"
                    render={({ field }) => (
                      <FormItem className="space-y-0">
                        <FormControl>
                          <button
                            type="button"
                            onClick={() => field.onChange(field.value !== true)}
                            className={`w-full text-left rounded-2xl border-2 p-4 sm:p-5 transition-all ${
                              field.value
                                ? "border-[#B8860B] bg-gradient-to-br from-[#B8860B]/15 to-[#D4AF37]/10 shadow-[0_8px_24px_rgba(184,134,11,0.25)]"
                                : "border-[#B8860B]/30 bg-card hover:border-[#B8860B]/60 hover:bg-[#B8860B]/5"
                            }`}
                            data-testid="checkbox-top-listing"
                          >
                            <div className="flex items-start gap-3 sm:gap-4">
                              <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#B8860B] to-[#D4AF37] text-white shadow">
                                <Crown className="h-5 w-5 sm:h-6 sm:w-6" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-base sm:text-lg font-bold text-foreground">
                                    {language === "uk"
                                      ? "Топ оголошення"
                                      : language === "de"
                                        ? "Top-Anzeige"
                                        : language === "en"
                                          ? "Top listing"
                                          : "Top inzerát"}
                                  </span>
                                  <span className="rounded-full bg-gradient-to-r from-[#B8860B] to-[#D4AF37] px-3 py-0.5 text-sm font-bold text-white shadow-sm">
                                    99 Kč
                                  </span>
                                </div>
                                <p className="mt-1 text-sm text-muted-foreground">
                                  {language === "uk"
                                    ? "Вища позиція в результатах протягом 30 днів."
                                    : language === "de"
                                      ? "Höhere Position in den Ergebnissen für 30 Tage."
                                      : language === "en"
                                        ? "Higher position in results for 30 days."
                                        : "Vyšší pozice ve výsledcích po dobu 30 dnů."}
                                </p>
                              </div>
                              <div
                                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-all ${
                                  field.value
                                    ? "border-[#B8860B] bg-[#B8860B] text-white"
                                    : "border-muted-foreground/40"
                                }`}
                              >
                                {field.value && <Check className="h-4 w-4" />}
                              </div>
                            </div>
                          </button>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full sm:w-auto h-12 rounded-xl"
                      onClick={() => setLocation("/listings")}
                      data-testid="button-cancel"
                    >
                      {t("listing.cancel")}
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={
                        createListingMutation.isPending ||
                        isProcessingCheckout ||
                        completeTopListingMutation.isPending ||
                        isMediaUploading
                      }
                      className="w-full sm:flex-1 h-14 rounded-xl text-base font-bold text-white border-0 bg-gradient-to-r from-[#B8860B] to-[#D4AF37] shadow-[0_10px_30px_rgba(184,134,11,0.35)] transition-all hover:from-[#a3760a] hover:to-[#c9a431] hover:shadow-[0_14px_36px_rgba(184,134,11,0.45)] hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
                      data-testid="button-submit"
                    >
                      {isMediaUploading
                        ? language === "uk"
                          ? "Завантаження медіа..."
                          : language === "cs"
                            ? "Nahrávání médií..."
                            : "Uploading media..."
                        : createListingMutation.isPending ||
                            isProcessingCheckout ||
                            completeTopListingMutation.isPending
                          ? t("listing.submitting") || "Odesílání..."
                        : isTopListing
                        ? t("listing.submitWithPayment")
                        : t("listing.submit")}
                    </Button>
                  </div>
                </form>
              </Form>
              {completionPercent >= 60 && (
                <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/90 px-4 py-3 shadow-[0_-10px_30px_rgba(0,0,0,0.08)] backdrop-blur-md sm:hidden">
                  <Button
                    type="button"
                    onClick={handleSubmitClick}
                    disabled={
                      createListingMutation.isPending ||
                      isProcessingCheckout ||
                      completeTopListingMutation.isPending ||
                      isMediaUploading
                    }
                    className="h-12 w-full rounded-xl bg-gradient-to-r from-[#B8860B] to-[#D4AF37] font-bold text-white shadow-[0_8px_20px_rgba(184,134,11,0.3)]"
                    data-testid="button-sticky-submit"
                  >
                    {completionPercent}% vyplněno · {t("listing.submit")}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />

      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="sm:max-w-lg" data-testid="dialog-listing-review">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <ShieldCheck className="h-6 w-6 text-[#B8860B]" />
              Kontrola inzerátu
            </DialogTitle>
            <DialogDescription>
              Rychlá kontrola před publikací. Pokud je vše v pořádku, potvrďte zveřejnění.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 rounded-2xl border bg-muted/20 p-3">
            {[
              { ok: !!form.getValues("price"), label: "Cena" },
              { ok: !!form.getValues("phone"), label: "Telefon" },
              { ok: photos.length > 0, label: "Fotografie" },
              { ok: !!form.getValues("brand") && !!form.getValues("model"), label: "Značka a model" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 rounded-xl bg-background px-3 py-2 text-sm font-medium">
                {item.ok ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <span>{item.label}</span>
              </div>
            ))}
            {!form.getValues("vin") && (
              <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800">
                <AlertTriangle className="h-4 w-4" />
                VIN není vyplněn
              </div>
            )}
            {photos.length > 0 && photos.length < 10 && (
              <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800">
                <AlertTriangle className="h-4 w-4" />
                Doporučujeme přidat více fotografií (ideálně alespoň 10)
              </div>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-12 rounded-xl"
              onClick={() => setReviewDialogOpen(false)}
            >
              Ještě upravit
            </Button>
            <Button
              type="button"
              className="h-12 rounded-xl bg-gradient-to-r from-[#B8860B] to-[#D4AF37] font-bold text-white hover:from-[#a3760a] hover:to-[#c9a431]"
              onClick={() => {
                setReviewDialogOpen(false);
                form.handleSubmit(onSubmit)();
              }}
              disabled={
                createListingMutation.isPending ||
                isProcessingCheckout ||
                completeTopListingMutation.isPending ||
                isMediaUploading
              }
              data-testid="button-confirm-publish"
            >
              Potvrdit a publikovat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showPaymentSuccessDialog} onOpenChange={setShowPaymentSuccessDialog}>
        <DialogContent className="sm:max-w-md" data-testid="dialog-payment-success">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Sparkles className="h-6 w-6 text-yellow-500" />
              {t("payment.successTitle") || "Platba úspěšná!"}
            </DialogTitle>
            <DialogDescription className="text-base pt-2">
              {t("payment.successDescription") || `Zakoupili jste ${topsPurchased} TOP inzerát${topsPurchased > 1 ? 'y' : ''}.`}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 pt-4">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                {topsPurchased}x TOP
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {t("payment.topsOwned") || "zakoupeno"}
              </div>
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button
              variant="outline"
              onClick={handleBuyMoreTops}
              disabled={isProcessingCheckout}
              className="w-full sm:w-auto"
              data-testid="button-buy-more-tops"
            >
              {t("payment.buyMore") || "Koupit další TOP"}
            </Button>
            <Button
              onClick={handlePostListing}
              disabled={completeTopListingMutation.isPending}
              className="w-full sm:w-auto"
              data-testid="button-post-listing"
            >
              {completeTopListingMutation.isPending
                ? t("listing.submitting") || "Odesílání..."
                : t("payment.postListing") || "Vystavit inzerát"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
