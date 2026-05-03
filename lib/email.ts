import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";

/**
 * Generic e-mail sender used by the messaging inbox (dealer ↔ buyer email
 * replies). All purpose-built helpers below build on the same MailerSend
 * client; this is the low-level entry point.
 *
 * Returns `{ ok, externalId? }` so callers can persist the provider-side
 * message id (used to reconcile inbound webhook replies).
 */
export async function sendEmail(args: {
  to: string;
  toName?: string;
  subject: string;
  html?: string;
  text?: string;
  /** RFC 5322 Reply-To. Used to thread replies back via the inbound
   *  webhook (e.g. `reply+<conversationId>@<INBOUND_EMAIL_DOMAIN>`). */
  replyTo?: string;
  /** Optional `From` override; falls back to MAILERSEND_FROM_EMAIL. */
  fromEmail?: string;
  fromName?: string;
  /** Extra RFC 5322 headers (e.g. `In-Reply-To`, `References`). */
  headers?: Array<{ name: string; value: string }>;
}): Promise<{ ok: boolean; externalId?: string | null }> {
  const apiKey = (process.env.MAILERSEND_API_KEY || "").trim();
  if (!apiKey) {
    console.error("[EMAIL] MAILERSEND_API_KEY not configured");
    return { ok: false };
  }
  if (!args.html && !args.text) {
    console.error("[EMAIL] sendEmail called without html or text body");
    return { ok: false };
  }

  const mailerSend = new MailerSend({ apiKey });
  const senderEmail =
    (args.fromEmail || process.env.MAILERSEND_FROM_EMAIL || "info@nnauto.cz").trim();
  const sender = new Sender(senderEmail, args.fromName || "NNAuto");
  const recipients = [new Recipient(args.to, args.toName || args.to)];

  let params = new EmailParams()
    .setFrom(sender)
    .setTo(recipients)
    .setSubject(args.subject);

  if (args.html) params = params.setHtml(args.html);
  if (args.text) params = params.setText(args.text);
  if (args.replyTo) {
    params = params.setReplyTo(new Sender(args.replyTo, args.fromName || "NNAuto"));
  } else {
    params = params.setReplyTo(sender);
  }
  if (args.headers && args.headers.length > 0) {
    // MailerSend SDK: setHeaders([{name, value}, ...])
    type WithHeaders = { setHeaders?: (h: typeof args.headers) => EmailParams };
    const withHeaders = params as unknown as WithHeaders;
    if (typeof withHeaders.setHeaders === "function") {
      params = withHeaders.setHeaders(args.headers);
    }
  }

  try {
    const res = (await mailerSend.email.send(params)) as {
      headers?: Record<string, string>;
      body?: { message_id?: string };
    } | undefined;
    const externalId =
      res?.headers?.["x-message-id"] ||
      res?.body?.message_id ||
      null;
    return { ok: true, externalId };
  } catch (e) {
    console.error("[EMAIL] sendEmail failed:", e);
    return { ok: false };
  }
}

export async function sendVerificationEmail(
  email: string,
  code: string,
): Promise<boolean> {
  const apiKey = process.env.MAILERSEND_API_KEY;
  if (!apiKey) {
    console.error("[EMAIL] MAILERSEND_API_KEY not configured");
    return false;
  }

  const mailerSend = new MailerSend({ apiKey });
  const senderEmail = process.env.MAILERSEND_FROM_EMAIL || "info@nnauto.cz";
  const sentFrom = new Sender(senderEmail, "NNAuto");
  const recipients = [new Recipient(email, email)];

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setReplyTo(sentFrom)
    .setSubject("Ověřovací kód - NNAuto")
    .setHtml(
      `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; padding: 20px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://nnauto.cz/logo.png" alt="NNAuto" style="width: 80px; height: auto;" />
        </div>
        <h2 style="color: #B8860B; text-align: center;">Ověření emailu</h2>
        <p>Váš ověřovací kód je:</p>
        <p style="font-size: 32px; font-weight: bold; padding: 15px; background: #f5f5f5; border-radius: 4px; text-align: center; letter-spacing: 8px;">${code}</p>
        <p>Tento kód je platný po dobu 15 minut.</p>
        <p>Pokud jste o ověření nežádali, ignorujte tento email.</p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
        <p style="color: #666; font-size: 12px; text-align: center;">NNAuto - Prémiový autobazar v České republice</p>
      </div>`,
    )
    .setText(
      `NNAuto - Ověření emailu\n\nVáš ověřovací kód je: ${code}\n\nTento kód je platný po dobu 15 minut.\n\nPokud jste o ověření nežádali, ignorujte tento email.`,
    );

  try {
    await mailerSend.email.send(emailParams);
    return true;
  } catch {
    return false;
  }
}

