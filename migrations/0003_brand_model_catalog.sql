CREATE TABLE IF NOT EXISTS "brands" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "slug" varchar(120) NOT NULL,
  "name" text NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "brands_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "models" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "brand_id" varchar NOT NULL REFERENCES "brands"("id") ON DELETE CASCADE,
  "slug" varchar(160) NOT NULL,
  "name" text NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "models_brand_slug_unique" UNIQUE("brand_id","slug")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "brands_name_idx" ON "brands" USING btree ("name");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "models_brand_idx" ON "models" USING btree ("brand_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "models_name_idx" ON "models" USING btree ("name");
