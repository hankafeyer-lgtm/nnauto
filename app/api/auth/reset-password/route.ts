import { NextRequest } from "next/server";
import { createHash } from "crypto";
import bcrypt from "bcrypt";
import { json, error } from "@lib/api-helpers";
import { storage } from "@lib/storage";
import { checkRateLimit, getClientIp } from "@lib/rateLimit";
import { verifyTurnstileToken } from "@lib/turnstile";
import { resetPasswordSchema } from "@shared/schema";
import { securityLog } from "@lib/securityLog";
import { ensurePasswordResetSchema } from "@lib/ensurePasswordResetSchema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Tighter limit to prevent token-bruteforce: 10 attempts / 15 min per IP.
const RATE_LIMIT = {
  name: "reset-password",
  limit: 10,
  windowMs: 15 * 60_000,
  retryAfterSeconds: 15 * 60,
} as const;

function sha256Hex(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

export async function POST(req: NextRequest) {
  const limited = checkRateLimit(req, RATE_LIMIT);
  if (limited) return limited;

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return error("Invalid request body", 400);
  }

  const parsed = resetPasswordSchema.safeParse(raw);
  if (!parsed.success) {
    return error(parsed.error.issues[0]?.message || "Invalid input", 400);
  }
  const { token, newPassword, turnstileToken } = parsed.data;

  const turnstile = await verifyTurnstileToken(turnstileToken);
  if (!turnstile.ok) {
    securityLog("reset_password_turnstile_failed", {
      reason: turnstile.reason || "failed",
      ipHash: sha256Hex(getClientIp(req)).slice(0, 12),
    });
    return error("Security verification failed. Please try again.", 400);
  }

  await ensurePasswordResetSchema();

  const tokenHash = sha256Hex(token);
  const tokenRow = await storage.getActivePasswordResetTokenByHash(tokenHash);

  if (!tokenRow) {
    securityLog("reset_password_invalid_token", {
      ipHash: sha256Hex(getClientIp(req)).slice(0, 12),
    });
    return error("Reset link is invalid or has expired.", 400);
  }

  const user = await storage.getUser(tokenRow.userId);
  if (!user) {
    await storage.markPasswordResetTokenUsed(tokenRow.id);
    return error("Reset link is invalid or has expired.", 400);
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  await storage.updateUserPassword(user.id, hashed);
  await storage.markPasswordResetTokenUsed(tokenRow.id);
  // Defensive cleanup: invalidate any other outstanding tokens this user has.
  await storage.invalidateUserPasswordResetTokens(user.id);

  securityLog("reset_password_success", {
    userId: user.id,
    ipHash: sha256Hex(getClientIp(req)).slice(0, 12),
  });

  return json({ success: true, message: "Password updated. You can now sign in." });
}
