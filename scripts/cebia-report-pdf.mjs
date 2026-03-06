#!/usr/bin/env node
/**
 * Cebia report in PDF format.
 * Supports: English (en), Czech (cs), Czech without diacritics (cs-plain).
 *
 * Usage: node scripts/cebia-report-pdf.mjs [month] [lang]
 *   month: 2, february, 2026-02, or omit for last month
 *   lang: en, cs, cs-plain (default: cs)
 * Output: reports/cebia-report-YYYY-MM[-lang].pdf
 */

import "dotenv/config";
import pg from "pg";
import fs from "fs";
import path from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const PDFDocument = require("pdfkit");

const { Client } = pg;

const connectionString =
  process.env.DATABASE_URL_POOLED ||
  process.env.PRODUCTION_DATABASE_URL ||
  process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL is missing. Set it in .env or pass as env var.");
  process.exit(1);
}

// Parse month from args
const now = new Date();
const arg1 = process.argv[2]?.toLowerCase();
const arg2 = process.argv[3]?.toLowerCase();
const lang = arg2 === "en" || arg2 === "cs-plain" ? arg2 : "cs";

let monthStart, monthEnd, monthName;
const monthNamesEn = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const monthNamesCs = ["leden", "unor", "brezen", "duben", "kveten", "cerven", "cervenec", "srpen", "zari", "rijen", "listopad", "prosinec"];
const monthNamesCsPlain = ["leden", "unor", "brezen", "duben", "kveten", "cerven", "cervenec", "srpen", "zari", "rijen", "listopad", "prosinec"];

if (arg1 === "2" || arg1 === "february" || arg1 === "unor" || arg1 === "02" || arg1?.startsWith("2026-02")) {
  monthStart = new Date(now.getFullYear(), 1, 1);
  monthEnd = new Date(now.getFullYear(), 2, 0, 23, 59, 59, 999);
  monthName = lang === "en" ? "February" : "unor";
} else if (arg1 === "3" || arg1 === "march" || arg1 === "brezen" || arg1 === "03" || arg1?.startsWith("2026-03")) {
  monthStart = new Date(now.getFullYear(), 2, 1);
  monthEnd = new Date(now.getFullYear(), 3, 0, 23, 59, 59, 999);
  monthName = lang === "en" ? "March" : "brezen";
} else if (arg1) {
  const m = arg1.match(/^(\d{4})-(\d{1,2})$/);
  if (m) {
    const y = parseInt(m[1], 10);
    const mo = parseInt(m[2], 10) - 1;
    monthStart = new Date(y, mo, 1);
    monthEnd = new Date(y, mo + 1, 0, 23, 59, 59, 999);
    monthName = lang === "en" ? monthNamesEn[mo] : monthNamesCsPlain[mo];
  } else {
    monthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    monthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    const mo = monthStart.getMonth();
    monthName = lang === "en" ? monthNamesEn[mo] : monthNamesCsPlain[mo];
  }
} else {
  monthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  monthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
  const mo = monthStart.getMonth();
  monthName = lang === "en" ? monthNamesEn[mo] : monthNamesCsPlain[mo];
}

const formatDate = (d) => d.toISOString().slice(0, 10);
const periodStr = `${formatDate(monthStart)} - ${formatDate(monthEnd)}`;
const titleStr = `${monthName} ${monthStart.getFullYear()}`;

// Texts by language
const T = {
  en: {
    title: "Cebia Autotracer Report",
    subtitle: "NNAuto - VIN check and PDF reports",
    period: "Period",
    summary: "Summary",
    paidReceived: "Actually paid and received PDF",
    abandoned: "Reached payment and went back (did not pay)",
    totalCheckouts: "Total checkout initiations",
    detail: "Detailed overview",
    date: "Date",
    status: "Status",
    paid: "Paid",
    pdf: "PDF",
    yes: "Yes",
    no: "No",
    billingNote: "Note for Cebia billing",
    billingText: (cebiaRequests, abandoned) =>
      `Only ${cebiaRequests} requests were sent to Cebia API (CreatePdfQueue). ` +
      `These requests are sent exclusively after successful payment via Stripe. ` +
      `For ${abandoned} records the user started checkout but did not complete payment - nothing was sent to Cebia. ` +
      `Cebia should therefore be invoiced only for ${cebiaRequests} requests.`,
    generated: "Report generated",
    nnauto: "NNAuto - nnauto.cz",
  },
  cs: {
    title: "Zprava Cebia Autotracer",
    subtitle: "NNAuto - kontrola VIN a PDF reporty",
    period: "Obdobi",
    summary: "Shrnutí",
    paidReceived: "Skutecne zaplatili a obdrzeli PDF",
    abandoned: "Dosli k platbe a vratili se zpet (nezaplatili)",
    totalCheckouts: "Celkem zahajenych checkoutu",
    detail: "Detailni prehled",
    date: "Datum",
    status: "Stav",
    paid: "Zaplaceno",
    pdf: "PDF",
    yes: "Ano",
    no: "Ne",
    billingNote: "Vysvetleni pro fakturaci Cebia",
    billingText: (cebiaRequests, abandoned) =>
      `Na Cebia API bylo odeslano pouze ${cebiaRequests} pozadavku (CreatePdfQueue). ` +
      `Tyto pozadavky jsou odesilany vyhradne po uspesne platbe pres Stripe. ` +
      `U ${abandoned} zaznamu uzivatel zahajil checkout, ale platbu nedokoncil - na Cebia nebylo nic odeslano. ` +
      `Fakturovat Cebia je tedy treba pouze za ${cebiaRequests} pozadavku.`,
    generated: "Report vygenerovan",
    nnauto: "NNAuto - nnauto.cz",
  },
};

