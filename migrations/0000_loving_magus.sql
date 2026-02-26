CREATE TABLE "listings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"price" numeric(10, 2) NOT NULL,
	"brand" text NOT NULL,
	"model" text NOT NULL,
	"year" integer NOT NULL,
	"mileage" integer NOT NULL,
	"fuel_type" text NOT NULL,
	"transmission" text,
	"body_type" text,
	"color" text,
	"trim" text,
	"drive_type" text,
	"engine_volume" numeric(3, 1),
	"power" integer,
	"doors" integer,
	"seats" integer,
	"airbags" integer,
	"region" text,
	"category" text,
	"vehicle_type" text,
	"is_top_listing" boolean DEFAULT false NOT NULL,
	"top_listing_expires_at" timestamp,
	"vat_deductible" boolean DEFAULT true NOT NULL,
	"is_imported" boolean DEFAULT false NOT NULL,
	"import_country" text,
	"photos" text[],
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"listing_id" varchar NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'CZK' NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"stripe_payment_intent_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"first_name" varchar,
	"last_name" varchar,
	"avatar_url" text,
	"is_admin" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");