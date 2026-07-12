import { db } from "@lib/db";
import { dealers, listings, dealerFeeds, insertListingSchema } from "@shared/schema";
import { and, eq, sql } from "drizzle-orm";
import { parseFeedXml, type MappedVehicle } from "./xmlImport";
import { dispatchVehicleWebhook } from "@lib/webhooks";
import dns from "node:dns/promises";
import net from "node:net";

const FETCH_TIMEOUT_MS = 25_000;
const MAX_FEED_BYTES = 30 * 1024 * 1024; // 30 MB
const MAX_FEED_REDIRECTS = 5;

export interface FeedDealerCtx {
  userId: string;
  dealerId: string;
  region?: string | null;
  phone?: string | null;
  maxListings: number;
}
export interface SyncSummary {
  itemCount: number;
  created: number;
  updated: number;
  deactivated: number;
  failed: number;
  errors: Array<{ item: string; error: string }>;
  coverage: Record<string, number>;
  warnings: string[];
}
export interface PreviewSummary {
  itemCount: number;
  coverage: Record<string, number>;
  warnings: string[];
  sample: MappedVehicle[];
  validCount: number;
  invalidCount: number;
}

function isPrivateIpv4(ip: string): boolean {
  const parts = ip.split(".").map((part) => Number(part));
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part))) return true;
  const [a, b] = parts;
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224
  );
}

function isPrivateIpv6(ip: string): boolean {
  const normalized = ip.toLowerCase();
  return (
    normalized === "::1" ||
    normalized === "::" ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    normalized.startsWith("fe80") ||
    normalized.startsWith("::ffff:127.") ||
    normalized.startsWith("::ffff:10.") ||
    normalized.startsWith("::ffff:192.168.") ||
    /^::ffff:172\.(1[6-9]|2\d|3[01])\./.test(normalized)
  );
}

function isBlockedIp(ip: string): boolean {
  if (ip === "169.254.169.254") return true;
  const version = net.isIP(ip);
  if (version === 4) return isPrivateIpv4(ip);
  if (version === 6) return isPrivateIpv6(ip);
  return true;
}

export async function validateFeedUrl(url: string): Promise<URL> {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("Neplatná URL feedu / Невалідна URL фіду");
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Feed musí používat http(s) / Фід має бути http(s)");
  }
  const host = parsed.hostname.toLowerCase();
  if (
    host === "localhost" ||
    host === "0.0.0.0" ||
    host === "[::1]" ||
    host.endsWith(".local") ||
    host.endsWith(".localhost")
  ) {
    throw new Error("Tato adresa není povolena / Ця адреса недоступна");
  }

  const hostForIp = host.replace(/^\[|\]$/g, "");
  const literalIp = net.isIP(hostForIp) ? hostForIp : null;
  if (literalIp && isBlockedIp(literalIp)) {
    throw new Error("Tato adresa není povolena / Ця адреса недоступна");
  }

  if (!literalIp) {
    const records = await dns.lookup(host, { all: true, verbatim: true });
    if (!records.length || records.some((record) => isBlockedIp(record.address))) {
      throw new Error("Tato adresa není povolena / Ця адреса недоступна");
    }
  }

  return parsed;
}

/** Fetch the feed body with a timeout and a hard size cap. */
export async function fetchFeed(url: string): Promise<string> {
  let currentUrl = url;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    let res: Response | null = null;
    for (let redirectCount = 0; redirectCount <= MAX_FEED_REDIRECTS; redirectCount++) {
      const parsed = await validateFeedUrl(currentUrl);
      res = await fetch(parsed.toString(), {
        signal: controller.signal,
        headers: { "User-Agent": "NNAuto-FeedImporter/1.0", Accept: "application/xml, text/xml, */*" },
        redirect: "manual",
      });
      if (![301, 302, 303, 307, 308].includes(res.status)) break;
      const location = res.headers.get("location");
      if (!location) throw new Error("Feed redirect bez cíle / Redirect без URL");
      currentUrl = new URL(location, parsed).toString();
      res = null;
    }
    if (!res) throw new Error("Příliš mnoho redirectů / Забагато redirectів");
    if (!res.ok) {
      throw new Error(`Feed vrátil HTTP ${res.status} / Фід повернув HTTP ${res.status}`);
    }
    const reader = res.body?.getReader();
    if (!reader) return await res.text();
    const chunks: Uint8Array[] = [];
    let total = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        total += value.length;
        if (total > MAX_FEED_BYTES) {
          reader.cancel();
          throw new Error("Feed je příliš velký / Фід завеликий (>30MB)");
        }
        chunks.push(value);
      }
    }
    return new TextDecoder("utf-8").decode(Buffer.concat(chunks.map((c) => Buffer.from(c))));
  } catch (e) {
    if ((e as Error).name === "AbortError") {
      throw new Error("Časový limit feedu vypršel / Час очікування фіду вичерпано");
    }
    throw e;
  } finally {
    clearTimeout(timeout);
  }
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

