import {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
  lazy,
  Suspense,
  Fragment,
} from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/lib/translations";
import type { Listing } from "@shared/schema";

const EditListingDialog = lazy(() => import("@/components/EditListingDialog"));
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient, parseApiError } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "@/lib/navigation";
import { useDealerUnreadNotifier } from "@/hooks/useDealerUnreadNotifier";
import { displayViews } from "@/lib/displayStats";
import { buildListingPath } from "@/lib/listingUrl";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LoginModal from "@/components/LoginModal";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  BarChart3,
  Building2,
  Upload,
  Eye,
  EyeOff,
  Phone,
  MessageCircle,
  Inbox,
  TrendingUp,
  TrendingDown,
  Car,
  FileSpreadsheet,
  Plus,
  Check,
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  Settings,
  ArrowUpRight,
  Pencil,
  Trash2,
  Rocket,
  Crown,
  Star,
  Zap,
  Sparkles,
  Wallet,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Timer,
  Pause,
  CircleDot,
  Loader2,
  MoreHorizontal,
  Search,
  Filter,
  Download,
  Copy,
  RotateCcw,
  HelpCircle,
  MousePointerClick,
  Home,
  ArrowLeft,
  Bell,
  BellRing,
  AlertTriangle,
  CalendarDays,
  Award,
  Gauge,
  Percent,
  Image as ImageIcon,
  MapPin,
  CreditCard,
  Link2,
  Lock,
  Mail,
  ExternalLink,
  Smartphone,
  Bot,
  Wand2,
  Users,
  LogOut,
  MonitorSmartphone,
  Volume2,
  Save,
  QrCode,
  Landmark,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";

type DealerStats = {
  totalListings: number;
  activeListings: number;
  totalViews: number;
  totalContacts: number;
  totalWhatsapp: number;
  conversionRate: string;
  last30Days: { views: number; contacts: number; whatsapp: number };
  perListing: Array<{
    listing_id: string;
    title: string;
    brand: string;
    model: string;
    price: string;
    photo: string | null;
    views: number;
    contacts: number;
    whatsapp: number;
  }>;
};

type Dealer = {
  id: string;
  ownerId?: string;
  companyName: string;
  ico?: string;
  dic?: string;
  description?: string;
  logoUrl?: string;
  website?: string;
  phone?: string;
  email?: string;
  address?: string;
  region?: string;
  isVerified: boolean;
  maxListings: number;
};

type ProfileTask = {
  key: string;
  done: boolean;
  label: string;
};

type DealerTab =
  | "dashboard"
  | "mylistings"
  | "topovani"
  | "promotion"
  | "import"
  | "integrace"
  | "leady"
  | "settings"
  | "reviews"
  | "microsite"
  | "billing";
type DealerProfileSubTab = "info" | "web" | "account";
type SettingsTarget =
  | "companyName"
  | "description"
  | "phone"
  | "email"
  | "website"
  | "address"
  | "region"
  | "branding"
  | "workingHours"
  | "socialLinks"
  | "verification"
  | "integrations";
type SettingsModal =
  | "branding"
  | "workingHours"
  | "socialLinks"
  | "billing"
  | "notifications"
  | "integrations"
  | "security"
  | "autoreplies";
type AddVehiclePreference = "single" | "bulk";
type DealerAddressDetails = {
  country: string;
  city: string;
  street: string;
  houseNumber: string;
  postalCode: string;
  showroomName: string;
  lat?: string;
  lon?: string;
  displayName?: string;
};

type AddressSuggestion = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    road?: string;
    pedestrian?: string;
    house_number?: string;
    postcode?: string;
    country?: string;
  };
};

type PhotonFeature = {
  geometry?: { coordinates?: [number, number] };
  properties?: {
    name?: string;
    street?: string;
    housenumber?: string;
    postcode?: string;
    city?: string;
    country?: string;
    state?: string;
  };
};

type DealerLocalSettings = {
  coverUrl: string;
  addressDetails: DealerAddressDetails;
  workingHours: Record<
    "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun",
    { closed: boolean; open: string; close: string }
  >;
  socialLinks: {
    website: string;
    facebook: string;
    instagram: string;
    tiktok: string;
    youtube: string;
  };
  notifications: {
    email: boolean;
    whatsapp: boolean;
    telegram: boolean;
    newLead: boolean;
    messages: boolean;
    invoices: boolean;
    promotions: boolean;
    sound: boolean;
  };
  integrations: {
    useSamePhone: boolean;
    countryCode: string;
    sharedPhone: string;
    whatsappPhone: string;
    telegramPhone: string;
    whatsappConnected: boolean;
    telegramConnected: boolean;
    crmConnected: boolean;
  };
  autoReplies: {
    enabled: boolean;
    delayMinutes: number;
    whatsapp: boolean;
    telegram: boolean;
    templates: Array<{ id: string; title: string; message: string }>;
  };
  security: {
    twoFactorPlanned: boolean;
    sessions: Array<{ id: string; device: string; location: string; lastActive: string; current?: boolean }>;
  };
  microsite: {
    heroPhoto: string;
    aboutTitle: string;
    aboutText: string;
    slug: string;
    showAbout: boolean;
    showInventory: boolean;
    showReviews: boolean;
    customDomainEnabled: boolean;
    customDomain: string;
  };
  reviews: {
    enabled: boolean;
    autoPublish: boolean;
    averageRating: number;
    totalCount: number;
    list: Array<{
      id: string;
      author: string;
      rating: number;
      text: string;
      dateISO: string;
      response?: string;
      hidden?: boolean;
    }>;
  };
  billing: {
    plan: "free" | "top" | "vip";
    autoRenew: boolean;
    walletKc: number;
    autoTopUpEnabled: boolean;
    autoTopUpAmount: number;
    paymentBrand: string;
    paymentLast4: string;
    paymentExpires: string;
    paymentType?: "card" | "bank" | "qr" | "applepay" | "googlepay" | "paypal";
    paymentIban?: string;
    paymentHolder?: string;
    paymentEmail?: string;
    invoices: Array<{
      id: string;
      number: string;
      dateISO: string;
      amountKc: number;
      status: "paid" | "pending" | "failed";
      description: string;
    }>;
    activePackage: {
      id: string;
      activatedISO: string;
      expiresISO: string;
    } | null;
  };
};

type DashboardInsight = {
  icon: any;
  title: string;
  description: string;
  tone: string;
  actionLabel?: string;
  onClick?: () => void;
};

const premiumSurface =
  "border border-amber-100/70 bg-white/90 shadow-[0_18px_55px_rgba(120,72,12,0.08)] backdrop-blur-sm";

const premiumHover =
  "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_70px_rgba(120,72,12,0.12)]";

const dayKeys = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

const normalizeUrl = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};

