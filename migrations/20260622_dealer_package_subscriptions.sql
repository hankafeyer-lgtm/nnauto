-- Dealer Stripe package subscriptions.
-- Separate from existing Stripe payments used by other parts of the site.

CREATE TABLE IF NOT EXISTS dealer_package_subscriptions (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id varchar NOT NULL,
  user_id varchar NOT NULL,
  package_id varchar(20) NOT NULL,
  status varchar(32) NOT NULL,
  stripe_customer_id text,
  stripe_subscription_id text NOT NULL,
  stripe_checkout_session_id text,
  stripe_price_id text NOT NULL,
  amount_kc integer NOT NULL,
  currency varchar(3) NOT NULL DEFAULT 'CZK',
  max_listings integer NOT NULL,
  current_period_start timestamp,
  current_period_end timestamp,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  canceled_at timestamp,
  latest_invoice_id text,
  metadata jsonb,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS dealer_package_subscriptions_stripe_sub_unique
  ON dealer_package_subscriptions (stripe_subscription_id);
CREATE INDEX IF NOT EXISTS dealer_package_subscriptions_dealer_id_idx
  ON dealer_package_subscriptions (dealer_id);
CREATE INDEX IF NOT EXISTS dealer_package_subscriptions_user_id_idx
  ON dealer_package_subscriptions (user_id);
CREATE INDEX IF NOT EXISTS dealer_package_subscriptions_status_idx
  ON dealer_package_subscriptions (status);
