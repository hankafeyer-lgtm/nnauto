import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  PRIVATE_LISTING_PRICE_CENTS,
  PRIVATE_LISTING_PAYMENT_TYPE,
} from "@shared/privateListingBilling";
import { TOP_LISTING_PRICE_CENTS } from "@shared/topListing";
import type {
  EnrichedPayment,
  Listing,
  Payment,
  PaymentType,
  User,
} from "@shared/schema";
import {
  formatInvoiceDateCs,
  formatInvoiceKc,
  formatInvoiceWeb,
  NN_AUTO_INVOICE_SUPPLIER,
  INVOICE_VAT_DISCLAIMER,
  DEFAULT_INVOICE_PAYMENT_METHOD,
} from "@lib/dealerInvoiceTemplate";

const require = createRequire(import.meta.url);
const PDFDocument = require("pdfkit") as any;

/** Approved receipt palette (white + gold, matching design photo). */
const GOLD = "#C5A35A";
const GOLD_DARK = "#A8893D";
const GOLD_SOFT = "#F7F1E3";
const INK = "#1a1a1a";
const MUTED = "#6b7280";
const LINE = "#E8DFC8";

export type InvoiceLineItem = {
  name: string;
  description: string;
  amountKc: number;
};

export const PAYMENT_TYPE_LABELS: Record<PaymentType, string> = {
  new_private_listing: "Zveřejnění inzerátu (soukromý)",
  new_top_listing: "TOP inzerát (nový)",
  promote_listing: "TOP zvýraznění (existující inzerát)",
  dealer_top_listing: "TOP inzerát (dealer)",
};

export function paymentReceiptPdfApiPath(paymentId: string): string {
  return `/api/admin/payments/${encodeURIComponent(paymentId)}?format=pdf`;
}

export function userPaymentReceiptPdfApiPath(paymentId: string): string {
  return `/api/payments/${encodeURIComponent(paymentId)}?format=pdf`;
}

/** Invoice PDF only for payments created with snapshots (new checkouts). No backfill. */
export function paymentHasInvoice(
  payment: Pick<Payment, "paymentType">,
): boolean {
  return (
    payment.paymentType === "new_private_listing" ||
    payment.paymentType === "new_top_listing" ||
    payment.paymentType === "promote_listing" ||
    payment.paymentType === "dealer_top_listing"
  );
}

/**
 * Display name for UI lists (may fall back to username).
 * Do NOT use this for invoice PLÁTCE — use formatBuyerInvoiceName instead.
 */
export function formatBuyerFullName(
  user:
    | Pick<User, "firstName" | "lastName" | "username">
    | {
        firstName?: string | null;
        lastName?: string | null;
        username?: string | null;
      }
    | null
    | undefined,
): string {
  const invoiceName = formatBuyerInvoiceName(user);
  if (invoiceName) return invoiceName;
  return user?.username?.trim() || "—";
}

/**
 * Invoice PLÁTCE name: only real first/last from the account.
 * Never invents a name, never uses username, never uses supplier name, never "—".
 */
export function formatBuyerInvoiceName(
  user:
    | Pick<User, "firstName" | "lastName">
    | {
        firstName?: string | null;
        lastName?: string | null;
      }
    | null
    | undefined,
): string {
  const first = (user?.firstName || "").trim();
  const last = (user?.lastName || "").trim();
  return `${first} ${last}`.trim();
}

function isUsableSnapshotName(
  snap: string | null | undefined,
  buyer?: User | null,
  usernameSnapshot?: string | null,
): boolean {
  const name = (snap || "").trim();
  if (!name || name === "—" || name === "-" || name.toLowerCase() === "null") {
    return false;
  }
  if (name === NN_AUTO_INVOICE_SUPPLIER.name) return false;
  const username = (buyer?.username || usernameSnapshot || "").trim();
  if (username && name === username) return false;
  return true;
}

/** Resolve payer display name for invoices (account first, then trusted snapshot). */
export function resolvePayerInvoiceName(
  payment: Pick<Payment, "buyerNameSnapshot" | "buyerUsernameSnapshot">,
  buyer?: User | null,
): string {
  const fromAccount = formatBuyerInvoiceName(buyer);
  if (fromAccount) return fromAccount;
  if (
    isUsableSnapshotName(
      payment.buyerNameSnapshot,
      buyer,
      payment.buyerUsernameSnapshot,
    )
  ) {
    return payment.buyerNameSnapshot!.trim();
  }
  return "";
}

export function amountCentsToKc(amount: string | number | null | undefined): number {
  const raw = Number(amount ?? 0);
  if (!Number.isFinite(raw)) return 0;
  // Private/TOP store Stripe cents (e.g. 6900). Legacy/dealer rows may already be Kč.
  if (raw >= 1000 && Number.isInteger(raw)) return Math.round(raw) / 100;
  return raw;
}

