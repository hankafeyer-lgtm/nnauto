import { NextRequest } from "next/server";
import { error, json } from "@lib/api-helpers";
import { requireDealer } from "@lib/auth";
import { storage } from "@lib/storage";
import { ensureMessagingSchema } from "@lib/ensureMessagingSchema";
import { insertQuickReplySchema } from "@shared/schema";

/**
 * Returns the dealer's quick-reply templates. The first time the dealer
 * opens the inbox, we seed sensible defaults (the four templates from
 * the spec) so the dropdown is never empty.
 */
const DEFAULTS = [
  { title: "Pozdrav + dostupnost", message: "Dobrý den, vůz je stále k dispozici." },
  { title: "Domluva prohlídky", message: "Můžete přijet na prohlídku zítra?" },
  { title: "Cena", message: "Cena je aktuální, drobný smluvní prostor je možný." },
  { title: "Žádost o telefon", message: "Pošlete mi prosím vaše telefonní číslo, ozvu se vám." },
];

export async function GET(_req: NextRequest) {
  try {
    const user = await requireDealer();
    await ensureMessagingSchema();

    let items = await storage.listQuickReplies(user.id);
    if (items.length === 0) {
      for (let i = 0; i < DEFAULTS.length; i++) {
        await storage.createQuickReply({
          dealerUserId: user.id,
          title: DEFAULTS[i].title,
          message: DEFAULTS[i].message,
          sortOrder: i,
        });
      }
      items = await storage.listQuickReplies(user.id);
    }
    return json({ quickReplies: items });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return error("Unauthorized", 401);
    if (msg === "Forbidden") return error("Forbidden", 403);
    return error(msg, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireDealer();
    await ensureMessagingSchema();

    const body = await req.json().catch(() => null);
    const parsed = insertQuickReplySchema.safeParse(body);
    if (!parsed.success) return error("Invalid payload", 400);

    const created = await storage.createQuickReply({
      dealerUserId: user.id,
      title: parsed.data.title,
      message: parsed.data.message,
      sortOrder: parsed.data.sortOrder,
    });
    return json({ ok: true, quickReply: created });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return error("Unauthorized", 401);
    if (msg === "Forbidden") return error("Forbidden", 403);
    return error(msg, 500);
  }
}
