import { and, count, eq, gte, lte, or, sql, type SQL } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
import { db } from "./db";
import * as H from "./listingsQueryHelpers";
import { listings, type Listing } from "@shared/schema";
import { ensureSearchExtensions } from "./ensureSearchExtensions";

/**
 * Active TOP = paid flag on, and not past expiry.
 * Legacy rows often have `top_listing_expires_at = NULL` — still treat as active TOP
 * so rotation works without wiping existing promotions.
 */
const ACTIVE_TOP_SQL = `(is_top_listing = true AND (top_listing_expires_at IS NULL OR top_listing_expires_at > NOW()))`;

/** Stable chaotic order within the current UTC hour (same for all users until the hour flips). */
const TOP_HOUR_ROTATION_SQL = `md5(id::text || ':' || to_char(date_trunc('hour', NOW()), 'YYYY-MM-DD"T"HH24'))`;

/** Safe ORDER BY fragments (sort key is server-validated only). */
const ORDER_SQL: Record<H.SortKey, string> = {
  newest: `${ACTIVE_TOP_SQL} DESC,
    CASE WHEN ${ACTIVE_TOP_SQL} THEN ${TOP_HOUR_ROTATION_SQL} END ASC NULLS LAST,
    CASE WHEN NOT ${ACTIVE_TOP_SQL} THEN created_at END DESC NULLS LAST,
    created_at DESC`,
  oldest: `${ACTIVE_TOP_SQL} DESC,
    CASE WHEN ${ACTIVE_TOP_SQL} THEN ${TOP_HOUR_ROTATION_SQL} END ASC NULLS LAST,
    CASE WHEN NOT ${ACTIVE_TOP_SQL} THEN created_at END ASC NULLS LAST,
    created_at ASC`,
  "price-asc": `${ACTIVE_TOP_SQL} DESC,
    CASE WHEN ${ACTIVE_TOP_SQL} THEN ${TOP_HOUR_ROTATION_SQL} END ASC NULLS LAST,
    CASE WHEN NOT ${ACTIVE_TOP_SQL} THEN price::numeric END ASC NULLS LAST,
    created_at DESC`,
  "price-desc": `${ACTIVE_TOP_SQL} DESC,
    CASE WHEN ${ACTIVE_TOP_SQL} THEN ${TOP_HOUR_ROTATION_SQL} END ASC NULLS LAST,
    CASE WHEN NOT ${ACTIVE_TOP_SQL} THEN price::numeric END DESC NULLS LAST,
    created_at DESC`,
  "year-asc": `${ACTIVE_TOP_SQL} DESC,
    CASE WHEN ${ACTIVE_TOP_SQL} THEN ${TOP_HOUR_ROTATION_SQL} END ASC NULLS LAST,
    CASE WHEN NOT ${ACTIVE_TOP_SQL} THEN year END ASC NULLS LAST,
    created_at DESC`,
  "year-desc": `${ACTIVE_TOP_SQL} DESC,
    CASE WHEN ${ACTIVE_TOP_SQL} THEN ${TOP_HOUR_ROTATION_SQL} END ASC NULLS LAST,
    CASE WHEN NOT ${ACTIVE_TOP_SQL} THEN year END DESC NULLS LAST,
    created_at DESC`,
  "mileage-asc": `${ACTIVE_TOP_SQL} DESC,
    CASE WHEN ${ACTIVE_TOP_SQL} THEN ${TOP_HOUR_ROTATION_SQL} END ASC NULLS LAST,
    CASE WHEN NOT ${ACTIVE_TOP_SQL} THEN mileage END ASC NULLS LAST,
    created_at DESC`,
  "mileage-desc": `${ACTIVE_TOP_SQL} DESC,
    CASE WHEN ${ACTIVE_TOP_SQL} THEN ${TOP_HOUR_ROTATION_SQL} END ASC NULLS LAST,
    CASE WHEN NOT ${ACTIVE_TOP_SQL} THEN mileage END DESC NULLS LAST,
    created_at DESC`,
};

const CZ_FROM =
  "áčďéěíňóřšťúůýžÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ";
const CZ_TO = "acdeeinorstuuyzACDEEINORSTUUYZ";

