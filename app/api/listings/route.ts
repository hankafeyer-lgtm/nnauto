import { NextRequest } from "next/server";
import { json, error, withAuth } from "@/lib/api-helpers";
import { storage } from "@/lib/storage";
import { db } from "@/lib/db";
import { listings as listingsTable, insertListingSchema } from "@shared/schema";
import {
  eq,
  and,
  or,
  gte,
  lte,
  ilike,
  desc,
  asc,
  sql,
  type SQL,
} from "drizzle-orm";

// ---------------------------------------------------------------------------
// Utility helpers (ported from server/routes.ts)
// ---------------------------------------------------------------------------

type SortKey =
  | "newest"
  | "oldest"
  | "price-asc"
  | "price-desc"
  | "year-asc"
  | "year-desc"
  | "mileage-asc"
  | "mileage-desc";

const normalizeText = (str: string) =>
  String(str)
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const normalizeVehicleTypeFilterKey = (value: string) => {
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

const slugify = (str: string) =>
  normalizeText(str)
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

const toNumber = (v: unknown) => {
  const n =
    typeof v === "number" ? v : typeof v === "string" ? parseFloat(v) : NaN;
  return Number.isFinite(n) ? n : undefined;
};

const toInt = (v: unknown) => {
  const n =
    typeof v === "number"
      ? Math.trunc(v)
      : typeof v === "string"
        ? parseInt(v, 10)
        : NaN;
  return Number.isFinite(n) ? n : undefined;
};

const toBool = (v: unknown) => v === "true" || v === true;

const parseCsv = (v: unknown) => {
  if (typeof v !== "string") return [];
  return v
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
};

const dateMs = (d: unknown) => {
  const t = d ? new Date(d as string | number | Date).getTime() : 0;
  return Number.isFinite(t) ? t : 0;
};

const normalizeSort = (s: unknown): SortKey => {
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
};

const compareBySort = (a: Record<string, unknown>, b: Record<string, unknown>, sort: SortKey) => {
  switch (sort) {
    case "price-asc": {
      const ap = toNumber(a.price) ?? Number.POSITIVE_INFINITY;
      const bp = toNumber(b.price) ?? Number.POSITIVE_INFINITY;
      return ap - bp;
    }
    case "price-desc": {
      const ap = toNumber(a.price) ?? 0;
      const bp = toNumber(b.price) ?? 0;
      return bp - ap;
    }
    case "year-asc":
      return (toInt(a.year) ?? 0) - (toInt(b.year) ?? 0);
    case "year-desc":
      return (toInt(b.year) ?? 0) - (toInt(a.year) ?? 0);
    case "mileage-asc":
      return (toInt(a.mileage) ?? 0) - (toInt(b.mileage) ?? 0);
    case "mileage-desc":
      return (toInt(b.mileage) ?? 0) - (toInt(a.mileage) ?? 0);
    case "oldest":
      return dateMs(a.createdAt) - dateMs(b.createdAt);
    case "newest":
    default:
      return dateMs(b.createdAt) - dateMs(a.createdAt);
  }
};

/** Read a single search-param value as a trimmed string or "" */
function qStr(params: URLSearchParams, key: string): string {
  return (params.get(key) ?? "").trim();
}

// ---------------------------------------------------------------------------
// GET /api/listings
// ---------------------------------------------------------------------------

export async function GET(req: NextRequest) {
  try {
    const params = req.nextUrl.searchParams;

    const sort = normalizeSort(params.get("sort"));
    const pageNum = Math.max(1, toInt(params.get("page")) ?? 1);
    const limitNum = Math.min(100, Math.max(1, toInt(params.get("limit")) ?? 20));
    const countOnly = toBool(params.get("countOnly"));

    // Fast path: no filters ⇒ DB pagination/sort directly
    const allowedNonFilterKeys = new Set(["page", "limit", "sort", "countOnly"]);
    const hasAnyFilters = Array.from(params.keys()).some(
      (k) => !allowedNonFilterKeys.has(k),
    );

    if (!hasAnyFilters) {
      const totalRow = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(listingsTable);
      const total = Number(totalRow?.[0]?.count ?? 0);

      const totalPages = Math.max(1, Math.ceil(total / limitNum));
      const safePage = Math.min(pageNum, totalPages);
      const start = (safePage - 1) * limitNum;

      if (countOnly) {
        return json({
          listings: [],
          pagination: { total, page: safePage, limit: limitNum, totalPages, hasMore: safePage * limitNum < total },
        });
      }

      const orderBy = buildOrderBy(sort);

      const paginated = await db
        .select()
        .from(listingsTable)
        .orderBy(...orderBy)
        .limit(limitNum)
        .offset(start);

      return json({
        listings: paginated,
        pagination: { total, page: safePage, limit: limitNum, totalPages, hasMore: safePage * limitNum < total },
      });
    }

    // -----------------------------------------------------------------------
    // Filtered path: build DB pre-filters, then apply in-memory post-filters
    // -----------------------------------------------------------------------
    const dbPrefilters: SQL[] = [];

    const userIdPrefilter = qStr(params, "userId");
    if (userIdPrefilter) {
      dbPrefilters.push(eq(listingsTable.userId, userIdPrefilter));
    }

    const searchPrefilter = qStr(params, "search");
    if (searchPrefilter) {
      const s = `%${searchPrefilter}%`;
      dbPrefilters.push(
        or(
          ilike(listingsTable.brand, s),
          ilike(listingsTable.model, s),
          ilike(listingsTable.title, s),
          ilike(listingsTable.description, s),
        ) as SQL,
      );
    }

    const priceMinPre = toNumber(params.get("priceMin"));
    const priceMaxPre = toNumber(params.get("priceMax"));
    if (priceMinPre !== undefined)
      dbPrefilters.push(gte(listingsTable.price, String(priceMinPre)));
    if (priceMaxPre !== undefined)
      dbPrefilters.push(lte(listingsTable.price, String(priceMaxPre)));

    const yearMinPre = toInt(params.get("yearMin"));
    const yearMaxPre = toInt(params.get("yearMax"));
    if (yearMinPre !== undefined)
      dbPrefilters.push(gte(listingsTable.year, yearMinPre));
    if (yearMaxPre !== undefined)
      dbPrefilters.push(lte(listingsTable.year, yearMaxPre));

    const mileageMinPre = toInt(params.get("mileageMin"));
    const mileageMaxPre = toInt(params.get("mileageMax"));
    if (mileageMinPre !== undefined)
      dbPrefilters.push(gte(listingsTable.mileage, mileageMinPre));
    if (mileageMaxPre !== undefined)
      dbPrefilters.push(lte(listingsTable.mileage, mileageMaxPre));

    const powerMinPre = toInt(params.get("powerMin"));
    const powerMaxPre = toInt(params.get("powerMax"));
    if (powerMinPre !== undefined)
      dbPrefilters.push(gte(listingsTable.power, powerMinPre));
    if (powerMaxPre !== undefined)
      dbPrefilters.push(lte(listingsTable.power, powerMaxPre));

    if (toBool(params.get("hasServiceBook"))) {
      dbPrefilters.push(eq(listingsTable.hasServiceBook, true));
    }

    const listingAgeMinPre = toInt(params.get("listingAgeMin"));
    const listingAgeMaxPre = toInt(params.get("listingAgeMax"));
    if (listingAgeMinPre !== undefined) {
      const maxDate = new Date();
      maxDate.setDate(maxDate.getDate() - listingAgeMinPre);
      dbPrefilters.push(lte(listingsTable.createdAt, maxDate));
    }
    if (listingAgeMaxPre !== undefined) {
      const minDate = new Date();
      minDate.setDate(minDate.getDate() - listingAgeMaxPre);
      dbPrefilters.push(gte(listingsTable.createdAt, minDate));
    }

    let allListings: Record<string, unknown>[] =
      dbPrefilters.length > 0
        ? await db
            .select()
            .from(listingsTable)
            .where(and(...dbPrefilters))
        : await storage.getListings();

    // ----- In-memory post-filters (match Express behaviour exactly) -----

    const userId = qStr(params, "userId");
    if (userId)
      allListings = allListings.filter((l) => String(l.userId || "") === userId);

    const search = qStr(params, "search");
    if (search) {
      const s = normalizeText(search);
      allListings = allListings.filter((l) => {
        const b = normalizeText(String(l.brand || ""));
        const m = normalizeText(String(l.model || ""));
        const t = normalizeText(String(l.title || ""));
        const d = normalizeText(String(l.description || ""));
        return b.includes(s) || m.includes(s) || t.includes(s) || d.includes(s);
      });
    }

    const brand = qStr(params, "brand");
    if (brand) {
      const b = normalizeText(brand);
      allListings = allListings.filter(
        (l) => normalizeText(String(l.brand || "")) === b,
      );
    }

    const model = qStr(params, "model");
    if (model) {
      const wanted = slugify(model);
      allListings = allListings.filter(
        (l) => slugify(String(l.model || "")) === wanted,
      );
    }

    const generation = qStr(params, "generation");
    if (generation) {
      const wanted = slugify(generation);
      allListings = allListings.filter((l) => {
        const generationSource =
          (l as Record<string, unknown>).generation as string | undefined ||
          (l.trim as string) ||
          "";
        return slugify(generationSource) === wanted;
      });
    }

    const priceMin = toNumber(params.get("priceMin"));
    const priceMax = toNumber(params.get("priceMax"));
    if (priceMin !== undefined)
      allListings = allListings.filter((l) => (toNumber(l.price) ?? 0) >= priceMin);
    if (priceMax !== undefined)
      allListings = allListings.filter((l) => (toNumber(l.price) ?? 0) <= priceMax);

    const yearMin = toInt(params.get("yearMin"));
    const yearMax = toInt(params.get("yearMax"));
    if (yearMin !== undefined)
      allListings = allListings.filter((l) => (toInt(l.year) ?? 0) >= yearMin);
    if (yearMax !== undefined)
      allListings = allListings.filter((l) => (toInt(l.year) ?? 0) <= yearMax);

    const mileageMin = toInt(params.get("mileageMin"));
    const mileageMax = toInt(params.get("mileageMax"));
    if (mileageMin !== undefined)
      allListings = allListings.filter((l) => (toInt(l.mileage) ?? 0) >= mileageMin);
    if (mileageMax !== undefined)
      allListings = allListings.filter((l) => (toInt(l.mileage) ?? 0) <= mileageMax);

    // fuel → listing.fuelType[]
    const fuel = qStr(params, "fuel");
    if (fuel) {
      const wanted = parseCsv(fuel).map(normalizeText);
      allListings = allListings.filter((l) =>
        (Array.isArray(l.fuelType) ? l.fuelType : []).some((v: unknown) =>
          wanted.includes(normalizeText(String(v))),
        ),
      );
    }

    // bodyType → listing.bodyType (string)
    const bodyType = qStr(params, "bodyType");
    if (bodyType) {
      const wanted = parseCsv(bodyType).map(normalizeText);
      allListings = allListings.filter((l) =>
        wanted.includes(normalizeText(String(l.bodyType || ""))),
      );
    }

    // transmission → listing.transmission[]
    const transmission = qStr(params, "transmission");
    if (transmission) {
      const wanted = parseCsv(transmission).map(normalizeText);
      allListings = allListings.filter((l) =>
        (Array.isArray(l.transmission) ? l.transmission : []).some((v: unknown) =>
          wanted.includes(normalizeText(String(v))),
        ),
      );
    }

    const color = qStr(params, "color");
    if (color) {
      allListings = allListings.filter(
        (l) => normalizeText(String(l.color || "")) === normalizeText(color),
      );
    }

    const trimParam = qStr(params, "trim");
    if (trimParam) {
      allListings = allListings.filter((l) =>
        normalizeText(String(l.trim || "")).includes(normalizeText(trimParam)),
      );
    }

    const region = qStr(params, "region");
    if (region) {
      allListings = allListings.filter(
        (l) => normalizeText(String(l.region || "")) === normalizeText(region),
      );
    }

    // driveType → listing.driveType[]
    const driveType = qStr(params, "driveType");
    if (driveType) {
      const wanted = parseCsv(driveType).map(normalizeText);
      allListings = allListings.filter((l) =>
        (Array.isArray(l.driveType) ? l.driveType : []).some((v: unknown) =>
          wanted.includes(normalizeText(String(v))),
        ),
      );
    }

    const category = qStr(params, "category");
    if (category) {
      allListings = allListings.filter(
        (l) => normalizeText(String(l.category || "")) === normalizeText(category),
      );
    }

    // vehicleType (supports both ?vehicleType= and ?vehicle_type=)
    const rawVehicleType = qStr(params, "vehicleType") || qStr(params, "vehicle_type");
    if (rawVehicleType) {
      const wanted = parseCsv(rawVehicleType).map(normalizeVehicleTypeFilterKey);
      allListings = allListings.filter((l) =>
        wanted.includes(normalizeVehicleTypeFilterKey(String(l.vehicleType || ""))),
      );
    }

    const engineMin = toNumber(params.get("engineMin"));
    const engineMax = toNumber(params.get("engineMax"));
    if (engineMin !== undefined)
      allListings = allListings.filter((l) => (toNumber(l.engineVolume) ?? -1) >= engineMin);
    if (engineMax !== undefined)
      allListings = allListings.filter(
        (l) => (toNumber(l.engineVolume) ?? Number.MAX_SAFE_INTEGER) <= engineMax,
      );

    const powerMin = toInt(params.get("powerMin"));
    const powerMax = toInt(params.get("powerMax"));
    if (powerMin !== undefined)
      allListings = allListings.filter((l) => (toInt(l.power) ?? -1) >= powerMin);
    if (powerMax !== undefined)
      allListings = allListings.filter(
        (l) => (toInt(l.power) ?? Number.MAX_SAFE_INTEGER) <= powerMax,
      );

    const doorsMin = toInt(params.get("doorsMin"));
    const doorsMax = toInt(params.get("doorsMax"));
    if (doorsMin !== undefined)
      allListings = allListings.filter((l) => (toInt(l.doors) ?? -1) >= doorsMin);
    if (doorsMax !== undefined)
      allListings = allListings.filter(
        (l) => (toInt(l.doors) ?? Number.MAX_SAFE_INTEGER) <= doorsMax,
      );

    const seatsMin = toInt(params.get("seatsMin"));
    const seatsMax = toInt(params.get("seatsMax"));
    if (seatsMin !== undefined)
      allListings = allListings.filter((l) => (toInt(l.seats) ?? -1) >= seatsMin);
    if (seatsMax !== undefined)
      allListings = allListings.filter(
        (l) => (toInt(l.seats) ?? Number.MAX_SAFE_INTEGER) <= seatsMax,
      );

    const ownersMin = toInt(params.get("ownersMin"));
    const ownersMax = toInt(params.get("ownersMax"));
    if (ownersMin !== undefined)
      allListings = allListings.filter((l) => (toInt(l.owners) ?? -1) >= ownersMin);
    if (ownersMax !== undefined)
      allListings = allListings.filter(
        (l) => (toInt(l.owners) ?? Number.MAX_SAFE_INTEGER) <= ownersMax,
      );

    const airbagsMin = toInt(params.get("airbagsMin"));
    const airbagsMax = toInt(params.get("airbagsMax"));
    if (airbagsMin !== undefined)
      allListings = allListings.filter((l) => (toInt(l.airbags) ?? -1) >= airbagsMin);
    if (airbagsMax !== undefined)
      allListings = allListings.filter(
        (l) => (toInt(l.airbags) ?? Number.MAX_SAFE_INTEGER) <= airbagsMax,
      );

    const sellerType = qStr(params, "sellerType");
    if (sellerType) {
      allListings = allListings.filter(
        (l) => normalizeText(String(l.sellerType || "")) === normalizeText(sellerType),
      );
    }

    const listingAgeMin = toInt(params.get("listingAgeMin"));
    const listingAgeMax = toInt(params.get("listingAgeMax"));
    if (listingAgeMin !== undefined) {
      const maxDate = new Date();
      maxDate.setDate(maxDate.getDate() - listingAgeMin);
      const maxMs = maxDate.getTime();
      allListings = allListings.filter((l) => dateMs(l.createdAt) <= maxMs);
    }
    if (listingAgeMax !== undefined) {
      const minDate = new Date();
      minDate.setDate(minDate.getDate() - listingAgeMax);
      const minMs = minDate.getTime();
      allListings = allListings.filter((l) => dateMs(l.createdAt) >= minMs);
    }

    const equipment = qStr(params, "equipment");
    if (equipment) {
      const needed = parseCsv(equipment).map(normalizeText);
      allListings = allListings.filter((l) => {
        const arr = Array.isArray(l.equipment) ? l.equipment : [];
        if (!arr.length) return false;
        const norm = arr.map((x: unknown) => normalizeText(String(x)));
        return needed.every((n) => norm.includes(n));
      });
    }

    const condition = qStr(params, "condition");
    if (condition) {
      const wanted = parseCsv(condition).map(normalizeText);
      allListings = allListings.filter((l) =>
        wanted.includes(normalizeText(String(l.condition || ""))),
      );
    }

    const extras = qStr(params, "extras");
    if (extras) {
      const wanted = parseCsv(extras).map(normalizeText);
      allListings = allListings.filter((l) => {
        const arr = Array.isArray(l.extras) ? l.extras : [];
        if (!arr.length) return false;
        const norm = arr.map((x: unknown) => normalizeText(String(x)));
        return wanted.some((w) => norm.includes(w));
      });
    }

    if (toBool(params.get("hasServiceBook"))) {
      allListings = allListings.filter((l) => l.hasServiceBook === true);
    }

    // -----------------------------------------------------------------------
    // Pagination & sorting
    // -----------------------------------------------------------------------
    const total = allListings.length;
    const totalPages = Math.max(1, Math.ceil(total / limitNum));
    const safePage = Math.min(pageNum, totalPages);

    if (countOnly) {
      return json({
        listings: [],
        pagination: { total, page: safePage, limit: limitNum, totalPages, hasMore: safePage * limitNum < total },
      });
    }

    // TOP listings first, then by requested sort, then newest as tiebreaker
    allListings.sort((a, b) => {
      const aTop = !!a.isTopListing;
      const bTop = !!b.isTopListing;
      if (aTop && !bTop) return -1;
      if (!aTop && bTop) return 1;

      const by = compareBySort(a, b, sort);
      if (by !== 0) return by;

      return dateMs(b.createdAt) - dateMs(a.createdAt);
    });

    const start = (safePage - 1) * limitNum;
    const paginated = allListings.slice(start, start + limitNum);

    return json({
      listings: paginated,
      pagination: { total, page: safePage, limit: limitNum, totalPages, hasMore: safePage * limitNum < total },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return error(message, 500);
  }
}

// ---------------------------------------------------------------------------
// Helper: build Drizzle orderBy array for fast-path queries
// ---------------------------------------------------------------------------

function buildOrderBy(sort: SortKey) {
  const orderBy: ReturnType<typeof desc>[] = [desc(listingsTable.isTopListing)];

  switch (sort) {
    case "oldest":
      orderBy.push(asc(listingsTable.createdAt));
      break;
    case "price-asc":
      orderBy.push(asc(listingsTable.price));
      break;
    case "price-desc":
      orderBy.push(desc(listingsTable.price));
      break;
    case "year-asc":
      orderBy.push(asc(listingsTable.year));
      break;
    case "year-desc":
      orderBy.push(desc(listingsTable.year));
      break;
    case "mileage-asc":
      orderBy.push(asc(listingsTable.mileage));
      break;
    case "mileage-desc":
      orderBy.push(desc(listingsTable.mileage));
      break;
    case "newest":
    default:
      orderBy.push(desc(listingsTable.createdAt));
      break;
  }

  // Stable tiebreaker
  orderBy.push(desc(listingsTable.createdAt));
  return orderBy;
}

// ---------------------------------------------------------------------------
// POST /api/listings  (authenticated)
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  return withAuth(async (_req, user) => {
    try {
      const body = await _req.json();
      const validatedData = insertListingSchema.parse(body);

      if (validatedData.userId !== user.id) {
        return error("Cannot create listing for another user", 403);
      }

      const listing = await storage.createListing(validatedData);
      return json(listing);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Bad request";
      return error(message, 400);
    }
  }, req);
}
