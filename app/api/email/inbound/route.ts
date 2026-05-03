import { NextRequest } from "next/server";
import { error, json } from "@lib/api-helpers";
import { storage } from "@lib/storage";
import { ensureMessagingSchema } from "@lib/ensureMessagingSchema";
import { parseConversationIdFromAlias } from "@lib/messaging";

/**
 * Inbound e-mail webhook.
 *
 * Designed for MailerSend Inbound Routes (https://www.mailersend.com/help/inbound-email),
 * but the parser is forgiving: it accepts any JSON shape that exposes
 * a recipient address (`to`/`recipients`/`envelope.to`) and a body
 * (`text`/`plain`/`html`).
 *
 * Threading priority:
 *   1. Reply-To alias `reply+<conversationId>@<INBOUND_EMAIL_DOMAIN>` —
 *      the canonical mechanism (set on every dealer outbound email by
 *      buildReplyToAlias()).
 *   2. Fallback: lookup by stable threadKey (dealerUserId + listingId +
 *      clientEmail) — only useful once we have an existing conversation
 *      where the client already wrote in. Without an alias we can't
 *      safely route to a *new* conversation, so unmatched mail is
 *      ignored with HTTP 200 (per webhook best practice — never fail
 *      so the provider keeps retrying forever).
 *
 * Optional shared-secret guard via `INBOUND_EMAIL_WEBHOOK_SECRET`
 * (sent as `?secret=` or `X-Webhook-Secret` header).
 */
export async function POST(req: NextRequest) {
  // ───── shared secret (optional)
  const expected = (process.env.INBOUND_EMAIL_WEBHOOK_SECRET || "").trim();
  if (expected) {
    const url = new URL(req.url);
    const provided =
      url.searchParams.get("secret") ||
      req.headers.get("x-webhook-secret") ||
      "";
    if (provided !== expected) return error("Forbidden", 403);
  }

  try {
    await ensureMessagingSchema();
    const payload = (await req.json().catch(() => null)) as
      | Record<string, unknown>
      | null;
    if (!payload) {
      // Best-effort 200 so the provider doesn't retry forever.
      return json({ ok: true, ignored: "empty payload" });
    }

    // ───── extract recipient
    const recipient =
      pickStr(payload, ["to"]) ||
      pickStr(payload, ["recipient"]) ||
      pickStr(payload, ["envelope", "to"]) ||
      firstAddress(payload?.recipients) ||
      firstAddress((payload?.envelope as Record<string, unknown> | undefined)?.to) ||
      null;

    const fromAddress =
      pickStr(payload, ["from"]) ||
      pickStr(payload, ["sender"]) ||
      pickStr(payload, ["envelope", "from"]) ||
      null;

    const subject = pickStr(payload, ["subject"]) || "";
    const text =
      pickStr(payload, ["text"]) ||
      pickStr(payload, ["plain"]) ||
      pickStr(payload, ["body_plain"]) ||
      "";
    const html = pickStr(payload, ["html"]) || pickStr(payload, ["body_html"]) || "";

    const externalId =
      pickStr(payload, ["message_id"]) ||
      pickStr(payload, ["id"]) ||
      pickStr(payload, ["headers", "Message-ID"]) ||
      null;

    let conversationId = parseConversationIdFromAlias(recipient);

    if (!conversationId) {
      // No alias → bail out gracefully (we don't want to spawn a brand
      // new conversation from a generic recipient because we wouldn't
      // know which listing/dealer the message belongs to).
      return json({
        ok: true,
        ignored: "no conversation alias on recipient",
      });
    }

    const conv = await storage.getConversation(conversationId);
    if (!conv) {
      return json({ ok: true, ignored: "conversation not found" });
    }

    // Strip a few common reply quoting markers before persisting; we
    // intentionally keep this simple (the dealer can always click
    // through to read the original).
    const cleanedBody = stripQuotedReply(text || stripHtml(html));

    await storage.createMessage({
      conversationId: conv.id,
      sender: "client",
      type: "email",
      content: cleanedBody.length > 0
        ? cleanedBody
        : (subject ? `(${subject})` : "(prázdná zpráva)"),
      channel: "email",
      externalId,
    });

    await storage.touchConversationAfterMessage({
      conversationId: conv.id,
      sender: "client",
      contentPreview: cleanedBody.slice(0, 200),
      bumpStatusToInProgress: false,
    });

    // Lift the conversation into the email source on first inbound mail.
    if (conv.source !== "email") {
      // Reuse updateConversationStatus path? No — different field. Go raw.
      await import("@lib/db").then(async ({ db }) => {
        const { conversations } = await import("@shared/schema");
        const { eq } = await import("drizzle-orm");
        await db
          .update(conversations)
          .set({ source: "email", updatedAt: new Date() })
          .where(eq(conversations.id, conv.id));
      });
    }

    return json({ ok: true, conversationId: conv.id, fromAddress });
  } catch (e: unknown) {
    console.error("[POST /api/email/inbound] error:", e);
    // Always return 2xx to avoid the provider retry storm.
    return json({ ok: false, error: "internal" });
  }
}

// ─────────────────────────────────────────────────────────────────────
// helpers
// ─────────────────────────────────────────────────────────────────────

function pickStr(obj: unknown, path: string[]): string | null {
  let cur: unknown = obj;
  for (const k of path) {
    if (cur && typeof cur === "object" && k in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[k];
    } else {
      return null;
    }
  }
  if (typeof cur === "string") return cur;
  return null;
}

function firstAddress(v: unknown): string | null {
  if (Array.isArray(v) && v.length > 0) {
    const first = v[0];
    if (typeof first === "string") return first;
    if (first && typeof first === "object" && "address" in first) {
      return (first as { address?: string }).address ?? null;
    }
    if (first && typeof first === "object" && "email" in first) {
      return (first as { email?: string }).email ?? null;
    }
  }
  if (typeof v === "string") return v;
  return null;
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stripQuotedReply(s: string): string {
  if (!s) return "";
  // Cut at common quoted-reply markers ("On <date> ... wrote:", "-- ", "> ").
  const markers = [
    /\n[A-ZÁ-Ž][a-zá-ž]+, \d{1,2}\.[ ]?\d{1,2}\.[ ]?\d{4}.*napsal\(a\):/,
    /\nOn .* wrote:/,
    /\n-- \n/,
    /\n>\s/,
  ];
  let cut = s.length;
  for (const m of markers) {
    const match = s.match(m);
    if (match && typeof match.index === "number") {
      cut = Math.min(cut, match.index);
    }
  }
  return s.slice(0, cut).trim();
}
