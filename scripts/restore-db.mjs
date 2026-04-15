#!/usr/bin/env node
/**
 * restore-db.mjs — відновлення бази з локального бекапу (папки backups/<дата>/)
 *
 * УВАГА: використовує INSERT ... ON CONFLICT DO NOTHING — існуючі записи НЕ перезаписуються.
 * DROP / TRUNCATE / DELETE — не виконуються.
 *
 * Запуск:
 *   node --env-file=.env scripts/restore-db.mjs backups/2026-04-13T23-45-00
 *
 * Або відновлення лише однієї таблиці:
 *   node --env-file=.env scripts/restore-db.mjs backups/2026-04-13T23-45-00 listings
 */

import pg from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// ── Аргументи ──────────────────────────────────────────────────────────────

const [backupArg, onlyTable] = process.argv.slice(2);
if (!backupArg) {
  console.error("❌  Вкажи папку бекапу: node scripts/restore-db.mjs backups/2026-04-13T23-45-00");
  process.exit(1);
}

const backupDir = path.isAbsolute(backupArg) ? backupArg : path.join(ROOT, backupArg);
if (!fs.existsSync(backupDir)) {
  console.error(`❌  Папка не існує: ${backupDir}`);
  process.exit(1);
}

// ── Підключення ────────────────────────────────────────────────────────────

const DB_URL =
  process.env.DATABASE_URL_POOLED ||
  process.env.PRODUCTION_DATABASE_URL ||
  process.env.DATABASE_URL;

if (!DB_URL) {
  console.error("❌  DATABASE_URL не знайдено.");
  process.exit(1);
}

let host = "(unknown)";
try { host = new URL(DB_URL).hostname; } catch {}
console.log(`🔌  Цільова база: ${host}`);
console.log(`📁  Папка бекапу: ${backupDir}\n`);

const pool = new pg.Pool({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });

// ── meta.json ──────────────────────────────────────────────────────────────

const metaPath = path.join(backupDir, "meta.json");
const meta = fs.existsSync(metaPath) ? JSON.parse(fs.readFileSync(metaPath, "utf-8")) : null;
if (meta) console.log(`ℹ️   Бекап створено: ${meta.createdAt} (з ${meta.host})\n`);

// ── Порядок відновлення (спочатку батьківські таблиці) ─────────────────────

const RESTORE_ORDER = [
  "users",
  "dealers",
  "brands",
  "models",
  "model_generations",
  "listings",
  "deleted_listings",
  "payments",
  "cebia_reports",
  "listing_analytics_events",
  "bulk_import_jobs",
  "sessions",
  "session",
];

// Додаємо всі файли, яких немає у RESTORE_ORDER
const allFiles = fs
  .readdirSync(backupDir)
  .filter((f) => f.endsWith(".json") && !["meta.json", "combined.json"].includes(f))
  .map((f) => f.replace(".json", ""));

const tablesToRestore = [
  ...RESTORE_ORDER.filter((t) => allFiles.includes(t)),
  ...allFiles.filter((t) => !RESTORE_ORDER.includes(t)),
].filter((t) => !onlyTable || t === onlyTable);

if (tablesToRestore.length === 0) {
  console.error(`❌  Таблиця "${onlyTable}" не знайдена в бекапі.`);
  process.exit(1);
}

// ── Відновлення ────────────────────────────────────────────────────────────

let totalInserted = 0;

for (const table of tablesToRestore) {
  const filePath = path.join(backupDir, `${table}.json`);
  if (!fs.existsSync(filePath)) {
    console.warn(`  ⚠️  Файл не знайдено: ${table}.json — пропускаємо`);
    continue;
  }

  const rows = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  if (!rows.length) {
    console.log(`  ⏭️  ${table.padEnd(30)} 0 рядків — пропускаємо`);
    continue;
  }

  // Отримуємо колонки з першого рядка
  const cols = Object.keys(rows[0]);
  const colsSql = cols.map((c) => `"${c}"`).join(", ");
  const placeholders = cols.map((_, i) => `$${i + 1}`).join(", ");

  const client = await pool.connect();
  let inserted = 0;
  let skipped = 0;

  try {
    await client.query("BEGIN");
    for (const row of rows) {
      const values = cols.map((c) => row[c]);
      const result = await client.query(
        `INSERT INTO "${table}" (${colsSql}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`,
        values
      );
      if (result.rowCount > 0) inserted++;
      else skipped++;
    }
    await client.query("COMMIT");
    totalInserted += inserted;
    console.log(`  ✅  ${table.padEnd(30)} вставлено: ${inserted}, пропущено: ${skipped}`);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(`  ❌  ${table}: ${err.message}`);
  } finally {
    client.release();
  }
}

await pool.end();

console.log(`\n✅  Відновлення завершено. Вставлено рядків: ${totalInserted}`);
