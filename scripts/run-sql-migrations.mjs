#!/usr/bin/env node
/**
 * Apply every raw SQL migration in ./migrations once, tracked in app_migrations.
 * Uses DATABASE_URL_POOLED, PRODUCTION_DATABASE_URL, or DATABASE_URL.
 */
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import pg from "pg";

const { Client } = pg;
const root = process.cwd();
const migrationsDir = path.join(root, "migrations");
const connectionString =
  process.env.DATABASE_URL_POOLED ||
  process.env.PRODUCTION_DATABASE_URL ||
  process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL is missing.");
  process.exit(1);
}

const files = fs
  .readdirSync(migrationsDir)
  .filter((file) => file.endsWith(".sql"))
  .sort();

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: process.env.PGSSL_REJECT_UNAUTHORIZED !== "false" },
});

await client.connect();
try {
  await client.query(`
    CREATE TABLE IF NOT EXISTS app_migrations (
      filename text PRIMARY KEY,
      applied_at timestamp NOT NULL DEFAULT now()
    )
  `);

  for (const file of files) {
    const alreadyApplied = await client.query(
      "SELECT 1 FROM app_migrations WHERE filename = $1",
      [file],
    );
    if (alreadyApplied.rowCount) {
      console.log(`Skipping already applied migration: ${file}`);
      continue;
    }

    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
    await client.query("BEGIN");
    try {
      await client.query(sql);
      await client.query("INSERT INTO app_migrations (filename) VALUES ($1)", [file]);
      await client.query("COMMIT");
      console.log(`Applied migration: ${file}`);
    } catch (e) {
      await client.query("ROLLBACK");
      throw new Error(`${file}: ${e.message}`);
    }
  }
} catch (e) {
  console.error("Migration failed:", e.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
