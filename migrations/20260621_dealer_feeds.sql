-- Dealer XML/feed sync support.
-- Adds source tracking columns to listings and a dealer_feeds config table.

ALTER TABLE listings ADD COLUMN IF NOT EXISTS source text DEFAULT 'manual';
ALTER TABLE listings ADD COLUMN IF NOT EXISTS external_id text;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS feed_id varchar;

CREATE INDEX IF NOT EXISTS listings_feed_id_idx ON listings (feed_id);
-- NULLs are distinct in Postgres, so manual listings (external_id IS NULL)
-- never collide on this dedup key.
CREATE UNIQUE INDEX IF NOT EXISTS listings_user_external_unique
  ON listings (user_id, external_id);

CREATE TABLE IF NOT EXISTS dealer_feeds (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id varchar NOT NULL,
  user_id varchar NOT NULL,
  feed_url text NOT NULL,
  format varchar(20) NOT NULL DEFAULT 'auto',
  enabled boolean NOT NULL DEFAULT true,
  status varchar(20) NOT NULL DEFAULT 'idle',
  last_sync_at timestamp,
  vehicle_count integer NOT NULL DEFAULT 0,
  created_count integer NOT NULL DEFAULT 0,
  updated_count integer NOT NULL DEFAULT 0,
  deactivated_count integer NOT NULL DEFAULT 0,
  error_count integer NOT NULL DEFAULT 0,
  last_error text,
  errors jsonb,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS dealer_feeds_dealer_id_unique ON dealer_feeds (dealer_id);
CREATE INDEX IF NOT EXISTS dealer_feeds_user_id_idx ON dealer_feeds (user_id);
