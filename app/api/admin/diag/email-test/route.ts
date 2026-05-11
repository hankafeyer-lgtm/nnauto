import { NextRequest } from "next/server";
import { error, json } from "@lib/api-helpers";
import { requireAdmin } from "@lib/auth";
import { sendEmail } from "@lib/email";

/**
 * Admin-only diagnostic endpoint for the chat → seller email flow.
 *
 * GET /api/admin/diag/email-test         — shows env-var status only.
 * POST { to: string, subject?: string }  — actually attempts the send via
 *                                          MailerSend and returns the full
 *                                          structured outcome (ok flag,
 *                                          externalId, or the failure
 *                                          fields logged by lib/email.ts).
 *
 * No data is taken from request paths or query strings besides the JSON
 * body. The body is validated to be `{ to: string }`. Only users where
 * `users.isAdmin === true` may call this — everyone else gets 403.
 */
export async function GET(_req: NextRequest) {
  try {
    await requireAdmin();
    const apiKey = (process.env.MAILERSEND_API_KEY || "").trim();
    const fromEmail = (process.env.MAILERSEND_FROM_EMAIL || "").trim();
    return json({
      ok: true,
      env: {
        hasMailerKey: !!apiKey,
        mailerKeyLength: apiKey.length || 0,
        fromEmail: fromEmail || null,
        appUrl: process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || null,
        nodeEnv: process.env.NODE_ENV || null,
      },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return error("Unauthorized", 401);
    if (msg === "Forbidden") return error("Forbidden", 403);
    return error(msg, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = (await req.json().catch(() => null)) as
      | { to?: unknown; subject?: unknown }
      | null;
    const to =
      typeof body?.to === "string" && body.to.trim().length > 0
        ? body.to.trim()
        : null;
    if (!to) return error("Missing 'to' in request body", 400);
    const subject =
      typeof body?.subject === "string" && body.subject.trim().length > 0
        ? body.subject.trim()
        : "NNAuto · MailerSend diagnostic";

    const apiKey = (process.env.MAILERSEND_API_KEY || "").trim();
    const fromEmail = (process.env.MAILERSEND_FROM_EMAIL || "").trim();

    const startedAt = Date.now();
    const result = await sendEmail({
      to,
      subject,
      text:
        "This is a NNAuto diagnostic email triggered from /api/admin/diag/email-test.\n" +
        `Sent at ${new Date().toISOString()}.`,
      html: `<p>NNAuto diagnostic email.</p><p>Sent at <strong>${new Date().toISOString()}</strong>.</p>`,
    });
    const elapsedMs = Date.now() - startedAt;

    return json({
      ok: result.ok,
      result,
      env: {
        hasMailerKey: !!apiKey,
        mailerKeyLength: apiKey.length || 0,
        fromEmail: fromEmail || null,
      },
      elapsedMs,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return error("Unauthorized", 401);
    if (msg === "Forbidden") return error("Forbidden", 403);
    return error(msg, 500);
  }
}
