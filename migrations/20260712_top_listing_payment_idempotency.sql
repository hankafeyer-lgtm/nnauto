WITH ranked AS (
  SELECT
    ctid,
    row_number() OVER (
      PARTITION BY stripe_session_id, listing_id
      ORDER BY created_at ASC, id ASC
    ) AS rn
  FROM payments
  WHERE stripe_session_id IS NOT NULL
)
DELETE FROM payments p
USING ranked r
WHERE p.ctid = r.ctid
  AND r.rn > 1;

CREATE UNIQUE INDEX IF NOT EXISTS payments_stripe_session_listing_unique
  ON payments (stripe_session_id, listing_id)
  WHERE stripe_session_id IS NOT NULL;
