/**
 * NNAuto advertising — server-side DB operations (LOCAL-FIRST).
 * No Stripe. Local demo payment is a clearly labeled status transition only.
 */

import { db } from "@lib/db";
import {
  adCampaigns,
  adEvents,
  adPlacementPrices,
  type AdCampaignRow,
} from "@shared/schema";
import {
  AD_DURATION_DAYS,
  AD_LIVE_STATUSES,
  AD_PLACEMENT_CATALOG,
  addDaysIso,
  getAdPriceKc,
  type AdCampaignStatus,
  type AdDurationDays,
  type AdPlacementId,
} from "@shared/adCatalog";
import { and, asc, desc, eq, gte, inArray, lte, sql } from "drizzle-orm";

export type CampaignInput = {
  name: string;
  placement: AdPlacementId;
  headline: string;
  description: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
  ctaText?: string;
  targetUrl: string;
  durationDays: AdDurationDays;
  startDate: string; // YYYY-MM-DD
  endDate?: string;
  brandFilter?: string | null;
  categoryFilter?: string | null;
  advertiserName?: string | null;
  status?: AdCampaignStatus;
};

export type PublicAdCreative = {
  id: string;
  placement: AdPlacementId;
  headline: string;
  description: string;
  imageUrl: string | null;
  videoUrl: string | null;
  ctaText: string;
  targetUrl: string;
};

function toDateOnly(value: string | Date | null | undefined): string {
  if (value == null || value === "") return "";
  if (value instanceof Date) {
    if (!Number.isFinite(value.getTime())) return "";
    return value.toISOString().slice(0, 10);
  }
  const raw = String(value).trim();
  if (!raw) return "";
  // Postgres / driver may return date-only or full ISO
  const day = raw.slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(day)) return day;
  const parsed = new Date(raw);
  if (!Number.isFinite(parsed.getTime())) return "";
  return parsed.toISOString().slice(0, 10);
}

function toIsoOrNull(value: Date | string | null | undefined): string | null {
  if (value == null) return null;
  if (value instanceof Date) {
    if (!Number.isFinite(value.getTime())) return null;
    return value.toISOString();
  }
  const d = new Date(value);
  if (!Number.isFinite(d.getTime())) return null;
  return d.toISOString();
}

/** Normalize to YYYY-MM-DD for Postgres `date` columns (string mode). */
function parseDay(iso: string): string {
  const day = toDateOnly(iso);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) {
    throw new Error("Neplatné datum");
  }
  return day;
}

function isPlacementId(value: string): value is AdPlacementId {
  return AD_PLACEMENT_CATALOG.some((p) => p.id === value);
}

function normalizeStatus(status: string): AdCampaignStatus {
  if (status === "pending_review") return "pending_approval";
  return status as AdCampaignStatus;
}

export function rowToClient(row: AdCampaignRow) {
  const days = row.durationDays as AdDurationDays;
  const price = row.priceKc ?? 0;
  return {
    id: row.id,
    advertiserId: row.userId,
    advertiserName: row.advertiserName,
    name: row.name,
    status: normalizeStatus(row.status),
    placement: row.placement as AdPlacementId,
    headline: row.headline,
    description: row.description,
    image: row.imageUrl || "",
    imageUrl: row.imageUrl,
    videoUrl: row.videoUrl || undefined,
    ctaText: row.ctaText,
    targetUrl: row.targetUrl,
    dailyBudget: days > 0 ? Math.round(price / days) : 0,
    totalBudget: price,
    durationDays: days,
    priceKc: price,
    startDate: toDateOnly(row.startDate),
    endDate: toDateOnly(row.endDate),
    brandFilter: row.brandFilter,
    categoryFilter: row.categoryFilter,
    impressions: row.impressions,
    clicks: row.clicks,
    spend: row.spendKc,
    rejectionReason: row.rejectionReason || undefined,
    paidAt: toIsoOrNull(row.paidAt),
    approvedAt: toIsoOrNull(row.approvedAt),
    createdAt: toIsoOrNull(row.createdAt) ?? new Date(0).toISOString(),
    updatedAt: toIsoOrNull(row.updatedAt) ?? new Date(0).toISOString(),
    localDemo: Boolean(
      row.stripeSessionId?.startsWith("local_demo_") ||
        (row.paidAt && !row.stripePaymentIntentId),
    ),
  };
}

