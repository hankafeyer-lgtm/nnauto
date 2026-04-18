import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { db } from "@lib/db";
import { securityLog } from "@lib/securityLog";
import { storage } from "@lib/storage";
import { getCurrentUser } from "@lib/auth";
import { sql } from "drizzle-orm";
import { headers } from "next/headers";
import crypto from "crypto";

const VALID_EVENT_TYPES = new Set(["view", "contact_click", "whatsapp_click"]);

function getViewerFingerprint(ip: string, ua: string): string {
  const raw = `${ip}|${ua}`;
  let hash = 5381;
  for (let i = 0; i < raw.length; i++) {
    hash = (hash * 33) ^ raw.charCodeAt(i);
  }
  return (hash >>> 0).toString(36);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; eventType: string }> },
) {
  try {
    const { id: listingId, eventType } = await params;
    if (!listingId) return error("Missing listing id", 400);
    if (!VALID_EVENT_TYPES.has(eventType)) return error("Unknown event type", 400);

    const listing = await storage.getListing(listingId);
    if (!listing) return error("Listing not found", 404);

    const user = await getCurrentUser();
    if (user && user.id === listing.userId) {
      return json({ ok: true });
    }

    const hdrs = await headers();
    const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() || hdrs.get("x-real-ip") || "unknown";
    const ua = hdrs.get("user-agent") || "unknown";
    const fingerprint = getViewerFingerprint(ip, ua);

    await db.execute(sql`
      INSERT INTO listing_analytics_events (
        listing_id, owner_user_id, event_type, viewer_fingerprint, created_at, updated_at
      ) VALUES (
        ${listingId}, ${listing.userId}, ${eventType}, ${fingerprint}, now(), now()
      )
      ON CONFLICT (listing_id, event_type, viewer_fingerprint)
      DO UPDATE SET updated_at = now()
    `);

    if (eventType === "contact_click" || eventType === "whatsapp_click") {
      securityLog("contact_interaction", {
        listingId: listingId,
        kind: eventType,
      });
    }

    return json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    return error(msg, 500);
  }
}
