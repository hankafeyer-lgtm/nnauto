#!/usr/bin/env node
/**
 * Apply a raw SQL migration file to the database.
 * Usage: node scripts/run-migration.mjs migrations/20260621_dealer_feeds.sql
 * Requires: DATABASE_URL (or .env with DATABASE_URL)
 */
import "dotenv/config";
import fs from "node:fs";
import pg from "pg";

const { Client } = pg;

const file = process.argv[2];
if (!file) {
  console.error("Usage: node scripts/run-migration.mjs <path-to-sql>");
  process.exit(1);
}

const sql = fs.readFileSync(file, "utf8");

const connectionString =
  process.env.DATABASE_URL_POOLED ||
  process.env.PRODUCTION_DATABASE_URL ||
  process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL is missing.");
  process.exit(1);
}

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: process.env.PGSSL_REJECT_UNAUTHORIZED !== "false" },
});

await client.connect();
try {
  await client.query("BEGIN");
  await client.query(sql);
  await client.query("COMMIT");
  console.log(`Migration applied: ${file}`);
} catch (e) {
  await client.query("ROLLBACK");
  console.error("Migration failed:", e.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
