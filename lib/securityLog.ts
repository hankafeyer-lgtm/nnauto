type SecurityEvent =
  | "login_success"
  | "login_failure"
  | "register_success"
  | "register_failure"
  | "rate_limit_hit"
  | "listing_delete"
  | "upload_presign"
  | "upload_finalize"
  | "upload_file_legacy"
  | "contact_interaction";

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
