import { json, error } from "@lib/api-helpers";
import { requireDealer } from "@lib/auth";
import { db } from "@lib/db";
import { dealers } from "@shared/schema";
import { eq } from "drizzle-orm";
import { generateApiKey, maskApiKey } from "@lib/apiAuth";

function mapAuthError(e: unknown) {
  const msg = e instanceof Error ? e.message : "Server error";
  if (msg === "Unauthorized") return error("Unauthorized", 401);
  if (msg === "Forbidden") return error("Forbidden", 403);
  return error(msg, 500);
}

// GET — return the dealer's current API key + enabled flag (session auth).
export async function GET() {
  try {
    const user = await requireDealer();
    if (!user.dealerId) return error("Dealer not found", 404);

    const [dealer] = await db
      .select({ apiKey: dealers.apiKey, apiEnabled: dealers.apiEnabled })
      .from(dealers)
      .where(eq(dealers.id, user.dealerId));
    if (!dealer) return error("Dealer not found", 404);

    return json({
      apiKey: dealer.apiKey ? maskApiKey(dealer.apiKey) : "",
      apiKeyMasked: dealer.apiKey ? maskApiKey(dealer.apiKey) : "",
      hasApiKey: !!dealer.apiKey,
      apiEnabled: dealer.apiEnabled,
    });
  } catch (e) {
    return mapAuthError(e);
  }
}

// POST — generate (or regenerate) the API key and enable the API (session auth).
export async function POST() {
  try {
    const user = await requireDealer();
    if (!user.dealerId) return error("Dealer not found", 404);

    const apiKey = generateApiKey();
    const [dealer] = await db
      .update(dealers)
      .set({ apiKey, apiEnabled: true, updatedAt: new Date() })
      .where(eq(dealers.id, user.dealerId))
      .returning({ apiKey: dealers.apiKey, apiEnabled: dealers.apiEnabled });

    return json({
      apiKey: dealer.apiKey,
      apiKeyMasked: dealer.apiKey ? maskApiKey(dealer.apiKey) : "",
      hasApiKey: !!dealer.apiKey,
      apiEnabled: dealer.apiEnabled,
    });
  } catch (e) {
    return mapAuthError(e);
  }
}
