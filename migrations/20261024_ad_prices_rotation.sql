-- Lower starter prices for demand testing + document rotation model.
-- Safe to re-run: UPSERT overwrites price_kc.

INSERT INTO ad_placement_prices (placement, duration_days, price_kc, enabled, updated_at)
VALUES
  ('homepage_top', 7, 590, true, now()),
  ('homepage_top', 14, 990, true, now()),
  ('homepage_top', 30, 1790, true, now()),
  ('listing_top', 7, 390, true, now()),
  ('listing_top', 14, 690, true, now()),
  ('listing_top', 30, 1190, true, now()),
  ('listing_inline', 7, 199, true, now()),
  ('listing_inline', 14, 349, true, now()),
  ('listing_inline', 30, 590, true, now()),
  ('vehicle_detail_sidebar', 7, 149, true, now()),
  ('vehicle_detail_sidebar', 14, 249, true, now()),
  ('vehicle_detail_sidebar', 30, 449, true, now()),
  ('featured_top', 7, 290, true, now()),
  ('featured_top', 14, 490, true, now()),
  ('featured_top', 30, 890, true, now()),
  ('category_brand', 7, 199, true, now()),
  ('category_brand', 14, 349, true, now()),
  ('category_brand', 30, 590, true, now()),
  ('sell_car', 7, 149, true, now()),
  ('sell_car', 14, 249, true, now()),
  ('sell_car', 30, 449, true, now())
ON CONFLICT (placement, duration_days) DO UPDATE SET
  price_kc = EXCLUDED.price_kc,
  enabled = EXCLUDED.enabled,
  updated_at = now();
