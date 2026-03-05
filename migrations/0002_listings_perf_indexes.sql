CREATE INDEX IF NOT EXISTS "listings_is_top_created_at_idx" ON "listings" USING btree ("is_top_listing","created_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "listings_created_at_idx" ON "listings" USING btree ("created_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "listings_price_idx" ON "listings" USING btree ("price");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "listings_year_idx" ON "listings" USING btree ("year");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "listings_mileage_idx" ON "listings" USING btree ("mileage");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "listings_brand_idx" ON "listings" USING btree ("brand");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "listings_model_idx" ON "listings" USING btree ("model");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "listings_vehicle_type_idx" ON "listings" USING btree ("vehicle_type");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "listings_body_type_idx" ON "listings" USING btree ("body_type");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "listings_region_idx" ON "listings" USING btree ("region");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "listings_user_id_idx" ON "listings" USING btree ("user_id");
