/**
 * Centralized NNAuto advertising catalog — placements + starter pricing.
 * Admin can later override prices via DB; this is the default source of truth.
 */

export const AD_DURATION_DAYS = [7, 14, 30] as const;
export type AdDurationDays = (typeof AD_DURATION_DAYS)[number];

export type AdPlacementId =
  | "homepage_top"
  | "listing_top"
  | "listing_inline"
  | "vehicle_detail_sidebar"
  | "featured_top"
  | "category_brand"
  | "sell_car";

export type AdDeviceSupport = "desktop_mobile" | "desktop" | "mobile";

export type AdMediaFormat = "image" | "video" | "image_video" | "native_card";

export type AdPlacementCatalogItem = {
  id: AdPlacementId;
  label: string;
  shortLabel: string;
  description: string;
  /** Where it appears in the real product UI */
  locationHint: string;
  desktopSize: string;
  mobileSize: string;
  devices: AdDeviceSupport;
  media: AdMediaFormat;
  /** Recommended aspect for creatives */
  aspect: "banner" | "inline" | "sidebar" | "featured" | "native";
  /**
   * Exclusive = historically reserved for one campaign.
   * NNAuto currently uses fair rotation for all slots (see AD_ROTATION_COPY).
   */
  exclusive: boolean;
  /** Public route patterns this placement can appear on */
  routeHints: string[];
  /** Whether the matching page/component exists in NNAuto today */
  wiredInProduct: boolean;
  pricesKc: Record<AdDurationDays, number>;
};

/**
 * Czech UX copy — how ads share one placement when more advertisers book it.
 * Shown in the campaign constructor; keep in sync with servePlacement().
 */
export const AD_ROTATION_COPY = {
  title: "Jak se reklama zobrazuje",
  /** One-line tip for the campaign wizard */
  tip: "Více kampaní na jednom místě se střídá spravedlivě.",
  short:
    "Na jednom místě může běžet více kampaní současně. U každé návštěvy se střídají spravedlivě — kdo měl méně zobrazení, dostane přednost.",
  bullets: [
    "Jedna kampaň ≠ výhradní obsazení místa na celý den.",
    "Počítač, tablet i mobil vidí stejnou kampaň v adaptivním formátu.",
    "Čím více inzerentů na stejném místě, tím častěji se reklamy střídají.",
    "Garantujeme sdílení prostoru, ne přesný počet zobrazení.",
  ],
  termsPath: "/obchodni-podminky#reklama",
  rotationPath: "/obchodni-podminky#rotace",
} as const;

