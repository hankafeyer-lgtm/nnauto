-- Mark listings as sold (hidden from public catalog, visible in owner cabinet + direct URL).
ALTER TABLE listings ADD COLUMN IF NOT EXISTS is_sold BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS listings_is_sold_idx ON listings (is_sold);
