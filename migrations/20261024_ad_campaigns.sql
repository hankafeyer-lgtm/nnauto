-- NNAuto advertising platform — campaigns, events, admin price overrides
-- Safe / idempotent.

CREATE TABLE IF NOT EXISTS ad_campaigns (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id varchar NOT NULL,
  advertiser_name text,
  name text NOT NULL,
  status varchar(32) NOT NULL DEFAULT 'draft',
  placement varchar(64) NOT NULL,
  headline text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  image_url text,
  video_url text,
  cta_text text NOT NULL DEFAULT 'Zjistit více',
  target_url text NOT NULL DEFAULT '',
  duration_days integer NOT NULL DEFAULT 7,
  price_kc integer NOT NULL DEFAULT 0,
  currency varchar(3) NOT NULL DEFAULT 'CZK',
  start_date date NOT NULL,
  end_date date NOT NULL,
  brand_filter varchar(80),
  category_filter varchar(80),
  impressions integer NOT NULL DEFAULT 0,
  clicks integer NOT NULL DEFAULT 0,
  spend_kc integer NOT NULL DEFAULT 0,
  rejection_reason text,
  stripe_session_id text,
  stripe_payment_intent_id text,
  paid_at timestamp,
  approved_at timestamp,
  approved_by varchar,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ad_campaigns_user_idx ON ad_campaigns (user_id);
CREATE INDEX IF NOT EXISTS ad_campaigns_status_placement_idx
  ON ad_campaigns (status, placement);
CREATE INDEX IF NOT EXISTS ad_campaigns_dates_idx
  ON ad_campaigns (start_date, end_date);
CREATE UNIQUE INDEX IF NOT EXISTS ad_campaigns_stripe_session_uidx
  ON ad_campaigns (stripe_session_id)
  WHERE stripe_session_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS ad_events (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id varchar NOT NULL REFERENCES ad_campaigns(id) ON DELETE CASCADE,
  event_type varchar(16) NOT NULL,
  placement varchar(64) NOT NULL,
  device varchar(16),
  session_key varchar(64),
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ad_events_campaign_idx ON ad_events (campaign_id, created_at);
CREATE INDEX IF NOT EXISTS ad_events_dedupe_idx
  ON ad_events (campaign_id, event_type, session_key, created_at);

CREATE TABLE IF NOT EXISTS ad_placement_prices (
  placement varchar(64) NOT NULL,
  duration_days integer NOT NULL,
  price_kc integer NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  updated_at timestamp NOT NULL DEFAULT now(),
  updated_by varchar,
  PRIMARY KEY (placement, duration_days)
);

INSERT INTO ad_placement_prices (placement, duration_days, price_kc, enabled)
VALUES
  ('homepage_top', 7, 590, true),
  ('homepage_top', 14, 990, true),
  ('homepage_top', 30, 1790, true),
  ('listing_top', 7, 390, true),
  ('listing_top', 14, 690, true),
  ('listing_top', 30, 1190, true),
  ('listing_inline', 7, 199, true),
  ('listing_inline', 14, 349, true),
  ('listing_inline', 30, 590, true),
  ('vehicle_detail_sidebar', 7, 149, true),
  ('vehicle_detail_sidebar', 14, 249, true),
  ('vehicle_detail_sidebar', 30, 449, true),
  ('featured_top', 7, 290, true),
  ('featured_top', 14, 490, true),
  ('featured_top', 30, 890, true),
  ('category_brand', 7, 199, true),
  ('category_brand', 14, 349, true),
  ('category_brand', 30, 590, true),
  ('sell_car', 7, 149, true),
  ('sell_car', 14, 249, true),
  ('sell_car', 30, 449, true)
ON CONFLICT (placement, duration_days) DO NOTHING;