export async function sendPasswordResetLinkEmail(args: {
  to: string;
  resetUrl: string;
  expiresInMinutes: number;
}): Promise<boolean> {
  const { to, resetUrl, expiresInMinutes } = args;
  const apiKey = (process.env.MAILERSEND_API_KEY || "").trim();
  if (!apiKey) {
    console.error("[EMAIL] MAILERSEND_API_KEY not configured");
    return false;
  }

  const mailerSend = new MailerSend({ apiKey });
  const senderEmail = process.env.MAILERSEND_FROM_EMAIL || "info@nnauto.cz";
  const sentFrom = new Sender(senderEmail, "NNAuto");
  const recipients = [new Recipient(to, to)];

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setReplyTo(sentFrom)
    .setSubject("Obnovení hesla - NNAuto")
    .setHtml(
      `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; padding: 20px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://nnauto.cz/logo.png" alt="NNAuto" style="width: 80px; height: auto;" />
        </div>
        <h2 style="color: #B8860B; text-align: center;">Obnovení hesla</h2>
        <p>Pro nastavení nového hesla klikněte na tlačítko níže. Odkaz je platný ${expiresInMinutes} minut a lze jej použít pouze jednou.</p>
        <p style="text-align: center; margin: 24px 0;">
          <a href="${resetUrl}" style="display: inline-block; background: #B8860B; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Nastavit nové heslo</a>
        </p>
        <p style="font-size: 12px; color: #666;">Pokud tlačítko nefunguje, zkopírujte do prohlížeče tento odkaz:</p>
        <p style="font-size: 12px; word-break: break-all;"><a href="${resetUrl}">${resetUrl}</a></p>
        <p>Pokud jste o obnovení hesla nežádali, tento e-mail prosím ignorujte – vaše stávající heslo zůstává v platnosti.</p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
        <p style="color: #666; font-size: 12px; text-align: center;">NNAuto - Prémiový autobazar v České republice</p>
      </div>`,
    )
    .setText(
      `NNAuto - Obnovení hesla\n\nPro nastavení nového hesla otevřete tento odkaz (platný ${expiresInMinutes} minut, na jedno použití):\n${resetUrl}\n\nPokud jste o obnovení hesla nežádali, tento e-mail ignorujte.\n\nNNAuto - Prémiový autobazar v České republice`,
    );

  try {
    await mailerSend.email.send(emailParams);
    return true;
  } catch (e) {
    console.error("[EMAIL] Password reset email failed:", e);
    return false;
  }
}

export async function sendCebiaReportReadyEmail(args: {
  email: string;
  vin: string;
  pdfUrl: string;
}): Promise<void> {
  const apiKey = process.env.MAILERSEND_API_KEY;
  if (!apiKey) return;

  const { email, vin, pdfUrl } = args;
  const mailerSend = new MailerSend({ apiKey });
  const senderEmail = process.env.MAILERSEND_FROM_EMAIL || "info@nnauto.cz";
  const sentFrom = new Sender(senderEmail, "NNAuto");
  const recipients = [new Recipient(email, email)];

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setReplyTo(sentFrom)
    .setSubject("Cebia report je připraven - NNAuto")
    .setHtml(
      `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; padding: 20px;">
        <h2 style="color: #B8860B; text-align: center;">Váš Cebia report je připraven!</h2>
        <p>VIN: <strong>${vin}</strong></p>
        <p style="text-align: center;">
          <a href="${pdfUrl}" style="display: inline-block; background: #B8860B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Stáhnout PDF</a>
        </p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
        <p style="color: #666; font-size: 12px; text-align: center;">NNAuto</p>
      </div>`,
    )
    .setText(`Váš Cebia report pro VIN ${vin} je připraven.\n\nStáhnout: ${pdfUrl}`);

  try {
    await mailerSend.email.send(emailParams);
  } catch (e) {
    console.error("[EMAIL] Cebia ready email failed:", e);
  }
}
