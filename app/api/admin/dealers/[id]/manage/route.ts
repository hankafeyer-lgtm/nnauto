import { NextRequest } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { json, error } from "@lib/api-helpers";
import { requireSuperAdmin } from "@lib/auth";
import {
  ensureAdminSchema,
  writeAdminAudit,
  PLAN_LIMITS,
  DEALER_PLANS,
} from "@lib/ensureAdminSchema";
import { db } from "@lib/db";
import { dealers, users } from "@shared/schema";

const patchSchema = z
  .object({
    plan: z.enum(DEALER_PLANS).optional(),
    status: z.enum(["active", "blocked"]).optional(),
    verificationStatus: z
      .enum(["none", "pending", "verified", "rejected"])
      .optional(),
    maxListings: z.number().int().min(1).max(1_000_000).optional(),
    companyName: z.string().min(1).optional(),
    apiEnabled: z.boolean().optional(),
    xmlFeedStatus: z.enum(["none", "active", "pending", "error"]).optional(),
  })
  .strict();

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireSuperAdmin();
    await ensureAdminSchema();
    const { id } = await params;
    const body = patchSchema.parse(await req.json());

    const update: Record<string, unknown> = { updatedAt: new Date() };
    if (body.companyName !== undefined) update.companyName = body.companyName;
    if (body.status !== undefined) update.status = body.status;
    if (body.apiEnabled !== undefined) update.apiEnabled = body.apiEnabled;
    if (body.xmlFeedStatus !== undefined) update.xmlFeedStatus = body.xmlFeedStatus;

    // Plan change → reset the listing limit to the plan default unless an
    // explicit maxListings is also provided.
    if (body.plan !== undefined) {
      update.plan = body.plan;
      if (body.maxListings === undefined) {
        update.maxListings = PLAN_LIMITS[body.plan] ?? 50;
      }
    }
    if (body.maxListings !== undefined) update.maxListings = body.maxListings;

    // Verification status drives the legacy isVerified boolean used on listings.
    if (body.verificationStatus !== undefined) {
      update.verificationStatus = body.verificationStatus;
      update.isVerified = body.verificationStatus === "verified";
    }

    const [row] = await db
      .update(dealers)
      .set(update)
      .where(eq(dealers.id, id))
      .returning();
    if (!row) return error("Dealer not found", 404);

    await writeAdminAudit({
      actorUserId: admin.id,
      actorEmail: admin.email,
      action: "dealer.update",
      targetType: "dealer",
      targetId: id,
      metadata: body,
    });

    return json({ dealer: row });
  } catch (e: unknown) {
    if (e instanceof z.ZodError) {
      return error(e.errors.map((x) => x.message).join(", "), 400);
    }
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return error("Unauthorized", 401);
    if (msg === "Forbidden") return error("Forbidden", 403);
    return error(msg, 500);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireSuperAdmin();
    await ensureAdminSchema();
    const { id } = await params;

    const [existing] = await db.select().from(dealers).where(eq(dealers.id, id));
    if (!existing) return error("Dealer not found", 404);

    // Detach the owner user from the (now removed) dealer profile.
    await db
      .update(users)
      .set({ isDealer: false, dealerId: null, updatedAt: new Date() })
      .where(eq(users.id, existing.ownerId));

    await db.delete(dealers).where(eq(dealers.id, id));

    await writeAdminAudit({
      actorUserId: admin.id,
      actorEmail: admin.email,
      action: "dealer.delete",
      targetType: "dealer",
      targetId: id,
      metadata: { companyName: existing.companyName, ownerId: existing.ownerId },
    });

    return json({ success: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return error("Unauthorized", 401);
    if (msg === "Forbidden") return error("Forbidden", 403);
    return error(msg, 500);
  }
}
