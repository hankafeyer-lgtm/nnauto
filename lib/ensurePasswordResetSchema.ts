import { pool } from "./db";

/**
 * Idempotently ensure the password_reset_tokens table exists.
 * Runs once per process (memoised) – safe to invoke from any auth route.
 *
 * NOTE: We intentionally do not depend on the deploy pipeline running
 * `drizzle-kit migrate`, because the current VPS deploy workflow only does
 * `npm ci && npm run build`. This guarantees the auth flow has its storage
 * the first time it is exercised in production.
 */
let ensured: Promise<void> | null = null;

const DDL = `
  CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id varchar NOT NULL,
    token_hash varchar(64) NOT NULL,
    expires_at timestamp NOT NULL,
    used_at timestamp,
    requested_ip_hash varchar(64),
    created_at timestamp NOT NULL DEFAULT now()
  );
  CREATE UNIQUE INDEX IF NOT EXISTS password_reset_tokens_token_hash_idx
    ON password_reset_tokens (token_hash);
  CREATE INDEX IF NOT EXISTS password_reset_tokens_user_id_idx
    ON password_reset_tokens (user_id);
  CREATE INDEX IF NOT EXISTS password_reset_tokens_expires_at_idx
    ON password_reset_tokens (expires_at);
`;

export function ensurePasswordResetSchema(): Promise<void> {
  if (!ensured) {
    ensured = (async () => {
      try {
        await pool.query(DDL);
      } catch (e) {
        // Reset memoisation on failure so a subsequent request retries.
        ensured = null;
        console.error(
          "[ensurePasswordResetSchema] Failed to ensure schema:",
          e,
        );
        throw e;
      }
    })();
  }
  return ensured;
}
