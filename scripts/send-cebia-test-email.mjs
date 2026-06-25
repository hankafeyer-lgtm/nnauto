#!/usr/bin/env node
/**
 * One-off test: e-mail an already-generated Cebia PDF (from the DB) as an
 * attachment to a recipient, to verify e-mail delivery works.
 *
 * Does NOT call Cebia and does NOT generate anything — it only reads the
 * stored pdf_base64 and sends it.
 *
 * Usage: node scripts/send-cebia-test-email.mjs <reportId> [toEmail]
 */

import "dotenv/config";
import pg from "pg";
import { MailerSend, EmailParams, Sender, Recipient, Attachment } from "mailersend";

const { Client } = pg;

const reportId = process.argv[2];
const toEmail = process.argv[3] || "info@nnauto.cz";
if (!reportId) {
  console.error("Usage: node scripts/send-cebia-test-email.mjs <reportId> [toEmail]");
  process.exit(1);
}

const apiKey = (process.env.MAILERSEND_API_KEY || "").trim();
if (!apiKey) {
  console.error("MAILERSEND_API_KEY is missing.");
  process.exit(1);
}

const connectionString =
  process.env.DATABASE_URL_POOLED ||
  process.env.PRODUCTION_DATABASE_URL ||
  process.env.DATABASE_URL;

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: process.env.PGSSL_REJECT_UNAUTHORIZED !== "false" },
});
await client.connect();

let vin = "";
let pdfBase64 = "";
try {
  const r = await client.query(
    "SELECT vin, pdf_base64 FROM cebia_reports WHERE id = $1",
    [reportId],
  );
  if (!r.rows[0]) throw new Error(`Report ${reportId} not found`);
  if (!r.rows[0].pdf_base64) throw new Error("Report has no PDF stored");
  vin = r.rows[0].vin;
  pdfBase64 = r.rows[0].pdf_base64;
} finally {
  await client.end();
}

const mailerSend = new MailerSend({ apiKey });
const senderEmail = (process.env.MAILERSEND_FROM_EMAIL || "info@nnauto.cz").trim();
const sentFrom = new Sender(senderEmail, "NNAuto");
const recipients = [new Recipient(toEmail, toEmail)];

const attachment = new Attachment(pdfBase64, `cebia-${vin}.pdf`, "attachment");

const emailParams = new EmailParams()
  .setFrom(sentFrom)
  .setTo(recipients)
  .setReplyTo(sentFrom)
  .setSubject(`TEST – Cebia report ${vin}`)
  .setHtml(
    `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #B8860B;">TEST – Cebia report</h2>
      <p>Toto je testovací e-mail pro ověření doručování Cebia reportů.</p>
      <p>VIN: <strong>${vin}</strong></p>
      <p>PDF report je přiložen k tomuto e-mailu.</p>
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
      <p style="color: #666; font-size: 12px;">NNAuto – nnauto.cz</p>
    </div>`,
  )
  .setText(`TEST – Cebia report\n\nVIN: ${vin}\nPDF je přiložen k tomuto e-mailu.\n\nNNAuto`)
  .setAttachments([attachment]);

try {
  await mailerSend.email.send(emailParams);
  console.log(`Test e-mail with PDF (VIN ${vin}) sent to ${toEmail}.`);
} catch (e) {
  console.error("Send failed:", {
    statusCode: e?.statusCode,
    message: e?.message,
    body: e?.body,
  });
  process.exit(1);
}
