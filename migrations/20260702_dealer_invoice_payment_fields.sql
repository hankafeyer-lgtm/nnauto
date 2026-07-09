ALTER TABLE dealer_invoices
  ADD COLUMN IF NOT EXISTS paid_at timestamp,
  ADD COLUMN IF NOT EXISTS payment_method varchar(80) DEFAULT 'Online platba kartou';

UPDATE dealer_invoices
SET
  paid_at = COALESCE(paid_at, issued_at),
  payment_method = COALESCE(payment_method, 'Online platba kartou')
WHERE paid_at IS NULL OR payment_method IS NULL;
