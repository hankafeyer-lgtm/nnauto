import { createRequire } from "node:module";
import {
  PRIVATE_LISTING_PRICE_CENTS,
  PRIVATE_LISTING_PAYMENT_TYPE,
} from "@shared/privateListingBilling";
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
  NN_AUTO_BRAND,
  NN_AUTO_INVOICE_SUPPLIER,
  INVOICE_VAT_DISCLAIMER,
  DEFAULT_INVOICE_PAYMENT_METHOD,
} from "@lib/dealerInvoiceTemplate";

const require = createRequire(import.meta.url);
const PDFDocument = require("pdfkit") as any;

const TOP_LISTING_PRICE_CENTS = 9900;

export const PAYMENT_TYPE_LABELS: Record<PaymentType, string> = {
  new_private_listing: "Zveřejnění inzerátu (soukromý)",
  new_top_listing: "TOP inzerát (nový)",
  promote_listing: "TOP zvýraznění (existující inzerát)",
  dealer_top_listing: "TOP inzerát (dealer)",
};

export function paymentReceiptPdfApiPath(paymentId: string): string {
  return `/api/admin/payments/${encodeURIComponent(paymentId)}?format=pdf`;
}

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
  const first = user?.firstName?.trim() || "";
  const last = user?.lastName?.trim() || "";
  const full = `${first} ${last}`.trim();
  if (full) return full;
  return user?.username?.trim() || "—";
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

  return {
    paymentType: args.paymentType,
    includesPublishFee,
    includesTop,
    buyerEmailSnapshot: args.user.email || null,
    buyerNameSnapshot: formatBuyerFullName(args.user),
    buyerPhoneSnapshot: args.user.phone || args.listing.phone || null,
    buyerUsernameSnapshot: args.user.username || null,
    listingTitleSnapshot: args.listing.title || null,
    listingBrandSnapshot: args.listing.brand || null,
    listingModelSnapshot: args.listing.model || null,
    listingYearSnapshot: args.listing.year ?? null,
    listingVinSnapshot: args.listing.vin || null,
    listingPriceSnapshot: args.listing.price != null ? String(args.listing.price) : null,
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
): EnrichedPayment {
  const paymentTypeResolved = inferPaymentType(payment);
  const includesTop = inferIncludesTop(payment, paymentTypeResolved);
  const includesPublishFee = inferIncludesPublishFee(
    payment,
    paymentTypeResolved,
  );

  const buyerFullName =
    payment.buyerNameSnapshot ||
    formatBuyerFullName(buyer) ||
    undefined;

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
    pdfUrl: paymentReceiptPdfApiPath(payment.id),
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
        : undefined),
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