/** Mirrors client `slugify`: normalize-ish + spaces to hyphens + strip non [a-z0-9-]. */
function sqlSlugEq(column: SQL, wanted: string): SQL {
  return sql`regexp_replace(
    regexp_replace(
      regexp_replace(lower(trim(${column})), E'\\\\s+', '-', 'g'),
      '[^a-z0-9-]+', '-', 'g'
    ),
    '-+', '-', 'g'
  ) = ${wanted}`;
}

/** Any listing array value matches any wanted token (case/diacritics relaxed like other filters). */
function sqlArrayIntersectsNormalized(
  col: AnyPgColumn,
  wanted: string[],
): SQL | undefined {
  if (!wanted.length) return undefined;
  return sql`EXISTS (
    SELECT 1 FROM unnest(coalesce(${col}, ARRAY[]::text[])) AS x
    WHERE lower(translate(trim(x), ${CZ_FROM}, ${CZ_TO})) IN (${sql.join(
      wanted.map((w) => sql`${w}`),
      sql`, `,
    )})
  )`;
}

function buildWhereParts(
  params: URLSearchParams,
  ctx: { includeSoldListings: boolean },
): SQL[] {
  const parts: SQL[] = [];
  if (!ctx.includeSoldListings) {
    parts.push(eq(listings.isSold, false));
  }

  const userId = H.qStr(params, "userId");
  if (userId) {
    parts.push(eq(listings.userId, userId));
  }

  const search = H.qStr(params, "search");
  if (search) {
    const s = H.normalizeText(search);
    const pat = `%${H.escapeIlikePattern(s)}%`;
    // Strip diacritics from DB columns before comparing so queries
    // like "skoda" find "Škoda" and "citren" finds "Citroën".
    // translate(col, CZ_FROM, CZ_TO) mirrors what normalizeText()
    // does on the input side — same approach the brand/model filters
    // already use.
    parts.push(
      or(
        sql`lower(translate(${listings.brand}, ${CZ_FROM}, ${CZ_TO})) LIKE ${pat} ESCAPE '\\'`,
        sql`lower(translate(${listings.model}, ${CZ_FROM}, ${CZ_TO})) LIKE ${pat} ESCAPE '\\'`,
        sql`lower(translate(COALESCE(${listings.title}, ''), ${CZ_FROM}, ${CZ_TO})) LIKE ${pat} ESCAPE '\\'`,
        sql`lower(translate(COALESCE(${listings.description}, ''), ${CZ_FROM}, ${CZ_TO})) LIKE ${pat} ESCAPE '\\'`,
      )!,
    );
  }

  const brand = H.qStr(params, "brand");
  if (brand) {
    const b = H.normalizeText(brand);
    parts.push(
      sql`lower(translate(${listings.brand}, ${CZ_FROM}, ${CZ_TO})) = ${b}`,
    );
  }

  const model = H.qStr(params, "model");
  if (model) {
    const wanted = H.slugify(model);
    parts.push(sqlSlugEq(sql`${listings.model}`, wanted));
  }

  const generation = H.qStr(params, "generation");
  if (generation) {
    const wanted = H.slugify(generation);
    parts.push(sqlSlugEq(sql`coalesce(${listings.trim}, '')`, wanted));
  }

  const priceMin = H.toNumber(params.get("priceMin"));
  const priceMax = H.toNumber(params.get("priceMax"));
  if (priceMin !== undefined) {
    parts.push(gte(sql`${listings.price}::numeric`, String(priceMin)));
  }
  if (priceMax !== undefined) {
    parts.push(lte(sql`${listings.price}::numeric`, String(priceMax)));
  }

  const yearMin = H.toInt(params.get("yearMin"));
  const yearMax = H.toInt(params.get("yearMax"));
  if (yearMin !== undefined) parts.push(gte(listings.year, yearMin));
  if (yearMax !== undefined) parts.push(lte(listings.year, yearMax));

  const mileageMin = H.toInt(params.get("mileageMin"));
  const mileageMax = H.toInt(params.get("mileageMax"));
  if (mileageMin !== undefined) parts.push(gte(listings.mileage, mileageMin));
  if (mileageMax !== undefined) parts.push(lte(listings.mileage, mileageMax));

  const fuel = H.qStr(params, "fuel");
  if (fuel) {
    const wanted = H.parseCsv(fuel).map(H.normalizeText).filter(Boolean);
    const cond = sqlArrayIntersectsNormalized(listings.fuelType, wanted);
    if (cond) parts.push(cond);
  }

  const bodyType = H.qStr(params, "bodyType");
  if (bodyType) {
    const wanted = H.parseCsv(bodyType).map(H.normalizeText);
    const ors = wanted.map(
      (w) =>
        sql`lower(translate(${listings.bodyType}, ${CZ_FROM}, ${CZ_TO})) = ${w}`,
    );
    if (ors.length === 1) parts.push(ors[0]);
    else if (ors.length > 1) parts.push(or(...(ors as [SQL, SQL, ...SQL[]]))!);
  }

  const transmission = H.qStr(params, "transmission");
  if (transmission) {
    const wanted = H.parseCsv(transmission).map(H.normalizeText).filter(Boolean);
    const cond = sqlArrayIntersectsNormalized(listings.transmission, wanted);
    if (cond) parts.push(cond);
  }

  const color = H.qStr(params, "color");
  if (color) {
    parts.push(
      sql`lower(translate(${listings.color}, ${CZ_FROM}, ${CZ_TO})) = ${H.normalizeText(color)}`,
    );
  }

  const trimParam = H.qStr(params, "trim");
  if (trimParam) {
    const t = H.normalizeText(trimParam);
    parts.push(
      sql`regexp_replace(lower(trim(coalesce(${listings.trim}, ''))), E'\\\\s+', '-', 'g') LIKE ${"%" + H.escapeIlikePattern(t) + "%"} ESCAPE '\\'`,
    );
  }

  const region = H.qStr(params, "region");
  if (region) {
    parts.push(
      sql`lower(translate(${listings.region}, ${CZ_FROM}, ${CZ_TO})) = ${H.normalizeText(region)}`,
    );
  }

  const driveType = H.qStr(params, "driveType");
  if (driveType) {
    const wanted = H.parseCsv(driveType).map(H.normalizeText).filter(Boolean);
    const cond = sqlArrayIntersectsNormalized(listings.driveType, wanted);
    if (cond) parts.push(cond);
  }

  const category = H.qStr(params, "category");
  if (category) {
    parts.push(
      sql`lower(translate(${listings.category}, ${CZ_FROM}, ${CZ_TO})) = ${H.normalizeText(category)}`,
    );
  }

  const rawVehicleType =
    H.qStr(params, "vehicleType") || H.qStr(params, "vehicle_type");
  if (rawVehicleType) {
    const wanted = H.parseCsv(rawVehicleType).map(H.normalizeVehicleTypeFilterKey);
    const ors = wanted.map(
      (w) =>
        sql`lower(translate(replace(replace(replace(lower(${listings.vehicleType}), '_', '-'), '/', '-'), ' ', '-'), ${CZ_FROM}, ${CZ_TO})) = ${w}`,
    );
    if (ors.length === 1) parts.push(ors[0]);
    else if (ors.length > 1) parts.push(or(...(ors as [SQL, SQL, ...SQL[]]))!);
  }

  const engineMin = H.toNumber(params.get("engineMin"));
  const engineMax = H.toNumber(params.get("engineMax"));
  if (engineMin !== undefined) {
    parts.push(gte(sql`${listings.engineVolume}::numeric`, String(engineMin)));
  }
  if (engineMax !== undefined) {
    parts.push(lte(sql`${listings.engineVolume}::numeric`, String(engineMax)));
  }

  const powerMin = H.toInt(params.get("powerMin"));
  const powerMax = H.toInt(params.get("powerMax"));
  if (powerMin !== undefined) parts.push(gte(listings.power, powerMin));
  if (powerMax !== undefined) parts.push(lte(listings.power, powerMax));

  const doorsMin = H.toInt(params.get("doorsMin"));
  const doorsMax = H.toInt(params.get("doorsMax"));
  if (doorsMin !== undefined) parts.push(gte(listings.doors, doorsMin));
  if (doorsMax !== undefined) parts.push(lte(listings.doors, doorsMax));

  const seatsMin = H.toInt(params.get("seatsMin"));
  const seatsMax = H.toInt(params.get("seatsMax"));
  if (seatsMin !== undefined) parts.push(gte(listings.seats, seatsMin));
  if (seatsMax !== undefined) parts.push(lte(listings.seats, seatsMax));

  const ownersMin = H.toInt(params.get("ownersMin"));
  const ownersMax = H.toInt(params.get("ownersMax"));
  if (ownersMin !== undefined) parts.push(gte(listings.owners, ownersMin));
  if (ownersMax !== undefined) parts.push(lte(listings.owners, ownersMax));

  const airbagsMin = H.toInt(params.get("airbagsMin"));
  const airbagsMax = H.toInt(params.get("airbagsMax"));
  if (airbagsMin !== undefined) parts.push(gte(listings.airbags, airbagsMin));
  if (airbagsMax !== undefined) parts.push(lte(listings.airbags, airbagsMax));

  const sellerType = H.qStr(params, "sellerType");
  if (sellerType) {
    parts.push(
      sql`lower(translate(${listings.sellerType}, ${CZ_FROM}, ${CZ_TO})) = ${H.normalizeText(sellerType)}`,
    );
  }

  const listingAgeMin = H.toInt(params.get("listingAgeMin"));
  const listingAgeMax = H.toInt(params.get("listingAgeMax"));
  if (listingAgeMin !== undefined) {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() - listingAgeMin);
    parts.push(lte(listings.createdAt, maxDate));
  }
  if (listingAgeMax !== undefined) {
    const minDate = new Date();
    minDate.setDate(minDate.getDate() - listingAgeMax);
    parts.push(gte(listings.createdAt, minDate));
  }

  const equipment = H.qStr(params, "equipment");
  if (equipment) {
    const needed = H.parseCsv(equipment).map(H.normalizeText).filter(Boolean);
    for (const n of needed) {
      parts.push(
        sql`EXISTS (
          SELECT 1 FROM unnest(coalesce(${listings.equipment}, ARRAY[]::text[])) AS e
          WHERE lower(translate(trim(e), ${CZ_FROM}, ${CZ_TO})) = ${n}
        )`,
      );
    }
  }

  const condition = H.qStr(params, "condition");
  if (condition) {
    const wanted = H.parseCsv(condition).map(H.normalizeText).filter(Boolean);
    if (wanted.length) {
      const ors = wanted.map(
        (w) =>
          sql`lower(translate(${listings.condition}, ${CZ_FROM}, ${CZ_TO})) = ${w}`,
      );
      if (ors.length === 1) parts.push(ors[0]);
      else parts.push(or(...(ors as [SQL, SQL, ...SQL[]]))!);
    }
  }

  const extras = H.qStr(params, "extras");
  if (extras) {
    const wanted = H.parseCsv(extras).map(H.normalizeText).filter(Boolean);
    const cond = sqlArrayIntersectsNormalized(listings.extras, wanted);
    if (cond) parts.push(cond);
  }

  if (H.toBool(params.get("hasServiceBook"))) {
    parts.push(eq(listings.hasServiceBook, true));
  }

  return parts;
}

