import { NextRequest } from "next/server";
import { json } from "@lib/api-helpers";

/**
 * WhatsApp inbound webhook — prepared integration only.
 *
 * The full integration (verify the WhatsApp Cloud API signature, look up
 * the listing+dealer by phone-number-id, etc.) is intentionally not
 * implemented yet. The route exists so:
 *
 *  - the URL is reservable in the cloud provider config,
 *  - we can ship the dealer cabinet UI with the WhatsApp source/icon
 *    already wired up, and
 *  - a future PR can drop the real handler in without changing the URL.
 *
 * GET handles Meta's webhook verification challenge if env vars are set.
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const verify = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");
  const expected = (process.env.WHATSAPP_VERIFY_TOKEN || "").trim();
  if (mode === "subscribe" && expected && verify === expected && challenge) {
    return new Response(challenge, { status: 200 });
  }
  return json({ ok: true, status: "prepared" });
}

export async function POST(_req: NextRequest) {
  // Intentionally a no-op for now. Returning 200 (not 501) so providers
  // don't retry, and so a future implementation can be added without
  // any surprise from a queued backlog of 5xx retries.
  return json({ ok: true, status: "prepared" });
}
