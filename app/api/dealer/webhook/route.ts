import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { requireDealer } from "@lib/auth";
import { db } from "@lib/db";
import { dealerWebhooks } from "@shared/schema";
import { eq } from "drizzle-orm";
import {
  generateWebhookSecret,
  validateWebhookUrl,
  WEBHOOK_EVENTS,
  type WebhookEvent,
} from "@lib/webhooks";

function mapAuthError(e: unknown) {
  const msg = e instanceof Error ? e.message : "Server error";
  if (msg === "Unauthorized") return error("Unauthorized", 401);
  if (msg === "Forbidden") return error("Forbidden", 403);
  return error(msg, 500);
}

function normalizeEvents(value: unknown): WebhookEvent[] {
  if (!Array.isArray(value)) return ["vehicle.created", "vehicle.updated", "vehicle.sold"];
  const allowed = new Set<string>(WEBHOOK_EVENTS);
  const selected = value.filter(
    (v): v is WebhookEvent => typeof v === "string" && allowed.has(v),
  );
  return selected.length ? selected : ["vehicle.created", "vehicle.updated", "vehicle.sold"];
}

function maskSecret(secret: string | null | undefined): string {
  if (!secret) return "";
  return `whsec_********${secret.slice(-4)}`;
}

function serializeWebhook(webhook: typeof dealerWebhooks.$inferSelect, revealSecret = false) {
  return {
    ...webhook,
    secret: revealSecret ? webhook.secret : maskSecret(webhook.secret),
    secretMasked: maskSecret(webhook.secret),
    hasSecret: !!webhook.secret,
  };
}

export async function GET() {
  try {
    const user = await requireDealer();
    if (!user.dealerId) return error("Dealer not found", 404);

    const [webhook] = await db
      .select()
      .from(dealerWebhooks)
      .where(eq(dealerWebhooks.dealerId, user.dealerId));

    return json({
      webhook: webhook ? serializeWebhook(webhook) : {
        webhookUrl: "",
        secret: "",
        secretMasked: "",
        hasSecret: false,
        enabled: true,
        events: ["vehicle.created", "vehicle.updated", "vehicle.sold"],
        status: "idle",
        lastDeliveryAt: null,
        lastStatus: null,
        lastError: null,
      },
    });
  } catch (e) {
    return mapAuthError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireDealer();
    if (!user.dealerId) return error("Dealer not found", 404);

    const body = await req.json().catch(() => ({}));
    const webhookUrl = typeof body.webhookUrl === "string" ? body.webhookUrl.trim() : "";
    const enabled = typeof body.enabled === "boolean" ? body.enabled : true;
    const events = normalizeEvents(body.events);

    const validationError = validateWebhookUrl(webhookUrl);
    if (validationError) return error(validationError, 400);
    if (!webhookUrl) return error("Zadejte webhook URL / Вкажіть webhook URL", 400);

    const [existing] = await db
      .select()
      .from(dealerWebhooks)
      .where(eq(dealerWebhooks.dealerId, user.dealerId));

    let webhook;
    let created = false;
    if (existing) {
      [webhook] = await db
        .update(dealerWebhooks)
        .set({
          webhookUrl,
          enabled,
          events,
          updatedAt: new Date(),
        })
        .where(eq(dealerWebhooks.id, existing.id))
        .returning();
    } else {
      created = true;
      [webhook] = await db
        .insert(dealerWebhooks)
        .values({
          dealerId: user.dealerId,
          userId: user.id,
          webhookUrl,
          enabled,
          events,
          secret: generateWebhookSecret(),
        })
        .returning();
    }

    return json({ webhook: serializeWebhook(webhook, created) });
  } catch (e) {
    return mapAuthError(e);
  }
}