export function renderPaymentReceiptHtml(payment: EnrichedPayment): string {
  const supplier = NN_AUTO_INVOICE_SUPPLIER;
  const amountKc = payment.amountKc ?? amountCentsToKc(payment.amount);
  const carLine = [
    payment.listingBrand,
    payment.listingModel,
    payment.listingYear ? String(payment.listingYear) : null,
  ]
    .filter(Boolean)
    .join(" ");
  const rows: Array<[string, string]> = [
    ["Služba", payment.serviceDescription || payment.paymentTypeLabel || "—"],
    ["Typ", payment.paymentTypeLabel || "—"],
    ["Zveřejnění inzerátu", payment.includesPublishFee ? "Ano" : "Ne"],
    ["TOP zvýraznění", payment.includesTop ? "Ano (30 dní)" : "Ne"],
    ["Vozidlo", carLine || payment.listingTitle || "—"],
    ["Název inzerátu", payment.listingTitle || "—"],
    [
      "Cena vozu",
      payment.listingPrice
        ? formatInvoiceKc(Number(payment.listingPrice))
        : "—",
    ],
    ["VIN", payment.listingVin || "—"],
    ["Email plátce", payment.buyerEmail || "—"],
    ["Jméno plátce", payment.buyerFullName || payment.buyerUsername || "—"],
    ["Telefon", payment.buyerPhone || "—"],
    ["Účet", payment.buyerUsername ? `@${payment.buyerUsername}` : "—"],
    ["Platební metoda", DEFAULT_INVOICE_PAYMENT_METHOD],
    ["Stripe session", payment.stripeSessionId || "—"],
  ];

  return `<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="utf-8" />
  <title>Doklad o platbě ${escapeHtml(payment.id.slice(0, 8))}</title>
  <style>
    body { font-family: Arial, sans-serif; color: #1a1a1a; background: #f5f2ee; margin: 0; padding: 32px; }
    .sheet { max-width: 820px; margin: 0 auto; background: #fff; border-radius: 16px; padding: 36px; box-shadow: 0 12px 40px rgba(40,30,10,0.08); }
    h1 { color: ${NN_AUTO_BRAND}; margin: 0 0 4px; }
    .muted { color: #6b7280; font-size: 14px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 24px 0; }
    .box { background: #faf8f6; border: 1px solid #e8e4e0; border-radius: 12px; padding: 16px; }
    .box h2 { margin: 0 0 10px; font-size: 12px; letter-spacing: 0.08em; color: ${NN_AUTO_BRAND}; }
    table { width: 100%; border-collapse: collapse; }
    td { padding: 8px 0; border-bottom: 1px solid #eee; vertical-align: top; font-size: 14px; }
    td:first-child { width: 200px; color: #6b7280; }
    .total { margin-top: 24px; text-align: right; }
    .total strong { font-size: 28px; }
  </style>
</head>
<body>
  <div class="sheet">
    <h1>NNAuto</h1>
    <div class="muted">Doklad o platbě · ${escapeHtml(formatInvoiceDateCs(payment.createdAt))} · ${payment.status === "completed" ? "Zaplaceno" : escapeHtml(payment.status)}</div>
    <div class="grid">
      <div class="box">
        <h2>DODAVATEL</h2>
        <div><strong>${escapeHtml(supplier.name)}</strong></div>
        <div>${escapeHtml(supplier.street)}</div>
        <div>${escapeHtml(supplier.city)}</div>
        <div>IČO: ${escapeHtml(supplier.ico)}</div>
        <div>${escapeHtml(supplier.email)}</div>
      </div>
      <div class="box">
        <h2>PLÁTCE</h2>
        <div><strong>${escapeHtml(payment.buyerFullName || payment.buyerUsername || "—")}</strong></div>
        <div>${escapeHtml(payment.buyerEmail || "—")}</div>
        <div>${escapeHtml(payment.buyerPhone || "")}</div>
        <div>${escapeHtml(payment.buyerUsername ? `@${payment.buyerUsername}` : "")}</div>
      </div>
    </div>
    <table>
      ${rows
        .map(
          ([k, v]) =>
            `<tr><td>${escapeHtml(k)}</td><td>${escapeHtml(v)}</td></tr>`,
        )
        .join("")}
    </table>
    <div class="total">
      <div class="muted">Celkem zaplaceno</div>
      <strong>${escapeHtml(formatInvoiceKc(amountKc))}</strong>
      <div class="muted" style="margin-top:8px">${escapeHtml(INVOICE_VAT_DISCLAIMER)}</div>
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
  const paidAt = formatInvoiceDateCs(payment.createdAt);
  const description =
    payment.serviceDescription ||
    payment.paymentTypeLabel ||
    "Platba za inzerci NNAuto";

  const buyerName = payment.buyerFullName || payment.buyerUsername || "—";
  const buyerEmail = payment.buyerEmail || "—";
  const buyerPhone = payment.buyerPhone || "—";
  const carLine = [
    payment.listingBrand,
    payment.listingModel,
    payment.listingYear ? String(payment.listingYear) : null,
  ]
    .filter(Boolean)
    .join(" ");

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 48 });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const left = 48;
    const right = 547;
    const width = right - left;

    doc.fillColor(NN_AUTO_BRAND).font("Helvetica-Bold").fontSize(22).text("NNAuto", left, 48);
    doc
      .fillColor("#6b7280")
      .font("Helvetica")
      .fontSize(10)
      .text("Doklad o platbě", left, 74);
    doc
      .fillColor("#1a1a1a")
      .font("Helvetica-Bold")
      .fontSize(11)
      .text(`ID: ${payment.id.slice(0, 8).toUpperCase()}`, left + width * 0.55, 48, {
        width: width * 0.45,
        align: "right",
      });
    doc
      .font("Helvetica")
      .fillColor("#6b7280")
      .fontSize(9)
      .text(`Datum platby: ${paidAt}`, left + width * 0.55, 66, {
        width: width * 0.45,
        align: "right",
      });
    doc.text(`Stav: ${payment.status === "completed" ? "Zaplaceno" : payment.status}`, left + width * 0.55, 80, {
      width: width * 0.45,
      align: "right",
    });

    let y = 110;
    doc.moveTo(left, y).lineTo(right, y).strokeColor("#e8e4e0").stroke();
    y += 18;

    const boxWidth = (width - 14) / 2;
    const boxHeight = 118;

    const drawParty = (x: number, title: string, lines: string[]) => {
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

    drawParty(left + boxWidth + 14, "PLÁTCE", [
      buyerName,
      buyerEmail !== "—" ? `Email: ${buyerEmail}` : "",
      buyerPhone !== "—" ? `Telefon: ${buyerPhone}` : "",
      payment.buyerUsername ? `Účet: ${payment.buyerUsername}` : "",
      "Česká republika",
    ].filter(Boolean));

    y += boxHeight + 22;

    doc.fillColor("#1a1a1a").font("Helvetica-Bold").fontSize(12).text("Detail platby", left, y);
    y += 18;

    const detailRows: Array<[string, string]> = [
      ["Služba", description],
      ["Typ", payment.paymentTypeLabel || "—"],
      ["Zveřejnění inzerátu", payment.includesPublishFee ? "Ano" : "Ne"],
      ["TOP zvýraznění", payment.includesTop ? "Ano (30 dní)" : "Ne"],
      ["Vozidlo", carLine || payment.listingTitle || "—"],
      ["Název inzerátu", payment.listingTitle || "—"],
      ["Cena vozu", payment.listingPrice ? `${formatInvoiceKc(Number(payment.listingPrice))}` : "—"],
      ["VIN", payment.listingVin || "—"],
      ["ID inzerátu", payment.listingId],
      ["Platební metoda", DEFAULT_INVOICE_PAYMENT_METHOD],
      ["Stripe session", payment.stripeSessionId || "—"],
      ["Payment intent", payment.stripePaymentIntentId || "—"],
    ];

    for (const [label, value] of detailRows) {
      doc.fillColor("#6b7280").font("Helvetica").fontSize(8).text(label, left, y, { width: 130 });
      doc.fillColor("#1a1a1a").fontSize(9).text(value, left + 140, y, { width: width - 140 });
      y += 16;
      if (y > 700) {
        doc.addPage();
        y = 48;
      }
    }

    y += 10;
    doc.rect(left, y, width, 24).fill(NN_AUTO_BRAND);
    doc.fillColor("#ffffff").fontSize(8).font("Helvetica");
    doc.text("POLOŽKA", left + 10, y + 8);
    doc.text("ČÁSTKA", left + width * 0.72, y + 8, { width: width * 0.25, align: "right" });

    y += 30;
    doc.fillColor("#1a1a1a").fontSize(9).text(description, left + 10, y, { width: width * 0.65 });
    doc.font("Helvetica-Bold").text(formatInvoiceKc(amountKc), left + width * 0.72, y, {
      width: width * 0.25,
      align: "right",
    });

    y += 40;
    doc.fillColor("#6b7280").font("Helvetica").fontSize(9).text("Celkem zaplaceno", left + width * 0.45, y, {
      width: width * 0.52,
      align: "right",
    });
    doc.fillColor("#1a1a1a").font("Helvetica-Bold").fontSize(20).text(
      formatInvoiceKc(amountKc),
      left + width * 0.45,
      y + 14,
      { width: width * 0.52, align: "right" },
    );
    doc.font("Helvetica").fillColor("#6b7280").fontSize(8).text(
      INVOICE_VAT_DISCLAIMER,
      left + width * 0.45,
      y + 42,
      { width: width * 0.52, align: "right" },
    );

    const footerY = y + 70;
    doc.moveTo(left, footerY).lineTo(right, footerY).strokeColor("#e8e4e0").stroke();
    doc.fillColor("#6b7280").fontSize(8).text(
      "Doklad byl vystaven elektronicky prostřednictvím NNAuto pro interní evidenci plateb.",
      left,
      footerY + 12,
      { width: width * 0.55 },
    );
    doc.fillColor("#1a1a1a").font("Helvetica-Bold").text("NNAuto", left + width * 0.58, footerY + 12, {
      width: width * 0.42,
      align: "right",
    });
    doc.font("Helvetica").fillColor(NN_AUTO_BRAND).text(supplier.email, left + width * 0.58, footerY + 28, {
      width: width * 0.42,
      align: "right",
    });

    doc.end();
  });
}
