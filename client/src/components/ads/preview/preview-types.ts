import type { AdPlacementId } from "@shared/adCatalog";

export type PreviewDevice = "desktop" | "tablet" | "mobile";

export type PreviewPageId =
  | "homepage"
  | "listings"
  | "detail"
  | "brand"
  | "sell";

export const PREVIEW_PAGES: {
  id: PreviewPageId;
  label: string;
}[] = [
  { id: "homepage", label: "Hlavní stránka" },
  { id: "listings", label: "Seznam vozidel" },
  { id: "detail", label: "Detail vozidla" },
  { id: "brand", label: "Značky" },
  { id: "sell", label: "Prodat auto" },
];

/** Which placements belong on which preview page */
export const PAGE_PLACEMENTS: Record<PreviewPageId, AdPlacementId[]> = {
  homepage: ["homepage_top", "featured_top"],
  listings: ["listing_top", "listing_inline"],
  detail: ["vehicle_detail_sidebar"],
  brand: ["category_brand"],
  sell: ["sell_car"],
};

export function pageForPlacement(id: AdPlacementId | null): PreviewPageId {
  if (!id) return "homepage";
  for (const [page, ids] of Object.entries(PAGE_PLACEMENTS) as [
    PreviewPageId,
    AdPlacementId[],
  ][]) {
    if (ids.includes(id)) return page;
  }
  return "homepage";
}

export type PreviewCar = {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuel: string;
  city: string;
  image: string;
  top?: boolean;
};

export const PREVIEW_CARS: PreviewCar[] = [
  {
    id: "p1",
    brand: "Škoda",
    model: "Octavia",
    year: 2021,
    price: 429000,
    mileage: 68000,
    fuel: "Diesel",
    city: "Praha",
    image:
      "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=70",
    top: true,
  },
  {
    id: "p2",
    brand: "BMW",
    model: "X5",
    year: 2019,
    price: 899000,
    mileage: 92000,
    fuel: "Benzín",
    city: "Brno",
    image:
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=70",
    top: true,
  },
  {
    id: "p3",
    brand: "Volkswagen",
    model: "Golf",
    year: 2020,
    price: 379000,
    mileage: 54000,
    fuel: "Benzín",
    city: "Ostrava",
    image:
      "https://images.unsplash.com/photo-1616422285623-13ff0162193b?auto=format&fit=crop&w=800&q=70",
  },
  {
    id: "p4",
    brand: "Audi",
    model: "A4",
    year: 2018,
    price: 459000,
    mileage: 110000,
    fuel: "Diesel",
    city: "Plzeň",
    image:
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=800&q=70",
  },
  {
    id: "p5",
    brand: "Mercedes-Benz",
    model: "C 200",
    year: 2022,
    price: 980000,
    mileage: 31000,
    fuel: "Hybrid",
    city: "Praha",
    image:
      "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=70",
  },
  {
    id: "p6",
    brand: "Toyota",
    model: "RAV4",
    year: 2021,
    price: 629000,
    mileage: 45000,
    fuel: "Hybrid",
    city: "Liberec",
    image:
      "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=800&q=70",
  },
];

export function formatPreviewCzk(n: number): string {
  return `${new Intl.NumberFormat("cs-CZ").format(n)} Kč`;
}
