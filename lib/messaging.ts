// Shared helpers for the dealer ↔ buyer messaging module.
// Kept outside route files so listing-detail, dealer routes and webhooks
// all use the same threading + auto-reply logic.

import { randomBytes } from "crypto";

/**
 * Origin of the production-facing app, e.g. "https://nnauto.cz".
 * Used to render absolute URLs inside outbound e-mails.
 */
export function getPublicOrigin(): string {
  const fromEnv = (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    "https://nnauto.cz"
  ).replace(/\/+$/, "");
  return fromEnv;
}

/**
 * Domain used for inbound e-mail aliases.
 * `INBOUND_EMAIL_DOMAIN=reply.nnauto.cz` → Reply-To looks like
 * `reply+<conversationId>@reply.nnauto.cz`.
 *
 * If unset we fall back to MAILERSEND_FROM_EMAIL's domain. Inbound webhook
 * still works as long as the MX is pointed at MailerSend Inbound Routes.
 */
export function getInboundEmailDomain(): string | null {
  const explicit = (process.env.INBOUND_EMAIL_DOMAIN || "").trim();
  if (explicit) return explicit;
  const from = (process.env.MAILERSEND_FROM_EMAIL || "").trim();
  const at = from.indexOf("@");
  if (at > -1) return from.slice(at + 1);
  return null;
}

/**
 * Build the per-conversation Reply-To alias used to thread inbound replies
 * back to the right Conversation. Format: `reply+<conversationId>@<domain>`.
 */
export function buildReplyToAlias(conversationId: string): string | null {
  const domain = getInboundEmailDomain();
  if (!domain) return null;
  return `reply+${conversationId}@${domain}`;
}

/**
 * Inverse of buildReplyToAlias — extract the conversationId from an
 * inbound recipient address. Returns null when the address doesn't match
 * the alias pattern.
 */
export function parseConversationIdFromAlias(
  recipient: string | null | undefined,
): string | null {
  if (!recipient) return null;
  const m = recipient.toLowerCase().match(/reply\+([a-f0-9-]{8,})@/i);
  return m?.[1] ?? null;
}

/**
 * Stable threadKey for inbound matching when an alias isn't available.
 * dealerUserId + listingId + clientEmail/Phone — same identity ⇒ same key.
 */
export function makeThreadKey(args: {
  dealerUserId: string;
  listingId: string;
  clientEmail?: string | null;
  clientPhone?: string | null;
}): string {
  const ident =
    (args.clientEmail || "").toLowerCase() ||
    (args.clientPhone || "").replace(/\s+/g, "") ||
    randomBytes(8).toString("hex"); // anonymous chat: random
  return `${args.dealerUserId.slice(0, 8)}:${args.listingId.slice(0, 8)}:${ident}`.slice(0, 64);
}

// ─────────────────────────────────────────────────────────────────────────
// Auto-reply (off-hours)
// ─────────────────────────────────────────────────────────────────────────

/**
 * Returns the off-hours auto-reply text, or null.
 *
 * Behavior is fully env-driven so it can be toggled without redeploy:
 *
 *   DEALER_AUTO_REPLY_ENABLED       = "true" | "false"      (default: false)
 *   DEALER_AUTO_REPLY_MESSAGE       = custom text           (default: cs)
 *   DEALER_OFFICE_HOURS_START       = "09" (0..23)          (default: 9)
 *   DEALER_OFFICE_HOURS_END         = "18" (0..23)          (default: 18)
 *   DEALER_OFFICE_HOURS_TZ          = IANA tz               (default: Europe/Prague)
 *
 * Returns null when:
 *   - auto-reply is disabled, or
 *   - the dealer is currently INSIDE office hours.
 */
