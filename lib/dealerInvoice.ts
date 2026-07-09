import { createRequire } from "node:module";
import { db } from "@lib/db";
import {
  DEALER_PACKAGES,
  type DealerPackageId,
  isDealerPackageId,
} from "@lib/dealerPackages";
import {
  DEFAULT_INVOICE_PAYMENT_METHOD,
  INVOICE_VAT_DISCLAIMER,
  NN_AUTO_BRAND,
  NN_AUTO_INVOICE_SUPPLIER,
  dealerInvoicePublicPath,
  formatInvoiceDateCs,
  formatInvoiceKc,
  formatInvoiceWeb,
  renderDealerInvoiceDocument,
} from "@lib/dealerInvoiceTemplate";
import { dealerInvoices, dealers, type DealerInvoice } from "@shared/schema";
import { and, desc, eq, sql } from "drizzle-orm";

export {
  NN_AUTO_INVOICE_SUPPLIER as NN_AUTO_SUPPLIER,
  dealerInvoicePublicPath,
  formatInvoiceKc,
  renderDealerInvoiceDocument,
} from "@lib/dealerInvoiceTemplate";

const require = createRequire(import.meta.url);
const PDFDocument = require("pdfkit") as typeof import("pdfkit");

const INVOICE_NUMBER_WIDTH = 6;

async function nextInvoiceNumber(issuedAt: Date): Promise<string> {
  const year = issuedAt.getFullYear();
  const prefix = `${year}-NN-`;
  const rows = await db
    .select({ number: dealerInvoices.number })
    .from(dealerInvoices)
    .where(
      sql`${dealerInvoices.number} LIKE ${`${prefix}%`} AND ${dealerInvoices.number} NOT LIKE ${`${prefix}TEST-%`}`,
    )
    .orderBy(desc(dealerInvoices.number))
    .limit(1);

  const last = rows[0]?.number;
  const lastSeq = last ? Number.parseInt(last.slice(prefix.length), 10) : 0;
  const next = Number.isFinite(lastSeq) ? lastSeq + 1 : 1;
  return `${prefix}${String(next).padStart(INVOICE_NUMBER_WIDTH, "0")}`;
}

async function nextTestInvoiceNumber(issuedAt: Date): Promise<string> {
  const year = issuedAt.getFullYear();
  const prefix = `${year}-NN-TEST-`;
  const rows = await db
    .select({ number: dealerInvoices.number })
    .from(dealerInvoices)
    .where(sql`${dealerInvoices.number} LIKE ${`${prefix}%`}`)
    .orderBy(desc(dealerInvoices.number))
    .limit(1);

  const last = rows[0]?.number;
  const lastSeq = last ? Number.parseInt(last.slice(prefix.length), 10) : 0;
  const next = Number.isFinite(lastSeq) ? lastSeq + 1 : 1;
  return `${prefix}${String(next).padStart(INVOICE_NUMBER_WIDTH, "0")}`;
}

export function packageInvoiceDescription(packageId: DealerPackageId): string {
  const pkg = DEALER_PACKAGES[packageId];
  return `Roční balíček vozidel ${pkg.name} (${pkg.cars} vozidel)`;
}

function buyerSnapshotFromDealer(dealer: typeof dealers.$inferSelect) {
  return {
    buyerCompanyName: dealer.companyName,
    buyerIco: dealer.ico ?? null,
    buyerDic: dealer.dic ?? null,
    buyerAddress: dealer.address ?? dealer.region ?? null,
    buyerEmail: dealer.email ?? null,
  };
}

function baseInvoiceValues(args: {
  dealerId: string;
  userId: string;
  packageId: DealerPackageId;
  number: string;
  issuedAt: Date;
  description: string;
  amountKc: number;
  dealer: typeof dealers.$inferSelect;
  subscriptionId?: string | null;
  stripeCheckoutSessionId?: string | null;
  stripeInvoiceId?: string | null;
}) {
  const buyer = buyerSnapshotFromDealer(args.dealer);
  return {
    dealerId: args.dealerId,
    userId: args.userId,
    subscriptionId: args.subscriptionId ?? null,
    stripeCheckoutSessionId: args.stripeCheckoutSessionId ?? null,
    stripeInvoiceId: args.stripeInvoiceId ?? null,
    number: args.number,
    issuedAt: args.issuedAt,
    taxableSupplyAt: args.issuedAt,
    paidAt: args.issuedAt,
    paymentMethod: DEFAULT_INVOICE_PAYMENT_METHOD,
    packageId: args.packageId,
    description: args.description,
    amountKc: args.amountKc,
    currency: "CZK" as const,
    vatRate: 0,
    status: "paid" as const,
    ...buyer,
  };
}

