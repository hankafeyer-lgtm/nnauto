#!/usr/bin/env node
/**
 * backup-db.mjs — повний локальний бекап бази Neon у папку backups/<дата>/
 *
 * Зберігає кожну таблицю як окремий JSON-файл.
 * Також зберігає combined.json з усіма таблицями разом.
 *
 * Запуск:
 *   node --env-file=.env scripts/backup-db.mjs
 *   — або —
 *   node --env-file=.env.local --env-file=.env scripts/backup-db.mjs
 */

import pg from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// ── 1. Підключення ─────────────────────────────────────────────────────────

const DB_URL =
  process.env.DATABASE_URL_POOLED ||
  process.env.PRODUCTION_DATABASE_URL ||
  process.env.DATABASE_URL;

if (!DB_URL) {
  console.error("❌  DATABASE_URL не знайдено. Перевір .env або .env.local");
  process.exit(1);
}

let host = "(unknown)";
try { host = new URL(DB_URL).hostname; } catch {}
console.log(`🔌  Підключення до: ${host}`);

const pool = new pg.Pool({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });

// ── 2. Папка для бекапу ────────────────────────────────────────────────────

const now = new Date();
const stamp = now.toISOString().replace(/[:.]/g, "-").slice(0, 19); // 2026-04-13T23-45-00
const backupDir = path.join(ROOT, "backups", stamp);
fs.mkdirSync(backupDir, { recursive: true });
console.log(`📁  Папка бекапу: ${backupDir}`);

// ── 3. Список таблиць ──────────────────────────────────────────────────────

const { rows: tableRows } = await pool.query(`
  SELECT tablename
  FROM pg_tables
  WHERE schemaname = 'public'
  ORDER BY tablename
`);

const tables = tableRows.map((r) => r.tablename);
console.log(`📋  Таблиці (${tables.length}): ${tables.join(", ")}\n`);

// ── 4. Дамп кожної таблиці ─────────────────────────────────────────────────

const combined = {};
const meta = { createdAt: now.toISOString(), host, tables: {} };

for (const table of tables) {
  try {
    const { rows, rowCount } = await pool.query(`SELECT * FROM "${table}"`);
    combined[table] = rows;
    meta.tables[table] = rowCount ?? rows.length;

    const filePath = path.join(backupDir, `${table}.json`);
    fs.writeFileSync(filePath, JSON.stringify(rows, null, 2), "utf-8");
    console.log(`  ✅  ${table.padEnd(30)} ${rows.length} рядків → ${table}.json`);
  } catch (err) {
    console.warn(`  ⚠️  ${table}: ${err.message}`);
    meta.tables[table] = "ERROR";
  }
}

// ── 5. combined.json + meta.json ──────────────────────────────────────────

fs.writeFileSync(
  path.join(backupDir, "combined.json"),
  JSON.stringify(combined, null, 2),
  "utf-8"
);
fs.writeFileSync(
  path.join(backupDir, "meta.json"),
  JSON.stringify(meta, null, 2),
  "utf-8"
);

await pool.end();

// ── 6. Підсумок ───────────────────────────────────────────────────────────

const totalRows = Object.values(meta.tables)
  .filter((n) => typeof n === "number")
  .reduce((a, b) => a + b, 0);

const backupSize = fs
  .readdirSync(backupDir)
  .reduce((sum, f) => sum + fs.statSync(path.join(backupDir, f)).size, 0);

console.log(`
╔══════════════════════════════════════════════╗
║  ✅  БЕКАП ЗАВЕРШЕНО                         ║
╠══════════════════════════════════════════════╣
║  Папка : backups/${stamp}  ║
║  Рядків: ${String(totalRows).padEnd(37)}║
║  Розмір: ${(backupSize / 1024 / 1024).toFixed(2).padEnd(37)}МБ ║
╚══════════════════════════════════════════════╝`);
console.log(`\n📦  Відновлення: node scripts/restore-db.mjs backups/${stamp}`);
