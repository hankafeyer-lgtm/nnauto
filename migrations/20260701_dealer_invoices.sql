CREATE TABLE IF NOT EXISTS dealer_invoices (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id varchar NOT NULL,
  user_id varchar NOT NULL,
  subscription_id varchar,
  stripe_checkout_session_id text,
  stripe_invoice_id text,
  number varchar(32) NOT NULL,
  issued_at timestamp NOT NULL,
  taxable_supply_at timestamp NOT NULL,
  package_id varchar(20) NOT NULL,
  description text NOT NULL,
  amount_kc integer NOT NULL,
  currency varchar(3) NOT NULL DEFAULT 'CZK',
  vat_rate integer NOT NULL DEFAULT 21,
  status varchar(20) NOT NULL DEFAULT 'paid',
  buyer_company_name text NOT NULL,
  buyer_ico varchar(20),
  buyer_dic varchar(20),
  buyer_address text,
  buyer_email varchar,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS dealer_invoices_number_unique ON dealer_invoices (number);
CREATE UNIQUE INDEX IF NOT EXISTS dealer_invoices_checkout_session_unique
  ON dealer_invoices (stripe_checkout_session_id)
  WHERE stripe_checkout_session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS dealer_invoices_dealer_id_idx ON dealer_invoices (dealer_id);
CREATE INDEX IF NOT EXISTS dealer_invoices_user_id_idx ON dealer_invoices (user_id);
CREATE INDEX IF NOT EXISTS dealer_invoices_issued_at_idx ON dealer_invoices (issued_at DESC);
