import { NextRequest } from "next/server";
import { error, json } from "@lib/api-helpers";
import { requireDealer } from "@lib/auth";
import { storage } from "@lib/storage";
import { ensureMessagingSchema } from "@lib/ensureMessagingSchema";
import { db } from "@lib/db";
import { dealers, listings } from "@shared/schema";
import { eq } from "drizzle-orm";
import { generateMockAiReply } from "@lib/aiReply";

/**
 * AI suggestion placeholder.
 *
 * Returns a draft reply that the dealer can paste into the composer
 * and edit before sending. Today this is a heuristic mock (see
 * lib/aiReply.ts); when a real LLM provider is wired up, only that
 * helper changes — the route shape stays identical so the client
 * doesn't move.
 *
 * Auth: dealer-only (same gate as the rest of the inbox API).
 *
 * The endpoint never PERSISTS a message — it only returns a draft.
 * The dealer hits POST .../messages (the existing send route) when
 * they're happy with it.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireDealer();
    await ensureMessagingSchema();
    const { id } = await params;

    const conv = await storage.getConversation(id);
    if (!conv) return error("Conversation not found", 404);
    if (conv.dealerUserId !== user.id) return error("Forbidden", 403);

    const messages = await storage.listMessages(id);

    // Pull listing + dealer summary for richer context (phone, name).
    const [listing] = await db
      .select({
        title: listings.title,
        brand: listings.brand,
        model: listings.model,
        year: listings.year,
        price: listings.price,
        phone: listings.phone,
      })
      .from(listings)
      .where(eq(listings.id, conv.listingId));

    const [dealerRow] = conv.dealerId
      ? await db
          .select({ companyName: dealers.companyName })
          .from(dealers)
          .where(eq(dealers.id, conv.dealerId))
      : [];

    const draft = generateMockAiReply({
      messages,
      listing: listing ?? null,
      dealerName: dealerRow?.companyName ?? null,
    });

    return json({
      ok: true,
      draft,
      // Make it explicit on the wire that this is a placeholder so the
      // UI can render a tiny "AI mock" caveat in dev/staging if it wants.
      provider: "mock",
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return error("Unauthorized", 401);
    if (msg === "Forbidden") return error("Forbidden", 403);
    console.error("[POST conv/:id/ai-reply] error:", e);
    return error(msg, 500);
  }
}
