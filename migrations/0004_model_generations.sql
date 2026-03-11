CREATE TABLE IF NOT EXISTS "model_generations" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "model_id" varchar NOT NULL REFERENCES "models"("id") ON DELETE CASCADE,
  "slug" varchar(180) NOT NULL,
  "name" text NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "model_generations_model_slug_unique" UNIQUE("model_id","slug")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "model_generations_model_idx"
ON "model_generations" USING btree ("model_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "model_generations_name_idx"
ON "model_generations" USING btree ("name");
