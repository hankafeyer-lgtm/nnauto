import crypto from "node:crypto";
import { db } from "@lib/db";
import { dealerWebhooks, type Listing } from "@shared/schema";
import { eq } from "drizzle-orm";

export const WEBHOOK_EVENTS = [
  "vehicle.created",
  "vehicle.updated",
  "vehicle.deleted",
  "vehicle.sold",
] as const;

export type WebhookEvent = (typeof WEBHOOK_EVENTS)[number];

const DELIVERY_TIMEOUT_MS = 8_000;

export function generateWebhookSecret(): string {
  return `whsec_${crypto.randomBytes(24).toString("hex")}`;
}

function isAllowedWebhookUrl(url: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return false;

  // Basic SSRF guard against obvious internal targets.
  const host = parsed.hostname.toLowerCase();
  return !(
    host === "localhost" ||
    host === "0.0.0.0" ||
    host.endsWith(".local") ||
    /^127\./.test(host) ||
    /^10\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^169\.254\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host)
  );
}

export function validateWebhookUrl(url: string): string | null {
  if (!url.trim()) return null;
  if (!isAllowedWebhookUrl(url.trim())) {
    return "Webhook URL musí být veřejná http(s) adresa / Webhook URL має бути публічною http(s) адресою";
  }
  return null;
}

function eventList(value: unknown): WebhookEvent[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is WebhookEvent =>
    typeof v === "string" && (WEBHOOK_EVENTS as readonly string[]).includes(v),
  );
}

function publicVehicle(listing: Listing | null | undefined) {
  if (!listing) return null;
  return {
    id: listing.id,
    externalId: listing.externalId,
    source: listing.source,
    title: listing.title,
    brand: listing.brand,
    model: listing.model,
    year: listing.year,
    price: listing.price,
    mileage: listing.mileage,
    isSold: listing.isSold,
    updatedAt: listing.updatedAt,
  };
}

async function sendWebhook(args: {
  dealerId: string;
  event: WebhookEvent;
  payload: unknown;
}) {
  const [config] = await db
    .select()
    .from(dealerWebhooks)
    .where(eq(dealerWebhooks.dealerId, args.dealerId));

  if (!config || !config.enabled || !config.webhookUrl) return;
  const selected = eventList(config.events);
  if (!selected.includes(args.event)) return;

  const body = JSON.stringify(args.payload);
  const timestamp = new Date().toISOString();
  const deliveryId = crypto.randomUUID();
  const signature = crypto
    .createHmac("sha256", config.secret)
    .update(`${timestamp}.${body}`)
    .digest("hex");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DELIVERY_TIMEOUT_MS);
  try {
    const res = await fetch(config.webhookUrl, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "content-type": "application/json",
        "user-agent": "NNAuto-Webhooks/1.0",
        "x-nnauto-event": args.event,
        "x-nnauto-delivery": deliveryId,
        "x-nnauto-timestamp": timestamp,
        "x-nnauto-signature": `sha256=${signature}`,
      },
      body,
    });

    await db
      .update(dealerWebhooks)
      .set({
        status: res.ok ? "ok" : "error",
        lastDeliveryAt: new Date(),
        lastStatus: res.status,
        lastError: res.ok ? null : `HTTP ${res.status}`,
        updatedAt: new Date(),
      })
      .where(eq(dealerWebhooks.id, config.id));
  } catch (e) {
    await db
      .update(dealerWebhooks)
      .set({
        status: "error",
        lastDeliveryAt: new Date(),
        lastStatus: null,
        lastError: e instanceof Error ? e.message : "Delivery failed",
        updatedAt: new Date(),
      })
      .where(eq(dealerWebhooks.id, config.id));
  } finally {
    clearTimeout(timeout);
  }
}

export async function dispatchVehicleWebhook(args: {
  dealerId?: string | null;
  event: WebhookEvent;
  listing?: Listing | null;
  previous?: Partial<Listing> | null;
  meta?: Record<string, unknown>;
}) {
  if (!args.dealerId) return;
  const payload = {
    event: args.event,
    timestamp: new Date().toISOString(),
    vehicleId: args.listing?.id ?? args.previous?.id ?? null,
    externalId: args.listing?.externalId ?? args.previous?.externalId ?? null,
    vehicle: publicVehicle(args.listing),
    previous: args.previous ? publicVehicle(args.previous as Listing) : null,
    meta: args.meta ?? {},
  };
  await sendWebhook({ dealerId: args.dealerId, event: args.event, payload });
}

export async function dispatchTestWebhook(args: {
  dealerId: string;
  event?: WebhookEvent;
}) {
  const event = args.event ?? "vehicle.updated";
  await sendWebhook({
    dealerId: args.dealerId,
    event,
    payload: {
      event,
      timestamp: new Date().toISOString(),
      test: true,
      vehicleId: "test-vehicle",
      externalId: "test-external-id",
      vehicle: {
        id: "test-vehicle",
        externalId: "test-external-id",
        title: "NNAuto test webhook",
        brand: "NNAuto",
        model: "Webhook",
        year: new Date().getFullYear(),
        isSold: false,
      },
    },
  });
}
