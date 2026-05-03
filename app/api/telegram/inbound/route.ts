import { NextRequest } from "next/server";
import { json } from "@lib/api-helpers";

/**
 * Telegram inbound webhook — prepared integration only.
 * See app/api/whatsapp/inbound/route.ts for the rationale. A future PR
 * will:
 *   - read TELEGRAM_BOT_TOKEN, validate the webhook secret token header,
 *   - parse the update payload,
 *   - resolve dealer + listing context from a deep link (start payload),
 *   - persist a Conversation/Message via the same storage helpers used
 *     by the chat and email channels.
 */
export async function POST(_req: NextRequest) {
  return json({ ok: true, status: "prepared" });
}

export async function GET() {
  return json({ ok: true, status: "prepared" });
}
