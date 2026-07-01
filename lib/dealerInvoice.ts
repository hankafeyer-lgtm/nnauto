import { db } from "@lib/db";
import {
  DEALER_PACKAGES,
  type DealerPackageId,
  isDealerPackageId,
} from "@lib/dealerPackages";
import { dealerInvoices, dealers, type DealerInvoice } from "@shared/schema";
import { and, desc, eq, sql } from "drizzle-orm";

export const NN_AUTO_SUPPLIER = {
  name: process.env.NN_AUTO_INVOICE_SUPPLIER_NAME || "NNAuto",
  ico: process.env.NN_AUTO_INVOICE_SUPPLIER_ICO || "23974559",
  dic: process.env.NN_AUTO_INVOICE_SUPPLIER_DIC || "",
  address: process.env.NN_AUTO_INVOICE_SUPPLIER_ADDRESS || "Česká republika",
  email: process.env.NN_AUTO_INVOICE_SUPPLIER_EMAIL || "info@nnauto.cz",
  web: process.env.NN_AUTO_INVOICE_SUPPLIER_WEB || "https://nnauto.cz",
} as const;

function formatKc(amount: number): string {
  return `${amount.toLocaleString("cs-CZ")} Kč`;
}

function formatDateCs(date: Date): string {
  return date.toLocaleDateString("cs-CZ");
}

function splitVat(totalKc: number, vatRate: number) {
  const base = Math.round((totalKc / (1 + vatRate / 100)) * 100) / 100;
  const vat = Math.round((totalKc - base) * 100) / 100;
  return { base, vat };
}

async function nextInvoiceNumber(issuedAt: Date): Promise<string> {
  const year = issuedAt.getFullYear();
  const prefix = `${year}-NN-`;
  const rows = await db
    .select({ number: dealerInvoices.number })
    .from(dealerInvoices)
    .where(sql`${dealerInvoices.number} LIKE ${`${prefix}%`}`)
    .orderBy(desc(dealerInvoices.number))
    .limit(1);

  const last = rows[0]?.number;
  const lastSeq = last ? Number.parseInt(last.slice(prefix.length), 10) : 0;
  const next = Number.isFinite(lastSeq) ? lastSeq + 1 : 1;
  return `${prefix}${String(next).padStart(4, "0")}`;
}

export function packageInvoiceDescription(packageId: DealerPackageId): string {
  const pkg = DEALER_PACKAGES[packageId];
  return `Roční balíček vozidel ${pkg.name} (${pkg.cars} vozidel)`;
}

export async function ensureDealerInvoiceForPackageCheckout(args: {
  dealerId: string;
  userId: string;
  packageId: DealerPackageId;
  subscriptionId?: string | null;
  stripeCheckoutSessionId?: string | null;
  stripeInvoiceId?: string | null;
  amountKc?: number;
  issuedAt?: Date;
}): Promise<DealerInvoice> {
  if (args.stripeCheckoutSessionId) {
    const [existing] = await db
      .select()
      .from(dealerInvoices)
      .where(eq(dealerInvoices.stripeCheckoutSessionId, args.stripeCheckoutSessionId));
    if (existing) return existing;
  }

  const [dealer] = await db
    .select()
    .from(dealers)
    .where(eq(dealers.id, args.dealerId));
  if (!dealer) throw new Error("Dealer not found");

  const issuedAt = args.issuedAt ?? new Date();
  const amountKc = args.amountKc ?? DEALER_PACKAGES[args.packageId].amountKc;
  const number = await nextInvoiceNumber(issuedAt);

  const [row] = await db
    .insert(dealerInvoices)
    .values({
      dealerId: args.dealerId,
      userId: args.userId,
      subscriptionId: args.subscriptionId ?? null,
      stripeCheckoutSessionId: args.stripeCheckoutSessionId ?? null,
      stripeInvoiceId: args.stripeInvoiceId ?? null,
      number,
      issuedAt,
      taxableSupplyAt: issuedAt,
      packageId: args.packageId,
      description: packageInvoiceDescription(args.packageId),
      amountKc,
      currency: "CZK",
      vatRate: 21,
      status: "paid",
      buyerCompanyName: dealer.companyName,
      buyerIco: dealer.ico ?? null,
      buyerDic: dealer.dic ?? null,
      buyerAddress: dealer.address ?? dealer.region ?? null,
      buyerEmail: dealer.email ?? null,
    })
    .returning();

  return row;
}