export async function renderDealerInvoicePdf(invoice: DealerInvoice): Promise<Buffer> {
  const supplier = NN_AUTO_INVOICE_SUPPLIER;
  const supplierWeb = formatInvoiceWeb(supplier.web);
  const paidAt = invoice.paidAt ? new Date(invoice.paidAt) : new Date(invoice.issuedAt);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 42, size: "A4" });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const left = doc.page.margins.left;
    const right = doc.page.width - doc.page.margins.right;
    const width = right - left;

    const titleX = right - 220;

    doc.fillColor("#1a1a1a").fontSize(28).text("NN", left, 42, { continued: true });
    doc.fillColor(NN_AUTO_BRAND).text("Auto");

    doc.fillColor("#6b7280").fontSize(9).text("FAKTURA – DAŇOVÝ DOKLAD", titleX, 42, {
      width: 220,
      align: "right",
    });
    doc.fontSize(8).text("Číslo faktury", titleX, 58, { width: 220, align: "right" });
    doc.fillColor("#1a1a1a").fontSize(22).text(invoice.number, titleX, 70, {
      width: 220,
      align: "right",
    });

    let y = 108;
    const meta = [
      ["Datum vystavení", formatInvoiceDateCs(invoice.issuedAt)],
      ["Datum zdanitelného plnění", formatInvoiceDateCs(invoice.taxableSupplyAt)],
      ["Datum úhrady", formatInvoiceDateCs(paidAt)],
      ["Způsob úhrady", invoice.paymentMethod || DEFAULT_INVOICE_PAYMENT_METHOD],
      ["Stav", "Zaplaceno"],
    ];
    doc.fontSize(9).fillColor("#6b7280");
    for (const [label, value] of meta) {
      doc.fillColor("#6b7280").text(label, left, y, { width: 170 });
      doc.fillColor("#1a1a1a").font("Helvetica-Bold").text(value, left + 180, y, { width: width - 180 });
      doc.font("Helvetica");
      y += 16;
    }

    y += 12;
    doc.moveTo(left, y).lineTo(right, y).strokeColor("#e8e4e0").stroke();
    y += 18;

    const boxWidth = (width - 14) / 2;
    const boxHeight = 132;
    const drawParty = (
      x: number,
      title: string,
      lines: string[],
    ) => {
      doc.roundedRect(x, y, boxWidth, boxHeight, 8).fillAndStroke("#faf8f6", "#e8e4e0");
      doc.fillColor(NN_AUTO_BRAND).fontSize(8).text(title, x + 14, y + 12);
      let py = y + 28;
      lines.forEach((line, index) => {
        doc
          .fillColor(index === 0 ? "#1a1a1a" : "#4b5563")
          .fontSize(index === 0 ? 11 : 9)
          .font(index === 0 ? "Helvetica-Bold" : "Helvetica")
          .text(line, x + 14, py, { width: boxWidth - 28 });
        py += index === 0 ? 16 : 13;
      });
      doc.font("Helvetica");
    };

    drawParty(left, "DODAVATEL", [
      supplier.name,
      supplier.street,
      supplier.city,
      supplier.country,
      `IČO: ${supplier.ico}`,
      supplier.vatStatus,
      supplier.email,
      supplierWeb,
    ]);

    const buyerLines = [
      invoice.buyerCompanyName,
      invoice.buyerAddress ?? "",
      "Česká republika",
      invoice.buyerIco ? `IČO: ${invoice.buyerIco}` : "",
      invoice.buyerDic ? `DIČ: ${invoice.buyerDic}` : "",
      invoice.buyerEmail ? `Fakturační email: ${invoice.buyerEmail}` : "",
    ].filter(Boolean);

    drawParty(left + boxWidth + 14, "ODBĚRATEL", buyerLines);

    y += boxHeight + 24;
    const headerHeight = 24;
    doc.rect(left, y, width, headerHeight).fill(NN_AUTO_BRAND);
    doc.fillColor("#ffffff").fontSize(8);
    doc.text("POLOŽKA", left + 10, y + 8);
    doc.text("MNOŽSTVÍ", left + width * 0.58, y + 8, { width: 50, align: "right" });
    doc.text("CENA", left + width * 0.72, y + 8, { width: 60, align: "right" });
    doc.text("CELKEM", left + width * 0.86, y + 8, { width: 60, align: "right" });

    y += headerHeight;
    doc.fillColor("#1a1a1a").fontSize(9);
    doc.text(invoice.description, left + 10, y + 12, { width: width * 0.52 });
    doc.text("1", left + width * 0.58, y + 12, { width: 50, align: "right" });
    doc.text(formatInvoiceKc(invoice.amountKc), left + width * 0.72, y + 12, {
      width: 60,
      align: "right",
    });
    doc.text(formatInvoiceKc(invoice.amountKc), left + width * 0.86, y + 12, {
      width: 60,
      align: "right",
    });
    doc.moveTo(left, y + 34).lineTo(right, y + 34).strokeColor("#e8e4e0").stroke();

    const totalsY = y + 54;
    const totalsX = left + width * 0.55;
    doc.fillColor("#6b7280").fontSize(9).text("Celkem k úhradě", totalsX, totalsY, {
      width: 180,
      align: "right",
    });
    doc.fillColor("#1a1a1a").font("Helvetica-Bold").fontSize(20).text(
      formatInvoiceKc(invoice.amountKc),
      totalsX,
      totalsY + 14,
      { width: 180, align: "right" },
    );
    doc.font("Helvetica").fillColor("#6b7280").fontSize(8).text(INVOICE_VAT_DISCLAIMER, totalsX, totalsY + 42, {
      width: 180,
      align: "right",
    });

    const footerY = totalsY + 78;
    doc.moveTo(left, footerY).lineTo(right, footerY).strokeColor("#e8e4e0").stroke();
    doc.fillColor("#6b7280").fontSize(8).text(
      "Faktura byla vystavena elektronicky prostřednictvím NNAuto.",
      left,
      footerY + 12,
      { width: width * 0.55 },
    );
    doc.fillColor("#1a1a1a").font("Helvetica-Bold").text("NNAuto", left + width * 0.58, footerY + 12, {
      width: width * 0.42,
      align: "right",
    });
    doc.font("Helvetica").fillColor("#4b5563").fontSize(8);
    doc.text(supplier.street, left + width * 0.58, footerY + 24, { width: width * 0.42, align: "right" });
    doc.text(supplier.city, left + width * 0.58, footerY + 36, { width: width * 0.42, align: "right" });
    doc.fillColor(NN_AUTO_BRAND).text(supplier.email, left + width * 0.58, footerY + 48, {
      width: width * 0.42,
      align: "right",
    });
    doc.text(supplierWeb, left + width * 0.58, footerY + 60, { width: width * 0.42, align: "right" });

    doc.end();
  });
}