export function inferPaymentType(payment: Payment): PaymentType | null {
  if (
    payment.paymentType === "new_private_listing" ||
    payment.paymentType === "new_top_listing" ||
    payment.paymentType === "promote_listing" ||
    payment.paymentType === "dealer_top_listing"
  ) {
    return payment.paymentType;
  }

  const cents = Number(payment.amount);
  if (!Number.isFinite(cents)) return null;

  if (cents === PRIVATE_LISTING_PRICE_CENTS || cents === 6999) {
    return "new_private_listing";
  }
  if (
    cents === TOP_LISTING_PRICE_CENTS + PRIVATE_LISTING_PRICE_CENTS ||
    cents === TOP_LISTING_PRICE_CENTS + 6999
  ) {
    return "new_top_listing";
  }
  if (cents === TOP_LISTING_PRICE_CENTS) {
    return "promote_listing";
  }
  return null;
}

export function inferIncludesTop(
  payment: Payment,
  resolvedType: PaymentType | null,
): boolean {
  if (payment.includesTop) return true;
  return (
    resolvedType === "new_top_listing" ||
    resolvedType === "promote_listing" ||
    resolvedType === "dealer_top_listing"
  );
}

export function inferIncludesPublishFee(
  payment: Payment,
  resolvedType: PaymentType | null,
): boolean {
  if (payment.includesPublishFee) return true;
  if (resolvedType === PRIVATE_LISTING_PAYMENT_TYPE) return true;
  const cents = Number(payment.amount);
  return (
    resolvedType === "new_top_listing" &&
    (cents === TOP_LISTING_PRICE_CENTS + PRIVATE_LISTING_PRICE_CENTS ||
      cents === TOP_LISTING_PRICE_CENTS + 6999)
  );
}

export function buildServiceDescription(args: {
  paymentType: PaymentType;
  includesPublishFee: boolean;
  includesTop: boolean;
  listingLabel: string;
}): string {
  const car = args.listingLabel || "vozidlo";
  switch (args.paymentType) {
    case "new_private_listing":
      return `Jednorázové zveřejnění inzerátu: ${car}`;
    case "new_top_listing":
      return args.includesPublishFee
        ? `Zveřejnění inzerátu + TOP zvýraznění na 30 dní: ${car}`
        : `TOP zvýraznění na 30 dní (nový inzerát): ${car}`;
    case "promote_listing":
      return `TOP zvýraznění existujícího inzerátu na 30 dní: ${car}`;
    case "dealer_top_listing":
      return `Dealerské TOP zvýraznění: ${car}`;
    default:
      return `Platba za inzerci: ${car}`;
  }
}

function listingLabelFromPayment(payment: EnrichedPayment): string {
  return (
    [payment.listingBrand, payment.listingModel, payment.listingYear]
      .filter(Boolean)
      .join(" ") ||
    payment.listingTitle ||
    ""
  );
}

/**
 * Build invoice line items for one Stripe payment.
 * Multiple paid services in the same checkout become separate rows; total = sum.
 */
export function buildInvoiceLineItems(
  payment: EnrichedPayment,
): InvoiceLineItem[] {
  const totalKc = payment.amountKc ?? amountCentsToKc(payment.amount);
  const label = listingLabelFromPayment(payment);
  const description = label || "Inzerát";
  const publishKc = PRIVATE_LISTING_PRICE_CENTS / 100;
  const topKc = TOP_LISTING_PRICE_CENTS / 100;

  const items: InvoiceLineItem[] = [];

  if (payment.includesPublishFee) {
    items.push({
      name: "Zveřejnění inzerátu",
      description,
      amountKc: publishKc,
    });
  }

  if (payment.includesTop) {
    items.push({
      name: "TOP zvýraznění inzerátu",
      description: label ? `${description} · 30 dní` : "30 dní",
      amountKc: topKc,
    });
  }

  if (items.length === 0) {
    items.push({
      name:
        payment.serviceDescription ||
        payment.paymentTypeLabel ||
        "Platba za inzerci",
      description,
      amountKc: totalKc,
    });
    return items;
  }

  const sum = items.reduce((s, i) => s + i.amountKc, 0);
  const delta = Math.round((totalKc - sum) * 100) / 100;

  // Align with actual Stripe total (legacy 69.99 etc.) without double-counting TOP.
  if (Math.abs(delta) >= 0.01) {
    if (items.length === 1) {
      items[0].amountKc = totalKc;
    } else {
      // Keep first item at catalogue price; put remainder on the last item.
      const last = items[items.length - 1];
      last.amountKc = Math.round((last.amountKc + delta) * 100) / 100;
      if (last.amountKc < 0) {
        // Fallback: single combined line matching Stripe total
        return [
          {
            name:
              payment.serviceDescription ||
              payment.paymentTypeLabel ||
              "Platba za inzerci",
            description,
            amountKc: totalKc,
          },
        ];
      }
    }
  }

  return items;
}