export function getOffHoursAutoReply(now: Date = new Date()): string | null {
  const enabled =
    (process.env.DEALER_AUTO_REPLY_ENABLED || "").toLowerCase() === "true";
  if (!enabled) return null;

  const tz = process.env.DEALER_OFFICE_HOURS_TZ || "Europe/Prague";
  const startH = clampHour(process.env.DEALER_OFFICE_HOURS_START, 9);
  const endH = clampHour(process.env.DEALER_OFFICE_HOURS_END, 18);

  let hour = now.getHours();
  try {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      timeZone: tz,
      hour: "2-digit",
      hour12: false,
    });
    const parsed = parseInt(fmt.format(now), 10);
    if (Number.isFinite(parsed)) hour = parsed;
  } catch {
    /* fall back to local hour above */
  }

  const insideOffice = startH <= endH ? hour >= startH && hour < endH : hour >= startH || hour < endH;
  if (insideOffice) return null;

  const fallback =
    "Děkujeme za zprávu, ozveme se vám co nejdříve. / Thank you for your message, we will reply shortly.";
  return process.env.DEALER_AUTO_REPLY_MESSAGE || fallback;
}

/**
 * Returns the welcome auto-reply text — fired on the FIRST client
 * message of any new conversation, regardless of time of day.
 *
 *   DEALER_WELCOME_AUTO_REPLY_ENABLED  = "true"|"false"  (default: true)
 *   DEALER_WELCOME_AUTO_REPLY_MESSAGE  = custom text     (default: cs)
 *
 * This is independent from office-hours auto-reply: a buyer who writes
 * during office hours still gets the welcome ack ("Thanks, we'll be
 * with you shortly"); off-hours simply replaces / extends it.
 */
export function getWelcomeAutoReply(): string | null {
  const enabled =
    (process.env.DEALER_WELCOME_AUTO_REPLY_ENABLED ?? "true").toLowerCase() ===
    "true";
  if (!enabled) return null;
  const fallback =
    "Děkujeme za zprávu, brzy se ozveme. / Thanks for your message, we will get back to you soon.";
  return process.env.DEALER_WELCOME_AUTO_REPLY_MESSAGE || fallback;
}

/**
 * Decide which auto-reply (if any) to insert as a system message on
 * the very first client message of a conversation.
 *
 * Combines welcome + off-hours so the buyer sees a single coherent
 * message instead of two separate system bubbles back-to-back.
 */
export function getFirstMessageAutoReply(now: Date = new Date()): string | null {
  const welcome = getWelcomeAutoReply();
  const offHours = getOffHoursAutoReply(now);

  if (!welcome && !offHours) return null;
  if (welcome && offHours) {
    // Stitch them together once, separated by a blank line.
    return `${welcome}\n\n${offHours}`;
  }
  return welcome ?? offHours;
}

function clampHour(raw: string | undefined, fallback: number): number {
  const n = parseInt((raw ?? "").trim(), 10);
  if (!Number.isFinite(n) || n < 0 || n > 23) return fallback;
  return n;
}

// ─────────────────────────────────────────────────────────────────────────
// HTML helpers for outbound emails
// ─────────────────────────────────────────────────────────────────────────

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};
export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => HTML_ESCAPES[c]!);
}

/**
 * Wrap dealer outbound text in a minimal styled e-mail template.
 *
 * The buyer is reminded — twice, once in the prominent listing card
 * up top and once in the disclaimer footer — that this thread is
 * about a vehicle advertised on NNAuto.cz. Goal: protect against
 * confusion / phishing claims after the conversation moves to email.
 */