/** Merge catalog defaults with DB price overrides + enabled flags. */
export async function getCatalogWithPrices() {
  const overrides = await db.select().from(adPlacementPrices);
  const byKey = new Map(
    overrides.map((o) => [`${o.placement}:${o.durationDays}`, o]),
  );

  const placements = AD_PLACEMENT_CATALOG.map((item) => {
    const pricesKc = { ...item.pricesKc } as Record<AdDurationDays, number>;
    let enabled = true;
    for (const days of AD_DURATION_DAYS) {
      const row = byKey.get(`${item.id}:${days}`);
      if (row) {
        pricesKc[days] = row.priceKc;
        if (!row.enabled) enabled = false;
      }
    }
    return {
      ...item,
      pricesKc,
      enabled,
      available: item.wiredInProduct && enabled,
    };
  });

  return { durations: AD_DURATION_DAYS, placements };
}

export async function resolvePriceKc(
  placement: AdPlacementId,
  days: AdDurationDays,
): Promise<number> {
  const [row] = await db
    .select()
    .from(adPlacementPrices)
    .where(
      and(
        eq(adPlacementPrices.placement, placement),
        eq(adPlacementPrices.durationDays, days),
      ),
    )
    .limit(1);
  if (row) {
    if (!row.enabled) throw new Error("Toto reklamní místo je dočasně vypnuté");
    return row.priceKc;
  }
  return getAdPriceKc(placement, days);
}

export async function listCampaignsForUser(userId: string) {
  const rows = await db
    .select()
    .from(adCampaigns)
    .where(eq(adCampaigns.userId, userId))
    .orderBy(desc(adCampaigns.createdAt));
  return rows.map(rowToClient);
}

export async function listAllCampaigns() {
  const rows = await db
    .select()
    .from(adCampaigns)
    .orderBy(desc(adCampaigns.createdAt));
  return rows.map(rowToClient);
}

export async function getCampaignById(id: string) {
  const [row] = await db
    .select()
    .from(adCampaigns)
    .where(eq(adCampaigns.id, id))
    .limit(1);
  return row ? rowToClient(row) : null;
}

export async function createCampaign(
  userId: string,
  input: CampaignInput,
  opts?: { advertiserName?: string | null },
) {
  if (!isPlacementId(input.placement)) {
    throw new Error("Neplatné reklamní místo");
  }
  if (!AD_DURATION_DAYS.includes(input.durationDays)) {
    throw new Error("Neplatná délka kampaně");
  }
  const start = toDateOnly(input.startDate);
  const end = toDateOnly(
    input.endDate || addDaysIso(start, input.durationDays),
  );
  if (end < start) throw new Error("Konec musí být po začátku");

  const priceKc = await resolvePriceKc(input.placement, input.durationDays);
  const status = normalizeStatus(input.status || "draft");

  const [row] = await db
    .insert(adCampaigns)
    .values({
      userId,
      advertiserName: opts?.advertiserName ?? input.advertiserName ?? null,
      name: input.name.trim() || "Bez názvu",
      status,
      placement: input.placement,
      headline: input.headline.trim(),
      description: input.description.trim(),
      imageUrl: input.imageUrl || null,
      videoUrl: input.videoUrl || null,
      ctaText: (input.ctaText || "Zjistit více").trim(),
      targetUrl: input.targetUrl.trim(),
      durationDays: input.durationDays,
      priceKc,
      currency: "CZK",
      startDate: parseDay(start),
      endDate: parseDay(end),
      brandFilter: input.brandFilter || null,
      categoryFilter: input.categoryFilter || null,
    })
    .returning();

  return rowToClient(row);
}