export function sumInvoiceLineItems(items: InvoiceLineItem[]): number {
  return Math.round(items.reduce((s, i) => s + i.amountKc, 0) * 100) / 100;
}

export function buildPaymentSnapshots(args: {
  user: User;
  listing: Listing;
  paymentType: PaymentType;
  includesPublishFee?: boolean;
  includesTop?: boolean;
}): Pick<
  Payment,
  | "paymentType"
  | "includesPublishFee"
  | "includesTop"
  | "buyerEmailSnapshot"
  | "buyerNameSnapshot"
  | "buyerPhoneSnapshot"
  | "buyerUsernameSnapshot"
  | "listingTitleSnapshot"
  | "listingBrandSnapshot"
  | "listingModelSnapshot"
  | "listingYearSnapshot"
  | "listingVinSnapshot"
  | "listingPriceSnapshot"
  | "serviceDescription"
> {
  const includesTop =
    args.includesTop ??
    (args.paymentType === "new_top_listing" ||
      args.paymentType === "promote_listing" ||
      args.paymentType === "dealer_top_listing");
  const includesPublishFee =
    args.includesPublishFee ?? args.paymentType === "new_private_listing";

  const listingLabel = [
    args.listing.brand,
    args.listing.model,
    args.listing.year ? String(args.listing.year) : null,
  ]
    .filter(Boolean)
    .join(" ");

  const invoiceName = formatBuyerInvoiceName(args.user);

  return {
    paymentType: args.paymentType,
    includesPublishFee,
    includesTop,
    buyerEmailSnapshot: args.user.email || null,
    // Store only real name for invoices — never username / supplier fallback.
    buyerNameSnapshot: invoiceName || null,
    buyerPhoneSnapshot: args.user.phone || args.listing.phone || null,
    buyerUsernameSnapshot: args.user.username || null,
    listingTitleSnapshot: args.listing.title || null,
    listingBrandSnapshot: args.listing.brand || null,
    listingModelSnapshot: args.listing.model || null,
    listingYearSnapshot: args.listing.year ?? null,
    listingVinSnapshot: args.listing.vin || null,
    listingPriceSnapshot:
      args.listing.price != null ? String(args.listing.price) : null,
    serviceDescription: buildServiceDescription({
      paymentType: args.paymentType,
      includesPublishFee:
        args.paymentType === "new_private_listing" ||
        (args.paymentType === "new_top_listing" && !!args.includesPublishFee),
      includesTop,
      listingLabel: listingLabel || args.listing.title || "inzerát",
    }),
  };
}

export function enrichPaymentForAdmin(
  payment: Payment,
  buyer?: User | null,
  listing?: Listing | null,
  opts?: { pdfAudience?: "admin" | "user" },
): EnrichedPayment {
  const paymentTypeResolved = inferPaymentType(payment);
  const includesTop = inferIncludesTop(payment, paymentTypeResolved);
  const includesPublishFee = inferIncludesPublishFee(
    payment,
    paymentTypeResolved,
  );
  const hasInvoice = paymentHasInvoice(payment);
  const pdfAudience = opts?.pdfAudience ?? "admin";

  const buyerFullName =
    resolvePayerInvoiceName(payment, buyer) || undefined;

  const listingTitle =
    payment.listingTitleSnapshot || listing?.title || undefined;
  const listingBrand =
    payment.listingBrandSnapshot || listing?.brand || undefined;
  const listingModel =
    payment.listingModelSnapshot || listing?.model || undefined;
  const listingYear =
    payment.listingYearSnapshot ?? listing?.year ?? null;
  const listingVin =
    payment.listingVinSnapshot || listing?.vin || null;

  const pdfUrl =
    pdfAudience === "user"
      ? hasInvoice
        ? userPaymentReceiptPdfApiPath(payment.id)
        : undefined
      : paymentReceiptPdfApiPath(payment.id);

  return {
    ...payment,
    includesTop,
    includesPublishFee,
    paymentType: paymentTypeResolved || payment.paymentType,
    buyerUsername:
      payment.buyerUsernameSnapshot || buyer?.username || undefined,
    buyerEmail: payment.buyerEmailSnapshot || buyer?.email || undefined,
    buyerFirstName: buyer?.firstName || undefined,
    buyerLastName: buyer?.lastName || undefined,
    buyerPhone:
      payment.buyerPhoneSnapshot || buyer?.phone || listing?.phone || undefined,
    buyerFullName,
    listingTitle,
    listingBrand,
    listingModel,
    listingYear,
    listingVin,
    listingPrice:
      payment.listingPriceSnapshot ||
      (listing?.price != null ? String(listing.price) : undefined),
    listingIsTop: listing?.isTopListing ?? includesTop,
    paymentTypeResolved,
    paymentTypeLabel: paymentTypeResolved
      ? PAYMENT_TYPE_LABELS[paymentTypeResolved]
      : payment.serviceDescription || "Platba",
    amountKc: amountCentsToKc(payment.amount),
    hasInvoice,
    pdfUrl,
    serviceDescription:
      payment.serviceDescription ||
      (paymentTypeResolved
        ? buildServiceDescription({
            paymentType: paymentTypeResolved,
            includesPublishFee,
            includesTop,
            listingLabel:
              [listingBrand, listingModel, listingYear]
                .filter(Boolean)
                .join(" ") ||
              listingTitle ||
              "inzerát",
          })
        : null),
  };
}

