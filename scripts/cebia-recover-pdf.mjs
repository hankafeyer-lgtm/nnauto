#!/usr/bin/env node
/**
 * Recover a paid Cebia report whose PDF was never generated.
 *
 * Drives the Cebia flow manually for a single cebia_reports row:
 *   1. mark status = 'paid' (store payment intent if provided)
 *   2. CreatePdfQueue(vin)  -> queueId
 *   3. poll GetPdfData(queueId) until queueStatus = 3 (ready)
 *   4. persist pdf_base64 + status = 'ready' in the DB
 *   5. write the decoded PDF to reports/<vin>-<reportId>.pdf
 *
 * Usage:
 *   node scripts/cebia-recover-pdf.mjs <reportId> [stripePaymentIntentId]
 *
 * Requires (.env): DATABASE_URL, CEBIA_CLIENT_ID, CEBIA_CLIENT_SECRET,
 *                  CEBIA_USERNAME, CEBIA_PASSWORD, (CEBIA_TOKEN_URL, CEBIA_API_BASE_URL optional)
 */

import "dotenv/config";
import pg from "pg";
import fs from "fs";
import path from "path";

const { Client } = pg;

const reportId = process.argv[2];
const paymentIntentId = process.argv[3] || null;
if (!reportId) {
  console.error("Usage: node scripts/cebia-recover-pdf.mjs <reportId> [stripePaymentIntentId]");
  process.exit(1);
}

const connectionString =
  process.env.DATABASE_URL_POOLED ||
  process.env.PRODUCTION_DATABASE_URL ||
  process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is missing.");
  process.exit(1);
}

const CEBIA_API_BASE_URL = (
  process.env.CEBIA_API_BASE_URL || "https://app.cebia.com/api/Autotracer"
).replace(/\/+$/, "");
const TOKEN_URL =
  process.env.CEBIA_TOKEN_URL || "https://www.cebianet.cz/pub/oauth/token";

function requiredEnv(name) {
  const v = process.env[name];
  if (!v?.trim()) throw new Error(`${name} is not configured`);
  return v.trim();
}

async function fetchToken() {
  const clientId = requiredEnv("CEBIA_CLIENT_ID");
  const clientSecret = requiredEnv("CEBIA_CLIENT_SECRET");
  const username = (process.env.CEBIA_USERNAME || "").trim();
  const password = (process.env.CEBIA_PASSWORD || "").trim();
  const grantType = username && password ? "password" : "client_credentials";
  const body =
    grantType === "password"
      ? new URLSearchParams({ grant_type: "password", username, password }).toString()
      : new URLSearchParams({ grant_type: "client_credentials" }).toString();
  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const resp = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${basic}`,
      Accept: "application/json",
    },
    body,
  });
  if (!resp.ok) throw new Error(`[CEBIA] Token request failed (${resp.status})`);
  const json = await resp.json();
  if (!json?.access_token) throw new Error("[CEBIA] No access_token in response");
  return json.access_token;
}

let token;
async function cebiaGet(pathSuffix) {
  if (!token) token = await fetchToken();
  const url = `${CEBIA_API_BASE_URL}${pathSuffix.startsWith("/") ? "" : "/"}${pathSuffix}`;
  for (let attempt = 0; attempt < 4; attempt++) {
    const resp = await fetch(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    if (resp.status === 401 && attempt === 0) {
      token = await fetchToken();
      continue;
    }
    if (resp.status === 429 || resp.status >= 500) {
      await new Promise((r) => setTimeout(r, 500 * 2 ** attempt));
      continue;
    }
    if (!resp.ok) throw new Error(`[CEBIA] ${resp.status} ${pathSuffix}`);
    return resp.json();
  }
  throw new Error(`[CEBIA] Retries exhausted: ${pathSuffix}`);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: process.env.PGSSL_REJECT_UNAUTHORIZED !== "false" },
});
await client.connect();

try {
  const { rows } = await client.query(
    `SELECT id, vin, status, cebia_queue_id, (pdf_base64 IS NOT NULL) AS has_pdf
     FROM cebia_reports WHERE id = $1`,
    [reportId],
  );
  const report = rows[0];
  if (!report) throw new Error(`Report ${reportId} not found`);
  console.log(`Report ${report.id} | VIN ${report.vin} | status ${report.status} | has_pdf ${report.has_pdf}`);

  if (report.has_pdf) {
    console.log("PDF already present in DB — just exporting it.");
  } else {
    // 1) mark paid
    await client.query(
      `UPDATE cebia_reports
       SET status = 'paid',
           stripe_payment_intent_id = COALESCE($2, stripe_payment_intent_id),
           updated_at = now()
       WHERE id = $1`,
      [report.id, paymentIntentId],
    );
    console.log("Marked as paid.");

    // 2) CreatePdfQueue (reuse existing queueId if present)
    let queueId = report.cebia_queue_id;
    if (!queueId) {
      const createResp = await cebiaGet(`/v1/CreatePdfQueue/${encodeURIComponent(report.vin)}`);
      console.log("CreatePdfQueue:", JSON.stringify(createResp));
      queueId = createResp?.queueId;
      if (!queueId || createResp?.queueStatus === 6) {
        throw new Error(`Cebia CreatePdfQueue failed: ${createResp?.message || "no queueId"}`);
      }
      await client.query(
        `UPDATE cebia_reports SET status='requested', cebia_queue_id=$2, cebia_queue_status=$3, updated_at=now() WHERE id=$1`,
        [report.id, queueId, createResp?.queueStatus ?? null],
      );
    }
    console.log("queueId:", queueId);

    // 3) poll until ready (status 3)
    let pdfData = null;
    for (let i = 0; i < 30; i++) {
      const pdfResp = await cebiaGet(`/v1/GetPdfData/${encodeURIComponent(queueId)}`);
      const qs = pdfResp?.queueStatus;
      console.log(`poll #${i + 1}: queueStatus=${qs}`);
      if (qs === 3 && pdfResp?.pdfData) {
        pdfData = pdfResp.pdfData;
        await client.query(
          `UPDATE cebia_reports
           SET status='ready', cebia_queue_status=$2, cebia_coupon_number=$3, cebia_report_url=$4, pdf_base64=$5, updated_at=now()
           WHERE id=$1`,
          [report.id, qs, pdfResp.couponNumber ?? null, pdfResp.reportUrl ?? null, pdfData],
        );
        console.log("PDF stored in DB, status=ready.");
        break;
      }
      if (qs === 6 || qs === 4) {
        await client.query(
          `UPDATE cebia_reports SET status='failed', cebia_queue_status=$2, updated_at=now() WHERE id=$1`,
          [report.id, qs],
        );
        throw new Error(`Cebia failed: queueStatus=${qs} ${pdfResp?.message || ""}`);
      }
      await sleep(4000);
    }
    if (!pdfData) throw new Error("Timed out waiting for Cebia PDF.");
  }

  // 5) export PDF file
  const { rows: r2 } = await client.query(`SELECT vin, pdf_base64 FROM cebia_reports WHERE id=$1`, [report.id]);
  const b64 = r2[0]?.pdf_base64;
  if (!b64) throw new Error("No pdf_base64 to export.");
  const outDir = path.resolve(process.cwd(), "reports");
  await fs.promises.mkdir(outDir, { recursive: true });
  const filepath = path.join(outDir, `cebia-${r2[0].vin}-${report.id}.pdf`);
  await fs.promises.writeFile(filepath, Buffer.from(b64, "base64"));
  console.log(`\nPDF saved: ${filepath}`);
} finally {
  await client.end();
}
