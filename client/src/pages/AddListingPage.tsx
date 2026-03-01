import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertListingSchema, type InsertListing } from "@shared/schema";
import { carBrands, carModels } from "@shared/carDatabase";
import { useTranslation, useLocalizedOptions, vehicleTypeBrands, getModelsForVehicleType } from "@/lib/translations";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation, useSearch } from "wouter";
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
import { ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MonthPicker } from "@/components/ui/month-picker";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CarPhotoUploader } from "@/components/CarPhotoUploader";
import { VideoUploader } from "@/components/VideoUploader";
import { BrandCombobox } from "@/components/BrandCombobox";
import { ModelCombobox } from "@/components/ModelCombobox";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Sparkles, Car, Package, Wrench, CircleDot, Zap, Bot, Activity, ArrowUp, ArrowDown, Grid3x3, Compass, Key, MapPin } from "lucide-react";
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
import acuraLogoColor from "@assets/generated_images/Acura_brand_logo_original_6c3bebd7.png";
import alfaRomeoLogoColor from "@assets/generated_images/Alfa_Romeo_logo_original_086a45c9.png";
import astonMartinLogoColor from "@assets/generated_images/Aston_Martin_logo_b013e7bd.png";
import audiLogoColor from "@assets/generated_images/Audi_logo_original_147691ca.png";
import bentleyLogoColor from "@assets/generated_images/Bentley_logo_original_d9a96e45.png";
import bmwLogoColor from "@assets/generated_images/BMW_logo_original_da68f302.png";
import bugattiLogoColor from "@assets/generated_images/Bugatti_logo_original_6db30359.png";
import cadillacLogoColor from "@assets/generated_images/Cadillac_logo_original_fed89930.png";
import chevroletLogoColor from "@assets/generated_images/Chevrolet_logo_original_57f93929.png";
import chryslerLogoColor from "@assets/generated_images/Chrysler_logo_original_ade81f2e.png";
import citroenLogoColor from "@assets/generated_images/Citroen_logo_original_355ef247.png";
import daciaLogoColor from "@assets/generated_images/Dacia_logo_original_b8df5efa.png";
import ferrariLogoColor from "@assets/generated_images/Ferrari_logo_original_ece7e384.png";
import fiatLogoColor from "@assets/generated_images/Fiat_logo_original_3bbafc73.png";
import fordLogoColor from "@assets/generated_images/Ford_logo_original_6f5cf8f4.png";
import hondaLogoColor from "@assets/generated_images/Honda_logo_original_e8c5ec3b.png";
import hyundaiLogoColor from "@assets/generated_images/Hyundai_logo_original_c07927e9.png";
import infinitiLogoColor from "@assets/generated_images/Infiniti_logo_original_f75d7e81.png";
import jaguarLogoColor from "@assets/generated_images/Jaguar_logo_original_9a59d0b8.png";
import jeepLogoColor from "@assets/generated_images/Jeep_logo_original_e52b641b.png";
import kiaLogoColor from "@assets/generated_images/Kia_logo_original_9e22ddfb.png";
import lamborghiniLogoColor from "@assets/generated_images/Lamborghini_logo_original_b578d0d2.png";
import landRoverLogoColor from "@assets/generated_images/Land_Rover_logo_61fcb4ec.png";
import maseratiLogoColor from "@assets/generated_images/Maserati_logo_original_fdd12123.png";
import mazdaLogoColor from "@assets/generated_images/Mazda_logo_original_eec10ee3.png";
import mclarenLogoColor from "@assets/generated_images/McLaren_logo_original_e939cb1a.png";
import mercedesLogoColor from "@assets/generated_images/Mercedes_logo_original_6c294c84.png";
import miniLogoColor from "@assets/generated_images/MINI_logo_original_f0f8fbf8.png";
import mitsubishiLogoColor from "@assets/generated_images/Mitsubishi_logo_original_ecfcc00d.png";
import nissanLogoColor from "@assets/generated_images/Nissan_logo_original_ca5b3ec4.png";
import opelLogoColor from "@assets/generated_images/Opel_logo_original_55520476.png";
import peugeotLogoColor from "@assets/generated_images/Peugeot_logo_original_49276848.png";
import porscheLogoColor from "@assets/generated_images/Porsche_logo_original_20663cc0.png";
import ramLogoColor from "@assets/generated_images/RAM_logo_original_01d5325e.png";
import renaultLogoColor from "@assets/generated_images/Renault_logo_original_5f790e40.png";
import rollsRoyceLogoColor from "@assets/generated_images/Rolls-Royce_logo_b3b6a8b1.png";
import seatLogoColor from "@assets/generated_images/Seat_logo_original_187ae0be.png";
import skodaLogoColor from "@assets/generated_images/Skoda_logo_original_1371d0f2.png";
import subaruLogoColor from "@assets/generated_images/Subaru_logo_original_cb416dff.png";
import suzukiLogoColor from "@assets/generated_images/Suzuki_logo_original_a2a3d37d.png";
import teslaLogoColor from "@assets/generated_images/Tesla_logo_original_1206b5d7.png";
import toyotaLogoColor from "@assets/generated_images/Toyota_logo_original_3d98b809.png";
import volkswagenLogoColor from "@assets/generated_images/Volkswagen_logo_original_3c9ab739.png";
import volvoLogoColor from "@assets/generated_images/Volvo_logo_original_8e608d2c.png";
import buickLogoColor from "@assets/generated_images/Buick_logo_color_feadaa67.png";
import daewooLogoColor from "@assets/generated_images/Daewoo_logo_color_54f95085.png";
import daihatsuLogoColor from "@assets/generated_images/Daihatsu_logo_color_a902adb5.png";
import dodgeLogoColor from "@assets/generated_images/Dodge_logo_color_ef37c49c.png";
import genesisLogoColor from "@assets/generated_images/Genesis_logo_color_faa280dc.png";
import gmcLogoColor from "@assets/generated_images/GMC_logo_color_17710e6b.png";
import hummerLogoColor from "@assets/generated_images/Hummer_logo_color_f0752a0e.png";
import isuzuLogoColor from "@assets/generated_images/Isuzu_logo_color_3cdb4047.png";
import ladaLogoColor from "@assets/generated_images/Lada_logo_color_b35bd85b.png";
import lanciaLogoColor from "@assets/generated_images/Lancia_logo_color_f4fec5bd.png";
import lexusLogoColor from "@assets/generated_images/Lexus_logo_color_5fea4016.png";
import lincolnLogoColor from "@assets/generated_images/Lincoln_logo_color_f90256c5.png";
import lotusLogoColor from "@assets/generated_images/Lotus_logo_color_11110c83.png";
import maybachLogoColor from "@assets/generated_images/Maybach_logo_color_0f4f6bf6.png";
import mgLogoColor from "@assets/generated_images/MG_logo_color_cd9c2803.png";
import roverLogoColor from "@assets/generated_images/Rover_logo_color_0c669a58.png";
import saabLogoColor from "@assets/generated_images/Saab_logo_color_c663d669.png";
import smartLogoColor from "@assets/generated_images/Smart_logo_color_ea825808.png";
import ssangyongLogoColor from "@assets/generated_images/SsangYong_logo_color_691effcf.png";
import uazLogoColor from "@assets/generated_images/UAZ_logo_color_444aca90.png";
import tatraLogoColor from "@assets/generated_images/tatra_truck_company_logo.png";
import manLogoColor from "@assets/generated_images/man_truck_company_logo.png";
import ivecoLogoColor from "@assets/generated_images/iveco_truck_company_logo.png";
import aviaLogoColor from "@assets/generated_images/avia_truck_company_logo.png";
import dafLogoColor from "@assets/generated_images/daf_truck_company_logo.png";
import scaniaLogoColor from "@assets/generated_images/scania_truck_company_logo.png";
import liazLogoColor from "@assets/generated_images/liaz_truck_company_logo.png";
import pragaLogoColor from "@assets/generated_images/praga_truck_company_logo.png";
import ifaLogoColor from "@assets/generated_images/ifa_truck_company_logo.png";
import agmLogoColor from "@assets/generated_images/agm_truck_company_logo.png";
import aroLogoColor from "@assets/generated_images/aro_vehicle_company_logo.png";
import fusoLogoColor from "@assets/generated_images/fuso_truck_company_logo.png";
import jawaLogoColor from "@assets/generated_images/jawa_motorcycle_company_logo.png";
import yamahaLogoColor from "@assets/generated_images/yamaha_motorcycle_company_logo.png";
import harleyDavidsonLogoColor from "@assets/generated_images/harley-davidson_motorcycle_logo.png";
import kawasakiLogoColor from "@assets/generated_images/kawasaki_motorcycle_company_logo.png";
import ktmLogoColor from "@assets/generated_images/ktm_motorcycle_company_logo.png";
import triumphLogoColor from "@assets/generated_images/triumph_motorcycle_company_logo.png";
import ducatiLogoColor from "@assets/generated_images/ducati_motorcycle_company_logo.png";
import apriliaLogoColor from "@assets/generated_images/aprilia_motorcycle_company_logo.png";
import piaggioLogoColor from "@assets/generated_images/piaggio_scooter_company_logo.png";
import kymcoLogoColor from "@assets/generated_images/kymco_scooter_company_logo.png";
import accessLogoColor from "@assets/generated_images/access_motor_company_logo.png";
import adamsLogoColor from "@assets/generated_images/adams_motorcycle_company_logo.png";
import aeonLogoColor from "@assets/generated_images/aeon_motor_company_logo.png";
import bednaLogoColor from "@assets/generated_images/bedna_motorcycle_company_logo.png";
import mbpLogoColor from "@assets/generated_images/mbp_motorcycle_brand_logo.png";
import brixtonLogoColor from "@assets/generated_images/brixton_motorcycle_company_logo.png";
import yukiLogoColor from "@assets/generated_images/yuki_motorcycle_company_logo.png";
import type { ComponentType } from "react";

