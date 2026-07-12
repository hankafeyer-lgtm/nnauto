CREATE TABLE IF NOT EXISTS dealer_feed_sync_jobs (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id varchar NOT NULL,
  user_id varchar NOT NULL,
  feed_id varchar NOT NULL,
  feed_url text NOT NULL,
  status varchar(20) NOT NULL DEFAULT 'pending',
  trigger varchar(20) NOT NULL DEFAULT 'manual',
  started_at timestamp,
  finished_at timestamp,
  summary jsonb,
  error text,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS dealer_feed_sync_jobs_dealer_id_idx
  ON dealer_feed_sync_jobs (dealer_id);

CREATE INDEX IF NOT EXISTS dealer_feed_sync_jobs_status_idx
  ON dealer_feed_sync_jobs (status);

CREATE INDEX IF NOT EXISTS dealer_feed_sync_jobs_created_at_idx
  ON dealer_feed_sync_jobs (created_at);
