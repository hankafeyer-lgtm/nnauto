-- Password reset flow: persist short-lived (15 min) reset tokens.
-- We store only sha256(hex) of the raw token, never the raw value.
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