export async function listDealerInvoices(dealerId: string, userId: string) {
  return db
    .select()
    .from(dealerInvoices)
    .where(and(eq(dealerInvoices.dealerId, dealerId), eq(dealerInvoices.userId, userId)))
    .orderBy(desc(dealerInvoices.issuedAt));
}

export async function getDealerInvoiceForUser(
  invoiceId: string,
  dealerId: string,
  userId: string,
) {
  const [row] = await db
    .select()
    .from(dealerInvoices)
    .where(
      and(
        eq(dealerInvoices.id, invoiceId),
        eq(dealerInvoices.dealerId, dealerId),
        eq(dealerInvoices.userId, userId),
      ),
    );
  return row ?? null;
}

export function renderDealerInvoiceHtml(invoice: DealerInvoice): string {
  const issuedAt = new Date(invoice.issuedAt);
  const taxableAt = new Date(invoice.taxableSupplyAt);
  const { base, vat } = splitVat(invoice.amountKc, invoice.vatRate);
  const supplierDic = NN_AUTO_SUPPLIER.dic
    ? `<div>DIČ: ${NN_AUTO_SUPPLIER.dic}</div>`
    : "";

  return `<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="utf-8" />
  <title>Faktura ${invoice.number}</title>
  <style>
    body { font-family: Arial, sans-serif; color: #1f2937; margin: 40px; }
    h1 { font-size: 28px; margin: 0 0 8px; }
    .muted { color: #6b7280; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin: 28px 0; }
    .box { border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; }
    .box h2 { margin: 0 0 10px; font-size: 14px; text-transform: uppercase; letter-spacing: .04em; color: #92400e; }
    table { width: 100%; border-collapse: collapse; margin-top: 24px; }
    th, td { border: 1px solid #e5e7eb; padding: 10px 12px; text-align: left; }
    th { background: #fffbeb; }
    .totals { margin-top: 18px; width: 320px; margin-left: auto; }
    .totals div { display: flex; justify-content: space-between; padding: 6px 0; }
    .totals .grand { font-size: 18px; font-weight: 700; border-top: 2px solid #d97706; margin-top: 8px; padding-top: 10px; }
    .footer { margin-top: 36px; font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <h1>FAKTURA – DAŇOVÝ DOKLAD</h1>
  <div class="muted">Číslo faktury: <strong>${invoice.number}</strong></div>
  <div class="muted">Datum vystavení: ${formatDateCs(issuedAt)} · Datum zdanitelného plnění: ${formatDateCs(taxableAt)}</div>

  <div class="grid">
    <div class="box">
      <h2>Dodavatel</h2>
      <div><strong>${NN_AUTO_SUPPLIER.name}</strong></div>
      <div>${NN_AUTO_SUPPLIER.address}</div>
      <div>IČO: ${NN_AUTO_SUPPLIER.ico}</div>
      ${supplierDic}
      <div>${NN_AUTO_SUPPLIER.email}</div>
      <div>${NN_AUTO_SUPPLIER.web}</div>
    </div>
    <div class="box">
      <h2>Odběratel</h2>
      <div><strong>${invoice.buyerCompanyName}</strong></div>
      ${invoice.buyerAddress ? `<div>${invoice.buyerAddress}</div>` : ""}
      ${invoice.buyerIco ? `<div>IČO: ${invoice.buyerIco}</div>` : ""}
      ${invoice.buyerDic ? `<div>DIČ: ${invoice.buyerDic}</div>` : ""}
      ${invoice.buyerEmail ? `<div>${invoice.buyerEmail}</div>` : ""}
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Položka</th>
        <th>Množství</th>
        <th>Cena</th>
        <th>Celkem</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>${invoice.description}</td>
        <td>1</td>
        <td>${formatKc(invoice.amountKc)}</td>
        <td>${formatKc(invoice.amountKc)}</td>
      </tr>
    </tbody>
  </table>

  <div class="totals">
    <div><span>Základ daně</span><span>${formatKc(base)}</span></div>
    <div><span>DPH ${invoice.vatRate} %</span><span>${formatKc(vat)}</span></div>
    <div class="grand"><span>Celkem k úhradě</span><span>${formatKc(invoice.amountKc)}</span></div>
  </div>

  <div class="footer">
  Stav: ${invoice.status === "paid" ? "Zaplaceno" : invoice.status}. Faktura byla vystavena elektronicky prostřednictvím NNAuto.
  </div>
</body>
</html>`;
}

export function isDealerPackageIdSafe(value: unknown): value is DealerPackageId {
  return isDealerPackageId(value);
}