export async function updateCampaign(
  id: string,
  userId: string,
  input: Partial<CampaignInput>,
  isAdmin = false,
) {
  const [existing] = await db
    .select()
    .from(adCampaigns)
    .where(eq(adCampaigns.id, id))
    .limit(1);
  if (!existing) throw new Error("Kampaň nenalezena");
  if (!isAdmin && existing.userId !== userId) {
    throw new Error("Forbidden");
  }

  const editable =
    isAdmin ||
    ["draft", "pending_payment", "pending_approval", "rejected"].includes(
      existing.status,
    );
  if (!editable) {
    throw new Error("Kampaň nelze upravit v aktuálním stavu");
  }

  const placement = (input.placement || existing.placement) as AdPlacementId;
  const durationDays = (input.durationDays ||
    existing.durationDays) as AdDurationDays;
  const start = toDateOnly(input.startDate || existing.startDate);
  const end = toDateOnly(
    input.endDate ||
      addDaysIso(start, durationDays) ||
      toDateOnly(existing.endDate),
  );
  const priceKc = await resolvePriceKc(placement, durationDays);

  const [row] = await db
    .update(adCampaigns)
    .set({
      name: input.name?.trim() ?? existing.name,
      placement,
      headline: input.headline?.trim() ?? existing.headline,
      description: input.description?.trim() ?? existing.description,
      imageUrl:
        input.imageUrl !== undefined ? input.imageUrl || null : existing.imageUrl,
      videoUrl:
        input.videoUrl !== undefined ? input.videoUrl || null : existing.videoUrl,
      ctaText: input.ctaText?.trim() ?? existing.ctaText,
      targetUrl: input.targetUrl?.trim() ?? existing.targetUrl,
      durationDays,
      priceKc,
      startDate: parseDay(start),
      endDate: parseDay(end),
      brandFilter:
        input.brandFilter !== undefined
          ? input.brandFilter || null
          : existing.brandFilter,
      categoryFilter:
        input.categoryFilter !== undefined
          ? input.categoryFilter || null
          : existing.categoryFilter,
      updatedAt: new Date(),
    })
    .where(eq(adCampaigns.id, id))
    .returning();

  return rowToClient(row);
}

export async function setCampaignStatus(opts: {
  id: string;
  toStatus: AdCampaignStatus;
  actorId: string;
  isAdmin: boolean;
  reason?: string | null;
  ownerOnly?: boolean;
}) {
  const [existing] = await db
    .select()
    .from(adCampaigns)
    .where(eq(adCampaigns.id, opts.id))
    .limit(1);
  if (!existing) throw new Error("Kampaň nenalezena");

  if (!opts.isAdmin) {
    if (existing.userId !== opts.actorId) throw new Error("Forbidden");
    const ownerAllowed: AdCampaignStatus[] = [
      "draft",
      "pending_payment",
      "pending_approval",
      "paused",
      "cancelled",
    ];
    // Owner may pause/cancel own active; may submit draft→pending_payment
    const from = normalizeStatus(existing.status);
    const to = opts.toStatus;
    const ok =
      (from === "draft" &&
        (to === "pending_payment" || to === "pending_approval")) ||
      (from === "pending_payment" && to === "cancelled") ||
      (from === "active" && to === "paused") ||
      (from === "paused" && to === "active" && !!existing.approvedAt) ||
      (from === "rejected" && to === "draft") ||
      (to === "cancelled" && ownerAllowed.includes(from));
    if (!ok) throw new Error("Tuto změnu stavu může provést jen administrátor");
  }

  const patch: Partial<typeof adCampaigns.$inferInsert> = {
    status: opts.toStatus,
    updatedAt: new Date(),
  };

  if (opts.toStatus === "rejected") {
    patch.rejectionReason = opts.reason?.trim() || "Zamítnuto administrátorem";
  }
  if (opts.toStatus === "approved" || opts.toStatus === "active") {
    patch.approvedAt = new Date();
    patch.approvedBy = opts.actorId;
    patch.rejectionReason = null;
  }
  if (opts.toStatus === "pending_approval" && !existing.paidAt) {
    // still unpaid unless local demo pay was used
  }

  const [row] = await db
    .update(adCampaigns)
    .set(patch)
    .where(eq(adCampaigns.id, opts.id))
    .returning();

  await db.insert(adEvents).values({
    campaignId: opts.id,
    eventType: "status",
    placement: existing.placement,
    device: null,
    sessionKey: `status:${opts.actorId}:${Date.now()}`,
  });

  return rowToClient(row);
}