/** Stable per-dealer id for dedup when the feed has no explicit id. */
function deriveExternalId(v: MappedVehicle): string | undefined {
  if (v.externalId) return v.externalId.trim().slice(0, 200);
  if (v.vin) return `vin-${v.vin}`;
  const parts = [v.brand, v.model, v.year, v.mileage, v.price].filter(Boolean);
  if (parts.length >= 3) return `auto-${slugify(parts.join("-"))}`;
  return undefined;
}

/**
 * Build an insert-ready listing object from a mapped vehicle, applying
 * dealer-level defaults and safe fallbacks. Returns null with a reason when a
 * hard-required field (brand/model/year/price) is missing.
 */
function toListingInput(
  v: MappedVehicle,
  ctx: FeedDealerCtx,
  externalId: string,
  feedId: string,
): { ok: true; data: Record<string, unknown> } | { ok: false; reason: string } {
  const missing: string[] = [];
  if (!v.brand) missing.push("brand");
  if (!v.model) missing.push("model");
  if (!v.year) missing.push("year");
  if (!v.price) missing.push("price");
  if (missing.length) {
    return { ok: false, reason: `Chybí povinná pole: ${missing.join(", ")}` };
  }

  const title = v.title || [v.brand, v.model, v.year].filter(Boolean).join(" ");
  const data: Record<string, unknown> = {
    userId: ctx.userId,
    source: "xml_feed",
    externalId,
    feedId,
    title,
    description: v.description || title,
    price: v.price,
    condition: v.condition || "used",
    vehicleType: v.vehicleType || "osobni-auta",
    brand: v.brand,
    model: v.model,
    year: v.year,
    mileage: v.mileage ?? 0,
    fuelType: v.fuelType?.length ? v.fuelType : ["benzin"],
    transmission: v.transmission?.length ? v.transmission : ["manual"],
    bodyType: v.bodyType,
    color: v.color || "neuvedeno",
    driveType: v.driveType?.length ? v.driveType : ["fwd"],
    engineVolume: v.engineVolume || "0",
    power: v.power && v.power > 0 ? v.power : 1,
    doors: v.doors,
    seats: v.seats,
    sellerType: "dealer",
    region: v.region || ctx.region || "Praha",
    phone: v.phone || ctx.phone || "000000000",
    vin: v.vin,
    photos: v.photos,
    isImported: true,
  };
  return { ok: true, data };
}

/** Parse-only preview (no DB writes). Used by the "Verify" button. */
export function buildPreview(xml: string): PreviewSummary {
  const { items, itemCount, coverage, warnings } = parseFeedXml(xml);
  let validCount = 0;
  let invalidCount = 0;
  for (const v of items) {
    if (v.brand && v.model && v.year && v.price) validCount++;
    else invalidCount++;
  }
  return {
    itemCount,
    coverage,
    warnings,
    sample: items.slice(0, 5),
    validCount,
    invalidCount,
  };
}

/**
 * Resolve (or create) the dealer_feeds row for a dealer. Used by all routes so
 * there is exactly one config row per dealer.
 */
export async function getOrCreateFeed(ctx: FeedDealerCtx, feedUrl?: string) {
  const [existing] = await db
    .select()
    .from(dealerFeeds)
    .where(eq(dealerFeeds.dealerId, ctx.dealerId));
  if (existing) return existing;
  const [created] = await db
    .insert(dealerFeeds)
    .values({
      dealerId: ctx.dealerId,
      userId: ctx.userId,
      feedUrl: feedUrl || "",
    })
    .returning();
  return created;
}

/**
 * Full sync: fetch + parse + upsert listings by externalId + deactivate
 * vehicles that disappeared from the feed. Updates dealer_feeds counters.
 */