/** Legacy TOP (null expiry) stays active; only past expiry drops the badge. */
function isActiveTopListing(listing: Listing): boolean {
  if (!listing.isTopListing) return false;
  if (!listing.topListingExpiresAt) return true;
  return new Date(listing.topListingExpiresAt).getTime() > Date.now();
}

function normalizeTopListingStatus(rows: Listing[]): Listing[] {
  return rows.map((listing) => {
    const activeTop = isActiveTopListing(listing);
    return activeTop === listing.isTopListing
      ? listing
      : { ...listing, isTopListing: activeTop };
  });
}

/**
 * Normalized brand+model expression used both for the trigram GIN index and
 * for the fuzzy-fallback WHERE clause.  Must be identical to the expression
 * inside ensureSearchExtensions.ts so Postgres picks up the index.
 */
const NORM_BRAND_MODEL = sql`lower(translate(brand || ' ' || model,
  ${CZ_FROM}, ${CZ_TO}))`;

export async function queryListingsFromDb(
  params: URLSearchParams,
  ctx: { includeSoldListings: boolean },
  opts?: { countOnly?: boolean },
): Promise<{
  rows: Listing[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  const parts = buildWhereParts(params, ctx);
  const where = (parts.length ? and(...parts) : undefined) ?? sql`true`;

  const sort = H.normalizeSort(params.get("sort"));
  const limitNum = Math.min(100, Math.max(1, H.toInt(params.get("limit")) ?? 20));
  const pageNum = Math.max(1, H.toInt(params.get("page")) ?? 1);
  const offset = (pageNum - 1) * limitNum;

  const runQuery = async (w: SQL) => {
    const orderSql = ORDER_SQL[sort];
    if (!opts?.countOnly && pageNum === 1) {
      const [countRows, rows] = await Promise.all([
        db.select({ c: count() }).from(listings).where(w),
        db.select().from(listings).where(w).orderBy(sql.raw(orderSql)).limit(limitNum).offset(offset),
      ]);
      const total = Number(countRows[0]?.c ?? 0);
      return {
        rows: normalizeTopListingStatus(rows),
        total,
        page: 1,
        limit: limitNum,
        totalPages: Math.max(1, Math.ceil(total / limitNum)),
      };
    }
    const [countRow] = await db.select({ c: count() }).from(listings).where(w);
    const total = Number(countRow?.c ?? 0);
    const totalPages = Math.max(1, Math.ceil(total / limitNum));
    const safePage = Math.min(pageNum, totalPages);
    const safeOffset = (safePage - 1) * limitNum;
    if (opts?.countOnly) return { rows: [] as Listing[], total, page: safePage, limit: limitNum, totalPages };
    const rows = await db.select().from(listings).where(w).orderBy(sql.raw(orderSql)).limit(limitNum).offset(safeOffset);
    return {
      rows: normalizeTopListingStatus(rows),
      total,
      page: safePage,
      limit: limitNum,
      totalPages,
    };
  };

  const primary = await runQuery(where);

  // Fuzzy fallback: when the exact (diacritics-stripped) search returns
  // 0 results AND the query looks like a short brand/model term (not a
  // big description phrase), retry with pg_trgm similarity on
  // brand||model. This catches typos like "oktavia" → Octavia,
  // "peugot" → Peugeot. The threshold (0.25) is intentionally loose —
  // users rarely type more than 1-2 wrong chars in a 5-8 letter word.
  const search = H.qStr(params, "search");
  if (primary.total === 0 && search && search.length >= 3 && search.length <= 40) {
    const s = H.normalizeText(search);
    try {
      await ensureSearchExtensions();
      // Build a WHERE that keeps all non-search filters but replaces
      // the exact search clause with a trigram similarity threshold.
      const fuzzyParts = buildWhereParts(params, ctx).filter((_p, i) => {
        // The search clause is the one we appended in buildWhereParts
        // at position after the isSold / userId filters. Since we
        // can't tag individual clauses, we rebuild without the search
        // param and add the fuzzy one instead.
        return true;
      });
      // Remove the exact search part by rebuilding without it.
      const paramsNoSearch = new URLSearchParams(params);
      paramsNoSearch.delete("search");
      const baseParts = buildWhereParts(paramsNoSearch, ctx);
      baseParts.push(
        sql`similarity(${NORM_BRAND_MODEL}, ${s}) > 0.25`,
      );
      const fuzzyWhere = baseParts.length ? and(...baseParts) : sql`true`;

      // Order by similarity desc (best match first), ignore user sort
      // for the fuzzy fallback — relevance matters more here.
      const fuzzyRows = await db
        .select()
        .from(listings)
        .where(fuzzyWhere)
        .orderBy(sql`similarity(${NORM_BRAND_MODEL}, ${s}) DESC`)
        .limit(limitNum);
      if (fuzzyRows.length > 0) {
        return {
          rows: normalizeTopListingStatus(fuzzyRows),
          total: fuzzyRows.length,
          page: 1,
          limit: limitNum,
          totalPages: 1,
        };
      }
    } catch {
      // pg_trgm not available or query failed — silently fall through
      // to empty result set. Non-fatal: the exact search already ran.
    }
  }

  return primary;
}