export function paymentReceiptFilename(payment: EnrichedPayment): string {
  const date = new Date(payment.createdAt).toISOString().slice(0, 10);
  return `doklad-platby-${date}-${payment.id.slice(0, 8)}.pdf`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function projectRoot(): string {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
}

function registerInvoiceFonts(doc: {
  registerFont: (name: string, src: string) => void;
}): { regular: string; bold: string } {
  const root = projectRoot();
  const regularPath = path.join(root, "assets/fonts/DejaVuSans.ttf");
  const boldPath = path.join(root, "assets/fonts/DejaVuSans-Bold.ttf");

  if (fs.existsSync(regularPath) && fs.existsSync(boldPath)) {
    doc.registerFont("InvoiceSans", regularPath);
    doc.registerFont("InvoiceSans-Bold", boldPath);
    return { regular: "InvoiceSans", bold: "InvoiceSans-Bold" };
  }

  const arialUnicode =
    "/System/Library/Fonts/Supplemental/Arial Unicode.ttf";
  if (fs.existsSync(arialUnicode)) {
    doc.registerFont("InvoiceSans", arialUnicode);
    doc.registerFont("InvoiceSans-Bold", arialUnicode);
    return { regular: "InvoiceSans", bold: "InvoiceSans-Bold" };
  }

  return { regular: "Helvetica", bold: "Helvetica-Bold" };
}

function resolveLogoPath(): string | null {
  const root = projectRoot();
  // Prefer compact icon so header text "NNAuto" stays clean; full logo.png includes a car.
  const candidates = [
    path.join(root, "public/logo-icon-only.png"),
    path.join(root, "public/logo-192.png"),
    path.join(root, "public/logo.png"),
    path.join(root, "client/public/logo-icon-only.png"),
    path.join(root, "client/public/logo.png"),
  ];
  return candidates.find((p) => fs.existsSync(p)) || null;
}

function resolveCarWatermarkPath(): string | null {
  const root = projectRoot();
  const candidates = [
    path.join(root, "assets/invoice/car-watermark.png"),
  ];
  return candidates.find((p) => fs.existsSync(p)) || null;
}

/** Soft gold coupe watermark under invoice meta (from approved mockup). */
function drawCarSilhouette(
  doc: any,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const watermark = resolveCarWatermarkPath();
  if (watermark) {
    try {
      doc.image(watermark, x, y, { width: w, height: h, align: "right" });
      return;
    } catch {
      // fall through to vector fallback
    }
  }

  // Minimal fallback if asset missing
  doc.save();
  doc.fillColor(GOLD).opacity(0.14);
  doc
    .moveTo(x + w * 0.08, y + h * 0.62)
    .bezierCurveTo(
      x + w * 0.2,
      y + h * 0.35,
      x + w * 0.4,
      y + h * 0.22,
      x + w * 0.55,
      y + h * 0.22,
    )
    .bezierCurveTo(
      x + w * 0.72,
      y + h * 0.22,
      x + w * 0.85,
      y + h * 0.4,
      x + w * 0.92,
      y + h * 0.58,
    )
    .lineTo(x + w * 0.92, y + h * 0.78)
    .lineTo(x + w * 0.08, y + h * 0.78)
    .closePath()
    .fill();
  doc.opacity(1);
  doc.restore();
}

function payerLines(payment: EnrichedPayment): string[] {
  const lines: string[] = [];
  const name = (payment.buyerFullName || "").trim();
  if (name) lines.push(name);
  if (payment.buyerEmail?.trim()) {
    lines.push(`E-mail: ${payment.buyerEmail.trim()}`);
  }
  if (payment.buyerPhone?.trim()) {
    lines.push(`Telefon: ${payment.buyerPhone.trim()}`);
  }
  return lines;
}

function detailRows(payment: EnrichedPayment): Array<[string, string]> {
  const carLine = listingLabelFromPayment(payment);
  const rows: Array<[string, string]> = [
    [
      "Služba",
      payment.serviceDescription || payment.paymentTypeLabel || "Platba",
    ],
    ["Typ", payment.paymentTypeLabel || "—"],
  ];
  if (payment.includesPublishFee != null) {
    rows.push([
      "Zveřejnění inzerátu",
      payment.includesPublishFee ? "Ano" : "Ne",
    ]);
  }
  if (payment.includesTop != null) {
    rows.push(["TOP zvýraznění", payment.includesTop ? "Ano (30 dní)" : "Ne"]);
  }
  if (carLine) rows.push(["Vozidlo", carLine]);
  if (payment.listingTitle?.trim()) {
    rows.push(["Název inzerátu", payment.listingTitle.trim()]);
  }
  if (payment.listingPrice) {
    const priceNum = Number(payment.listingPrice);
    if (Number.isFinite(priceNum)) {
      rows.push(["Cena vozidla", formatInvoiceKc(priceNum)]);
    }
  }
  if (payment.listingVin?.trim()) {
    rows.push(["VIN", payment.listingVin.trim()]);
  }
  rows.push(["Platební metoda", DEFAULT_INVOICE_PAYMENT_METHOD]);
  return rows;
}

export function renderPaymentReceiptHtml(payment: EnrichedPayment): string {
  const supplier = NN_AUTO_INVOICE_SUPPLIER;
  const supplierWeb = formatInvoiceWeb(supplier.web);
  const amountKc = payment.amountKc ?? amountCentsToKc(payment.amount);
  const lineItems = buildInvoiceLineItems(payment);
  const totalFromItems = sumInvoiceLineItems(lineItems);
  const paidAt = formatInvoiceDateCs(payment.createdAt);
  const receiptId = payment.id.slice(0, 8).toUpperCase();
  const payer = payerLines(payment);
  const details = detailRows(payment);
  const statusLabel =
    payment.status === "completed" ? "Zaplaceno" : payment.status;

  const payerHtml = payer.length
    ? payer
        .map((line, i) =>
          i === 0 && payment.buyerFullName
            ? `<div class="party-name">${escapeHtml(line)}</div>`
            : `<div>${escapeHtml(line)}</div>`,
        )
        .join("")
    : `<div class="muted-soft">Údaje plátce dle platebního účtu</div>`;

  return `<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="utf-8" />
  <title>Doklad o platbě ${escapeHtml(receiptId)}</title>
  <style>
    @page { margin: 16mm; }
    * { box-sizing: border-box; }
    body {
      margin: 0; padding: 24px;
      font-family: "DejaVu Sans", "Noto Sans", Arial, sans-serif;
      color: ${INK}; background: #f3f0ea;
    }
    .sheet {
      max-width: 820px; margin: 0 auto; background: #fff;
      padding: 36px 40px 28px; border: 1px solid ${LINE};
      box-shadow: 0 10px 30px rgba(80, 60, 20, 0.06);
    }
    .header { display: flex; justify-content: space-between; gap: 24px; align-items: flex-start; }
    .brand-row { display: flex; align-items: center; gap: 12px; }
    .brand-row img { height: 42px; width: auto; }
    .brand-name { font-size: 28px; font-weight: 700; letter-spacing: -0.02em; }
    .brand-name span { color: ${GOLD_DARK}; }
    .tagline { color: ${MUTED}; font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; margin-top: 2px; }
    .meta { text-align: right; font-size: 13px; color: ${MUTED}; min-width: 200px; }
    .meta strong { display: block; color: ${INK}; font-size: 16px; margin-bottom: 4px; }
    .status { color: ${GOLD_DARK}; font-weight: 700; }
    .gold-line { height: 1px; background: ${GOLD}; margin: 18px 0 22px; opacity: 0.7; }
    h1 { margin: 0 0 4px; font-size: 26px; letter-spacing: 0.04em; }
    .thanks { color: ${MUTED}; font-size: 13px; margin-bottom: 22px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 22px; }
    .box {
      border: 1px solid ${LINE}; border-radius: 10px; padding: 14px 16px;
      background: linear-gradient(180deg, #fff 0%, ${GOLD_SOFT} 160%);
      min-height: 120px;
    }
    .box h2 {
      margin: 0 0 10px; font-size: 11px; letter-spacing: 0.12em;
      color: ${GOLD_DARK}; font-weight: 700;
    }
    .party-name { font-weight: 700; font-size: 14px; margin-bottom: 4px; }
    .box div { font-size: 13px; line-height: 1.45; color: #374151; }
    .muted-soft { color: ${MUTED}; font-size: 12px; font-style: italic; }
    .section-title {
      font-size: 12px; letter-spacing: 0.1em; color: ${GOLD_DARK};
      font-weight: 700; margin: 0 0 10px;
    }
    .details { width: 100%; border-collapse: collapse; margin-bottom: 18px; }
    .details td { padding: 6px 0; font-size: 13px; vertical-align: top; border-bottom: 1px solid #f1ece0; }
    .details td:first-child { width: 180px; color: ${MUTED}; }
    .items { width: 100%; border-collapse: collapse; margin-top: 8px; }
    .items th {
      background: ${GOLD}; color: #fff; text-align: left; font-size: 11px;
      letter-spacing: 0.08em; padding: 10px 12px; font-weight: 700;
    }
    .items th:last-child, .items td:last-child { text-align: right; }
    .items td { padding: 12px; border-bottom: 1px solid ${LINE}; font-size: 13px; }
    .items td strong { color: ${INK}; }
    .total-wrap {
      margin-top: 18px; display: flex; justify-content: space-between; align-items: center;
      border: 1px solid ${LINE}; border-radius: 10px; padding: 14px 18px;
      background: ${GOLD_SOFT};
    }
    .total-label { font-weight: 700; font-size: 15px; }
    .total-note { color: ${MUTED}; font-size: 12px; margin-top: 2px; }
    .total-amount { font-size: 28px; font-weight: 700; color: ${GOLD_DARK}; }
    .footer {
      margin-top: 28px; padding-top: 14px; border-top: 1px solid ${LINE};
      display: flex; justify-content: space-between; gap: 16px;
      color: ${MUTED}; font-size: 11px; line-height: 1.45;
    }
    .footer strong { color: ${INK}; display: block; font-size: 13px; }
    .footer a { color: ${GOLD_DARK}; text-decoration: none; }
    @media (max-width: 640px) {
      body { padding: 8px; }
      .sheet { padding: 20px 16px; }
      .header, .grid, .footer, .total-wrap { display: block; }
      .meta { text-align: left; margin-top: 12px; }
      .box { margin-bottom: 10px; }
      .total-amount { margin-top: 8px; }
    }
  </style>
</head>
<body>
  <div class="sheet">
    <div class="header">
      <div>
        <div class="brand-row">
          <div>
            <div class="brand-name">NN<span>Auto</span></div>
            <div class="tagline">Automobilový portál</div>
          </div>
        </div>
      </div>
      <div class="meta">
        <strong>ID faktury: ${escapeHtml(receiptId)}</strong>
        <div>Datum platby: ${escapeHtml(paidAt)}</div>
        <div>Stav: <span class="status">${escapeHtml(statusLabel)}</span></div>
      </div>
    </div>
    <div class="gold-line"></div>
    <h1>DOKLAD O PLATBĚ</h1>
    <div class="thanks">Děkujeme, že využíváte NNAuto.cz</div>
    <div class="grid">
      <div class="box">
        <h2>DODAVATEL</h2>
        <div class="party-name">${escapeHtml(supplier.name)}</div>
        <div>${escapeHtml(supplier.street)}</div>
        <div>${escapeHtml(supplier.city)}</div>
        <div>IČO: ${escapeHtml(supplier.ico)}</div>
        <div>${escapeHtml(supplier.vatStatus)}</div>
        <div>E-mail: ${escapeHtml(supplier.email)}</div>
        <div>Web: ${escapeHtml(supplierWeb)}</div>
      </div>
      <div class="box">
        <h2>PLÁTCE</h2>
        ${payerHtml}
      </div>
    </div>
    <div class="section-title">DETAIL PLATBY</div>
    <table class="details">
      ${details
        .map(
          ([k, v]) =>
            `<tr><td>${escapeHtml(k)}</td><td>${escapeHtml(v)}</td></tr>`,
        )
        .join("")}
    </table>
    <table class="items">
      <thead>
        <tr>
          <th>POLOŽKA</th>
          <th>POPIS</th>
          <th>CENA</th>
        </tr>
      </thead>
      <tbody>
        ${lineItems
          .map(
            (item) => `<tr>
          <td>${escapeHtml(item.name)}</td>
          <td>${escapeHtml(item.description || "—")}</td>
          <td><strong>${escapeHtml(formatInvoiceKc(item.amountKc))}</strong></td>
        </tr>`,
          )
          .join("")}
      </tbody>
    </table>
    <div class="total-wrap">
      <div>
        <div class="total-label">Celkem zaplaceno</div>
        <div class="total-note">${escapeHtml(INVOICE_VAT_DISCLAIMER)}</div>
      </div>
      <div class="total-amount">${escapeHtml(formatInvoiceKc(totalFromItems || amountKc))}</div>
    </div>
    <div class="footer">
      <div>Tento doklad byl vystaven elektronicky prostřednictvím systému NNAuto.cz a je platný bez podpisu.</div>
      <div style="text-align:right">
        <strong>NNAuto</strong>
        <a href="https://nnauto.cz">${escapeHtml(supplierWeb)}</a><br/>
        <a href="mailto:${escapeHtml(supplier.email)}">${escapeHtml(supplier.email)}</a>
      </div>
    </div>
  </div>
</body>
</html>`;
}

export async function renderPaymentReceiptPdf(
  payment: EnrichedPayment,
): Promise<Buffer> {
  const supplier = NN_AUTO_INVOICE_SUPPLIER;
  const supplierWeb = formatInvoiceWeb(supplier.web);
  const amountKc = payment.amountKc ?? amountCentsToKc(payment.amount);
  const lineItems = buildInvoiceLineItems(payment);
  const totalKc = sumInvoiceLineItems(lineItems) || amountKc;
  const paidAt = formatInvoiceDateCs(payment.createdAt);
  const receiptId = payment.id.slice(0, 8).toUpperCase();
  const statusLabel =
    payment.status === "completed" ? "Zaplaceno" : payment.status;
  const logoPath = resolveLogoPath();

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 42,
      info: {
        Title: `Doklad o platbě ${receiptId}`,
        Author: "NNAuto.cz",
        Subject: "Doklad o platbě",
      },
    });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const fonts = registerInvoiceFonts(doc);
    const left = doc.page.margins.left;
    const right = doc.page.width - doc.page.margins.right;
    const width = right - left;

    // Header — logo nudged toward top edge; soft car under invoice meta (right).
    const headerTop = 24;
    let brandX = left;
    if (logoPath) {
      try {
        doc.image(logoPath, left, headerTop - 2, { height: 32 });
        brandX = left + 40;
      } catch {
        // ignore missing/corrupt logo
      }
    }
    doc
      .fillColor(INK)
      .font(fonts.bold)
      .fontSize(22)
      .text("NN", brandX, headerTop, { continued: true });
    doc.fillColor(GOLD_DARK).text("Auto");
    doc
      .fillColor(MUTED)
      .font(fonts.regular)
      .fontSize(8)
      .text("AUTOMOBILOVÝ PORTÁL", brandX, headerTop + 24);

    // Car watermark above/behind ID meta — approved mockup.
    const carW = 200;
    const carH = 58;
    drawCarSilhouette(doc, right - carW + 4, headerTop - 8, carW, carH);

    const metaX = right - 200;
    // ID sits just under the soft fade of the car
    const metaTop = headerTop + carH - 14;
    doc
      .fillColor(INK)
      .font(fonts.bold)
      .fontSize(11)
      .text(`ID faktury: ${receiptId}`, metaX, metaTop, {
        width: 200,
        align: "right",
      });
    doc
      .fillColor(MUTED)
      .font(fonts.regular)
      .fontSize(9)
      .text(`Datum platby: ${paidAt}`, metaX, metaTop + 15, {
        width: 200,
        align: "right",
      });
    doc
      .fillColor(GOLD_DARK)
      .font(fonts.bold)
      .fontSize(9)
      .text(`Stav: ${statusLabel}`, metaX, metaTop + 29, {
        width: 200,
        align: "right",
      });

    let y = Math.max(metaTop + 48, 108);
    doc
      .moveTo(left, y)
      .lineTo(right, y)
      .strokeColor(GOLD)
      .lineWidth(1)
      .stroke();
    y += 16;

    doc
      .fillColor(INK)
      .font(fonts.bold)
      .fontSize(20)
      .text("DOKLAD O PLATBĚ", left, y);
    y += 26;
    doc
      .fillColor(MUTED)
      .font(fonts.regular)
      .fontSize(10)
      .text("Děkujeme, že využíváte NNAuto.cz", left, y);
    y += 22;

    // Party boxes
    const boxWidth = (width - 14) / 2;
    const supplierLines = [
      supplier.name,
      supplier.street,
      supplier.city,
      `IČO: ${supplier.ico}`,
      supplier.vatStatus,
      `E-mail: ${supplier.email}`,
      `Web: ${supplierWeb}`,
    ];
    const buyer = payerLines(payment);
    const maxLines = Math.max(supplierLines.length, buyer.length || 1, 5);
    const boxHeight = 28 + maxLines * 14 + 10;

    const drawParty = (x: number, title: string, lines: string[]) => {
      doc
        .roundedRect(x, y, boxWidth, boxHeight, 8)
        .fillAndStroke(GOLD_SOFT, LINE);
      doc
        .fillColor(GOLD_DARK)
        .font(fonts.bold)
        .fontSize(8)
        .text(title, x + 14, y + 12);
      let py = y + 28;
      if (lines.length === 0) {
        doc
          .fillColor(MUTED)
          .font(fonts.regular)
          .fontSize(9)
          .text("Údaje dle platebního účtu", x + 14, py, {
            width: boxWidth - 28,
          });
        return;
      }
      lines.forEach((line, index) => {
        const isName = index === 0 && Boolean(payment.buyerFullName) && title === "PLÁTCE";
        const isSupplierName = index === 0 && title === "DODAVATEL";
        doc
          .fillColor(isName || isSupplierName ? INK : "#4b5563")
          .font(isName || isSupplierName ? fonts.bold : fonts.regular)
          .fontSize(isName || isSupplierName ? 11 : 9)
          .text(line, x + 14, py, { width: boxWidth - 28 });
        py += isName || isSupplierName ? 15 : 13;
      });
    };

    drawParty(left, "DODAVATEL", supplierLines);
    drawParty(left + boxWidth + 14, "PLÁTCE", buyer);
    y += boxHeight + 18;

    // Detail
    doc
      .fillColor(GOLD_DARK)
      .font(fonts.bold)
      .fontSize(9)
      .text("DETAIL PLATBY", left, y);
    y += 16;

    for (const [label, value] of detailRows(payment)) {
      if (y > 700) {
        doc.addPage();
        y = 48;
      }
      doc
        .fillColor(MUTED)
        .font(fonts.regular)
        .fontSize(8)
        .text(label, left, y, { width: 140 });
      doc
        .fillColor(INK)
        .font(fonts.regular)
        .fontSize(9)
        .text(value, left + 150, y, { width: width - 150 });
      y += 15;
    }

    y += 10;
    // Items table header
    doc.rect(left, y, width, 22).fill(GOLD);
    doc.fillColor("#ffffff").font(fonts.bold).fontSize(8);
    doc.text("POLOŽKA", left + 10, y + 7);
    doc.text("POPIS", left + width * 0.38, y + 7);
    doc.text("CENA", left + width * 0.72, y + 7, {
      width: width * 0.25,
      align: "right",
    });
    y += 28;

    for (const item of lineItems) {
      if (y > 720) {
        doc.addPage();
        y = 48;
      }
      doc
        .fillColor(INK)
        .font(fonts.regular)
        .fontSize(9)
        .text(item.name, left + 10, y, { width: width * 0.34 });
      doc
        .fillColor("#4b5563")
        .text(item.description || "—", left + width * 0.38, y, {
          width: width * 0.32,
        });
      doc
        .fillColor(INK)
        .font(fonts.bold)
        .text(formatInvoiceKc(item.amountKc), left + width * 0.72, y, {
          width: width * 0.25,
          align: "right",
        });
      y += 20;
      doc
        .moveTo(left, y - 4)
        .lineTo(right, y - 4)
        .strokeColor(LINE)
        .lineWidth(0.6)
        .stroke();
    }

    y += 12;
    // Total bar
    const totalH = 52;
    doc.roundedRect(left, y, width, totalH, 8).fillAndStroke(GOLD_SOFT, LINE);
    doc
      .moveTo(left + width * 0.62, y + 10)
      .lineTo(left + width * 0.62, y + totalH - 10)
      .strokeColor(GOLD)
      .lineWidth(1)
      .stroke();
    doc
      .fillColor(INK)
      .font(fonts.bold)
      .fontSize(12)
      .text("Celkem zaplaceno", left + 16, y + 14);
    doc
      .fillColor(MUTED)
      .font(fonts.regular)
      .fontSize(8)
      .text(INVOICE_VAT_DISCLAIMER, left + 16, y + 32);
    doc
      .fillColor(GOLD_DARK)
      .font(fonts.bold)
      .fontSize(22)
      .text(formatInvoiceKc(totalKc), left + width * 0.64, y + 14, {
        width: width * 0.34,
        align: "right",
      });

    y += totalH + 24;
    doc
      .moveTo(left, y)
      .lineTo(right, y)
      .strokeColor(GOLD)
      .lineWidth(0.8)
      .stroke();
    y += 12;
    doc
      .fillColor(MUTED)
      .font(fonts.regular)
      .fontSize(8)
      .text(
        "Tento doklad byl vystaven elektronicky prostřednictvím systému NNAuto.cz a je platný bez podpisu.",
        left,
        y,
        { width: width * 0.58 },
      );
    doc
      .fillColor(INK)
      .font(fonts.bold)
      .fontSize(10)
      .text("NNAuto", left + width * 0.6, y, {
        width: width * 0.4,
        align: "right",
      });
    doc
      .fillColor(GOLD_DARK)
      .font(fonts.regular)
      .fontSize(8)
      .text(supplierWeb, left + width * 0.6, y + 14, {
        width: width * 0.4,
        align: "right",
      });
    doc.text(supplier.email, left + width * 0.6, y + 26, {
      width: width * 0.4,
      align: "right",
    });

    doc.end();
  });
}
