#!/usr/bin/env node
/**
 * Cebia stats for last month:
 * - Created reports (checkout started)
 * - Paid reports
 * - Ready PDFs (generated)
 * - Archive events (purchases.jsonl)
 *
 * Note: "Direct transitions" (прямі переходи) are tracked in Google Analytics 4,
 * not in the database. Check GA4 → Acquisition → Traffic acquisition.
 *
 * Usage: node scripts/cebia-stats-last-month.mjs
 * Requires: DATABASE_URL (or .env with DATABASE_URL)
 */

import "dotenv/config";
import pg from "pg";
import fs from "fs";
import path from "path";

const { Client } = pg;

const connectionString =
  process.env.DATABASE_URL_POOLED ||
  process.env.PRODUCTION_DATABASE_URL ||
  process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL is missing. Set it in .env or pass as env var.");
  process.exit(1);
}

// Parse month from args: 3, march, 2026-03 → March 2026
const now = new Date();
const arg = process.argv[2]?.toLowerCase();

let monthStart, monthEnd, title;
if (arg === "3" || arg === "march" || arg === "березень" || arg === "03" || arg?.startsWith("2026-03")) {
  monthStart = new Date(now.getFullYear(), 2, 1); // March = month 2 (0-indexed)
  monthEnd = new Date(now.getFullYear(), 3, 0, 23, 59, 59, 999); // last day of March
  title = monthStart.toLocaleDateString("uk-UA", { month: "long", year: "numeric" });
} else if (arg) {
  // Try YYYY-MM format
  const m = arg.match(/^(\d{4})-(\d{1,2})$/);
  if (m) {
    const y = parseInt(m[1], 10);
    const mo = parseInt(m[2], 10) - 1;
    monthStart = new Date(y, mo, 1);
    monthEnd = new Date(y, mo + 1, 0, 23, 59, 59, 999);
    title = monthStart.toLocaleDateString("uk-UA", { month: "long", year: "numeric" });
  } else {
    monthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    monthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    title = monthStart.toLocaleDateString("uk-UA", { month: "long", year: "numeric" });
  }
} else {
  monthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  monthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
  title = monthStart.toLocaleDateString("uk-UA", { month: "long", year: "numeric" });
}

const lastMonthStart = monthStart;
const lastMonthEnd = monthEnd;
const monthName = title ?? monthStart.toLocaleDateString("uk-UA", { month: "long", year: "numeric" });
const formatDate = (d) => d.toISOString().slice(0, 10);

console.log("\n=== Cebia статистика ===\n");
console.log(`Період: ${formatDate(lastMonthStart)} — ${formatDate(lastMonthEnd)} (${monthName})\n`);

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: process.env.PGSSL_REJECT_UNAUTHORIZED !== "false" },
});

await client.connect();

try {
  // 1) Created reports (all checkout initiations)
  const createdRes = await client.query(
    `SELECT COUNT(*)::int AS cnt FROM cebia_reports
     WHERE created_at >= $1 AND created_at <= $2`,
    [lastMonthStart.toISOString(), lastMonthEnd.toISOString()]
  );
  const created = createdRes.rows[0]?.cnt ?? 0;

  // 2) Paid reports (have stripe_session_id and status paid or ready)
  const paidRes = await client.query(
    `SELECT COUNT(*)::int AS cnt FROM cebia_reports
     WHERE created_at >= $1 AND created_at <= $2
       AND stripe_session_id IS NOT NULL`,
    [lastMonthStart.toISOString(), lastMonthEnd.toISOString()]
  );
  const paid = paidRes.rows[0]?.cnt ?? 0;

  // 3) Ready PDFs (status = ready and pdf_base64 is not null)
  const readyRes = await client.query(
    `SELECT COUNT(*)::int AS cnt FROM cebia_reports
     WHERE created_at >= $1 AND created_at <= $2
       AND status = 'ready' AND pdf_base64 IS NOT NULL`,
    [lastMonthStart.toISOString(), lastMonthEnd.toISOString()]
  );
  const readyPdfs = readyRes.rows[0]?.cnt ?? 0;

  // 4) All reports with PDF (any status but has pdf_base64)
  const withPdfRes = await client.query(
    `SELECT COUNT(*)::int AS cnt FROM cebia_reports
     WHERE created_at >= $1 AND created_at <= $2
       AND pdf_base64 IS NOT NULL`,
    [lastMonthStart.toISOString(), lastMonthEnd.toISOString()]
  );
  const withPdf = withPdfRes.rows[0]?.cnt ?? 0;

  // 5) List of reports for audit
  const listRes = await client.query(
    `SELECT id, vin, status, stripe_session_id IS NOT NULL AS paid,
            pdf_base64 IS NOT NULL AS has_pdf, created_at
     FROM cebia_reports
     WHERE created_at >= $1 AND created_at <= $2
     ORDER BY created_at ASC`,
    [lastMonthStart.toISOString(), lastMonthEnd.toISOString()]
  );

  console.log("--- З БД (cebia_reports) ---");
  console.log(`Створено звітів (checkout):     ${created}`);
  console.log(`Оплачено (є stripe_session):  ${paid}`);
  console.log(`Готових PDF (status=ready):    ${readyPdfs}`);
  console.log(`З PDF (pdf_base64 є):          ${withPdf}`);
  console.log("");

  if (listRes.rows.length > 0) {
    console.log("--- Деталі ---");
    for (const r of listRes.rows) {
      const paidStr = r.paid ? "✓" : "-";
      const pdfStr = r.has_pdf ? "PDF ✓" : "-";
      const ts = r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at || "");
      console.log(`  ${ts.slice(0, 19)} | ${r.vin} | ${r.status} | paid:${paidStr} | ${pdfStr}`);
    }
    console.log("");
  }

  // 6) Archive (purchases.jsonl)
  const archiveDir =
    process.env.CEBIA_ARCHIVE_DIR || path.resolve(process.cwd(), "private", "cebia-archive");
  const archiveFile = path.join(archiveDir, "purchases.jsonl");

  let archivePaid = 0;
  let archiveReady = 0;

  if (fs.existsSync(archiveFile)) {
    const raw = fs.readFileSync(archiveFile, "utf8");
    const lines = raw.split("\n").filter((l) => l.trim());
    for (const line of lines) {
      try {
        const ev = JSON.parse(line);
        const ts = ev.ts ? new Date(ev.ts) : null;
        if (!ts || ts < lastMonthStart || ts > lastMonthEnd) continue;
        if (ev.stage === "paid") archivePaid++;
        if (ev.stage === "ready") archiveReady++;
      } catch {
        // skip invalid lines
      }
    }
    console.log("--- З архіву (purchases.jsonl) ---");
    console.log(`Події paid у періоді:  ${archivePaid}`);
    console.log(`Події ready у періоді: ${archiveReady}`);
    console.log("");
  } else {
    console.log("Архів purchases.jsonl не знайдено (private/cebia-archive/)\n");
  }

  console.log("--- Прямі переходи (direct) ---");
  console.log(
    "Прямі переходи не зберігаються в БД. Перевірте Google Analytics 4:\n" +
      "  GA4 → Acquisition → Traffic acquisition → Session default channel group = Direct\n" +
      "  або GA4 → Reports → Engagement → Events (для подій Cebia)\n"
  );
} finally {
  await client.end();
}
