CREATE TABLE IF NOT EXISTS dealer_settings (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id varchar NOT NULL,
  user_id varchar NOT NULL,
  settings jsonb NOT NULL,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS dealer_settings_dealer_id_unique
  ON dealer_settings (dealer_id);

CREATE INDEX IF NOT EXISTS dealer_settings_user_id_idx
  ON dealer_settings (user_id);