/** Starter commercial offer (Kč) — demand testing, not traffic-guaranteed. */
export const AD_PLACEMENT_CATALOG: AdPlacementCatalogItem[] = [
  {
    id: "homepage_top",
    label: "Homepage — hlavní banner",
    shortLabel: "Hlavní banner",
    description:
      "Nejviditelnější místo na NNAuto — přímo pod vyhledáváním na hlavní stránce.",
    locationHint: "Hlavní stránka · pod vyhledáváním",
    desktopSize: "1200 × 280 px",
    mobileSize: "360 × 180 px",
    devices: "desktop_mobile",
    media: "image_video",
    aspect: "banner",
    exclusive: false,
    routeHints: ["/"],
    wiredInProduct: true,
    pricesKc: { 7: 590, 14: 990, 30: 1790 },
  },
  {
    id: "listing_top",
    label: "Seznam vozidel — horní banner",
    shortLabel: "Seznam nahoře",
    description:
      "Banner nad výsledky hledání — zásah ve chvíli, kdy lidé aktivně prohlížejí nabídku.",
    locationHint: "Seznam vozidel · nad výsledky",
    desktopSize: "1200 × 200 px",
    mobileSize: "360 × 140 px",
    devices: "desktop_mobile",
    media: "image_video",
    aspect: "banner",
    exclusive: false,
    routeHints: ["/listings", "/auta/*"],
    wiredInProduct: true,
    pricesKc: { 7: 390, 14: 690, 30: 1190 },
  },
  {
    id: "listing_inline",
    label: "Mezi inzeráty",
    shortLabel: "Mezi inzeráty",
    description:
      "Přirozená karta v nabídce aut, vždy jasně označená jako Reklama.",
    locationHint: "Seznam vozidel · mezi kartami",
    desktopSize: "Stejná šířka jako karta auta",
    mobileSize: "Plná šířka v mobilním seznamu",
    devices: "desktop_mobile",
    media: "native_card",
    aspect: "inline",
    exclusive: false,
    routeHints: ["/listings", "/"],
    wiredInProduct: true,
    pricesKc: { 7: 199, 14: 349, 30: 590 },
  },
  {
    id: "vehicle_detail_sidebar",
    label: "Detail vozidla",
    shortLabel: "Detail vozidla",
    description:
      "Vedle ceny a kontaktu na počítači; na mobilu pod údaji o autě — bez překrytí tlačítek.",
    locationHint: "Detail konkrétního auta",
    desktopSize: "300 × 600 px (sloupec)",
    mobileSize: "360 × 200 px (pod údaji)",
    devices: "desktop_mobile",
    media: "image_video",
    aspect: "sidebar",
    exclusive: false,
    routeHints: ["/listing/:id", "/auta/:brand/:model/:id"],
    wiredInProduct: true,
    pricesKc: { 7: 149, 14: 249, 30: 449 },
  },
  {
    id: "featured_top",
    label: "Doporučené automobily",
    shortLabel: "Doporučené",
    description:
      "Výrazný promo blok v sekci Doporučené na hlavní stránce.",
    locationHint: "Hlavní stránka · Doporučené",
    desktopSize: "Široký promo blok",
    mobileSize: "Kompaktní promo",
    devices: "desktop_mobile",
    media: "image",
    aspect: "featured",
    exclusive: false,
    routeHints: ["/"],
    wiredInProduct: true,
    pricesKc: { 7: 290, 14: 490, 30: 890 },
  },
  {
    id: "category_brand",
    label: "Kategorie a značky",
    shortLabel: "Značky",
    description:
      "Na stránkách značek (BMW, Škoda…) — u lidí, kteří už vědí, co hledají.",
    locationHint: "Stránky značek",
    desktopSize: "Široký banner",
    mobileSize: "Adaptivní banner",
    devices: "desktop_mobile",
    media: "image",
    aspect: "banner",
    exclusive: false,
    routeHints: ["/auta/:brand", "/prodej/*"],
    wiredInProduct: true,
    pricesKc: { 7: 199, 14: 349, 30: 590 },
  },
  {
    id: "sell_car",
    label: "Prodat auto",
    shortLabel: "Prodat auto",
    description:
      "Na stránce pro prodejce — vhodné pro pojištění, servis či dealerství.",
    locationHint: "Stránka Prodat auto",
    desktopSize: "Banner / karta",
    mobileSize: "Karta pod úvodem",
    devices: "desktop_mobile",
    media: "image",
    aspect: "banner",
    exclusive: false,
    routeHints: ["/prodat-auto", "/add-listing"],
    wiredInProduct: true,
    pricesKc: { 7: 149, 14: 249, 30: 449 },
  },
];

export function getAdPlacement(
  id: AdPlacementId,
): AdPlacementCatalogItem | undefined {
  return AD_PLACEMENT_CATALOG.find((p) => p.id === id);
}

export function getAdPriceKc(
  placementId: AdPlacementId,
  days: AdDurationDays,
): number {
  const item = getAdPlacement(placementId);
  if (!item) return 0;
  return item.pricesKc[days] ?? 0;
}

export function addDaysIso(startIso: string, days: number): string {
  const d = new Date(`${startIso}T12:00:00`);
  if (!Number.isFinite(d.getTime())) return startIso;
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export const AD_CAMPAIGN_STATUSES = [
  "draft",
  "pending_payment",
  "pending_approval",
  "approved",
  "scheduled",
  "active",
  "paused",
  "rejected",
  "completed",
  "cancelled",
] as const;

export type AdCampaignStatus = (typeof AD_CAMPAIGN_STATUSES)[number];

/** Statuses that may render on public pages */
export const AD_LIVE_STATUSES: AdCampaignStatus[] = [
  "approved",
  "scheduled",
  "active",
];