const t = T[lang === "cs-plain" ? "cs" : lang];

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: process.env.PGSSL_REJECT_UNAUTHORIZED !== "false" },
});

await client.connect();

let created = 0, paid = 0, withPdf = 0, cebiaRequests = 0, rows = [];

try {
  const [createdRes, paidRes, withPdfRes, cebiaRes, listRes] = await Promise.all([
    client.query(
      `SELECT COUNT(*)::int AS cnt FROM cebia_reports
       WHERE created_at >= $1 AND created_at <= $2`,
      [monthStart.toISOString(), monthEnd.toISOString()]
    ),
    client.query(
      `SELECT COUNT(*)::int AS cnt FROM cebia_reports
       WHERE created_at >= $1 AND created_at <= $2 AND stripe_session_id IS NOT NULL`,
      [monthStart.toISOString(), monthEnd.toISOString()]
    ),
    client.query(
      `SELECT COUNT(*)::int AS cnt FROM cebia_reports
       WHERE created_at >= $1 AND created_at <= $2 AND pdf_base64 IS NOT NULL`,
      [monthStart.toISOString(), monthEnd.toISOString()]
    ),
    client.query(
      `SELECT COUNT(*)::int AS cnt FROM cebia_reports
       WHERE created_at >= $1 AND created_at <= $2 AND cebia_queue_id IS NOT NULL`,
      [monthStart.toISOString(), monthEnd.toISOString()]
    ),
    client.query(
      `SELECT id, vin, status, stripe_session_id IS NOT NULL AS paid,
              pdf_base64 IS NOT NULL AS has_pdf, created_at
       FROM cebia_reports
       WHERE created_at >= $1 AND created_at <= $2
       ORDER BY created_at ASC`,
      [monthStart.toISOString(), monthEnd.toISOString()]
    ),
  ]);

  created = createdRes.rows[0]?.cnt ?? 0;
  paid = paidRes.rows[0]?.cnt ?? 0;
  withPdf = withPdfRes.rows[0]?.cnt ?? 0;
  cebiaRequests = cebiaRes.rows[0]?.cnt ?? 0;
  rows = listRes.rows || [];
} finally {
  await client.end();
}

const abandoned = created - paid;

// Ensure output directory
const outDir = path.resolve(process.cwd(), "reports");
await fs.promises.mkdir(outDir, { recursive: true });

const langSuffix = lang === "en" ? "-en" : lang === "cs-plain" ? "-cs-plain" : "";
const filename = `cebia-report-${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, "0")}${langSuffix}.pdf`;
const filepath = path.join(outDir, filename);

const doc = new PDFDocument({ margin: 50, size: "A4" });
const writeStream = fs.createWriteStream(filepath);
doc.pipe(writeStream);

const h1 = 22, h2 = 14, body = 11, small = 9;
const col1 = 50, col2 = 140, col3 = 260, col4 = 360, col5 = 420;

const rowY = () => doc.y;
const writeRow = (a, b, c, d, e, bold = false) => {
  doc.font(bold ? "Helvetica-Bold" : "Helvetica");
  const y = rowY();
  doc.text(String(a), col1, y);
  doc.text(String(b), col2, y);
  doc.text(String(c), col3, y);
  doc.text(String(d), col4, y);
  doc.text(String(e), col5, y);
  doc.y = y + 14;
};

// Header
doc.fontSize(h1).font("Helvetica-Bold").text(t.title, { align: "center" });
doc.moveDown(0.5);
doc.fontSize(body).font("Helvetica").text(t.subtitle, { align: "center" });
doc.moveDown(1);
doc.fontSize(body).text(`${t.period}: ${periodStr} (${titleStr})`, { align: "center" });
doc.moveDown(2);

// Summary
doc.fontSize(h2).font("Helvetica-Bold").text(t.summary);
doc.moveDown(0.5);
doc.fontSize(body).font("Helvetica");
doc.text(`• ${t.paidReceived}: ${withPdf}`, { continued: false });
doc.text(`• ${t.abandoned}: ${abandoned}`, { continued: false });
doc.text(`• ${t.totalCheckouts}: ${created}`, { continued: false });
doc.moveDown(1);

// Table
doc.fontSize(h2).font("Helvetica-Bold").text(t.detail);
doc.moveDown(0.5);
doc.fontSize(small);
writeRow(t.date, "VIN", t.status, t.paid, t.pdf, true);
doc.moveDown(0.2);
doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
doc.moveDown(0.3);

for (const r of rows) {
  const ts = r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at || "");
  const dateStr = ts.slice(0, 16).replace("T", " ");
  writeRow(dateStr, r.vin || "-", r.status || "-", r.paid ? t.yes : t.no, r.has_pdf ? t.yes : t.no);
  if (doc.y > 750) {
    doc.addPage();
    doc.y = 50;
  }
}

doc.moveDown(2);
doc.fontSize(h2).font("Helvetica-Bold").text(t.billingNote);
doc.moveDown(0.5);
doc.fontSize(body).font("Helvetica");
doc.text(t.billingText(cebiaRequests, abandoned), { align: "left", width: 500 });

doc.moveDown(2);
doc.fontSize(small).font("Helvetica").fillColor("#666");
doc.text(`${t.generated}: ${new Date().toISOString().slice(0, 19).replace("T", " ")}`, { align: "right" });
doc.text(t.nnauto, { align: "right" });

doc.end();

await new Promise((resolve, reject) => {
  writeStream.on("finish", resolve);
  writeStream.on("error", reject);
});

console.log(`\nPDF report saved: ${filepath}\n`);
