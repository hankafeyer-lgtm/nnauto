import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { requireDealer } from "@lib/auth";
import { db } from "@lib/db";
import { dealerSettings } from "@shared/schema";
import { eq } from "drizzle-orm";

function mapAuthError(e: unknown) {
  const msg = e instanceof Error ? e.message : "Server error";
  if (msg === "Unauthorized") return error("Unauthorized", 401);
  if (msg === "Forbidden") return error("Forbidden", 403);
  return error(msg, 500);
}

export async function GET() {
  try {
    const user = await requireDealer();
    if (!user.dealerId) return error("Dealer not found", 404);

    const [row] = await db
      .select()
      .from(dealerSettings)
      .where(eq(dealerSettings.dealerId, user.dealerId));

    return json({ settings: row?.settings ?? null, updatedAt: row?.updatedAt ?? null });
  } catch (e) {
    return mapAuthError(e);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await requireDealer();
    if (!user.dealerId) return error("Dealer not found", 404);

    const body = await req.json().catch(() => ({}));
    const settings = body?.settings;
    if (!settings || typeof settings !== "object" || Array.isArray(settings)) {
      return error("Invalid settings", 400);
    }

    const [existing] = await db
      .select({ id: dealerSettings.id })
      .from(dealerSettings)
      .where(eq(dealerSettings.dealerId, user.dealerId));

    const [row] = existing
      ? await db
          .update(dealerSettings)
          .set({ settings, updatedAt: new Date() })
          .where(eq(dealerSettings.id, existing.id))
          .returning()
      : await db
          .insert(dealerSettings)
          .values({
            dealerId: user.dealerId,
            userId: user.id,
            settings,
          })
          .returning();

    return json({ settings: row.settings, updatedAt: row.updatedAt });
  } catch (e) {
    return mapAuthError(e);
  }
}
