const isProductionRuntime =
  process.env.NODE_ENV === "production" ||
  process.env.NN_AUTO_REQUIRE_PROD_SECRETS === "true";

const CLIENT_FALLBACK_TOKEN = "__client_fallback__";

/**
 * Cloudflare Turnstile verification. Production is fail-closed when secret is missing.
 *
 * When the client Turnstile widget cannot load (mobile CDN issues, network
 * problems), the client sends `__client_fallback__` after exhausting retries.
 * This is allowed through with `reason: "client_fallback"` so real users
 * aren't permanently blocked. The existing email-uniqueness and login-throttle
 * checks remain as secondary anti-abuse safeguards.
 */
export async function verifyTurnstileToken(token: string | undefined): Promise<{
  ok: boolean;
  reason?: string;
}> {
  if (!isProductionRuntime) {
    return { ok: true, reason: "dev_bypass" };
  }

  if (token === CLIENT_FALLBACK_TOKEN) {
    return { ok: true, reason: "client_fallback" };
  }

  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  if (!secretKey) {
    return { ok: false, reason: "turnstile_not_configured" };
  }
  if (!token || !String(token).trim()) {
    return { ok: false, reason: "missing_token" };
  }

  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ secret: secretKey, response: token }),
        signal: AbortSignal.timeout(10_000),
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
  } catch (err) {
    return { ok: true, reason: "turnstile_api_unreachable" };
  }
}
