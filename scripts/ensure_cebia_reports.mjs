import pg from "pg";

const { Client } = pg;

const connectionString =
  process.env.DATABASE_URL_POOLED ||
  process.env.PRODUCTION_DATABASE_URL ||
  process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is missing");
}

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: process.env.PGSSL_REJECT_UNAUTHORIZED !== "false" },
});

await client.connect();

await client.query(`
CREATE TABLE IF NOT EXISTS cebia_reports (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id varchar NOT NULL,
  listing_id varchar,
  vin varchar(17) NOT NULL,
  product varchar(40) NOT NULL DEFAULT 'pdf_autotracer',
  status varchar(30) NOT NULL DEFAULT 'created',
  price_cents integer NOT NULL,
  currency varchar(3) NOT NULL DEFAULT 'CZK',
  stripe_session_id text,
  stripe_payment_intent_id text,
  cebia_queue_id text,
  cebia_queue_status integer,
  cebia_coupon_number text,
  cebia_report_url text,
  pdf_base64 text,
  raw_response jsonb,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);
`);

await client.query(
  `CREATE INDEX IF NOT EXISTS cebia_reports_user_id_idx ON cebia_reports(user_id);`,
);
await client.query(
  `CREATE INDEX IF NOT EXISTS cebia_reports_vin_idx ON cebia_reports(vin);`,
);
await client.query(
  `CREATE INDEX IF NOT EXISTS cebia_reports_stripe_session_id_idx ON cebia_reports(stripe_session_id);`,
);
await client.query(
  `CREATE INDEX IF NOT EXISTS cebia_reports_created_at_idx ON cebia_reports(created_at);`,
);

await client.end();

console.log("cebia_reports ensured");

