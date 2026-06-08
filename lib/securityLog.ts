type SecurityEvent =
  | "login_success"
  | "login_failure"
  | "login_turnstile_bypass"
  | "register_success"
  | "register_failure"
  | "register_turnstile_bypass"
  | "rate_limit_hit"
  | "listing_delete"
  | "upload_presign"
  | "upload_finalize"
  | "upload_file_legacy"
  | "contact_interaction"
  | "forgot_password_rate_limited"
  | "forgot_password_turnstile_failed"
  | "forgot_password_sent"
  | "reset_password_turnstile_failed"
  | "reset_password_invalid_token"
  | "reset_password_success";

/** Structured security logs (no secrets, passwords, tokens, full PII). */
export function securityLog(
  event: SecurityEvent,
  fields: Record<string, string | number | boolean | undefined>,
) {
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    event,
    ...fields,
  });
  console.log(`[security] ${line}`);
}
