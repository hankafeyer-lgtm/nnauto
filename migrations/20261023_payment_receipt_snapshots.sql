-- Snapshot + classification fields for admin payment receipts (private / TOP).
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS payment_type varchar(40),
  ADD COLUMN IF NOT EXISTS includes_publish_fee boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS includes_top boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS buyer_email_snapshot text,
  ADD COLUMN IF NOT EXISTS buyer_name_snapshot text,
  ADD COLUMN IF NOT EXISTS buyer_phone_snapshot text,
  ADD COLUMN IF NOT EXISTS buyer_username_snapshot text,
  ADD COLUMN IF NOT EXISTS listing_title_snapshot text,
  ADD COLUMN IF NOT EXISTS listing_brand_snapshot text,
  ADD COLUMN IF NOT EXISTS listing_model_snapshot text,
  ADD COLUMN IF NOT EXISTS listing_year_snapshot integer,
  ADD COLUMN IF NOT EXISTS listing_vin_snapshot varchar(17),
  ADD COLUMN IF NOT EXISTS listing_price_snapshot text,
  ADD COLUMN IF NOT EXISTS service_description text;

CREATE INDEX IF NOT EXISTS payments_payment_type_idx ON payments (payment_type);
CREATE INDEX IF NOT EXISTS payments_created_at_idx ON payments (created_at DESC);
