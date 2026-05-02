import { NextRequest } from "next/server";
import { createHash, randomBytes } from "crypto";
import { json, error } from "@lib/api-helpers";
import { storage } from "@lib/storage";
import { db } from "@lib/db";
import { users } from "@shared/schema";
import { ilike } from "drizzle-orm";
import { checkRateLimit, getClientIp } from "@lib/rateLimit";
import { rateLimitAllow } from "@lib/rateLimitMemory";
import { verifyTurnstileToken } from "@lib/turnstile";
import { sendPasswordResetLinkEmail } from "@lib/email";
import { securityLog } from "@lib/securityLog";
import { ensurePasswordResetSchema } from "@lib/ensurePasswordResetSchema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Same response shape regardless of whether the email is registered – do not
// leak account existence.
const SUCCESS_MSG =
  "If an account exists for that email, a password reset link has been sent.";

// Per-IP limiter is intentionally generous because mobile carriers (CGNAT)
// share one IP across many legitimate users. Abuse is constrained additionally
// by the per-email limiter and Turnstile.
const RATE_LIMIT = {
  name: "forgot-password",
  limit: 20,
  windowMs: 15 * 60_000,
  retryAfterSeconds: 15 * 60,
} as const;

// Per-email limiter prevents abuse of a single account regardless of source IP.
// 3 reset emails per hour for the same address is plenty for a legitimate user
// and stops mass spam / mailbox flooding of one target.
const EMAIL_LIMIT = { count: 3, windowMs: 60 * 60_000 } as const;

const TOKEN_TTL_MS = 15 * 60_000;
const MIN_RESPONSE_MS = 450;
const MAX_RESPONSE_MS = 600;

// Recovery email overrides for accounts whose original mailbox is not reachable.
const RECOVERY_EMAIL_MAP: Record<string, string> = {
  "admin@zlateauto.cz": "nehria1@seznam.cz",
};

function sha256Hex(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

function getBaseUrl(req: NextRequest): string {
  const envBase = (process.env.BASE_URL || process.env.PUBLIC_BASE_URL || "")
    .trim()
    .replace(/\/+$/, "");
  if (envBase) return envBase;
  const proto = req.headers.get("x-forwarded-proto") || "https";
  const host = req.headers.get("host") || "nnauto.cz";
  return `${proto}://${host}`;
}

async function constantTimeFinish<T>(
  startedAt: number,
  result: T,
): Promise<T> {
  const elapsed = Date.now() - startedAt;
  const target =
    MIN_RESPONSE_MS +
    Math.floor(Math.random() * (MAX_RESPONSE_MS - MIN_RESPONSE_MS));
  if (elapsed < target) {
    await new Promise((r) => setTimeout(r, target - elapsed));
  }
  return result;
}

export async function POST(req: NextRequest) {
  const startedAt = Date.now();

  const limited = checkRateLimit(req, RATE_LIMIT);
  if (limited) {
    securityLog("forgot_password_rate_limited", {
      ipHash: sha256Hex(getClientIp(req)).slice(0, 12),
    });
    return limited;
  }

  let body: { email?: unknown; turnstileToken?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    return error("Invalid request body", 400);
  }

  const turnstile = await verifyTurnstileToken(
    typeof body.turnstileToken === "string" ? body.turnstileToken : undefined,
  );
  if (!turnstile.ok) {
    securityLog("forgot_password_turnstile_failed", {
      reason: turnstile.reason || "failed",
      ipHash: sha256Hex(getClientIp(req)).slice(0, 12),
    });
    return error("Security verification failed. Please try again.", 400);
  }

  const rawEmail = typeof body.email === "string" ? body.email : "";
  const email = rawEmail.trim().toLowerCase();
  if (!email) {
    // Pad timing even on validation errors to keep behaviour uniform.
    return await constantTimeFinish(
      startedAt,
      error("Email is required", 400),
    );
  }

  // Per-email rate limit. Unlike per-IP, this should silently behave like
  // success (still constant-time) so the caller cannot use it to enumerate
  // accounts ("this email is being limited" leaks existence).
  const emailKey = `forgot-password:email:${email}`;
  const emailAllowed = rateLimitAllow(
    emailKey,
    EMAIL_LIMIT.count,
    EMAIL_LIMIT.windowMs,
  );
  if (!emailAllowed) {
    securityLog("forgot_password_rate_limited", {
      ipHash: sha256Hex(getClientIp(req)).slice(0, 12),
      reason: "email_window",
    });
    return await constantTimeFinish(
      startedAt,
      json({ success: true, message: SUCCESS_MSG }),
    );
  }

  try {
    await ensurePasswordResetSchema();

    const [user] = await db
      .select()
      .from(users)
      .where(ilike(users.email, email));

    if (!user) {
      console.log(
        "[INFO] Password reset requested for non-existent email:",
        email,
      );
      return await constantTimeFinish(
        startedAt,
        json({ success: true, message: SUCCESS_MSG }),
      );
    }

    // Generate raw token (URL-safe). Send raw to email, store sha256(raw) in DB.
    const rawToken = randomBytes(32).toString("base64url");
    const tokenHash = sha256Hex(rawToken);
    const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);
    const ipHash = sha256Hex(getClientIp(req)).slice(0, 64);

    // Invalidate any previous outstanding tokens for this user, then create new.
    await storage.invalidateUserPasswordResetTokens(user.id);
    const tokenRow = await storage.createPasswordResetToken({
      userId: user.id,
      tokenHash,
      expiresAt,
      requestedIpHash: ipHash,
    });

    const resetUrl = `${getBaseUrl(req)}/reset-password?token=${rawToken}`;
    const deliverTo = RECOVERY_EMAIL_MAP[email] || user.email;

    const sent = await sendPasswordResetLinkEmail({
      to: deliverTo,
      resetUrl,
      expiresInMinutes: Math.round(TOKEN_TTL_MS / 60_000),
    });

    if (!sent) {
      // Roll back the token so we don't leave dangling links if delivery failed.
      await storage.deletePasswordResetTokenById(tokenRow.id);
      console.error(
        "[ERROR] Password reset email delivery failed for:",
        email,
        deliverTo !== user.email ? `(intended delivery: ${deliverTo})` : "",
      );
      // Same response shape – do not reveal mail-system status to the caller.
      return await constantTimeFinish(
        startedAt,
        json({ success: true, message: SUCCESS_MSG }),
      );
    }

    securityLog("forgot_password_sent", {
      userId: user.id,
      ipHash: ipHash.slice(0, 12),
      via: deliverTo !== user.email ? "recovery_map" : "self",
    });
    console.log(
      "[INFO] Password reset link sent for email:",
      email,
      deliverTo !== user.email ? `(delivered to ${deliverTo})` : "",
    );

    return await constantTimeFinish(
      startedAt,
      json({ success: true, message: SUCCESS_MSG }),
    );
  } catch (err: unknown) {
    console.error("[ERROR] Forgot password error:", err);
    return await constantTimeFinish(
      startedAt,
      error("An error occurred. Please try again later.", 500),
    );
  }
}