type BrandIconEntry = 
  | { type: "component"; component: ComponentType<{ className?: string }> }
  | { type: "image"; src: string; alt: string };

const BrandIconRenderer = ({ icon, className = "w-4 h-4" }: { icon?: BrandIconEntry; className?: string }) => {
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
      style={{ objectFit: "contain" }}
    />
  );
};

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
  
  const [yearOpen, setYearOpen] = useState(false);
  const [mileageOpen, setMileageOpen] = useState(false);
  const [engineOpen, setEngineOpen] = useState(false);
  const [powerOpen, setPowerOpen] = useState(false);
  const [ownersOpen, setOwnersOpen] = useState(false);
  
  const [yearCustom, setYearCustom] = useState(false);
  const [mileageCustom, setMileageCustom] = useState(false);
  const [engineCustom, setEngineCustom] = useState(false);
  const [powerCustom, setPowerCustom] = useState(false);
  const [ownersCustom, setOwnersCustom] = useState(false);
  
  const [showPaymentSuccessDialog, setShowPaymentSuccessDialog] = useState(false);
  const [stripeSessionId, setStripeSessionId] = useState<string | null>(null);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [topsPurchased, setTopsPurchased] = useState(1);
  
  const { language } = useLanguage();
  
  const formatNumber = (value: number): string => {
    if (value === 0) return "";
    return new Intl.NumberFormat(
      language === "cs" ? "cs-CZ" : language === "uk" ? "uk-UA" : "en-US"
    ).format(value);
  };
  
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: currentYear - 1979 }, (_, i) => currentYear - i);
  const mileageOptions = [0, 10000, 20000, 30000, 50000, 75000, 100000, 125000, 150000, 200000, 250000, 300000, 400000, 500000, 600000];
  const engineOptions = [0.8, 1.0, 1.2, 1.4, 1.5, 1.6, 1.8, 2.0, 2.2, 2.5, 3.0, 3.5, 4.0, 5.0, 6.0];
  const powerOptions = [50, 75, 100, 125, 150, 175, 200, 250, 300, 350, 400, 500, 600, 700, 800, 1000];
  const ownersOptions = [1, 2, 3, 4, 5];

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        variant: "destructive",
        title: t("auth.loginRequired"),
        description: t("auth.loginRequiredDescription"),
      });
      setLocation("/");
    }
  }, [isLoading, isAuthenticated, setLocation, toast, t]);

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
      setLocation(`/listing/${newListing.id}`);
      setOwnersFilterType('');
      setEngineFilterType('');
      setPowerFilterType('');
      setDoorsFilterType('');
      setSeatsFilterType('');
      form.reset({
        userId: user?.id || "",
        title: "",
        description: undefined,
        price: "0",
        brand: "",
        model: "",
        year: new Date().getFullYear(),
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
        photos: undefined,
      });
      // Redirect to the newly created listing page
      if (newListing?.id) {
        setLocation(`/listing/${newListing.id}`);
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
    { value: "hybrid", label: t("hero.hybrid") },
    { value: "electric", label: t("hero.electric") },
    { value: "lpg", label: t("hero.lpg") },
    { value: "cng", label: t("hero.cng") },
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
  ];

  const sellerTypes = [
    { value: "private", label: t("listing.sellerPrivate") },
    { value: "dealer", label: t("listing.sellerDealer") },
  ];

  const brandIcons: Record<string, BrandIconEntry> = {
    acura: { type: "image", src: acuraLogoColor, alt: "Acura" },
    "alfa-romeo": { type: "image", src: alfaRomeoLogoColor, alt: "Alfa Romeo" },
    "aston-martin": { type: "image", src: astonMartinLogoColor, alt: "Aston Martin" },
    audi: { type: "image", src: audiLogoColor, alt: "Audi" },
    bentley: { type: "image", src: bentleyLogoColor, alt: "Bentley" },
    bmw: { type: "image", src: bmwLogoColor, alt: "BMW" },
    bugatti: { type: "image", src: bugattiLogoColor, alt: "Bugatti" },
    buick: { type: "image", src: buickLogoColor, alt: "Buick" },
    cadillac: { type: "image", src: cadillacLogoColor, alt: "Cadillac" },
    chevrolet: { type: "image", src: chevroletLogoColor, alt: "Chevrolet" },
    chrysler: { type: "image", src: chryslerLogoColor, alt: "Chrysler" },
    citroen: { type: "image", src: citroenLogoColor, alt: "Citroen" },
    dacia: { type: "image", src: daciaLogoColor, alt: "Dacia" },
    daewoo: { type: "image", src: daewooLogoColor, alt: "Daewoo" },
    daihatsu: { type: "image", src: daihatsuLogoColor, alt: "Daihatsu" },
    dodge: { type: "image", src: dodgeLogoColor, alt: "Dodge" },
    ferrari: { type: "image", src: ferrariLogoColor, alt: "Ferrari" },
    fiat: { type: "image", src: fiatLogoColor, alt: "Fiat" },
    ford: { type: "image", src: fordLogoColor, alt: "Ford" },
    genesis: { type: "image", src: genesisLogoColor, alt: "Genesis" },
    gmc: { type: "image", src: gmcLogoColor, alt: "GMC" },
    honda: { type: "image", src: hondaLogoColor, alt: "Honda" },
    hummer: { type: "image", src: hummerLogoColor, alt: "Hummer" },
    hyundai: { type: "image", src: hyundaiLogoColor, alt: "Hyundai" },
    infiniti: { type: "image", src: infinitiLogoColor, alt: "Infiniti" },
    isuzu: { type: "image", src: isuzuLogoColor, alt: "Isuzu" },
    jaguar: { type: "image", src: jaguarLogoColor, alt: "Jaguar" },
    jeep: { type: "image", src: jeepLogoColor, alt: "Jeep" },
    kia: { type: "image", src: kiaLogoColor, alt: "Kia" },
    lada: { type: "image", src: ladaLogoColor, alt: "Lada" },
    lamborghini: { type: "image", src: lamborghiniLogoColor, alt: "Lamborghini" },
    "land-rover": { type: "image", src: landRoverLogoColor, alt: "Land Rover" },
    lancia: { type: "image", src: lanciaLogoColor, alt: "Lancia" },
    lexus: { type: "image", src: lexusLogoColor, alt: "Lexus" },
    lincoln: { type: "image", src: lincolnLogoColor, alt: "Lincoln" },
    lotus: { type: "image", src: lotusLogoColor, alt: "Lotus" },
    maserati: { type: "image", src: maseratiLogoColor, alt: "Maserati" },
    maybach: { type: "image", src: maybachLogoColor, alt: "Maybach" },
    mazda: { type: "image", src: mazdaLogoColor, alt: "Mazda" },
    mclaren: { type: "image", src: mclarenLogoColor, alt: "McLaren" },
    mercedes: { type: "image", src: mercedesLogoColor, alt: "Mercedes" },
    mg: { type: "image", src: mgLogoColor, alt: "MG" },
    mini: { type: "image", src: miniLogoColor, alt: "MINI" },
    mitsubishi: { type: "image", src: mitsubishiLogoColor, alt: "Mitsubishi" },
    nissan: { type: "image", src: nissanLogoColor, alt: "Nissan" },
    opel: { type: "image", src: opelLogoColor, alt: "Opel" },
    peugeot: { type: "image", src: peugeotLogoColor, alt: "Peugeot" },
    porsche: { type: "image", src: porscheLogoColor, alt: "Porsche" },
    ram: { type: "image", src: ramLogoColor, alt: "RAM" },
    renault: { type: "image", src: renaultLogoColor, alt: "Renault" },
    "rolls-royce": { type: "image", src: rollsRoyceLogoColor, alt: "Rolls-Royce" },
    rover: { type: "image", src: roverLogoColor, alt: "Rover" },
    saab: { type: "image", src: saabLogoColor, alt: "Saab" },
    seat: { type: "image", src: seatLogoColor, alt: "Seat" },
    skoda: { type: "image", src: skodaLogoColor, alt: "Skoda" },
    smart: { type: "image", src: smartLogoColor, alt: "Smart" },
    ssangyong: { type: "image", src: ssangyongLogoColor, alt: "SsangYong" },
    subaru: { type: "image", src: subaruLogoColor, alt: "Subaru" },
    suzuki: { type: "image", src: suzukiLogoColor, alt: "Suzuki" },
    tesla: { type: "image", src: teslaLogoColor, alt: "Tesla" },
    toyota: { type: "image", src: toyotaLogoColor, alt: "Toyota" },
    uaz: { type: "image", src: uazLogoColor, alt: "UAZ" },
    volkswagen: { type: "image", src: volkswagenLogoColor, alt: "Volkswagen" },
    volvo: { type: "image", src: volvoLogoColor, alt: "Volvo" },
    tatra: { type: "image", src: tatraLogoColor, alt: "Tatra" },
    man: { type: "image", src: manLogoColor, alt: "MAN" },
    iveco: { type: "image", src: ivecoLogoColor, alt: "Iveco" },
    avia: { type: "image", src: aviaLogoColor, alt: "Avia" },
    daf: { type: "image", src: dafLogoColor, alt: "DAF" },
    scania: { type: "image", src: scaniaLogoColor, alt: "Scania" },
    liaz: { type: "image", src: liazLogoColor, alt: "Liaz" },
    praga: { type: "image", src: pragaLogoColor, alt: "Praga" },
    ifa: { type: "image", src: ifaLogoColor, alt: "IFA" },
    agm: { type: "image", src: agmLogoColor, alt: "AGM" },
    aro: { type: "image", src: aroLogoColor, alt: "ARO" },
    fuso: { type: "image", src: fusoLogoColor, alt: "Fuso" },
    "mercedes-benz": { type: "image", src: mercedesLogoColor, alt: "Mercedes-Benz" },
    jawa: { type: "image", src: jawaLogoColor, alt: "Jawa" },
    yamaha: { type: "image", src: yamahaLogoColor, alt: "Yamaha" },
    "harley-davidson": { type: "image", src: harleyDavidsonLogoColor, alt: "Harley-Davidson" },
    kawasaki: { type: "image", src: kawasakiLogoColor, alt: "Kawasaki" },
    ktm: { type: "image", src: ktmLogoColor, alt: "KTM" },
    triumph: { type: "image", src: triumphLogoColor, alt: "Triumph" },
    ducati: { type: "image", src: ducatiLogoColor, alt: "Ducati" },
    aprilia: { type: "image", src: apriliaLogoColor, alt: "Aprilia" },
    piaggio: { type: "image", src: piaggioLogoColor, alt: "Piaggio" },
    kymco: { type: "image", src: kymcoLogoColor, alt: "Kymco" },
    access: { type: "image", src: accessLogoColor, alt: "Access" },
    adams: { type: "image", src: adamsLogoColor, alt: "Adams" },
    aeon: { type: "image", src: aeonLogoColor, alt: "Aeon" },
    bedna: { type: "image", src: bednaLogoColor, alt: "Bedna" },
    mbp: { type: "image", src: mbpLogoColor, alt: "MBP" },
    brixton: { type: "image", src: brixtonLogoColor, alt: "Brixton" },
    yuki: { type: "image", src: yukiLogoColor, alt: "Yuki" },
  };

  const equipmentOptions = [
    { value: "heatedSeats", label: t("filters.heatedSeats") },
    { value: "electricWindows", label: t("filters.electricWindows") },
    { value: "leatherInterior", label: t("filters.leatherInterior") },
    { value: "climateControl", label: t("filters.climateControl") },
    { value: "cruiseControl", label: t("filters.cruiseControl") },
    { value: "parkingSensors", label: t("filters.parkingSensors") },
    { value: "rearCamera", label: t("filters.rearCamera") },
    { value: "navigationSystem", label: t("filters.navigationSystem") },
    { value: "bluetooth", label: t("filters.bluetooth") },
    { value: "keylessEntry", label: t("filters.keylessEntry") },
    { value: "ledHeadlights", label: t("filters.ledHeadlights") },
    { value: "sunroof", label: t("filters.sunroof") },
    { value: "alloyWheels", label: t("filters.alloyWheels") },
    { value: "ventilatedSeats", label: t("filters.ventilatedSeats") },
    { value: "memorySeats", label: t("filters.memorySeats") },
    { value: "massageSeats", label: t("filters.massageSeats") },
    { value: "adaptiveCruise", label: t("filters.adaptiveCruise") },
    { value: "laneKeeping", label: t("filters.laneKeeping") },
    { value: "blindSpot", label: t("filters.blindSpot") },
    { value: "rainSensor", label: t("filters.rainSensor") },
    { value: "lightSensor", label: t("filters.lightSensor") },
    { value: "heatedSteeringWheel", label: t("filters.heatedSteeringWheel") },
    { value: "panoramicRoof", label: t("filters.panoramicRoof") },
    { value: "electricSeats", label: t("filters.electricSeats") },
    { value: "parkingAssist", label: t("filters.parkingAssist") },
    { value: "headUpDisplay", label: t("filters.headUpDisplay") },
    { value: "wirelessCharging", label: t("filters.wirelessCharging") },
    { value: "towHitch", label: t("filters.towHitch") },
  ];

  const extrasOptions = [
    { value: "vinCheck", label: t("filters.vinCheck") },
    { value: "serviceBook", label: t("filters.serviceBook") },
    { value: "notDamaged", label: t("filters.notDamaged") },
    { value: "notPainted", label: t("filters.notPainted") },
    { value: "warranty", label: t("filters.warranty") },
    { value: "exchange", label: t("filters.exchange") },
  ];

  const bodyTypes = localizedOptions.getBodyTypes();
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
  };

  const form = useForm<InsertListing>({
    resolver: zodResolver(insertListingSchema),
    defaultValues: {
      userId: user?.id || "",
      title: "",
      description: "",
      price: "0",
      brand: "",
      model: "",
      year: new Date().getFullYear(),
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
      photos: undefined,
    },
  });

  const selectedBrand = form.watch("brand");
  const selectedVehicleType = form.watch("vehicleType");
  const isTopListing = form.watch("isTopListing");
  const isImported = form.watch("isImported");
  const availableModels = selectedBrand ? getModelsForVehicleType(selectedBrand, selectedVehicleType ?? undefined) : [];

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
      setLocation(`/listing/${newListing.id}`);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: t("listing.error") || "Chyba",
        description: error.message || "Nepodařilo se vytvořit inzerát.",
      });
    },
  });

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
    
    return missingFields;
  };

  const handleSubmitClick = async () => {
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
      return;
    }
    
    form.handleSubmit(onSubmit)();
  };

  const onSubmit = async (data: InsertListing) => {
    if (!user?.id) {
      toast({
        variant: "destructive",
        title: t("auth.loginRequired"),
        description: t("auth.loginRequiredDescription"),
      });
      return;
    }
    
    if (photos.length === 0) {
      toast({
        variant: "destructive",
        title: language === 'uk' ? "Потрібне фото" : "Foto je povinné",
        description: language === 'uk' ? "Додайте щонайменше 1 фото автомобіля" : "Přidejte alespoň 1 fotografii vozidla",
      });
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
        toast({
          variant: "destructive",
          title: t("payment.error") || "Chyba platby",
          description: error.message || "Nepodařilo se vytvořit platební relaci.",
        });
      }
    } else {
      createListingMutation.mutate({ 
        ...data, 
        userId: user.id,
        photos: photos.length > 0 ? photos : undefined,
        video: video || undefined,
      });
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
        <main className="flex-1 flex items-center justify-center">
          <div className="text-lg">{t("common.redirecting") || "Přesměrování..."}</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8 sm:py-12 lg:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <Card className="rounded-xl sm:rounded-2xl shadow-xl">
            <CardHeader className="pb-6 sm:pb-8">
              <CardTitle className="text-2xl sm:text-3xl font-semibold tracking-tight" data-testid="text-page-title">
                {t("listing.addTitle")}
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                {t("listing.basicInfo")}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Form {...form}>
                <form onSubmit={(e) => { e.preventDefault(); handleSubmitClick(); }} className="space-y-6 sm:space-y-8">
                  <div className="space-y-4">
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
                          <FormLabel>{t("listing.price")}</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder={t("listing.pricePlaceholder")}
                              data-testid="input-price"
                              {...field}
                            />
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
                    <h3 className="text-lg font-medium">{t("tips.photosTitle")}</h3>
                    <CarPhotoUploader 
                      photos={photos}
                      onPhotosChange={setPhotos}
                      maxPhotos={30}
                    />
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">{t("video.title")}</h3>
                    <VideoUploader 
                      video={video}
                      onVideoChange={setVideo}
                      maxDurationSeconds={300}
                    />
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">{t("listing.vehicleDetails")}</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                      variant={isSelected ? "default" : "outline"}
                                      className={`h-auto py-3 px-4 flex flex-col items-center gap-2 text-center ${isSelected ? 'toggle-elevated' : ''} toggle-elevate`}
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

                      <FormField
                        control={form.control}
                        name="bodyType"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>{t("listing.vehicleType")} / {t("filters.bodyType")}</FormLabel>
                            <FormControl>
                              <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-6 gap-2">
                                {/* Osobní auta */}
                                {(() => {
                                  const isSelected = form.watch("vehicleType") === "osobni-auta";
                                  return (
                                    <Button
                                      type="button"
                                      variant={isSelected ? "default" : "outline"}
                                      className={`h-auto py-3 px-2 flex flex-col items-center gap-1 text-center ${!isSelected ? 'text-black dark:text-white' : ''} ${isSelected ? 'toggle-elevated ring-2 ring-[#B8860B]/50' : ''} toggle-elevate`}
                                      onClick={() => {
                                        if (isSelected) {
                                          form.setValue("vehicleType", "" as any);
                                          field.onChange(undefined);
                                        } else {
                                          form.setValue("vehicleType", "osobni-auta");
                                          field.onChange(undefined);
                                        }
                                      }}
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
                                      variant={isSelected ? "default" : "outline"}
                                      className={`h-auto py-3 px-2 flex flex-col items-center gap-1 text-center ${!isSelected ? 'text-black dark:text-white' : ''} ${isSelected ? 'toggle-elevated ring-2 ring-[#B8860B]/50' : ''} toggle-elevate`}
                                      onClick={() => {
                                        if (isSelected) {
                                          form.setValue("vehicleType", "" as any);
                                          field.onChange(undefined);
                                        } else {
                                          form.setValue("vehicleType", "dodavky");
                                          field.onChange(undefined);
                                        }
                                      }}
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
                                      variant={isSelected ? "default" : "outline"}
                                      className={`h-auto py-3 px-2 flex flex-col items-center gap-1 text-center ${!isSelected ? 'text-black dark:text-white' : ''} ${isSelected ? 'toggle-elevated ring-2 ring-[#B8860B]/50' : ''} toggle-elevate`}
                                      onClick={() => {
                                        if (isSelected) {
                                          form.setValue("vehicleType", "" as any);
                                          field.onChange(undefined);
                                        } else {
                                          form.setValue("vehicleType", "nakladni-vozy");
                                          field.onChange(undefined);
                                        }
                                      }}
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
                                      variant={isSelected ? "default" : "outline"}
                                      className={`h-auto py-3 px-2 flex flex-col items-center gap-1 text-center ${!isSelected ? 'text-black dark:text-white' : ''} ${isSelected ? 'toggle-elevated ring-2 ring-[#B8860B]/50' : ''} toggle-elevate`}
                                      onClick={() => {
                                        if (isSelected) {
                                          form.setValue("vehicleType", "" as any);
                                          field.onChange(undefined);
                                        } else {
                                          form.setValue("vehicleType", "motorky");
                                          field.onChange(undefined);
                                        }
                                      }}
                                      data-testid="button-vehicle-motorky"
                                    >
                                      <MotorcycleIcon className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0" />
                                      <span className="text-[10px] sm:text-xs font-medium leading-tight">{t("hero.motorky")}</span>
                                    </Button>
                                  );
                                })()}
                                {bodyTypes.map((type) => {
                                  const IconComponent = bodyTypeIcons[type.value] || Car;
                                  const isSelected = field.value === type.value;
                                  return (
                                    <Button
                                      key={type.value}
                                      type="button"
                                      variant={isSelected ? "default" : "outline"}
                                      className={`h-auto py-3 px-2 flex flex-col items-center gap-1 text-center ${!isSelected ? 'text-black dark:text-white' : ''} ${isSelected ? 'toggle-elevated' : ''} toggle-elevate`}
                                      onClick={() => {
                                        if (isSelected) {
                                          field.onChange(undefined);
                                          form.setValue("vehicleType", "" as any);
                                        } else {
                                          form.setValue("vehicleType", "osobni-auta");
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
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

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
                                    icon: brandIcons[brand.value]
                                  }))}
                                value={field.value}
                                onValueChange={(value) => {
                                  field.onChange(value);
                                  form.setValue("model", "");
                                }}
                                placeholder={t("hero.allBrands")}
                                emptyMessage={t("hero.noBrandsFound") || "Značka nenalezena"}
                                className="w-full h-10"
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
                                onValueChange={field.onChange}
                                disabled={!selectedBrand}
                                placeholder={selectedBrand ? t("hero.allModels") : t("hero.selectBrand")}
                                emptyMessage={t("hero.noModelsFound") || "Model nenalezen"}
                                className="w-full h-10"
                                testId="select-model"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

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
                                        className="h-10 text-black dark:text-white pr-8 cursor-pointer"
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
                                  variant={yearCustom ? "default" : "outline"}
                                  className={`w-full h-auto py-2 px-3 text-xs ${!yearCustom ? 'text-black dark:text-white' : ''} ${yearCustom ? 'toggle-elevated' : ''} toggle-elevate`}
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
                                    className="h-10 text-black dark:text-white"
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
                            <FormLabel>{t("listing.mileage")}</FormLabel>
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
                                        className="h-10 text-black dark:text-white pr-8 cursor-pointer"
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
                                  variant={mileageCustom ? "default" : "outline"}
                                  className={`w-full h-auto py-2 px-3 text-xs ${!mileageCustom ? 'text-black dark:text-white' : ''} ${mileageCustom ? 'toggle-elevated' : ''} toggle-elevate`}
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
                                    className="h-10 text-black dark:text-white"
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
                                  { label: t("hero.hybrid"), key: "hybrid" },
                                  { label: t("hero.electric"), key: "electric" },
                                  { label: t("hero.lpg"), key: "lpg" },
                                  { label: t("hero.cng"), key: "cng" }
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
                                        className="h-10 text-black dark:text-white pr-8 cursor-pointer"
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
                                  variant={engineCustom ? "default" : "outline"}
                                  className={`w-full h-auto py-2 px-3 text-xs ${!engineCustom ? 'text-black dark:text-white' : ''} ${engineCustom ? 'toggle-elevated' : ''} toggle-elevate`}
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
                                    className="h-10 text-black dark:text-white"
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
                                        className="h-10 text-black dark:text-white pr-8 cursor-pointer"
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
                                  variant={powerCustom ? "default" : "outline"}
                                  className={`w-full h-auto py-2 px-3 text-xs ${!powerCustom ? 'text-black dark:text-white' : ''} ${powerCustom ? 'toggle-elevated' : ''} toggle-elevate`}
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
                                    className="h-10 text-black dark:text-white"
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
                                <div className="grid grid-cols-2 gap-2">
                                  {[
                                    { key: '3' as const, label: t("filters.doors3") },
                                    { key: '5' as const, label: t("filters.doors5") },
                                    { key: 'custom' as const, label: t("filters.doorsCustom") }
                                  ].map((option) => {
                                    const isSelected = doorsFilterType === option.key;
                                    return (
                                      <Button
                                        key={option.key}
                                        type="button"
                                        variant={isSelected ? "default" : "outline"}
                                        className={`h-auto py-3 px-4 ${!isSelected ? 'text-black dark:text-white' : ''} ${option.key === 'custom' ? 'col-span-2' : ''} ${isSelected ? 'toggle-elevated' : ''} toggle-elevate`}
                                        onClick={() => {
                                          if (doorsFilterType === option.key) {
                                            setDoorsFilterType('');
                                            return;
                                          }
                                          setDoorsFilterType(option.key);
                                          if (option.key !== 'custom') {
                                            field.onChange(parseInt(option.key));
                                          }
                                        }}
                                        data-testid={`button-doors-${option.key}`}
                                      >
                                        {option.label}
                                      </Button>
                                    );
                                  })}
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
                                <div className="grid grid-cols-2 gap-2">
                                  {[
                                    { key: '5' as const, label: t("filters.seats5") },
                                    { key: '7' as const, label: t("filters.seats7") },
                                    { key: 'custom' as const, label: t("filters.seatsCustom") }
                                  ].map((option) => {
                                    const isSelected = seatsFilterType === option.key;
                                    return (
                                      <Button
                                        key={option.key}
                                        type="button"
                                        variant={isSelected ? "default" : "outline"}
                                        className={`h-auto py-3 px-4 ${!isSelected ? 'text-black dark:text-white' : ''} ${option.key === 'custom' ? 'col-span-2' : ''} ${isSelected ? 'toggle-elevated' : ''} toggle-elevate`}
                                        onClick={() => {
                                          if (seatsFilterType === option.key) {
                                            setSeatsFilterType('');
                                            return;
                                          }
                                          setSeatsFilterType(option.key);
                                          if (option.key === '5') {
                                            field.onChange(5);
                                          } else if (option.key === '7') {
                                            field.onChange(7);
                                          }
                                        }}
                                        data-testid={`button-seats-${option.key}`}
                                      >
                                        {option.label}
                                      </Button>
                                    );
                                  })}
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
                                        className="h-10 text-black dark:text-white pr-8 cursor-pointer"
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
                                  variant={ownersCustom ? "default" : "outline"}
                                  className={`w-full h-auto py-2 px-3 text-xs ${!ownersCustom ? 'text-black dark:text-white' : ''} ${ownersCustom ? 'toggle-elevated' : ''} toggle-elevate`}
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
                                    className="h-10 text-black dark:text-white"
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
                                      variant={isSelected ? "default" : "outline"}
                                      className={`h-auto py-3 px-4 ${isSelected ? 'toggle-elevated' : ''} toggle-elevate text-black dark:text-white`}
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

                      <FormField
                        control={form.control}
                        name="region"
                        render={({ field }) => {
                          const filteredRegions = regions.filter(region => 
                            region.label.toLowerCase().includes(regionSearch.toLowerCase()) ||
                            region.value.toLowerCase().includes(regionSearch.toLowerCase())
                          );
                          const selectedRegion = regions.find(r => r.value === field.value);
                          
                          return (
                            <FormItem>
                              <FormLabel>{t("listing.region")}</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    placeholder={t("filters.allRegions")}
                                    value={regionSearch || (selectedRegion?.label || '')}
                                    onChange={(e) => {
                                      setRegionSearch(e.target.value);
                                      setShowRegionSuggestions(true);
                                      if (!e.target.value) {
                                        field.onChange('');
                                      }
                                    }}
                                    onFocus={() => setShowRegionSuggestions(true)}
                                    onBlur={() => setTimeout(() => setShowRegionSuggestions(false), 200)}
                                    data-testid="input-region"
                                  />
                                  {showRegionSuggestions && filteredRegions.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-xl shadow-lg z-50 overflow-hidden max-h-60 overflow-y-auto">
                                      {filteredRegions.map((region) => (
                                        <button
                                          key={region.value}
                                          type="button"
                                          className={`w-full px-4 py-3 text-left hover:bg-accent flex items-center gap-3 border-b last:border-b-0 ${field.value === region.value ? 'bg-accent' : ''}`}
                                          onMouseDown={(e) => {
                                            e.preventDefault();
                                            field.onChange(region.value);
                                            setRegionSearch('');
                                            setShowRegionSuggestions(false);
                                          }}
                                          data-testid={`region-option-${region.value}`}
                                        >
                                          <MapPin className="w-4 h-4 text-[#B8860B]" />
                                          <span className="text-black dark:text-white font-medium">{region.label}</span>
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </FormControl>
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
                                placeholder={t("listing.phonePlaceholder")}
                                {...field}
                                value={field.value || ""}
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
                          <FormItem>
                            <FormLabel>{t("listing.vin")}</FormLabel>
                            <FormControl>
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
                                }}
                                maxLength={17}
                                className="uppercase"
                                data-testid="input-vin"
                              />
                            </FormControl>
                            <FormDescription>{t("listing.vinHint")}</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
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

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">{t("listing.equipment")}</h3>
                    <FormField
                      control={form.control}
                      name="equipment"
                      render={() => (
                        <FormItem>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {equipmentOptions.map((option) => (
                              <FormField
                                key={option.value}
                                control={form.control}
                                name="equipment"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={option.value}
                                      className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(option.value)}
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
                                      <FormLabel className="text-sm font-normal">
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
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">{t("listing.extras")}</h3>
                    <FormField
                      control={form.control}
                      name="extras"
                      render={() => (
                        <FormItem>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {extrasOptions.map((option) => (
                              <FormField
                                key={option.value}
                                control={form.control}
                                name="extras"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={option.value}
                                      className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(option.value)}
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
                                      <FormLabel className="text-sm font-normal">
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
                  </div>

                  <FormField
                    control={form.control}
                    name="isTopListing"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value === true}
                            onCheckedChange={(checked) => field.onChange(checked === true)}
                            data-testid="checkbox-top-listing"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            {t("listing.topListing")}
                          </FormLabel>
                          <FormDescription>
                            {t("listing.topListingDesc")}
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full sm:w-auto"
                      onClick={() => setLocation("/listings")}
                      data-testid="button-cancel"
                    >
                      {t("listing.cancel")}
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createListingMutation.isPending || isProcessingCheckout}
                      className="w-full sm:flex-1"
                      data-testid="button-submit"
                    >
                      {createListingMutation.isPending || isProcessingCheckout
                        ? t("listing.submitting") || "Odesílání..."
                        : isTopListing
                        ? t("listing.submitWithPayment")
                        : t("listing.submit")}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />

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
