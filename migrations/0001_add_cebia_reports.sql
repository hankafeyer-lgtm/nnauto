CREATE TABLE "cebia_reports" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"listing_id" varchar,
	"vin" varchar(17) NOT NULL,
	"product" varchar(40) DEFAULT 'pdf_autotracer' NOT NULL,
	"status" varchar(30) DEFAULT 'created' NOT NULL,
	"price_cents" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'CZK' NOT NULL,
	"stripe_session_id" text,
	"stripe_payment_intent_id" text,
	"cebia_queue_id" text,
	"cebia_queue_status" integer,
	"cebia_coupon_number" text,
	"cebia_report_url" text,
	"pdf_base64" text,
	"raw_response" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "listings" ALTER COLUMN "fuel_type" SET DATA TYPE text[];--> statement-breakpoint
ALTER TABLE "listings" ALTER COLUMN "fuel_type" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "listings" ALTER COLUMN "transmission" SET DATA TYPE text[];--> statement-breakpoint
ALTER TABLE "listings" ALTER COLUMN "drive_type" SET DATA TYPE text[];--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "seller_type" text;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "owners" integer;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "condition" text;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "equipment" text[];--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "extras" text[];--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "phone" varchar;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "vin" varchar(17);--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "euro_emission" text;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "stk_valid_until" varchar;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "has_service_book" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "video" text;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "stripe_session_id" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "phone" varchar;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email_verified" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "verification_code" varchar;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "verification_code_expiry" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "pending_email" varchar;--> statement-breakpoint
CREATE INDEX "cebia_reports_user_id_idx" ON "cebia_reports" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "cebia_reports_vin_idx" ON "cebia_reports" USING btree ("vin");--> statement-breakpoint
CREATE INDEX "cebia_reports_stripe_session_id_idx" ON "cebia_reports" USING btree ("stripe_session_id");--> statement-breakpoint
CREATE INDEX "cebia_reports_created_at_idx" ON "cebia_reports" USING btree ("created_at");