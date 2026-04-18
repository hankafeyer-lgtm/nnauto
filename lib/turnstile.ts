const isProductionRuntime =
  process.env.NODE_ENV === "production" ||
  Boolean(process.env.REPLIT_DEPLOYMENT) ||
  process.env.NN_AUTO_REQUIRE_PROD_SECRETS === "true";

/**
 * Cloudflare Turnstile verification. Production is fail-closed when secret is missing.
 */
export async function verifyTurnstileToken(token: string | undefined): Promise<{
  ok: boolean;
  reason?: string;
}> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  if (!secretKey) {
    if (isProductionRuntime) {
      return { ok: false, reason: "turnstile_not_configured" };
    }
    return { ok: true, reason: "dev_bypass_no_secret" };
  }
  if (!token || !String(token).trim()) {
    return { ok: false, reason: "missing_token" };
  }

  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret: secretKey, response: token }),
    },
  );

  const data = (await response.json()) as {
    success: boolean;
    "error-codes"?: string[];
  };

  if (!data.success) {
    return {
      ok: false,
      reason: (data["error-codes"] || []).join(",") || "verify_failed",
    };
  }
  return { ok: true };
}