const isValidUrl = (value: string) => {
  if (!value.trim()) return true;
  try {
    const parsed = new URL(normalizeUrl(value));
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
};

const composeDealerAddress = (address: DealerAddressDetails) =>
  [
    address.showroomName,
    [address.street, address.houseNumber].filter(Boolean).join(" "),
    [address.postalCode, address.city].filter(Boolean).join(" "),
    address.country,
  ]
    .filter(Boolean)
    .join(", ");

const suggestionToAddressDetails = (suggestion: AddressSuggestion): DealerAddressDetails => {
  const address = suggestion.address || {};
  return {
    country: address.country || "Česko",
    city: address.city || address.town || address.village || address.municipality || "",
    street: address.road || address.pedestrian || "",
    houseNumber: address.house_number || "",
    postalCode: address.postcode || "",
    showroomName: "",
    lat: suggestion.lat,
    lon: suggestion.lon,
    displayName: suggestion.display_name,
  };
};

const photonFeatureToSuggestion = (feature: PhotonFeature, index: number): AddressSuggestion => {
  const props = feature.properties || {};
  const [lon, lat] = feature.geometry?.coordinates || [0, 0];
  const display = [
    props.name,
    [props.street, props.housenumber].filter(Boolean).join(" "),
    [props.postcode, props.city].filter(Boolean).join(" "),
    props.country,
  ].filter(Boolean).join(", ");
  return {
    place_id: index,
    display_name: display,
    lat: String(lat),
    lon: String(lon),
    address: {
      city: props.city,
      road: props.street || props.name,
      house_number: props.housenumber,
      postcode: props.postcode,
      country: props.country || "Česko",
    },
  };
};

const fallbackCzechAddressSuggestions: AddressSuggestion[] = [
  {
    place_id: 9001,
    display_name: "Václavské náměstí 1, 110 00 Praha 1, Česko",
    lat: "50.0810",
    lon: "14.4280",
    address: {
      city: "Praha",
      road: "Václavské náměstí",
      house_number: "1",
      postcode: "110 00",
      country: "Česko",
    },
  },
  {
    place_id: 9002,
    display_name: "Masarykova 1, 602 00 Brno, Česko",
    lat: "49.1949",
    lon: "16.6083",
    address: {
      city: "Brno",
      road: "Masarykova",
      house_number: "1",
      postcode: "602 00",
      country: "Česko",
    },
  },
  {
    place_id: 9003,
    display_name: "Nádražní 1, 702 00 Ostrava, Česko",
    lat: "49.8346",
    lon: "18.2925",
    address: {
      city: "Ostrava",
      road: "Nádražní",
      house_number: "1",
      postcode: "702 00",
      country: "Česko",
    },
  },
];

const formatWorkingHoursShort = (
  hours: DealerLocalSettings["workingHours"],
  t: (key: string) => string,
) => {
  const openDays = dayKeys.filter((day) => !hours[day].closed);
  if (openDays.length === 0) return t("dealer.hours.closedAllWeek");
  if (openDays.length === 7) return t("dealer.hours.nonstop");
  const first = openDays[0];
  const last = openDays[openDays.length - 1];
  const consecutive = openDays.every((day, index) => dayKeys.indexOf(day) === dayKeys.indexOf(first) + index);
  if (consecutive && first && last && first !== last) {
    return `${t(`dealer.hours.short.${first}`)}–${t(`dealer.hours.short.${last}`)}`;
  }
  return openDays.map((day) => t(`dealer.hours.short.${day}`)).join(", ");
};

const getTodayWorkingHours = (
  hours: DealerLocalSettings["workingHours"],
  t: (key: string) => string,
) => {
  const jsDay = new Date().getDay();
  const today = dayKeys[jsDay === 0 ? 6 : jsDay - 1];
  const value = hours[today];
  if (value.closed) return t("dealer.hours.todayClosed");
  return t("dealer.hours.todayOpenUntil").replace("{{time}}", value.close);
};

const createDefaultDealerLocalSettings = (dealer?: Dealer): DealerLocalSettings => ({
  coverUrl: "",
  addressDetails: {
    country: "Česko",
    city: dealer?.region || "",
    street: "",
    houseNumber: "",
    postalCode: "",
    showroomName: "",
    displayName: dealer?.address || "",
  },
  workingHours: {
    mon: { closed: false, open: "09:00", close: "18:00" },
    tue: { closed: false, open: "09:00", close: "18:00" },
    wed: { closed: false, open: "09:00", close: "18:00" },
    thu: { closed: false, open: "09:00", close: "18:00" },
    fri: { closed: false, open: "09:00", close: "18:00" },
    sat: { closed: true, open: "09:00", close: "13:00" },
    sun: { closed: true, open: "09:00", close: "13:00" },
  },
  socialLinks: {
    website: dealer?.website || "",
    facebook: "",
    instagram: "",
    tiktok: "",
    youtube: "",
  },
  notifications: {
    email: true,
    whatsapp: true,
    telegram: false,
    newLead: true,
    messages: true,
    invoices: true,
    promotions: true,
    sound: false,
  },
  integrations: {
    useSamePhone: true,
    countryCode: "+420",
    sharedPhone: dealer?.phone || "",
    whatsappPhone: dealer?.phone || "",
    telegramPhone: dealer?.phone || "",
    whatsappConnected: false,
    telegramConnected: false,
    crmConnected: false,
  },
  autoReplies: {
    enabled: false,
    delayMinutes: 15,
    whatsapp: false,
    telegram: false,
    templates: [
      {
        id: "availability",
        title: "Dostupnost vozu",
        message: "Dobrý den, děkujeme za zprávu. Vůz je stále dostupný. Rádi vám pošleme další informace.",
      },
    ],
  },
  security: {
    twoFactorPlanned: false,
    sessions: [
      { id: "current", device: "Safari / macOS", location: "Praha, CZ", lastActive: "Právě teď", current: true },
      { id: "mobile", device: "iPhone Safari", location: "Česká republika", lastActive: "Včera" },
    ],
  },
  microsite: {
    heroPhoto: "",
    aboutTitle: "",
    aboutText: "",
    slug: dealer?.id ? dealer.id.slice(0, 8) : "",
    showAbout: true,
    showInventory: true,
    showReviews: true,
    customDomainEnabled: false,
    customDomain: "",
  },
  reviews: {
    enabled: true,
    autoPublish: false,
    averageRating: 4.9,
    totalCount: 0,
    list: [],
  },
  billing: {
    plan: "top",
    autoRenew: true,
    walletKc: 0,
    autoTopUpEnabled: false,
    autoTopUpAmount: 1000,
    paymentBrand: "",
    paymentLast4: "",
    paymentExpires: "",
    invoices: [],
    activePackage: null,
  },
});

function getProfileTasks(dealer: Dealer, t: (key: string) => string): ProfileTask[] {
  return [
    { key: "phone", done: !!dealer.phone, label: t("dealer.premium.taskPhone") },
    { key: "logo", done: !!dealer.logoUrl, label: t("dealer.premium.taskLogo") },
    { key: "address", done: !!dealer.address, label: t("dealer.premium.taskAddress") },
    { key: "description", done: !!dealer.description, label: t("dealer.premium.taskDescription") },
    { key: "verified", done: dealer.isVerified, label: t("dealer.premium.taskVerification") },
  ];
}

function getProfileCompletion(dealer: Dealer, t: (key: string) => string) {
  const tasks = getProfileTasks(dealer, t);
  const done = tasks.filter((task) => task.done).length;
  return {
    tasks,
    percent: Math.round((done / tasks.length) * 100),
    missing: tasks.filter((task) => !task.done),
  };
}

function getListingQuality(
  listing: DealerListing,
  dealer?: Dealer,
  t?: (key: string) => string,
) {
  const checks = [
    { done: !!listing.photos?.length, weight: 20, label: t?.("dealer.premium.qualityPhotos") || "photos" },
    { done: !!listing.description, weight: 15, label: t?.("dealer.premium.qualityDescription") || "description" },
    { done: !!listing.video, weight: 10, label: t?.("dealer.premium.qualityVideo") || "video" },
    { done: !!listing.vin, weight: 10, label: t?.("dealer.premium.qualityVin") || "VIN" },
    { done: !!listing.title && Number(listing.price) > 0, weight: 15, label: t?.("dealer.premium.qualityBasics") || "basics" },
    { done: !!listing.region && listing.mileage != null, weight: 15, label: t?.("dealer.premium.qualitySpecs") || "specs" },
    { done: !!dealer?.isVerified, weight: 15, label: t?.("dealer.premium.qualityVerifiedDealer") || "verified dealer" },
  ];
  const score = checks.reduce((sum, check) => sum + (check.done ? check.weight : 0), 0);
  return {
    percent: Math.min(100, score),
    missing: checks.filter((check) => !check.done).map((check) => check.label),
    checks,
  };
}

function MiniTrendChart({
  values,
  tone = "amber",
}: {
  values: number[];
  tone?: "amber" | "emerald" | "blue";
}) {
  const max = Math.max(1, ...values);
  const color =
    tone === "emerald"
      ? "from-emerald-300 to-emerald-600"
      : tone === "blue"
        ? "from-blue-300 to-blue-600"
        : "from-amber-300 to-amber-700";

  return (
    <div className="flex h-28 items-end gap-1.5">
      {values.map((value, index) => (
        <div
          key={`${value}-${index}`}
          className={`min-h-3 flex-1 rounded-t-lg bg-gradient-to-t ${color} opacity-90 transition-all duration-300`}
          style={{ height: `${Math.max(10, (value / max) * 100)}%` }}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

function DealerLoadingSkeleton() {
  return (
    <div className="space-y-5">
      <div className="rounded-3xl border bg-card p-5 shadow-sm">
        <div className="flex gap-4">
          <Skeleton className="h-16 w-16 rounded-2xl" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-full" />
          </div>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <Skeleton key={item} className="h-28 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-72 rounded-3xl" />
    </div>
  );
}

type BulkImportJob = {
  id: string;
  status: string;
  totalRows: number;
  processedRows: number;
  successRows: number;
  failedRows: number;
  errors: Array<{ row: number; error: string }> | null;
  fileName: string;
  createdAt: string;
};

function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  detail,
  className,
  onClick,
}: {
  icon: any;
  label: string;
  value: string | number;
  trend?: string;
  detail?: string;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <Card
      className={`${premiumSurface} ${premiumHover} overflow-hidden rounded-2xl ${className || ""} ${
        onClick ? "cursor-pointer hover:border-amber-300" : ""
      }`}
      onClick={onClick}
    >
      <CardContent className="relative p-4 sm:p-5">
        <div className="absolute -right-7 -top-7 h-20 w-20 rounded-full bg-amber-100/60 blur-2xl" />
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="truncate text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              {label}
            </p>
            <p className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
              {value}
            </p>
            {trend && (
              <p className="mt-2 flex items-center text-xs font-medium text-emerald-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                {trend}
              </p>
            )}
            {detail && (
              <p className="mt-1 truncate text-xs text-muted-foreground">{detail}</p>
            )}
          </div>
          <div className="relative h-12 w-12 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center shadow-inner">
            <Icon className="h-6 w-6 text-amber-700" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DealerHero({
  dealer,
  stats,
  t,
  onOpenMessages,
  onProfileTask,
  onAddVehicle,
  onOpenImport,
  onOpenBilling,
}: {
  dealer: Dealer;
  stats: DealerStats;
  t: (key: string) => string;
  onOpenMessages: () => void;
  onProfileTask: (target: SettingsTarget) => void;
  onAddVehicle: () => void;
  onOpenImport: (sub: ImportSyncSubTab) => void;
  onOpenBilling: () => void;
}) {
  const visibleInventoryCount = Math.max(
    stats.activeListings,
    stats.perListing.length,
    stats.totalListings,
  );
  const initials = dealer.companyName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  const [heroSettings] = useDealerLocalStore(dealer);
  const activePackageId =
    heroSettings.billing.activePackage &&
    new Date(heroSettings.billing.activePackage.expiresISO).getTime() > Date.now()
      ? heroSettings.billing.activePackage.id
      : null;
  const packageNameKey: Record<string, string> = {
    start: "dealer.billing.packageStart",
    business: "dealer.billing.packageBusiness",
    pro: "dealer.billing.packagePro",
  };
  const activePlanLabel = activePackageId
    ? t(packageNameKey[activePackageId] ?? "dealer.billing.planFree")
    : t("dealer.billing.planFree");

  const stat = (
    label: string,
    value: React.ReactNode,
    onClick?: () => void,
  ) => {
    const Element = onClick ? "button" : "div";
    return (
      <Element
        type={onClick ? "button" : undefined}
        onClick={onClick}
        className={`flex min-w-0 flex-col items-start rounded-xl bg-white/55 px-2.5 py-1.5 text-left ring-1 ring-amber-200/70 ${
          onClick ? "transition hover:bg-white/75" : ""
        }`}
      >
        <span className="text-base font-black leading-none text-[#4b2d08] sm:text-lg">{value}</span>
        <span className="mt-0.5 truncate text-[9px] font-semibold uppercase tracking-wide text-[#8a641f]">
          {label}
        </span>
      </Element>
    );
  };

  return (
    <section className="relative overflow-hidden rounded-3xl border border-amber-200/70 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.22),transparent_36%),linear-gradient(135deg,#fff8e8_0%,#f8e8bd_52%,#d59d3f_100%)] px-3 py-3 text-[#4b2d08] shadow-[0_14px_38px_rgba(120,72,12,0.12)] sm:px-4">
      <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-white/60 blur-3xl" />

      <div className="relative flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 gap-2.5">
          <button
            type="button"
            className="group relative h-10 w-10 shrink-0 overflow-hidden rounded-2xl border border-white/70 bg-white/65 text-left shadow-sm transition hover:scale-[1.03] hover:border-amber-300 sm:h-12 sm:w-12"
            onClick={() => onProfileTask("branding")}
            aria-label={t("dealer.premium.editLogo")}
          >
            {dealer.logoUrl ? (
              <img
                src={dealer.logoUrl}
                alt={dealer.companyName}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm font-black tracking-tight sm:text-base">
                {initials || "NN"}
              </div>
            )}
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 flex-wrap items-center gap-1.5">
              <h1 className="truncate text-base font-black tracking-tight sm:text-xl">
                {dealer.companyName}
              </h1>
              <button
                type="button"
                onClick={onOpenBilling}
                className="inline-flex h-5 items-center rounded-md border border-amber-200 bg-white/70 px-1.5 text-[10px] font-bold text-[#7a5518] transition hover:bg-white/90"
              >
                <Crown className="mr-1 h-3 w-3 text-amber-700" />
                {activePlanLabel}
              </button>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
              {stat(
                t("dealer.activeListings"),
                <>
                  {visibleInventoryCount}
                  <span className="ml-0.5 text-[10px] font-semibold text-[#8a641f]/70">
                    /{dealer.maxListings}
                  </span>
                </>,
              )}
              {stat(t("dealer.views"), displayViews(stats.totalViews))}
              {stat(t("dealer.contacts"), stats.totalContacts, onOpenMessages)}
              {stat(t("dealer.billing.currentPlanShort"), activePlanLabel, onOpenBilling)}
            </div>
          </div>
        </div>

        <div className="shrink-0">
          <Button
            className="h-11 w-full rounded-2xl bg-[#6f4c17] px-5 font-black text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[#5c3b10] lg:hidden"
            onClick={onAddVehicle}
          >
            <Plus className="mr-2 h-4 w-4" />
            {t("dealer.dashboard.addCar")}
          </Button>
          <Button
            className="hidden h-12 rounded-2xl bg-[#6f4c17] px-5 font-black text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[#5c3b10] lg:inline-flex"
            onClick={() => onOpenImport("csv")}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            {t("dealer.nav.importSync")}
          </Button>
        </div>
      </div>
    </section>
  );
}

function DashboardProfileCompletion({
  dealer,
  t,
  onProfileTask,
}: {
  dealer: Dealer;
  t: (key: string) => string;
  onProfileTask: (target: SettingsTarget) => void;
}) {
  const completion = getProfileCompletion(dealer, t);
  const targets: Record<string, SettingsTarget> = {
    phone: "phone",
    logo: "branding",
    verified: "verification",
  };
  const tasks = completion.tasks.filter((task) =>
    ["phone", "logo", "verified"].includes(task.key),
  );

  return (
    <Card className="rounded-3xl border-amber-100 bg-white/80 shadow-[0_10px_30px_rgba(120,72,12,0.06)]">
      <CardContent className="p-2.5 sm:p-3">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="inline-flex items-center gap-1.5 text-sm font-black text-[#5c3b10]">
                  <Shield className="h-3.5 w-3.5 text-amber-700" />
                  {t("dealer.premium.profileCompleteness")}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {t("dealer.dashboard.profileMotivation")}
                </p>
              </div>
              <span className="shrink-0 text-lg font-black text-[#6f4c17]">
                {completion.percent}%
              </span>
            </div>
            <Progress value={completion.percent} className="mt-1.5 h-1.5 bg-amber-100" />
            <div className="mt-1.5 grid gap-1.5 sm:grid-cols-3">
              {tasks.map((task) => (
                <button
                  type="button"
                  key={task.key}
                  onClick={() => onProfileTask(targets[task.key] || "companyName")}
                  className={`flex items-center gap-1.5 rounded-xl px-2 py-1.5 text-left text-[11px] font-bold transition active:scale-[0.99] ${
                    task.done
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-[#6f4c17] hover:bg-amber-100"
                  }`}
                >
                  {task.done ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                  ) : (
                    <Plus className="h-4 w-4 shrink-0" />
                  )}
                  <span className="truncate">{task.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DashboardAttentionPanel({
  items,
  t,
}: {
  items: Array<{ id: string; label: string; onClick: () => void }>;
  t: (key: string) => string;
}) {
  if (items.length === 0) return null;

  return (
    <Card className="rounded-3xl border-amber-200 bg-amber-50/80 shadow-[0_10px_30px_rgba(120,72,12,0.06)]">
      <CardContent className="p-3">
        <div className="mb-2 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-700" />
          <p className="text-sm font-black text-[#5c3b10]">
            {t("dealer.dashboard.requiresAttention")}
          </p>
        </div>
        <div className="grid gap-1.5 sm:grid-cols-2">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={item.onClick}
              className="flex items-center justify-between gap-2 rounded-2xl bg-white/80 px-3 py-2 text-left text-sm font-bold text-[#6f4c17] transition hover:bg-white active:scale-[0.99]"
            >
              <span className="min-w-0 truncate">{item.label}</span>
              <ChevronRight className="h-4 w-4 shrink-0 text-amber-700" />
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function DashboardListingStatusBadge({
  status,
  t,
}: {
  status: "active" | "pending" | "needsWork" | "inactive" | "sold";
  t: (key: string) => string;
}) {
  const config = {
    active: {
      label: t("dealer.dashboard.statusActive"),
      className: "bg-emerald-100 text-emerald-700",
    },
    pending: {
      label: t("dealer.dashboard.statusPending"),
      className: "bg-yellow-100 text-yellow-800",
    },
    needsWork: {
      label: t("dealer.dashboard.statusNeedsWork"),
      className: "bg-orange-100 text-orange-800",
    },
    inactive: {
      label: t("dealer.dashboard.statusInactive"),
      className: "bg-red-100 text-red-700",
    },
    sold: {
      label: t("dealer.dashboard.statusSold"),
      className: "bg-stone-200 text-stone-700",
    },
  }[status];

  return <Badge className={`shrink-0 rounded-full text-[10px] ${config.className}`}>{config.label}</Badge>;
}

function DashboardTab({
  stats,
  dealer,
  t,
  onOpenTab,
  onFocusSettings,
  onAddVehicle,
}: {
  stats: DealerStats;
  dealer: Dealer;
  t: (key: string) => string;
  onOpenTab: (tab: DealerTab) => void;
  onFocusSettings: (target: SettingsTarget) => void;
  onAddVehicle: () => void;
}) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "all">("30d");
  const [dismissedNotifications, setDismissedNotifications] = useState<Set<string>>(new Set());
  const [showStats, setShowStats] = useState(false);
  const [analyticsDialog, setAnalyticsDialog] = useState<{
    title: string;
    value: string;
    description: string;
    icon: any;
  } | null>(null);

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/listings/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dealer/stats"] });
      toast({ title: t("dealer.listingDeleted") });
      setDeleteId(null);
    },
    onError: () => {
      toast({ title: "Error", variant: "destructive" });
    },
  });

  const handleEdit = useCallback(async (listingId: string) => {
    try {
      const res = await apiRequest("GET", `/api/listings/${listingId}`);
      const data = await res.json();
      setEditingListing(data);
      setEditDialogOpen(true);
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  }, [toast]);

  const rangeMultiplier = timeRange === "7d" ? 0.42 : timeRange === "90d" ? 2.4 : timeRange === "all" ? 3.1 : 1;
  const rangeViews = Math.round(stats.last30Days.views * rangeMultiplier);
  const rangeContacts = Math.round(stats.last30Days.contacts * rangeMultiplier);
  const rangeWhatsapp = Math.round(stats.last30Days.whatsapp * rangeMultiplier);
  const callCtr = rangeViews > 0 ? ((rangeContacts / rangeViews) * 100).toFixed(1) : "0.0";
  const whatsappCtr = rangeViews > 0 ? ((rangeWhatsapp / rangeViews) * 100).toFixed(1) : "0.0";
  const savedAdsEstimate = Math.max(0, Math.round(rangeViews * 0.018));

  const chartViews = useMemo(
    () =>
      [0.34, 0.48, 0.42, 0.62, 0.55, 0.78, 1].map((ratio) =>
        Math.max(1, Math.round((rangeViews / 7) * ratio)),
      ),
    [rangeViews],
  );
  const chartContacts = useMemo(
    () =>
      [0.28, 0.36, 0.44, 0.5, 0.62, 0.7, 1].map((ratio) =>
        Math.max(0, Math.round((rangeContacts / 7) * ratio)),
      ),
    [rangeContacts],
  );
  const soldEstimate = Math.max(0, stats.totalListings - stats.activeListings);
  const bestListing = [...stats.perListing].sort(
    (a, b) => b.views + b.contacts * 12 + b.whatsapp * 10 - (a.views + a.contacts * 12 + a.whatsapp * 10),
  )[0];
  const insights: DashboardInsight[] = [
    {
      icon: ImageIcon,
      title: t("dealer.premium.recommendPhotosTitle"),
      description: t("dealer.premium.recommendPhotosDescription"),
      tone: "bg-blue-50 text-blue-700",
      actionLabel: t("dealer.premium.openInventory"),
      onClick: () => onOpenTab("mylistings"),
    },
    {
      icon: Crown,
      title: t("dealer.premium.recommendVipTitle"),
      description: t("dealer.premium.recommendVipDescription"),
      tone: "bg-amber-50 text-amber-700",
      actionLabel: t("dealer.promo.activateVip"),
      onClick: () => onOpenTab("promotion"),
    },
    {
      icon: Wand2,
      title: t("dealer.premium.recommendAiTitle"),
      description: t("dealer.premium.recommendAiDescription"),
      tone: "bg-violet-50 text-violet-700",
      actionLabel: t("dealer.premium.completeDescription"),
      onClick: () => onFocusSettings("description"),
    },
  ];
  const notifications = [
    {
      id: "promote",
      icon: Rocket,
      title: t("dealer.premium.activityPromoted"),
      meta: t("dealer.premium.activityNow"),
      onClick: () => onOpenTab("promotion"),
      category: t("dealer.promo.tab"),
    },
    {
      id: "views",
      icon: Eye,
      title: t("dealer.premium.activityViewed"),
      meta: t("dealer.premium.activityToday"),
      onClick: () => bestListing && navigate(buildListingPath({ id: bestListing.listing_id, brand: bestListing.brand, model: bestListing.model })),
      category: t("dealer.stats"),
    },
    {
      id: "settings",
      icon: CalendarDays,
      title: t("dealer.premium.activityExpiring"),
      meta: t("dealer.premium.activitySoon"),
      onClick: () => onOpenTab("mylistings"),
      category: t("dealer.myListings"),
    },
  ].filter((item) => !dismissedNotifications.has(item.id));
  const todayViews = Math.round(stats.last30Days.views / 30);
  const profileCompletionPercent = getProfileCompletion(dealer, t).percent;
  const vehicleCount = Math.max(
    stats.activeListings,
    stats.perListing.length,
    stats.totalListings,
  );
  const attentionItems = [
    ...stats.perListing
      .filter((item) => !item.photo)
      .slice(0, 2)
      .map((item) => ({
        id: `photo-${item.listing_id}`,
        label: t("dealer.dashboard.attentionPhotoMissing").replace(
          "{car}",
          `${item.brand} ${item.model}`.trim(),
        ),
        onClick: () =>
          navigate(
            buildListingPath({
              id: item.listing_id,
              brand: item.brand,
              model: item.model,
            }),
          ),
      })),
  ];

  return (
    <div className="space-y-3 sm:space-y-4">
      <DealerInboxBanner t={t} />

      <Card className="rounded-3xl border-amber-100 bg-white/85 shadow-[0_10px_30px_rgba(120,72,12,0.06)]">
        <CardHeader className="pb-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5 text-amber-700" />
                {t("dealer.dashboard.activeCars").replace(
                  "{count}",
                  String(vehicleCount),
                )}
              </CardTitle>
            </div>
            <Button variant="outline" className="rounded-2xl" onClick={() => onOpenTab("mylistings")}>
              {t("dealer.dashboard.manageAllCars")}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {stats.perListing.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {stats.perListing.slice(0, 3).map((item) => (
                <button
                  key={item.listing_id}
                  type="button"
                  className="group flex gap-3 rounded-2xl bg-white/85 p-3 text-left transition hover:-translate-y-0.5 hover:bg-amber-50 active:scale-[0.99]"
                  onClick={() =>
                    navigate(
                      buildListingPath({
                        id: item.listing_id,
                        brand: item.brand,
                        model: item.model,
                      }),
                    )
                  }
                >
                  <div className="h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-muted">
                    {item.photo ? (
                      <img
                        src={`/img/${item.photo}?w=192&h=128&fit=cover`}
                        alt={`${item.brand} ${item.model}`}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Car className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-bold">{item.brand} {item.model}</p>
                      <DashboardListingStatusBadge status="active" t={t} />
                    </div>
                    <p className="truncate text-xs text-muted-foreground">{item.title}</p>
                    <div className="mt-2 flex gap-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1"><Eye className="h-3 w-3" />{displayViews(item.views)}</span>
                      <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" />{item.contacts} {t("dealer.contacts").toLowerCase()}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed p-8 text-center">
              <p className="font-semibold">{t("dealer.dashboard.noInventoryYet")}</p>
              <p className="mt-1 text-sm text-muted-foreground">{t("dealer.dashboard.noInventoryHint")}</p>
              <Button className="mt-4 bg-amber-700 hover:bg-amber-800" onClick={onAddVehicle}>
                <Plus className="mr-2 h-4 w-4" />
                {t("dealer.dashboard.addCar")}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {profileCompletionPercent < 100 ? (
        <DashboardProfileCompletion dealer={dealer} t={t} onProfileTask={onFocusSettings} />
      ) : null}
      <DashboardPeriodCompare stats={stats} todayViews={todayViews} t={t} />
      <DashboardAttentionPanel items={attentionItems} t={t} />

      <div className="flex justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowStats((v) => !v)}
          className="rounded-2xl border-amber-200 text-[#6f4c17]"
          aria-expanded={showStats}
        >
          <BarChart3 className="mr-1.5 h-4 w-4" />
          {showStats ? "Skrýt detailní statistiku" : "Zobrazit detailní statistiku"}
          {showStats ? (
            <ChevronUp className="ml-1.5 h-4 w-4" />
          ) : (
            <ChevronDown className="ml-1.5 h-4 w-4" />
          )}
        </Button>
      </div>

      {showStats ? (
        <div className="space-y-5 animate-in fade-in-0 slide-in-from-top-2 duration-200">
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Car}
          label={t("dealer.totalListings")}
          value={stats.totalListings}
          detail={t("dealer.premium.inventoryReady")}
          onClick={() => onOpenTab("mylistings")}
        />
        <StatCard
          icon={Eye}
          label={t("dealer.totalViews")}
          value={stats.totalViews.toLocaleString()}
          trend={t("dealer.premium.last30DaysTrend")}
          onClick={() =>
            setAnalyticsDialog({
              title: t("dealer.totalViews"),
              value: stats.totalViews.toLocaleString(),
              description: t("dealer.premium.analyticsViewsDetail"),
              icon: Eye,
            })
          }
        />
        <StatCard
          icon={Phone}
          label={t("dealer.totalContacts")}
          value={stats.totalContacts}
          detail={`${stats.totalWhatsapp} ${t("dealer.whatsapp")}`}
          onClick={() =>
            setAnalyticsDialog({
              title: t("dealer.totalContacts"),
              value: String(stats.totalContacts),
              description: t("dealer.premium.analyticsContactsDetail"),
              icon: Phone,
            })
          }
        />
        <StatCard
          icon={TrendingUp}
          label={t("dealer.conversionRate")}
          value={`${stats.conversionRate}%`}
          detail={t("dealer.premium.conversionHint")}
        />
        <StatCard
          icon={MessageCircle}
          label={t("dealer.whatsapp")}
          value={stats.totalWhatsapp}
          className="lg:col-span-1"
        />
        <StatCard
          icon={CheckCircle2}
          label={t("dealer.activeListings")}
          value={stats.activeListings}
        />
        <StatCard
          icon={Award}
          label={t("dealer.premium.soldCars")}
          value={soldEstimate}
        />
        <StatCard
          icon={Star}
          label={t("dealer.premium.favorites")}
          value={savedAdsEstimate}
          detail={t("dealer.premium.estimatedSavedAds")}
          onClick={() =>
            setAnalyticsDialog({
              title: t("dealer.premium.favorites"),
              value: String(savedAdsEstimate),
              description: t("dealer.premium.analyticsFavoritesDetail"),
              icon: Star,
            })
          }
        />
        <StatCard
          icon={Phone}
          label={t("dealer.premium.callCtr")}
          value={`${callCtr}%`}
          detail={t("dealer.premium.clickThroughRate")}
          onClick={() =>
            setAnalyticsDialog({
              title: t("dealer.premium.callCtr"),
              value: `${callCtr}%`,
              description: t("dealer.premium.analyticsCallCtrDetail"),
              icon: Phone,
            })
          }
        />
        <StatCard
          icon={MessageCircle}
          label={t("dealer.premium.whatsappCtr")}
          value={`${whatsappCtr}%`}
          detail={t("dealer.premium.clickThroughRate")}
          onClick={() =>
            setAnalyticsDialog({
              title: t("dealer.premium.whatsappCtr"),
              value: `${whatsappCtr}%`,
              description: t("dealer.premium.analyticsWhatsappCtrDetail"),
              icon: MessageCircle,
            })
          }
        />
        <StatCard
          icon={Clock}
          label={t("dealer.premium.avgResponseTime")}
          value="~18 min"
          detail={t("dealer.premium.responseTimeHint")}
          onClick={() =>
            setAnalyticsDialog({
              title: t("dealer.premium.avgResponseTime"),
              value: "~18 min",
              description: t("dealer.premium.analyticsResponseDetail"),
              icon: Clock,
            })
          }
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.9fr)]">
        <Card className={`${premiumSurface} rounded-3xl`}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <BarChart3 className="h-4 w-4 text-amber-700" />
                  {t("dealer.premium.performanceGraph")}
                </CardTitle>
                <CardDescription>{t("dealer.premium.performanceDescription")}</CardDescription>
              </div>
              <div className="flex rounded-full border bg-white p-1">
                {(["7d", "30d", "90d", "all"] as const).map((range) => (
                  <button
                    key={range}
                    type="button"
                    onClick={() => setTimeRange(range)}
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold transition ${
                      timeRange === range
                        ? "bg-amber-700 text-white shadow-sm"
                        : "text-muted-foreground hover:bg-amber-50"
                    }`}
                  >
                    {range === "all" ? t("dealer.premium.rangeAll") : range}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="rounded-2xl bg-amber-50/70 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-amber-900">{t("dealer.views")}</span>
                  <span className="text-sm font-black text-amber-800">
                    {displayViews(rangeViews)}
                  </span>
                </div>
                <MiniTrendChart values={chartViews} tone="amber" />
              </div>
              <div className="rounded-2xl bg-emerald-50/70 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-emerald-900">{t("dealer.contacts")}</span>
                  <span className="text-sm font-black text-emerald-800">
                    {rangeContacts}
                  </span>
                </div>
                <MiniTrendChart values={chartContacts} tone="emerald" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`${premiumSurface} rounded-3xl`}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Crown className="h-4 w-4 text-amber-700" />
              {t("dealer.premium.bestPerformingAd")}
            </CardTitle>
            <CardDescription>{t("dealer.premium.bestPerformingDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            {bestListing ? (
              <div
                className="cursor-pointer rounded-2xl border bg-gradient-to-br from-white to-amber-50/70 p-3 transition hover:border-amber-300"
                onClick={() =>
                  navigate(
                    buildListingPath({
                      id: bestListing.listing_id,
                      brand: bestListing.brand,
                      model: bestListing.model,
                    }),
                  )
                }
              >
                <div className="flex gap-3">
                  <div className="h-20 w-28 overflow-hidden rounded-xl bg-muted">
                    {bestListing.photo ? (
                      <img
                        src={`/img/${bestListing.photo}?w=224&h=160&fit=cover`}
                        alt={`${bestListing.brand} ${bestListing.model}`}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Car className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold">
                      {bestListing.brand} {bestListing.model}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{bestListing.title}</p>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                      <span className="rounded-lg bg-white px-2 py-1 font-semibold">
                        {displayViews(bestListing.views)}
                        <br />
                        <span className="font-normal text-muted-foreground">{t("dealer.views")}</span>
                      </span>
                      <span className="rounded-lg bg-white px-2 py-1 font-semibold">
                        {bestListing.contacts}
                        <br />
                        <span className="font-normal text-muted-foreground">{t("dealer.contacts")}</span>
                      </span>
                      <span className="rounded-lg bg-white px-2 py-1 font-semibold">
                        {bestListing.whatsapp}
                        <br />
                        <span className="font-normal text-muted-foreground">WA</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                {t("dealer.premium.noPerformanceYet")}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className={`${premiumSurface} rounded-3xl lg:col-span-2`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Sparkles className="h-4 w-4 text-amber-700" />
              {t("dealer.premium.recommendations")}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            {insights.map((insight) => {
              const Icon = insight.icon;
              return (
                <button
                  key={insight.title}
                  type="button"
                  onClick={insight.onClick}
                  className="rounded-2xl border bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md"
                >
                  <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${insight.tone}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="font-semibold">{insight.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{insight.description}</p>
                  {insight.actionLabel && (
                    <span className="mt-3 inline-flex items-center text-sm font-semibold text-amber-700">
                      {insight.actionLabel}
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </span>
                  )}
                </button>
              );
            })}
          </CardContent>
        </Card>

        <Card className={`${premiumSurface} rounded-3xl`}>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Bell className="h-4 w-4 text-amber-700" />
                {t("dealer.premium.notifications")}
              </CardTitle>
              {notifications.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => setDismissedNotifications(new Set(["promote", "views", "settings"]))}
                >
                  {t("dealer.premium.markAllRead")}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {notifications.length === 0 ? (
              <div className="rounded-2xl border border-dashed p-5 text-center text-sm text-muted-foreground">
                {t("dealer.premium.noNotifications")}
              </div>
            ) : notifications.map((item) => {
              const ActivityIcon = item.icon;
              return (
                <div key={item.id} className="group flex gap-3 rounded-2xl bg-muted/40 p-3 transition hover:bg-amber-50">
                  <button type="button" className="flex flex-1 gap-3 text-left" onClick={item.onClick}>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-amber-700">
                    <ActivityIcon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                      <Badge variant="secondary" className="rounded-full text-[10px]">{item.category}</Badge>
                    </div>
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.meta}</p>
                  </div>
                  </button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-70 transition group-hover:opacity-100"
                    onClick={() =>
                      setDismissedNotifications((prev) => {
                        const next = new Set(prev);
                        next.add(item.id);
                        return next;
                      })
                    }
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {stats.perListing.length > 0 && (
        <Card className={`${premiumSurface} rounded-3xl`}>
          <CardHeader>
            <CardTitle className="text-base">{t("dealer.perListing")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.perListing.map((item) => (
                <div
                  key={item.listing_id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                  onClick={() =>
                    navigate(
                      buildListingPath({
                        id: item.listing_id,
                        brand: item.brand,
                        model: item.model,
                      }),
                    )
                  }
                >
                  <div className="h-12 w-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                    {item.photo ? (
                      <img
                        src={`/img/${item.photo}?w=128&h=96&fit=cover`}
                        alt={`${item.brand} ${item.model}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Car className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {item.brand} {item.model}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{item.title}</p>
                  </div>
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" /> {displayViews(item.views)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" /> {item.contacts}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" /> {item.whatsapp}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-amber-700 hover:text-amber-900 hover:bg-amber-50"
                      onClick={() => handleEdit(item.listing_id)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => setDeleteId(item.listing_id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
        </div>
      ) : null}

      <Dialog open={!!analyticsDialog} onOpenChange={(open) => !open && setAnalyticsDialog(null)}>
        <DialogContent className="h-[100dvh] max-h-[100dvh] w-screen max-w-none overflow-y-auto rounded-none p-4 sm:h-auto sm:max-h-[90vh] sm:max-w-lg sm:rounded-lg sm:p-6">
          {analyticsDialog && (
            (() => {
              const AnalyticsIcon = analyticsDialog.icon;
              return (
            <>
              <DialogHeader>
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                  <AnalyticsIcon className="h-6 w-6" />
                </div>
                <DialogTitle>{analyticsDialog.title}</DialogTitle>
                <DialogDescription>{analyticsDialog.description}</DialogDescription>
              </DialogHeader>
              <div className="rounded-3xl bg-gradient-to-br from-amber-50 to-white p-5">
                <p className="text-sm text-muted-foreground">{t("dealer.premium.currentValue")}</p>
                <p className="mt-1 text-4xl font-black text-amber-900">{analyticsDialog.value}</p>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {[0.45, 0.62, 1].map((value, index) => (
                    <div key={index} className="rounded-2xl bg-white p-3 text-center">
                      <p className="text-xs text-muted-foreground">{index === 0 ? "7d" : index === 1 ? "30d" : "90d"}</p>
                      <p className="font-black">{Math.max(1, Math.round(Number.parseFloat(analyticsDialog.value) * value) || index + 1)}</p>
                    </div>
                  ))}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAnalyticsDialog(null)}>
                  {t("dealer.cancel")}
                </Button>
                <Button className="bg-amber-700 hover:bg-amber-800" onClick={() => {
                  setAnalyticsDialog(null);
                  onOpenTab("mylistings");
                }}>
                  {t("dealer.premium.openInventory")}
                </Button>
              </DialogFooter>
            </>
              );
            })()
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("dealer.deleteListingTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("dealer.deleteListingDescription")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("dealer.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
            >
              {t("dealer.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {editingListing && (
        <Suspense fallback={null}>
          <EditListingDialog
            open={editDialogOpen}
            onOpenChange={(open: boolean) => {
              setEditDialogOpen(open);
              if (!open) {
                setEditingListing(null);
                queryClient.invalidateQueries({ queryKey: ["/api/dealer/stats"] });
              }
            }}
            listing={editingListing}
          />
        </Suspense>
      )}
    </div>
  );
}

function BulkImportTab({
  t,
  onAddVehicle,
  embedded = false,
}: {
  t: (key: string) => string;
  onAddVehicle: () => void;
  embedded?: boolean;
}) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parsedData, setParsedData] = useState<any[] | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const importMutation = useMutation({
    mutationFn: async (data: { listings: any[]; fileName: string }) => {
      const res = await apiRequest("POST", "/api/dealer/bulk-import", data);
      return res.json();
    },
    onSuccess: (data) => {
      setActiveJobId(data.job.id);
      toast({ title: t("dealer.importProcessing") });
    },
    onError: (err: any) => {
      toast({ title: t("dealer.importFailed"), description: err.message, variant: "destructive" });
    },
  });

  const { data: jobData } = useQuery({
    queryKey: ["/api/dealer/bulk-import", activeJobId],
    queryFn: async () => {
      if (!activeJobId) return null;
      const res = await apiRequest("GET", `/api/dealer/bulk-import/${activeJobId}`);
      return res.json();
    },
    enabled: !!activeJobId,
    refetchInterval: activeJobId ? 2000 : false,
  });

  useEffect(() => {
    if (jobData?.job?.status === "completed") {
      queryClient.invalidateQueries({ queryKey: ["/api/dealer/stats"] });
    }
  }, [jobData?.job?.status]);

  const parseCsv = useCallback((text: string): any[] => {
    const lines = text.trim().split("\n");
    if (lines.length < 2) return [];
    const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
    return lines.slice(1).map((line) => {
      const values = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
      const obj: Record<string, any> = {};
      headers.forEach((h, i) => {
        const val = values[i] || "";
        if (["fuelType", "transmission", "driveType", "equipment", "extras"].includes(h)) {
          obj[h] = val ? val.split(";").map((s: string) => s.trim()) : [];
        } else if (["year", "mileage", "power", "doors", "seats", "owners", "airbags"].includes(h)) {
          obj[h] = val ? parseInt(val, 10) : undefined;
        } else if (["hasServiceBook", "vatDeductible", "isImported"].includes(h)) {
          obj[h] = val === "true" || val === "1";
        } else {
          obj[h] = val || undefined;
        }
      });
      return obj;
    });
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setFileName(file.name);
      setUploadProgress(15);
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        const data = parseCsv(text);
        setUploadProgress(100);
        setParsedData(data);
      };
      reader.readAsText(file);
    },
    [parseCsv],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer.files?.[0];
      if (!file || !file.name.endsWith(".csv")) return;
      setFileName(file.name);
      setUploadProgress(15);
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        const data = parseCsv(text);
        setUploadProgress(100);
        setParsedData(data);
      };
      reader.readAsText(file);
    },
    [parseCsv],
  );

  const activeJob = jobData?.job as BulkImportJob | undefined;
  const jobProgress = activeJob
    ? Math.round((activeJob.processedRows / Math.max(activeJob.totalRows, 1)) * 100)
    : 0;
  const validation = useMemo(() => {
    const rows = parsedData || [];
    const required = ["title", "brand", "model", "year", "price"];
    const errors = rows.flatMap((row, index) =>
      required
        .filter((field) => !row[field])
        .map((field) => ({ row: index + 2, field })),
    );
    const seen = new Set<string>();
    const duplicates = rows.filter((row) => {
      const key = `${row.brand || ""}-${row.model || ""}-${row.year || ""}-${row.price || ""}`.toLowerCase();
      if (!key.replace(/-/g, "")) return false;
      if (seen.has(key)) return true;
      seen.add(key);
      return false;
    }).length;

    return {
      errors,
      duplicates,
      validRows: Math.max(0, rows.length - errors.length),
    };
  }, [parsedData]);

  const downloadTemplate = useCallback(() => {
    const csv = `title,brand,model,year,mileage,price,fuelType,transmission,bodyType,color,driveType,engineVolume,power,condition,vehicleType,region,phone,description
"Škoda Octavia 2.0 TDI","Škoda","Octavia",2021,45000,"450000","diesel","automatic","sedan","white","fwd","2.0",150,"used","osobni-auta","Praha","775123456","Popis vozidla..."`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "nnauto-import-template.csv";
    link.click();
    URL.revokeObjectURL(url);
  }, []);

  return (
    <div className={embedded ? "" : "space-y-5 sm:space-y-6"}>
      <Card className={`${premiumSurface} rounded-3xl`}>
        <CardHeader className="p-4 pb-2 sm:p-6 sm:pb-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <FileSpreadsheet className="h-5 w-5 text-amber-700" />
                {t("dealer.importSync.csvTitle")}
              </CardTitle>
              <CardDescription>{t("dealer.importSync.csvSubtitle")}</CardDescription>
            </div>
            <Button variant="outline" className="w-full gap-2 sm:w-auto" onClick={downloadTemplate}>
              <Download className="h-4 w-4" />
              {t("dealer.premium.downloadTemplate")}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-4 pt-0 sm:space-y-5 sm:p-6 sm:pt-0">
          <div className="grid gap-2 sm:grid-cols-4">
            {[
              [1, t("dealer.premium.importStepUpload")],
              [2, t("dealer.premium.importStepValidate")],
              [3, t("dealer.premium.importStepPreview")],
              [4, t("dealer.premium.importStepFinish")],
            ].map(([step, label]) => (
              <div
                key={String(step)}
                className={`rounded-2xl border p-3 text-sm ${
                  parsedData || Number(step) === 1
                    ? "border-amber-200 bg-amber-50/70 text-amber-900"
                    : "bg-muted/40 text-muted-foreground"
                }`}
              >
                <span className="mb-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-black">
                  {String(step)}
                </span>
                {String(label)}
              </div>
            ))}
          </div>

          <div
            id="dealer-bulk-import-upload"
            className={`group border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-colors ${
              dragActive
                ? "border-amber-500 bg-amber-50 shadow-inner"
                : "hover:border-amber-400 hover:bg-amber-50/50"
            }`}
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragEnter={() => setDragActive(true)}
            onDragLeave={() => setDragActive(false)}
            onDragOver={(e) => e.preventDefault()}
          >
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 transition group-hover:scale-105">
              <FileSpreadsheet className="h-7 w-7" />
            </div>
            <p className="font-semibold">{t("dealer.importDragDrop")}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t("dealer.premium.importHelper")}</p>
            {fileName && (
              <p className="mt-2 text-sm font-medium text-amber-700">{fileName}</p>
            )}
            {uploadProgress > 0 && (
              <div className="mx-auto mt-4 max-w-md">
                <Progress value={uploadProgress} className="h-2" />
                <p className="mt-1 text-xs text-muted-foreground">
                  {uploadProgress === 100 ? t("dealer.premium.uploadSuccess") : t("dealer.premium.uploading")}
                </p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {parsedData && (
            <div className="space-y-4 rounded-3xl border bg-white p-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">{t("dealer.importTotal")}</p>
                  <p className="text-2xl font-black">{parsedData.length}</p>
                </div>
                <div className="rounded-2xl bg-emerald-50 p-3">
                  <p className="text-xs text-emerald-700">{t("dealer.premium.validRows")}</p>
                  <p className="text-2xl font-black text-emerald-700">{validation.validRows}</p>
                </div>
                <div className="rounded-2xl bg-red-50 p-3">
                  <p className="text-xs text-red-700">{t("dealer.premium.rowsWithIssues")}</p>
                  <p className="text-2xl font-black text-red-700">{validation.errors.length}</p>
                </div>
              </div>

              {validation.duplicates > 0 && (
                <div className="flex gap-2 rounded-2xl bg-amber-50 p-3 text-sm text-amber-800">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  {t("dealer.premium.duplicatesFound").replace("{{count}}", String(validation.duplicates))}
                </div>
              )}

              <div className="overflow-hidden rounded-2xl border">
                <div className="border-b bg-muted/40 px-3 py-2 text-sm font-semibold">
                  {t("dealer.premium.importPreview")}
                </div>
                <div className="max-h-56 overflow-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="sticky top-0 bg-white">
                      <tr className="border-b">
                        {["brand", "model", "year", "price", "region"].map((field) => (
                          <th key={field} className="px-3 py-2 font-semibold">
                            {field}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {parsedData.slice(0, 8).map((row, index) => (
                        <tr
                          key={`${row.brand}-${row.model}-${index}`}
                          className={`border-b last:border-0 ${
                            validation.errors.some((error) => error.row === index + 2)
                              ? "bg-red-50 text-red-800"
                              : ""
                          }`}
                        >
                          <td className="px-3 py-2">{row.brand || "—"}</td>
                          <td className="px-3 py-2">{row.model || "—"}</td>
                          <td className="px-3 py-2">{row.year || "—"}</td>
                          <td className="px-3 py-2">{row.price || "—"}</td>
                          <td className="px-3 py-2">{row.region || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm text-muted-foreground">
                  {t("dealer.premium.validationReady")}
                </span>
                <Button
                  onClick={() =>
                    importMutation.mutate({ listings: parsedData, fileName })
                  }
                  disabled={importMutation.isPending || parsedData.length === 0}
                  className="bg-amber-700 hover:bg-amber-800"
                >
                  {importMutation.isPending
                    ? t("dealer.importProcessing")
                    : t("dealer.importStartImport")}
                </Button>
              </div>
            </div>
          )}

          {activeJob && (
            <Card className={activeJob.status === "completed" ? "border-emerald-200 bg-emerald-50/50" : ""}>
              <CardContent className="pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span>{activeJob.status === "completed" ? "✓" : "⏳"} {activeJob.fileName}</span>
                  <span>{activeJob.processedRows}/{activeJob.totalRows}</span>
                </div>
                <Progress value={jobProgress} className="h-2" />
                <div className="flex gap-4 text-sm">
                  <span className="flex items-center gap-1 text-emerald-600">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {activeJob.successRows} {t("dealer.importSuccess")}
                  </span>
                  {activeJob.failedRows > 0 && (
                    <span className="flex items-center gap-1 text-red-600">
                      <XCircle className="h-3.5 w-3.5" />
                      {activeJob.failedRows} {t("dealer.importFailed")}
                    </span>
                  )}
                </div>
                {activeJob.errors && activeJob.errors.length > 0 && (
                  <div className="mt-2 max-h-40 overflow-y-auto text-xs space-y-1">
                    {activeJob.errors.map((err, i) => (
                      <div key={i} className="p-2 bg-red-50 rounded text-red-700">
                        Row {err.row}: {err.error}
                      </div>
                    ))}
                  </div>
                )}
                {activeJob.status === "completed" && (
                  <div className="rounded-2xl bg-white p-3 text-sm text-emerald-700">
                    <CheckCircle2 className="mr-2 inline h-4 w-4" />
                    {t("dealer.premium.importCompletedSummary")
                      .replace("{{success}}", String(activeJob.successRows))
                      .replace("{{failed}}", String(activeJob.failedRows))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card className="bg-muted/50">
            <CardContent className="pt-4">
              <p className="text-sm font-medium mb-2">{t("dealer.importCsvFormat")}:</p>
              <code className="block text-xs bg-background p-3 rounded-md overflow-x-auto whitespace-pre">
{`title,brand,model,year,mileage,price,fuelType,transmission,bodyType,color,driveType,engineVolume,power,condition,vehicleType,region,phone,description
"Škoda Octavia 2.0 TDI","Škoda","Octavia",2021,45000,"450000","diesel","automatic","sedan","white","fwd","2.0",150,"used","osobni-auta","Praha","775123456","Popis..."`}
              </code>
            </CardContent>
          </Card>

          <div className="text-center pt-2">
            <p className="text-sm text-muted-foreground mb-3">{t("dealer.addManually")}</p>
            <Button variant="outline" onClick={onAddVehicle}>
                <Plus className="h-4 w-4 mr-2" />
                {t("header.addListing")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── My Listings Tab ───────────────────────────────────────────────────────────

type DealerListing = {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  price: string;
  photos: string[] | null;
  is_top_listing: boolean;
  top_listing_expires_at: string | null;
  is_sold: boolean;
  created_at: string;
  views: number;
  contacts: number;
  whatsapp: number;
  mileage?: number;
  region?: string;
  description?: string | null;
  video?: string | null;
  vin?: string | null;
};

function getListingStatus(l: DealerListing): "sold" | "top" | "reserve" | "active" {
  if (l.is_sold) return "sold";
  if (l.is_top_listing) return "top";
  return "active";
}

function getTimeSince(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return "dnes";
  if (days === 1) return "1 den";
  if (days < 5) return `${days} dny`;
  return `${days} dní`;
}

const STATUS_CONFIG = {
  active: { label: "Aktivní", color: "bg-emerald-100 text-emerald-700", icon: CircleDot },
  top: { label: "TOP", color: "bg-amber-100 text-amber-700", icon: Crown },
  sold: { label: "Prodáno", color: "bg-red-100 text-red-700", icon: Check },
  reserve: { label: "Rezervace", color: "bg-blue-100 text-blue-700", icon: Pause },
};

function MyListingsTab({
  t,
  dealer,
  onOpenTab,
  onAddVehicle,
}: {
  t: (key: string) => string;
  dealer: Dealer;
  onOpenTab: (tab: DealerTab) => void;
  onAddVehicle: () => void;
}) {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [inventorySearch, setInventorySearch] = useState("");
  const [sortMode, setSortMode] = useState("newest");
  const [editingListing, setEditingListing] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [bulkSoldDialogOpen, setBulkSoldDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [singleDeleteId, setSingleDeleteId] = useState<string | null>(null);
  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [priceConfirmOpen, setPriceConfirmOpen] = useState(false);
  const [priceMode, setPriceMode] = useState<
    "set" | "increase_percent" | "decrease_percent"
  >("set");
  const [priceValueStr, setPriceValueStr] = useState("");
  const [pendingPricePayload, setPendingPricePayload] = useState<{
    mode: "set" | "increase_percent" | "decrease_percent";
    value: number;
  } | null>(null);

  useEffect(() => {
    setSelectedIds(new Set());
  }, [statusFilter]);

  const { data, isLoading } = useQuery({
    queryKey: ["/api/dealer/listings"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/dealer/listings");
      return res.json();
    },
  });

  const toggleSoldMutation = useMutation({
    mutationFn: async ({ id, isSold }: { id: string; isSold: boolean }) => {
      await apiRequest("PUT", `/api/listings/${id}`, { isSold });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dealer/listings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dealer/stats"] });
    },
  });

  const removeTopMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("PATCH", `/api/listings/${id}/promote`, { isTopListing: false });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dealer/listings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dealer/stats"] });
      toast({ title: t("dealer.listings.topRemoved") });
    },
  });

  const handleEdit = useCallback(async (id: string) => {
    try {
      const res = await apiRequest("GET", `/api/listings/${id}`);
      const listing = await res.json();
      setEditingListing(listing);
      setEditDialogOpen(true);
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  }, [toast]);

  const allListings = (data?.listings || []) as DealerListing[];

  const filteredListings = useMemo(() => {
    const query = inventorySearch.trim().toLowerCase();
    const filtered = allListings.filter((listing) => {
      const status = getListingStatus(listing);
      const matchesStatus =
        statusFilter === "all" ||
        status === statusFilter ||
        (statusFilter === "promoted" && status === "top") ||
        (statusFilter === "expired" && false) ||
        (statusFilter === "pending" && false);
      const matchesSearch =
        !query ||
        `${listing.brand} ${listing.model} ${listing.title} ${listing.region || ""}`
          .toLowerCase()
          .includes(query);
      return matchesStatus && matchesSearch;
    });

    return [...filtered].sort((a, b) => {
      if (sortMode === "oldest") {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      if (sortMode === "most_viewed") return b.views - a.views;
      if (sortMode === "cheapest") return Number(a.price) - Number(b.price);
      if (sortMode === "most_contacts") {
        return b.contacts + b.whatsapp - (a.contacts + a.whatsapp);
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [allListings, inventorySearch, sortMode, statusFilter]);

  const visibleIds = useMemo(
    () => filteredListings.map((l) => l.id),
    [filteredListings],
  );

  const selectedOnPageCount = useMemo(
    () => visibleIds.filter((id) => selectedIds.has(id)).length,
    [visibleIds, selectedIds],
  );

  const allVisibleSelected =
    visibleIds.length > 0 && selectedOnPageCount === visibleIds.length;
  const someVisibleSelected =
    selectedOnPageCount > 0 && !allVisibleSelected;

  const toggleId = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSelectAllVisible = useCallback(
    (take: boolean) => {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (take) {
          visibleIds.forEach((id) => next.add(id));
        } else {
          visibleIds.forEach((id) => next.delete(id));
        }
        return next;
      });
    },
    [visibleIds],
  );

  const exportSelected = useCallback(() => {
    const selected = filteredListings.filter((listing) => selectedIds.has(listing.id));
    if (selected.length === 0) {
      toast({ title: t("dealer.promo.selectListingsFirst") });
      return;
    }
    const csv = [
      ["brand", "model", "year", "price", "views", "contacts", "whatsapp", "region"].join(","),
      ...selected.map((listing) =>
        [
          listing.brand,
          listing.model,
          listing.year,
          listing.price,
          listing.views,
          listing.contacts,
          listing.whatsapp,
          listing.region || "",
        ]
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(","),
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "nnauto-dealer-export.csv";
    link.click();
    URL.revokeObjectURL(url);
    toast({ title: t("dealer.premium.exportReady") });
  }, [filteredListings, selectedIds, t, toast]);

  const bulkMutation = useMutation({
    mutationFn: async (vars: {
      action: "mark_sold" | "delete" | "price_update";
      payload?: {
        mode: "set" | "increase_percent" | "decrease_percent";
        value: number;
      };
    }) => {
      const ids = filteredListings
        .filter((l) => selectedIds.has(l.id))
        .map((l) => l.id);
      if (ids.length === 0) {
        throw new Error("no listings selected");
      }
      const res = await apiRequest("POST", "/api/dealer/listings/bulk", {
        ids,
        action: vars.action,
        payload: vars.payload,
      });
      return (await res.json()) as {
        success: boolean;
        updated: number;
        skipped: number;
      };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/dealer/listings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dealer/stats"] });
      setSelectedIds(new Set());
      setBulkSoldDialogOpen(false);
      setBulkDeleteDialogOpen(false);
      setPriceModalOpen(false);
      setPriceConfirmOpen(false);
      setPendingPricePayload(null);
      const msg =
        data.skipped > 0
          ? t("dealer.listings.bulkPartial")
              .replace("{{updated}}", String(data.updated))
              .replace("{{skipped}}", String(data.skipped))
          : t("dealer.listings.bulkSuccess").replace(
              "{{updated}}",
              String(data.updated),
            );
      toast({ title: msg });
    },
    onError: () => {
      toast({
        title: t("dealer.listings.bulkError"),
        variant: "destructive",
      });
    },
  });

  const singleDeleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("POST", "/api/dealer/listings/bulk", {
        ids: [id],
        action: "delete",
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dealer/listings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dealer/stats"] });
      setSingleDeleteId(null);
      toast({ title: t("dealer.listingDeleted") });
    },
    onError: () => {
      toast({
        title: t("dealer.listings.bulkError"),
        variant: "destructive",
      });
    },
  });

  const statusCounts = {
    all: allListings.length,
    active: allListings.filter((l) => getListingStatus(l) === "active").length,
    top: allListings.filter((l) => getListingStatus(l) === "top").length,
    sold: allListings.filter((l) => getListingStatus(l) === "sold").length,
    promoted: allListings.filter((l) => getListingStatus(l) === "top").length,
    pending: 0,
    expired: 0,
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-12 rounded-2xl" />
        {[0, 1, 2].map((item) => (
          <Skeleton key={item} className="h-32 rounded-3xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24 sm:pb-0">
      <Card className={`${premiumSurface} rounded-3xl`}>
        <CardContent className="space-y-4 p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-black tracking-tight">{t("dealer.premium.inventoryTitle")}</h2>
              <p className="text-sm text-muted-foreground">{t("dealer.premium.inventorySubtitle")}</p>
            </div>
            <Button className="h-11 gap-2 bg-amber-700 hover:bg-amber-800 lg:hidden" onClick={onAddVehicle}>
              <Plus className="h-4 w-4" />
              {t("header.addListing")}
            </Button>
          </div>

          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={inventorySearch}
                onChange={(e) => setInventorySearch(e.target.value)}
                placeholder={t("dealer.premium.inventorySearchPlaceholder")}
                className="h-11 rounded-2xl pl-9"
              />
            </div>
            <Select value={sortMode} onValueChange={setSortMode}>
              <SelectTrigger className="h-11 rounded-2xl">
                <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">{t("dealer.premium.sortNewest")}</SelectItem>
                <SelectItem value="oldest">{t("dealer.premium.sortOldest")}</SelectItem>
                <SelectItem value="most_viewed">{t("dealer.premium.sortMostViewed")}</SelectItem>
                <SelectItem value="cheapest">{t("dealer.premium.sortCheapest")}</SelectItem>
                <SelectItem value="most_contacts">{t("dealer.premium.sortMostContacts")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {(["all", "active", "top", "sold"] as const).map((s) => (
              <Button
                key={s}
                size="sm"
                variant={statusFilter === s ? "default" : "outline"}
                className={`shrink-0 rounded-full ${
                  statusFilter === s ? "bg-amber-700 hover:bg-amber-800" : "bg-white"
                }`}
                onClick={() => setStatusFilter(s)}
              >
                {s === "all" ? t("dealer.listings.all") : STATUS_CONFIG[s].label}
                <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5">
                  {statusCounts[s]}
                </Badge>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="fixed bottom-24 right-4 z-30 sm:hidden">
        <Button
          size="icon"
          className="h-14 w-14 rounded-full bg-amber-700 shadow-2xl hover:bg-amber-800"
          onClick={onAddVehicle}
          aria-label={t("header.addListing")}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      {filteredListings.length > 0 ? (
        <div className="flex items-center gap-3 px-0.5 py-1">
          <Checkbox
            id="dealer-my-listings-select-all"
            checked={
              allVisibleSelected
                ? true
                : someVisibleSelected
                  ? "indeterminate"
                  : false
            }
            onCheckedChange={(v) => handleSelectAllVisible(v === true)}
            className="h-5 w-5 sm:h-4 sm:w-4"
          />
          <label
            htmlFor="dealer-my-listings-select-all"
            className="text-sm cursor-pointer select-none text-muted-foreground"
          >
            {t("dealer.listings.selectAll")}
          </label>
        </div>
      ) : null}

      {selectedOnPageCount > 0 ? (
        <div className="sticky top-0 z-20 flex flex-col gap-2 rounded-lg border border-amber-200/60 bg-background/95 px-3 py-2 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:flex-row sm:flex-wrap sm:items-center">
          <span className="text-sm font-medium">
            {t("dealer.listings.bulkSelected")}: {selectedOnPageCount}
          </span>

          <div className="hidden flex-wrap gap-2 sm:flex sm:items-center sm:justify-end sm:ml-auto">
            <Button
              size="sm"
              variant="outline"
              className="h-9 touch-manipulation"
              disabled={bulkMutation.isPending}
              onClick={() => setBulkSoldDialogOpen(true)}
            >
              {t("dealer.listings.bulkMarkSold")}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-9 touch-manipulation"
              disabled={bulkMutation.isPending}
              onClick={() => {
                onOpenTab("promotion");
              }}
            >
              {t("dealer.listings.bulkPromote")}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-9 touch-manipulation"
              disabled={bulkMutation.isPending}
              onClick={exportSelected}
            >
              <Download className="mr-1 h-3.5 w-3.5" />
              {t("dealer.premium.exportSelected")}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-9 touch-manipulation"
              disabled={bulkMutation.isPending}
              onClick={() => toast({ title: t("dealer.premium.renewSoon") })}
            >
              <RotateCcw className="mr-1 h-3.5 w-3.5" />
              {t("dealer.premium.renewSelected")}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-9 touch-manipulation"
              disabled={bulkMutation.isPending}
              onClick={() => {
                setPriceValueStr("");
                setPriceMode("set");
                setPriceModalOpen(true);
              }}
            >
              {t("dealer.listings.bulkChangePrice")}
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="h-9 touch-manipulation"
              disabled={bulkMutation.isPending}
              onClick={() => setBulkDeleteDialogOpen(true)}
            >
              {t("dealer.listings.bulkDelete")}
            </Button>
            {bulkMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : null}
          </div>

          <div className="sm:hidden w-full">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 w-full touch-manipulation justify-between"
                  disabled={bulkMutation.isPending}
                >
                  <span className="flex items-center gap-2">
                    <MoreHorizontal className="h-4 w-4" />
                    {t("dealer.listings.bulkActions")}
                  </span>
                  {bulkMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[min(100vw-2rem,280px)]">
                <DropdownMenuItem
                  onSelect={() => setBulkSoldDialogOpen(true)}
                  className="cursor-pointer touch-manipulation py-3"
                >
                  {t("dealer.listings.bulkMarkSold")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => onOpenTab("promotion")}
                  className="cursor-pointer touch-manipulation py-3"
                >
                  {t("dealer.listings.bulkPromote")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={exportSelected}
                  className="cursor-pointer touch-manipulation py-3"
                >
                  {t("dealer.premium.exportSelected")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => toast({ title: t("dealer.premium.renewSoon") })}
                  className="cursor-pointer touch-manipulation py-3"
                >
                  {t("dealer.premium.renewSelected")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => {
                    setPriceValueStr("");
                    setPriceMode("set");
                    setPriceModalOpen(true);
                  }}
                  className="cursor-pointer touch-manipulation py-3"
                >
                  {t("dealer.listings.bulkChangePrice")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => setBulkDeleteDialogOpen(true)}
                  className="cursor-pointer touch-manipulation py-3 text-destructive focus:text-destructive"
                >
                  {t("dealer.listings.bulkDelete")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ) : null}

      {/* Listings */}
      <div className="space-y-2">
        {filteredListings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              {t("dealer.listings.empty")}
            </CardContent>
          </Card>
        ) : (
          filteredListings.map((l) => {
            const status = getListingStatus(l);
            const cfg = STATUS_CONFIG[status];
            const StatusIcon = cfg.icon;
            const photo = l.photos?.[0];
            const isExpanded = expandedId === l.id;
            const totalInteractions = (l.contacts || 0) + (l.whatsapp || 0);
            const conversionRate = l.views > 0 ? ((totalInteractions / l.views) * 100).toFixed(1) : "0.0";
            const viewsBarWidth = Math.min(100, Math.round((l.views / Math.max(1, ...allListings.map(x => x.views))) * 100));
            const quality = getListingQuality(l, dealer, t);

            return (
              <Card key={l.id} className={`${premiumSurface} ${premiumHover} rounded-3xl transition-all ${status === "sold" ? "opacity-70" : ""}`}>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-start gap-2 sm:gap-4">
                    <div
                      className="shrink-0 pt-0.5 sm:pt-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Checkbox
                        checked={selectedIds.has(l.id)}
                        onCheckedChange={() => toggleId(l.id)}
                        className="h-5 w-5 sm:h-4 sm:w-4"
                        aria-label={`select-${l.id}`}
                      />
                    </div>
                    <div
                      className="flex min-w-0 flex-1 cursor-pointer items-center gap-3"
                      onClick={() => setExpandedId(isExpanded ? null : l.id)}
                    >
                    {/* Фото */}
                    <div
                      className="h-20 w-28 sm:h-24 sm:w-36 rounded-2xl overflow-hidden bg-muted flex-shrink-0 relative shadow-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(
                          buildListingPath({
                            id: l.id,
                            brand: l.brand,
                            model: l.model,
                            year: l.year,
                          }),
                        );
                      }}
                    >
                      {photo ? (
                        <img
                          src={`/img/${photo}?w=288&h=192&fit=cover`}
                          alt={`${l.brand} ${l.model}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><Car className="h-5 w-5 text-muted-foreground" /></div>
                      )}
                      {status === "sold" && (
                        <div className="absolute inset-0 bg-white/40 flex items-center justify-center">
                          <span className="text-[10px] font-black text-red-600 tracking-wider">PRODÁNO</span>
                        </div>
                      )}
                      {status === "top" && (
                        <div className="absolute left-2 top-2 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-black text-white shadow">
                          TOP
                        </div>
                      )}
                    </div>

                    {/* Інфо */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <p className="font-black text-base truncate">{l.brand} {l.model} {l.year}</p>
                        <Badge className={`${cfg.color} text-[10px] px-2 py-0.5 h-5 flex-shrink-0 rounded-full`}>
                          <StatusIcon className="h-2.5 w-2.5 mr-0.5" />
                          {cfg.label}
                        </Badge>
                        {quality.percent >= 85 && (
                          <Badge className="rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                            <Gauge className="mr-1 h-3 w-3" />
                            {t("dealer.premium.qualityHigh")}
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span className="font-black text-foreground">{Number(l.price).toLocaleString()} Kč</span>
                        <span className="flex items-center gap-0.5"><Eye className="h-3 w-3" />{displayViews(l.views)}</span>
                        <span className="flex items-center gap-0.5"><Phone className="h-3 w-3" />{l.contacts}</span>
                        <span className="flex items-center gap-0.5"><MessageCircle className="h-3 w-3" />{l.whatsapp}</span>
                        <span className="flex items-center gap-0.5"><Timer className="h-3 w-3" />{getTimeSince(l.created_at)}</span>
                      </div>
                      <div className="mt-3 max-w-md">
                        <div className="mb-1 flex items-center justify-between text-[11px] text-muted-foreground">
                          <span>{t("dealer.premium.listingQuality")}</span>
                          <span>{quality.percent}%</span>
                        </div>
                        <Progress value={quality.percent} className="h-2" />
                        {quality.missing.length > 0 && (
                          <p className="mt-1 text-[11px] text-amber-700">
                            {t("dealer.premium.missingFields")}: {quality.missing.slice(0, 3).join(", ")}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Кнопки */}
                    <div className="hidden md:flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                      {status === "top" && (
                        <Button size="sm" variant="outline" className="h-7 text-xs px-2" onClick={() => removeTopMutation.mutate(l.id)}>
                          <Crown className="h-3 w-3 mr-1 text-amber-500" />
                          {t("dealer.listings.removeTop")}
                        </Button>
                      )}
                      {status !== "sold" ? (
                        <Button size="sm" variant="outline" className="h-7 text-xs px-2" onClick={() => toggleSoldMutation.mutate({ id: l.id, isSold: true })}>
                          <Check className="h-3 w-3 mr-1" />
                          {t("dealer.listings.markSold")}
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" className="h-7 text-xs px-2" onClick={() => toggleSoldMutation.mutate({ id: l.id, isSold: false })}>
                          <CircleDot className="h-3 w-3 mr-1" />
                          {t("dealer.listings.markActive")}
                        </Button>
                      )}
                      <Button size="sm" variant="outline" className="h-7 text-xs px-2" onClick={() => handleEdit(l.id)}>
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-2 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setSingleDeleteId(l.id)}
                        title={t("dealer.delete")}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="outline" className="h-7 px-2">
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={() => {
                            toast({ title: t("dealer.premium.duplicateSoon") });
                            onAddVehicle();
                          }}>
                            <Copy className="mr-2 h-4 w-4" />
                            {t("dealer.premium.duplicateAd")}
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => onOpenTab("promotion")}>
                            <Rocket className="mr-2 h-4 w-4" />
                            {t("dealer.premium.promoteAd")}
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => toast({ title: t("dealer.premium.refreshSoon") })}>
                            <RotateCcw className="mr-2 h-4 w-4" />
                            {t("dealer.premium.refreshListing")}
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => toggleSoldMutation.mutate({ id: l.id, isSold: true })}>
                            <Pause className="mr-2 h-4 w-4" />
                            {t("dealer.premium.archiveListing")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() => setSingleDeleteId(l.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t("dealer.delete")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2 md:hidden" onClick={(e) => e.stopPropagation()}>
                    <Button size="sm" variant="outline" className="h-10 rounded-xl" onClick={() => handleEdit(l.id)}>
                      <Pencil className="mr-1 h-3.5 w-3.5" />
                      {t("dealer.edit")}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-10 rounded-xl"
                      onClick={() => onOpenTab("promotion")}
                    >
                      <Rocket className="mr-1 h-3.5 w-3.5" />
                      TOP
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-10 rounded-xl"
                      onClick={() => toggleSoldMutation.mutate({ id: l.id, isSold: status !== "sold" })}
                    >
                      <Check className="mr-1 h-3.5 w-3.5" />
                      {status !== "sold" ? t("dealer.listings.markSold") : t("dealer.listings.markActive")}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="col-span-3 h-10 rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => setSingleDeleteId(l.id)}
                    >
                      <Trash2 className="mr-1 h-3.5 w-3.5" />
                      {t("dealer.delete")}
                    </Button>
                  </div>

                  {/* Розгорнута статистика */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="bg-blue-50 rounded-lg p-2.5 text-center">
                          <Eye className="h-4 w-4 mx-auto text-blue-600 mb-1" />
                          <p className="text-lg font-bold text-blue-700">{displayViews(l.views)}</p>
                          <p className="text-[10px] text-blue-600/70">{t("dealer.views")}</p>
                        </div>
                        <div className="bg-emerald-50 rounded-lg p-2.5 text-center">
                          <Phone className="h-4 w-4 mx-auto text-emerald-600 mb-1" />
                          <p className="text-lg font-bold text-emerald-700">{l.contacts}</p>
                          <p className="text-[10px] text-emerald-600/70">{t("dealer.contacts")}</p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-2.5 text-center">
                          <MessageCircle className="h-4 w-4 mx-auto text-green-600 mb-1" />
                          <p className="text-lg font-bold text-green-700">{l.whatsapp}</p>
                          <p className="text-[10px] text-green-600/70">WhatsApp</p>
                        </div>
                        <div className="bg-amber-50 rounded-lg p-2.5 text-center">
                          <TrendingUp className="h-4 w-4 mx-auto text-amber-600 mb-1" />
                          <p className="text-lg font-bold text-amber-700">{conversionRate}%</p>
                          <p className="text-[10px] text-amber-600/70">{t("dealer.conversionRate")}</p>
                        </div>
                      </div>

                      {/* Візуальний прогрес-бар переглядів */}
                      <div className="mt-3 space-y-1.5">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{t("dealer.views")}</span>
                          <span>{displayViews(l.views)}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full transition-all"
                            style={{ width: `${viewsBarWidth}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{t("dealer.contacts")} + WhatsApp</span>
                          <span>{totalInteractions}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all"
                            style={{ width: `${l.views > 0 ? Math.min(100, Math.round((totalInteractions / l.views) * 100 * 5)) : 0}%` }}
                          />
                        </div>
                      </div>

                      <div className="mt-4 rounded-2xl border bg-white p-3">
                        <p className="mb-3 text-sm font-semibold">{t("dealer.premium.whatToImprove")}</p>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {quality.checks.map((check) => (
                            <div key={check.label} className="flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2 text-xs">
                              <span className="flex items-center gap-2">
                                {check.done ? (
                                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                ) : (
                                  <CircleDot className="h-3.5 w-3.5 text-amber-600" />
                                )}
                                {check.label}
                              </span>
                              <span className="font-bold">+{check.weight}%</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Додаткова інформація */}
                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                        {l.mileage != null && (
                          <span className="bg-muted px-2 py-0.5 rounded">{l.mileage.toLocaleString()} km</span>
                        )}
                        {l.region && (
                          <span className="bg-muted px-2 py-0.5 rounded">{l.region}</span>
                        )}
                        <span className="bg-muted px-2 py-0.5 rounded">
                          {new Date(l.created_at).toLocaleDateString("cs-CZ")}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <AlertDialog open={bulkSoldDialogOpen} onOpenChange={setBulkSoldDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("dealer.listings.confirmMarkSoldTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("dealer.listings.confirmMarkSoldDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("dealer.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-amber-700 hover:bg-amber-800"
              disabled={bulkMutation.isPending}
              onClick={() =>
                bulkMutation.mutate({ action: "mark_sold" })
              }
            >
              {bulkMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t("common.yes")
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("dealer.listings.confirmDeleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("dealer.listings.confirmDeleteDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("dealer.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={bulkMutation.isPending}
              onClick={() => bulkMutation.mutate({ action: "delete" })}
            >
              {bulkMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t("dealer.delete")
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!singleDeleteId}
        onOpenChange={(open) => {
          if (!open) setSingleDeleteId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("dealer.deleteListingTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("dealer.deleteListingDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("dealer.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={singleDeleteMutation.isPending}
              onClick={() =>
                singleDeleteId && singleDeleteMutation.mutate(singleDeleteId)
              }
            >
              {singleDeleteMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t("dealer.delete")
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={priceModalOpen}
        onOpenChange={(open) => {
          setPriceModalOpen(open);
          if (!open) setPriceValueStr("");
        }}
      >
        <DialogContent className="h-[100dvh] max-h-[100dvh] w-screen max-w-none overflow-y-auto rounded-none p-4 sm:h-auto sm:max-h-[90vh] sm:max-w-md sm:rounded-lg sm:p-6">
          <DialogHeader>
            <DialogTitle>{t("dealer.listings.priceModalTitle")}</DialogTitle>
            <DialogDescription className="sr-only">
              {t("dealer.listings.bulkChangePrice")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>{t("dealer.listings.priceModeLabel")}</Label>
              <Select
                value={priceMode}
                onValueChange={(v) =>
                  setPriceMode(v as typeof priceMode)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="set">{t("dealer.listings.priceModeSet")}</SelectItem>
                  <SelectItem value="increase_percent">
                    {t("dealer.listings.priceModeIncrease")}
                  </SelectItem>
                  <SelectItem value="decrease_percent">
                    {t("dealer.listings.priceModeDecrease")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bulk-price-value">{t("dealer.listings.priceValueLabel")}</Label>
              <Input
                id="bulk-price-value"
                inputMode="decimal"
                value={priceValueStr}
                onChange={(e) => setPriceValueStr(e.target.value)}
                placeholder={priceMode === "set" ? "299000" : "10"}
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setPriceModalOpen(false)}
            >
              {t("dealer.cancel")}
            </Button>
            <Button
              type="button"
              className="bg-amber-700 hover:bg-amber-800"
              onClick={() => {
                const raw = priceValueStr.replace(/\s/g, "").replace(",", ".");
                const v = parseFloat(raw);
                if (!Number.isFinite(v) || v < 0) {
                  toast({
                    title: t("dealer.listings.bulkError"),
                    variant: "destructive",
                  });
                  return;
                }
                setPendingPricePayload({ mode: priceMode, value: v });
                setPriceModalOpen(false);
                setPriceConfirmOpen(true);
              }}
            >
              {t("dealer.listings.priceContinue")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={priceConfirmOpen} onOpenChange={setPriceConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("dealer.listings.confirmPriceTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("dealer.listings.confirmPriceDescription").replace(
                "{{count}}",
                String(selectedOnPageCount),
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setPendingPricePayload(null);
              }}
            >
              {t("dealer.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-amber-700 hover:bg-amber-800"
              disabled={bulkMutation.isPending || !pendingPricePayload}
              onClick={() => {
                if (!pendingPricePayload) return;
                bulkMutation.mutate({
                  action: "price_update",
                  payload: pendingPricePayload,
                });
              }}
            >
              {bulkMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t("common.yes")
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {editingListing && (
        <Suspense fallback={null}>
          <EditListingDialog
            open={editDialogOpen}
            onOpenChange={(open: boolean) => {
              setEditDialogOpen(open);
              if (!open) {
                setEditingListing(null);
                queryClient.invalidateQueries({ queryKey: ["/api/dealer/listings"] });
                queryClient.invalidateQueries({ queryKey: ["/api/dealer/stats"] });
              }
            }}
            listing={editingListing}
          />
        </Suspense>
      )}
    </div>
  );
}

// ── Promotion packages ────────────────────────────────────────────────────────

const PROMO_PACKAGES = [
  {
    id: "top" as const,
    icon: ArrowUpRight,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200 hover:border-blue-400",
    badge: "bg-blue-100 text-blue-700",
    boost: "+40%",
  },
  {
    id: "vip" as const,
    icon: Crown,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200 hover:border-amber-400",
    badge: "bg-amber-100 text-amber-700",
    boost: "+80%",
  },
];

function TopovaniTab({
  t,
}: {
  t: (key: string) => string;
}) {
  const { toast } = useToast();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [duration, setDuration] = useState<"7" | "14" | "30">("30");

  const { data, isLoading } = useQuery({
    queryKey: ["/api/dealer/listings"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/dealer/listings");
      return res.json();
    },
  });

  const allListings = ((data?.listings || []) as DealerListing[]).filter((listing) => !listing.is_sold);
  const topListings = allListings.filter((listing) => listing.is_top_listing);
  const availableListings = allListings.filter((listing) => !listing.is_top_listing);
  const selectedListings = availableListings.filter((listing) => selectedIds.has(listing.id));

  const pricePerListing = duration === "7" ? 39 : duration === "14" ? 69 : 99;
  const totalPrice = pricePerListing * selectedIds.size;

  const toggleListing = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const topMutation = useMutation({
    mutationFn: async () => {
      if (selectedIds.size === 0) throw new Error("no listings selected");
      const expiresAt = new Date(Date.now() + Number(duration) * 24 * 60 * 60 * 1000).toISOString();
      await Promise.all(
        Array.from(selectedIds).map((id) =>
          apiRequest("PUT", `/api/listings/${id}`, {
            isTopListing: true,
            topListingExpiresAt: expiresAt,
          }),
        ),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dealer/listings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dealer/stats"] });
      toast({
        title: t("dealer.topovani.success"),
        description: t("dealer.topovani.successDescription").replace(
          "{{count}}",
          String(selectedIds.size),
        ),
      });
      setSelectedIds(new Set());
    },
    onError: () => {
      toast({
        title: t("dealer.topovani.error"),
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-28 rounded-3xl" />
        {[0, 1].map((item) => (
          <Skeleton key={item} className="h-24 rounded-3xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24 sm:pb-0">
      <Card className={`${premiumSurface} rounded-3xl`}>
        <CardContent className="p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">
                NNAuto Pro
              </p>
              <h2 className="mt-1 flex items-center gap-2 text-2xl font-black tracking-tight text-[#5c3b10]">
                <Crown className="h-5 w-5 text-amber-700" />
                {t("dealer.topovani.title")}
              </h2>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                {t("dealer.topovani.subtitle")}
              </p>
            </div>
            <div className="grid grid-cols-3 overflow-hidden rounded-2xl border border-amber-100 bg-white text-center">
              <div className="px-4 py-3">
                <p className="text-[10px] font-black uppercase tracking-wide text-muted-foreground">
                  {t("dealer.topovani.activeTop")}
                </p>
                <p className="text-xl font-black text-[#5c3b10]">{topListings.length}</p>
              </div>
              <div className="border-x border-amber-100 px-4 py-3">
                <p className="text-[10px] font-black uppercase tracking-wide text-muted-foreground">
                  {t("dealer.topovani.available")}
                </p>
                <p className="text-xl font-black text-[#5c3b10]">{availableListings.length}</p>
              </div>
              <div className="px-4 py-3">
                <p className="text-[10px] font-black uppercase tracking-wide text-muted-foreground">
                  {t("dealer.topovani.selected")}
                </p>
                <p className="text-xl font-black text-[#5c3b10]">{selectedIds.size}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className={`${premiumSurface} rounded-3xl`}>
        <CardContent className="space-y-4 p-5">
          <div>
            <h3 className="text-lg font-black text-[#5c3b10]">
              {t("dealer.topovani.chooseDuration")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t("dealer.topovani.chooseDurationHint")}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {(["7", "14", "30"] as const).map((days) => {
              const active = duration === days;
              const price = days === "7" ? 39 : days === "14" ? 69 : 99;
              return (
                <button
                  key={days}
                  type="button"
                  onClick={() => setDuration(days)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    active
                      ? "border-amber-400 bg-amber-50 shadow-sm"
                      : "border-amber-100 bg-white hover:bg-amber-50/60"
                  }`}
                >
                  <span className="text-xl font-black text-[#5c3b10]">
                    {days} {t("dealer.topovani.days")}
                  </span>
                  <span className="mt-1 block text-sm font-bold text-amber-700">
                    {price} Kč / {t("dealer.topovani.listing")}
                  </span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className={`${premiumSurface} rounded-3xl`}>
        <CardContent className="space-y-4 p-5">
          <div>
            <h3 className="text-lg font-black text-[#5c3b10]">
              {t("dealer.topovani.chooseListings")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t("dealer.topovani.chooseListingsHint")}
            </p>
          </div>

          {availableListings.length > 0 ? (
            <div className="space-y-2">
              {availableListings.map((listing) => {
                const selected = selectedIds.has(listing.id);
                return (
                  <button
                    key={listing.id}
                    type="button"
                    onClick={() => toggleListing(listing.id)}
                    className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${
                      selected
                        ? "border-amber-400 bg-amber-50 shadow-sm"
                        : "border-amber-100 bg-white hover:bg-amber-50/60"
                    }`}
                  >
                    <div className="h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-muted">
                      {listing.photos?.[0] ? (
                        <img
                          src={`/img/${listing.photos[0]}?w=192&h=128&fit=cover`}
                          alt={`${listing.brand} ${listing.model}`}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Car className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-black text-[#5c3b10]">
                        {listing.brand} {listing.model} {listing.year}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span>{Number(listing.price).toLocaleString("cs-CZ")} Kč</span>
                        <span className="inline-flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {displayViews(listing.views)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {listing.contacts}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${
                        selected
                          ? "border-amber-700 bg-amber-700 text-white"
                          : "border-amber-200 bg-white text-amber-700"
                      }`}
                    >
                      {selected ? <CheckCircle2 className="h-5 w-5" /> : <Crown className="h-4 w-4" />}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-amber-200 bg-amber-50/50 p-8 text-center">
              <Crown className="mx-auto h-8 w-8 text-amber-700" />
              <p className="mt-3 font-black text-[#5c3b10]">{t("dealer.topovani.noAvailable")}</p>
              <p className="mt-1 text-sm text-muted-foreground">{t("dealer.topovani.noAvailableHint")}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {topListings.length > 0 ? (
        <Card className={`${premiumSurface} rounded-3xl`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Crown className="h-5 w-5 text-amber-700" />
              {t("dealer.topovani.alreadyTop")}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 md:grid-cols-2">
            {topListings.map((listing) => (
              <div key={listing.id} className="rounded-2xl border border-amber-100 bg-amber-50/60 p-3">
                <p className="truncate font-bold text-[#5c3b10]">
                  {listing.brand} {listing.model} {listing.year}
                </p>
                <p className="text-xs text-muted-foreground">
                  {listing.top_listing_expires_at
                    ? t("dealer.topovani.activeUntil").replace(
                        "{{date}}",
                        new Date(listing.top_listing_expires_at).toLocaleDateString("cs-CZ"),
                      )
                    : t("dealer.topovani.active")}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <div className="sticky bottom-24 z-20 rounded-3xl border border-amber-200 bg-white/95 p-3 shadow-[0_18px_55px_rgba(120,72,12,0.16)] backdrop-blur sm:bottom-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-[#5c3b10]">
              {selectedIds.size > 0
                ? t("dealer.topovani.summarySelected")
                    .replace("{{count}}", String(selectedIds.size))
                    .replace("{{days}}", duration)
                : t("dealer.topovani.summaryEmpty")}
            </p>
            <p className="text-xs text-muted-foreground">
              {t("dealer.topovani.summaryHint")}
            </p>
          </div>
          <Button
            className="h-12 rounded-2xl bg-[#6f4c17] px-6 font-black hover:bg-[#5c3b10]"
            disabled={selectedIds.size === 0 || topMutation.isPending}
            onClick={() => topMutation.mutate()}
          >
            {topMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Crown className="mr-2 h-4 w-4" />
            )}
            {selectedIds.size > 0
              ? `${t("dealer.topovani.activate")} · ${totalPrice} Kč`
              : t("dealer.topovani.activate")}
          </Button>
        </div>
      </div>
    </div>
  );
}

function PromotionTab({
  stats,
  t,
}: {
  stats: DealerStats;
  t: (key: string) => string;
}) {
  const { toast } = useToast();
  const [selectedListings, setSelectedListings] = useState<Set<string>>(new Set());
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<Record<string, "14" | "30">>({});
  const [autoBudget, setAutoBudget] = useState(500);
  const [autoBudgetEnabled, setAutoBudgetEnabled] = useState(false);
  const [roiPrice, setRoiPrice] = useState("350000");
  const [roiContacts, setRoiContacts] = useState("8");

  const toggleListing = useCallback((id: string) => {
    setSelectedListings((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const getPrice = useCallback(() => {
    if (!selectedPackage) return 0;
    const dur = selectedDuration[selectedPackage] || "30";
    const prices: Record<string, Record<string, number>> = {
      top: { "14": 69, "30": 99 },
      vip: { "14": 119, "30": 159 },
    };
    return (prices[selectedPackage]?.[dur] || 0) * selectedListings.size;
  }, [selectedPackage, selectedDuration, selectedListings.size]);

  const handlePayment = useCallback(() => {
    if (!selectedPackage) {
      toast({ title: t("dealer.promo.selectPackageFirst") });
      return;
    }
    if (selectedListings.size === 0) {
      toast({ title: t("dealer.promo.selectListingsFirst") });
      return;
    }
    const dur = selectedDuration[selectedPackage] || "30";
    toast({
      title: t("dealer.promo.redirectingToPayment"),
      description: `${selectedPackage.toUpperCase()} × ${selectedListings.size} — ${getPrice()} Kč`,
    });
  }, [selectedPackage, selectedListings, selectedDuration, getPrice, t, toast]);

  const roiContactsNumber = Number(roiContacts.replace(/\s/g, "")) || 0;
  const roiLift = Math.max(1, Math.round(roiContactsNumber * 1.8));
  const roiValue = Math.max(0, Math.round((Number(roiPrice.replace(/\s/g, "")) || 0) * 0.012));

  return (
    <div className="space-y-6">
      {/* Recommendation banner */}
      <Card className="border-amber-200 bg-gradient-to-r from-amber-50 via-white to-yellow-50">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Crown className="h-7 w-7 text-amber-600" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="font-semibold text-lg">
                {t("dealer.promo.recommendTitle")}
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                {t("dealer.promo.recommendDescription")}
              </p>
            </div>
            <Button
              className="bg-amber-700 hover:bg-amber-800 px-6 flex-shrink-0"
              onClick={() => {
                setSelectedPackage("vip");
                setSelectedDuration((prev) => ({ ...prev, vip: "30" }));
                toast({ title: t("dealer.promo.vip.title") + " " + t("dealer.promo.selected") });
              }}
            >
              <Crown className="h-4 w-4 mr-2" />
              {t("dealer.promo.activateVip")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Card className={`${premiumSurface} rounded-3xl`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Percent className="h-5 w-5 text-amber-700" />
              {t("dealer.premium.exposureComparison")}
            </CardTitle>
            <CardDescription>{t("dealer.premium.exposureDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            {[
              ["FREE", "1×", t("dealer.premium.freePlan")],
              ["TOP", "1.4×", t("dealer.premium.topPlan")],
              ["VIP", "1.8×", t("dealer.premium.vipPlan")],
            ].map(([plan, boost, desc]) => (
              <div
                key={plan}
                className={`rounded-2xl border p-4 ${
                  plan === "VIP"
                    ? "border-amber-300 bg-gradient-to-br from-amber-50 to-white shadow-sm"
                    : "bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-black">{plan}</span>
                  <Badge className={plan === "VIP" ? "bg-amber-700" : "bg-muted text-foreground hover:bg-muted"}>
                    {boost}
                  </Badge>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className={`${premiumSurface} rounded-3xl`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Gauge className="h-5 w-5 text-amber-700" />
              {t("dealer.premium.roiCalculator")}
            </CardTitle>
            <CardDescription>{t("dealer.premium.roiDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{t("dealer.premium.avgCarPrice")}</Label>
                <Input value={roiPrice} onChange={(e) => setRoiPrice(e.target.value)} inputMode="numeric" />
              </div>
              <div className="space-y-1.5">
                <Label>{t("dealer.premium.contactsNow")}</Label>
                <Input value={roiContacts} onChange={(e) => setRoiContacts(e.target.value)} inputMode="numeric" />
              </div>
            </div>
            <div className="space-y-4 rounded-2xl border bg-white p-3">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium text-muted-foreground">
                  <span>{t("dealer.premium.avgCarPrice")}</span>
                  <span>{Number(roiPrice || 0).toLocaleString("cs-CZ")} Kč</span>
                </div>
                <Slider
                  value={[Number(roiPrice.replace(/\s/g, "")) || 0]}
                  min={50000}
                  max={1500000}
                  step={10000}
                  onValueChange={(value) => setRoiPrice(String(value[0]))}
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium text-muted-foreground">
                  <span>{t("dealer.premium.contactsNow")}</span>
                  <span>{roiContactsNumber}</span>
                </div>
                <Slider
                  value={[roiContactsNumber]}
                  min={0}
                  max={80}
                  step={1}
                  onValueChange={(value) => setRoiContacts(String(value[0]))}
                />
              </div>
            </div>
            <div className="rounded-2xl bg-amber-50 p-4">
              <p className="text-sm text-amber-800">{t("dealer.premium.vipEstimate")}</p>
              <p className="mt-1 text-2xl font-black text-amber-900">
                +{roiLift} {t("dealer.contacts").toLowerCase()}
              </p>
              <p className="text-xs text-amber-700">
                {t("dealer.premium.estimatedMargin")} ~{roiValue.toLocaleString("cs-CZ")} Kč
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl bg-muted/50 p-3 font-semibold">
                {t("dealer.premium.vipSocialProof")}
              </div>
              <div className="rounded-xl bg-muted/50 p-3 font-semibold">
                {t("dealer.premium.topSocialProof")}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Promotion packages */}
      <div className="grid gap-4 md:grid-cols-2">
        {PROMO_PACKAGES.map((pkg) => {
          const Icon = pkg.icon;
          return (
            <Card
              key={pkg.id}
              className={`cursor-pointer transition-all duration-200 ${pkg.border} ${
                selectedPackage === pkg.id ? "ring-2 ring-offset-2 ring-amber-400 shadow-lg" : ""
              }`}
              onClick={() => setSelectedPackage(pkg.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`h-10 w-10 rounded-xl ${pkg.bg} flex items-center justify-center`}>
                    <Icon className={`h-5 w-5 ${pkg.color}`} />
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {pkg.id === "vip" && (
                      <Badge className="bg-amber-700 text-white">{t("dealer.premium.mostPopular")}</Badge>
                    )}
                    {pkg.id === "top" && (
                      <Badge className="bg-blue-100 text-blue-700">{t("dealer.premium.recommended")}</Badge>
                    )}
                    <Badge className={pkg.badge}>{pkg.boost}</Badge>
                  </div>
                </div>
                <CardTitle className="text-lg mt-3">
                  {t(`dealer.promo.${pkg.id}.title`)}
                </CardTitle>
                <CardDescription>
                  {t(`dealer.promo.${pkg.id}.description`)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button
                    type="button"
                    className={`p-3 rounded-lg text-center transition-all cursor-pointer ${
                      selectedDuration[pkg.id] === "14"
                        ? `${pkg.bg} border-2 ${pkg.border.split(" ")[0]} shadow-sm`
                        : "bg-muted/50 border-2 border-transparent hover:border-gray-200"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDuration((prev) => ({ ...prev, [pkg.id]: "14" }));
                      setSelectedPackage(pkg.id);
                      toast({ title: `${t(`dealer.promo.${pkg.id}.title`)} — ${t("dealer.promo.per14days")}` });
                    }}
                  >
                    <span className="text-xl font-bold">{t(`dealer.promo.${pkg.id}.price14`)}</span>
                    <p className="text-xs text-muted-foreground mt-0.5">{t("dealer.promo.per14days")}</p>
                  </button>
                  <button
                    type="button"
                    className={`p-3 rounded-lg text-center transition-all cursor-pointer ${
                      !selectedDuration[pkg.id] || selectedDuration[pkg.id] === "30"
                        ? `${pkg.bg} border-2 ${pkg.border.split(" ")[0]} shadow-sm`
                        : "bg-muted/50 border-2 border-transparent hover:border-gray-200"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDuration((prev) => ({ ...prev, [pkg.id]: "30" }));
                      setSelectedPackage(pkg.id);
                      toast({ title: `${t(`dealer.promo.${pkg.id}.title`)} — ${t("dealer.promo.per30days")}` });
                    }}
                  >
                    <span className="text-xl font-bold">{t(`dealer.promo.${pkg.id}.price30`)}</span>
                    <p className="text-xs text-muted-foreground mt-0.5">{t("dealer.promo.per30days")}</p>
                    <Badge variant="secondary" className="mt-1 text-[10px]">{t("dealer.promo.bestValue")}</Badge>
                  </button>
                </div>
                <ul className="space-y-2 text-sm mb-4">
                  {[1, 2, 3].map((i) => {
                    const key = `dealer.promo.${pkg.id}.feature${i}`;
                    const text = t(key);
                    if (text === key) return null;
                    return (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle2 className={`h-4 w-4 flex-shrink-0 ${pkg.color}`} />
                        <span>{text}</span>
                      </li>
                    );
                  })}
                </ul>
                <Button
                  className={`w-full ${
                    selectedPackage === pkg.id
                      ? "bg-amber-700 hover:bg-amber-800"
                      : pkg.id === "vip"
                        ? "bg-amber-600 hover:bg-amber-700"
                        : "bg-blue-600 hover:bg-blue-700"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPackage(pkg.id);
                    toast({ title: `${t(`dealer.promo.${pkg.id}.title`)} ${t("dealer.promo.selected")}` });
                  }}
                >
                  {selectedPackage === pkg.id ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      {t("dealer.promo.selected")}
                    </>
                  ) : (
                    <>
                      <ChevronRight className="h-4 w-4 mr-2" />
                      {t("dealer.promo.select")}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Per-listing promotion */}
      {stats.perListing.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Rocket className="h-4 w-4" />
                  {t("dealer.promo.boostListings")}
                </CardTitle>
                <CardDescription>{t("dealer.promo.boostDescription")}</CardDescription>
              </div>
              {selectedListings.size > 0 && (
                <Badge className="bg-amber-100 text-amber-700">
                  {selectedListings.size} {t("dealer.promo.selectedCount")}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              {stats.perListing.map((item) => {
                const isSelected = selectedListings.has(item.listing_id);
                return (
                  <div
                    key={item.listing_id}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-all cursor-pointer ${
                      isSelected
                        ? "bg-amber-50 border border-amber-300 shadow-sm"
                        : "bg-muted/50 hover:bg-muted border border-transparent"
                    }`}
                    onClick={() => toggleListing(item.listing_id)}
                  >
                    <div className={`h-5 w-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      isSelected ? "bg-amber-700 border-amber-700" : "border-gray-300"
                    }`}>
                      {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                    </div>
                    <div className="h-10 w-14 rounded-md overflow-hidden bg-muted flex-shrink-0">
                      {item.photo ? (
                        <img
                          src={`/img/${item.photo}?w=112&h=80&fit=cover`}
                          alt={`${item.brand} ${item.model}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Car className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {item.brand} {item.model}
                      </p>
                      <div className="flex gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" /> {displayViews(item.views)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {item.contacts}
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={isSelected ? "default" : "outline"}
                      className={isSelected ? "bg-amber-700 hover:bg-amber-800" : ""}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleListing(item.listing_id);
                      }}
                    >
                      {isSelected ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                          {t("dealer.promo.selected")}
                        </>
                      ) : (
                        <>
                          <Rocket className="h-3.5 w-3.5 mr-1" />
                          {t("dealer.promo.boost")}
                        </>
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>

            {/* Payment summary */}
            {selectedListings.size > 0 && (
              <div className="pt-3 border-t space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {selectedPackage
                      ? `${t(`dealer.promo.${selectedPackage}.title`)} × ${selectedListings.size}`
                      : t("dealer.promo.selectPackageFirst")}
                  </span>
                  {selectedPackage && (
                    <span className="text-lg font-bold text-amber-700">{getPrice()} Kč</span>
                  )}
                </div>
                <Button
                  className="w-full bg-amber-700 hover:bg-amber-800 text-base py-5"
                  disabled={!selectedPackage}
                  onClick={handlePayment}
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  {selectedPackage
                    ? `${t("dealer.promo.pay")} ${getPrice()} Kč`
                    : t("dealer.promo.selectPackageFirst")}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Auto-budget */}
      <Card className="border-amber-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-amber-700" />
              </div>
              <div>
                <CardTitle className="text-base">{t("dealer.promo.autoBudgetTitle")}</CardTitle>
                <CardDescription>{t("dealer.promo.autoBudgetDescription")}</CardDescription>
              </div>
            </div>
            <Button
              variant={autoBudgetEnabled ? "default" : "outline"}
              size="sm"
              className={autoBudgetEnabled ? "bg-amber-700 hover:bg-amber-800" : ""}
              onClick={() => {
                setAutoBudgetEnabled(!autoBudgetEnabled);
                toast({
                  title: autoBudgetEnabled
                    ? t("dealer.promo.autoBudgetDisabled")
                    : t("dealer.promo.autoBudgetEnabled"),
                });
              }}
            >
              {autoBudgetEnabled ? t("dealer.promo.active") : t("dealer.promo.activate")}
            </Button>
          </div>
        </CardHeader>
        {autoBudgetEnabled && (
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>{t("dealer.promo.monthlyBudget")}</Label>
                <span className="text-xl font-bold text-amber-700">{autoBudget} Kč</span>
              </div>
              <Slider
                value={[autoBudget]}
                onValueChange={(v) => setAutoBudget(v[0])}
                min={100}
                max={5000}
                step={100}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>100 Kč</span>
                <span>5 000 Kč</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-lg font-bold text-amber-700">
                  ~{Math.round(autoBudget / 15)}
                </p>
                <p className="text-xs text-muted-foreground">{t("dealer.promo.estimatedBoosts")}</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-lg font-bold text-emerald-600">
                  +{Math.round(autoBudget * 0.8)}
                </p>
                <p className="text-xs text-muted-foreground">{t("dealer.promo.estimatedViews")}</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-lg font-bold text-blue-600">
                  +{Math.round(autoBudget * 0.04)}
                </p>
                <p className="text-xs text-muted-foreground">{t("dealer.promo.estimatedContacts")}</p>
              </div>
            </div>
            <Button
              className="w-full bg-amber-700 hover:bg-amber-800"
              onClick={() =>
                toast({
                  title: t("dealer.promo.saveBudget"),
                  description: `Měsíční limit ${autoBudget} Kč byl nastaven.`,
                })
              }
            >
              <Wallet className="h-4 w-4 mr-2" />
              {t("dealer.promo.saveBudget")}
            </Button>
          </CardContent>
        )}
      </Card>

      <Card className={`${premiumSurface} rounded-3xl`}>
        <CardHeader>
          <CardTitle>{t("dealer.premium.promoFaqTitle")}</CardTitle>
          <CardDescription>{t("dealer.premium.promoFaqDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="rounded-2xl border bg-white p-4">
              <p className="font-semibold">{t(`dealer.premium.promoFaq${item}Question`)}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {t(`dealer.premium.promoFaq${item}Answer`)}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function DealerProfileTab({
  dealer,
  t,
  focusTarget,
  onFocusHandled,
  subTab,
  onSubTabChange,
}: {
  dealer: Dealer;
  t: (key: string) => string;
  focusTarget: SettingsTarget | null;
  onFocusHandled: () => void;
  subTab: DealerProfileSubTab;
  onSubTabChange: (next: DealerProfileSubTab) => void;
}) {
  // A profile-level focus target (e.g. branding/verification) always belongs to
  // the "Základní informace" tab, so switch there if one arrives.
  useEffect(() => {
    if (focusTarget) onSubTabChange("info");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusTarget]);

  const tabs: Array<{
    id: DealerProfileSubTab;
    label: string;
    shortLabel: string;
    Icon: typeof Building2;
  }> = [
    { id: "info", label: t("dealer.profileTab.info"), shortLabel: t("dealer.profileTab.infoShort"), Icon: Building2 },
    { id: "web", label: t("dealer.profileTab.web"), shortLabel: t("dealer.profileTab.webShort"), Icon: MonitorSmartphone },
    { id: "account", label: t("dealer.profileTab.account"), shortLabel: t("dealer.profileTab.accountShort"), Icon: Shield },
  ];

  return (
    <div className="space-y-4">
      {/* Segmented tab switcher. Mobile: equal-width pills with short labels
          stacked under the icon so it's obviously a tappable switcher.
          Desktop (sm+): full labels next to the icon. */}
      <div className="grid grid-cols-3 gap-1 rounded-2xl bg-amber-50/70 p-1 sm:flex sm:gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSubTabChange(tab.id)}
            aria-pressed={subTab === tab.id}
            className={`inline-flex flex-col items-center justify-center gap-1 whitespace-nowrap rounded-xl px-2 py-2 text-xs font-bold transition sm:flex-none sm:flex-row sm:gap-2 sm:px-6 sm:text-sm ${
              subTab === tab.id
                ? "bg-[#6f4c17] text-white shadow-sm"
                : "text-[#8a641f] hover:bg-white/70 hover:text-[#5c3b10]"
            }`}
          >
            <tab.Icon className="h-4 w-4 shrink-0" />
            <span className="sm:hidden">{tab.shortLabel}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {subTab === "info" ? (
        <DealerSettingsTab
          dealer={dealer}
          t={t}
          focusTarget={focusTarget}
          onFocusHandled={onFocusHandled}
        />
      ) : subTab === "web" ? (
        <MicrositeTab dealer={dealer} t={t} />
      ) : (
        <DealerAccountTab t={t} />
      )}
    </div>
  );
}

function DealerAccountTab({ t }: { t: (key: string) => string }) {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const [pwd, setPwd] = useState({ current: "", next: "", confirm: "", show: false });
  const [email, setEmail] = useState({ next: "", code: "", stage: "idle" as "idle" | "code" });

  const changePasswordMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Unauthorized");
      const res = await apiRequest("POST", `/api/users/${user.id}/change-password`, {
        currentPassword: pwd.current,
        newPassword: pwd.next,
        confirmNewPassword: pwd.confirm,
      });
      return res.json();
    },
    onSuccess: async () => {
      setPwd({ current: "", next: "", confirm: "", show: false });
      toast({ title: t("dealer.account.passwordChanged"), description: t("dealer.account.passwordChangedHint") });
      await logout();
      navigate("/");
    },
    onError: (err: unknown) => {
      toast({ variant: "destructive", title: t("dealer.account.passwordError"), description: parseApiError(err).message });
    },
  });

  const requestEmailMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/auth/request-email-change", { newEmail: email.next.trim() });
      return res.json();
    },
    onSuccess: () => {
      setEmail((prev) => ({ ...prev, stage: "code" }));
      toast({ title: t("dealer.account.codeSent"), description: t("dealer.account.codeSentHint") });
    },
    onError: (err: unknown) => {
      toast({ variant: "destructive", title: t("dealer.account.emailError"), description: parseApiError(err).message });
    },
  });

  const confirmEmailMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/auth/confirm-email-change", { code: email.code.trim() });
      return res.json();
    },
    onSuccess: (data: { user?: { id: string } }) => {
      try {
        if (data?.user) {
          localStorage.setItem("nnauto_user", JSON.stringify(data.user));
        }
      } catch {}
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setEmail({ next: "", code: "", stage: "idle" });
      toast({ title: t("dealer.account.emailChanged"), description: t("dealer.account.emailChangedHint") });
    },
    onError: (err: unknown) => {
      toast({ variant: "destructive", title: t("dealer.account.emailError"), description: parseApiError(err).message });
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/auth/forgot-password", {
        email: user?.email,
        turnstileToken: "__client_fallback__",
      });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: t("dealer.account.resetLinkSent"), description: t("dealer.account.resetLinkSentHint") });
    },
    onError: () => {
      toast({ title: t("dealer.account.resetLinkSent"), description: t("dealer.account.resetLinkSentHint") });
    },
  });

  const pwdValid =
    pwd.current.length > 0 && pwd.next.length >= 6 && pwd.next === pwd.confirm;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="rounded-3xl border-amber-100/80 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Lock className="h-5 w-5 text-amber-700" />
            {t("dealer.account.passwordTitle")}
          </CardTitle>
          <CardDescription>{t("dealer.account.passwordDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            ["current", t("dealer.account.currentPassword")],
            ["next", t("dealer.account.newPassword")],
            ["confirm", t("dealer.account.confirmPassword")],
          ].map(([key, label]) => (
            <div key={key} className="space-y-1.5">
              <Label>{label}</Label>
              <div className="relative">
                <Input
                  type={pwd.show ? "text" : "password"}
                  value={pwd[key as "current" | "next" | "confirm"]}
                  onChange={(e) => setPwd((prev) => ({ ...prev, [key]: e.target.value }))}
                  className="pr-10"
                  autoComplete={key === "current" ? "current-password" : "new-password"}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  onClick={() => setPwd((prev) => ({ ...prev, show: !prev.show }))}
                  aria-label={pwd.show ? t("dealer.account.hide") : t("dealer.account.show")}
                >
                  {pwd.show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          ))}
          {pwd.next.length > 0 && pwd.next.length < 6 && (
            <p className="text-xs text-destructive">{t("dealer.account.passwordTooShort")}</p>
          )}
          {pwd.confirm.length > 0 && pwd.next !== pwd.confirm && (
            <p className="text-xs text-destructive">{t("dealer.account.passwordsDoNotMatch")}</p>
          )}
          <Button
            type="button"
            className="w-full bg-amber-700 hover:bg-amber-800"
            disabled={!pwdValid || changePasswordMutation.isPending}
            onClick={() => changePasswordMutation.mutate()}
          >
            {changePasswordMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {t("dealer.account.savePassword")}
          </Button>
          <button
            type="button"
            className="w-full text-center text-xs font-medium text-amber-700 underline-offset-2 hover:underline disabled:opacity-60"
            disabled={!user?.email || forgotPasswordMutation.isPending}
            onClick={() => forgotPasswordMutation.mutate()}
          >
            {t("dealer.account.forgotPassword")}
          </button>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-amber-100/80 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Mail className="h-5 w-5 text-amber-700" />
            {t("dealer.account.emailTitle")}
          </CardTitle>
          <CardDescription>{t("dealer.account.emailDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-2xl bg-amber-50/70 px-3 py-2 text-sm">
            <span className="text-muted-foreground">{t("dealer.account.currentEmail")}: </span>
            <span className="font-semibold text-[#5c3b10]">{user?.email || "—"}</span>
          </div>
          {email.stage === "idle" ? (
            <>
              <div className="space-y-1.5">
                <Label>{t("dealer.account.newEmail")}</Label>
                <Input
                  type="email"
                  value={email.next}
                  onChange={(e) => setEmail((prev) => ({ ...prev, next: e.target.value }))}
                  placeholder="new@email.com"
                  autoComplete="email"
                />
              </div>
              <Button
                type="button"
                className="w-full bg-amber-700 hover:bg-amber-800"
                disabled={!/^\S+@\S+\.\S+$/.test(email.next.trim()) || requestEmailMutation.isPending}
                onClick={() => requestEmailMutation.mutate()}
              >
                {requestEmailMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="mr-2 h-4 w-4" />
                )}
                {t("dealer.account.sendCode")}
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-1.5">
                <Label>{t("dealer.account.verificationCode")}</Label>
                <Input
                  inputMode="numeric"
                  maxLength={6}
                  value={email.code}
                  onChange={(e) => setEmail((prev) => ({ ...prev, code: e.target.value.replace(/\D/g, "") }))}
                  placeholder="000000"
                  className="text-center text-lg font-bold tracking-[0.4em]"
                />
                <p className="text-xs text-muted-foreground">
                  {t("dealer.account.codeSentTo")} <span className="font-semibold">{email.next}</span>
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setEmail({ next: "", code: "", stage: "idle" })}
                >
                  {t("dealer.account.cancel")}
                </Button>
                <Button
                  type="button"
                  className="flex-1 bg-amber-700 hover:bg-amber-800"
                  disabled={email.code.length !== 6 || confirmEmailMutation.isPending}
                  onClick={() => confirmEmailMutation.mutate()}
                >
                  {confirmEmailMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="mr-2 h-4 w-4" />
                  )}
                  {t("dealer.account.confirm")}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function DealerSettingsTab({
  dealer,
  t,
  focusTarget,
  onFocusHandled,
}: {
  dealer: Dealer;
  t: (key: string) => string;
  focusTarget: SettingsTarget | null;
  onFocusHandled: () => void;
}) {
  const { toast } = useToast();
  const initialForm = useMemo(() => ({
    companyName: dealer.companyName || "",
    ico: dealer.ico || "",
    dic: dealer.dic || "",
    description: dealer.description || "",
    logoUrl: dealer.logoUrl || "",
    website: dealer.website || "",
    phone: dealer.phone || "",
    email: dealer.email || "",
    address: dealer.address || "",
    region: dealer.region || "",
  }), [dealer]);
  const [form, setForm] = useState(initialForm);
  const [lastSavedForm, setLastSavedForm] = useState(initialForm);
  const [saveState, setSaveState] = useState<"saved" | "dirty" | "saving">("saved");
  const companyRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const websiteRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLInputElement>(null);
  const regionRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const brandingRef = useRef<HTMLDivElement>(null);
  const verificationRef = useRef<HTMLDivElement>(null);
  const integrationsRef = useRef<HTMLDivElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [highlightTarget, setHighlightTarget] = useState<SettingsTarget | null>(null);
  const [settingsModal, setSettingsModal] = useState<SettingsModal | null>(null);
  const [localSettings, setLocalSettings] = useState<DealerLocalSettings>(() =>
    createDefaultDealerLocalSettings(dealer),
  );
  const [settingsSaveState, setSettingsSaveState] = useState<"saved" | "dirty" | "saving">("saved");
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    next: "",
    confirm: "",
    show: false,
  });
  const { user: authUser, logout: authLogout } = useAuth();
  const [, navigateFromSettings] = useLocation();

  const changePasswordMutation = useMutation({
    mutationFn: async () => {
      if (!authUser?.id) throw new Error("Unauthorized");
      const res = await apiRequest(
        "POST",
        `/api/users/${authUser.id}/change-password`,
        {
          currentPassword: passwordForm.current,
          newPassword: passwordForm.next,
          confirmNewPassword: passwordForm.confirm,
        },
      );
      return res.json();
    },
    onSuccess: async () => {
      setPasswordForm({ current: "", next: "", confirm: "", show: false });
      toast({
        title: t("dealer.account.passwordChanged"),
        description: t("dealer.account.passwordChangedHint"),
      });
      await authLogout();
      navigateFromSettings("/");
    },
    onError: (err: unknown) => {
      toast({
        variant: "destructive",
        title: t("dealer.account.passwordError"),
        description: parseApiError(err).message,
      });
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/auth/forgot-password", {
        email: authUser?.email,
        turnstileToken: "__client_fallback__",
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: t("dealer.account.resetLinkSent"),
        description: t("dealer.account.resetLinkSentHint"),
      });
    },
    onError: () => {
      toast({
        title: t("dealer.account.resetLinkSent"),
        description: t("dealer.account.resetLinkSentHint"),
      });
    },
  });
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [templateDraft, setTemplateDraft] = useState({ title: "", message: "" });
  const [addressQuery, setAddressQuery] = useState(dealer.address || "");
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);

  const updateMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const res = await apiRequest("PATCH", "/api/dealer/profile", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dealer/stats"] });
      setLastSavedForm(form);
      setSaveState("saved");
      toast({ title: t("dealer.profileUpdated") });
    },
  });

  const completion = getProfileCompletion(dealer, t);
  const isDirty = JSON.stringify(form) !== JSON.stringify(lastSavedForm);
  const localSettingsKey = `nnauto_dealer_settings_${dealer.id}`;

  useEffect(() => {
    setForm(initialForm);
    setLastSavedForm(initialForm);
    setSaveState("saved");
  }, [initialForm]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(localSettingsKey);
      if (saved) {
        const defaults = createDefaultDealerLocalSettings(dealer);
        const parsed = JSON.parse(saved) as Partial<DealerLocalSettings>;
        setLocalSettings({
          ...defaults,
          ...parsed,
          addressDetails: { ...defaults.addressDetails, ...(parsed.addressDetails || {}) },
          workingHours: { ...defaults.workingHours, ...(parsed.workingHours || {}) },
          socialLinks: { ...defaults.socialLinks, ...(parsed.socialLinks || {}) },
          notifications: { ...defaults.notifications, ...(parsed.notifications || {}) },
          integrations: { ...defaults.integrations, ...(parsed.integrations || {}) },
          autoReplies: { ...defaults.autoReplies, ...(parsed.autoReplies || {}) },
          security: { ...defaults.security, ...(parsed.security || {}) },
        });
      } else {
        setLocalSettings(createDefaultDealerLocalSettings(dealer));
      }
      setSettingsSaveState("saved");
    } catch {
      setLocalSettings(createDefaultDealerLocalSettings(dealer));
    }
  }, [dealer, localSettingsKey]);

  useEffect(() => {
    const query = addressQuery.trim();
    if (query.length < 3) {
      setAddressSuggestions([]);
      setAddressError(null);
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setAddressLoading(true);
      setAddressError(null);
      try {
        const params = new URLSearchParams({
          q: query,
          format: "jsonv2",
          addressdetails: "1",
          countrycodes: "cz",
          limit: "6",
        });
        const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });
        if (!response.ok) throw new Error("address_lookup_failed");
        const data = (await response.json()) as AddressSuggestion[];
        setAddressSuggestions(data);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          try {
            const params = new URLSearchParams({
              q: query,
              limit: "6",
              lang: "cs",
            });
            const response = await fetch(`https://photon.komoot.io/api/?${params.toString()}`, {
              signal: controller.signal,
              headers: { Accept: "application/json" },
            });
            if (!response.ok) throw new Error("photon_lookup_failed");
            const data = (await response.json()) as { features?: PhotonFeature[] };
            const suggestions = (data.features || [])
              .filter((feature) => feature.properties?.country === "Česko" || feature.properties?.country === "Czechia")
              .map(photonFeatureToSuggestion);
            const fallback = fallbackCzechAddressSuggestions.filter((item) =>
              item.display_name.toLowerCase().includes(query.toLowerCase().split(" ")[0] || ""),
            );
            setAddressSuggestions(suggestions.length > 0 ? suggestions : fallback);
            if (suggestions.length === 0 && fallback.length === 0) setAddressError(t("dealer.address.lookupFailed"));
          } catch (fallbackError) {
            if ((fallbackError as Error).name !== "AbortError") {
              const fallback = fallbackCzechAddressSuggestions.filter((item) =>
                item.display_name.toLowerCase().includes(query.toLowerCase().split(" ")[0] || ""),
              );
              setAddressSuggestions(fallback);
              if (fallback.length === 0) setAddressError(t("dealer.address.lookupFailed"));
            }
          }
        }
      } finally {
        setAddressLoading(false);
      }
    }, 350);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [addressQuery, t]);

  useEffect(() => {
    if (settingsSaveState !== "dirty") return;
    const timer = window.setTimeout(() => {
      setSettingsSaveState("saving");
      localStorage.setItem(localSettingsKey, JSON.stringify(localSettings));
      window.setTimeout(() => setSettingsSaveState("saved"), 350);
    }, 900);
    return () => window.clearTimeout(timer);
  }, [localSettings, localSettingsKey, settingsSaveState]);

  useEffect(() => {
    setSaveState(isDirty ? "dirty" : "saved");
  }, [isDirty]);

  useEffect(() => {
    if (!isDirty || updateMutation.isPending) return;
    const timer = window.setTimeout(() => {
      setSaveState("saving");
      updateMutation.mutate(form);
    }, 1400);
    return () => window.clearTimeout(timer);
  }, [form, isDirty, updateMutation]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    if (!focusTarget) return;
    const sectionMap: Partial<Record<SettingsTarget, HTMLElement | null>> = {
      companyName: companyRef.current,
      description: descriptionRef.current,
      phone: phoneRef.current,
      email: emailRef.current,
      website: websiteRef.current,
      address: addressRef.current,
      region: regionRef.current,
      branding: brandingRef.current,
      verification: verificationRef.current,
      integrations: integrationsRef.current,
    };
    const target = sectionMap[focusTarget];
    target?.scrollIntoView({ behavior: "smooth", block: "center" });
    setHighlightTarget(focusTarget);
    window.setTimeout(() => {
      if (focusTarget === "branding") {
        logoInputRef.current?.click();
      }
      if ("focus" in (target || {})) {
        (target as HTMLInputElement | HTMLTextAreaElement).focus();
      }
      onFocusHandled();
    }, 450);
    const clear = window.setTimeout(() => setHighlightTarget(null), 2400);
    return () => window.clearTimeout(clear);
  }, [focusTarget, onFocusHandled]);

  const inputClass = (target: SettingsTarget) =>
    highlightTarget === target
      ? "ring-2 ring-amber-400 border-amber-400 bg-amber-50/60 transition-all duration-300"
      : "transition-all duration-300";

  const handleLogoFile = useCallback(
    (file: File | undefined) => {
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        toast({ title: t("dealer.premium.logoInvalid"), variant: "destructive" });
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const logoUrl = String(reader.result || "");
        setForm((prev) => ({ ...prev, logoUrl }));
        toast({ title: t("dealer.premium.logoPreviewReady") });
      };
      reader.readAsDataURL(file);
    },
    [t, toast],
  );

  const handleCoverFile = useCallback(
    (file: File | undefined) => {
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        toast({ title: t("dealer.premium.logoInvalid"), variant: "destructive" });
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setLocalSettings((prev) => ({
          ...prev,
          coverUrl: String(reader.result || ""),
        }));
        setSettingsSaveState("dirty");
        toast({ title: t("dealer.settings.coverReady") });
      };
      reader.readAsDataURL(file);
    },
    [t, toast],
  );

  const updateLocalSettings = useCallback((updater: (prev: DealerLocalSettings) => DealerLocalSettings) => {
    setLocalSettings((prev) => updater(prev));
    setSettingsSaveState("dirty");
  }, []);

  const saveLocalSettingsNow = useCallback(() => {
    setSettingsSaveState("saving");
    localStorage.setItem(localSettingsKey, JSON.stringify(localSettings));
    window.setTimeout(() => {
      setSettingsSaveState("saved");
      toast({ title: t("dealer.settings.saved") });
    }, 350);
  }, [localSettings, localSettingsKey, t, toast]);

  const openSettingsModal = useCallback((modal: SettingsModal) => {
    setSettingsModal(modal);
    if (modal === "autoreplies") {
      setEditingTemplateId(null);
      setTemplateDraft({ title: "", message: "" });
    }
  }, []);

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-4">
        <Card className={`${premiumSurface} rounded-3xl`}>
          <CardHeader className="p-4 pb-2 sm:p-5 sm:pb-3">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Building2 className="h-5 w-5 text-amber-700" />
              {t("dealer.premium.companySection")}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">{t("dealer.premium.companySectionDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 p-4 pt-0 sm:grid-cols-2 sm:p-5 sm:pt-0">
            <div className="space-y-2 sm:col-span-2">
              <Label>{t("dealer.companyName")} *</Label>
              <Input
                ref={companyRef}
                value={form.companyName}
                onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))}
                className={inputClass("companyName")}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("dealer.ico")}</Label>
              <Input value={form.ico} onChange={(e) => setForm((f) => ({ ...f, ico: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>{t("dealer.dic")}</Label>
              <Input value={form.dic} onChange={(e) => setForm((f) => ({ ...f, dic: e.target.value }))} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>{t("dealer.description")}</Label>
              <Textarea
                ref={descriptionRef}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={4}
                className={inputClass("description")}
              />
            </div>
          </CardContent>
        </Card>

        <Card className={`${premiumSurface} rounded-3xl`}>
          <CardHeader className="p-4 pb-2 sm:p-5 sm:pb-3">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Phone className="h-5 w-5 text-amber-700" />
              {t("dealer.premium.contactsSection")}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 p-4 pt-0 sm:grid-cols-2 sm:p-5 sm:pt-0">
            <div className="space-y-2">
              <Label>{t("dealer.phone")}</Label>
              <Input ref={phoneRef} value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className={inputClass("phone")} />
            </div>
            <div className="space-y-2">
              <Label>{t("dealer.email")}</Label>
              <Input
                ref={emailRef}
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className={inputClass("email")}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("dealer.website")}</Label>
              <Input
                ref={websiteRef}
                value={form.website}
                onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
                placeholder="https://"
                className={inputClass("website")}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("dealer.region")}</Label>
              <Input ref={regionRef} value={form.region} onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))} className={inputClass("region")} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>{t("dealer.address")}</Label>
              <Input ref={addressRef} value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} className={inputClass("address")} />
            </div>
            <div className="space-y-3 rounded-2xl border bg-amber-50/40 p-3 sm:col-span-2 sm:p-4">
              <div className="space-y-2">
                <Label>{t("dealer.address.autocomplete")}</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={addressQuery}
                    onChange={(event) => setAddressQuery(event.target.value)}
                    placeholder={t("dealer.address.placeholder")}
                    className="pl-9"
                  />
                </div>
                {addressLoading && (
                  <p className="text-xs text-muted-foreground">{t("dealer.address.searching")}</p>
                )}
                {addressError && <p className="text-xs text-red-600">{addressError}</p>}
                {addressSuggestions.length > 0 && (
                  <div className="overflow-hidden rounded-2xl border bg-white">
                    {addressSuggestions.map((suggestion) => (
                      <button
                        key={suggestion.place_id}
                        type="button"
                        className="block w-full border-b px-3 py-2 text-left text-sm last:border-0 hover:bg-amber-50"
                        onClick={() => {
                          const details = suggestionToAddressDetails(suggestion);
                          const composed = composeDealerAddress(details);
                          updateLocalSettings((prev) => ({
                            ...prev,
                            addressDetails: details,
                          }));
                          setForm((prev) => ({
                            ...prev,
                            address: composed || suggestion.display_name,
                            region: details.city || prev.region,
                          }));
                          setAddressQuery(suggestion.display_name);
                          setAddressSuggestions([]);
                        }}
                      >
                        {suggestion.display_name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ["country", t("dealer.address.country")],
                  ["city", t("dealer.address.city")],
                  ["street", t("dealer.address.street")],
                  ["houseNumber", t("dealer.address.houseNumber")],
                  ["postalCode", t("dealer.address.postalCode")],
                  ["showroomName", t("dealer.address.showroomName")],
                ].map(([key, label]) => (
                  <div key={key} className="space-y-2">
                    <Label>{label}</Label>
                    <Input
                      value={localSettings.addressDetails[key as keyof DealerAddressDetails] || ""}
                      onChange={(event) => {
                        const nextDetails = {
                          ...localSettings.addressDetails,
                          [key]: event.target.value,
                        };
                        updateLocalSettings((prev) => ({
                          ...prev,
                          addressDetails: nextDetails,
                        }));
                        setForm((prev) => ({
                          ...prev,
                          address: composeDealerAddress(nextDetails),
                          region: nextDetails.city || prev.region,
                        }));
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { icon: ImageIcon, title: t("dealer.premium.brandingSection"), description: t("dealer.premium.brandingDescription"), modal: "branding" as const, ref: brandingRef },
            { icon: Clock, title: t("dealer.hours.sectionTitle"), description: t("dealer.hours.sectionDescription"), modal: "workingHours" as const },
            { icon: Link2, title: t("dealer.social.sectionTitle"), description: t("dealer.social.sectionDescription"), modal: "socialLinks" as const },
            { icon: Bell, title: t("dealer.premium.notificationsSection"), description: t("dealer.premium.notificationsDescription"), modal: "notifications" as const },
            { icon: Link2, title: t("dealer.premium.integrationsSection"), description: t("dealer.premium.integrationsDescription"), modal: "integrations" as const, ref: integrationsRef },
            { icon: Lock, title: t("dealer.premium.securitySection"), description: t("dealer.premium.securityDescription"), modal: "security" as const },
            { icon: Bot, title: t("dealer.premium.autoReplySection"), description: t("dealer.premium.autoReplyDescription"), modal: "autoreplies" as const },
          ].map((item) => {
            const SectionIcon = item.icon;
            const connected =
              item.modal === "integrations" &&
              (localSettings.integrations.whatsappConnected || localSettings.integrations.telegramConnected);
            return (
              <div
                role="button"
                tabIndex={0}
                key={item.modal}
                ref={item.ref as any}
                onClick={() => openSettingsModal(item.modal)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openSettingsModal(item.modal);
                  }
                }}
                className="rounded-2xl border bg-white p-3.5 text-left transition hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-lg active:scale-[0.99]"
              >
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                      <SectionIcon className="h-[18px] w-[18px]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold leading-tight">{item.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{item.description}</p>
                    </div>
                    <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  </div>
                  {item.modal === "branding" && (
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center gap-3 rounded-2xl bg-amber-50 p-3">
                        <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-white text-lg font-black text-amber-900">
                          {form.logoUrl ? (
                            <img src={form.logoUrl} alt={form.companyName} className="h-full w-full object-cover" />
                          ) : (
                            (form.companyName || dealer.companyName).slice(0, 2).toUpperCase()
                          )}
                        </div>
                        <Button type="button" variant="outline" className="h-10" onClick={(event) => {
                          event.stopPropagation();
                          logoInputRef.current?.click();
                        }}>
                          <Upload className="mr-2 h-4 w-4" />
                          {t("dealer.premium.uploadLogo")}
                        </Button>
                      </div>
                      <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(event) => handleLogoFile(event.target.files?.[0])}
                      />
                    </div>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {connected && <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">{t("dealer.settings.connected")}</Badge>}
                    <Badge variant="secondary">{item.modal === "billing" ? t("dealer.premium.nextPhase") : t("dealer.settings.configure")}</Badge>
                  </div>
              </div>
            );
          })}
        </div>

        <div className="sticky bottom-3 z-20 rounded-2xl border bg-background/95 p-3 shadow-2xl backdrop-blur sm:static sm:shadow-none">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground">
              {saveState === "saving"
                ? t("dealer.premium.saving")
                : saveState === "dirty"
                  ? t("dealer.premium.unsavedChanges")
                  : t("dealer.premium.saved")}
            </div>
            <Button
              onClick={() => {
                setSaveState("saving");
                updateMutation.mutate(form);
              }}
              disabled={updateMutation.isPending}
              className="bg-amber-700 hover:bg-amber-800"
            >
              {updateMutation.isPending ? "..." : t("dealer.premium.saveChanges")}
            </Button>
          </div>
        </div>
      </div>

      <aside className="space-y-4">
        <Card ref={verificationRef} className={`${premiumSurface} rounded-3xl`}>
          <CardHeader className="p-4 pb-2 sm:p-5 sm:pb-3">
            <CardTitle className="text-base sm:text-lg">{t("dealer.premium.livePreview")}</CardTitle>
            <CardDescription className="text-xs sm:text-sm">{t("dealer.premium.livePreviewDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-5 sm:pt-0">
            <div className="overflow-hidden rounded-3xl border bg-gradient-to-br from-white to-amber-50">
              <div className="h-16 bg-gradient-to-r from-stone-900 to-amber-700" />
              <div className="-mt-7 p-3.5">
                <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-amber-100 text-lg font-black text-amber-900 shadow">
                  {form.logoUrl ? (
                    <img src={form.logoUrl} alt={form.companyName || dealer.companyName} className="h-full w-full object-cover" />
                  ) : (
                    form.companyName.slice(0, 2).toUpperCase() || "NN"
                  )}
                </div>
                <h3 className="mt-2.5 text-base font-black">{form.companyName || dealer.companyName}</h3>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                  {form.description || t("dealer.premium.previewDescriptionFallback")}
                </p>
                <div className="mt-3 space-y-1.5 text-xs">
                  <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-amber-700" />{form.phone || "—"}</p>
                  <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-amber-700" />{form.email || "—"}</p>
                  <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-amber-700" />{form.address || form.region || "—"}</p>
                  <p className="flex items-center gap-2"><Clock className="h-4 w-4 text-amber-700" />{formatWorkingHoursShort(localSettings.workingHours, t)} · {getTodayWorkingHours(localSettings.workingHours, t)}</p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {Object.entries({
                    Web: form.website || localSettings.socialLinks.website,
                    Facebook: localSettings.socialLinks.facebook,
                    Instagram: localSettings.socialLinks.instagram,
                    TikTok: localSettings.socialLinks.tiktok,
                    YouTube: localSettings.socialLinks.youtube,
                  }).filter(([, value]) => value.trim()).map(([label]) => (
                    <Badge key={label} variant="secondary" className="rounded-full">{label}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`${premiumSurface} rounded-3xl`}>
          <CardHeader className="p-4 pb-2 sm:p-5 sm:pb-3">
            <CardTitle className="text-base sm:text-lg">{t("dealer.premium.verificationFlow")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5 p-4 pt-0 sm:p-5 sm:pt-0">
            <Progress value={completion.percent} className="h-2" />
            {completion.tasks.map((task) => (
              <div key={task.key} className="flex items-center gap-2 text-sm">
                {task.done ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                ) : (
                  <CircleDot className="h-4 w-4 text-muted-foreground" />
                )}
                {task.label}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className={`${premiumSurface} rounded-3xl`}>
          <CardHeader className="p-4 pb-2 sm:p-5 sm:pb-3">
            <CardTitle className="text-base sm:text-lg">{t("dealer.premium.integrationsQuick")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 p-4 pt-0 sm:p-5 sm:pt-0">
            {[Smartphone, MessageCircle, Bot].map((Icon, index) => {
              const isConnected =
                index === 0
                  ? localSettings.integrations.whatsappConnected
                  : index === 1
                    ? localSettings.integrations.telegramConnected
                    : localSettings.autoReplies.enabled;
              return (
              <button
                type="button"
                key={index}
                className="flex items-center justify-between rounded-2xl border bg-white p-3 text-left transition hover:border-amber-300 hover:bg-amber-50"
                onClick={() => openSettingsModal(index === 2 ? "autoreplies" : "integrations")}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4 text-amber-700" />
                  <span className="text-sm font-medium">
                    {index === 0 ? "WhatsApp" : index === 1 ? "Telegram" : t("dealer.premium.aiReplies")}
                  </span>
                </div>
                <Badge className={isConnected ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" : ""} variant={isConnected ? "default" : "secondary"}>
                  {isConnected ? t("dealer.settings.connected") : t("dealer.settings.setup")}
                </Badge>
              </button>
            );
            })}
          </CardContent>
        </Card>
      </aside>

      <Dialog open={!!settingsModal} onOpenChange={(open) => !open && setSettingsModal(null)}>
        <DialogContent className="h-[100dvh] max-h-[100dvh] w-screen max-w-none overflow-y-auto rounded-none p-4 sm:h-auto sm:max-h-[90vh] sm:max-w-2xl sm:rounded-lg sm:p-6">
          <DialogHeader>
            <DialogTitle>
              {settingsModal === "branding" && t("dealer.premium.brandingSection")}
              {settingsModal === "workingHours" && t("dealer.hours.sectionTitle")}
              {settingsModal === "socialLinks" && t("dealer.social.sectionTitle")}
              {settingsModal === "billing" && t("dealer.premium.billingSection")}
              {settingsModal === "notifications" && t("dealer.premium.notificationsSection")}
              {settingsModal === "integrations" && t("dealer.premium.integrationsSection")}
              {settingsModal === "security" && t("dealer.premium.securitySection")}
              {settingsModal === "autoreplies" && t("dealer.premium.autoReplySection")}
            </DialogTitle>
            <DialogDescription>
              {settingsModal === "billing" ? t("dealer.settings.billingNextPhase") : t("dealer.settings.modalDescription")}
            </DialogDescription>
          </DialogHeader>

          {settingsModal === "branding" && (
            <div className="space-y-4">
              <div
                className="rounded-3xl border-2 border-dashed border-amber-200 bg-amber-50/40 p-5 text-center transition hover:border-amber-400"
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  handleLogoFile(event.dataTransfer.files?.[0]);
                }}
              >
                <div className="mx-auto flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-white text-xl font-black text-amber-900 shadow-sm">
                  {form.logoUrl ? <img src={form.logoUrl} alt={form.companyName} className="h-full w-full object-cover" /> : form.companyName.slice(0, 2).toUpperCase()}
                </div>
                <p className="mt-3 font-semibold">{t("dealer.settings.logoDropTitle")}</p>
                <p className="text-sm text-muted-foreground">{t("dealer.settings.logoDropDescription")}</p>
                <div className="mt-4 flex justify-center gap-2">
                  <Button type="button" className="bg-amber-700 hover:bg-amber-800" onClick={() => logoInputRef.current?.click()}>
                    <Upload className="mr-2 h-4 w-4" />
                    {t("dealer.premium.uploadLogo")}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setForm((prev) => ({ ...prev, logoUrl: "" }))}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t("dealer.settings.removeLogo")}
                  </Button>
                </div>
              </div>

              <div
                className="rounded-3xl border bg-white p-4"
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  handleCoverFile(event.dataTransfer.files?.[0]);
                }}
              >
                <div className="h-28 overflow-hidden rounded-2xl bg-gradient-to-r from-stone-900 to-amber-700">
                  {localSettings.coverUrl && <img src={localSettings.coverUrl} alt="Cover" className="h-full w-full object-cover" />}
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold">{t("dealer.settings.coverImage")}</p>
                    <p className="text-sm text-muted-foreground">{t("dealer.settings.coverHint")}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => coverInputRef.current?.click()}>
                      {t("dealer.settings.changeCover")}
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => updateLocalSettings((prev) => ({ ...prev, coverUrl: "" }))}>
                      {t("dealer.delete")}
                    </Button>
                  </div>
                </div>
                <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={(event) => handleCoverFile(event.target.files?.[0])} />
              </div>
            </div>
          )}

          {settingsModal === "workingHours" && (
            <div className="space-y-4">
              <div className="rounded-3xl border bg-amber-50 p-4">
                <p className="text-sm font-semibold text-amber-900">{t("dealer.hours.publicSummary")}</p>
                <p className="mt-1 text-2xl font-black text-amber-950">
                  {formatWorkingHoursShort(localSettings.workingHours, t)}
                </p>
                <p className="mt-1 text-sm text-amber-800">
                  {getTodayWorkingHours(localSettings.workingHours, t)}
                </p>
              </div>

              <div className="grid gap-3">
                {dayKeys.map((day) => {
                  const dayValue = localSettings.workingHours[day];
                  return (
                    <div key={day} className="grid gap-3 rounded-2xl border bg-white p-3 sm:grid-cols-[120px_1fr_1fr_auto] sm:items-center">
                      <p className="font-semibold">{t(`dealer.hours.${day}`)}</p>
                      <div className="space-y-1">
                        <Label className="text-xs">{t("dealer.hours.open")}</Label>
                        <Input
                          type="time"
                          value={dayValue.open}
                          disabled={dayValue.closed}
                          onChange={(event) =>
                            updateLocalSettings((prev) => ({
                              ...prev,
                              workingHours: {
                                ...prev.workingHours,
                                [day]: { ...prev.workingHours[day], open: event.target.value },
                              },
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">{t("dealer.hours.close")}</Label>
                        <Input
                          type="time"
                          value={dayValue.close}
                          disabled={dayValue.closed}
                          onChange={(event) =>
                            updateLocalSettings((prev) => ({
                              ...prev,
                              workingHours: {
                                ...prev.workingHours,
                                [day]: { ...prev.workingHours[day], close: event.target.value },
                              },
                            }))
                          }
                        />
                      </div>
                      <label className="flex items-center justify-between gap-3 rounded-xl bg-muted/40 px-3 py-2 text-sm font-medium sm:justify-start">
                        {t("dealer.hours.closed")}
                        <Switch
                          checked={dayValue.closed}
                          onCheckedChange={(checked) =>
                            updateLocalSettings((prev) => ({
                              ...prev,
                              workingHours: {
                                ...prev.workingHours,
                                [day]: { ...prev.workingHours[day], closed: checked },
                              },
                            }))
                          }
                        />
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {settingsModal === "socialLinks" && (
            <div className="space-y-4">
              <div className="rounded-3xl border bg-white p-4">
                <p className="font-semibold">{t("dealer.social.publicButtons")}</p>
                <p className="mt-1 text-sm text-muted-foreground">{t("dealer.social.emptyHidden")}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {Object.entries({
                    Web: form.website || localSettings.socialLinks.website,
                    Facebook: localSettings.socialLinks.facebook,
                    Instagram: localSettings.socialLinks.instagram,
                    TikTok: localSettings.socialLinks.tiktok,
                    YouTube: localSettings.socialLinks.youtube,
                  }).filter(([, value]) => value.trim()).map(([label, value]) => (
                    <a
                      key={label}
                      href={normalizeUrl(value)}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-900 hover:border-amber-300"
                    >
                      {label}
                    </a>
                  ))}
                </div>
              </div>

              <div className="grid gap-3">
                {[
                  ["website", t("dealer.social.website")],
                  ["facebook", "Facebook"],
                  ["instagram", "Instagram"],
                  ["tiktok", "TikTok"],
                  ["youtube", "YouTube"],
                ].map(([key, label]) => {
                  const value = key === "website" ? form.website || localSettings.socialLinks.website : localSettings.socialLinks[key as keyof DealerLocalSettings["socialLinks"]];
                  const invalid = !isValidUrl(value);
                  return (
                    <div key={key} className="space-y-2 rounded-2xl border bg-white p-3">
                      <Label>{label}</Label>
                      <Input
                        value={value}
                        placeholder="https://..."
                        className={invalid ? "border-red-300 bg-red-50" : ""}
                        onBlur={(event) => {
                          const normalized = normalizeUrl(event.target.value);
                          if (key === "website") {
                            setForm((prev) => ({ ...prev, website: normalized }));
                          } else {
                            updateLocalSettings((prev) => ({
                              ...prev,
                              socialLinks: { ...prev.socialLinks, [key]: normalized },
                            }));
                          }
                        }}
                        onChange={(event) => {
                          if (key === "website") {
                            setForm((prev) => ({ ...prev, website: event.target.value }));
                          } else {
                            updateLocalSettings((prev) => ({
                              ...prev,
                              socialLinks: { ...prev.socialLinks, [key]: event.target.value },
                            }));
                          }
                        }}
                      />
                      {invalid && <p className="text-xs text-red-600">{t("dealer.social.invalidUrl")}</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {settingsModal === "notifications" && (
            <div className="grid gap-3">
              {[
                ["email", t("dealer.settings.emailNotifications")],
                ["whatsapp", t("dealer.settings.whatsappNotifications")],
                ["telegram", t("dealer.settings.telegramNotifications")],
                ["newLead", t("dealer.settings.newLeadAlerts")],
                ["messages", t("dealer.settings.messageAlerts")],
                ["invoices", t("dealer.settings.invoiceAlerts")],
                ["promotions", t("dealer.settings.promotionAlerts")],
                ["sound", t("dealer.settings.soundVibration")],
              ].map(([key, label]) => (
                <div key={key} className="flex items-center justify-between rounded-2xl border bg-white p-3">
                  <span className="font-medium">{label}</span>
                  <Switch
                    checked={Boolean(localSettings.notifications[key as keyof DealerLocalSettings["notifications"]])}
                    onCheckedChange={(checked) =>
                      updateLocalSettings((prev) => ({
                        ...prev,
                        notifications: { ...prev.notifications, [key]: checked },
                      }))
                    }
                  />
                </div>
              ))}
            </div>
          )}

          {settingsModal === "integrations" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-2xl border bg-white p-3">
                <span className="font-medium">{t("dealer.settings.useSamePhone")}</span>
                <Switch
                  checked={localSettings.integrations.useSamePhone}
                  onCheckedChange={(checked) =>
                    updateLocalSettings((prev) => ({
                      ...prev,
                      integrations: { ...prev.integrations, useSamePhone: checked },
                    }))
                  }
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-[120px_1fr]">
                <div className="space-y-2">
                  <Label>{t("dealer.settings.countryCode")}</Label>
                  <Select
                    value={localSettings.integrations.countryCode}
                    onValueChange={(value) =>
                      updateLocalSettings((prev) => ({
                        ...prev,
                        integrations: { ...prev.integrations, countryCode: value },
                      }))
                    }
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="+420">CZ +420</SelectItem>
                      <SelectItem value="+421">SK +421</SelectItem>
                      <SelectItem value="+380">UA +380</SelectItem>
                      <SelectItem value="+49">DE +49</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {localSettings.integrations.useSamePhone ? (
                  <div className="space-y-2">
                    <Label>{t("dealer.settings.sharedPhone")}</Label>
                    <Input
                      value={localSettings.integrations.sharedPhone}
                      onChange={(event) =>
                        updateLocalSettings((prev) => ({
                          ...prev,
                          integrations: { ...prev.integrations, sharedPhone: event.target.value },
                        }))
                      }
                    />
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>{t("dealer.settings.whatsappNumber")}</Label>
                      <Input
                        value={localSettings.integrations.whatsappPhone}
                        onChange={(event) =>
                          updateLocalSettings((prev) => ({
                            ...prev,
                            integrations: { ...prev.integrations, whatsappPhone: event.target.value },
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("dealer.settings.telegramNumber")}</Label>
                      <Input
                        value={localSettings.integrations.telegramPhone}
                        onChange={(event) =>
                          updateLocalSettings((prev) => ({
                            ...prev,
                            integrations: { ...prev.integrations, telegramPhone: event.target.value },
                          }))
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
              {[
                ["whatsappConnected", "WhatsApp", MessageCircle],
                ["telegramConnected", "Telegram", Smartphone],
                ["crmConnected", "External CRM", Link2],
              ].map(([key, label, Icon]) => {
                const connected = Boolean(localSettings.integrations[key as keyof DealerLocalSettings["integrations"]]);
                const hasPhone = localSettings.integrations.useSamePhone
                  ? !!localSettings.integrations.sharedPhone.trim()
                  : key === "telegramConnected"
                    ? !!localSettings.integrations.telegramPhone.trim()
                    : !!localSettings.integrations.whatsappPhone.trim();
                const IntegrationIcon = Icon as typeof MessageCircle;
                return (
                  <div key={String(key)} className="flex items-center justify-between rounded-2xl border bg-white p-3">
                    <div className="flex items-center gap-3">
                      <IntegrationIcon className="h-4 w-4 text-amber-700" />
                      <div>
                        <p className="font-semibold">{String(label)}</p>
                        <p className="text-xs text-muted-foreground">{connected ? t("dealer.settings.connected") : t("dealer.settings.disconnected")}</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant={connected ? "outline" : "default"}
                      className={connected ? "" : "bg-amber-700 hover:bg-amber-800"}
                      disabled={!hasPhone && key !== "crmConnected"}
                      onClick={() => {
                        updateLocalSettings((prev) => ({
                          ...prev,
                          integrations: { ...prev.integrations, [key as string]: !connected },
                        }));
                        toast({ title: connected ? t("dealer.settings.disconnected") : t("dealer.settings.connectionSuccess") });
                      }}
                    >
                      {connected ? t("dealer.settings.disconnect") : t("dealer.settings.testConnect")}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}

          {settingsModal === "security" && (
            <div className="space-y-4">
              <div className="rounded-3xl border bg-white p-4">
                <h3 className="font-semibold">{t("dealer.settings.changePassword")}</h3>
                <div className="mt-3 grid gap-3">
                  {[
                    ["current", t("dealer.settings.currentPassword")],
                    ["next", t("dealer.settings.newPassword")],
                    ["confirm", t("dealer.settings.confirmPassword")],
                  ].map(([key, label]) => (
                    <div key={key} className="space-y-2">
                      <Label>{label}</Label>
                      <div className="relative">
                        <Input
                          type={passwordForm.show ? "text" : "password"}
                          value={passwordForm[key as keyof typeof passwordForm] as string}
                          onChange={(event) => setPasswordForm((prev) => ({ ...prev, [key]: event.target.value }))}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                          onClick={() => setPasswordForm((prev) => ({ ...prev, show: !prev.show }))}
                        >
                          {passwordForm.show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  ))}
                  {passwordForm.next.length > 0 && passwordForm.next.length < 6 && (
                    <p className="text-xs text-destructive">{t("dealer.account.passwordTooShort")}</p>
                  )}
                  {passwordForm.confirm.length > 0 && passwordForm.next !== passwordForm.confirm && (
                    <p className="text-xs text-destructive">{t("dealer.account.passwordsDoNotMatch")}</p>
                  )}
                  <Button
                    type="button"
                    className="bg-amber-700 hover:bg-amber-800"
                    disabled={
                      !passwordForm.current ||
                      passwordForm.next.length < 6 ||
                      passwordForm.next !== passwordForm.confirm ||
                      changePasswordMutation.isPending
                    }
                    onClick={() => changePasswordMutation.mutate()}
                  >
                    {changePasswordMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    {t("dealer.settings.savePassword")}
                  </Button>
                  <button
                    type="button"
                    className="w-full text-center text-xs font-medium text-amber-700 underline-offset-2 hover:underline disabled:opacity-60"
                    disabled={!authUser?.email || forgotPasswordMutation.isPending}
                    onClick={() => forgotPasswordMutation.mutate()}
                  >
                    {t("dealer.account.forgotPassword")}
                  </button>
                </div>
              </div>
              <div className="rounded-3xl border bg-white p-4">
                <h3 className="font-semibold">{t("dealer.settings.activeSessions")}</h3>
                <div className="mt-3 space-y-2">
                  {localSettings.security.sessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between rounded-2xl bg-muted/40 p-3">
                      <div className="flex items-center gap-3">
                        <MonitorSmartphone className="h-4 w-4 text-amber-700" />
                        <div>
                          <p className="font-medium">{session.device}</p>
                          <p className="text-xs text-muted-foreground">{session.location} · {session.lastActive}</p>
                        </div>
                      </div>
                      {session.current && <Badge>{t("dealer.settings.currentSession")}</Badge>}
                    </div>
                  ))}
                </div>
                <Button type="button" variant="outline" className="mt-3" onClick={() => toast({ title: t("dealer.settings.sessionsLoggedOut") })}>
                  <LogOut className="mr-2 h-4 w-4" />
                  {t("dealer.settings.logoutAllSessions")}
                </Button>
              </div>
              <div className="rounded-3xl border border-dashed bg-muted/30 p-4">
                <p className="font-semibold">2FA</p>
                <p className="text-sm text-muted-foreground">{t("dealer.settings.twoFactorNext")}</p>
              </div>
            </div>
          )}

          {settingsModal === "autoreplies" && (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-center justify-between rounded-2xl border bg-white p-3">
                  <span className="font-medium">{t("dealer.settings.autoReplyEnabled")}</span>
                  <Switch checked={localSettings.autoReplies.enabled} onCheckedChange={(checked) => updateLocalSettings((prev) => ({ ...prev, autoReplies: { ...prev.autoReplies, enabled: checked } }))} />
                </div>
                <div className="space-y-2 rounded-2xl border bg-white p-3">
                  <Label>{t("dealer.settings.replyDelay")}</Label>
                  <Input
                    type="number"
                    min={1}
                    value={localSettings.autoReplies.delayMinutes}
                    onChange={(event) => updateLocalSettings((prev) => ({ ...prev, autoReplies: { ...prev.autoReplies, delayMinutes: Number(event.target.value) || 1 } }))}
                  />
                </div>
                <div className="flex items-center justify-between rounded-2xl border bg-white p-3">
                  <span className="font-medium">WhatsApp auto reply</span>
                  <Switch checked={localSettings.autoReplies.whatsapp} onCheckedChange={(checked) => updateLocalSettings((prev) => ({ ...prev, autoReplies: { ...prev.autoReplies, whatsapp: checked } }))} />
                </div>
                <div className="flex items-center justify-between rounded-2xl border bg-white p-3">
                  <span className="font-medium">Telegram auto reply</span>
                  <Switch checked={localSettings.autoReplies.telegram} onCheckedChange={(checked) => updateLocalSettings((prev) => ({ ...prev, autoReplies: { ...prev.autoReplies, telegram: checked } }))} />
                </div>
              </div>
              <div className="rounded-3xl border bg-white p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-semibold">{t("dealer.settings.templates")}</h3>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      setEditingTemplateId(null);
                      setTemplateDraft({ title: "", message: "" });
                    }}
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    {t("dealer.settings.createTemplate")}
                  </Button>
                </div>
                <div className="space-y-2">
                  {localSettings.autoReplies.templates.length === 0 ? (
                    <div className="rounded-2xl border border-dashed p-5 text-center text-sm text-muted-foreground">{t("dealer.settings.noTemplates")}</div>
                  ) : localSettings.autoReplies.templates.map((template) => (
                    <div key={template.id} className="rounded-2xl bg-muted/40 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold">{template.title}</p>
                          <p className="mt-1 text-sm text-muted-foreground">{template.message}</p>
                        </div>
                        <div className="flex gap-1">
                          <Button type="button" variant="ghost" size="icon" onClick={() => {
                            setEditingTemplateId(template.id);
                            setTemplateDraft({ title: template.title, message: template.message });
                          }}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button type="button" variant="ghost" size="icon" onClick={() => updateLocalSettings((prev) => ({ ...prev, autoReplies: { ...prev.autoReplies, templates: prev.autoReplies.templates.filter((item) => item.id !== template.id) } }))}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t("dealer.settings.templateTitle")}</Label>
                  <Input value={templateDraft.title} onChange={(event) => setTemplateDraft((prev) => ({ ...prev, title: event.target.value }))} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>{t("dealer.settings.templateMessage")}</Label>
                  <Textarea rows={4} value={templateDraft.message} onChange={(event) => setTemplateDraft((prev) => ({ ...prev, message: event.target.value }))} />
                </div>
                <Button
                  type="button"
                  className="bg-amber-700 hover:bg-amber-800"
                  disabled={!templateDraft.title || !templateDraft.message}
                  onClick={() => {
                    updateLocalSettings((prev) => {
                      const nextTemplate = {
                        id: editingTemplateId || crypto.randomUUID(),
                        title: templateDraft.title,
                        message: templateDraft.message,
                      };
                      const templates = editingTemplateId
                        ? prev.autoReplies.templates.map((item) => item.id === editingTemplateId ? nextTemplate : item)
                        : [...prev.autoReplies.templates, nextTemplate];
                      return { ...prev, autoReplies: { ...prev.autoReplies, templates } };
                    });
                    setEditingTemplateId(null);
                    setTemplateDraft({ title: "", message: "" });
                    toast({ title: t("dealer.settings.templateSaved") });
                  }}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {t("dealer.settings.saveTemplate")}
                </Button>
              </div>
              <div className="rounded-3xl bg-amber-50 p-4">
                <p className="text-sm font-semibold">{t("dealer.settings.previewMessage")}</p>
                <p className="mt-2 text-sm text-amber-900">{templateDraft.message || localSettings.autoReplies.templates[0]?.message || t("dealer.settings.previewEmpty")}</p>
              </div>
            </div>
          )}

          {settingsModal === "billing" && (
            <div className="rounded-3xl border border-dashed bg-muted/30 p-6 text-center">
              <CreditCard className="mx-auto h-10 w-10 text-amber-700" />
              <p className="mt-3 font-semibold">{t("dealer.settings.billingNextPhase")}</p>
              <p className="mt-1 text-sm text-muted-foreground">{t("dealer.premium.billingDescription")}</p>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <div className="mr-auto flex items-center gap-2 text-sm text-muted-foreground">
              {settingsSaveState === "saving" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
              {settingsSaveState === "saving"
                ? t("dealer.premium.saving")
                : settingsSaveState === "dirty"
                  ? t("dealer.premium.unsavedChanges")
                  : t("dealer.premium.saved")}
            </div>
            <Button variant="outline" onClick={() => setSettingsModal(null)}>
              {t("dealer.cancel")}
            </Button>
            <Button className="bg-amber-700 hover:bg-amber-800" onClick={saveLocalSettingsNow}>
              {t("dealer.premium.saveChanges")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DashboardPeriodCompare({
  stats,
  todayViews,
  t,
}: {
  stats: DealerStats;
  todayViews: number;
  t: (key: string) => string;
}) {
  const items: Array<{
    label: string;
    value: string | number;
  }> = [
    {
      label: t("dealer.dashboard.today"),
      value: displayViews(todayViews),
    },
    {
      label: t("dealer.dashboard.weekShort"),
      value: displayViews(Math.round(stats.last30Days.views * 0.42)),
    },
    {
      label: t("dealer.dashboard.monthShort"),
      value: displayViews(stats.last30Days.views),
    },
    {
      label: t("dealer.dashboard.totalShort"),
      value: displayViews(stats.totalViews),
    },
  ];

  return (
    <Card className="rounded-3xl border-amber-100 bg-white/80 shadow-[0_10px_30px_rgba(120,72,12,0.06)]">
      <CardContent className="p-2">
        <div className="mb-1.5 flex items-center gap-2 px-1">
          <Eye className="h-4 w-4 text-amber-700" />
          <p className="text-sm font-black text-[#5c3b10]">{t("dealer.totalViews")}</p>
        </div>
        <div className="grid grid-cols-4 overflow-hidden rounded-2xl bg-[#fffaf0]">
          {items.map(({ label, value }) => (
            <div
              key={label}
              className="border-r border-amber-100 px-2 py-2 text-center last:border-r-0"
            >
              <p className="truncate text-[9px] font-bold uppercase tracking-wide text-[#8a641f]">
                {label}
              </p>
              <p className="mt-0.5 text-base font-black leading-tight text-[#4b2d08] sm:text-lg">
                {value}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function useDealerLocalStore(dealer: Dealer) {
  const key = `nnauto_dealer_settings_${dealer.id}`;
  const [settings, setSettings] = useState<DealerLocalSettings>(() =>
    createDefaultDealerLocalSettings(dealer),
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<DealerLocalSettings>;
        const defaults = createDefaultDealerLocalSettings(dealer);
        setSettings({
          ...defaults,
          ...parsed,
          microsite: { ...defaults.microsite, ...(parsed.microsite || {}) },
          reviews: { ...defaults.reviews, ...(parsed.reviews || {}) },
          billing: { ...defaults.billing, ...(parsed.billing || {}) },
        });
      }
    } catch {
      // ignore
    }
  }, [key, dealer]);

  const update = useCallback(
    (updater: (prev: DealerLocalSettings) => DealerLocalSettings) => {
      setSettings((prev) => {
        const next = updater(prev);
        try {
          localStorage.setItem(key, JSON.stringify(next));
          window.dispatchEvent(
            new CustomEvent("nnauto:dealer-settings-changed", { detail: { dealerId: dealer.id } }),
          );
        } catch {
          // ignore
        }
        return next;
      });
    },
    [key, dealer.id],
  );

  return [settings, update] as const;
}

function ReviewsTab({
  dealer,
  t,
}: {
  dealer: Dealer;
  t: (key: string) => string;
}) {
  const { toast } = useToast();
  const [settings, update] = useDealerLocalStore(dealer);
  const reviews = settings.reviews;
  const publicUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/dealer/${dealer.id}#reviews`;

  const visibleReviews = reviews.list.filter((review) => !review.hidden);
  const averageRating = visibleReviews.length
    ? visibleReviews.reduce((sum, review) => sum + review.rating, 0) / visibleReviews.length
    : 0;

  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: visibleReviews.filter((review) => Math.round(review.rating) === star).length,
  }));

  const copyReviewLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      toast({ title: t("dealer.premium.linkCopied") });
    } catch {
      toast({ title: t("dealer.premium.linkCopied") });
    }
  };

  const seedDemo = () => {
    const sample: DealerLocalSettings["reviews"]["list"] = [
      {
        id: `demo-${Date.now()}-1`,
        author: "Petr Novák",
        rating: 5,
        text: "Skvělé jednání, vůz přesně podle popisu. Doporučuji!",
        dateISO: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
      },
      {
        id: `demo-${Date.now()}-2`,
        author: "Markéta H.",
        rating: 4,
        text: "Profesionální přístup, jen jsme čekali na převod o den déle.",
        dateISO: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
        response: "Děkujeme za zpětnou vazbu, příště zrychlíme předání.",
      },
      {
        id: `demo-${Date.now()}-3`,
        author: "Jan Dvořák",
        rating: 5,
        text: "Cena férová, technický stav výborný. Velmi spokojen.",
        dateISO: new Date(Date.now() - 1000 * 60 * 60 * 24 * 28).toISOString(),
      },
    ];
    update((prev) => ({
      ...prev,
      reviews: {
        ...prev.reviews,
        list: [...sample, ...prev.reviews.list],
      },
    }));
    toast({ title: t("dealer.reviews.demoSeeded") });
  };

  const toggleVisibility = (id: string) => {
    update((prev) => ({
      ...prev,
      reviews: {
        ...prev.reviews,
        list: prev.reviews.list.map((review) =>
          review.id === id ? { ...review, hidden: !review.hidden } : review,
        ),
      },
    }));
  };

  const removeReview = (id: string) => {
    update((prev) => ({
      ...prev,
      reviews: {
        ...prev.reviews,
        list: prev.reviews.list.filter((review) => review.id !== id),
      },
    }));
    toast({ title: t("dealer.reviews.removed") });
  };

  const respondToReview = (id: string, response: string) => {
    update((prev) => ({
      ...prev,
      reviews: {
        ...prev.reviews,
        list: prev.reviews.list.map((review) =>
          review.id === id ? { ...review, response } : review,
        ),
      },
    }));
  };

  return (
    <div className="space-y-5">
      <Card className={`${premiumSurface} rounded-3xl`}>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Star className="h-5 w-5 text-amber-600" />
                {t("dealer.reviews.tab")}
              </CardTitle>
              <CardDescription>{t("dealer.reviews.headerDescription")}</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" className="rounded-2xl" onClick={copyReviewLink}>
                <Link2 className="mr-2 h-4 w-4" />
                {t("dealer.reviews.copyLink")}
              </Button>
              <Button className="rounded-2xl bg-amber-700 hover:bg-amber-800" onClick={seedDemo}>
                <Plus className="mr-2 h-4 w-4" />
                {t("dealer.reviews.addDemo")}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
            <div className="rounded-3xl border bg-amber-50/40 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-800">
                {t("dealer.reviews.overall")}
              </p>
              <div className="mt-2 flex items-end gap-2">
                <p className="text-5xl font-black">
                  {visibleReviews.length ? averageRating.toFixed(1) : "—"}
                </p>
                <div className="mb-2 flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star
                      key={idx}
                      className={`h-5 w-5 ${
                        idx < Math.round(averageRating)
                          ? "fill-amber-500 text-amber-500"
                          : "text-muted-foreground/40"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {visibleReviews.length} {t("dealer.reviews.totalReviews")}
              </p>
              <div className="mt-4 space-y-1.5">
                {distribution.map(({ star, count }) => {
                  const pct = visibleReviews.length ? (count / visibleReviews.length) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-2 text-xs">
                      <span className="w-6 font-bold">{star}★</span>
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-amber-100">
                        <div
                          className="h-full rounded-full bg-amber-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-6 text-right text-muted-foreground">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3 rounded-3xl border bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-bold">{t("dealer.reviews.publicVisibility")}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("dealer.reviews.publicVisibilityHint")}
                  </p>
                </div>
                <Switch
                  checked={reviews.enabled}
                  onCheckedChange={(checked) =>
                    update((prev) => ({
                      ...prev,
                      reviews: { ...prev.reviews, enabled: checked },
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-bold">{t("dealer.reviews.autoPublish")}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("dealer.reviews.autoPublishHint")}
                  </p>
                </div>
                <Switch
                  checked={reviews.autoPublish}
                  onCheckedChange={(checked) =>
                    update((prev) => ({
                      ...prev,
                      reviews: { ...prev.reviews, autoPublish: checked },
                    }))
                  }
                />
              </div>

              <div className="rounded-2xl border bg-amber-50/40 p-3 text-sm">
                <p className="mb-1 font-bold text-amber-900">{t("dealer.reviews.howItWorks")}</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• {t("dealer.reviews.tip1")}</li>
                  <li>• {t("dealer.reviews.tip2")}</li>
                  <li>• {t("dealer.reviews.tip3")}</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className={`${premiumSurface} rounded-3xl`}>
        <CardHeader>
          <CardTitle>{t("dealer.reviews.allReviews")}</CardTitle>
          <CardDescription>{t("dealer.reviews.allReviewsDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          {reviews.list.length === 0 ? (
            <div className="rounded-3xl border border-dashed p-8 text-center">
              <Star className="mx-auto mb-3 h-10 w-10 text-amber-400" />
              <p className="font-bold">{t("dealer.reviews.emptyTitle")}</p>
              <p className="mt-1 text-sm text-muted-foreground">{t("dealer.reviews.emptyHint")}</p>
              <div className="mt-4 flex justify-center gap-2">
                <Button variant="outline" className="rounded-2xl" onClick={copyReviewLink}>
                  <Link2 className="mr-2 h-4 w-4" />
                  {t("dealer.reviews.copyLink")}
                </Button>
                <Button className="rounded-2xl bg-amber-700 hover:bg-amber-800" onClick={seedDemo}>
                  <Plus className="mr-2 h-4 w-4" />
                  {t("dealer.reviews.addDemo")}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {reviews.list.map((review) => (
                <ReviewItem
                  key={review.id}
                  review={review}
                  t={t}
                  onToggleVisibility={() => toggleVisibility(review.id)}
                  onRemove={() => removeReview(review.id)}
                  onRespond={(text) => respondToReview(review.id, text)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ReviewItem({
  review,
  t,
  onToggleVisibility,
  onRemove,
  onRespond,
}: {
  review: DealerLocalSettings["reviews"]["list"][number];
  t: (key: string) => string;
  onToggleVisibility: () => void;
  onRemove: () => void;
  onRespond: (text: string) => void;
}) {
  const [responseDraft, setResponseDraft] = useState(review.response || "");
  const [editing, setEditing] = useState(false);

  return (
    <div className={`rounded-3xl border p-4 transition ${review.hidden ? "bg-muted/40 opacity-70" : "bg-white"}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-bold">{review.author}</p>
            <div className="flex">
              {Array.from({ length: 5 }).map((_, idx) => (
                <Star
                  key={idx}
                  className={`h-3.5 w-3.5 ${
                    idx < review.rating ? "fill-amber-500 text-amber-500" : "text-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              {new Date(review.dateISO).toLocaleDateString()}
            </span>
            {review.hidden ? (
              <Badge variant="outline" className="text-xs">
                {t("dealer.reviews.hiddenBadge")}
              </Badge>
            ) : null}
          </div>
          <p className="mt-2 text-sm text-foreground">{review.text}</p>
        </div>
        <div className="flex shrink-0 gap-1">
          <Button variant="ghost" size="sm" className="h-8 px-2" onClick={onToggleVisibility}>
            {review.hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="sm" className="h-8 px-2 text-red-600 hover:bg-red-50" onClick={onRemove}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {editing || review.response ? (
        <div className="mt-3 rounded-2xl border bg-amber-50/50 p-3">
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-amber-800">
            {t("dealer.reviews.dealerResponse")}
          </p>
          {editing ? (
            <>
              <Textarea
                value={responseDraft}
                onChange={(event) => setResponseDraft(event.target.value)}
                className="mb-2"
                rows={3}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="bg-amber-700 hover:bg-amber-800"
                  onClick={() => {
                    onRespond(responseDraft);
                    setEditing(false);
                  }}
                >
                  <Save className="mr-1 h-3.5 w-3.5" />
                  {t("dealer.reviews.saveResponse")}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setEditing(false)}>
                  {t("dealer.cancel")}
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm">{review.response}</p>
              <Button
                size="sm"
                variant="ghost"
                className="mt-1 h-7 px-2 text-xs"
                onClick={() => setEditing(true)}
              >
                <Pencil className="mr-1 h-3 w-3" />
                {t("dealer.reviews.editResponse")}
              </Button>
            </>
          )}
        </div>
      ) : (
        <Button
          size="sm"
          variant="outline"
          className="mt-3 rounded-xl"
          onClick={() => setEditing(true)}
        >
          <MessageCircle className="mr-1 h-3.5 w-3.5" />
          {t("dealer.reviews.respond")}
        </Button>
      )}
    </div>
  );
}

function MicrositeTab({
  dealer,
  t,
}: {
  dealer: Dealer;
  t: (key: string) => string;
}) {
  const { toast } = useToast();
  const [settings, update] = useDealerLocalStore(dealer);
  const microsite = settings.microsite;
  const heroFileRef = useRef<HTMLInputElement | null>(null);

  const slugCandidate = (microsite.slug || dealer.id.slice(0, 8)).toLowerCase().replace(/[^a-z0-9-]/g, "-");
  const publicPath = `/dealer/${dealer.id}`;
  const fullUrl =
    typeof window !== "undefined" ? `${window.location.origin}${publicPath}` : publicPath;
  const qrCodeSrc = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(fullUrl)}`;

  const handleHeroPick = () => heroFileRef.current?.click();
  const handleHeroFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      toast({ title: t("dealer.microsite.fileTooLarge"), variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      update((prev) => ({
        ...prev,
        microsite: { ...prev.microsite, heroPhoto: result },
      }));
      toast({ title: t("dealer.microsite.heroSaved") });
    };
    reader.readAsDataURL(file);
  };

  const removeHero = () =>
    update((prev) => ({
      ...prev,
      microsite: { ...prev.microsite, heroPhoto: "" },
    }));

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      toast({ title: t("dealer.premium.linkCopied") });
    } catch {
      toast({ title: t("dealer.premium.linkCopied") });
    }
  };

  return (
    <div className="space-y-5">
      <Card className={`${premiumSurface} rounded-3xl`}>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <MonitorSmartphone className="h-5 w-5 text-amber-700" />
                {t("dealer.microsite.tab")}
              </CardTitle>
              <CardDescription>{t("dealer.microsite.headerDescription")}</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" className="rounded-2xl" onClick={copyLink}>
                <Link2 className="mr-2 h-4 w-4" />
                {t("dealer.microsite.copyLink")}
              </Button>
              <Button
                className="rounded-2xl bg-amber-700 hover:bg-amber-800"
                onClick={() => window.open(publicPath, "_blank", "noopener,noreferrer")}
              >
                <Eye className="mr-2 h-4 w-4" />
                {t("dealer.microsite.preview")}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Card className={`${premiumSurface} rounded-3xl`}>
          <CardHeader>
            <CardTitle className="text-lg">{t("dealer.microsite.heroTitle")}</CardTitle>
            <CardDescription>{t("dealer.microsite.heroDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              type="file"
              accept="image/*"
              hidden
              ref={heroFileRef}
              onChange={handleHeroFile}
            />
            <button
              type="button"
              onClick={handleHeroPick}
              className="relative block aspect-[16/7] w-full overflow-hidden rounded-3xl border-2 border-dashed border-amber-200 bg-amber-50/30 transition hover:border-amber-300 hover:bg-amber-50"
            >
              {microsite.heroPhoto ? (
                <>
                  <img
                    src={microsite.heroPhoto}
                    alt={t("dealer.microsite.heroAlt")}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/60 to-transparent px-4 py-3 text-white">
                    <span className="text-sm font-bold">{t("dealer.microsite.heroChange")}</span>
                    <Pencil className="h-4 w-4" />
                  </div>
                </>
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-amber-800">
                  <ImageIcon className="h-10 w-10" />
                  <p className="text-base font-bold">{t("dealer.microsite.heroEmpty")}</p>
                  <p className="px-6 text-center text-xs text-muted-foreground">
                    {t("dealer.microsite.heroEmptyHint")}
                  </p>
                </div>
              )}
            </button>
            {microsite.heroPhoto ? (
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" className="rounded-2xl" onClick={handleHeroPick}>
                  <Upload className="mr-2 h-4 w-4" />
                  {t("dealer.microsite.heroUpload")}
                </Button>
                <Button
                  variant="ghost"
                  className="rounded-2xl text-red-600 hover:bg-red-50"
                  onClick={removeHero}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t("dealer.microsite.heroRemove")}
                </Button>
              </div>
            ) : (
              <Button className="rounded-2xl bg-amber-700 hover:bg-amber-800" onClick={handleHeroPick}>
                <Upload className="mr-2 h-4 w-4" />
                {t("dealer.microsite.heroUpload")}
              </Button>
            )}

            <div className="rounded-3xl border bg-white p-4">
              <Label className="mb-2 block">{t("dealer.microsite.aboutTitleLabel")}</Label>
              <Input
                value={microsite.aboutTitle}
                onChange={(event) =>
                  update((prev) => ({
                    ...prev,
                    microsite: { ...prev.microsite, aboutTitle: event.target.value },
                  }))
                }
                placeholder={t("dealer.microsite.aboutTitlePlaceholder")}
              />

              <Label className="mb-2 mt-4 block">{t("dealer.microsite.aboutTextLabel")}</Label>
              <Textarea
                value={microsite.aboutText}
                onChange={(event) =>
                  update((prev) => ({
                    ...prev,
                    microsite: { ...prev.microsite, aboutText: event.target.value },
                  }))
                }
                placeholder={t("dealer.microsite.aboutTextPlaceholder")}
                rows={6}
              />
              <p className="mt-2 text-xs text-muted-foreground">
                {microsite.aboutText.length} / 800
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className={`${premiumSurface} rounded-3xl`}>
          <CardHeader>
            <CardTitle className="text-lg">{t("dealer.microsite.shareTitle")}</CardTitle>
            <CardDescription>{t("dealer.microsite.shareDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-3xl border bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {t("dealer.microsite.publicUrl")}
              </p>
              <p className="mt-1 break-all text-sm font-bold text-amber-800">{fullUrl}</p>
              <Button
                variant="outline"
                className="mt-3 w-full rounded-2xl"
                onClick={copyLink}
              >
                <Copy className="mr-2 h-4 w-4" />
                {t("dealer.microsite.copyLink")}
              </Button>
            </div>

            <div className="rounded-3xl border bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {t("dealer.microsite.qrCode")}
              </p>
              <div className="mt-3 flex justify-center">
                <img
                  src={qrCodeSrc}
                  alt={t("dealer.microsite.qrCode")}
                  className="h-40 w-40 rounded-2xl border bg-white p-2"
                  loading="lazy"
                />
              </div>
              <Button
                variant="outline"
                className="mt-3 w-full rounded-2xl"
                onClick={() => window.open(qrCodeSrc, "_blank", "noopener,noreferrer")}
              >
                <Download className="mr-2 h-4 w-4" />
                {t("dealer.microsite.qrDownload")}
              </Button>
            </div>

            <div className="space-y-3 rounded-3xl border bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {t("dealer.microsite.sectionsTitle")}
              </p>
              {[
                { key: "showAbout", label: t("dealer.microsite.showAbout") },
                { key: "showInventory", label: t("dealer.microsite.showInventory") },
                { key: "showReviews", label: t("dealer.microsite.showReviews") },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between gap-3 text-sm">
                  <span>{label}</span>
                  <Switch
                    checked={Boolean(microsite[key as "showAbout" | "showInventory" | "showReviews"])}
                    onCheckedChange={(checked) =>
                      update((prev) => ({
                        ...prev,
                        microsite: { ...prev.microsite, [key]: checked },
                      }))
                    }
                  />
                </div>
              ))}
            </div>

            <div className="rounded-3xl border bg-amber-50/40 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold">{t("dealer.microsite.customDomain")}</p>
                <Switch
                  checked={microsite.customDomainEnabled}
                  onCheckedChange={(checked) =>
                    update((prev) => ({
                      ...prev,
                      microsite: { ...prev.microsite, customDomainEnabled: checked },
                    }))
                  }
                />
              </div>
              <Input
                disabled={!microsite.customDomainEnabled}
                value={microsite.customDomain}
                onChange={(event) =>
                  update((prev) => ({
                    ...prev,
                    microsite: { ...prev.microsite, customDomain: event.target.value },
                  }))
                }
                placeholder="autosalon.cz"
                className="mt-3"
              />
              <p className="mt-2 text-xs text-muted-foreground">
                {t("dealer.microsite.customDomainHint")}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className={`${premiumSurface} rounded-3xl`}>
        <CardHeader>
          <CardTitle className="text-lg">{t("dealer.microsite.previewTitle")}</CardTitle>
          <CardDescription>{t("dealer.microsite.previewDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-3xl border">
            <div
              className="relative h-44 bg-cover bg-center sm:h-56"
              style={{
                backgroundImage: microsite.heroPhoto
                  ? `linear-gradient(rgba(0,0,0,0.25), rgba(0,0,0,0.55)), url(${microsite.heroPhoto})`
                  : "linear-gradient(135deg, #1f1408 0%, #3d260c 45%, #8a5a14 100%)",
              }}
            >
              <div className="absolute inset-x-4 bottom-4 text-white sm:inset-x-6 sm:bottom-6">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-200">
                  {dealer.region || "Česko"}
                </p>
                <h3 className="text-xl font-black sm:text-3xl">
                  {microsite.aboutTitle || dealer.companyName}
                </h3>
              </div>
            </div>
            <div className="space-y-3 bg-white p-4 sm:p-6">
              <p className="text-sm text-muted-foreground">
                {microsite.aboutText || dealer.description || t("dealer.microsite.descriptionPlaceholder")}
              </p>
              <div className="flex flex-wrap gap-2 text-xs">
                {microsite.showAbout ? (
                  <Badge variant="outline">{t("dealer.microsite.sectionAbout")}</Badge>
                ) : null}
                {microsite.showInventory ? (
                  <Badge variant="outline">{t("dealer.microsite.sectionInventory")}</Badge>
                ) : null}
                {microsite.showReviews ? (
                  <Badge variant="outline">{t("dealer.microsite.sectionReviews")}</Badge>
                ) : null}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Lightweight, dependency-free card helpers for the billing card form.
// This stores only brand / last4 / expiry locally — never the full PAN or CVC.
function detectCardBrand(digits: string): string {
  if (/^4/.test(digits)) return "VISA";
  if (/^(5[1-5]|2(2[2-9]|[3-6]|7[01]|720))/.test(digits)) return "Mastercard";
  if (/^3[47]/.test(digits)) return "American Express";
  if (/^(6011|65|64[4-9]|622)/.test(digits)) return "Discover";
  if (/^3(0[0-5]|[68])/.test(digits)) return "Diners Club";
  if (/^35/.test(digits)) return "JCB";
  return "Karta";
}

function luhnValid(digits: string): boolean {
  if (digits.length < 12) return false;
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = Number(digits[i]);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 19);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

function formatCardExpiry(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function expiryInFuture(expiry: string): boolean {
  const m = expiry.match(/^(\d{2})\/(\d{2})$/);
  if (!m) return false;
  const month = Number(m[1]);
  const year = 2000 + Number(m[2]);
  if (month < 1 || month > 12) return false;
  const end = new Date(year, month, 1).getTime();
  return end > Date.now();
}

function BillingTab({
  dealer,
  t,
}: {
  dealer: Dealer;
  t: (key: string) => string;
}) {
  const { toast } = useToast();
  const [settings, update] = useDealerLocalStore(dealer);
  const billing = settings.billing;
  const packagesRef = useRef<HTMLDivElement>(null);

  type PaymentMethodType =
    | "card"
    | "bank"
    | "qr"
    | "applepay"
    | "googlepay"
    | "paypal";

  const [cardDialogOpen, setCardDialogOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] =
    useState<PaymentMethodType>("card");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardName, setCardName] = useState("");
  const [bankIban, setBankIban] = useState("");
  const [bankHolder, setBankHolder] = useState("");
  const [paypalEmail, setPaypalEmail] = useState("");
  const [cardError, setCardError] = useState<string | null>(null);

  const openCardDialog = () => {
    setSelectedMethod(billing.paymentType ?? "card");
    setCardNumber("");
    setCardExpiry("");
    setCardCvc("");
    setCardName("");
    setBankIban("");
    setBankHolder("");
    setPaypalEmail("");
    setCardError(null);
    setCardDialogOpen(true);
  };

  const clearPaymentFields = (prevBilling: DealerLocalSettings["billing"]) => ({
    ...prevBilling,
    paymentBrand: "",
    paymentLast4: "",
    paymentExpires: "",
    paymentIban: "",
    paymentHolder: "",
    paymentEmail: "",
  });

  const saveMethod = () => {
    if (selectedMethod === "card") {
      const digits = cardNumber.replace(/\D/g, "");
      if (!luhnValid(digits)) {
        setCardError(t("dealer.billing.cardErrorNumber"));
        return;
      }
      if (!expiryInFuture(cardExpiry)) {
        setCardError(t("dealer.billing.cardErrorExpiry"));
        return;
      }
      if (cardCvc.replace(/\D/g, "").length < 3) {
        setCardError(t("dealer.billing.cardErrorCvc"));
        return;
      }
      const brand = detectCardBrand(digits);
      update((prev) => ({
        ...prev,
        billing: {
          ...clearPaymentFields(prev.billing),
          paymentType: "card",
          paymentBrand: brand,
          paymentLast4: digits.slice(-4),
          paymentExpires: cardExpiry,
          paymentHolder: cardName.trim(),
        },
      }));
      setCardDialogOpen(false);
      toast({
        title: t("dealer.billing.methodSaved"),
        description: `${brand} •••• ${digits.slice(-4)}`,
      });
      return;
    }

    if (selectedMethod === "bank") {
      const iban = bankIban.replace(/\s+/g, "").toUpperCase();
      if (iban.length < 15 || !/^[A-Z]{2}[0-9A-Z]+$/.test(iban)) {
        setCardError(t("dealer.billing.methodErrorIban"));
        return;
      }
      update((prev) => ({
        ...prev,
        billing: {
          ...clearPaymentFields(prev.billing),
          paymentType: "bank",
          paymentIban: iban,
          paymentHolder: bankHolder.trim(),
        },
      }));
      setCardDialogOpen(false);
      toast({
        title: t("dealer.billing.methodSaved"),
        description: `${t("dealer.billing.methodBank")} •••• ${iban.slice(-4)}`,
      });
      return;
    }

    if (selectedMethod === "paypal") {
      const email = paypalEmail.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setCardError(t("dealer.billing.methodErrorEmail"));
        return;
      }
      update((prev) => ({
        ...prev,
        billing: {
          ...clearPaymentFields(prev.billing),
          paymentType: "paypal",
          paymentEmail: email,
        },
      }));
      setCardDialogOpen(false);
      toast({
        title: t("dealer.billing.methodSaved"),
        description: `PayPal · ${email}`,
      });
      return;
    }

    // qr / applepay / googlepay — no extra fields, just activate.
    const label =
      selectedMethod === "qr"
        ? t("dealer.billing.methodQr")
        : selectedMethod === "applepay"
          ? t("dealer.billing.methodApplePay")
          : t("dealer.billing.methodGooglePay");
    update((prev) => ({
      ...prev,
      billing: {
        ...clearPaymentFields(prev.billing),
        paymentType: selectedMethod,
      },
    }));
    setCardDialogOpen(false);
    toast({
      title: t("dealer.billing.methodSaved"),
      description: label,
    });
  };

  const formatKc = (amount: number) =>
    new Intl.NumberFormat("cs-CZ", { style: "currency", currency: "CZK", maximumFractionDigits: 0 }).format(amount);

  const scrollToPackages = () =>
    packagesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  // Annual vehicle packages: fixed yearly price; per-vehicle price is derived
  // from the package total so the headline price stays stable.
  const vehiclePackages: Array<{
    id: string;
    nameKey: string;
    cars: number;
    priceKc: number;
    popular?: boolean;
  }> = [
    { id: "start", nameKey: "dealer.billing.packageStart", cars: 150, priceKc: 3000 },
    { id: "business", nameKey: "dealer.billing.packageBusiness", cars: 350, priceKc: 4500, popular: true },
    { id: "pro", nameKey: "dealer.billing.packagePro", cars: 750, priceKc: 6000 },
  ];

  const activatePackage = (pkg: (typeof vehiclePackages)[number]) => {
    const total = pkg.priceKc;
    const activatedISO = new Date().toISOString();
    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 1);
    const expiresISO = expires.toISOString();
    update((prev) => ({
      ...prev,
      billing: {
        ...prev.billing,
        activePackage: { id: pkg.id, activatedISO, expiresISO },
        invoices: [
          {
            id: `inv-${Date.now()}`,
            number: `2026-P-${String(prev.billing.invoices.length + 1).padStart(4, "0")}`,
            dateISO: activatedISO,
            amountKc: total,
            status: "paid",
            description: `${t("dealer.billing.packageInvoiceLine")}: ${t(pkg.nameKey)} (${pkg.cars} ${t("dealer.billing.carsUnit")})`,
          },
          ...prev.billing.invoices,
        ],
      },
    }));
    toast({
      title: t("dealer.billing.packageActivated"),
      description: `${t(pkg.nameKey)} · ${t("dealer.billing.activeUntil")} ${expires.toLocaleDateString("cs-CZ")}`,
    });
  };

  const activePkg = billing.activePackage
    ? vehiclePackages.find((p) => p.id === billing.activePackage?.id) ?? null
    : null;

  return (
    <div className="space-y-5">
      <Card className={`${premiumSurface} rounded-3xl overflow-hidden`}>
        <div className="bg-gradient-to-br from-amber-700 via-amber-800 to-stone-950 p-4 text-white sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {activePkg && billing.activePackage ? (
              <>
                <div>
                  <Badge className="mb-2 bg-white/20 text-white hover:bg-white/30">
                    {t("dealer.billing.activePackageLabel")}
                  </Badge>
                  <h2 className="text-2xl font-black sm:text-3xl">
                    {t(activePkg.nameKey)}
                    <span className="ml-3 align-middle text-base font-bold text-amber-200">
                      {activePkg.cars} {t("dealer.billing.carsUnit")}
                    </span>
                  </h2>
                  <p className="mt-2 flex items-center gap-2 text-sm text-amber-50/80">
                    <CalendarDays className="h-4 w-4" />
                    {t("dealer.billing.activeUntil")}{" "}
                    {new Date(billing.activePackage.expiresISO).toLocaleDateString("cs-CZ")}
                  </p>
                </div>
                <Button
                  variant="secondary"
                  className="h-11 rounded-2xl bg-white text-amber-900 hover:bg-amber-50"
                  onClick={scrollToPackages}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  {t("dealer.billing.changePackage")}
                </Button>
              </>
            ) : (
              <>
                <div>
                  <Badge className="mb-2 bg-white/20 text-white hover:bg-white/30">
                    {t("dealer.billing.noActivePackage")}
                  </Badge>
                  <h2 className="text-2xl font-black sm:text-3xl">{t("dealer.billing.packagesTitle")}</h2>
                  <p className="mt-2 max-w-2xl text-sm text-amber-50/80">
                    {t("dealer.billing.heroPrompt")}
                  </p>
                </div>
                <Button
                  variant="secondary"
                  className="h-11 rounded-2xl bg-white text-amber-900 hover:bg-amber-50"
                  onClick={scrollToPackages}
                >
                  <Crown className="mr-2 h-4 w-4" />
                  {t("dealer.billing.choosePackage")}
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>

      <Card ref={packagesRef} className={`${premiumSurface} rounded-3xl scroll-mt-4`}>
        <CardHeader className="p-4 pb-2 sm:p-6 sm:pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Crown className="h-5 w-5 text-amber-700" />
            {t("dealer.billing.packagesTitle")}
          </CardTitle>
          <CardDescription>{t("dealer.billing.packagesDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
          <div className="grid gap-3 sm:gap-4 lg:grid-cols-3">
            {vehiclePackages.map((pkg) => {
              const total = pkg.priceKc;
              const pricePerCar = Math.round(pkg.priceKc / pkg.cars);
              const isActive = billing.activePackage?.id === pkg.id;
              return (
                <div
                  key={pkg.id}
                  className={`relative flex flex-col rounded-3xl border p-5 transition-all duration-200 ${
                    pkg.popular
                      ? "border-amber-300 bg-amber-50/50 shadow-[0_18px_55px_rgba(120,72,12,0.12)]"
                      : "border-amber-100 bg-white"
                  } ${isActive ? "ring-2 ring-amber-500 ring-offset-2" : "hover:-translate-y-0.5 hover:shadow-[0_22px_70px_rgba(120,72,12,0.12)]"}`}
                >
                  {pkg.popular && !isActive && (
                    <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-amber-700 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-white shadow-sm">
                      <Sparkles className="h-3 w-3" />
                      {t("dealer.billing.mostPopular")}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-white shadow-sm">
                      <CheckCircle2 className="h-3 w-3" />
                      {t("dealer.billing.packageActive")}
                    </span>
                  )}

                  <p className="text-sm font-black uppercase tracking-wide text-amber-800">{t(pkg.nameKey)}</p>

                  <div className="mt-3 flex items-end gap-1">
                    <span className="text-3xl font-black text-[#5c3b10]">{formatKc(total)}</span>
                    <span className="mb-1 text-xs font-semibold text-muted-foreground">/ {t("dealer.billing.perYear")}</span>
                  </div>

                  <div className="mt-3 space-y-2 text-sm">
                    <p className="flex items-center gap-2 text-[#5c3b10]">
                      <Car className="h-4 w-4 text-amber-700" />
                      <span><span className="font-black">{pkg.cars}</span> {t("dealer.billing.carsUnit")}</span>
                    </p>
                    <p className="flex items-center gap-2 text-[#5c3b10]">
                      <Wallet className="h-4 w-4 text-amber-700" />
                      <span><span className="font-black">{formatKc(pricePerCar)}</span> / {t("dealer.billing.perCar")}</span>
                    </p>
                    <p className="flex items-center gap-2 text-emerald-700">
                      <CalendarDays className="h-4 w-4" />
                      {t("dealer.billing.activeOneYear")}
                    </p>
                  </div>

                  {isActive && billing.activePackage ? (
                    <Button disabled className="mt-5 w-full rounded-2xl bg-emerald-600 text-white hover:bg-emerald-600">
                      <Check className="mr-2 h-4 w-4" />
                      {t("dealer.billing.activeUntil")} {new Date(billing.activePackage.expiresISO).toLocaleDateString("cs-CZ")}
                    </Button>
                  ) : (
                    <Button
                      className={`mt-5 w-full rounded-2xl ${pkg.popular ? "bg-amber-700 hover:bg-amber-800" : "bg-[#6f4c17] hover:bg-[#5c3b10]"}`}
                      onClick={() => activatePackage(pkg)}
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      {t("dealer.billing.choosePackage")}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className={`${premiumSurface} rounded-3xl`}>
        <CardHeader className="p-4 pb-2 sm:p-6 sm:pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CreditCard className="h-5 w-5 text-amber-700" />
            {t("dealer.billing.paymentMethodTitle")}
          </CardTitle>
          <CardDescription>{t("dealer.billing.paymentMethodDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-4 pt-0 sm:p-6 sm:pt-0">
          {(() => {
            const effectiveType: PaymentMethodType | null =
              billing.paymentType ?? (billing.paymentLast4 ? "card" : null);

            if (!effectiveType) {
              return (
                <div className="rounded-3xl border border-dashed p-6 text-center">
                  <CreditCard className="mx-auto mb-3 h-10 w-10 text-amber-600" />
                  <p className="font-bold">{t("dealer.billing.noPaymentMethod")}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t("dealer.billing.noPaymentMethodHint")}
                  </p>
                </div>
              );
            }

            if (effectiveType === "card") {
              return (
                <div className="rounded-3xl border bg-gradient-to-br from-stone-900 to-stone-700 p-5 text-white">
                  <p className="text-xs uppercase tracking-[0.2em] text-stone-300">
                    {billing.paymentBrand || "VISA"}
                  </p>
                  <p className="mt-3 text-2xl font-mono tracking-wider">
                    •••• •••• •••• {billing.paymentLast4}
                  </p>
                  <p className="mt-3 text-xs text-stone-300">
                    {t("dealer.billing.expires")}: {billing.paymentExpires || "12/28"}
                  </p>
                </div>
              );
            }

            const methodMeta: Record<
              Exclude<PaymentMethodType, "card">,
              { icon: any; labelKey: string; detail?: string }
            > = {
              bank: {
                icon: Landmark,
                labelKey: "dealer.billing.methodBank",
                detail: billing.paymentIban
                  ? `IBAN •••• ${billing.paymentIban.slice(-4)}`
                  : billing.paymentHolder,
              },
              qr: { icon: QrCode, labelKey: "dealer.billing.methodQr" },
              applepay: {
                icon: Smartphone,
                labelKey: "dealer.billing.methodApplePay",
              },
              googlepay: {
                icon: Wallet,
                labelKey: "dealer.billing.methodGooglePay",
              },
              paypal: {
                icon: Mail,
                labelKey: "dealer.billing.methodPaypal",
                detail: billing.paymentEmail,
              },
            };

            const meta = methodMeta[effectiveType];
            const Icon = meta.icon;
            return (
              <div className="flex items-center gap-4 rounded-3xl border bg-gradient-to-br from-stone-900 to-stone-700 p-5 text-white">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10">
                  <Icon className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-base font-bold">{t(meta.labelKey)}</p>
                  {meta.detail && (
                    <p className="mt-1 text-xs text-stone-300">{meta.detail}</p>
                  )}
                </div>
              </div>
            );
          })()}
          <Button
            variant="outline"
            className="w-full rounded-2xl"
            onClick={openCardDialog}
          >
            <Plus className="mr-2 h-4 w-4" />
            {billing.paymentType || billing.paymentLast4
              ? t("dealer.billing.changePaymentMethod")
              : t("dealer.billing.addPaymentMethod")}
          </Button>
        </CardContent>
      </Card>

      <Dialog open={cardDialogOpen} onOpenChange={setCardDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-amber-700" />
              {t("dealer.billing.choosePaymentMethodTitle")}
            </DialogTitle>
            <DialogDescription>
              {t("dealer.billing.choosePaymentMethodDescription")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: "card", icon: CreditCard, labelKey: "dealer.billing.methodCard" },
                  { id: "bank", icon: Landmark, labelKey: "dealer.billing.methodBank" },
                  { id: "qr", icon: QrCode, labelKey: "dealer.billing.methodQr" },
                  { id: "applepay", icon: Smartphone, labelKey: "dealer.billing.methodApplePay" },
                  { id: "googlepay", icon: Wallet, labelKey: "dealer.billing.methodGooglePay" },
                  { id: "paypal", icon: Mail, labelKey: "dealer.billing.methodPaypal" },
                ] as Array<{ id: PaymentMethodType; icon: any; labelKey: string }>
              ).map((m) => {
                const Icon = m.icon;
                const active = selectedMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setSelectedMethod(m.id);
                      setCardError(null);
                    }}
                    className={`flex flex-col items-center gap-1.5 rounded-2xl border p-3 text-center text-xs font-semibold transition-all ${
                      active
                        ? "border-amber-500 bg-amber-50 text-amber-900 ring-2 ring-amber-500/40"
                        : "border-amber-100 bg-white text-stone-600 hover:border-amber-300"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {t(m.labelKey)}
                  </button>
                );
              })}
            </div>

            {selectedMethod === "card" && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="card-number">{t("dealer.billing.cardNumber")}</Label>
                  <Input
                    id="card-number"
                    inputMode="numeric"
                    autoComplete="cc-number"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(e) => {
                      setCardNumber(formatCardNumber(e.target.value));
                      setCardError(null);
                    }}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="card-name">{t("dealer.billing.cardHolder")}</Label>
                  <Input
                    id="card-name"
                    autoComplete="cc-name"
                    placeholder="Jan Novák"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="card-expiry">{t("dealer.billing.cardExpiry")}</Label>
                    <Input
                      id="card-expiry"
                      inputMode="numeric"
                      autoComplete="cc-exp"
                      placeholder="MM/RR"
                      value={cardExpiry}
                      onChange={(e) => {
                        setCardExpiry(formatCardExpiry(e.target.value));
                        setCardError(null);
                      }}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="card-cvc">{t("dealer.billing.cardCvc")}</Label>
                    <Input
                      id="card-cvc"
                      inputMode="numeric"
                      autoComplete="cc-csc"
                      placeholder="123"
                      value={cardCvc}
                      onChange={(e) => {
                        setCardCvc(e.target.value.replace(/\D/g, "").slice(0, 4));
                        setCardError(null);
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {selectedMethod === "bank" && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {t("dealer.billing.bankInfo")}
                </p>
                <div className="space-y-1.5">
                  <Label htmlFor="bank-iban">{t("dealer.billing.bankIban")}</Label>
                  <Input
                    id="bank-iban"
                    placeholder="CZ65 0800 0000 1920 0014 5399"
                    value={bankIban}
                    onChange={(e) => {
                      setBankIban(e.target.value.toUpperCase());
                      setCardError(null);
                    }}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="bank-holder">{t("dealer.billing.bankHolder")}</Label>
                  <Input
                    id="bank-holder"
                    placeholder="Jan Novák"
                    value={bankHolder}
                    onChange={(e) => setBankHolder(e.target.value)}
                  />
                </div>
              </div>
            )}

            {selectedMethod === "paypal" && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {t("dealer.billing.paypalInfo")}
                </p>
                <div className="space-y-1.5">
                  <Label htmlFor="paypal-email">{t("dealer.billing.paypalEmail")}</Label>
                  <Input
                    id="paypal-email"
                    type="email"
                    inputMode="email"
                    placeholder="name@example.com"
                    value={paypalEmail}
                    onChange={(e) => {
                      setPaypalEmail(e.target.value);
                      setCardError(null);
                    }}
                  />
                </div>
              </div>
            )}

            {(selectedMethod === "qr" ||
              selectedMethod === "applepay" ||
              selectedMethod === "googlepay") && (
              <div className="rounded-2xl border border-dashed bg-amber-50/40 p-4 text-center text-sm text-muted-foreground">
                {t("dealer.billing.walletInfo")}
              </div>
            )}

            {cardError && (
              <p className="text-sm font-medium text-red-600">{cardError}</p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCardDialogOpen(false)}>
              {t("dealer.billing.cardCancel")}
            </Button>
            <Button
              className="bg-amber-700 hover:bg-amber-800"
              onClick={saveMethod}
            >
              {t("dealer.billing.saveMethod")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className={`${premiumSurface} rounded-3xl`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileSpreadsheet className="h-5 w-5 text-amber-700" />
            {t("dealer.billing.invoicesTitle")}
          </CardTitle>
          <CardDescription>{t("dealer.billing.invoicesDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          {billing.invoices.length === 0 ? (
            <div className="rounded-3xl border border-dashed p-8 text-center">
              <FileSpreadsheet className="mx-auto mb-3 h-10 w-10 text-amber-600" />
              <p className="font-bold">{t("dealer.billing.noInvoices")}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("dealer.billing.noInvoicesHint")}
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-3xl border bg-white">
              <table className="w-full text-sm">
                <thead className="border-b bg-amber-50/40 text-xs uppercase tracking-wide text-amber-800">
                  <tr>
                    <th className="px-4 py-3 text-left">{t("dealer.billing.invoiceNumber")}</th>
                    <th className="px-4 py-3 text-left">{t("dealer.billing.invoiceDate")}</th>
                    <th className="px-4 py-3 text-left">{t("dealer.billing.invoiceDescription")}</th>
                    <th className="px-4 py-3 text-right">{t("dealer.billing.invoiceAmount")}</th>
                    <th className="px-4 py-3 text-center">{t("dealer.billing.invoiceStatus")}</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {billing.invoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b last:border-0 hover:bg-amber-50/40">
                      <td className="px-4 py-3 font-bold">{invoice.number}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(invoice.dateISO).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">{invoice.description}</td>
                      <td className="px-4 py-3 text-right font-bold">{formatKc(invoice.amountKc)}</td>
                      <td className="px-4 py-3 text-center">
                        <Badge
                          className={
                            invoice.status === "paid"
                              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                              : invoice.status === "pending"
                                ? "bg-amber-100 text-amber-800 hover:bg-amber-100"
                                : "bg-red-100 text-red-700 hover:bg-red-100"
                          }
                        >
                          {t(`dealer.billing.status_${invoice.status}`)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2"
                          title={t("dealer.billing.download") || "Stáhnout"}
                          onClick={() => {
                            const lines = [
                              `Faktura: ${invoice.number}`,
                              `Datum: ${new Date(invoice.dateISO).toLocaleDateString()}`,
                              `Popis: ${invoice.description}`,
                              `Částka: ${formatKc(invoice.amountKc)}`,
                              `Stav: ${t(`dealer.billing.status_${invoice.status}`)}`,
                            ].join("\n");
                            const blob = new Blob([lines], {
                              type: "text/plain;charset=utf-8",
                            });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = `${invoice.number}.txt`;
                            a.click();
                            URL.revokeObjectURL(url);
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function DealerPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const t = useTranslation();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<DealerTab>("dashboard");
  const [importSub, setImportSub] = useState<ImportSyncSubTab>("csv");
  const [profileSubTab, setProfileSubTab] = useState<DealerProfileSubTab>("info");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const openImportSync = useCallback((next: ImportSyncSubTab) => {
    setImportSub(next);
    setActiveTab("import");
  }, []);
  const openWebProfile = useCallback(() => {
    setProfileSubTab("web");
    setSettingsTarget(null);
    setActiveTab("settings");
  }, []);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tab === "web-profile" || tab === "web") {
      setProfileSubTab("web");
      setActiveTab("settings");
    }
  }, []);
  const [settingsTarget, setSettingsTarget] = useState<SettingsTarget | null>(null);
  const [addVehicleDialogOpen, setAddVehicleDialogOpen] = useState(false);
  const [addVehiclePreference, setAddVehiclePreference] =
    useState<AddVehiclePreference>(() => {
      if (typeof window === "undefined") return "single";
      return (
        (localStorage.getItem("nnauto_dealer_add_vehicle_preference") as AddVehiclePreference | null) ||
        "single"
      );
    });

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dealer/stats"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/dealer/stats");
      return res.json();
    },
    enabled: !!user?.isDealer,
  });
  const stats = statsData?.stats as DealerStats | undefined;
  const dealer = statsData?.dealer as Dealer | undefined;
  const openSettingsTarget = useCallback((target: SettingsTarget) => {
    setActiveTab("settings");
    setSettingsTarget(target);
  }, []);
  const openPublicProfile = useCallback(() => {
    if (!dealer?.id) return;
    window.open(`/dealer/${dealer.id}?from=cabinet`, "_blank", "noopener,noreferrer");
  }, [dealer?.id]);
  const sharePublicProfile = useCallback(async () => {
    if (!dealer?.id) return;
    const url = `${window.location.origin}/dealer/${dealer.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: dealer.companyName, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast({ title: t("dealer.premium.linkCopied") });
      }
    } catch {
      await navigator.clipboard.writeText(url);
      toast({ title: t("dealer.premium.linkCopied") });
    }
  }, [dealer?.companyName, dealer?.id, t, toast]);
  const openAddVehicleDialog = useCallback(() => {
    setAddVehicleDialogOpen(true);
  }, []);
  const chooseAddVehicleFlow = useCallback((mode: AddVehiclePreference) => {
    setAddVehiclePreference(mode);
    localStorage.setItem("nnauto_dealer_add_vehicle_preference", mode);
    setAddVehicleDialogOpen(false);
    if (mode === "bulk") {
      setImportSub("csv");
      setActiveTab("import");
      window.setTimeout(() => {
        document
          .getElementById("dealer-bulk-import-upload")
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 150);
      return;
    }
    navigate("/add-listing");
  }, [navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-700" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <DealerAuthPromptPage />;
  }

  if (!user?.isDealer) {
    return <DealerRegistrationPage />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SEO title={t("dealer.cabinet")} noindex />
      <Header />
      <main className="flex-1 bg-gradient-to-b from-amber-50/50 via-background to-background">
        <div className="container mx-auto max-w-[1540px] px-3 py-4 pb-24 sm:px-4 sm:py-8 xl:px-6">

        {statsLoading || !stats || !dealer ? (
          <DealerLoadingSkeleton />
        ) : (
          <div className="space-y-5 sm:space-y-6">
            <div className={activeTab === "dashboard" ? "" : "hidden lg:block"}>
              <DealerHero
                dealer={dealer}
                stats={stats}
                t={t}
                onOpenMessages={() => navigate("/dealer/messages")}
                onProfileTask={openSettingsTarget}
                onAddVehicle={openAddVehicleDialog}
                onOpenImport={openImportSync}
                onOpenBilling={() => setActiveTab("billing")}
              />
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
              <button
                type="button"
                onClick={() => setActiveTab("dashboard")}
                className="group flex w-full min-w-0 items-center gap-2.5 rounded-2xl border border-amber-300 bg-amber-50/70 px-2.5 py-2 text-left shadow-sm transition hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 motion-safe:animate-attention sm:w-auto sm:gap-3 sm:px-3 sm:py-1.5"
                aria-label={activeTab === "dashboard" ? t("dealer.cabinet") : t("dealer.backToCabinet")}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#6f4c17] text-white shadow-sm transition group-hover:bg-[#5c3b10] sm:h-10 sm:w-10">
                  {activeTab === "dashboard" ? (
                    <Home className="h-4 w-4" />
                  ) : (
                    <ArrowLeft className="h-4 w-4" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-amber-700 sm:text-sm">
                    NNAuto Pro
                  </p>
                  <h2 className="truncate text-base font-black tracking-tight sm:text-2xl">
                    {t("dealer.cabinet")}
                  </h2>
                </span>
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-200/80 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-amber-900 sm:px-2.5">
                  {activeTab === "dashboard" ? (
                    <>
                      <MousePointerClick className="h-3 w-3" />
                      {t("dealer.cabinetHome")}
                    </>
                  ) : (
                    <>
                      <ArrowLeft className="h-3 w-3" />
                      {t("dealer.backToCabinet")}
                    </>
                  )}
                </span>
              </button>
              <div className="flex w-full flex-wrap items-center gap-2 sm:ml-auto sm:w-auto sm:justify-end">
                <DealerMessagesShortcut />
              </div>
            </div>

          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as DealerTab)}>
            <div
              className={`grid gap-6 md:items-start 2xl:gap-8 ${
                sidebarCollapsed
                  ? "md:grid-cols-[96px_minmax(0,1fr)]"
                  : "md:grid-cols-[320px_minmax(0,1fr)] 2xl:grid-cols-[360px_minmax(0,1fr)]"
              }`}
            >
              <DealerCabinetSideNav
                activeTab={activeTab}
                collapsed={sidebarCollapsed}
                t={t}
                onAddVehicle={openAddVehicleDialog}
                onToggleCollapsed={() => setSidebarCollapsed((value) => !value)}
                onOpenPublicProfile={openPublicProfile}
                onSelect={setActiveTab}
              />
              <div className="min-w-0 space-y-5">
            <TabsContent value="dashboard" className="mt-0">
              <DashboardTab
                stats={stats}
                dealer={dealer}
                t={t}
                onOpenTab={setActiveTab}
                onFocusSettings={openSettingsTarget}
              onAddVehicle={openAddVehicleDialog}
              />
            </TabsContent>
            <TabsContent value="mylistings" className="mt-0">
              <MyListingsTab
                t={t}
                dealer={dealer}
                onOpenTab={setActiveTab}
                onAddVehicle={openAddVehicleDialog}
              />
            </TabsContent>
            <TabsContent value="topovani" className="mt-0">
              <TopovaniTab t={t} />
            </TabsContent>
            <TabsContent value="promotion" className="mt-0">
              <PromotionTab stats={stats} t={t} />
            </TabsContent>
            <TabsContent value="import" className="mt-0">
              <ImportSyncTab
                dealer={dealer}
                t={t}
                onAddVehicle={openAddVehicleDialog}
                sub={importSub}
                onSubChange={setImportSub}
              />
            </TabsContent>
            <TabsContent value="integrace" className="mt-0">
              <ImportSyncTab
                dealer={dealer}
                t={t}
                onAddVehicle={openAddVehicleDialog}
                sub={importSub === "csv" ? "xml" : importSub}
                onSubChange={setImportSub}
              />
            </TabsContent>
            <TabsContent value="leady" className="mt-0">
              <LeadyTab dealer={dealer} t={t} />
            </TabsContent>
            <TabsContent value="microsite" className="mt-0">
              <DealerProfileTab
                dealer={dealer}
                t={t}
                focusTarget={settingsTarget}
                onFocusHandled={() => setSettingsTarget(null)}
                subTab="web"
                onSubTabChange={setProfileSubTab}
              />
            </TabsContent>
            <TabsContent value="billing" className="mt-0">
              <BillingTab dealer={dealer} t={t} />
            </TabsContent>
            <TabsContent value="settings" className="mt-0">
              <DealerProfileTab
                dealer={dealer}
                t={t}
                focusTarget={settingsTarget}
                onFocusHandled={() => setSettingsTarget(null)}
                subTab={profileSubTab}
                onSubTabChange={setProfileSubTab}
              />
            </TabsContent>
            <TabsContent value="reviews" className="mt-0">
              <ReviewsTab dealer={dealer} t={t} />
            </TabsContent>
              </div>
            </div>
          </Tabs>
          <DealerMobileNav
            activeTab={activeTab}
            t={t}
            onOpenPublicProfile={openPublicProfile}
            onSelect={(tab) => {
              if (tab === "add") {
                openAddVehicleDialog();
                return;
              }
              setActiveTab(tab as DealerTab);
            }}
          />
          <Dialog open={addVehicleDialogOpen} onOpenChange={setAddVehicleDialogOpen}>
            <DialogContent className="w-[calc(100vw-1.5rem)] rounded-3xl border-amber-100 p-4 shadow-[0_24px_80px_rgba(120,72,12,0.18)] sm:max-w-xl sm:p-6">
              <DialogHeader>
                <DialogTitle>{t("dealer.addVehicle.title")}</DialogTitle>
                <DialogDescription>{t("dealer.addVehicle.description")}</DialogDescription>
              </DialogHeader>

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => chooseAddVehicleFlow("single")}
                  className={`rounded-3xl border p-4 text-left transition hover:-translate-y-0.5 hover:border-amber-300 hover:bg-amber-50 active:scale-[0.99] ${
                    addVehiclePreference === "single" ? "border-amber-400 bg-amber-50 shadow-sm" : "bg-white"
                  }`}
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-800">
                    <Plus className="h-6 w-6" />
                  </div>
                  <p className="text-lg font-black">{t("dealer.addVehicle.singleTitle")}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{t("dealer.addVehicle.singleDescription")}</p>
                  <span className="mt-4 inline-flex items-center text-sm font-bold text-amber-700">
                    {t("dealer.addVehicle.continue")}
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => chooseAddVehicleFlow("bulk")}
                  className={`rounded-3xl border p-4 text-left transition hover:-translate-y-0.5 hover:border-amber-300 hover:bg-amber-50 active:scale-[0.99] ${
                    addVehiclePreference === "bulk" ? "border-amber-400 bg-amber-50 shadow-sm" : "bg-white"
                  }`}
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-800">
                    <Upload className="h-6 w-6" />
                  </div>
                  <div className="mb-1 flex items-center gap-2">
                    <p className="text-lg font-black">{t("dealer.addVehicle.bulkTitle")}</p>
                    <Badge className="bg-amber-700 text-white hover:bg-amber-700">CSV/XML</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{t("dealer.addVehicle.bulkDescription")}</p>
                  <span className="mt-4 inline-flex items-center text-sm font-bold text-amber-700">
                    {t("dealer.addVehicle.continue")}
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </span>
                </button>
              </div>
            </DialogContent>
          </Dialog>
          </div>
        )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Integrace (V2): XML Feed / API / Webhooks / WordPress
// Frontend scaffold. Persists configuration locally (localStorage) until the
// backend endpoints, cron sync and webhook dispatcher are implemented.
// ---------------------------------------------------------------------------

type ImportSyncSubTab = "csv" | "xml" | "api" | "wordpress" | "webhooks";

type IntegraceState = {
  xmlUrl: string;
  xmlSavedUrl: string;
  xmlVerified: boolean;
  lastSyncAt: string | null;
  vehicleCount: number;
  createdCount: number;
  updatedCount: number;
  deactivatedCount: number;
  errorCount: number;
  apiKey: string;
  webhookUrl: string;
  webhookEvents: string[];
};

const WEBHOOK_EVENTS: Array<{ id: string; label: string }> = [
  { id: "vehicle.created", label: "Vozidlo vytvořeno" },
  { id: "vehicle.updated", label: "Vozidlo aktualizováno" },
  { id: "vehicle.deleted", label: "Vozidlo smazáno" },
  { id: "vehicle.sold", label: "Vozidlo prodáno" },
];

const API_ENDPOINTS: Array<{ method: string; path: string; label: string }> = [
  { method: "GET", path: "/api/dealer/vehicles", label: "Seznam vozidel" },
  { method: "POST", path: "/api/dealer/vehicles", label: "Vytvořit vozidlo" },
  { method: "PUT", path: "/api/dealer/vehicles/{id}", label: "Aktualizovat vozidlo" },
  { method: "DELETE", path: "/api/dealer/vehicles/{id}", label: "Smazat vozidlo" },
  { method: "PATCH", path: "/api/dealer/vehicles/{id}/status", label: "Změnit stav vozidla" },
];

function methodBadgeClass(method: string): string {
  switch (method) {
    case "POST":
      return "bg-emerald-100 text-emerald-700";
    case "PUT":
      return "bg-amber-100 text-amber-700";
    case "DELETE":
      return "bg-red-100 text-red-700";
    case "PATCH":
      return "bg-sky-100 text-sky-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

function ImportSyncInfoBlock({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-sky-100 bg-sky-50/60 p-4">
      <p className="flex items-center gap-2 text-sm font-bold text-sky-900">
        <HelpCircle className="h-4 w-4 text-sky-600" />
        {title}
      </p>
      <p className="mt-1 text-sm text-sky-800/90">{text}</p>
    </div>
  );
}

function ImportSyncTab({
  dealer,
  t,
  onAddVehicle,
  sub,
  onSubChange,
}: {
  dealer: Dealer;
  t: (key: string) => string;
  onAddVehicle: () => void;
  sub: ImportSyncSubTab;
  onSubChange: (next: ImportSyncSubTab) => void;
}) {
  const { toast } = useToast();
  const storageKey = `nnauto_dealer_integrace_${dealer.id}`;
  const setSub = onSubChange;
  const [state, setState] = useState<IntegraceState>({
    xmlUrl: "",
    xmlSavedUrl: "",
    xmlVerified: false,
    lastSyncAt: null,
    vehicleCount: 0,
    createdCount: 0,
    updatedCount: 0,
    deactivatedCount: 0,
    errorCount: 0,
    apiKey: "",
    webhookUrl: "",
    webhookEvents: ["vehicle.created", "vehicle.updated", "vehicle.sold"],
  });
  const [busy, setBusy] = useState<null | "verify" | "sync" | "webhook" | "apikey">(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<IntegraceState>;
        setState((prev) => ({ ...prev, ...parsed }));
      }
    } catch {
      // ignore
    }
  }, [storageKey]);

  const persist = useCallback(
    (updater: (prev: IntegraceState) => IntegraceState) => {
      setState((prev) => {
        const next = updater(prev);
        try {
          localStorage.setItem(storageKey, JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });
    },
    [storageKey],
  );

  // Load the real feed config/status from the backend. Server is the source of
  // truth for the XML feed (URL, last sync, counters); localStorage only keeps
  // demo-only fields like apiKey/webhook.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiRequest("GET", "/api/dealer/feed");
        const data = await res.json();
        const feed = data?.feed;
        if (!feed || cancelled) return;
        setState((prev) => ({
          ...prev,
          xmlUrl: feed.feedUrl || prev.xmlUrl,
          xmlSavedUrl: feed.feedUrl || "",
          xmlVerified: feed.status === "ok" || feed.status === "syncing",
          lastSyncAt: feed.lastSyncAt || prev.lastSyncAt,
          vehicleCount: feed.vehicleCount ?? prev.vehicleCount,
          createdCount: feed.createdCount ?? prev.createdCount,
          updatedCount: feed.updatedCount ?? prev.updatedCount,
          deactivatedCount: feed.deactivatedCount ?? prev.deactivatedCount,
          errorCount: feed.errorCount ?? prev.errorCount,
        }));
      } catch {
        // ignore — dealer may not have configured a feed yet
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Load the dealer's stored API key (server is the source of truth).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiRequest("GET", "/api/dealer/api-key");
        const data = await res.json();
        if (cancelled || !data) return;
        if (typeof data.apiKey === "string") {
          setState((prev) => ({ ...prev, apiKey: data.apiKey }));
        }
      } catch {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const subTabs: Array<{
    id: ImportSyncSubTab;
    label: string;
    shortLabel: string;
    tag: string;
    group: "main" | "extra";
    Icon: typeof Link2;
  }> = [
    { id: "csv", label: "CSV Import", shortLabel: "CSV", tag: t("dealer.importSync.csvTag"), group: "main", Icon: FileSpreadsheet },
    { id: "xml", label: "XML Feed", shortLabel: "XML", tag: t("dealer.importSync.xmlTag"), group: "main", Icon: RotateCcw },
    { id: "api", label: "API", shortLabel: "API", tag: t("dealer.importSync.apiTag"), group: "main", Icon: Lock },
    { id: "wordpress", label: "WordPress", shortLabel: "WordPress", tag: t("dealer.importSync.wordpressTag"), group: "extra", Icon: MonitorSmartphone },
    { id: "webhooks", label: "Webhooks", shortLabel: "Webhooks", tag: t("dealer.importSync.webhooksTag"), group: "extra", Icon: Zap },
  ];
  const mainTabs = subTabs.filter((tab) => tab.group === "main");
  const extraTabs = subTabs.filter((tab) => tab.group === "extra");

  const handleVerifyXml = async () => {
    if (!state.xmlUrl.trim()) {
      toast({ title: "Zadejte XML URL", variant: "destructive" });
      return;
    }
    setBusy("verify");
    try {
      const res = await apiRequest("POST", "/api/dealer/feed/verify", {
        feedUrl: state.xmlUrl.trim(),
      });
      const data = await res.json();
      const preview = data?.preview;
      const count = preview?.itemCount ?? 0;
      const valid = preview?.validCount ?? 0;
      persist((prev) => ({ ...prev, xmlVerified: count > 0, vehicleCount: count }));
      toast({
        title: `Nalezeno ${count} vozidel`,
        description: `Připraveno k importu: ${valid}. Zkontrolováno bez uložení.`,
      });
    } catch (err) {
      const { message } = parseApiError(err);
      toast({ title: "Ověření selhalo", description: message, variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  const handleSaveXml = async () => {
    if (!state.xmlUrl.trim()) {
      toast({ title: "Zadejte XML URL", variant: "destructive" });
      return;
    }
    try {
      await apiRequest("POST", "/api/dealer/feed", { feedUrl: state.xmlUrl.trim() });
      persist((prev) => ({ ...prev, xmlSavedUrl: prev.xmlUrl.trim() }));
      toast({ title: "XML feed uložen" });
    } catch (err) {
      const { message } = parseApiError(err);
      toast({ title: "Uložení selhalo", description: message, variant: "destructive" });
    }
  };

  const handleSyncNow = async () => {
    const url = state.xmlUrl.trim() || state.xmlSavedUrl.trim();
    if (!url) {
      toast({ title: "Nejdříve zadejte XML URL", variant: "destructive" });
      return;
    }
    setBusy("sync");
    try {
      const res = await apiRequest("POST", "/api/dealer/feed/sync", { feedUrl: url });
      const data = await res.json();
      const s = data?.summary ?? {};
      persist((prev) => ({
        ...prev,
        xmlSavedUrl: url,
        xmlVerified: true,
        lastSyncAt: new Date().toISOString(),
        vehicleCount: s.itemCount ?? prev.vehicleCount,
        createdCount: s.created ?? 0,
        updatedCount: s.updated ?? 0,
        deactivatedCount: s.deactivated ?? 0,
        errorCount: s.failed ?? 0,
      }));
      queryClient.invalidateQueries({ queryKey: ["/api/dealer/listings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dealer/stats"] });
      queryClient.removeQueries({
        predicate: (query) => query.queryKey[0] === "/api/listings",
      });
      toast({
        title: "Synchronizace dokončena",
        description: `Nové: ${s.created ?? 0}, aktualizované: ${s.updated ?? 0}, deaktivované: ${s.deactivated ?? 0}, chyby: ${s.failed ?? 0}`,
      });
    } catch (err) {
      const { message } = parseApiError(err);
      toast({ title: "Synchronizace selhala", description: message, variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  const handleGenerateKey = async () => {
    setBusy("apikey");
    try {
      const res = await apiRequest("POST", "/api/dealer/api-key");
      const data = await res.json();
      const next = typeof data?.apiKey === "string" ? data.apiKey : "";
      persist((prev) => ({ ...prev, apiKey: next }));
      toast({ title: "Nový API klíč vygenerován", description: "Starý klíč okamžitě přestal platit." });
    } catch (err) {
      const { message } = parseApiError(err);
      toast({ title: "Generování selhalo", description: message, variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  const handleCopyKey = async () => {
    if (!state.apiKey) return;
    try {
      await navigator.clipboard.writeText(state.apiKey);
      toast({ title: "API klíč zkopírován" });
    } catch {
      toast({ title: "Kopírování se nezdařilo", variant: "destructive" });
    }
  };

  const handleTestWebhook = () => {
    if (!state.webhookUrl.trim()) {
      toast({ title: "Zadejte webhook URL", variant: "destructive" });
      return;
    }
    setBusy("webhook");
    window.setTimeout(() => {
      setBusy(null);
      toast({ title: "Testovací událost odeslána", description: "Doručení ověříte po zapnutí webhook dispatcheru." });
    }, 800);
  };

  const toggleEvent = (id: string) => {
    persist((prev) => ({
      ...prev,
      webhookEvents: prev.webhookEvents.includes(id)
        ? prev.webhookEvents.filter((e) => e !== id)
        : [...prev.webhookEvents, id],
    }));
  };

  const lastSyncLabel = state.lastSyncAt
    ? new Date(state.lastSyncAt).toLocaleString("cs-CZ")
    : "—";

  return (
    <div className="space-y-4 sm:space-y-5">
      <Card className={`${premiumSurface} rounded-3xl`}>
        <CardHeader className="p-4 pb-3 sm:p-6 sm:pb-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-2xl">
                <RotateCcw className="h-5 w-5 shrink-0 text-amber-700" />
                {t("dealer.importSync.title")}
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">{t("dealer.importSync.description")}</CardDescription>
            </div>
            <Badge variant="outline" className="w-fit shrink-0 rounded-full border-amber-200 bg-amber-50 text-amber-800">
              NNAuto Pro
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
          {/* Mobile: integrations grouped into adaptive 2-col cards so all five
              channels are visible at once with no horizontal scrolling. */}
          <div className="space-y-3 sm:hidden">
            {[
              { key: "main", label: t("dealer.importSync.groupMain"), tabs: mainTabs },
              { key: "extra", label: t("dealer.importSync.groupExtra"), tabs: extraTabs },
            ].map((grp) => (
              <div key={grp.key} className="space-y-1.5">
                <p className="px-1 text-[10px] font-bold uppercase tracking-wider text-amber-700/70">{grp.label}</p>
                <div className="grid grid-cols-2 gap-2">
                  {grp.tabs.map(({ id, label, tag, Icon }) => {
                    const active = sub === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setSub(id)}
                        aria-pressed={active}
                        className={`flex items-start gap-2 rounded-xl border p-2.5 text-left transition-all duration-200 active:scale-[0.98] ${
                          active
                            ? "border-transparent bg-[#6f4c17] text-white shadow-md shadow-amber-900/20"
                            : "border-amber-100 bg-white text-[#5c3b10] hover:border-amber-300 hover:bg-amber-50/60"
                        }`}
                      >
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                            active ? "bg-white/15 text-white" : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[13px] font-bold leading-tight">{label}</span>
                          <span className={`mt-0.5 block text-[10px] leading-tight ${active ? "text-amber-50/80" : "text-muted-foreground"}`}>
                            {tag}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: single-row segmented control with full labels. */}
          <div className="hidden w-full gap-1 rounded-2xl bg-amber-50/70 p-1 sm:flex">
            {subTabs.map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setSub(id)}
                aria-pressed={sub === id}
                className={`inline-flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-bold transition ${
                  sub === id
                    ? "bg-[#6f4c17] text-white shadow-sm"
                    : "text-[#8a641f] hover:bg-white/70 hover:text-[#5c3b10]"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {sub === "csv" ? <BulkImportTab t={t} onAddVehicle={onAddVehicle} embedded /> : null}

      {sub === "xml" ? (
        <Card className={`${premiumSurface} rounded-3xl`}>
          <CardHeader className="p-4 pb-2 sm:p-6 sm:pb-2">
            <CardTitle className="text-lg">XML Feed</CardTitle>
            <CardDescription>
              {t("dealer.importSync.xmlSubtitle")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-4 pt-0 sm:space-y-5 sm:p-6 sm:pt-0">
            <ImportSyncInfoBlock
              title={t("dealer.importSync.fitTitle")}
              text={t("dealer.importSync.xmlFit")}
            />
            <div className="space-y-2">
              <Label htmlFor="integrace-xml-url">XML URL</Label>
              <Input
                id="integrace-xml-url"
                value={state.xmlUrl}
                onChange={(e) => persist((prev) => ({ ...prev, xmlUrl: e.target.value, xmlVerified: false }))}
                placeholder="https://dealer.cz/feed.xml"
                className="rounded-2xl"
              />
              {state.xmlVerified ? (
                <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                  <CheckCircle2 className="h-3.5 w-3.5" /> XML ověřeno
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" className="rounded-2xl" onClick={handleVerifyXml} disabled={busy === "verify"}>
                {busy === "verify" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                Ověřit XML
              </Button>
              <Button className="rounded-2xl bg-amber-700 hover:bg-amber-800" onClick={handleSaveXml}>
                <Save className="mr-2 h-4 w-4" />
                Uložit
              </Button>
              <Button variant="outline" className="rounded-2xl" onClick={handleSyncNow} disabled={busy === "sync"}>
                {busy === "sync" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RotateCcw className="mr-2 h-4 w-4" />}
                Synchronizovat nyní
              </Button>
            </div>

            <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-4 text-sm text-[#6b4e1f]">
              <p className="flex items-center gap-2 font-bold">
                <Clock className="h-4 w-4" /> Automatická synchronizace každých 15 minut
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-[#7a5a26]">
                <li>vytváření nových inzerátů</li>
                <li>aktualizace existujících</li>
                <li>deaktivace prodaných vozidel</li>
                <li>logování všech chyb</li>
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <IntegraceStat label="Poslední synchronizace" value={lastSyncLabel} />
              <IntegraceStat label="Počet vozidel" value={String(state.vehicleCount)} />
              <IntegraceStat label="Nové / aktualizované" value={`${state.createdCount} / ${state.updatedCount}`} />
              <IntegraceStat label="Chyby" value={String(state.errorCount)} tone={state.errorCount > 0 ? "danger" : "default"} />
            </div>
          </CardContent>
        </Card>
      ) : null}

      {sub === "api" ? (
        <Card className={`${premiumSurface} rounded-3xl`}>
          <CardHeader className="p-4 pb-2 sm:p-6 sm:pb-2">
            <CardTitle className="text-lg">API</CardTitle>
            <CardDescription>{t("dealer.importSync.apiSubtitle")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-4 pt-0 sm:space-y-5 sm:p-6 sm:pt-0">
            <ImportSyncInfoBlock
              title={t("dealer.importSync.fitTitle")}
              text={t("dealer.importSync.apiFit")}
            />
            <div className="space-y-2">
              <Label>API Key</Label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  readOnly
                  value={state.apiKey || "Zatím nevygenerován"}
                  className="rounded-2xl font-mono text-sm"
                />
                <div className="flex gap-2">
                  <Button variant="outline" className="rounded-2xl" onClick={handleCopyKey} disabled={!state.apiKey}>
                    <Copy className="mr-2 h-4 w-4" />
                    Kopírovat
                  </Button>
                  <Button className="rounded-2xl bg-amber-700 hover:bg-amber-800" onClick={handleGenerateKey} disabled={busy === "apikey"}>
                    {busy === "apikey" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RotateCcw className="mr-2 h-4 w-4" />}
                    Generate New Key
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Klíč uchovávejte v bezpečí. Po vygenerování nového klíče přestane starý platit.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Endpointy</Label>
              <div className="overflow-hidden rounded-2xl border border-amber-100">
                {API_ENDPOINTS.map((ep, idx) => (
                  <div
                    key={ep.method + ep.path}
                    className={`flex flex-wrap items-center gap-3 px-4 py-3 text-sm ${
                      idx % 2 === 0 ? "bg-white" : "bg-amber-50/40"
                    }`}
                  >
                    <span className={`inline-flex w-16 justify-center rounded-lg px-2 py-1 text-xs font-black ${methodBadgeClass(ep.method)}`}>
                      {ep.method}
                    </span>
                    <code className="font-mono text-[13px] text-[#5c3b10]">{ep.path}</code>
                    <span className="ml-auto text-xs text-muted-foreground">{ep.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button variant="outline" className="rounded-2xl" disabled>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              API dokumentace (OpenAPI) — již brzy
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {sub === "webhooks" ? (
        <Card className={`${premiumSurface} rounded-3xl`}>
          <CardHeader className="p-4 pb-2 sm:p-6 sm:pb-2">
            <CardTitle className="text-lg">Webhooks</CardTitle>
            <CardDescription>
              Připojte vlastní webhook URL a přijímejte události o změnách vozidel v reálném čase.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-4 pt-0 sm:space-y-5 sm:p-6 sm:pt-0">
            <div className="space-y-2">
              <Label htmlFor="integrace-webhook-url">Webhook URL</Label>
              <Input
                id="integrace-webhook-url"
                value={state.webhookUrl}
                onChange={(e) => persist((prev) => ({ ...prev, webhookUrl: e.target.value }))}
                placeholder="https://dealer.cz/api/nnauto"
                className="rounded-2xl"
              />
            </div>
            <div className="space-y-2">
              <Label>Události</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                {WEBHOOK_EVENTS.map((evt) => {
                  const active = state.webhookEvents.includes(evt.id);
                  return (
                    <button
                      key={evt.id}
                      type="button"
                      onClick={() => toggleEvent(evt.id)}
                      className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition ${
                        active ? "border-amber-300 bg-amber-50" : "border-amber-100 bg-white hover:bg-amber-50/50"
                      }`}
                    >
                      <span>
                        <code className="font-mono text-[13px] font-bold text-[#5c3b10]">{evt.id}</code>
                        <span className="block text-xs text-muted-foreground">{evt.label}</span>
                      </span>
                      <Switch checked={active} onCheckedChange={() => toggleEvent(evt.id)} />
                    </button>
                  );
                })}
              </div>
            </div>
            <Button variant="outline" className="rounded-2xl" onClick={handleTestWebhook} disabled={busy === "webhook"}>
              {busy === "webhook" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
              Test Webhook
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {sub === "wordpress" ? (
        <Card className={`${premiumSurface} rounded-3xl`}>
          <CardHeader className="p-4 pb-2 sm:p-6 sm:pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MonitorSmartphone className="h-5 w-5 text-amber-700" />
              WordPress plugin
            </CardTitle>
            <CardDescription>
              Synchronizujte vozidla z vašeho WordPressu do NNAuto přes oficiální plugin.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-4 pt-0 sm:space-y-5 sm:p-6 sm:pt-0">
            <ImportSyncInfoBlock
              title={t("dealer.importSync.fitTitle")}
              text="Pro dealery, kteří provozují svůj web na WordPressu. Plugin posílá vozidla do NNAuto automaticky přes naše API."
            />

            <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-4 text-sm text-[#6b4e1f]">
              <p className="font-bold">Instalace ve 4 krocích</p>
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-[#7a5a26]">
                <li>Stáhněte plugin a nahrajte jej ve WordPressu (Pluginy → Nahrát plugin).</li>
                <li>Aktivujte plugin a otevřete menu „NNAuto Sync“.</li>
                <li>Vložte svůj API klíč (záložka API → Generate New Key).</li>
                <li>Vyberte typ záznamu s vozidly, namapujte pole a uložte.</li>
              </ol>
            </div>

            <div className="flex flex-wrap gap-2">
              <a href="/downloads/nnauto-sync.zip" download>
                <Button className="rounded-2xl bg-amber-700 hover:bg-amber-800">
                  <Download className="mr-2 h-4 w-4" />
                  Stáhnout plugin (.zip)
                </Button>
              </a>
              <Button
                variant="outline"
                className="rounded-2xl"
                onClick={() => setSub("api")}
              >
                <Lock className="mr-2 h-4 w-4" />
                Získat API klíč
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Plugin upsertuje vozidla podle ID příspěvku, takže opakovaná synchronizace nevytváří duplicity. Při přesunu do koše označí vozidlo jako prodané.
            </p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function IntegraceStat({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "danger";
}) {
  return (
    <div className="rounded-2xl border border-amber-100 bg-white p-3">
      <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`mt-1 truncate text-base font-black ${tone === "danger" ? "text-red-600" : "text-[#5c3b10]"}`}>
        {value}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Leady (V2): jednoduchý CRM přehled poptávek.
// Frontend scaffold se vzorovými daty; stavy se ukládají lokálně do té doby,
// než bude k dispozici databázová tabulka leads a API.
// ---------------------------------------------------------------------------

type LeadStatus =
  | "new"
  | "contacted"
  | "negotiating"
  | "reserved"
  | "sold"
  | "lost";

type Lead = {
  id: string;
  car: string;
  listingId: string;
  listingPhoto?: string | null;
  listingPrice?: string | null;
  listingSold?: boolean | null;
  listingBrand?: string | null;
  listingModel?: string | null;
  listingYear?: number | null;
  name: string;
  phone: string;
  email: string;
  date: string;
  status: LeadStatus;
  note?: string | null;
};

const LEAD_STATUS_META: Record<
  LeadStatus,
  { label: string; className: string; column: string; dot: string }
> = {
  new: { label: "Nový", className: "bg-sky-100 text-sky-700", column: "border-sky-200", dot: "bg-sky-500" },
  contacted: { label: "Kontaktován", className: "bg-amber-100 text-amber-700", column: "border-amber-200", dot: "bg-amber-500" },
  negotiating: { label: "Jednání", className: "bg-violet-100 text-violet-700", column: "border-violet-200", dot: "bg-violet-500" },
  reserved: { label: "Rezervace", className: "bg-blue-100 text-blue-700", column: "border-blue-200", dot: "bg-blue-500" },
  sold: { label: "Prodáno", className: "bg-emerald-100 text-emerald-700", column: "border-emerald-200", dot: "bg-emerald-500" },
  lost: { label: "Ztraceno", className: "bg-rose-100 text-rose-700", column: "border-rose-200", dot: "bg-rose-500" },
};

const LEAD_STATUS_ORDER: LeadStatus[] = [
  "new",
  "contacted",
  "negotiating",
  "reserved",
  "sold",
  "lost",
];

// How many cards to render per column before the "show more" button.
const LEADS_PER_COLUMN = 12;

// Legacy rows may still carry "rejected"; normalise to the new "lost" stage.
function normalizeLeadStatus(s: string | null | undefined): LeadStatus {
  if (s === "rejected") return "lost";
  return (LEAD_STATUS_ORDER as string[]).includes(s ?? "")
    ? (s as LeadStatus)
    : "new";
}

function formatLeadPrice(price?: string | null): string | null {
  if (!price) return null;
  const n = Number(price);
  if (!Number.isFinite(n) || n <= 0) return null;
  return `${n.toLocaleString("cs-CZ")} Kč`;
}

function LeadyTab({ t }: { dealer: Dealer; t: (key: string) => string }) {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [search, setSearch] = useState("");
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<LeadStatus | null>(null);
  const [collapsedCols, setCollapsedCols] = useState<Set<LeadStatus>>(new Set());
  const [visibleCount, setVisibleCount] = useState<Record<LeadStatus, number>>({
    new: LEADS_PER_COLUMN,
    contacted: LEADS_PER_COLUMN,
    negotiating: LEADS_PER_COLUMN,
    reserved: LEADS_PER_COLUMN,
    sold: LEADS_PER_COLUMN,
    lost: LEADS_PER_COLUMN,
  });
  const [colSearch, setColSearch] = useState<Record<LeadStatus, string>>({
    new: "",
    contacted: "",
    negotiating: "",
    reserved: "",
    sold: "",
    lost: "",
  });
  const setColumnSearch = (status: LeadStatus, value: string) =>
    setColSearch((prev) => ({ ...prev, [status]: value }));

  const toggleCollapse = (status: LeadStatus) =>
    setCollapsedCols((prev) => {
      const next = new Set(prev);
      next.has(status) ? next.delete(status) : next.add(status);
      return next;
    });
  const showMore = (status: LeadStatus) =>
    setVisibleCount((prev) => ({
      ...prev,
      [status]: prev[status] + LEADS_PER_COLUMN,
    }));
  const allCollapsed = collapsedCols.size === LEAD_STATUS_ORDER.length;
  const toggleAll = () =>
    setCollapsedCols(allCollapsed ? new Set() : new Set(LEAD_STATUS_ORDER));

  const { data, isLoading } = useQuery<{ leads: Lead[] }>({
    queryKey: ["/api/dealer/leads"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/dealer/leads");
      return res.json();
    },
  });
  const leads = useMemo<Lead[]>(
    () =>
      (data?.leads ?? []).map((l) => ({
        ...l,
        status: normalizeLeadStatus(l.status),
      })),
    [data],
  );

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: LeadStatus }) => {
      const res = await apiRequest("PATCH", `/api/dealer/leads/${id}`, { status });
      return res.json();
    },
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ["/api/dealer/leads"] });
      const prev = queryClient.getQueryData<{ leads: Lead[] }>(["/api/dealer/leads"]);
      queryClient.setQueryData<{ leads: Lead[] }>(["/api/dealer/leads"], (old) =>
        old
          ? { leads: old.leads.map((l) => (l.id === id ? { ...l, status } : l)) }
          : old,
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["/api/dealer/leads"], ctx.prev);
      toast({ title: "Nepodařilo se uložit stav", variant: "destructive" });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dealer/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dealer/leads/stats"] });
    },
  });

  const updateStatus = (id: string, status: LeadStatus) => {
    const lead = leads.find((l) => l.id === id);
    if (lead && lead.status === status) return;
    statusMutation.mutate({ id, status });
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return leads;
    return leads.filter((lead) =>
      [lead.car, lead.name, lead.phone, lead.email].some((v) =>
        (v ?? "").toLowerCase().includes(q),
      ),
    );
  }, [leads, search]);

  const byStatus = useMemo(() => {
    const map: Record<LeadStatus, Lead[]> = {
      new: [],
      contacted: [],
      negotiating: [],
      reserved: [],
      sold: [],
      lost: [],
    };
    for (const lead of filtered) map[lead.status].push(lead);
    return map;
  }, [filtered]);

  const stats = useMemo(() => {
    const total = leads.length;
    const sold = leads.filter((l) => l.status === "sold").length;
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const newThisWeek = leads.filter((l) => {
      const d = new Date(l.date).getTime();
      return Number.isFinite(d) && d >= weekAgo;
    }).length;
    const newCount = leads.filter((l) => l.status === "new").length;
    const conversion = total > 0 ? Math.round((sold / total) * 1000) / 10 : 0;
    return { total, sold, newThisWeek, newCount, conversion };
  }, [leads]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-1">
        <h2 className="flex items-center gap-2 text-2xl font-black text-[#5c3b10]">
          <Users className="h-6 w-6 text-amber-700" />
          {t("dealer.nav.leady")}
        </h2>
        <p className="text-sm text-muted-foreground">
          CRM pipeline poptávek — přetáhněte lead mezi stavy.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <LeadStat label="Celkem leadů" value={stats.total} />
        <LeadStat label="Nové" value={stats.newCount} accent="text-sky-600" />
        <LeadStat label="Tento týden" value={stats.newThisWeek} accent="text-amber-600" />
        <LeadStat label="Konverze" value={`${stats.conversion}%`} accent="text-emerald-600" />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Hledat podle jména, auta, telefonu…"
            className="rounded-2xl pl-9"
          />
        </div>
        {leads.length > 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={toggleAll}
            className="w-fit rounded-2xl border-amber-200 text-[#6f4c17]"
          >
            {allCollapsed ? (
              <>
                <ChevronDown className="mr-1.5 h-4 w-4" />
                Rozbalit vše
              </>
            ) : (
              <>
                <ChevronUp className="mr-1.5 h-4 w-4" />
                Sbalit vše
              </>
            )}
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center gap-2 py-16 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
          <p className="font-semibold">Načítám leady…</p>
        </div>
      ) : leads.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-3xl border border-dashed border-amber-200 bg-amber-50/40 py-16 text-center text-muted-foreground">
          <Users className="h-10 w-10 text-amber-300" />
          <p className="font-semibold text-[#5c3b10]">Zatím žádné leady</p>
          <p className="text-sm">Objeví se zde automaticky po prvním kontaktu zájemce.</p>
        </div>
      ) : (
        <div className="grid items-start gap-3 lg:grid-cols-3 xl:grid-cols-6">
          {LEAD_STATUS_ORDER.map((status) => {
            const meta = LEAD_STATUS_META[status];
            const items = byStatus[status];
            const isOver = dragOverCol === status;
            // While the global search is active, auto-expand columns that have
            // matches so results show immediately without opening columns by
            // hand; empty stages stay collapsed to keep the board compact.
            const isGlobalSearching = search.trim().length > 0;
            const isCollapsed = isGlobalSearching
              ? items.length === 0
              : collapsedCols.has(status);
            const shown = visibleCount[status];
            const colQuery = colSearch[status].trim().toLowerCase();
            const colItems = colQuery
              ? items.filter((l) =>
                  [l.car, l.name, l.phone, l.email].some((v) =>
                    (v ?? "").toLowerCase().includes(colQuery),
                  ),
                )
              : items;
            const visibleItems = colItems.slice(0, shown);
            const remaining = colItems.length - shown;
            return (
              <div
                key={status}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (dragOverCol !== status) setDragOverCol(status);
                }}
                onDragLeave={() =>
                  setDragOverCol((c) => (c === status ? null : c))
                }
                onDrop={(e) => {
                  e.preventDefault();
                  const id = e.dataTransfer.getData("text/plain") || dragId;
                  if (id) updateStatus(id, status);
                  setDragId(null);
                  setDragOverCol(null);
                }}
                className={`flex flex-col rounded-2xl border bg-white/70 p-1.5 transition ${meta.column} ${
                  isOver ? "bg-amber-50/70 ring-2 ring-amber-400" : ""
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleCollapse(status)}
                  aria-expanded={!isCollapsed}
                  className="flex w-full items-center justify-between rounded-xl px-1.5 py-1 text-left transition hover:bg-amber-50/60"
                >
                  <span className="flex items-center gap-1.5 text-[13px] font-bold text-[#5c3b10]">
                    <ChevronRight
                      className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${
                        isCollapsed ? "" : "rotate-90"
                      }`}
                    />
                    <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
                    {meta.label}
                  </span>
                  <span className="rounded-full bg-muted px-1.5 py-0.5 text-[11px] font-bold tabular-nums text-muted-foreground">
                    {items.length}
                  </span>
                </button>

                {!isCollapsed && items.length > 3 && (
                  <div className="relative mt-1.5">
                    <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <input
                      value={colSearch[status]}
                      onChange={(e) => setColumnSearch(status, e.target.value)}
                      placeholder="Hledat auto v této fázi…"
                      className="h-7 w-full rounded-lg border border-amber-100 bg-white pl-7 pr-2 text-[11px] outline-none focus:border-amber-300"
                    />
                  </div>
                )}

                {!isCollapsed && (
                  <div className="mt-1.5 flex max-h-[58vh] flex-col gap-1.5 overflow-y-auto pr-0.5">
                    {items.length === 0 ? (
                      <p className="px-1.5 py-4 text-center text-xs text-muted-foreground/50">
                        —
                      </p>
                    ) : colItems.length === 0 ? (
                      <p className="px-1.5 py-4 text-center text-xs text-muted-foreground/60">
                        Žádné auto neodpovídá hledání
                      </p>
                    ) : (
                      <>
                        {visibleItems.map((lead) => (
                          <LeadCard
                            key={lead.id}
                            lead={lead}
                            onDragStart={() => setDragId(lead.id)}
                            onDragEnd={() => {
                              setDragId(null);
                              setDragOverCol(null);
                            }}
                            onChangeStatus={(s) => updateStatus(lead.id, s)}
                            onOpenVehicle={() => {
                              if (!lead.listingId) return;
                              navigate(
                                buildListingPath({
                                  id: lead.listingId,
                                  brand: lead.listingBrand,
                                  model: lead.listingModel,
                                  year: lead.listingYear ?? null,
                                }),
                              );
                            }}
                          />
                        ))}
                        {remaining > 0 && (
                          <button
                            type="button"
                            onClick={() => showMore(status)}
                            className="mt-0.5 rounded-lg border border-dashed border-amber-200 py-1.5 text-[11px] font-semibold text-[#6f4c17] transition hover:bg-amber-50"
                          >
                            Zobrazit dalších {Math.min(LEADS_PER_COLUMN, remaining)}
                            {" "}({remaining})
                          </button>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function LeadStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number | string;
  accent?: string;
}) {
  return (
    <div className="rounded-2xl border border-amber-100 bg-white p-4">
      <p className={`text-2xl font-black ${accent ?? "text-[#5c3b10]"}`}>{value}</p>
      <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

function LeadCard({
  lead,
  onDragStart,
  onDragEnd,
  onChangeStatus,
  onOpenVehicle,
}: {
  lead: Lead;
  onDragStart: () => void;
  onDragEnd: () => void;
  onChangeStatus: (s: LeadStatus) => void;
  onOpenVehicle: () => void;
}) {
  const price = formatLeadPrice(lead.listingPrice);
  const stop = (e: { stopPropagation: () => void }) => e.stopPropagation();
  return (
    <div
      role="button"
      tabIndex={0}
      draggable
      onClick={onOpenVehicle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpenVehicle();
        }
      }}
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", lead.id);
        e.dataTransfer.effectAllowed = "move";
        onDragStart();
      }}
      onDragEnd={onDragEnd}
      title="Otevřít vozidlo"
      className="group relative cursor-pointer rounded-xl border border-amber-100 bg-white p-2 shadow-sm transition hover:border-amber-300 hover:shadow-md active:cursor-grabbing"
    >
      <div className="flex gap-2">
        <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-amber-50">
          {lead.listingPhoto ? (
            <img
              src={`/img/${lead.listingPhoto}?w=160&h=120&fit=cover`}
              alt={lead.car}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Car className="h-4 w-4 text-amber-300" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1 pr-4">
          <p className="truncate text-xs font-bold leading-tight text-[#5c3b10]">{lead.car}</p>
          {price && <p className="text-[11px] font-bold text-amber-700">{price}</p>}
          <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{lead.name}</p>
        </div>
        <ExternalLink className="absolute right-1.5 top-1.5 h-3.5 w-3.5 text-muted-foreground/40 transition group-hover:text-amber-700" />
      </div>

      <div className="mt-1.5 flex flex-col gap-0.5">
        {lead.phone && (
          <a
            href={`tel:${lead.phone}`}
            onClick={stop}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 hover:underline"
            title={`Zavolat ${lead.phone}`}
          >
            <Phone className="h-3 w-3 shrink-0" />
            {lead.phone}
          </a>
        )}
        {lead.email && (
          <a
            href={`mailto:${lead.email}`}
            onClick={stop}
            className="inline-flex min-w-0 items-center gap-1 text-[11px] text-amber-800 hover:underline"
            title={`Napsat na ${lead.email}`}
          >
            <Mail className="h-3 w-3 shrink-0" />
            <span className="truncate">{lead.email}</span>
          </a>
        )}
      </div>

      <div onClick={stop} className="mt-1.5 flex items-center gap-2">
        <span className="shrink-0 text-[10px] text-muted-foreground">
          {new Date(lead.date).toLocaleDateString("cs-CZ")}
        </span>
        <Select value={lead.status} onValueChange={(v) => onChangeStatus(v as LeadStatus)}>
          <SelectTrigger
            className={`h-6 min-w-0 flex-1 rounded-full border-0 px-2 text-[11px] font-bold ${LEAD_STATUS_META[lead.status].className}`}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LEAD_STATUS_ORDER.map((s) => (
              <SelectItem key={s} value={s}>
                {LEAD_STATUS_META[s].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

function DealerCabinetSideNav({
  activeTab,
  collapsed,
  t,
  onAddVehicle,
  onToggleCollapsed,
  onOpenPublicProfile,
  onSelect,
}: {
  activeTab: DealerTab;
  collapsed: boolean;
  t: (key: string) => string;
  onAddVehicle: () => void;
  onToggleCollapsed: () => void;
  onOpenPublicProfile: () => void;
  onSelect: (tab: DealerTab) => void;
}) {
  const [, navigate] = useLocation();
  const { data } = useDealerUnreadNotifier();
  const unread = data?.unread ?? 0;
  const { data: leadStats } = useQuery<{ byStatus?: { new?: number } }>({
    queryKey: ["/api/dealer/leads/stats"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/dealer/leads/stats");
      return res.json();
    },
    staleTime: 60_000,
    refetchInterval: 60_000,
  });
  const newLeads = leadStats?.byStatus?.new ?? 0;

  const menuItems: Array<{
    id: DealerTab | "messages" | "publicProfile";
    Icon: typeof BarChart3;
    label: string;
    hint: string;
    section: string;
  }> = [
    // — Inzeráty —
    {
      id: "import",
      Icon: RotateCcw,
      label: t("dealer.nav.importSync"),
      hint: t("dealer.nav.importSyncHint"),
      section: "Inzeráty",
    },
    {
      id: "mylistings",
      Icon: Car,
      label: t("dealer.myListings"),
      hint: t("dealer.dashboard.manageInventory"),
      section: "Inzeráty",
    },
    {
      id: "topovani",
      Icon: Crown,
      label: t("dealer.topovani.menu"),
      hint: t("dealer.topovani.menuHint"),
      section: "Inzeráty",
    },
    // — Účet —
    {
      id: "settings",
      Icon: Building2,
      label: t("dealer.nav.dealerProfile"),
      hint: t("dealer.nav.dealerProfileHint"),
      section: "Účet",
    },
    {
      id: "billing",
      Icon: CreditCard,
      label: t("dealer.billing.tab"),
      hint: t("dealer.billing.subtitle"),
      section: "Účet",
    },
    {
      id: "dashboard",
      Icon: BarChart3,
      label: t("dealer.nav.statistika"),
      hint: t("dealer.nav.statistikaHint"),
      section: "Účet",
    },
    {
      id: "reviews",
      Icon: Star,
      label: t("dealer.reviews.tab"),
      hint: t("dealer.reviews.subtitle"),
      section: "Účet",
    },
    // — Komunikace —
    {
      id: "messages",
      Icon: unread > 0 ? BellRing : Inbox,
      label: t("messages.heading"),
      hint: unread > 0 ? t("messages.shortcut.openInbox") : t("messages.shortcut.idle"),
      section: "Komunikace",
    },
    // — Marketing & prezentace —
    {
      id: "publicProfile",
      Icon: Eye,
      label: t("dealer.dashboard.publicProfile"),
      hint: t("dealer.premium.previewPublicProfile"),
      section: "Marketing & prezentace",
    },
  ];

  const handleMenuClick = (id: DealerTab | "messages" | "publicProfile") => {
    if (id === "messages") {
      navigate("/dealer/messages");
      return;
    }
    if (id === "publicProfile") {
      onOpenPublicProfile();
      return;
    }
    onSelect(id);
  };

  return (
    <aside
      className={`sticky top-3 z-20 hidden max-h-[calc(100dvh-1.5rem)] overflow-y-auto rounded-[2rem] border border-amber-100 bg-white/92 shadow-[0_16px_42px_rgba(120,72,12,0.08)] backdrop-blur transition-all md:block ${
        collapsed ? "p-3" : "p-4 xl:p-5"
      }`}
    >
      <Button
        className={`mb-4 h-16 w-full rounded-3xl bg-[#6f4c17] text-base font-black shadow-[0_14px_30px_rgba(111,76,23,0.22)] transition hover:-translate-y-0.5 hover:bg-[#5a3a10] xl:h-[72px] xl:text-lg ${
          collapsed ? "justify-center px-0" : "justify-start px-6"
        }`}
        onClick={onAddVehicle}
        title={t("dealer.dashboard.addCar")}
      >
        <Plus className={`${collapsed ? "" : "mr-3"} h-5 w-5 xl:h-6 xl:w-6`} />
        {!collapsed && t("dealer.dashboard.addCar")}
      </Button>

      <div className={`mb-4 flex items-center gap-2 ${collapsed ? "justify-center" : "justify-between px-2"}`}>
        {!collapsed && (
          <button
            type="button"
            onClick={() => onSelect("dashboard")}
            className="-mx-2 rounded-2xl px-2 py-1 text-left transition hover:bg-amber-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
            aria-label={t("dealer.cabinet")}
          >
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#8a641f]">
              NNAuto Pro
            </p>
            <p className="text-sm text-muted-foreground">{t("dealer.cabinet")}</p>
          </button>
        )}
        <button
          type="button"
          onClick={onToggleCollapsed}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-amber-100 bg-white text-[#7a5518] shadow-sm transition hover:bg-amber-50"
          aria-label={collapsed ? "Rozbalit menu" : "Skrýt menu"}
          title={collapsed ? "Rozbalit menu" : "Skrýt menu"}
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
      </div>

      <div className="grid gap-2">
        {menuItems.map(({ id, Icon, label, hint, section }, index) => {
          const isActive = activeTab === id;
          const isMessages = id === "messages";
          const isLeady = id === "leady";
          const isPublicProfile = id === "publicProfile";
          const showSectionHeader =
            index === 0 || menuItems[index - 1].section !== section;
          return (
            <Fragment key={id}>
            {showSectionHeader && !collapsed ? (
              <p className={`px-2 pt-1 text-[11px] font-black uppercase tracking-[0.18em] text-[#b08a3f] ${index === 0 ? "" : "mt-3"}`}>
                {section}
              </p>
            ) : null}
            {showSectionHeader && index > 0 && collapsed ? (
              <div className="my-1 h-px w-full bg-amber-100" />
            ) : null}
            <button
              type="button"
              onClick={() => handleMenuClick(id)}
              className={`group flex min-h-[58px] w-full items-center rounded-3xl border text-left transition xl:min-h-[64px] ${
                collapsed ? "justify-center px-0 py-2" : "gap-4 px-4 py-3"
              } ${
                isActive
                  ? "border-amber-300 bg-amber-100 text-[#5c3b10] shadow-[0_8px_24px_rgba(245,158,11,0.18)] motion-safe:animate-attention"
                  : "border-transparent text-muted-foreground hover:border-amber-100 hover:bg-amber-50 hover:text-[#5c3b10]"
              }`}
              title={collapsed ? label : undefined}
              aria-label={label}
            >
              <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#fff8e8] text-[#7a5518] transition group-hover:bg-white group-hover:text-amber-800">
                <Icon className={`h-5 w-5 ${(isMessages && unread > 0) || (isLeady && newLeads > 0) ? "motion-safe:animate-wiggle" : ""}`} />
                {isMessages && unread > 0 ? (
                  <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-black text-white ring-2 ring-white">
                    {unread > 9 ? "9+" : unread}
                  </span>
                ) : null}
                {isLeady && newLeads > 0 ? (
                  <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-sky-500 px-1 text-[9px] font-black text-white ring-2 ring-white">
                    {newLeads > 9 ? "9+" : newLeads}
                  </span>
                ) : null}
              </span>
              {!collapsed && (
                <>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-base font-black">{label}</span>
                    <span className="block truncate text-xs font-medium text-muted-foreground group-hover:text-[#8a641f]">
                      {hint}
                    </span>
                  </span>
                  <ChevronRight
                    className={`h-5 w-5 shrink-0 text-muted-foreground transition ${
                      isActive || isMessages || isPublicProfile ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    }`}
                  />
                </>
              )}
            </button>
            </Fragment>
          );
        })}
      </div>
    </aside>
  );
}

function DealerMobileNav({
  activeTab,
  t,
  onOpenPublicProfile,
  onSelect,
}: {
  activeTab: DealerTab;
  t: (key: string) => string;
  onOpenPublicProfile: () => void;
  onSelect: (tab: DealerTab | "add") => void;
}) {
  const [, navigate] = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  const { data } = useDealerUnreadNotifier();
  const unread = data?.unread ?? 0;

  const primary: Array<{ id: DealerTab | "add" | "messages"; label: string; Icon: typeof BarChart3 }> = [
    { id: "add", label: t("dealer.dashboard.addShort"), Icon: Plus },
    { id: "mylistings", label: t("dealer.myListings"), Icon: Car },
    { id: "messages", label: t("messages.heading"), Icon: unread > 0 ? BellRing : Inbox },
    { id: "dashboard", label: t("dealer.dashboard.statsShort"), Icon: BarChart3 },
  ];

  const overflow: Array<{
    id: DealerTab | "publicProfile";
    label: string;
    Icon: typeof BarChart3;
    hint: string;
    section: string;
  }> = [
    { id: "import", label: t("dealer.nav.importSync"), Icon: RotateCcw, hint: t("dealer.nav.importSyncHint"), section: "Inzeráty" },
    { id: "topovani", label: t("dealer.topovani.menu"), Icon: Crown, hint: t("dealer.topovani.menuHint"), section: "Inzeráty" },
    { id: "publicProfile", label: t("dealer.dashboard.publicProfile"), Icon: Eye, hint: t("dealer.premium.previewPublicProfile"), section: "Marketing & prezentace" },
    { id: "settings", label: t("dealer.nav.dealerProfile"), Icon: Building2, hint: t("dealer.nav.dealerProfileHint"), section: "Účet" },
    { id: "billing", label: t("dealer.billing.tab"), Icon: CreditCard, hint: t("dealer.billing.subtitle"), section: "Účet" },
    { id: "reviews", label: t("dealer.reviews.tab"), Icon: Star, hint: t("dealer.reviews.subtitle"), section: "Účet" },
  ];

  return (
    <>
      <nav className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-5 gap-1 rounded-3xl border border-amber-200 bg-background/95 p-1.5 shadow-[0_18px_55px_rgba(120,72,12,0.18)] backdrop-blur md:hidden">
        {primary.map((item) => {
          const active = activeTab === item.id;
          const isMessages = item.id === "messages";
          const messagesActive = isMessages && unread > 0;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                if (isMessages) {
                  navigate("/dealer/messages");
                  return;
                }
                onSelect(item.id as DealerTab | "add");
              }}
              className={`relative flex min-h-14 flex-col items-center justify-center rounded-2xl px-1 text-[10px] font-bold transition active:scale-95 ${
                item.id === "add"
                  ? "bg-amber-700 text-white shadow-md"
                  : messagesActive
                    ? "bg-amber-50 text-amber-900 ring-1 ring-amber-300"
                    : active
                      ? "bg-amber-50 text-amber-900 ring-1 ring-amber-200"
                      : "text-muted-foreground hover:bg-amber-50 hover:text-amber-800"
              }`}
            >
              <item.Icon
                className={`mb-0.5 h-4 w-4 ${
                  messagesActive ? "motion-safe:animate-wiggle" : ""
                }`}
              />
              <span className="max-w-full truncate">{item.label}</span>
              {isMessages && unread > 0 ? (
                <span className="absolute right-1 top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-black text-white shadow ring-2 ring-white">
                  {unread > 9 ? "9+" : unread}
                </span>
              ) : null}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => setMoreOpen(true)}
          className={`flex min-h-14 flex-col items-center justify-center rounded-2xl px-1 text-[10px] font-bold transition active:scale-95 ${
            ["integrace", "import", "topovani", "reviews", "microsite", "billing", "settings", "promotion"].includes(activeTab)
              ? "bg-amber-50 text-amber-900 ring-1 ring-amber-200"
              : "text-muted-foreground hover:bg-amber-50 hover:text-amber-800"
          }`}
        >
          <MoreHorizontal className="mb-0.5 h-4 w-4" />
          <span className="max-w-full truncate">{t("dealer.mobileNav.more")}</span>
        </button>
      </nav>

      <Dialog open={moreOpen} onOpenChange={setMoreOpen}>
        <DialogContent className="w-[calc(100vw-1.5rem)] rounded-3xl border-amber-100 p-4 shadow-[0_24px_80px_rgba(120,72,12,0.18)] sm:max-w-md sm:p-6">
          <DialogHeader>
            <DialogTitle>{t("dealer.mobileNav.moreTitle")}</DialogTitle>
            <DialogDescription>{t("dealer.mobileNav.moreDescription")}</DialogDescription>
          </DialogHeader>
          <div className="grid max-h-[70vh] gap-1.5 overflow-y-auto pr-1">
            {overflow.map((item, idx) => {
              const showHeader = idx === 0 || overflow[idx - 1].section !== item.section;
              return (
              <Fragment key={item.id}>
                {showHeader && (
                  <p className="px-1 pb-0.5 pt-2 text-[10px] font-black uppercase tracking-wider text-amber-700/70 first:pt-0">
                    {item.section}
                  </p>
                )}
              <button
                type="button"
                onClick={() => {
                  if (item.id === "publicProfile") {
                    onOpenPublicProfile();
                    setMoreOpen(false);
                    return;
                  }
                  onSelect(item.id);
                  setMoreOpen(false);
                }}
                className={`flex items-center gap-3 rounded-2xl border bg-white p-2.5 text-left transition hover:border-amber-300 hover:bg-amber-50 active:scale-[0.99] ${
                  activeTab === item.id ? "border-amber-300 bg-amber-50" : ""
                }`}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
                  <item.Icon className="h-[18px] w-[18px]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold leading-tight">{item.label}</p>
                  <p className="truncate text-xs text-muted-foreground">{item.hint}</p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </button>
              </Fragment>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

/**
 * Inline shortcut to /dealer/messages with a live unread badge.
 *
 * Uses useDealerUnreadNotifier so a toast (and optional browser
 * Notification, when permission was granted from the inbox page) fires
 * whenever the unread total increases — even while the dealer is
 * looking at any other tab of the cabinet.
 *
 * Same React Query cache key as /dealer/messages itself, so it's a
 * single network poll regardless of how many components subscribe.
 */
function DealerInboxBanner({ t }: { t: (key: string) => string }) {
  const [, navigate] = useLocation();
  const { data } = useDealerUnreadNotifier();
  const unread = data?.unread ?? 0;
  const clients = data?.uniqueClients ?? 0;
  const recent = data?.recent ?? [];

  if (unread === 0) return null;

  const headline =
    clients > 1
      ? t("messages.banner.headlineMulti")
          .replace("{count}", String(unread))
          .replace("{clients}", String(clients))
      : t("messages.banner.headlineSingle").replace("{count}", String(unread));

  const top = recent[0];
  const sample = top
    ? `${top.clientName || top.clientEmail || t("messages.shortcut.anonymous")}: ${(
        top.lastMessagePreview || ""
      ).slice(0, 120)}`
    : "";

  return (
    <div
      className="relative overflow-hidden rounded-3xl border-2 border-amber-400 bg-gradient-to-r from-amber-50 via-amber-100 to-amber-50 p-4 shadow-[0_18px_55px_rgba(180,83,9,0.18)] sm:p-5"
      role="alert"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-px rounded-3xl ring-2 ring-amber-400/60 motion-safe:animate-pulse"
      />
      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-700 text-white shadow-md">
          <BellRing className="h-6 w-6 motion-safe:animate-wiggle" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700">
            {t("messages.banner.label")}
          </p>
          <p className="text-base font-black leading-tight text-amber-900 sm:text-lg">
            {headline}
          </p>
          {sample ? (
            <p className="mt-1 line-clamp-1 text-xs text-amber-900/75 sm:text-sm">
              {sample}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button
            className="rounded-2xl bg-amber-700 font-black text-white shadow-md hover:bg-amber-800"
            onClick={() => navigate("/dealer/messages")}
          >
            <Inbox className="mr-2 h-4 w-4" />
            {t("messages.banner.cta")}
          </Button>
        </div>
      </div>
    </div>
  );
}

function DealerMessagesShortcut() {
  const t = useTranslation();
  const { data } = useDealerUnreadNotifier();
  const unread = data?.unread ?? 0;
  const clients = data?.uniqueClients ?? 0;
  const hasUnread = unread > 0;

  const subtitle = hasUnread
    ? clients > 1
      ? t("messages.shortcut.subtitleMulti")
          .replace("{count}", String(unread))
          .replace("{clients}", String(clients))
      : t("messages.shortcut.subtitleSingle").replace(
          "{count}",
          String(unread),
        )
    : t("messages.shortcut.idle");

  return (
    <Link
      href="/dealer/messages"
      aria-label={t("messages.heading")}
      data-testid="button-open-messages"
      className={`group relative flex h-12 w-full items-center gap-3 rounded-2xl border px-3 pr-4 text-left font-bold transition active:scale-[0.99] sm:ml-auto sm:h-14 sm:w-auto sm:px-4 ${
        hasUnread
          ? "border-amber-400 bg-gradient-to-r from-amber-50 to-amber-100 text-amber-900 shadow-[0_10px_30px_rgba(180,83,9,0.18)] hover:from-amber-100 hover:to-amber-200"
          : "border-amber-200 bg-white text-amber-900 shadow-sm hover:-translate-y-0.5 hover:border-amber-300 hover:bg-amber-50"
      }`}
    >
      {hasUnread ? (
        <span
          aria-hidden
          className="pointer-events-none absolute -inset-px rounded-2xl ring-2 ring-amber-400/60 motion-safe:animate-pulse"
        />
      ) : null}
      <span
        className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:h-10 sm:w-10 ${
          hasUnread ? "bg-amber-700 text-white" : "bg-amber-100 text-amber-800"
        }`}
      >
        {hasUnread ? (
          <BellRing className="h-4 w-4 motion-safe:animate-[wiggle_1.2s_ease-in-out_infinite] sm:h-5 sm:w-5" />
        ) : (
          <Inbox className="h-4 w-4 sm:h-5 sm:w-5" />
        )}
        {hasUnread ? (
          <span className="absolute -right-1.5 -top-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-black text-white shadow-md ring-2 ring-white">
            {unread > 99 ? "99+" : unread}
          </span>
        ) : null}
      </span>
      <span className="hidden min-w-0 flex-col leading-tight sm:flex">
        <span className="text-sm font-black tracking-tight">{t("messages.heading")}</span>
        <span className={`truncate text-[11px] font-semibold ${hasUnread ? "text-amber-700" : "text-muted-foreground"}`}>
          {subtitle}
        </span>
      </span>
      <span className="sm:hidden">{t("messages.heading")}</span>
    </Link>
  );
}

function DealerPublicProfileMenu({
  dealer,
  t,
}: {
  dealer: Dealer;
  t: (key: string) => string;
}) {
  const { toast } = useToast();
  const publicUrl = `/dealer/${dealer.id}`;

  const copyLink = async () => {
    const url = `${window.location.origin}${publicUrl}`;
    await navigator.clipboard.writeText(url);
    toast({ title: t("dealer.premium.linkCopied") });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="h-12 gap-2 rounded-2xl border-amber-200 bg-white px-4 font-bold text-amber-900 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-300 hover:bg-amber-50"
        >
          <Eye className="h-4 w-4 text-amber-700" />
          {t("dealer.dashboard.publicProfile")}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuItem onSelect={() => window.open(publicUrl, "_blank", "noopener,noreferrer")}>
          <Eye className="mr-2 h-4 w-4" />
          {t("dealer.premium.previewPublicProfile")}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => window.open(`${publicUrl}#inventory`, "_blank", "noopener,noreferrer")}>
          <Car className="mr-2 h-4 w-4" />
          {t("dealer.dashboard.viewAllDealerCars")}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={copyLink}>
          <Link2 className="mr-2 h-4 w-4" />
          {t("dealer.premium.shareDealerPage")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function DealerAuthPromptPage() {
  const t = useTranslation();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "register">("login");

  const openAuthModal = (tab: "login" | "register") => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO title={t("dealer.registerTitle")} noindex />
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-xl">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto h-14 w-14 rounded-xl bg-amber-50 flex items-center justify-center mb-2">
              <Building2 className="h-7 w-7 text-amber-700" />
            </div>
            <CardTitle className="text-xl">{t("dealer.registerTitle")}</CardTitle>
            <CardDescription>{t("dealer.registerDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={() => openAuthModal("login")}
              className="w-full bg-amber-700 hover:bg-amber-800 text-base py-6"
              data-testid="button-dealer-login"
            >
              {t("auth.login")}
            </Button>
            <Button
              onClick={() => openAuthModal("register")}
              variant="outline"
              className="w-full border-amber-700 text-amber-700 hover:bg-amber-50 text-base py-6"
              data-testid="button-dealer-register"
            >
              {t("auth.register")}
            </Button>
          </CardContent>
        </Card>
      </main>
      <Footer />
      <LoginModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        initialTab={authModalTab}
      />
    </div>
  );
}

function DealerRegistrationPage() {
  const { user } = useAuth();
  const t = useTranslation();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const [form, setForm] = useState({
    companyName: "",
    ico: "",
    dic: "",
    description: "",
    website: "",
    phone: user?.phone || "",
    email: user?.email || "",
    address: "",
    region: "",
  });

  const registerMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const res = await apiRequest("POST", "/api/dealer/register", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({ title: t("dealer.registrationSuccess") });
      window.location.reload();
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  return (
    <div className="min-h-screen flex flex-col">
      <SEO title={t("dealer.registerTitle")} noindex />
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto h-14 w-14 rounded-xl bg-amber-50 flex items-center justify-center mb-2">
              <Building2 className="h-7 w-7 text-amber-700" />
            </div>
            <CardTitle className="text-xl">{t("dealer.registerTitle")}</CardTitle>
            <CardDescription>{t("dealer.registerDescription")}</CardDescription>
            <Button
              type="button"
              variant="ghost"
              className="text-amber-700 hover:text-amber-800 hover:bg-transparent mt-1 mx-auto h-auto p-0"
              onClick={() => setAuthModalOpen(true)}
              data-testid="button-dealer-switch-login"
            >
              {t("auth.login")}
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>{t("dealer.companyName")} *</Label>
                <Input
                  value={form.companyName}
                  onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))}
                  placeholder="AutoMax Praha s.r.o."
                />
              </div>
              <div className="space-y-2">
                <Label>{t("dealer.ico")}</Label>
                <Input
                  value={form.ico}
                  onChange={(e) => setForm((f) => ({ ...f, ico: e.target.value }))}
                  placeholder="12345678"
                />
              </div>
              <div className="space-y-2">
                <Label>{t("dealer.dic")}</Label>
                <Input
                  value={form.dic}
                  onChange={(e) => setForm((f) => ({ ...f, dic: e.target.value }))}
                  placeholder="CZ12345678"
                />
              </div>
              <div className="space-y-2">
                <Label>{t("dealer.phone")}</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("dealer.email")}</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("dealer.website")}</Label>
                <Input
                  value={form.website}
                  onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
                  placeholder="https://"
                />
              </div>
              <div className="space-y-2">
                <Label>{t("dealer.region")}</Label>
                <Input
                  value={form.region}
                  onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>{t("dealer.address")}</Label>
                <Input
                  value={form.address}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>{t("dealer.description")}</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={4}
                  placeholder="..."
                />
              </div>
            </div>

            <Button
              onClick={() => registerMutation.mutate(form)}
              disabled={registerMutation.isPending || !form.companyName}
              className="w-full bg-amber-700 hover:bg-amber-800 text-lg py-6"
            >
              <Building2 className="h-5 w-5 mr-2" />
              {registerMutation.isPending ? "..." : t("dealer.register")}
            </Button>
          </CardContent>
        </Card>
      </main>
      <Footer />
      <LoginModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        initialTab="login"
      />
    </div>
  );
}
