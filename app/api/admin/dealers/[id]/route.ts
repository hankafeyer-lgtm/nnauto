import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { requireAdmin } from "@lib/auth";
import { storage } from "@lib/storage";
import { z } from "zod";

const patchSchema = z
  .object({
    isVerified: z.boolean().optional(),
    maxListings: z.number().int().min(1).max(10_000).optional(),
    companyName: z.string().min(1).optional(),
  })
  .strict();

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = patchSchema.parse(await req.json());
    const dealer = await storage.updateDealer(id, body);
    if (!dealer) return error("Dealer not found", 404);
    return json({ dealer });
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