/**
 * LOCAL DEMO ONLY — marks campaign paid without Stripe.
 * Sets stripe_session_id to local_demo_* so it is never confused with real pay.
 */
export async function markLocalDemoPaid(opts: {
  id: string;
  userId: string;
  isAdmin: boolean;
}) {
  const [existing] = await db
    .select()
    .from(adCampaigns)
    .where(eq(adCampaigns.id, opts.id))
    .limit(1);
  if (!existing) throw new Error("Kampaň nenalezena");
  if (!opts.isAdmin && existing.userId !== opts.userId) {
    throw new Error("Forbidden");
  }
  const status = normalizeStatus(existing.status);
  if (!["draft", "pending_payment", "pending_approval"].includes(status)) {
    throw new Error("Lokální demo platba není v tomto stavu dostupná");
  }

  const [row] = await db
    .update(adCampaigns)
    .set({
      status: "pending_approval",
      paidAt: new Date(),
      stripeSessionId: `local_demo_${existing.id}`,
      stripePaymentIntentId: null,
      updatedAt: new Date(),
    })
    .where(eq(adCampaigns.id, opts.id))
    .returning();

  return rowToClient(row);
}

/** Serve one live creative for a placement (public). */
export async function servePlacement(
  placement: AdPlacementId,
): Promise<PublicAdCreative | null> {
  if (!isPlacementId(placement)) return null;

  const catalog = AD_PLACEMENT_CATALOG.find((p) => p.id === placement);
  if (!catalog?.wiredInProduct) return null;

  const [priceRow] = await db
    .select()
    .from(adPlacementPrices)
    .where(
      and(
        eq(adPlacementPrices.placement, placement),
        eq(adPlacementPrices.durationDays, 7),
      ),
    )
    .limit(1);
  if (priceRow && !priceRow.enabled) return null;

  const today = toDateOnly(new Date());
  const liveStatuses = AD_LIVE_STATUSES;

  // Multiple advertisers can share one slot — fair rotation by impressions.
  const rows = await db
    .select()
    .from(adCampaigns)
    .where(
      and(
        eq(adCampaigns.placement, placement),
        inArray(adCampaigns.status, liveStatuses),
        lte(adCampaigns.startDate, parseDay(today)),
        gte(adCampaigns.endDate, parseDay(today)),
      ),
    )
    .orderBy(asc(adCampaigns.impressions), desc(adCampaigns.approvedAt))
    .limit(40);

  const eligible = rows.filter((r) => r.imageUrl || r.videoUrl);
  if (!eligible.length) return null;

  const minImpressions = Math.min(...eligible.map((r) => r.impressions ?? 0));
  const pool = eligible.filter((r) => (r.impressions ?? 0) === minImpressions);
  const row = pool[Math.floor(Math.random() * pool.length)]!;

  // Auto-promote approved/scheduled → active once in window
  if (row.status === "approved" || row.status === "scheduled") {
    await db
      .update(adCampaigns)
      .set({ status: "active", updatedAt: new Date() })
      .where(eq(adCampaigns.id, row.id));
  }

  return {
    id: row.id,
    placement,
    headline: row.headline,
    description: row.description,
    imageUrl: row.imageUrl,
    videoUrl: row.videoUrl,
    ctaText: row.ctaText,
    targetUrl: row.targetUrl,
  };
}