export function renderDealerEmailHtml(args: {
  body: string;
  listingTitle?: string | null;
  listingUrl?: string | null;
  listingBrand?: string | null;
  listingModel?: string | null;
  listingYear?: number | null;
  listingPriceFormatted?: string | null;
  dealerName?: string | null;
}): string {
  const origin = getPublicOrigin();
  const safeBody = escapeHtml(args.body).replace(/\n/g, "<br/>");

  // Build a "listing card" only when we have at least the URL or title.
  const headline =
    [args.listingBrand, args.listingModel].filter(Boolean).join(" ").trim() ||
    args.listingTitle ||
    "";
  const subline = [
    args.listingYear ? String(args.listingYear) : null,
    args.listingPriceFormatted || null,
  ]
    .filter(Boolean)
    .join(" • ");

  const listingCard =
    args.listingUrl || args.listingTitle
      ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0"
              style="width:100%;margin:0 0 20px;border:1px solid #eee;border-radius:8px;
                     background:#fafafa;">
           <tr>
             <td style="padding:14px 16px;">
               <p style="margin:0 0 4px;font-size:11px;letter-spacing:.04em;
                         text-transform:uppercase;color:#B8860B;font-weight:600;">
                 Vůz inzerovaný na NNAuto.cz
               </p>
               ${
                 headline
                   ? `<p style="margin:0;font-size:15px;font-weight:600;color:#222;">
                        ${escapeHtml(headline)}
                      </p>`
                   : ""
               }
               ${
                 subline
                   ? `<p style="margin:2px 0 0;font-size:13px;color:#555;">
                        ${escapeHtml(subline)}
                      </p>`
                   : ""
               }
               ${
                 args.listingUrl
                   ? `<p style="margin:10px 0 0;">
                        <a href="${escapeHtml(args.listingUrl)}"
                           style="display:inline-block;font-size:13px;color:#B8860B;
                                  font-weight:600;text-decoration:none;">
                          Zobrazit inzerát na NNAuto.cz →
                        </a>
                      </p>`
                   : ""
               }
             </td>
           </tr>
         </table>`
      : "";

  const signature = args.dealerName
    ? `<p style="margin:24px 0 0;font-size:13px;color:#444;">${escapeHtml(args.dealerName)}</p>`
    : "";

  return `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;padding:20px;color:#222;">
    <div style="text-align:center;margin-bottom:16px;">
      <a href="${origin}" style="display:inline-block;text-decoration:none;">
        <img src="${origin}/logo.png" alt="NNAuto.cz" style="width:96px;height:auto;" />
      </a>
    </div>
    ${listingCard}
    <div style="font-size:15px;line-height:1.55;">${safeBody}</div>
    ${signature}
    <hr style="margin:24px 0 8px;border:none;border-top:1px solid #eee;" />
    <p style="font-size:11px;color:#888;text-align:center;line-height:1.5;">
      Tato zpráva navazuje na vaši poptávku k inzerátu na
      <a href="${origin}" style="color:#888;">NNAuto.cz</a>.<br/>
      Pokud zprávu vidíte omylem, můžete ji ignorovat.
    </p>
  </div>`;
}

/**
 * Plain-text counterpart to renderDealerEmailHtml — stitched in front
 * of the dealer's body so even mail clients that strip HTML still
 * make the listing context obvious.
 */
export function renderDealerEmailText(args: {
  body: string;
  listingTitle?: string | null;
  listingUrl?: string | null;
  listingBrand?: string | null;
  listingModel?: string | null;
  listingYear?: number | null;
  listingPriceFormatted?: string | null;
  dealerName?: string | null;
}): string {
  const headline =
    [args.listingBrand, args.listingModel].filter(Boolean).join(" ").trim() ||
    args.listingTitle ||
    "";
  const subline = [
    args.listingYear ? String(args.listingYear) : null,
    args.listingPriceFormatted || null,
  ]
    .filter(Boolean)
    .join(" • ");

  const listingBlock =
    headline || args.listingUrl
      ? [
          "— Vůz inzerovaný na NNAuto.cz —",
          headline,
          subline,
          args.listingUrl,
          "",
        ]
          .filter(Boolean)
          .join("\n") + "\n"
      : "";

  const signature = args.dealerName ? `\n\n${args.dealerName}` : "";

  return `${listingBlock}${args.body}${signature}\n\n--\nNNAuto.cz`;
}