async function persistDealerInvoiceArtifacts(invoice: DealerInvoice): Promise<DealerInvoice> {
  const html = renderDealerInvoiceDocument(invoice, { showToolbar: false });
  const pdf = await renderDealerInvoicePdf(invoice);
  const [updated] = await db
    .update(dealerInvoices)
    .set({
      htmlContent: html,
      pdfBase64: pdf.toString("base64"),
    })
    .where(eq(dealerInvoices.id, invoice.id))
    .returning();
  return updated ?? { ...invoice, htmlContent: html, pdfBase64: pdf.toString("base64") };
}

async function insertAndFinalizeInvoice(
  values: ReturnType<typeof baseInvoiceValues>,
): Promise<DealerInvoice> {
  const [row] = await db.insert(dealerInvoices).values(values).returning();
  return persistDealerInvoiceArtifacts(row);
}

export async function createAdminTestDealerInvoice(
  dealerId: string,
  userId: string,
  packageId: DealerPackageId = "business",
): Promise<DealerInvoice> {
  const [dealer] = await db.select().from(dealers).where(eq(dealers.id, dealerId));
  if (!dealer) throw new Error("Dealer not found");

  const issuedAt = new Date();
  const amountKc = DEALER_PACKAGES[packageId].amountKc;
  const number = await nextTestInvoiceNumber(issuedAt);

  return insertAndFinalizeInvoice(
    baseInvoiceValues({
      dealerId,
      userId,
      packageId,
      number,
      issuedAt,
      description: `[TEST] ${packageInvoiceDescription(packageId)}`,
      amountKc,
      dealer,
    }),
  );
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
    if (existing) {
      if (!existing.htmlContent || !existing.pdfBase64) {
        return persistDealerInvoiceArtifacts(existing);
      }
      return existing;
    }
  }

  const [dealer] = await db.select().from(dealers).where(eq(dealers.id, args.dealerId));
  if (!dealer) throw new Error("Dealer not found");

  const issuedAt = args.issuedAt ?? new Date();
  const amountKc = args.amountKc ?? DEALER_PACKAGES[args.packageId].amountKc;
  const number = await nextInvoiceNumber(issuedAt);

  return insertAndFinalizeInvoice(
    baseInvoiceValues({
      dealerId: args.dealerId,
      userId: args.userId,
      packageId: args.packageId,
      number,
      issuedAt,
      description: packageInvoiceDescription(args.packageId),
      amountKc,
      dealer,
      subscriptionId: args.subscriptionId,
      stripeCheckoutSessionId: args.stripeCheckoutSessionId,
      stripeInvoiceId: args.stripeInvoiceId,
    }),
  );
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

