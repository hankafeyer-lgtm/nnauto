ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS financing_available boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS financing_monthly_payment integer,
  ADD COLUMN IF NOT EXISTS financing_down_payment_percent integer,
  ADD COLUMN IF NOT EXISTS financing_term_months integer,
  ADD COLUMN IF NOT EXISTS financing_provider text,
  ADD COLUMN IF NOT EXISTS financing_online_approval boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS financing_for_business boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS financing_for_private boolean NOT NULL DEFAULT false;
