-- Dealer webhook support.
-- Stores one outbound webhook endpoint per dealer and delivery status metadata.

CREATE TABLE IF NOT EXISTS dealer_webhooks (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id varchar NOT NULL,
  user_id varchar NOT NULL,
  webhook_url text NOT NULL,
  secret varchar(80) NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  events jsonb NOT NULL,
  status varchar(20) NOT NULL DEFAULT 'idle',
  last_delivery_at timestamp,
  last_status integer,
  last_error text,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS dealer_webhooks_dealer_id_unique ON dealer_webhooks (dealer_id);
CREATE INDEX IF NOT EXISTS dealer_webhooks_user_id_idx ON dealer_webhooks (user_id);
