import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { requireDealer } from "@lib/auth";
import { db } from "@lib/db";
import { dealers, updateDealerSchema } from "@shared/schema";
import { eq } from "drizzle-orm";

export async function GET(_req: NextRequest) {
  try {
    const user = await requireDealer();
    if (!user.dealerId) return error("Dealer not found", 404);

    const [dealer] = await db
      .select()
      .from(dealers)
      .where(eq(dealers.id, user.dealerId));
    if (!dealer) return error("Dealer not found", 404);

    return json({ dealer });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return error("Unauthorized", 401);
    if (msg === "Forbidden") return error("Forbidden", 403);
    return error(msg, 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireDealer();
    if (!user.dealerId) return error("Dealer not found", 404);

    const body = await req.json();
    const parsed = updateDealerSchema.safeParse(body);
    if (!parsed.success) {
      return json(
        { error: "Validation failed", errors: parsed.error.flatten() },
        400,
      );
    }

    const [dealer] = await db
      .update(dealers)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(dealers.id, user.dealerId))
      .returning();

    return json({ dealer });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return error("Unauthorized", 401);
    if (msg === "Forbidden") return error("Forbidden", 403);
    return error(msg, 500);
  }
}
