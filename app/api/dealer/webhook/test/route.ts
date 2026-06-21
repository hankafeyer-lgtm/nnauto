import { json, error } from "@lib/api-helpers";
import { requireDealer } from "@lib/auth";
import { dispatchTestWebhook } from "@lib/webhooks";

function mapAuthError(e: unknown) {
  const msg = e instanceof Error ? e.message : "Server error";
  if (msg === "Unauthorized") return error("Unauthorized", 401);
  if (msg === "Forbidden") return error("Forbidden", 403);
  return error(msg, 500);
}

export async function POST() {
  try {
    const user = await requireDealer();
    if (!user.dealerId) return error("Dealer not found", 404);
    await dispatchTestWebhook({ dealerId: user.dealerId });
    return json({ ok: true });
  } catch (e) {
    return mapAuthError(e);
  }
}