export async function runFeedSync(ctx: FeedDealerCtx, feedUrl: string): Promise<SyncSummary> {
  const feed = await getOrCreateFeed(ctx, feedUrl);

  await db
    .update(dealerFeeds)
    .set({ status: "syncing", feedUrl, updatedAt: new Date() })
    .where(eq(dealerFeeds.id, feed.id));

  const summary: SyncSummary = {
    itemCount: 0,
    created: 0,
    updated: 0,
    deactivated: 0,
    failed: 0,
    errors: [],
    coverage: {},
    warnings: [],
  };

  try {
    const xml = await fetchFeed(feedUrl);
    const { items, itemCount, coverage, warnings } = parseFeedXml(xml);
    summary.itemCount = itemCount;
    summary.coverage = coverage;
    summary.warnings = warnings;

    // Deleted dealer listings still consume package slots, so removing a car
    // cannot be used to bypass the paid package limit.
    const countRes = (await db.execute(sql`
      SELECT
        (
          SELECT COUNT(*)::int FROM listings WHERE user_id = ${ctx.userId}
        ) +
        (
          SELECT COUNT(*)::int FROM deleted_listings WHERE user_id = ${ctx.userId}
        ) AS total
    `)) as any;
    let currentCount = countRes?.rows?.[0]?.total || 0;

    const seen = new Set<string>();

    for (const v of items) {
      const externalId = deriveExternalId(v);
      if (!externalId) {
        summary.failed++;
        if (summary.errors.length < 50) {
          summary.errors.push({ item: v.title || "?", error: "Nelze určit ID vozidla" });
        }
        continue;
      }
      if (seen.has(externalId)) continue;
      seen.add(externalId);

      const built = toListingInput(v, ctx, externalId, feed.id);
      if (!built.ok) {
        summary.failed++;
        if (summary.errors.length < 50) {
          summary.errors.push({ item: v.title || externalId, error: built.reason });
        }
        continue;
      }

      const parsed = insertListingSchema.safeParse(built.data);
      if (!parsed.success) {
        summary.failed++;
        if (summary.errors.length < 50) {
          summary.errors.push({
            item: v.title || externalId,
            error: parsed.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("; "),
          });
        }
        continue;
      }

      const [existing] = await db
        .select()
        .from(listings)
        .where(and(eq(listings.userId, ctx.userId), eq(listings.externalId, externalId)));

      if (existing) {
        const [updatedListing] = await db
          .update(listings)
          .set({
            ...parsed.data,
            isSold: false,
            feedId: feed.id,
            source: "xml_feed",
            updatedAt: new Date(),
          })
          .where(eq(listings.id, existing.id))
          .returning();
        await dispatchVehicleWebhook({
          dealerId: ctx.dealerId,
          event: existing.isSold ? "vehicle.created" : "vehicle.updated",
          listing: updatedListing,
          previous: existing,
          meta: { source: "xml_feed", feedId: feed.id },
        });
        summary.updated++;
      } else {
        if (currentCount >= ctx.maxListings) {
          summary.failed++;
          if (summary.errors.length < 50) {
            summary.errors.push({
              item: v.title || externalId,
              error: `Překročen limit inzerátů (${ctx.maxListings})`,
            });
          }
          continue;
        }
        const [createdListing] = await db.insert(listings).values(parsed.data as any).returning();
        await dispatchVehicleWebhook({
          dealerId: ctx.dealerId,
          event: "vehicle.created",
          listing: createdListing,
          meta: { source: "xml_feed", feedId: feed.id },
        });
        summary.created++;
        currentCount++;
      }
    }

    // Deactivate listings from this feed that are no longer present.
    const feedListings = await db
      .select()
      .from(listings)
      .where(and(eq(listings.feedId, feed.id), eq(listings.isSold, false)));
    for (const row of feedListings) {
      if (row.externalId && !seen.has(row.externalId)) {
        const [updatedListing] = await db
          .update(listings)
          .set({ isSold: true, updatedAt: new Date() })
          .where(eq(listings.id, row.id))
          .returning();
        await dispatchVehicleWebhook({
          dealerId: ctx.dealerId,
          event: "vehicle.sold",
          listing: updatedListing,
          previous: row,
          meta: { source: "xml_feed", feedId: feed.id, reason: "missing_from_feed" },
        });
        summary.deactivated++;
      }
    }

    await db
      .update(dealerFeeds)
      .set({
        status: "ok",
        lastSyncAt: new Date(),
        vehicleCount: summary.itemCount,
        createdCount: summary.created,
        updatedCount: summary.updated,
        deactivatedCount: summary.deactivated,
        errorCount: summary.failed,
        lastError: null,
        errors: summary.errors.length ? summary.errors : null,
        updatedAt: new Date(),
      })
      .where(eq(dealerFeeds.id, feed.id));

    // Mirror status onto the dealers row for the admin view.
    await db
      .update(dealers)
      .set({ xmlFeedUrl: feedUrl, xmlFeedStatus: "active", lastSyncAt: new Date(), updatedAt: new Date() })
      .where(eq(dealers.id, ctx.dealerId));

    return summary;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Sync failed";
    await db
      .update(dealerFeeds)
      .set({ status: "error", lastError: msg, errorCount: summary.failed, updatedAt: new Date() })
      .where(eq(dealerFeeds.id, feed.id));
    await db
      .update(dealers)
      .set({ xmlFeedStatus: "error", updatedAt: new Date() })
      .where(eq(dealers.id, ctx.dealerId));
    throw e;
  }
}