export async function getDealerInvoiceByNumberForUser(
  number: string,
  dealerId: string,
  userId: string,
) {
  const [row] = await db
    .select()
    .from(dealerInvoices)
    .where(
      and(
        eq(dealerInvoices.number, number),
        eq(dealerInvoices.dealerId, dealerId),
        eq(dealerInvoices.userId, userId),
      ),
    );
  return row ?? null;
}

export async function getDealerInvoiceHtmlContent(
  invoice: DealerInvoice,
  opts?: { showToolbar?: boolean },
): Promise<string> {
  if (opts?.showToolbar) {
    return renderDealerInvoiceDocument(invoice, { showToolbar: true });
  }
  if (invoice.htmlContent) {
    return invoice.htmlContent;
  }
  const html = renderDealerInvoiceDocument(invoice, { showToolbar: false });
  await db
    .update(dealerInvoices)
    .set({ htmlContent: html })
    .where(eq(dealerInvoices.id, invoice.id));
  return html;
}

export async function getDealerInvoicePdfBuffer(invoice: DealerInvoice): Promise<Buffer> {
  if (invoice.pdfBase64) {
    return Buffer.from(invoice.pdfBase64, "base64");
  }
  const pdf = await renderDealerInvoicePdf(invoice);
  await db
    .update(dealerInvoices)
    .set({ pdfBase64: pdf.toString("base64") })
    .where(eq(dealerInvoices.id, invoice.id));
  return pdf;
}

export function renderDealerInvoiceHtml(
  invoice: DealerInvoice,
  opts?: { mode?: "view" | "download"; showToolbar?: boolean },
): string {
  return renderDealerInvoiceDocument(invoice, opts);
}

export function isDealerPackageIdSafe(value: unknown): value is DealerPackageId {
  return isDealerPackageId(value);
}

export function serializeDealerInvoiceListItem(invoice: DealerInvoice) {
  return {
    id: invoice.id,
    number: invoice.number,
    dateISO: invoice.issuedAt,
    paidAtISO: invoice.paidAt ?? invoice.issuedAt,
    amountKc: invoice.amountKc,
    status: invoice.status,
    description: invoice.description,
    packageId: invoice.packageId,
    paymentMethod: invoice.paymentMethod,
    url: dealerInvoicePublicPath(invoice.number),
  };
}