export async function trackEvent(opts: {
  campaignId: string;
  eventType: "impression" | "click";
  placement?: string;
  device?: string | null;
  sessionKey?: string | null;
}) {
  const [campaign] = await db
    .select()
    .from(adCampaigns)
    .where(eq(adCampaigns.id, opts.campaignId))
    .limit(1);
  if (!campaign) return { ok: false as const };

  // Light dedupe: same session + type within ~30s window is ignored for impressions
  if (opts.sessionKey && opts.eventType === "impression") {
    const recent = await db
      .select({ id: adEvents.id })
      .from(adEvents)
      .where(
        and(
          eq(adEvents.campaignId, opts.campaignId),
          eq(adEvents.eventType, "impression"),
          eq(adEvents.sessionKey, opts.sessionKey),
          gte(adEvents.createdAt, new Date(Date.now() - 30_000)),
        ),
      )
      .limit(1);
    if (recent.length) return { ok: true as const, deduped: true };
  }

  await db.insert(adEvents).values({
    campaignId: opts.campaignId,
    eventType: opts.eventType,
    placement: opts.placement || campaign.placement,
    device: opts.device || null,
    sessionKey: opts.sessionKey || null,
  });

  if (opts.eventType === "impression") {
    await db
      .update(adCampaigns)
      .set({
        impressions: sql`${adCampaigns.impressions} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(adCampaigns.id, opts.campaignId));
  } else {
    await db
      .update(adCampaigns)
      .set({
        clicks: sql`${adCampaigns.clicks} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(adCampaigns.id, opts.campaignId));
  }

  return { ok: true as const, deduped: false };
}

export async function getCampaignStats(campaignId: string) {
  const campaign = await getCampaignById(campaignId);
  if (!campaign) return null;

  const events = await db
    .select({
      eventType: adEvents.eventType,
      createdAt: adEvents.createdAt,
    })
    .from(adEvents)
    .where(eq(adEvents.campaignId, campaignId))
    .orderBy(desc(adEvents.createdAt))
    .limit(500);

  const impressions = campaign.impressions;
  const clicks = campaign.clicks;
  const ctr =
    impressions > 0 ? Math.round((clicks / impressions) * 10000) / 100 : null;

  return {
    campaignId,
    impressions,
    clicks,
    ctr,
    hasData: impressions > 0 || clicks > 0 || events.length > 0,
    recent: events
      .filter((e) => e.eventType === "impression" || e.eventType === "click")
      .slice(0, 50)
      .map((e) => ({
        type: e.eventType,
        at: e.createdAt.toISOString(),
      })),
  };
}

export async function upsertPlacementPrice(opts: {
  placement: AdPlacementId;
  durationDays: AdDurationDays;
  priceKc: number;
  enabled: boolean;
  updatedBy: string;
}) {
  if (!isPlacementId(opts.placement)) throw new Error("Neplatné místo");
  if (!AD_DURATION_DAYS.includes(opts.durationDays)) {
    throw new Error("Neplatná délka");
  }
  if (opts.priceKc < 0 || !Number.isFinite(opts.priceKc)) {
    throw new Error("Neplatná cena");
  }

  await db
    .insert(adPlacementPrices)
    .values({
      placement: opts.placement,
      durationDays: opts.durationDays,
      priceKc: Math.round(opts.priceKc),
      enabled: opts.enabled,
      updatedAt: new Date(),
      updatedBy: opts.updatedBy,
    })
    .onConflictDoUpdate({
      target: [adPlacementPrices.placement, adPlacementPrices.durationDays],
      set: {
        priceKc: Math.round(opts.priceKc),
        enabled: opts.enabled,
        updatedAt: new Date(),
        updatedBy: opts.updatedBy,
      },
    });

  return getCatalogWithPrices();
}

export async function setPlacementEnabled(
  placement: AdPlacementId,
  enabled: boolean,
  updatedBy: string,
) {
  for (const days of AD_DURATION_DAYS) {
    const price = await resolvePriceKc(placement, days).catch(() =>
      getAdPriceKc(placement, days),
    );
    await upsertPlacementPrice({
      placement,
      durationDays: days,
      priceKc: price,
      enabled,
      updatedBy,
    });
  }
  return getCatalogWithPrices();
}
