import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { requireAuth } from "@lib/auth";
import { db } from "@lib/db";
import { dealers, users, insertDealerSchema } from "@shared/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    if (user.isDealer) return error("User is already a dealer", 400);

    const body = await req.json();
    const parsed = insertDealerSchema.safeParse({ ...body, ownerId: user.id });
    if (!parsed.success) {
      return json(
        { error: "Validation failed", errors: parsed.error.flatten() },
        400,
      );
    }

    const [dealer] = await db.insert(dealers).values(parsed.data).returning();

    await db
      .update(users)
      .set({ isDealer: true, dealerId: dealer.id, updatedAt: new Date() })
      .where(eq(users.id, user.id));

    return json({ dealer });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return error("Unauthorized", 401);
    if (msg === "Forbidden") return error("Forbidden", 403);
    return error(msg, 500);
  }
}
