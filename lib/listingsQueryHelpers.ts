export type SortKey =
  | "newest"
  | "oldest"
  | "price-asc"
  | "price-desc"
  | "year-asc"
  | "year-desc"
  | "mileage-asc"
  | "mileage-desc";

export const normalizeText = (str: string) =>
  String(str)
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

export const normalizeVehicleTypeFilterKey = (value: string) => {
  const normalized = normalizeText(value)
    .replace(/[\s_/]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  const aliases: Record<string, string> = {
    "osobni-auta": "osobni-auta",
    "osobni-auto": "osobni-auta",
    osobni: "osobni-auta",
    dodavky: "dodavky",
    dodavka: "dodavky",
    "nakladni-vozy": "nakladni-vozy",
    "nakladni-vuz": "nakladni-vozy",
    nakladni: "nakladni-vozy",
    motorky: "motorky",
    motorka: "motorky",
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

export const slugify = (str: string) =>
  normalizeText(str)
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

export const toNumber = (v: unknown) => {
  const n =
    typeof v === "number" ? v : typeof v === "string" ? parseFloat(v) : NaN;
  return Number.isFinite(n) ? n : undefined;
};

export const toInt = (v: unknown) => {
  const n =
    typeof v === "number"
      ? Math.trunc(v)
      : typeof v === "string"
        ? parseInt(v, 10)
        : NaN;
  return Number.isFinite(n) ? n : undefined;
};

export const toBool = (v: unknown) => v === "true" || v === true;

export const parseCsv = (v: unknown) => {
  if (typeof v !== "string") return [];
  return v
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
};

export const dateMs = (d: unknown) => {
  const t = d ? new Date(d as string | number | Date).getTime() : 0;
  return Number.isFinite(t) ? t : 0;
};

export function normalizeSort(s: unknown): SortKey {
  if (typeof s !== "string") return "newest";
  const v = s.trim().toLowerCase();
  const allowed: SortKey[] = [
    "newest",
    "oldest",
    "price-asc",
    "price-desc",
    "year-asc",
    "year-desc",
    "mileage-asc",
    "mileage-desc",
  ];
  return allowed.includes(v as SortKey) ? (v as SortKey) : "newest";
}

export function qStr(params: URLSearchParams, key: string): string {
  return (params.get(key) ?? "").trim();
}

export function escapeIlikePattern(s: string) {
  return s.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}
