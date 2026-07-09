import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

const ROOT = resolve(process.cwd());
const OUT_DIR = join(ROOT, "public", "dealer-invoice-preview");

const { renderDealerInvoiceDocument } = await import("../lib/dealerInvoiceTemplate.ts");

const sampleInvoice = {
  id: "preview",
  dealerId: "preview",
  userId: "preview",
  subscriptionId: null,
  stripeCheckoutSessionId: null,
  stripeInvoiceId: null,
  number: "2026-NN-TEST-000123",
  issuedAt: new Date("2026-07-02"),
  taxableSupplyAt: new Date("2026-07-02"),
  paidAt: new Date("2026-07-02"),
  paymentMethod: "Online platba kartou",
  packageId: "business",
  description: "[TEST] Roční balíček vozidel BUSINESS NNAuto (350 vozidel)",
  amountKc: 4500,
  currency: "CZK",
  vatRate: 0,
  status: "paid",
  buyerCompanyName: "Zlaté Auto s.r.o.",
  buyerIco: "12345678",
  buyerDic: "CZ12345678",
  buyerAddress: "Václavské náměstí 1, 110 00 Praha 1",
  buyerEmail: "fakturace@zlateauto.cz",
  createdAt: new Date("2026-07-02"),
};

const realInvoice = {
  ...sampleInvoice,
  number: "2026-NN-000123",
  description: "Roční balíček vozidel BUSINESS NNAuto (350 vozidel)",
};

await mkdir(OUT_DIR, { recursive: true });

const files = [
  ["faktura-test.html", sampleInvoice, true],
  ["faktura-real.html", realInvoice, true],
  ["faktura-print.html", realInvoice, false],
];

for (const [file, invoice, showToolbar] of files) {
  const html = renderDealerInvoiceDocument(invoice, { showToolbar });
  await writeFile(join(OUT_DIR, file), html, "utf8");
}

const indexHtml = `<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="utf-8" />
  <title>Náhled faktur NNAuto</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; color: #1f2937; }
    a { color: #b45309; font-size: 18px; display: block; margin: 12px 0; }
  </style>
</head>
<body>
  <h1>Náhled faktur (lokální preview)</h1>
  <a href="faktura-real.html">Skutečná faktura po platbě</a>
  <a href="faktura-test.html">Testovací faktura pro admina</a>
  <a href="faktura-print.html">Verze bez toolbaru (embed)</a>
</body>
</html>`;

await writeFile(join(OUT_DIR, "index.html"), indexHtml, "utf8");

console.log("Preview files written to", OUT_DIR);
