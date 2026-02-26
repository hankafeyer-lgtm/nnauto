import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import fs from "fs";
import path from "path";
import {
  insertListingSchema,
  updateListingSchema,
  insertUserSchema,
  loginSchema,
  updateUserSchema,
  changePasswordSchema,
  verifyEmailSchema,
  changeEmailSchema,
} from "@shared/schema";
import { setupAuth, isAuthenticated, isAdmin } from "./auth";
import "./types";
import bcrypt from "bcrypt";
import {
  R2StorageService,
  ObjectNotFoundError,
  ObjectPermission,
} from "./r2Storage";
import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";
import Stripe from "stripe";
import {
  getUncachableStripeClient,
  getStripePublishableKey,
} from "./stripeClient";
import { signToken, verifyToken, extractTokenFromHeader } from "./jwt";
import {
  cebiaCreatePdfQueue,
  cebiaGetPdfData,
  cebiaVinCheck,
} from "./cebiaClient";
import multer from "multer";
import sharp from "sharp";

// In-memory cache for optimized images
const imageCache = new Map<
  string,
  { buffer: Buffer; contentType: string; timestamp: number }
>();
const IMAGE_CACHE_TTL = 60 * 60 * 1000; // 1 hour in milliseconds
const MAX_CACHE_SIZE = 100; // Maximum number of cached images

// Configure multer for video upload (max 1000MB)
const videoUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1000 * 1024 * 1024, // 1000MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("video/")) {
      cb(null, true);
    } else {
      cb(new Error("Only video files are allowed"));
    }
  },
});

// TOP listing promotion price in CZK (haléře)
const TOP_LISTING_PRICE = 9900; // 99 CZK

// Cebia Autotracer PDF report price (in haléře). Must be configured.
const CEBIA_REPORT_PRICE_CENTS = Number.parseInt(
  (process.env.CEBIA_REPORT_PRICE_CENTS || "").trim() || "0",
  10,
);
const CEBIA_ENABLED = process.env.CEBIA_ENABLED === "true";
const CEBIA_PAYMENTS_FROZEN = process.env.CEBIA_PAYMENTS_FROZEN === "true";
const CEBIA_AUTO_REQUEST_ON_PAID = process.env.CEBIA_AUTO_REQUEST_ON_PAID !== "false";
const CEBIA_EMAIL_ON_READY = process.env.CEBIA_EMAIL_ON_READY === "true";
const CEBIA_STRIPE_PAYMENT_LINK_URL = (
  process.env.CEBIA_STRIPE_PAYMENT_LINK_URL ||
  "https://buy.stripe.com/5kQdR857b0jVaZf8SsdZ600"
).trim();

const mergeRawResponse = (existing: unknown, patch: Record<string, unknown>) => {
  if (existing && typeof existing === "object" && !Array.isArray(existing)) {
    return { ...(existing as any), ...patch };
  }
  return { ...patch };
};

const getCebiaGuestToken = (report: any): string | null => {
  const rr = report?.rawResponse;
  if (!rr || typeof rr !== "object" || Array.isArray(rr)) return null;
  const token = (rr as any).guestToken;
  return typeof token === "string" && token.trim() ? token.trim() : null;
};

const assertValidGuestAccess = (report: any, token: string | undefined): boolean => {
  const expected = getCebiaGuestToken(report);
  if (!expected) return false;
  if (!token || typeof token !== "string") return false;
  return token.trim() === expected;
};

// Cloudflare Turnstile verification
async function verifyTurnstileToken(token: string): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  // If no secret key configured, allow in development mode
  if (!secretKey) {
    console.log(
      "[Turnstile] No secret key configured, skipping verification in development",
    );
    return true;
  }

  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          secret: secretKey,
          response: token,
        }),
      },
    );

    const data = (await response.json()) as {
      success: boolean;
      "error-codes"?: string[];
    };

    if (!data.success) {
      console.log("[Turnstile] Verification failed:", data["error-codes"]);
    }

    return data.success;
  } catch (error) {
    console.error("[Turnstile] Verification error:", error);
    return false;
  }
}

// Helper function to send password recovery email
async function sendPasswordEmail(
  email: string,
  password: string,
): Promise<void> {
  const apiKey = (process.env.MAILERSEND_API_KEY || "").trim();
  if (!apiKey) throw new Error("MAILERSEND_API_KEY not configured");

  if (!apiKey) {
    throw new Error("MAILERSEND_API_KEY not configured");
  }
  console.log("[MAIL] key length:", apiKey.length);
  console.log("[MAIL] key ends with:", JSON.stringify(apiKey.slice(-4)));
  console.log("[MAIL] key prefix:", apiKey.slice(0, 6));

  const mailerSend = new MailerSend({ apiKey });

  // Get sender email from environment variable or use default
  // For MailerSend: use your trial domain email or verified domain
  const senderEmail = process.env.MAILERSEND_FROM_EMAIL || "info@nnauto.cz";
  const sentFrom = new Sender(senderEmail, "NNAuto");
  const recipients = [new Recipient(email, email)];

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setReplyTo(sentFrom)
    .setSubject("Vaše nové heslo - NNAuto")
    .setHtml(
      `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; padding: 20px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://nnauto.cz/logo.png" alt="NNAuto" style="width: 80px; height: auto;" />
        </div>
        <h2 style="color: #B8860B; text-align: center;">Obnovení hesla</h2>
        <p>Vaše nové dočasné heslo je:</p>
        <p style="font-size: 18px; font-weight: bold; padding: 10px; background: #f5f5f5; border-radius: 4px; text-align: center;">${password}</p>
        <p><strong>Důležité:</strong> Toto heslo je dočasné. Po přihlášení si prosím změňte heslo v nastavení profilu na nové, které si zapamatujete.</p>
        <p>Pokud jste o obnovení hesla nežádali, kontaktujte nás okamžitě.</p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
        <p style="color: #666; font-size: 12px; text-align: center;">NNAuto - Prémiový autobazar v České republice</p>
      </div>
    `,
    )
    .setText(
      `NNAuto - Obnovení hesla\n\nVaše nové dočasné heslo je: ${password}\n\nDůležité: Toto heslo je dočasné. Po přihlášení si prosím změňte heslo v nastavení profilu na nové, které si zapamatujete.\n\nPokud jste o obnovení hesla nežádali, kontaktujte nás okamžitě.\n\nNNAuto - Prémiový autobazar v České republice`,
    );

  await mailerSend.email.send(emailParams);
}

// Helper function to send email verification code
async function sendVerificationEmail(
  email: string,
  code: string,
): Promise<boolean> {
  const apiKey = process.env.MAILERSEND_API_KEY;
  const apiKeyPreview = apiKey ? `${apiKey.substring(0, 10)}...` : "MISSING";
  console.log(`[EMAIL] sendVerificationEmail called for ${email}`);
  console.log(
    `[EMAIL] API key preview: ${apiKeyPreview}, length: ${apiKey?.length || 0}`,
  );

  if (!apiKey) {
    console.error(
      "[EMAIL] MAILERSEND_API_KEY not configured - cannot send verification email",
    );
    return false;
  }

  const mailerSend = new MailerSend({ apiKey });
  const senderEmail = process.env.MAILERSEND_FROM_EMAIL || "info@nnauto.cz";
  console.log(`[EMAIL] Using sender: ${senderEmail}`);

  const sentFrom = new Sender(senderEmail, "NNAuto");
  const recipients = [new Recipient(email, email)];

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setReplyTo(sentFrom)
    .setSubject("Ověřovací kód - NNAuto")
    .setHtml(
      `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; padding: 20px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://nnauto.cz/logo.png" alt="NNAuto" style="width: 80px; height: auto;" />
        </div>
        <h2 style="color: #B8860B; text-align: center;">Ověření emailu</h2>
        <p>Váš ověřovací kód je:</p>
        <p style="font-size: 32px; font-weight: bold; padding: 15px; background: #f5f5f5; border-radius: 4px; text-align: center; letter-spacing: 8px;">${code}</p>
        <p>Tento kód je platný po dobu 15 minut.</p>
        <p>Pokud jste o ověření nežádali, ignorujte tento email.</p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
        <p style="color: #666; font-size: 12px; text-align: center;">NNAuto - Prémiový autobazar v České republice</p>
      </div>
    `,
    )
    .setText(
      `NNAuto - Ověření emailu\n\nVáš ověřovací kód je: ${code}\n\nTento kód je platný po dobu 15 minut.\n\nPokud jste o ověření nežádali, ignorujte tento email.\n\nNNAuto - Prémiový autobazar v České republice`,
    );

  try {
    console.log(`[EMAIL] Calling MailerSend API...`);
    const response = await mailerSend.email.send(emailParams);
    console.log(`[EMAIL] SUCCESS - Verification email sent to ${email}`);
    console.log(
      `[EMAIL] Response status: ${response?.statusCode || "unknown"}`,
    );
    return true;
  } catch (error: any) {
    console.error("[EMAIL] FAILED - Error sending verification email");
    console.error("[EMAIL] Error message:", error?.message || "no message");
    console.error(
      "[EMAIL] Error status:",
      error?.statusCode || error?.status || "no status",
    );
    console.error(
      "[EMAIL] Error body:",
      JSON.stringify(error?.body || error?.response?.body || "no body"),
    );

    // Check for common MailerSend errors
    if (error?.statusCode === 401 || error?.status === 401) {
      console.error("[EMAIL] 401 Unauthorized - API key may be invalid");
    } else if (error?.statusCode === 422 || error?.status === 422) {
      console.error(
        "[EMAIL] 422 Unprocessable - Domain may not be verified or sender email invalid",
      );
    } else if (error?.statusCode === 429 || error?.status === 429) {
      console.error("[EMAIL] 429 Rate Limited - Too many requests");
    }

    return false;
  }
}

// Helper function to send TOP payment confirmation email
interface ListingDetails {
  brand: string;
  model: string;
  year: number;
  price: string | number;
  id: string;
}

async function sendTopPaymentConfirmationEmail(
  email: string,
  listing: ListingDetails,
  amount: number,
): Promise<void> {
  const apiKey = process.env.MAILERSEND_API_KEY;
  console.log(
    `[EMAIL] sendTopPaymentConfirmationEmail called for ${email}, API key exists: ${!!apiKey}`,
  );
  if (!apiKey) {
    console.log(
      "[EMAIL] MAILERSEND_API_KEY not configured - skipping TOP payment confirmation email",
    );
    return;
  }

  const mailerSend = new MailerSend({ apiKey });
  const senderEmail = process.env.MAILERSEND_FROM_EMAIL || "info@nnauto.cz";
  const sentFrom = new Sender(senderEmail, "NNAuto");
  const recipients = [new Recipient(email, email)];

  const priceAsNumber =
    typeof listing.price === "string"
      ? parseFloat(listing.price)
      : listing.price;
  const formattedPrice = new Intl.NumberFormat("cs-CZ").format(priceAsNumber);
  const formattedAmount = new Intl.NumberFormat("cs-CZ").format(amount / 100); // Convert from cents

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setReplyTo(sentFrom)
    .setSubject("Potvrzení platby TOP inzerátu - NNAuto")
    .setHtml(
      `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; padding: 20px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://nnauto.cz/logo.png" alt="NNAuto" style="width: 80px; height: auto;" />
        </div>
        <h2 style="color: #B8860B; text-align: center;">Platba úspěšně přijata!</h2>
        <div style="background: linear-gradient(135deg, #B8860B 0%, #DAA520 100%); color: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <p style="margin: 0; font-size: 14px;">Váš inzerát je nyní</p>
          <p style="margin: 10px 0; font-size: 28px; font-weight: bold;">TOP INZERÁT</p>
          <p style="margin: 0; font-size: 14px;">a bude zobrazen na předních pozicích</p>
        </div>
        <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #333;">Detail inzerátu:</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #666;">Vozidlo:</td>
              <td style="padding: 8px 0; font-weight: bold; text-align: right;">${listing.brand} ${listing.model}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;">Rok výroby:</td>
              <td style="padding: 8px 0; font-weight: bold; text-align: right;">${listing.year}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;">Cena vozidla:</td>
              <td style="padding: 8px 0; font-weight: bold; text-align: right;">${formattedPrice} Kč</td>
            </tr>
            <tr style="border-top: 1px solid #ddd;">
              <td style="padding: 12px 0 8px; color: #666;">Zaplaceno za TOP:</td>
              <td style="padding: 12px 0 8px; font-weight: bold; text-align: right; color: #B8860B;">${formattedAmount} Kč</td>
            </tr>
          </table>
        </div>
        <p style="text-align: center;">
          <a href="https://nnauto.cz/listing/${listing.id}" style="display: inline-block; background: #B8860B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Zobrazit inzerát</a>
        </p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
        <p style="color: #666; font-size: 12px; text-align: center;">Děkujeme za využití služby TOP inzerát!</p>
        <p style="color: #666; font-size: 12px; text-align: center;">NNAuto - Prémiový autobazar v České republice</p>
      </div>
    `,
    )
    .setText(
      `NNAuto - Potvrzení platby TOP inzerátu\n\nVaše platba byla úspěšně přijata!\n\nVáš inzerát je nyní TOP INZERÁT a bude zobrazen na předních pozicích.\n\nDetail inzerátu:\n- Vozidlo: ${listing.brand} ${listing.model}\n- Rok výroby: ${listing.year}\n- Cena vozidla: ${formattedPrice} Kč\n- Zaplaceno za TOP: ${formattedAmount} Kč\n\nZobrazit inzerát: https://nnauto.cz/listing/${listing.id}\n\nDěkujeme za využití služby TOP inzerát!\n\nNNAuto - Prémiový autobazar v České republice`,
    );

  try {
    await mailerSend.email.send(emailParams);
    console.log(
      `[EMAIL] TOP payment confirmation email sent successfully to ${email}`,
    );
  } catch (error: any) {
    console.error(
      "[EMAIL] Error sending TOP payment confirmation email:",
      error?.message || error,
    );
    console.error("[EMAIL] Error details:", JSON.stringify(error, null, 2));
  }
}

async function sendCebiaReportReadyEmail(args: {
  email: string;
  vin: string;
  pdfUrl: string;
}): Promise<void> {
  const apiKey = process.env.MAILERSEND_API_KEY;
  if (!apiKey) return;

  const { email, vin, pdfUrl } = args;

  const mailerSend = new MailerSend({ apiKey });
  const senderEmail = process.env.MAILERSEND_FROM_EMAIL || "info@nnauto.cz";
  const sentFrom = new Sender(senderEmail, "NNAuto");
  const recipients = [new Recipient(email, email)];

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setReplyTo(sentFrom)
    .setSubject("VIN report připraven (Cebia) — NNAuto")
    .setHtml(
      `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; padding: 20px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://nnauto.cz/logo.png" alt="NNAuto" style="width: 80px; height: auto;" />
        </div>
        <h2 style="color: #B8860B; text-align: center;">VIN report je připraven</h2>
        <p style="color:#333; font-size: 14px;">VIN: <b style="font-family: monospace;">${vin}</b></p>
        <p style="text-align: center; margin: 24px 0;">
          <a href="${pdfUrl}" style="display: inline-block; background: #B8860B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Otevřít PDF report</a>
        </p>
        <p style="color:#666; font-size: 12px;">Pokud se tlačítko neotevře, zkopírujte tento odkaz: ${pdfUrl}</p>
      </div>
    `,
    )
    .setText(`VIN report je připraven.\nVIN: ${vin}\nPDF: ${pdfUrl}`);

  try {
    await mailerSend.email.send(emailParams);
  } catch (error: any) {
    console.error("[EMAIL] Error sending Cebia report email:", error?.message || error);
  }
}

// Helper function to send listing created confirmation email
async function sendListingCreatedEmail(
  email: string,
  listing: ListingDetails,
  isTopListing: boolean,
): Promise<void> {
  const apiKey = process.env.MAILERSEND_API_KEY;
  console.log(
    `[EMAIL] sendListingCreatedEmail called for ${email}, API key exists: ${!!apiKey}, isTopListing: ${isTopListing}`,
  );
  if (!apiKey) {
    console.log(
      "[EMAIL] MAILERSEND_API_KEY not configured - skipping listing created email",
    );
    return;
  }

  const mailerSend = new MailerSend({ apiKey });
  const senderEmail = process.env.MAILERSEND_FROM_EMAIL || "info@nnauto.cz";
  const sentFrom = new Sender(senderEmail, "NNAuto");
  const recipients = [new Recipient(email, email)];

  const priceAsNumber =
    typeof listing.price === "string"
      ? parseFloat(listing.price)
      : listing.price;
  const formattedPrice = new Intl.NumberFormat("cs-CZ").format(priceAsNumber);
  const topBadge = isTopListing
    ? `<span style="display: inline-block; background: linear-gradient(135deg, #B8860B 0%, #DAA520 100%); color: white; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: bold; margin-left: 8px;">TOP</span>`
    : "";

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setReplyTo(sentFrom)
    .setSubject(
      `Inzerát úspěšně přidán - ${listing.brand} ${listing.model} - NNAuto`,
    )
    .setHtml(
      `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; padding: 20px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://nnauto.cz/logo.png" alt="NNAuto" style="width: 80px; height: auto;" />
        </div>
        <h2 style="color: #B8860B; text-align: center;">Inzerát úspěšně přidán!</h2>
        <p style="text-align: center; color: #666;">Váš inzerát byl úspěšně zveřejněn na NNAuto.</p>
        
        <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #333;">
            ${listing.brand} ${listing.model} ${topBadge}
          </h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #666;">Rok výroby:</td>
              <td style="padding: 8px 0; font-weight: bold; text-align: right;">${
                listing.year
              }</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;">Cena:</td>
              <td style="padding: 8px 0; font-weight: bold; text-align: right; color: #B8860B;">${formattedPrice} Kč</td>
            </tr>
          </table>
        </div>

        ${
          isTopListing
            ? `
        <div style="background: linear-gradient(135deg, #B8860B 0%, #DAA520 100%); color: white; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <p style="margin: 0; font-weight: bold;">Váš inzerát je TOP INZERÁT</p>
          <p style="margin: 5px 0 0; font-size: 14px;">Bude zobrazen na předních pozicích pro maximální viditelnost.</p>
        </div>
        `
            : ""
        }

        <p style="text-align: center;">
          <a href="https://nnauto.cz/listing/${
            listing.id
          }" style="display: inline-block; background: #B8860B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Zobrazit inzerát</a>
        </p>

        <div style="background: #f0f7ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px; color: #333;"><strong>Tipy pro úspěšný prodej:</strong></p>
          <ul style="margin: 10px 0 0; padding-left: 20px; color: #666; font-size: 14px;">
            <li>Přidejte kvalitní fotografie vozidla</li>
            <li>Pravidelně aktualizujte cenu a popis</li>
            <li>Odpovídejte rychle na dotazy zájemců</li>
          </ul>
        </div>

        <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
        <p style="color: #666; font-size: 12px; text-align: center;">Děkujeme, že prodáváte s NNAuto!</p>
        <p style="color: #666; font-size: 12px; text-align: center;">NNAuto - Prémiový autobazar v České republice</p>
      </div>
    `,
    )
    .setText(
      `NNAuto - Inzerát úspěšně přidán!\n\nVáš inzerát byl úspěšně zveřejněn na NNAuto.\n\n${
        listing.brand
      } ${listing.model}${
        isTopListing ? " (TOP INZERÁT)" : ""
      }\n- Rok výroby: ${
        listing.year
      }\n- Cena: ${formattedPrice} Kč\n\nZobrazit inzerát: https://nnauto.cz/listing/${
        listing.id
      }\n\nTipy pro úspěšný prodej:\n- Přidejte kvalitní fotografie vozidla\n- Pravidelně aktualizujte cenu a popis\n- Odpovídejte rychle na dotazy zájemců\n\nDěkujeme, že prodáváte s NNAuto!\n\nNNAuto - Prémiový autobazar v České republice`,
    );

  try {
    await mailerSend.email.send(emailParams);
    console.log(
      `[EMAIL] Listing created confirmation email sent successfully to ${email}`,
    );
  } catch (error: any) {
    console.error(
      "[EMAIL] Error sending listing created email:",
      error?.message || error,
    );
    console.error("[EMAIL] Error details:", JSON.stringify(error, null, 2));
  }
}
/* =========================================================
   LISTINGS: filters + sort + pagination (server-side)
   вставляти ТІЛЬКИ на верхньому рівні файла (не в функції)
========================================================= */

type SortKey =
  | "newest"
  | "oldest"
  | "price-asc"
  | "price-desc"
  | "year-asc"
  | "year-desc"
  | "mileage-asc"
  | "mileage-desc";

const normalizeText = (str: string) =>
  String(str)
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const slugify = (str: string) =>
  normalizeText(str)
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

const toNumber = (v: unknown) => {
  const n =
    typeof v === "number" ? v : typeof v === "string" ? parseFloat(v) : NaN;
  return Number.isFinite(n) ? n : undefined;
};

const toInt = (v: unknown) => {
  const n =
    typeof v === "number"
      ? Math.trunc(v)
      : typeof v === "string"
        ? parseInt(v, 10)
        : NaN;
  return Number.isFinite(n) ? n : undefined;
};

const toBool = (v: unknown) => v === "true" || v === true;

const parseCsv = (v: unknown) => {
  if (typeof v !== "string") return [];
  return v
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
};

const dateMs = (d: any) => {
  const t = d ? new Date(d).getTime() : 0;
  return Number.isFinite(t) ? t : 0;
};

const normalizeSort = (s: unknown): SortKey => {
  if (typeof s !== "string") return "newest";
  const v = s.trim().toLowerCase();

  const allowed: SortKey[] = [
    "newest",
    "oldest",
    "price-asc",
    "price-desc",
    "year-asc",
    "year-desc",
    "mileage-asc",
    "mileage-desc",
  ];
  return allowed.includes(v as SortKey) ? (v as SortKey) : "newest";
};

const compareBySort = (a: any, b: any, sort: SortKey) => {
  switch (sort) {
    case "price-asc": {
      const ap = toNumber(a.price) ?? Number.POSITIVE_INFINITY;
      const bp = toNumber(b.price) ?? Number.POSITIVE_INFINITY;
      return ap - bp;
    }
    case "price-desc": {
      const ap = toNumber(a.price) ?? 0;
      const bp = toNumber(b.price) ?? 0;
      return bp - ap;
    }
    case "year-asc":
      return (toInt(a.year) ?? 0) - (toInt(b.year) ?? 0);
    case "year-desc":
      return (toInt(b.year) ?? 0) - (toInt(a.year) ?? 0);
    case "mileage-asc":
      return (toInt(a.mileage) ?? 0) - (toInt(b.mileage) ?? 0);
    case "mileage-desc":
      return (toInt(b.mileage) ?? 0) - (toInt(a.mileage) ?? 0);
    case "oldest":
      return dateMs(a.createdAt) - dateMs(b.createdAt);
    case "newest":
    default:
      return dateMs(b.createdAt) - dateMs(a.createdAt);
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);
  app.set("etag", false);
  // Test session save endpoint - comprehensive session diagnostics
  app.get("/api/health/test-session", async (req, res) => {
    const replitDeployment = process.env.REPLIT_DEPLOYMENT;
    const isProduction =
      process.env.NODE_ENV === "production" ||
      !!(replitDeployment && replitDeployment.length > 0);

    try {
      // Set a test value in session
      const testValue = Date.now();
      (req.session as any).testValue = testValue;

      console.log("[test-session] Starting session test");
      console.log("[test-session] isProduction:", isProduction);
      console.log("[test-session] REPLIT_DEPLOYMENT:", replitDeployment);
      console.log("[test-session] Session ID:", req.sessionID);

      req.session.save(async (err) => {
        if (err) {
          console.error("[test-session] Save error:", err);
          return res.json({
            success: false,
            error: err.message,
            sessionId: req.sessionID,
            isProduction,
            replitDeployment: replitDeployment || "not set",
          });
        }

        console.log("[test-session] Session saved successfully");

        // Check if session was saved to database (in production)
        let dbSessionCount = 0;
        let sessionInDb = false;
        if (isProduction && process.env.DATABASE_URL) {
          try {
            const { Pool } = await import("pg");
            const pool = new Pool({
              connectionString: process.env.DATABASE_URL,
              ssl: { rejectUnauthorized: false },
            });
            const countResult = await pool.query(
              "SELECT COUNT(*) FROM session",
            );
            dbSessionCount = parseInt(countResult.rows[0].count);
            const checkResult = await pool.query(
              "SELECT sid FROM session WHERE sid = $1",
              [req.sessionID],
            );
            sessionInDb = checkResult.rows.length > 0;
            await pool.end();
            console.log("[test-session] DB session count:", dbSessionCount);
            console.log("[test-session] Session in DB:", sessionInDb);
          } catch (dbErr: any) {
            console.error("[test-session] DB check error:", dbErr.message);
          }
        }

        res.json({
          success: true,
          sessionId: req.sessionID,
          testValue: testValue,
          isProduction,
          replitDeployment: replitDeployment || "not set",
          storeType: isProduction ? "postgresql" : "memory",
          dbSessionCount,
          sessionInDb,
        });
      });
    } catch (err: any) {
      console.error("[test-session] Error:", err);
      res.json({ success: false, error: err.message });
    }
  });

  // Test email endpoint - sends a test email to verify MailerSend is working
  app.post("/api/health/test-email", async (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    console.log(`[TEST EMAIL] Attempting to send test email to ${email}`);

    const apiKey = process.env.MAILERSEND_API_KEY;
    if (!apiKey) {
      console.log("[TEST EMAIL] MAILERSEND_API_KEY not configured");
      return res
        .status(500)
        .json({ error: "MAILERSEND_API_KEY not configured" });
    }

    try {
      const { MailerSend, EmailParams, Sender, Recipient } =
        await import("mailersend");
      const mailerSend = new MailerSend({ apiKey });
      const senderEmail = process.env.MAILERSEND_FROM_EMAIL || "info@nnauto.cz";
      const sentFrom = new Sender(senderEmail, "NNAuto Test");
      const recipients = [new Recipient(email, email)];

      const emailParams = new EmailParams()
        .setFrom(sentFrom)
        .setTo(recipients)
        .setSubject("NNAuto Test Email - " + new Date().toISOString())
        .setHtml(
          `<h1>Test Email</h1><p>Toto je testovací email z NNAuto.</p><p>Čas: ${new Date().toISOString()}</p>`,
        )
        .setText(
          `Test Email\n\nToto je testovací email z NNAuto.\nČas: ${new Date().toISOString()}`,
        );

      console.log(`[TEST EMAIL] Sending from ${senderEmail} to ${email}...`);
      const response = await mailerSend.email.send(emailParams);
      console.log(`[TEST EMAIL] Response:`, JSON.stringify(response, null, 2));

      res.json({
        success: true,
        message: "Test email sent successfully",
        from: senderEmail,
        to: email,
        response: response,
      });
    } catch (error: any) {
      console.error("[TEST EMAIL] Error:", error?.message || error);
      console.error("[TEST EMAIL] Error body:", error?.body);
      console.error("[TEST EMAIL] Full error:", JSON.stringify(error, null, 2));
      res.status(500).json({
        error: "Failed to send test email",
        details: error?.message || String(error),
        body: error?.body,
      });
    }
  });

  // Health check endpoint for email diagnostics (no auth required)
  app.get("/api/health/email", async (req, res) => {
    const hasApiKey = !!process.env.MAILERSEND_API_KEY;
    const fromEmail = process.env.MAILERSEND_FROM_EMAIL || "info@nnauto.cz";
    const nodeEnv = process.env.NODE_ENV;
    const replitDeployment = process.env.REPLIT_DEPLOYMENT;
    const isProduction =
      nodeEnv === "production" ||
      (replitDeployment && replitDeployment.length > 0);
    const hasSessionFallback =
      process.env.ENABLE_SESSION_HEADER_FALLBACK === "true";
    const hasDbUrl = !!(process.env.DATABASE_URL_POOLED || process.env.PRODUCTION_DATABASE_URL || process.env.DATABASE_URL);

    // Test database connection
    let dbConnected = false;
    let sessionCount = 0;
    try {
      const { pool } = await import("./db");
      dbConnected = true;

      // Check session table (re-use shared pool config)
      const sessResult = await pool.query("SELECT COUNT(*) FROM session");
      sessionCount = parseInt(sessResult.rows[0].count);
    } catch (err: any) {
      console.error("[Health] DB check error:", err.message);
    }

    res.json({
      status: "ok",
      email: {
        configured: hasApiKey,
        fromEmail: fromEmail,
      },
      session: {
        headerFallbackEnabled: hasSessionFallback,
        storeType: isProduction && hasDbUrl ? "postgresql" : "memory",
        currentSessionId: req.sessionID,
        hasUserId: !!req.session.userId,
        sessionCount: sessionCount,
        replitDeployment: replitDeployment || "not set",
      },
      database: {
        connected: dbConnected,
      },
      environment: nodeEnv || "development",
      isProduction: isProduction,
    });
  });

  // Auth endpoints - JWT-based for cross-domain production support
  app.post("/api/register", async (req, res) => {
    try {
      const { turnstileToken, ...userData } = req.body;

      // Verify Turnstile token for bot protection
      if (turnstileToken) {
        const isValid = await verifyTurnstileToken(turnstileToken);
        if (!isValid) {
          return res
            .status(400)
            .json({ error: "Security verification failed. Please try again." });
        }
      } else if (process.env.TURNSTILE_SECRET_KEY) {
        // If Turnstile is configured but no token provided, reject
        return res
          .status(400)
          .json({ error: "Security verification required" });
      }

      const { email, username, password, firstName, lastName, phone } =
        insertUserSchema.parse(userData);

      // Phone is required for registration
      if (!phone || phone.trim() === "") {
        return res.status(400).json({ error: "Phone number is required" });
      }

      // Check if user already exists
      const existingUserByEmail = await storage.getUserByEmail(email);
      if (existingUserByEmail) {
        return res.status(400).json({ error: "Email already registered" });
      }

      const requestedUsername = typeof username === "string" ? username.trim() : "";

      // If username not provided, generate a unique one (DB requires NOT NULL + UNIQUE).
      const makeBaseUsername = (emailValue: string) => {
        const local = (emailValue.split("@")[0] || "user").toLowerCase();
        const cleaned = local.replace(/[^a-z0-9_]+/g, "_").replace(/^_+|_+$/g, "");
        return cleaned || "user";
      };

      const generateUniqueUsername = async (base: string) => {
        // Try base, then base + random suffix until free
        const { randomBytes } = await import("crypto");
        const suffix = () => randomBytes(3).toString("hex"); // 6 chars

        const candidates = [base, `${base}_${suffix()}`, `${base}_${suffix()}`, `${base}_${suffix()}`];
        for (const c of candidates) {
          const exists = await storage.getUserByUsername(c);
          if (!exists) return c;
        }

        // Very low probability fallback
        return `${base}_${Date.now().toString(36)}_${suffix()}`;
      };

      let finalUsername = requestedUsername;
      if (!finalUsername) {
        finalUsername = await generateUniqueUsername(makeBaseUsername(email));
      } else {
        const existingUserByUsername = await storage.getUserByUsername(finalUsername);
        if (existingUserByUsername) {
          return res.status(400).json({ error: "Username already taken" });
        }
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await storage.createUser({
        email,
        username: finalUsername,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
      });

      // Generate JWT token for stateless auth
      const token = signToken({ userId: user.id, email: user.email });
      console.log("[AUTH] Register - JWT token generated for user:", user.id);

      // Also set session for backwards compatibility
      req.session.userId = user.id;
      req.session.save(() => {});

      // Don't send password in response
      const { password: _, ...userWithoutPassword } = user;

      res.json({
        user: userWithoutPassword,
        token, // JWT token for production cross-domain auth
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/login", async (req, res) => {
    try {
      const { turnstileToken, ...loginData } = req.body;

      // Verify Turnstile token for bot protection
      if (turnstileToken) {
        const isValid = await verifyTurnstileToken(turnstileToken);
        if (!isValid) {
          return res
            .status(400)
            .json({ error: "Security verification failed. Please try again." });
        }
      } else if (process.env.TURNSTILE_SECRET_KEY) {
        // If Turnstile is configured but no token provided, reject
        return res
          .status(400)
          .json({ error: "Security verification required" });
      }

      // Validate input with Zod
      const { email, password } = loginSchema.parse(loginData);

      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Check password
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Generate JWT token for stateless auth
      const token = signToken({ userId: user.id, email: user.email });
      console.log("[AUTH] Login - JWT token generated for user:", user.id);

      // Also set session for backwards compatibility
      req.session.userId = user.id;
      req.session.save(() => {});

      // Don't send password in response
      const { password: _, ...userWithoutPassword } = user;

      res.json({
        user: userWithoutPassword,
        token, // JWT token for production cross-domain auth
      });
    } catch (error: any) {
      // Handle Zod validation errors
      if (error.name === "ZodError") {
        return res
          .status(400)
          .json({ error: "Invalid email or password format" });
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/logout", async (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ user: null });
    });
  });

  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      // Find user by email
      const user = await storage.getUserByEmail(email);

      // Always return success to prevent email enumeration
      // If user doesn't exist, we silently fail but still return success
      if (!user) {
        console.log(
          "[INFO] Password reset requested for non-existent email:",
          email,
        );
        // Return success anyway to prevent enumeration
        return res.json({
          success: true,
          message: "If the email exists, password has been sent",
        });
      }

      // Generate cryptographically secure random password (16 characters)
      const crypto = await import("crypto");
      const randomBytes = crypto.randomBytes(12);
      const newPassword = randomBytes
        .toString("base64")
        .slice(0, 16)
        .replace(/[+/=]/g, (c) => {
          return { "+": "A", "/": "B", "=": "C" }[c] || c;
        });

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update user's password in database
      await storage.updateUserPassword(user.id, hashedPassword);

      // Send email with the new plain-text password
      await sendPasswordEmail(email, newPassword);

      console.log("[INFO] Password reset successful for email:", email);
      res.json({
        success: true,
        message: "If the email exists, password has been sent",
      });
    } catch (error: any) {
      console.error("[ERROR] Forgot password error:", error);
      // Return generic error message to avoid leaking information
      res
        .status(500)
        .json({ error: "An error occurred. Please try again later." });
    }
  });

  // Diagnostic endpoint to check email configuration AND test sending
  app.get("/api/debug/email-config", async (req, res) => {
    const apiKey = process.env.MAILERSEND_API_KEY;
    const fromEmail = process.env.MAILERSEND_FROM_EMAIL;

    res.json({
      mailersend_key_exists: !!apiKey,
      mailersend_key_length: apiKey?.length || 0,
      mailersend_key_preview: apiKey
        ? `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`
        : "NOT SET",
      from_email: fromEmail || "NOT SET",
      node_env: process.env.NODE_ENV,
      is_deployment: process.env.REPLIT_DEPLOYMENT === "1",
    });
  });

  // Test email sending with detailed error reporting
  app.post("/api/debug/test-email", async (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email required in body" });
    }

    const apiKey = process.env.MAILERSEND_API_KEY;
    if (!apiKey) {
      return res.json({
        success: false,
        error: "MAILERSEND_API_KEY not configured",
        key_exists: false,
      });
    }

    try {
      const mailerSend = new MailerSend({ apiKey });
      const senderEmail = process.env.MAILERSEND_FROM_EMAIL || "info@nnauto.cz";
      const sentFrom = new Sender(senderEmail, "NNAuto Test");
      const recipients = [new Recipient(email, email)];

      const emailParams = new EmailParams()
        .setFrom(sentFrom)
        .setTo(recipients)
        .setSubject("Test Email - NNAuto")
        .setHtml("<p>Test email from NNAuto</p>")
        .setText("Test email from NNAuto");

      const response = await mailerSend.email.send(emailParams);

      res.json({
        success: true,
        message: "Email sent successfully",
        status: response?.statusCode,
        key_preview: `${apiKey.substring(0, 8)}...`,
        from_email: senderEmail,
      });
    } catch (error: any) {
      res.json({
        success: false,
        error: error?.message || "Unknown error",
        status_code: error?.statusCode || error?.status,
        error_body: error?.body || error?.response?.body,
        key_preview: `${apiKey.substring(0, 8)}...`,
        from_email: process.env.MAILERSEND_FROM_EMAIL || "info@nnauto.cz",
        hint:
          error?.statusCode === 401
            ? "API key is invalid"
            : error?.statusCode === 422
              ? "Sender domain not verified or email invalid"
              : error?.statusCode === 429
                ? "Rate limited"
                : "Check MailerSend dashboard",
      });
    }
  });

  // Email verification endpoints - JWT-based authentication for production
  // SECURITY: Requires valid JWT or session - no anonymous access
  app.post("/api/auth/send-verification-code", async (req, res) => {
    try {
      // DIAGNOSTIC: Log all request details
      const authHeader = req.headers.authorization;
      console.log("[VERIFY-CODE] === REQUEST RECEIVED ===");
      console.log("[VERIFY-CODE] Auth header exists:", !!authHeader);
      console.log(
        "[VERIFY-CODE] Auth header preview:",
        authHeader ? authHeader.substring(0, 30) + "..." : "NONE",
      );
      console.log(
        "[VERIFY-CODE] Session userId:",
        req.session.userId || "NONE",
      );
      console.log(
        "[VERIFY-CODE] MAILERSEND_API_KEY exists:",
        !!process.env.MAILERSEND_API_KEY,
      );
      console.log(
        "[VERIFY-CODE] MAILERSEND_FROM_EMAIL:",
        process.env.MAILERSEND_FROM_EMAIL || "not set",
      );

      // 1. Try JWT from Authorization header (production-safe)
      const token = extractTokenFromHeader(authHeader);
      let user = null;
      let authMethod = "";

      if (token) {
        console.log("[VERIFY-CODE] Token extracted, length:", token.length);
        const payload = verifyToken(token);
        console.log(
          "[VERIFY-CODE] Token payload:",
          payload ? `userId=${payload.userId}` : "INVALID/EXPIRED",
        );
        if (payload?.userId) {
          user = await storage.getUser(payload.userId);
          if (user) {
            authMethod = "JWT";
            console.log(
              "[VERIFY-CODE] Authenticated via JWT, user:",
              user.id,
              user.email,
            );
          } else {
            console.log(
              "[VERIFY-CODE] User not found in DB for userId:",
              payload.userId,
            );
          }
        }
      } else {
        console.log("[VERIFY-CODE] No token extracted from header");
      }

      // 2. Fallback to session (development only)
      if (!user && req.session.userId) {
        user = await storage.getUser(req.session.userId);
        if (user) {
          authMethod = "session";
          console.log(
            "[VERIFY-CODE] Authenticated via session, user:",
            user.id,
            user.email,
          );
        }
      }

      // SECURITY: Reject unauthenticated requests
      if (!user) {
        console.log("[VERIFY-CODE] REJECTED - no valid auth method worked");
        return res
          .status(401)
          .json({ error: "Authentication required. Please log in again." });
      }

      if (user.emailVerified) {
        return res.status(400).json({ error: "Email already verified" });
      }

      // Generate 6-digit verification code
      const crypto = await import("crypto");
      const code = crypto.randomInt(100000, 999999).toString();

      // Code expires in 15 minutes
      const expiry = new Date(Date.now() + 15 * 60 * 1000);

      // Save code to database
      await storage.setVerificationCode(user.id, code, expiry);

      // Send email with code
      console.log(
        `[INFO] send-verification-code: Attempting to send email to ${user.email} via ${authMethod}`,
      );
      let emailSent = false;
      let emailError = "";

      try {
        emailSent = await sendVerificationEmail(user.email, code);
      } catch (err: any) {
        emailError = err?.message || "Unknown email error";
        console.error(
          `[ERROR] send-verification-code: Email exception: ${emailError}`,
        );
      }

      if (!emailSent) {
        console.error(
          `[ERROR] send-verification-code: Failed to send email to ${
            user.email
          }, error: ${emailError || "sendVerificationEmail returned false"}`,
        );
        return res.status(500).json({
          success: false,
          error:
            "Failed to send verification email. Please check your email address and try again.",
        });
      }

      res.json({
        success: true,
        message: "Verification code sent to your email",
        emailSent: true,
      });
    } catch (error: any) {
      console.error("[ERROR] Send verification code error:", error);
      res.status(500).json({ error: "Failed to send verification code" });
    }
  });

  // Email verification - JWT-based authentication
  // SECURITY: Requires valid JWT or session - no anonymous access
  app.post("/api/auth/verify-email", async (req, res) => {
    try {
      const { code } = req.body;
      console.log("[VERIFY-EMAIL] === REQUEST ===");
      console.log("[VERIFY-EMAIL] Submitted code:", code, "type:", typeof code);

      if (!code) {
        return res.status(400).json({ error: "Verification code is required" });
      }

      // 1. Try JWT from Authorization header (production-safe)
      const authHeader = req.headers.authorization;
      console.log("[VERIFY-EMAIL] Auth header exists:", !!authHeader);
      const token = extractTokenFromHeader(authHeader);
      let user = null;
      let authMethod = "";

      if (token) {
        const payload = verifyToken(token);
        console.log(
          "[VERIFY-EMAIL] Token payload:",
          payload ? `userId=${payload.userId}` : "INVALID",
        );
        if (payload?.userId) {
          user = await storage.getUser(payload.userId);
          if (user) {
            authMethod = "JWT";
            console.log("[VERIFY-EMAIL] User found:", user.id, user.email);
            console.log(
              "[VERIFY-EMAIL] Stored code:",
              user.verificationCode,
              "type:",
              typeof user.verificationCode,
            );
            console.log(
              "[VERIFY-EMAIL] Code expiry:",
              user.verificationCodeExpiry,
            );
          } else {
            console.log(
              "[VERIFY-EMAIL] User NOT found for userId:",
              payload.userId,
            );
          }
        }
      } else {
        console.log("[VERIFY-EMAIL] No token extracted");
      }

      // 2. Fallback to session (development only)
      if (!user && req.session.userId) {
        user = await storage.getUser(req.session.userId);
        if (user) {
          authMethod = "session";
          console.log(
            "[VERIFY-EMAIL] Authenticated via session, user:",
            user.id,
          );
          console.log("[VERIFY-EMAIL] Stored code:", user.verificationCode);
        }
      }

      // SECURITY: Reject unauthenticated requests
      if (!user) {
        console.log("[VERIFY-EMAIL] REJECTED - no valid auth");
        return res
          .status(401)
          .json({ error: "Authentication required. Please log in again." });
      }

      if (user.emailVerified) {
        await storage.clearVerificationCode(user.id);
        return res.status(400).json({ error: "Email already verified" });
      }

      if (!user.verificationCode || !user.verificationCodeExpiry) {
        console.log(
          "[VERIFY-EMAIL] No stored code! verificationCode:",
          user.verificationCode,
          "expiry:",
          user.verificationCodeExpiry,
        );
        return res.status(400).json({
          error: "No verification code found. Please request a new code.",
        });
      }

      // SECURITY: Check if code expired
      const expiryDate = new Date(user.verificationCodeExpiry);
      console.log(
        "[VERIFY-EMAIL] Expiry check - expiry:",
        expiryDate,
        "now:",
        new Date(),
        "expired:",
        new Date() > expiryDate,
      );
      if (
        !expiryDate ||
        isNaN(expiryDate.getTime()) ||
        new Date() > expiryDate
      ) {
        await storage.clearVerificationCode(user.id);
        return res.status(400).json({
          error: "Verification code expired. Please request a new code.",
        });
      }

      // Verify code - ensure both are strings and trimmed
      const storedCode = String(user.verificationCode).trim();
      const submittedCode = String(code).trim();
      console.log(
        "[VERIFY-EMAIL] Comparing: stored='${storedCode}' vs submitted='${submittedCode}'",
      );
      console.log("[VERIFY-EMAIL] Match:", storedCode === submittedCode);

      if (storedCode !== submittedCode) {
        console.log("[VERIFY-EMAIL] CODE MISMATCH!");
        return res.status(400).json({ error: "Invalid verification code" });
      }

      // Mark email as verified and clear verification code
      const updatedUser = await storage.verifyUserEmail(user.id);

      console.log("[INFO] Email verified for user:", user.email);
      res.json({ success: true, user: updatedUser });
    } catch (error: any) {
      console.error("[ERROR] Verify email error:", error);
      res.status(500).json({ error: "Failed to verify email" });
    }
  });

  app.post(
    "/api/auth/request-email-change",
    isAuthenticated,
    async (req, res) => {
      try {
        const { newEmail } = req.body;

        if (!newEmail || typeof newEmail !== "string") {
          return res.status(400).json({ error: "New email is required" });
        }

        const user = await storage.getUser(req.session.userId!);
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }

        // Check if new email is already taken
        const existingUser = await storage.getUserByEmail(newEmail);
        if (existingUser && existingUser.id !== user.id) {
          return res
            .status(400)
            .json({ error: "This email is already in use" });
        }

        // Generate 6-digit verification code
        const crypto = await import("crypto");
        const code = crypto.randomInt(100000, 999999).toString();

        // Code expires in 15 minutes
        const expiry = new Date(Date.now() + 15 * 60 * 1000);

        // SECURITY: Save code AND pending email to prevent email hijacking
        // This ensures that confirm-email-change uses stored email, not request body
        await storage.setVerificationCode(user.id, code, expiry, newEmail);

        // Send email with code to NEW email address
        const emailSent = await sendVerificationEmail(newEmail, code);

        console.log(
          "[INFO] Email change code generated for:",
          newEmail,
          "for user:",
          user.email,
          "Email sent:",
          emailSent,
        );

        res.json({
          success: true,
          message: emailSent
            ? "Verification code sent to new email address"
            : "Verification code generated (email service temporarily unavailable)",
          emailSent,
        });
      } catch (error: any) {
        console.error("[ERROR] Request email change error:", error);
        res.status(500).json({ error: "Failed to send verification code" });
      }
    },
  );

  app.post(
    "/api/auth/confirm-email-change",
    isAuthenticated,
    async (req, res) => {
      try {
        const { code } = verifyEmailSchema.parse(req.body);

        const user = await storage.getUser(req.session.userId!);
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }

        if (
          !user.verificationCode ||
          !user.verificationCodeExpiry ||
          !user.pendingEmail
        ) {
          await storage.clearVerificationCode(user.id);
          return res.status(400).json({
            error: "No pending email change found. Please request a new code.",
          });
        }

        // SECURITY: Check if code expired BEFORE verifying (with null guard)
        const expiryDate = new Date(user.verificationCodeExpiry);
        if (
          !expiryDate ||
          isNaN(expiryDate.getTime()) ||
          new Date() > expiryDate
        ) {
          await storage.clearVerificationCode(user.id);
          return res.status(400).json({
            error: "Verification code expired. Please request a new code.",
          });
        }

        // SECURITY: Verify code
        if (user.verificationCode !== code) {
          // Don't clear to allow retry
          return res.status(400).json({ error: "Invalid verification code" });
        }

        // SECURITY: Use stored pendingEmail instead of trusting request body
        const newEmail = user.pendingEmail;

        // Check if new email is still available
        const existingUser = await storage.getUserByEmail(newEmail);
        if (existingUser && existingUser.id !== user.id) {
          await storage.clearVerificationCode(user.id);
          return res
            .status(400)
            .json({ error: "This email is already in use" });
        }

        // Update email and mark as verified, clear verification code
        const updatedUser = await storage.updateUser(user.id, {
          email: newEmail,
        });
        if (updatedUser) {
          await storage.verifyUserEmail(updatedUser.id);
        }

        console.log("[INFO] Email changed from", user.email, "to", newEmail);
        res.json({ success: true, user: updatedUser });
      } catch (error: any) {
        console.error("[ERROR] Confirm email change error:", error);
        // Clear verification code on error
        if (req.session.userId) {
          await storage
            .clearVerificationCode(req.session.userId)
            .catch(() => {});
        }
        res.status(500).json({ error: "Failed to change email" });
      }
    },
  );

  app.get("/api/auth/user", async (req, res) => {
    try {
      // Debug log
      console.log(
        "[DEBUG] /api/auth/user - session.userId:",
        req.session.userId,
      );

      // Try session header fallback if session is not available (Replit webview)
      if (
        !req.session.userId &&
        process.env.ENABLE_SESSION_HEADER_FALLBACK === "true"
      ) {
        const sessionId = req.headers["x-session-id"] as string;
        if (sessionId) {
          console.log(
            "[DEBUG] /api/auth/user - trying X-Session-Id header:",
            sessionId,
          );
          // Load session manually
          const sessionStore = req.sessionStore;
          await new Promise<void>((resolve, reject) => {
            sessionStore.get(sessionId, (err: any, sessionData: any) => {
              if (err || !sessionData) {
                console.log(
                  "[DEBUG] /api/auth/user - session not found in store",
                );
                return resolve();
              }
              // Manually assign session data
              req.session.userId = sessionData.userId;
              console.log(
                "[DEBUG] /api/auth/user - loaded session from header, userId:",
                sessionData.userId,
              );
              resolve();
            });
          });
        }
      }

      // Return null user if not authenticated (instead of 401)
      if (!req.session.userId) {
        return res.json({ user: null });
      }

      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.json({ user: null });
      }

      // Don't send password in response
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error: any) {
      // Return null user on any error to avoid crashing the UI
      res.json({ user: null });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const userId = req.params.id;
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Only return public contact information (email and phone for contact purposes)
      // Don't send password, username, admin status, verification data, or other sensitive information
      const publicContactData = {
        id: user.id,
        email: user.email,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
      };
      res.json(publicContactData);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/users/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.params.id;

      // Verify the user can only update their own profile
      if (userId !== req.session.userId) {
        return res
          .status(403)
          .json({ error: "Cannot update another user's profile" });
      }

      const updateData = updateUserSchema.parse(req.body);

      // Check if email is being changed and if it's already taken
      if (updateData.email) {
        const existingUser = await storage.getUserByEmail(updateData.email);
        if (existingUser && existingUser.id !== userId) {
          return res.status(400).json({ error: "Email already in use" });
        }
      }

      // Check if username is being changed and if it's already taken
      if (updateData.username) {
        const existingUser = await storage.getUserByUsername(
          updateData.username,
        );
        if (existingUser && existingUser.id !== userId) {
          return res.status(400).json({ error: "Username already taken" });
        }
      }

      const updatedUser = await storage.updateUser(userId, updateData);
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      // Don't send password in response
      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json({ user: userWithoutPassword });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post(
    "/api/users/:id/change-password",
    isAuthenticated,
    async (req, res) => {
      try {
        const userId = req.params.id;

        // Verify the user can only change their own password
        if (userId !== req.session.userId) {
          return res
            .status(403)
            .json({ error: "Cannot change another user's password" });
        }

        const { currentPassword, newPassword } = changePasswordSchema.parse(
          req.body,
        );

        // Get current user
        const user = await storage.getUser(userId);
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }

        // Verify current password
        const isValidPassword = await bcrypt.compare(
          currentPassword,
          user.password,
        );
        if (!isValidPassword) {
          return res
            .status(401)
            .json({ error: "Current password is incorrect" });
        }

        // Check if new password is same as current
        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        if (isSamePassword) {
          return res.status(400).json({
            error: "New password must be different from current password",
          });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        await storage.updateUserPassword(userId, hashedPassword);

        // Invalidate session
        req.session.destroy((err) => {
          if (err) {
            return res
              .status(500)
              .json({ error: "Failed to log out after password change" });
          }
          res.json({
            message: "Password changed successfully. Please log in again.",
          });
        });
      } catch (error: any) {
        res.status(400).json({ error: error.message });
      }
    },
  );

  app.delete("/api/users/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.params.id;

      // Verify the user can only delete their own account
      if (userId !== req.session.userId) {
        return res
          .status(403)
          .json({ error: "Cannot delete another user's account" });
      }

      // Delete user (this will also delete their listings due to cascade in storage)
      const deleted = await storage.deleteUser(userId);
      if (!deleted) {
        return res.status(404).json({ error: "User not found" });
      }

      // Invalidate session
      req.session.destroy((err) => {
        if (err) {
          return res
            .status(500)
            .json({ error: "Failed to log out after account deletion" });
        }
        res.json({ message: "Account deleted successfully" });
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Listings endpoints
  app.post("/api/listings", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertListingSchema.parse(req.body);

      // Verify the userId in the request matches the authenticated session user
      if (validatedData.userId !== req.session.userId) {
        return res
          .status(403)
          .json({ error: "Cannot create listing for another user" });
      }

      const listing = await storage.createListing(validatedData);

      // Send listing created confirmation email
      try {
        const user = await storage.getUser(req.session.userId!);
        if (user?.email) {
          const listingDetails = {
            brand: listing.brand,
            model: listing.model,
            year: listing.year,
            price: listing.price,
            id: listing.id,
          };
          await sendListingCreatedEmail(
            user.email,
            listingDetails,
            listing.isTopListing || false,
          );
        }
      } catch (emailError) {
        console.error("Error sending listing created email:", emailError);
        // Don't fail the request if email fails
      }

      res.json(listing);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Update listing
  app.put("/api/listings/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;

      // Get existing listing to verify ownership
      const existingListing = await storage.getListing(id);
      if (!existingListing) {
        return res.status(404).json({ error: "Listing not found" });
      }

      // Verify user owns this listing
      if (existingListing.userId !== req.session.userId) {
        return res
          .status(403)
          .json({ error: "Cannot update another user's listing" });
      }

      const updatedListing = await storage.updateListing(id, req.body);
      res.json(updatedListing);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Delete listing
  app.delete("/api/listings/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;

      // Get existing listing to verify ownership
      const existingListing = await storage.getListing(id);
      if (!existingListing) {
        return res.status(404).json({ error: "Listing not found" });
      }

      // Verify user owns this listing
      if (existingListing.userId !== req.session.userId) {
        return res
          .status(403)
          .json({ error: "Cannot delete another user's listing" });
      }

      const deleted = await storage.deleteListing(id);
      if (deleted) {
        res.json({ message: "Listing deleted successfully" });
      } else {
        res.status(404).json({ error: "Listing not found" });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create Stripe checkout session for TOP listing promotion
  app.post("/api/listings/:id/checkout", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;

      // Get Stripe client from Replit connection
      let stripe: Stripe;
      try {
        stripe = await getUncachableStripeClient();
      } catch (error) {
        console.error("Stripe not configured:", error);
        return res.status(503).json({ error: "Payment system not configured" });
      }

      // Get the listing to verify ownership
      const listing = await storage.getListing(id);
      if (!listing) {
        return res.status(404).json({ error: "Listing not found" });
      }

      // Verify user owns this listing
      if (listing.userId !== req.session.userId) {
        return res
          .status(403)
          .json({ error: "Cannot promote another user's listing" });
      }

      // Check if already TOP
      if (listing.isTopListing) {
        return res
          .status(400)
          .json({ error: "Listing is already a TOP listing" });
      }

      // Get base URL for redirects - prioritize production URL, then request origin
      const getBaseUrl = (req: Request): string => {
        // 1. Use dedicated app URL if configured
        if (process.env.APP_BASE_URL) {
          return process.env.APP_BASE_URL;
        }
        // 2. Use request origin header if available
        const origin = req.get("origin");
        if (origin) {
          return origin;
        }
        // 3. Construct from host header
        const host = req.get("host");
        if (host) {
          const protocol =
            req.secure || req.get("x-forwarded-proto") === "https"
              ? "https"
              : "http";
          return `${protocol}://${host}`;
        }
        // 4. Fallback to localhost for local dev
        return "http://localhost:5000";
      };
      const baseUrl = getBaseUrl(req);

      // Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "czk",
              product_data: {
                name: "TOP Inzerát",
                description: `Zvýraznění inzerátu: ${listing.brand} ${listing.model}`,
              },
              unit_amount: TOP_LISTING_PRICE,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${baseUrl}/listings?userId=${req.session.userId}&promoted=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/listings?userId=${req.session.userId}&promoted=cancelled`,
        metadata: {
          listingId: id,
          userId: req.session.userId!,
          type: "promote_listing",
        },
      });

      res.json({ url: session.url, sessionId: session.id });
    } catch (error: any) {
      console.error("Stripe checkout error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // In-memory store for pending TOP listings, keyed by Stripe session ID
  // In production, this should use Redis or a database table for persistence across server restarts
  const pendingTopListings = new Map<
    string,
    { userId: string; listingData: any; createdAt: number }
  >();

  // Cleanup expired pending listings (older than 1 hour)
  setInterval(
    () => {
      const oneHourAgo = Date.now() - 60 * 60 * 1000;
      const entriesToDelete: string[] = [];
      pendingTopListings.forEach((data, sessionId) => {
        if (data.createdAt < oneHourAgo) {
          entriesToDelete.push(sessionId);
        }
      });
      entriesToDelete.forEach((sessionId) =>
        pendingTopListings.delete(sessionId),
      );
    },
    15 * 60 * 1000,
  ); // Run every 15 minutes

  // Create Stripe checkout session for new TOP listing (during listing creation)
  app.post(
    "/api/checkout/new-top-listing",
    isAuthenticated,
    async (req, res) => {
      try {
        const listingData = req.body;

        // Validate listing data with schema (omitting auto-generated fields)
        const validationResult = insertListingSchema.safeParse({
          ...listingData,
          userId: req.session.userId,
        });

        if (!validationResult.success) {
          console.error(
            "Listing validation failed:",
            validationResult.error.errors,
          );
          return res.status(400).json({
            error: "Invalid listing data",
            details: validationResult.error.errors,
          });
        }

        // Get Stripe client
        let stripe: Stripe;
        try {
          stripe = await getUncachableStripeClient();
        } catch (error) {
          console.error("Stripe not configured:", error);
          return res
            .status(503)
            .json({ error: "Payment system not configured" });
        }

        // Get base URL for redirects - prioritize production URL, then request origin
        const getBaseUrl = (req: Request): string => {
          // 1. Use dedicated app URL if configured
          if (process.env.APP_BASE_URL) {
            return process.env.APP_BASE_URL;
          }
          // 2. Use request origin header if available
          const origin = req.get("origin");
          if (origin) {
            return origin;
          }
          // 3. Construct from host header
          const host = req.get("host");
          if (host) {
            const protocol =
              req.secure || req.get("x-forwarded-proto") === "https"
                ? "https"
                : "http";
            return `${protocol}://${host}`;
          }
          // 4. Fallback to localhost for local dev
          return "http://localhost:5000";
        };
        const baseUrl = getBaseUrl(req);

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: [
            {
              price_data: {
                currency: "czk",
                product_data: {
                  name: "TOP Inzerát",
                  description: `Zvýraznění inzerátu: ${validationResult.data.brand} ${validationResult.data.model}`,
                },
                unit_amount: TOP_LISTING_PRICE,
              },
              quantity: 1,
            },
          ],
          mode: "payment",
          success_url: `${baseUrl}/add-listing?payment=success&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${baseUrl}/add-listing?payment=cancelled`,
          metadata: {
            userId: req.session.userId!,
            type: "new_top_listing",
          },
        });

        // Store validated listing data keyed by Stripe session ID
        pendingTopListings.set(session.id, {
          userId: req.session.userId!,
          listingData: validationResult.data,
          createdAt: Date.now(),
        });

        res.json({ url: session.url, sessionId: session.id });
      } catch (error: any) {
        console.error("TOP listing checkout error:", error);
        res.status(500).json({ error: error.message });
      }
    },
  );

  // Create listing after successful TOP payment
  app.post(
    "/api/checkout/complete-top-listing",
    isAuthenticated,
    async (req, res) => {
      try {
        const { stripeSessionId } = req.body;

        if (!stripeSessionId || typeof stripeSessionId !== "string") {
          return res.status(400).json({ error: "Invalid session ID" });
        }

        // Get pending listing data from server-side store
        const pendingData = pendingTopListings.get(stripeSessionId);

        if (!pendingData) {
          return res.status(400).json({
            error:
              "No pending listing found for this session. It may have expired or already been used.",
          });
        }

        // Verify the pending listing belongs to the current user
        if (pendingData.userId !== req.session.userId) {
          return res
            .status(403)
            .json({ error: "This session belongs to a different user" });
        }

        // Verify the Stripe session was successful
        let stripe: Stripe;
        try {
          stripe = await getUncachableStripeClient();
        } catch (error) {
          console.error("Stripe not configured:", error);
          return res
            .status(503)
            .json({ error: "Payment system not configured" });
        }

        // Verify payment with Stripe
        let session: Stripe.Checkout.Session;
        try {
          session = await stripe.checkout.sessions.retrieve(stripeSessionId);
          if (session.payment_status !== "paid") {
            return res.status(400).json({
              error: "Payment not completed. Please complete payment first.",
            });
          }

          // Verify the Stripe session metadata matches
          if (session.metadata?.userId !== req.session.userId) {
            return res.status(403).json({ error: "Session user mismatch" });
          }
        } catch (err) {
          console.error("Error verifying Stripe session:", err);
          return res.status(400).json({
            error: "Could not verify payment. Please contact support.",
          });
        }

        // Delete the pending listing BEFORE creating to prevent replay attacks
        pendingTopListings.delete(stripeSessionId);

        // Create the listing with isTopListing: true
        const listing = await storage.createListing({
          ...pendingData.listingData,
          isTopListing: true,
        });

        // Create payment record
        await storage.createPayment({
          userId: req.session.userId || "",
          listingId: listing.id,
          amount: TOP_LISTING_PRICE.toString(),
          currency: "czk",
          status: "completed",
          stripeSessionId: stripeSessionId,
          stripePaymentIntentId: (session.payment_intent as string) || null,
        });

        console.log(
          `TOP listing ${listing.id} created after successful payment (session: ${stripeSessionId})`,
        );

        // Send confirmation emails
        try {
          const user = await storage.getUser(req.session.userId!);
          if (user?.email) {
            const listingDetails = {
              brand: listing.brand,
              model: listing.model,
              year: listing.year,
              price: listing.price,
              id: listing.id,
            };
            // Send both emails - payment confirmation and listing created
            await Promise.all([
              sendTopPaymentConfirmationEmail(
                user.email,
                listingDetails,
                TOP_LISTING_PRICE,
              ),
              sendListingCreatedEmail(user.email, listingDetails, true),
            ]);
          }
        } catch (emailError) {
          console.error("Error sending confirmation emails:", emailError);
          // Don't fail the request if email fails
        }

        res.json(listing);
      } catch (error: any) {
        console.error("Error completing TOP listing:", error);
        res.status(500).json({ error: error.message });
      }
    },
  );

  // Complete listing promotion after successful Stripe payment
  app.post(
    "/api/checkout/complete-promotion",
    isAuthenticated,
    async (req, res) => {
      try {
        const { stripeSessionId } = req.body;

        if (!stripeSessionId || typeof stripeSessionId !== "string") {
          return res.status(400).json({ error: "Invalid session ID" });
        }

        // Get Stripe client
        let stripe: Stripe;
        try {
          stripe = await getUncachableStripeClient();
        } catch (error) {
          console.error("Stripe not configured:", error);
          return res
            .status(503)
            .json({ error: "Payment system not configured" });
        }

        // Verify payment with Stripe
        let session: Stripe.Checkout.Session;
        try {
          session = await stripe.checkout.sessions.retrieve(stripeSessionId);

          // Verify session is complete
          if (session.status !== "complete") {
            return res.status(400).json({
              error:
                "Checkout session not complete. Please complete payment first.",
            });
          }

          // Verify payment status
          if (session.payment_status !== "paid") {
            return res.status(400).json({
              error: "Payment not completed. Please complete payment first.",
            });
          }

          // Verify the session type is for promotion
          if (session.metadata?.type !== "promote_listing") {
            return res.status(400).json({ error: "Invalid session type" });
          }

          // Verify the amount matches expected TOP listing price
          if (session.amount_total !== TOP_LISTING_PRICE) {
            console.error(
              `Amount mismatch: expected ${TOP_LISTING_PRICE}, got ${session.amount_total}`,
            );
            return res.status(400).json({ error: "Invalid payment amount" });
          }

          // Verify the Stripe session metadata matches current user
          if (session.metadata?.userId !== req.session.userId) {
            return res.status(403).json({ error: "Session user mismatch" });
          }
        } catch (err) {
          console.error("Error verifying Stripe session:", err);
          return res.status(400).json({
            error: "Could not verify payment. Please contact support.",
          });
        }

        const listingId = session.metadata?.listingId;
        if (!listingId) {
          return res.status(400).json({ error: "No listing ID in session" });
        }

        // Get the listing
        const listing = await storage.getListing(listingId);
        if (!listing) {
          return res.status(404).json({ error: "Listing not found" });
        }

        // Verify user owns this listing
        if (listing.userId !== req.session.userId) {
          return res
            .status(403)
            .json({ error: "Cannot promote another user's listing" });
        }

        // Check if already TOP (might have been processed by webhook or previous call)
        if (listing.isTopListing) {
          console.log(`Listing ${listingId} already TOP - returning success`);
          return res.json(listing);
        }

        // Promote the listing to TOP
        const updatedListing = await storage.updateListing(listingId, {
          isTopListing: true,
        });

        // Create payment record
        await storage.createPayment({
          userId: req.session.userId || "",
          listingId: listingId,
          amount: (session.amount_total || TOP_LISTING_PRICE).toString(),
          currency: session.currency || "czk",
          status: "completed",
          stripeSessionId: stripeSessionId,
          stripePaymentIntentId: (session.payment_intent as string) || null,
        });

        console.log(
          `Listing ${listingId} promoted to TOP after successful payment (session: ${stripeSessionId})`,
        );

        // Send payment confirmation email
        try {
          const user = await storage.getUser(req.session.userId!);
          if (user?.email && listing) {
            const listingDetails = {
              brand: listing.brand,
              model: listing.model,
              year: listing.year,
              price: listing.price,
              id: listing.id,
            };
            await sendTopPaymentConfirmationEmail(
              user.email,
              listingDetails,
              session.amount_total || TOP_LISTING_PRICE,
            );
          }
        } catch (emailError) {
          console.error(
            "Error sending TOP payment confirmation email:",
            emailError,
          );
          // Don't fail the request if email fails
        }

        res.json(updatedListing);
      } catch (error: any) {
        console.error("Error completing promotion:", error);
        res.status(500).json({ error: error.message });
      }
    },
  );

  // Stripe webhook to handle successful payments
  app.post("/api/stripe/webhook", async (req: Request, res: Response) => {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    // Get Stripe client
    let stripe: Stripe;
    try {
      stripe = await getUncachableStripeClient();
    } catch (error) {
      console.error("Stripe not configured:", error);
      return res.status(503).json({ error: "Payment system not configured" });
    }

    let event: Stripe.Event;

    try {
      if (webhookSecret) {
        // Verify webhook signature using rawBody
        const sig = req.headers["stripe-signature"] as string;
        const rawBody = (req as any).rawBody;
        if (!rawBody) {
          throw new Error("Raw body not available for webhook verification");
        }
        event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
      } else {
        // For development without webhook secret
        event = req.body as Stripe.Event;
      }
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }

    // Handle the checkout.session.completed event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const listingId = session.metadata?.listingId;
      const userId = session.metadata?.userId;

      // 1) Cebia payment (Payment Link or Checkout Session)
      try {
        if (session.payment_status === "paid") {
          const reportId =
            (session.client_reference_id as string | null) ||
            (session.metadata?.reportId as string | undefined) ||
            undefined;

          if (reportId) {
            const report = await storage.getCebiaReportById(reportId);
            if (report) {
              const paid = await storage.updateCebiaReport(report.id, {
                status: "paid",
                stripeSessionId: session.id,
                stripePaymentIntentId:
                  (session.payment_intent as string) || report.stripePaymentIntentId,
                priceCents: typeof session.amount_total === "number" ? session.amount_total : report.priceCents,
                currency: (session.currency || report.currency || "CZK").toUpperCase(),
                rawResponse: mergeRawResponse(report.rawResponse, {
                  stripeSession: session as any,
                  customerEmail: (session.customer_details?.email as string | undefined) || "",
                }),
              });
              console.log(
                `[CEBIA] Report ${report.id} marked as paid (session ${session.id})`,
              );

              // Auto-start Cebia generation after payment (do not block webhook response)
              const current = paid || report;
              if (
                CEBIA_ENABLED &&
                CEBIA_AUTO_REQUEST_ON_PAID &&
                current.status === "paid" &&
                !current.cebiaQueueId
              ) {
                (async () => {
                  try {
                    const createResp = await cebiaCreatePdfQueue(current.vin);
                    if (!createResp?.queueId || createResp.queueStatus === 6) return;
                    await storage.updateCebiaReport(current.id, {
                      status: "requested",
                      cebiaQueueId: createResp.queueId,
                      cebiaQueueStatus: createResp.queueStatus ?? null,
                      rawResponse: mergeRawResponse(current.rawResponse, {
                        cebiaCreatePdfQueue: createResp as any,
                      }),
                    });
                    console.log(`[CEBIA] Auto-request started for ${current.id}`);
                  } catch (e) {
                    console.error("[CEBIA] Auto-request failed:", e);
                  }
                })();
              }
            }
          }
        }
      } catch (e) {
        console.error("[CEBIA] Failed to mark report paid from webhook:", e);
      }

      if (listingId) {
        try {
          // Get the listing before promotion
          const listing = await storage.getListing(listingId);

          // Promote the listing to TOP
          await storage.updateListing(listingId, { isTopListing: true });

          // Create payment record
          await storage.createPayment({
            userId: userId || "",
            listingId: listingId,
            amount: (session.amount_total || TOP_LISTING_PRICE).toString(),
            currency: session.currency || "czk",
            status: "completed",
            stripeSessionId: session.id,
            stripePaymentIntentId: (session.payment_intent as string) || null,
          });

          console.log(
            `Listing ${listingId} promoted to TOP after successful payment`,
          );

          // Send payment confirmation email
          if (listing && userId) {
            try {
              const user = await storage.getUser(userId);
              if (user?.email) {
                const listingDetails = {
                  brand: listing.brand,
                  model: listing.model,
                  year: listing.year,
                  price: listing.price,
                  id: listing.id,
                };
                await sendTopPaymentConfirmationEmail(
                  user.email,
                  listingDetails,
                  session.amount_total || TOP_LISTING_PRICE,
                );
              }
            } catch (emailError) {
              console.error(
                "Error sending TOP payment confirmation email:",
                emailError,
              );
            }
          }
        } catch (error) {
          console.error("Error processing successful payment:", error);
        }
      }
    }

    res.json({ received: true });
  });

  // Get Stripe publishable key for frontend
  app.get("/api/stripe/config", async (req, res) => {
    try {
      const publishableKey = await getStripePublishableKey();
      res.json({ publishableKey });
    } catch (error: any) {
      console.error("Error getting Stripe config:", error);
      res.status(503).json({ error: "Payment system not configured" });
    }
  });

  // Public Cebia config for frontend gating
  app.get("/api/cebia/config", async (_req, res) => {
    res.json({
      enabled: CEBIA_ENABLED,
      paymentsFrozen: CEBIA_PAYMENTS_FROZEN,
      autoRequestOnPaid: CEBIA_AUTO_REQUEST_ON_PAID,
      priceCents: CEBIA_REPORT_PRICE_CENTS,
      currency: "CZK",
    });
  });

  // ---------------- CEBIA (Autotracer) - paid VIN report ----------------
  app.post("/api/cebia/checkout", isAuthenticated, async (req, res) => {
    try {
      if (CEBIA_PAYMENTS_FROZEN) {
        return res.status(503).json({ error: "Payments are temporarily disabled" });
      }
      if (!CEBIA_REPORT_PRICE_CENTS || !Number.isFinite(CEBIA_REPORT_PRICE_CENTS)) {
        return res.status(503).json({ error: "Cebia pricing not configured" });
      }

      const vinRaw = typeof req.body?.vin === "string" ? req.body.vin : "";
      const vin = vinRaw.trim().toUpperCase();
      const listingId = typeof req.body?.listingId === "string" ? req.body.listingId : undefined;

      if (!vin || vin.length !== 17) {
        return res.status(400).json({ error: "VIN must be 17 characters" });
      }

      // Optional: quick VIN validation via Cebia before charging (only when enabled)
      if (CEBIA_ENABLED) {
        try {
          await cebiaVinCheck(vin);
        } catch (e) {
          console.warn("[CEBIA] VIN check failed (continuing to checkout):", e);
        }
      }

      let stripe: Stripe;
      try {
        stripe = await getUncachableStripeClient();
      } catch (error) {
        console.error("Stripe not configured:", error);
        return res.status(503).json({ error: "Payment system not configured" });
      }

      const getBaseUrl = (req: Request): string => {
        if (process.env.APP_BASE_URL) return process.env.APP_BASE_URL;
        const origin = req.get("origin");
        if (origin) return origin;
        const host = req.get("host");
        if (host) {
          const protocol =
            req.secure || req.get("x-forwarded-proto") === "https" ? "https" : "http";
          return `${protocol}://${host}`;
        }
        return "http://localhost:5000";
      };
      const baseUrl = getBaseUrl(req);

      const successPath = listingId ? `/listing/${listingId}` : `/profile`;
      const cancelPath = listingId ? `/listing/${listingId}` : `/profile`;

      const report = await storage.createCebiaReport({
        userId: req.session.userId!,
        listingId: listingId || null,
        vin,
        product: "pdf_autotracer",
        status: "created",
        priceCents: CEBIA_REPORT_PRICE_CENTS,
        currency: "CZK",
        stripeSessionId: null,
        stripePaymentIntentId: null,
        cebiaQueueId: null,
        cebiaQueueStatus: null,
        cebiaCouponNumber: null,
        cebiaReportUrl: null,
        pdfBase64: null,
        rawResponse: null,
      });

      // Prefer Stripe Payment Link if configured
      if (CEBIA_STRIPE_PAYMENT_LINK_URL) {
        const u = new URL(CEBIA_STRIPE_PAYMENT_LINK_URL);
        u.searchParams.set("client_reference_id", report.id);
        // Optional, helps customer autofill email in Checkout
        const user = await storage.getUser(req.session.userId!);
        if (user?.email) u.searchParams.set("prefilled_email", user.email);
        // When you configure the Payment Link's success redirect in Stripe,
        // keep this param so we can show a nicer "payment received" screen later.
        u.searchParams.set("nnauto_report_id", report.id);
        return res.json({ url: u.toString(), reportId: report.id });
      }

      // Fallback to dynamic Checkout Session (kept for compatibility)
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "czk",
              product_data: {
                name: "Cebia Autotracer (PDF) — prověření VIN",
                description: `VIN: ${vin}`,
              },
              unit_amount: CEBIA_REPORT_PRICE_CENTS,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${baseUrl}${successPath}?cebia=success&session_id={CHECKOUT_SESSION_ID}&report_id=${encodeURIComponent(
          report.id,
        )}`,
        cancel_url: `${baseUrl}${cancelPath}?cebia=cancelled`,
        metadata: {
          type: "cebia_pdf_autotracer",
          userId: req.session.userId!,
          vin,
          listingId: listingId || "",
          reportId: report.id,
        },
      });

      await storage.updateCebiaReport(report.id, {
        stripeSessionId: session.id,
        stripePaymentIntentId: (session.payment_intent as string) || null,
      });

      res.json({ url: session.url, sessionId: session.id, reportId: report.id });
    } catch (error: any) {
      console.error("Cebia checkout error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Guest checkout (no registration required)
  app.post("/api/cebia/guest/checkout", async (req, res) => {
    try {
      if (CEBIA_PAYMENTS_FROZEN) {
        return res.status(503).json({ error: "Payments are temporarily disabled" });
      }
      if (!CEBIA_REPORT_PRICE_CENTS || !Number.isFinite(CEBIA_REPORT_PRICE_CENTS)) {
        return res.status(503).json({ error: "Cebia pricing not configured" });
      }

      const vinRaw = typeof req.body?.vin === "string" ? req.body.vin : "";
      const vin = vinRaw.trim().toUpperCase();
      const listingId = typeof req.body?.listingId === "string" ? req.body.listingId : undefined;

      if (!vin || vin.length !== 17) {
        return res.status(400).json({ error: "VIN must be 17 characters" });
      }

      // Optional: quick VIN validation via Cebia before charging (only when enabled)
      if (CEBIA_ENABLED) {
        try {
          await cebiaVinCheck(vin);
        } catch (e) {
          console.warn("[CEBIA] VIN check failed (continuing to checkout):", e);
        }
      }

      let stripe: Stripe;
      try {
        stripe = await getUncachableStripeClient();
      } catch (error) {
        console.error("Stripe not configured:", error);
        return res.status(503).json({ error: "Payment system not configured" });
      }

      const { randomBytes } = await import("crypto");
      const guestToken = randomBytes(24).toString("base64url");

      const report = await storage.createCebiaReport({
        userId: `guest:${guestToken}`,
        listingId: listingId || null,
        vin,
        product: "pdf_autotracer",
        status: "created",
        priceCents: CEBIA_REPORT_PRICE_CENTS,
        currency: "CZK",
        stripeSessionId: null,
        stripePaymentIntentId: null,
        cebiaQueueId: null,
        cebiaQueueStatus: null,
        cebiaCouponNumber: null,
        cebiaReportUrl: null,
        pdfBase64: null,
        rawResponse: { guestToken },
      });

      if (CEBIA_STRIPE_PAYMENT_LINK_URL) {
        const u = new URL(CEBIA_STRIPE_PAYMENT_LINK_URL);
        u.searchParams.set("client_reference_id", report.id);
        u.searchParams.set("nnauto_report_id", report.id);
        return res.json({ url: u.toString(), reportId: report.id, guestToken });
      }

      // Fallback to dynamic Checkout Session
      const getBaseUrl = (req: Request): string => {
        if (process.env.APP_BASE_URL) return process.env.APP_BASE_URL;
        const origin = req.get("origin");
        if (origin) return origin;
        const host = req.get("host");
        if (host) {
          const protocol =
            req.secure || req.get("x-forwarded-proto") === "https" ? "https" : "http";
          return `${protocol}://${host}`;
        }
        return "http://localhost:5000";
      };
      const baseUrl = getBaseUrl(req);
      const successPath = listingId ? `/listing/${listingId}` : `/`;
      const cancelPath = listingId ? `/listing/${listingId}` : `/`;

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "czk",
              product_data: {
                name: "Cebia Autotracer (PDF) — prověření VIN",
                description: `VIN: ${vin}`,
              },
              unit_amount: CEBIA_REPORT_PRICE_CENTS,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${baseUrl}${successPath}?cebia=success&session_id={CHECKOUT_SESSION_ID}&report_id=${encodeURIComponent(
          report.id,
        )}`,
        cancel_url: `${baseUrl}${cancelPath}?cebia=cancelled`,
        client_reference_id: report.id,
        metadata: {
          type: "cebia_pdf_autotracer",
          vin,
          listingId: listingId || "",
          reportId: report.id,
        },
      });

      await storage.updateCebiaReport(report.id, {
        stripeSessionId: session.id,
        stripePaymentIntentId: (session.payment_intent as string) || null,
        rawResponse: mergeRawResponse(report.rawResponse, { stripeSessionId: session.id }),
      });

      res.json({
        url: session.url,
        sessionId: session.id,
        reportId: report.id,
        guestToken,
      });
    } catch (error: any) {
      console.error("Cebia guest checkout error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/cebia/complete", isAuthenticated, async (req, res) => {
    try {
      const stripeSessionId =
        typeof req.body?.stripeSessionId === "string" ? req.body.stripeSessionId : "";
      if (!stripeSessionId) return res.status(400).json({ error: "stripeSessionId required" });

      const report = await storage.getCebiaReportByStripeSessionId(stripeSessionId);
      if (!report) return res.status(404).json({ error: "Cebia order not found" });
      if (report.userId !== req.session.userId) return res.status(403).json({ error: "Forbidden" });

      let stripe: Stripe;
      try {
        stripe = await getUncachableStripeClient();
      } catch (error) {
        console.error("Stripe not configured:", error);
        return res.status(503).json({ error: "Payment system not configured" });
      }

      const session = await stripe.checkout.sessions.retrieve(stripeSessionId);
      if (session.payment_status !== "paid") {
        return res.status(400).json({ error: "Payment not completed" });
      }

      if (session.metadata?.userId && session.metadata.userId !== req.session.userId) {
        return res.status(403).json({ error: "Session user mismatch" });
      }

      const updated = await storage.updateCebiaReport(report.id, {
        status: "paid",
        stripePaymentIntentId: (session.payment_intent as string) || report.stripePaymentIntentId,
      });

      res.json({ report: updated || report });
    } catch (error: any) {
      console.error("Cebia complete error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/cebia/reports", isAuthenticated, async (req, res) => {
    try {
      const reports = await storage.getCebiaReportsByUserId(req.session.userId!);
      // Do not send PDF payloads in list endpoint
      const slim = reports.map(({ pdfBase64, rawResponse, ...rest }) => rest);
      res.json(slim);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/cebia/reports/:id", isAuthenticated, async (req, res) => {
    try {
      const report = await storage.getCebiaReportById(req.params.id);
      if (!report) return res.status(404).json({ error: "Not found" });
      if (report.userId !== req.session.userId) return res.status(403).json({ error: "Forbidden" });

      const { pdfBase64, ...rest } = report;
      res.json({ ...rest, hasPdf: !!pdfBase64 });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/cebia/reports/:id/request", isAuthenticated, async (req, res) => {
    try {
      if (!CEBIA_ENABLED) {
        return res.status(503).json({ error: "Cebia is temporarily disabled" });
      }
      const report = await storage.getCebiaReportById(req.params.id);
      if (!report) return res.status(404).json({ error: "Not found" });
      if (report.userId !== req.session.userId) return res.status(403).json({ error: "Forbidden" });
      if (report.status !== "paid" && report.status !== "requested" && report.status !== "ready") {
        return res.status(400).json({ error: "Report not paid" });
      }
      if (report.status === "ready" && report.pdfBase64) {
        return res.json({ status: "ready" });
      }

      const createResp = await cebiaCreatePdfQueue(report.vin);
      if (!createResp?.queueId || createResp.queueStatus === 6) {
        await storage.updateCebiaReport(report.id, {
          status: "failed",
          rawResponse: mergeRawResponse(report.rawResponse, { cebiaCreatePdfQueue: createResp as any }),
        });
        return res.status(400).json({ error: createResp?.message || "Cebia request failed" });
      }

      const updated = await storage.updateCebiaReport(report.id, {
        status: "requested",
        cebiaQueueId: createResp.queueId,
        cebiaQueueStatus: createResp.queueStatus ?? null,
        rawResponse: mergeRawResponse(report.rawResponse, { cebiaCreatePdfQueue: createResp as any }),
      });

      res.json({ report: updated || report });
    } catch (error: any) {
      console.error("Cebia request error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/cebia/reports/:id/poll", isAuthenticated, async (req, res) => {
    try {
      if (!CEBIA_ENABLED) {
        return res.status(503).json({ error: "Cebia is temporarily disabled" });
      }
      const report = await storage.getCebiaReportById(req.params.id);
      if (!report) return res.status(404).json({ error: "Not found" });
      if (report.userId !== req.session.userId) return res.status(403).json({ error: "Forbidden" });
      if (!report.cebiaQueueId) return res.status(400).json({ error: "No queueId yet" });
      if (report.status === "ready" && report.pdfBase64) {
        return res.json({ status: "ready" });
      }

      const pdfResp = await cebiaGetPdfData(report.cebiaQueueId);
      const queueStatus = pdfResp.queueStatus;

      if (queueStatus === 3 && pdfResp.pdfData) {
        const updated = await storage.updateCebiaReport(report.id, {
          status: "ready",
          cebiaQueueStatus: queueStatus,
          cebiaCouponNumber: pdfResp.couponNumber ?? null,
          cebiaReportUrl: pdfResp.reportUrl ?? null,
          pdfBase64: pdfResp.pdfData,
          rawResponse: mergeRawResponse(report.rawResponse, { cebiaPdfData: pdfResp as any }),
        });

        // Optional: send email (guest uses Stripe customer email)
        if (CEBIA_EMAIL_ON_READY) {
          try {
            const rr: any = report.rawResponse && typeof report.rawResponse === "object" ? report.rawResponse : {};
            const email = typeof rr.customerEmail === "string" ? rr.customerEmail.trim() : "";
            const already = !!rr.emailSent;
            if (email && !already) {
              const token = getCebiaGuestToken(report);
              if (token) {
                const pdfUrl = `https://nnauto.cz/api/cebia/guest/reports/${encodeURIComponent(
                  report.id,
                )}/pdf?token=${encodeURIComponent(token)}`;
                await sendCebiaReportReadyEmail({ email, vin: report.vin, pdfUrl });
                await storage.updateCebiaReport(report.id, {
                  rawResponse: mergeRawResponse(updated?.rawResponse || report.rawResponse, { emailSent: true }),
                });
              }
            }
          } catch (e) {
            console.error("[CEBIA] Email on ready failed:", e);
          }
        }

        return res.json({ status: "ready", report: updated });
      }

      if (queueStatus === 6 || queueStatus === 4) {
        await storage.updateCebiaReport(report.id, {
          status: "failed",
          cebiaQueueStatus: queueStatus ?? null,
          rawResponse: mergeRawResponse(report.rawResponse, { cebiaPdfData: pdfResp as any }),
        });
        return res.status(400).json({ error: pdfResp.message || "Cebia failed", status: "failed" });
      }

      await storage.updateCebiaReport(report.id, {
        status: "requested",
        cebiaQueueStatus: queueStatus ?? null,
        rawResponse: mergeRawResponse(report.rawResponse, { cebiaPdfData: pdfResp as any }),
      });
      res.json({ status: "requested", queueStatus });
    } catch (error: any) {
      console.error("Cebia poll error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/cebia/reports/:id/pdf", isAuthenticated, async (req, res) => {
    try {
      if (!CEBIA_ENABLED) {
        return res.status(503).json({ error: "Cebia is temporarily disabled" });
      }
      const report = await storage.getCebiaReportById(req.params.id);
      if (!report) return res.status(404).json({ error: "Not found" });
      if (report.userId !== req.session.userId) return res.status(403).json({ error: "Forbidden" });
      if (!report.pdfBase64) return res.status(409).json({ error: "PDF not ready yet" });

      const pdfBuffer = Buffer.from(report.pdfBase64, "base64");
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `inline; filename="cebia-${report.vin}.pdf"`);
      res.send(pdfBuffer);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Guest endpoints (no registration required) — secured by guestToken
  app.get("/api/cebia/guest/reports/:id", async (req, res) => {
    try {
      const token = typeof req.query?.token === "string" ? req.query.token : "";
      const report = await storage.getCebiaReportById(req.params.id);
      if (!report) return res.status(404).json({ error: "Not found" });
      if (!assertValidGuestAccess(report, token)) return res.status(403).json({ error: "Forbidden" });

      const { pdfBase64, ...rest } = report as any;
      res.json({ ...rest, hasPdf: !!pdfBase64 });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/cebia/guest/reports/:id/request", async (req, res) => {
    try {
      if (!CEBIA_ENABLED) {
        return res.status(503).json({ error: "Cebia is temporarily disabled" });
      }

      const token = typeof req.body?.token === "string" ? req.body.token : "";
      const report = await storage.getCebiaReportById(req.params.id);
      if (!report) return res.status(404).json({ error: "Not found" });
      if (!assertValidGuestAccess(report, token)) return res.status(403).json({ error: "Forbidden" });

      if (report.status !== "paid" && report.status !== "requested" && report.status !== "ready") {
        return res.status(400).json({ error: "Report not paid" });
      }
      if (report.status === "ready" && report.pdfBase64) {
        return res.json({ status: "ready" });
      }

      const createResp = await cebiaCreatePdfQueue(report.vin);
      if (!createResp?.queueId || createResp.queueStatus === 6) {
        await storage.updateCebiaReport(report.id, {
          status: "failed",
          rawResponse: mergeRawResponse(report.rawResponse, { cebiaCreatePdfQueue: createResp as any }),
        });
        return res.status(400).json({ error: createResp?.message || "Cebia request failed" });
      }

      const updated = await storage.updateCebiaReport(report.id, {
        status: "requested",
        cebiaQueueId: createResp.queueId,
        cebiaQueueStatus: createResp.queueStatus ?? null,
        rawResponse: mergeRawResponse(report.rawResponse, { cebiaCreatePdfQueue: createResp as any }),
      });

      res.json({ report: updated || report });
    } catch (error: any) {
      console.error("Cebia guest request error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/cebia/guest/reports/:id/poll", async (req, res) => {
    try {
      if (!CEBIA_ENABLED) {
        return res.status(503).json({ error: "Cebia is temporarily disabled" });
      }

      const token = typeof req.body?.token === "string" ? req.body.token : "";
      const report = await storage.getCebiaReportById(req.params.id);
      if (!report) return res.status(404).json({ error: "Not found" });
      if (!assertValidGuestAccess(report, token)) return res.status(403).json({ error: "Forbidden" });
      if (!report.cebiaQueueId) return res.status(400).json({ error: "No queueId yet" });
      if (report.status === "ready" && report.pdfBase64) {
        return res.json({ status: "ready" });
      }

      const pdfResp = await cebiaGetPdfData(report.cebiaQueueId);
      const queueStatus = pdfResp.queueStatus;

      if (queueStatus === 3 && pdfResp.pdfData) {
        const updated = await storage.updateCebiaReport(report.id, {
          status: "ready",
          cebiaQueueStatus: queueStatus,
          cebiaCouponNumber: pdfResp.couponNumber ?? null,
          cebiaReportUrl: pdfResp.reportUrl ?? null,
          pdfBase64: pdfResp.pdfData,
          rawResponse: mergeRawResponse(report.rawResponse, { cebiaPdfData: pdfResp as any }),
        });

        if (CEBIA_EMAIL_ON_READY) {
          try {
            const rr: any = report.rawResponse && typeof report.rawResponse === "object" ? report.rawResponse : {};
            const email = typeof rr.customerEmail === "string" ? rr.customerEmail.trim() : "";
            const already = !!rr.emailSent;
            if (email && !already) {
              const guestToken = getCebiaGuestToken(report);
              if (guestToken) {
                const pdfUrl = `https://nnauto.cz/api/cebia/guest/reports/${encodeURIComponent(
                  report.id,
                )}/pdf?token=${encodeURIComponent(guestToken)}`;
                await sendCebiaReportReadyEmail({ email, vin: report.vin, pdfUrl });
                await storage.updateCebiaReport(report.id, {
                  rawResponse: mergeRawResponse(updated?.rawResponse || report.rawResponse, { emailSent: true }),
                });
              }
            }
          } catch (e) {
            console.error("[CEBIA] Guest email on ready failed:", e);
          }
        }

        return res.json({ status: "ready", report: updated });
      }

      if (queueStatus === 6 || queueStatus === 4) {
        await storage.updateCebiaReport(report.id, {
          status: "failed",
          cebiaQueueStatus: queueStatus ?? null,
          rawResponse: mergeRawResponse(report.rawResponse, { cebiaPdfData: pdfResp as any }),
        });
        return res.status(400).json({ error: pdfResp.message || "Cebia failed", status: "failed" });
      }

      await storage.updateCebiaReport(report.id, {
        status: "requested",
        cebiaQueueStatus: queueStatus ?? null,
        rawResponse: mergeRawResponse(report.rawResponse, { cebiaPdfData: pdfResp as any }),
      });
      res.json({ status: "requested", queueStatus });
    } catch (error: any) {
      console.error("Cebia guest poll error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/cebia/guest/reports/:id/pdf", async (req, res) => {
    try {
      if (!CEBIA_ENABLED) {
        return res.status(503).json({ error: "Cebia is temporarily disabled" });
      }

      const token = typeof req.query?.token === "string" ? req.query.token : "";
      const report = await storage.getCebiaReportById(req.params.id);
      if (!report) return res.status(404).json({ error: "Not found" });
      if (!assertValidGuestAccess(report, token)) return res.status(403).json({ error: "Forbidden" });
      if (!report.pdfBase64) return res.status(409).json({ error: "PDF not ready yet" });

      const pdfBuffer = Buffer.from(report.pdfBase64, "base64");
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `inline; filename=\"cebia-${report.vin}.pdf\"`);
      res.send(pdfBuffer);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Legacy promote endpoint - now requires payment (kept for admin use)
  app.patch("/api/listings/:id/promote", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;

      // Get the listing to verify ownership
      const listing = await storage.getListing(id);
      if (!listing) {
        return res.status(404).json({ error: "Listing not found" });
      }

      // Only admin can use direct promote (for free promotions)
      const user = await storage.getUser(req.session.userId!);
      if (!user?.isAdmin) {
        // Regular users must go through payment
        return res.status(402).json({
          error: "Payment required",
          message: "Use /api/listings/:id/checkout to create a payment session",
        });
      }

      // Admin can promote directly
      const updatedListing = await storage.updateListing(id, {
        isTopListing: true,
      });
      if (!updatedListing) {
        return res.status(404).json({ error: "Listing not found" });
      }

      res.json(updatedListing);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // app.get("/api/listings", async (req, res) => {
  //   try {
  //     let listings = await storage.getListings();

  //     // Apply filters from query parameters
  //     const {
  //       search,
  //       userId,
  //       brand,
  //       model,
  //       priceMin,
  //       priceMax,
  //       yearMin,
  //       yearMax,
  //       mileageMin,
  //       mileageMax,
  //       fuel,
  //       trim,
  //       category,
  //       vehicleType,
  //       bodyType,
  //       transmission,
  //       color,
  //       region,
  //       driveType,
  //       engineMin,
  //       engineMax,
  //       powerMin,
  //       powerMax,
  //       doorsMin,
  //       doorsMax,
  //       seatsMin,
  //       seatsMax,
  //       ownersMin,
  //       ownersMax,
  //       airbagsMin,
  //       airbagsMax,
  //       sellerType,
  //       listingAgeMin,
  //       listingAgeMax,
  //       condition,
  //       extras,
  //       equipment,
  //       euroEmission,
  //       stkValidUntil,
  //       hasServiceBook,
  //     } = req.query;

  //     // Filter by userId first for optimization
  //     if (userId && typeof userId === "string") {
  //       listings = listings.filter((l) => l.userId === userId);
  //     }

  //     // Search filter - searches in brand, model, title, description
  //     if (search && typeof search === "string") {
  //       const searchTerm = search.toLowerCase().trim();
  //       listings = listings.filter(
  //         (l) =>
  //           l.brand.toLowerCase().includes(searchTerm) ||
  //           l.model.toLowerCase().includes(searchTerm) ||
  //           (l.title && l.title.toLowerCase().includes(searchTerm)) ||
  //           (l.description && l.description.toLowerCase().includes(searchTerm)),
  //       );
  //     }

  //     if (brand && typeof brand === "string") {
  //       listings = listings.filter(
  //         (l) => l.brand.toLowerCase() === brand.toLowerCase(),
  //       );
  //     }

  //     if (model && typeof model === "string") {
  //       listings = listings.filter(
  //         (l) =>
  //           l.model.toLowerCase().replace(/\s+/g, "-") === model.toLowerCase(),
  //       );
  //     }

  //     if (priceMin && typeof priceMin === "string") {
  //       const min = parseFloat(priceMin);
  //       listings = listings.filter((l) => parseFloat(l.price) >= min);
  //     }

  //     if (priceMax && typeof priceMax === "string") {
  //       const max = parseFloat(priceMax);
  //       listings = listings.filter((l) => parseFloat(l.price) <= max);
  //     }

  //     if (yearMin && typeof yearMin === "string") {
  //       const min = parseInt(yearMin);
  //       listings = listings.filter((l) => l.year >= min);
  //     }

  //     if (yearMax && typeof yearMax === "string") {
  //       const max = parseInt(yearMax);
  //       listings = listings.filter((l) => l.year <= max);
  //     }

  //     if (mileageMin && typeof mileageMin === "string") {
  //       const min = parseInt(mileageMin);
  //       listings = listings.filter((l) => l.mileage >= min);
  //     }

  //     if (mileageMax && typeof mileageMax === "string") {
  //       const max = parseInt(mileageMax);
  //       listings = listings.filter((l) => l.mileage <= max);
  //     }

  //     if (fuel && typeof fuel === "string") {
  //       // Normalize function to remove diacritics and lowercase
  //       const normalize = (str: string) =>
  //         str
  //           .toLowerCase()
  //           .normalize("NFD")
  //           .replace(/[\u0300-\u036f]/g, "");
  //       const fuelValues = fuel.split(",").map((f) => normalize(f.trim()));
  //       listings = listings.filter(
  //         (l) =>
  //           l.fuelType &&
  //           l.fuelType.some((ft) => fuelValues.includes(normalize(ft))),
  //       );
  //     }

  //     if (bodyType && typeof bodyType === "string") {
  //       const normalize = (str: string) =>
  //         str
  //           .toLowerCase()
  //           .normalize("NFD")
  //           .replace(/[\u0300-\u036f]/g, "");
  //       const bodyTypeValues = bodyType
  //         .split(",")
  //         .map((b) => normalize(b.trim()));
  //       listings = listings.filter(
  //         (l) => l.bodyType && bodyTypeValues.includes(normalize(l.bodyType)),
  //       );
  //     }

  //     if (transmission && typeof transmission === "string") {
  //       const normalize = (str: string) =>
  //         str
  //           .toLowerCase()
  //           .normalize("NFD")
  //           .replace(/[\u0300-\u036f]/g, "");
  //       const transValues = transmission
  //         .split(",")
  //         .map((t) => normalize(t.trim()));
  //       listings = listings.filter(
  //         (l) =>
  //           l.transmission &&
  //           l.transmission.some((t) => transValues.includes(normalize(t))),
  //       );
  //     }

  //     if (color && typeof color === "string") {
  //       listings = listings.filter(
  //         (l) => l.color && l.color.toLowerCase() === color.toLowerCase(),
  //       );
  //     }

  //     if (trim && typeof trim === "string") {
  //       listings = listings.filter(
  //         (l) => l.trim && l.trim.toLowerCase().includes(trim.toLowerCase()),
  //       );
  //     }

  //     if (region && typeof region === "string") {
  //       listings = listings.filter(
  //         (l) => l.region && l.region.toLowerCase() === region.toLowerCase(),
  //       );
  //     }

  //     if (driveType && typeof driveType === "string") {
  //       const normalize = (str: string) =>
  //         str
  //           .toLowerCase()
  //           .normalize("NFD")
  //           .replace(/[\u0300-\u036f]/g, "");
  //       const driveValues = driveType
  //         .split(",")
  //         .map((d) => normalize(d.trim()));
  //       listings = listings.filter(
  //         (l) =>
  //           l.driveType &&
  //           l.driveType.some((dt) => driveValues.includes(normalize(dt))),
  //       );
  //     }

  //     if (category && typeof category === "string") {
  //       listings = listings.filter(
  //         (l) => l.category?.toLowerCase() === category.toLowerCase(),
  //       );
  //     }

  //     if (vehicleType && typeof vehicleType === "string") {
  //       const normalize = (str: string) =>
  //         str
  //           .toLowerCase()
  //           .normalize("NFD")
  //           .replace(/[\u0300-\u036f]/g, "");
  //       const vehicleTypeValues = vehicleType
  //         .split(",")
  //         .map((v) => normalize(v.trim()));
  //       listings = listings.filter(
  //         (l) =>
  //           l.vehicleType &&
  //           vehicleTypeValues.includes(normalize(l.vehicleType)),
  //       );
  //     }

  //     if (engineMin && typeof engineMin === "string") {
  //       const min = parseFloat(engineMin);
  //       listings = listings.filter(
  //         (l) => l.engineVolume && parseFloat(l.engineVolume) >= min,
  //       );
  //     }

  //     if (engineMax && typeof engineMax === "string") {
  //       const max = parseFloat(engineMax);
  //       listings = listings.filter(
  //         (l) => l.engineVolume && parseFloat(l.engineVolume) <= max,
  //       );
  //     }

  //     if (powerMin && typeof powerMin === "string") {
  //       const min = parseInt(powerMin);
  //       listings = listings.filter((l) => l.power && l.power >= min);
  //     }

  //     if (powerMax && typeof powerMax === "string") {
  //       const max = parseInt(powerMax);
  //       listings = listings.filter((l) => l.power && l.power <= max);
  //     }

  //     if (doorsMin && typeof doorsMin === "string") {
  //       const min = parseInt(doorsMin);
  //       listings = listings.filter((l) => l.doors && l.doors >= min);
  //     }

  //     if (doorsMax && typeof doorsMax === "string") {
  //       const max = parseInt(doorsMax);
  //       listings = listings.filter((l) => l.doors && l.doors <= max);
  //     }

  //     if (seatsMin && typeof seatsMin === "string") {
  //       const min = parseInt(seatsMin);
  //       listings = listings.filter((l) => l.seats && l.seats >= min);
  //     }

  //     if (seatsMax && typeof seatsMax === "string") {
  //       const max = parseInt(seatsMax);
  //       listings = listings.filter((l) => l.seats && l.seats <= max);
  //     }

  //     if (airbagsMin && typeof airbagsMin === "string") {
  //       const min = parseInt(airbagsMin);
  //       listings = listings.filter(
  //         (l) =>
  //           l.airbags !== undefined && l.airbags !== null && l.airbags >= min,
  //       );
  //     }

  //     if (airbagsMax && typeof airbagsMax === "string") {
  //       const max = parseInt(airbagsMax);
  //       listings = listings.filter(
  //         (l) =>
  //           l.airbags !== undefined && l.airbags !== null && l.airbags <= max,
  //       );
  //     }

  //     if (sellerType && typeof sellerType === "string") {
  //       listings = listings.filter(
  //         (l) =>
  //           l.sellerType &&
  //           l.sellerType.toLowerCase() === sellerType.toLowerCase(),
  //       );
  //     }

  //     if (listingAgeMin !== undefined && typeof listingAgeMin === "string") {
  //       const minDays = parseInt(listingAgeMin);
  //       const maxDate = new Date();
  //       maxDate.setDate(maxDate.getDate() - minDays);
  //       listings = listings.filter(
  //         (l) => l.createdAt && new Date(l.createdAt) <= maxDate,
  //       );
  //     }

  //     if (listingAgeMax !== undefined && typeof listingAgeMax === "string") {
  //       const maxDays = parseInt(listingAgeMax);
  //       const minDate = new Date();
  //       minDate.setDate(minDate.getDate() - maxDays);
  //       listings = listings.filter(
  //         (l) => l.createdAt && new Date(l.createdAt) >= minDate,
  //       );
  //     }

  //     // owners filter using the 'owners' field
  //     if (ownersMin && typeof ownersMin === "string") {
  //       const min = parseInt(ownersMin);
  //       listings = listings.filter(
  //         (l) => l.owners !== undefined && l.owners !== null && l.owners >= min,
  //       );
  //     }

  //     if (ownersMax && typeof ownersMax === "string") {
  //       const max = parseInt(ownersMax);
  //       listings = listings.filter(
  //         (l) => l.owners !== undefined && l.owners !== null && l.owners <= max,
  //       );
  //     }

  //     // equipment filter - must have ALL selected equipment
  //     if (equipment && typeof equipment === "string") {
  //       const normalize = (str: string) =>
  //         str
  //           .toLowerCase()
  //           .normalize("NFD")
  //           .replace(/[\u0300-\u036f]/g, "");
  //       const equipmentList = equipment
  //         .split(",")
  //         .map((e) => normalize(e.trim()));
  //       listings = listings.filter((l) => {
  //         if (!l.equipment || l.equipment.length === 0) return false;
  //         return equipmentList.every((eq) =>
  //           l.equipment!.some((e) => normalize(e) === eq),
  //         );
  //       });
  //     }

  //     // condition filter - match any of the selected conditions
  //     if (condition && typeof condition === "string") {
  //       const normalize = (str: string) =>
  //         str
  //           .toLowerCase()
  //           .normalize("NFD")
  //           .replace(/[\u0300-\u036f]/g, "");
  //       const conditionList = condition
  //         .split(",")
  //         .map((c) => normalize(c.trim()));
  //       listings = listings.filter(
  //         (l) => l.condition && conditionList.includes(normalize(l.condition)),
  //       );
  //     }

  //     // extras filter - must have at least one of the selected extras
  //     if (extras && typeof extras === "string") {
  //       const normalize = (str: string) =>
  //         str
  //           .toLowerCase()
  //           .normalize("NFD")
  //           .replace(/[\u0300-\u036f]/g, "");
  //       const extrasList = extras.split(",").map((e) => normalize(e.trim()));
  //       listings = listings.filter((l) => {
  //         if (!l.extras || l.extras.length === 0) return false;
  //         return extrasList.some((extra) =>
  //           l.extras!.some((e) => normalize(e) === extra),
  //         );
  //       });
  //     }

  //     // Euro emission filter
  //     if (euroEmission && typeof euroEmission === "string") {
  //       listings = listings.filter(
  //         (l) =>
  //           l.euroEmission &&
  //           l.euroEmission.toLowerCase() === euroEmission.toLowerCase(),
  //       );
  //     }

  //     // STK validity filter - filter listings with STK valid until at least the specified date (YYYY-MM format)
  //     if (stkValidUntil && typeof stkValidUntil === "string") {
  //       // Parse the filter date (format: YYYY-MM)
  //       const filterDate = new Date(stkValidUntil + "-01");
  //       if (!isNaN(filterDate.getTime())) {
  //         listings = listings.filter((l) => {
  //           if (!l.stkValidUntil) return false;
  //           const stkDate = new Date(l.stkValidUntil);
  //           // STK must be valid until at least the filter date
  //           return stkDate >= filterDate;
  //         });
  //       }
  //     }

  //     // Service book filter
  //     if (hasServiceBook === "true") {
  //       listings = listings.filter((l) => l.hasServiceBook === true);
  //     }

  //     // Sort listings: TOP listings first, then by creation date (newest first)
  //     listings.sort((a, b) => {
  //       // First priority: isTopListing (true comes before false)
  //       if (a.isTopListing && !b.isTopListing) return -1;
  //       if (!a.isTopListing && b.isTopListing) return 1;
  //       // Second priority: newer listings first
  //       const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
  //       const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
  //       return dateB - dateA;
  //     });

  //     // Get total count before pagination
  //     const totalCount = listings.length;

  //     // Apply pagination if requested
  //     const { page, limit } = req.query;
  //     const pageNum =
  //       page && typeof page === "string" ? Math.max(1, parseInt(page)) : 1;
  //     const limitNum =
  //       limit && typeof limit === "string"
  //         ? Math.min(100, Math.max(1, parseInt(limit)))
  //         : undefined;

  //     let paginatedListings = listings;
  //     if (limitNum) {
  //       const startIndex = (pageNum - 1) * limitNum;
  //       paginatedListings = listings.slice(startIndex, startIndex + limitNum);
  //     }

  //     // Add short cache for listings (1 min cache, 5 min stale-while-revalidate)
  //     res.set(
  //       "Cache-Control",
  //       "public, max-age=60, stale-while-revalidate=300",
  //     );

  //     // Return with pagination metadata
  //     res.json({
  //       listings: paginatedListings,
  //       pagination: {
  //         total: totalCount,
  //         page: pageNum,
  //         limit: limitNum || totalCount,
  //         totalPages: limitNum ? Math.ceil(totalCount / limitNum) : 1,
  //         hasMore: limitNum ? pageNum * limitNum < totalCount : false,
  //       },
  //     });
  //   } catch (error: any) {
  //     res.status(500).json({ error: error.message });
  //   }
  // });
  app.get("/api/listings", async (req: Request, res: Response) => {
    try {
      // ✅ у dev прибираємо кеш, щоб фільтри/сорт одразу відображались
      if (process.env.NODE_ENV === "development") {
        res.setHeader(
          "Cache-Control",
          "no-store, no-cache, must-revalidate, proxy-revalidate",
        );
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");
        res.setHeader("Surrogate-Control", "no-store");
      } else {
        // у проді можна кешувати
        res.setHeader(
          "Cache-Control",
          "public, max-age=60, stale-while-revalidate=300",
        );
      }

      let listings = [...(await storage.getListings())];
      const q = req.query;

      const sort = normalizeSort(q.sort);

      const pageNum = Math.max(1, toInt(q.page) ?? 1);
      const limitNum = Math.min(100, Math.max(1, toInt(q.limit) ?? 20));

      // --- filters ---
      const userId = typeof q.userId === "string" ? q.userId.trim() : "";
      if (userId)
        listings = listings.filter((l) => String(l.userId || "") === userId);

      const search = typeof q.search === "string" ? q.search.trim() : "";
      if (search) {
        const s = normalizeText(search);
        listings = listings.filter((l) => {
          const b = normalizeText(l.brand || "");
          const m = normalizeText(l.model || "");
          const t = normalizeText(l.title || "");
          const d = normalizeText(l.description || "");
          return (
            b.includes(s) || m.includes(s) || t.includes(s) || d.includes(s)
          );
        });
      }

      if (typeof q.brand === "string" && q.brand.trim()) {
        const b = normalizeText(q.brand);
        listings = listings.filter((l) => normalizeText(l.brand || "") === b);
      }

      if (typeof q.model === "string" && q.model.trim()) {
        const wanted = slugify(q.model);
        listings = listings.filter((l) => slugify(l.model || "") === wanted);
      }

      const priceMin = toNumber(q.priceMin);
      const priceMax = toNumber(q.priceMax);
      if (priceMin !== undefined)
        listings = listings.filter((l) => (toNumber(l.price) ?? 0) >= priceMin);
      if (priceMax !== undefined)
        listings = listings.filter((l) => (toNumber(l.price) ?? 0) <= priceMax);

      const yearMin = toInt(q.yearMin);
      const yearMax = toInt(q.yearMax);
      if (yearMin !== undefined)
        listings = listings.filter((l) => (toInt(l.year) ?? 0) >= yearMin);
      if (yearMax !== undefined)
        listings = listings.filter((l) => (toInt(l.year) ?? 0) <= yearMax);

      const mileageMin = toInt(q.mileageMin);
      const mileageMax = toInt(q.mileageMax);
      if (mileageMin !== undefined)
        listings = listings.filter(
          (l) => (toInt(l.mileage) ?? 0) >= mileageMin,
        );
      if (mileageMax !== undefined)
        listings = listings.filter(
          (l) => (toInt(l.mileage) ?? 0) <= mileageMax,
        );

      // fuel -> listing.fuelType[]
      if (typeof q.fuel === "string" && q.fuel.trim()) {
        const wanted = parseCsv(q.fuel).map(normalizeText);
        listings = listings.filter((l) =>
          (Array.isArray(l.fuelType) ? l.fuelType : []).some((v: any) =>
            wanted.includes(normalizeText(v)),
          ),
        );
      }

      // bodyType -> listing.bodyType (string)
      if (typeof q.bodyType === "string" && q.bodyType.trim()) {
        const wanted = parseCsv(q.bodyType).map(normalizeText);
        listings = listings.filter((l) =>
          wanted.includes(normalizeText(l.bodyType || "")),
        );
      }

      // transmission -> listing.transmission[]
      if (typeof q.transmission === "string" && q.transmission.trim()) {
        const wanted = parseCsv(q.transmission).map(normalizeText);
        listings = listings.filter((l) =>
          (Array.isArray(l.transmission) ? l.transmission : []).some((v: any) =>
            wanted.includes(normalizeText(v)),
          ),
        );
      }

      if (typeof q.color === "string" && q.color.trim()) {
        listings = listings.filter(
          (l) => normalizeText(l.color || "") === normalizeText(q.color),
        );
      }

      if (typeof q.trim === "string" && q.trim.trim()) {
        listings = listings.filter((l) =>
          normalizeText(l.trim || "").includes(normalizeText(q.trim)),
        );
      }

      if (typeof q.region === "string" && q.region.trim()) {
        listings = listings.filter(
          (l) => normalizeText(l.region || "") === normalizeText(q.region),
        );
      }

      // driveType -> listing.driveType[]
      if (typeof q.driveType === "string" && q.driveType.trim()) {
        const wanted = parseCsv(q.driveType).map(normalizeText);
        listings = listings.filter((l) =>
          (Array.isArray(l.driveType) ? l.driveType : []).some((v: any) =>
            wanted.includes(normalizeText(v)),
          ),
        );
      }

      if (typeof q.category === "string" && q.category.trim()) {
        listings = listings.filter(
          (l) => normalizeText(l.category || "") === normalizeText(q.category),
        );
      }

      if (typeof q.vehicleType === "string" && q.vehicleType.trim()) {
        const wanted = parseCsv(q.vehicleType).map(normalizeText);
        listings = listings.filter((l) =>
          wanted.includes(normalizeText(l.vehicleType || "")),
        );
      }

      const engineMin = toNumber(q.engineMin);
      const engineMax = toNumber(q.engineMax);
      if (engineMin !== undefined)
        listings = listings.filter(
          (l) => (toNumber(l.engineVolume) ?? -1) >= engineMin,
        );
      if (engineMax !== undefined)
        listings = listings.filter(
          (l) =>
            (toNumber(l.engineVolume) ?? Number.MAX_SAFE_INTEGER) <= engineMax,
        );

      const powerMin = toInt(q.powerMin);
      const powerMax = toInt(q.powerMax);
      if (powerMin !== undefined)
        listings = listings.filter((l) => (toInt(l.power) ?? -1) >= powerMin);
      if (powerMax !== undefined)
        listings = listings.filter(
          (l) => (toInt(l.power) ?? Number.MAX_SAFE_INTEGER) <= powerMax,
        );

      const doorsMin = toInt(q.doorsMin);
      const doorsMax = toInt(q.doorsMax);
      if (doorsMin !== undefined)
        listings = listings.filter((l) => (toInt(l.doors) ?? -1) >= doorsMin);
      if (doorsMax !== undefined)
        listings = listings.filter(
          (l) => (toInt(l.doors) ?? Number.MAX_SAFE_INTEGER) <= doorsMax,
        );

      const seatsMin = toInt(q.seatsMin);
      const seatsMax = toInt(q.seatsMax);
      if (seatsMin !== undefined)
        listings = listings.filter((l) => (toInt(l.seats) ?? -1) >= seatsMin);
      if (seatsMax !== undefined)
        listings = listings.filter(
          (l) => (toInt(l.seats) ?? Number.MAX_SAFE_INTEGER) <= seatsMax,
        );

      const ownersMin = toInt(q.ownersMin);
      const ownersMax = toInt(q.ownersMax);
      if (ownersMin !== undefined)
        listings = listings.filter((l) => (toInt(l.owners) ?? -1) >= ownersMin);
      if (ownersMax !== undefined)
        listings = listings.filter(
          (l) => (toInt(l.owners) ?? Number.MAX_SAFE_INTEGER) <= ownersMax,
        );

      const airbagsMin = toInt(q.airbagsMin);
      const airbagsMax = toInt(q.airbagsMax);
      if (airbagsMin !== undefined)
        listings = listings.filter(
          (l) => (toInt(l.airbags) ?? -1) >= airbagsMin,
        );
      if (airbagsMax !== undefined)
        listings = listings.filter(
          (l) => (toInt(l.airbags) ?? Number.MAX_SAFE_INTEGER) <= airbagsMax,
        );

      if (typeof q.sellerType === "string" && q.sellerType.trim()) {
        listings = listings.filter(
          (l) =>
            normalizeText(l.sellerType || "") === normalizeText(q.sellerType),
        );
      }

      const listingAgeMin = toInt(q.listingAgeMin);
      const listingAgeMax = toInt(q.listingAgeMax);
      if (listingAgeMin !== undefined) {
        const maxDate = new Date();
        maxDate.setDate(maxDate.getDate() - listingAgeMin);
        const maxMs = maxDate.getTime();
        listings = listings.filter((l) => dateMs(l.createdAt) <= maxMs);
      }
      if (listingAgeMax !== undefined) {
        const minDate = new Date();
        minDate.setDate(minDate.getDate() - listingAgeMax);
        const minMs = minDate.getTime();
        listings = listings.filter((l) => dateMs(l.createdAt) >= minMs);
      }

      if (typeof q.equipment === "string" && q.equipment.trim()) {
        const needed = parseCsv(q.equipment).map(normalizeText);
        listings = listings.filter((l) => {
          const arr = Array.isArray(l.equipment) ? l.equipment : [];
          if (!arr.length) return false;
          const norm = arr.map((x: any) => normalizeText(x));
          return needed.every((n) => norm.includes(n));
        });
      }

      if (typeof q.condition === "string" && q.condition.trim()) {
        const wanted = parseCsv(q.condition).map(normalizeText);
        listings = listings.filter((l) =>
          wanted.includes(normalizeText(l.condition || "")),
        );
      }

      if (typeof q.extras === "string" && q.extras.trim()) {
        const wanted = parseCsv(q.extras).map(normalizeText);
        listings = listings.filter((l) => {
          const arr = Array.isArray(l.extras) ? l.extras : [];
          if (!arr.length) return false;
          const norm = arr.map((x: any) => normalizeText(x));
          return wanted.some((w) => norm.includes(w));
        });
      }

      if (toBool(q.hasServiceBook)) {
        listings = listings.filter((l) => l.hasServiceBook === true);
      }

      // --- sort: TOP first, потім сортування усередині ---
      listings.sort((a, b) => {
        const aTop = !!a.isTopListing;
        const bTop = !!b.isTopListing;
        if (aTop && !bTop) return -1;
        if (!aTop && bTop) return 1;

        const by = compareBySort(a, b, sort);
        if (by !== 0) return by;

        // fallback: newest
        return dateMs(b.createdAt) - dateMs(a.createdAt);
      });

      // --- pagination ---
      const total = listings.length;
      const totalPages = Math.max(1, Math.ceil(total / limitNum));
      const safePage = Math.min(pageNum, totalPages);

      const start = (safePage - 1) * limitNum;
      const end = start + limitNum;
      const paginated = listings.slice(start, end);

      return res.json({
        listings: paginated,
        pagination: {
          total,
          page: safePage,
          limit: limitNum,
          totalPages,
          hasMore: safePage * limitNum < total,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ error: error?.message || "Server error" });
    }
  });

  app.get("/api/listings/:id", async (req, res) => {
    try {
      const listing = await storage.getListing(req.params.id);
      if (!listing) {
        res.status(404).json({ error: "Listing not found" });
        return;
      }
      // Add cache for individual listing (2 min cache)
      res.set(
        "Cache-Control",
        "public, max-age=120, stale-while-revalidate=300",
      );
      res.json(listing);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin endpoints
  app.get("/api/admin/users", isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/admin/users/:id", isAdmin, async (req, res) => {
    try {
      const userId = req.params.id;

      if (userId === req.session.userId) {
        return res
          .status(400)
          .json({ error: "Cannot delete your own account" });
      }

      const deleted = await storage.deleteUser(userId);
      if (!deleted) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/listings", isAdmin, async (req, res) => {
    try {
      const listings = await storage.getListings();
      res.json(listings);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/admin/listings/:id", isAdmin, async (req, res) => {
    try {
      const listingId = req.params.id;

      // Validate update data
      const updateData = updateListingSchema.parse(req.body);

      const updatedListing = await storage.updateListing(listingId, updateData);

      if (!updatedListing) {
        return res.status(404).json({ error: "Listing not found" });
      }

      res.json(updatedListing);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/admin/listings/:id", isAdmin, async (req, res) => {
    try {
      const listingId = req.params.id;
      const deleted = await storage.deleteListing(listingId);

      if (!deleted) {
        return res.status(404).json({ error: "Listing not found" });
      }

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/admin/listings/:id/top", isAdmin, async (req, res) => {
    try {
      const listingId = req.params.id;
      const { isTopListing } = req.body;

      if (typeof isTopListing !== "boolean") {
        return res
          .status(400)
          .json({ error: "isTopListing must be a boolean" });
      }

      const updatedListing = await storage.updateListing(listingId, {
        isTopListing,
      });

      if (!updatedListing) {
        return res.status(404).json({ error: "Listing not found" });
      }

      res.json(updatedListing);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/payments", isAdmin, async (req, res) => {
    try {
      const payments = await storage.getAllPayments();

      // Enrich payments with user and listing data
      const enrichedPayments = await Promise.all(
        payments.map(async (payment) => {
          const buyer = await storage.getUser(payment.userId);
          const listing = await storage.getListing(payment.listingId);

          return {
            ...payment,
            buyerUsername: buyer?.username,
            buyerEmail: buyer?.email,
            buyerFirstName: buyer?.firstName,
            buyerLastName: buyer?.lastName,
            listingTitle: listing?.title,
            listingBrand: listing?.brand,
            listingModel: listing?.model,
            listingPrice: listing?.price,
          };
        }),
      );

      res.json(enrichedPayments);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Object Storage endpoints for photo upload (no auth required for upload flow)
  app.post("/api/objects/upload", async (req, res) => {
    try {
      const r2StorageService = new R2StorageService();
      const { uploadURL, objectKey } =
        await r2StorageService.getObjectEntityUploadURL();
      const normalizedPath = `/objects/${objectKey}`;
      res.json({ url: uploadURL, objectPath: normalizedPath });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Video upload endpoint - streams through backend to avoid CORS issues (no auth required)
  app.post(
    "/api/objects/upload-video",
    videoUpload.single("video"),
    async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ error: "No video file provided" });
        }

        const file = req.file;
        console.log(
          `[VIDEO] Uploading video: ${file.originalname}, size: ${(
            file.size /
            1024 /
            1024
          ).toFixed(2)}MB, type: ${file.mimetype}`,
        );

        const r2StorageService = new R2StorageService();
        const objectKey = await r2StorageService.uploadVideo(
          file.buffer,
          file.mimetype,
        );

        // Set ACL to make it public (use 'anonymous' if not logged in)
        await r2StorageService.setObjectAclPolicy(objectKey, {
          owner: req.session?.userId || "anonymous",
          visibility: "public",
        });

        console.log(`[VIDEO] Upload successful: ${objectKey}`);
        res.json({
          success: true,
          objectPath: objectKey,
        });
      } catch (error: any) {
        console.error("Video upload error:", error);
        res
          .status(500)
          .json({ error: error.message || "Failed to upload video" });
      }
    },
  );

  // Upload file directly through backend (avoids CORS issues, no auth required)
  app.post("/api/objects/upload-file", async (req, res) => {
    try {
      if (!req.body || typeof req.body !== "object") {
        return res.status(400).json({ error: "No file data provided" });
      }

      const { fileData, fileName, contentType } = req.body;

      if (!fileData || !fileName || !contentType) {
        return res.status(400).json({
          error: "Missing required fields: fileData, fileName, contentType",
        });
      }

      // Validate content type
      if (!contentType.startsWith("image/")) {
        return res.status(400).json({ error: "Only image files are allowed" });
      }

      // Decode base64 file data
      const buffer = Buffer.from(fileData, "base64");

      // Validate file size after decoding (max 1000MB)
      const maxSize = 1000 * 1024 * 1024; // 1000MB in bytes
      if (buffer.length > maxSize) {
        return res.status(400).json({
          error: `File too large. Maximum size is 1000MB, got ${(
            buffer.length /
            1024 /
            1024
          ).toFixed(2)}MB`,
        });
      }

      // Basic validation: check if buffer starts with common image signatures
      const isValidImage =
        buffer.length >= 8 &&
        // JPEG: FF D8 FF
        ((buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) ||
          // PNG: 89 50 4E 47
          (buffer[0] === 0x89 &&
            buffer[1] === 0x50 &&
            buffer[2] === 0x4e &&
            buffer[3] === 0x47) ||
          // GIF: 47 49 46 38
          (buffer[0] === 0x47 &&
            buffer[1] === 0x49 &&
            buffer[2] === 0x46 &&
            buffer[3] === 0x38) ||
          // WebP: 52 49 46 46 (RIFF) ... 57 45 42 50 (WEBP)
          (buffer[0] === 0x52 &&
            buffer[1] === 0x49 &&
            buffer[2] === 0x46 &&
            buffer[3] === 0x46 &&
            buffer[8] === 0x57 &&
            buffer[9] === 0x45 &&
            buffer[10] === 0x42 &&
            buffer[11] === 0x50));

      if (!isValidImage) {
        return res.status(400).json({ error: "Invalid image file format" });
      }

      // Upload to R2
      const r2StorageService = new R2StorageService();
      const objectKey = await r2StorageService.uploadFile(buffer, contentType);

      // Set ACL to make it public (use 'anonymous' if not logged in)
      await r2StorageService.setObjectAclPolicy(objectKey, {
        owner: req.session?.userId || "anonymous",
        visibility: "public",
      });

      res.json({ objectPath: objectKey });
    } catch (error: any) {
      console.error("Upload error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Optimized image endpoint with resizing and WebP conversion
  app.get("/img/:objectPath(*)", async (req, res) => {
    const userId = req.session.userId;
    const r2StorageService = new R2StorageService();

    try {
      // Parse query parameters for optimization
      const width = parseInt(req.query.w as string) || undefined;
      const quality = parseInt(req.query.q as string) || 80;
      const format = (req.query.f as string) || "webp";

      // Limit width to reasonable values
      const maxWidth = Math.min(width || 1920, 1920);

      const objectKey = `/objects/${req.params.objectPath}`;
      const actualKey = r2StorageService.getObjectKey(objectKey);

      // Check access
      const canAccess = await r2StorageService.canAccessObject({
        key: actualKey,
        userId: userId,
        requestedPermission: ObjectPermission.READ,
      });

      if (!canAccess) {
        return res.sendStatus(401);
      }

      // Generate cache key
      const cacheKey = `${actualKey}-w${maxWidth}-q${quality}-${format}`;

      // Check in-memory cache
      const cached = imageCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < IMAGE_CACHE_TTL) {
        res.set("Content-Type", cached.contentType);
        res.set("Cache-Control", "public, max-age=31536000, immutable");
        res.set("X-Image-Cache", "HIT");
        return res.send(cached.buffer);
      }

      // Download original image
      const chunks: Buffer[] = [];
      const originalStream = await r2StorageService.getObjectStream(actualKey);

      for await (const chunk of originalStream) {
        chunks.push(Buffer.from(chunk));
      }
      const originalBuffer = Buffer.concat(chunks);

      // Skip processing for non-image files
      const isImage =
        originalBuffer.length > 8 &&
        ((originalBuffer[0] === 0xff && originalBuffer[1] === 0xd8) || // JPEG
          (originalBuffer[0] === 0x89 && originalBuffer[1] === 0x50) || // PNG
          (originalBuffer[0] === 0x52 && originalBuffer[1] === 0x49)); // WebP (RIFF)

      if (!isImage) {
        res.set("Cache-Control", "public, max-age=31536000, immutable");
        return res.send(originalBuffer);
      }

      // Process image with sharp
      // Auto-rotate based on EXIF orientation (fixes photos taken on mobile)
      let pipeline = sharp(originalBuffer).rotate();

      // Resize if width specified
      if (maxWidth && maxWidth < 1920) {
        pipeline = pipeline.resize(maxWidth, undefined, {
          withoutEnlargement: true,
          fit: "inside",
        });
      }

      // Convert to requested format
      let contentType = "image/webp";
      if (format === "webp") {
        pipeline = pipeline.webp({ quality });
      } else if (format === "avif") {
        pipeline = pipeline.avif({ quality });
        contentType = "image/avif";
      } else {
        pipeline = pipeline.jpeg({ quality, mozjpeg: true });
        contentType = "image/jpeg";
      }

      const optimizedBuffer = await pipeline.toBuffer();

      // Store in cache (with size limit)
      if (imageCache.size >= MAX_CACHE_SIZE) {
        const oldestKey = imageCache.keys().next().value;
        if (oldestKey) imageCache.delete(oldestKey);
      }
      imageCache.set(cacheKey, {
        buffer: optimizedBuffer,
        contentType,
        timestamp: Date.now(),
      });

      res.set("Content-Type", contentType);
      res.set("Cache-Control", "public, max-age=31536000, immutable");
      res.set("X-Image-Cache", "MISS");
      res.set("X-Original-Size", originalBuffer.length.toString());
      res.set("X-Optimized-Size", optimizedBuffer.length.toString());

      return res.send(optimizedBuffer);
    } catch (error: any) {
      console.error("Error processing optimized image:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  app.get("/objects/:objectPath(*)", async (req, res) => {
    const userId = req.session.userId;
    const r2StorageService = new R2StorageService();
    try {
      const objectKey = r2StorageService.getObjectKey(req.path);
      const canAccess = await r2StorageService.canAccessObject({
        key: objectKey,
        userId: userId,
        requestedPermission: ObjectPermission.READ,
      });
      if (!canAccess) {
        return res.sendStatus(401);
      }

      // Add aggressive caching for images (1 year)
      res.set("Cache-Control", "public, max-age=31536000, immutable");
      res.set("Vary", "Accept-Encoding");

      // Check if this is an image that might need rotation
      const isImagePath = /\.(jpg|jpeg|png|webp)$/i.test(req.path);

      if (isImagePath) {
        // Download and auto-rotate image based on EXIF orientation
        try {
          const chunks: Buffer[] = [];
          const originalStream =
            await r2StorageService.getObjectStream(objectKey);

          for await (const chunk of originalStream) {
            chunks.push(Buffer.from(chunk));
          }
          const originalBuffer = Buffer.concat(chunks);

          // Auto-rotate based on EXIF and return
          const rotatedBuffer = await sharp(originalBuffer).rotate().toBuffer();

          // Determine content type
          const ext = req.path.split(".").pop()?.toLowerCase();
          const contentType =
            ext === "png"
              ? "image/png"
              : ext === "webp"
                ? "image/webp"
                : "image/jpeg";

          res.set("Content-Type", contentType);
          return res.send(rotatedBuffer);
        } catch (rotateError) {
          console.error(
            "Error rotating image, falling back to original:",
            rotateError,
          );
          // Fall back to streaming original
          r2StorageService.downloadObject(objectKey, res);
        }
      } else {
        // Non-image files: stream directly
        r2StorageService.downloadObject(objectKey, res);
      }
    } catch (error: any) {
      console.error("Error checking object access:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  app.put("/api/users/:id/avatar", isAuthenticated, async (req, res) => {
    try {
      const userId = req.params.id;

      // Check user owns this profile
      if (req.session.userId !== userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      if (!req.body.avatarUrl) {
        return res.status(400).json({ error: "avatarUrl is required" });
      }

      const r2StorageService = new R2StorageService();
      const objectPath = await r2StorageService.trySetObjectEntityAclPolicy(
        req.body.avatarUrl,
        {
          owner: userId,
          visibility: "public",
        },
      );

      // Store only the key (without /objects/ prefix) in database
      const objectKey = objectPath.startsWith("/objects/")
        ? objectPath.slice("/objects/".length)
        : objectPath;

      // Update user's avatarUrl in database
      const updatedUser = await storage.updateUser(userId, {
        avatarUrl: objectKey,
      });

      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      const { password: _, ...userWithoutPassword } = updatedUser;
      res.status(200).json({ user: userWithoutPassword });
    } catch (error: any) {
      console.error("Error setting avatar:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // SEO: Dynamic sitemap.xml generation
  app.get("/sitemap.xml", async (req, res) => {
    try {
      console.log("✅ /sitemap.xml HIT", new Date().toISOString());
      const baseUrl = "https://nnauto.cz";
      const listings = await storage.getListings();
      const currentDate = new Date().toISOString().split("T")[0];

      const xmlEscape = (v: any) =>
        String(v ?? "")
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&apos;");

      const normalizePhotoPath = (p: string) =>
        String(p ?? "").replace(/^\/+/, "");

      let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">

  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <xhtml:link rel="alternate" hreflang="cs" href="${baseUrl}/" />
    <xhtml:link rel="alternate" hreflang="uk" href="${baseUrl}/?lang=uk" />
    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/?lang=en" />
  </url>

  <url>
    <loc>${baseUrl}/listings</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.9</priority>
  </url>

  <url>
    <loc>${baseUrl}/about</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>

  <url>
    <loc>${baseUrl}/tips</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>

  <url>
    <loc>${baseUrl}/privacy</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>

${listings
  .map((listing) => {
    const lastmod = listing.updatedAt
      ? new Date(listing.updatedAt).toISOString().split("T")[0]
      : currentDate;

    const hasPhoto = Array.isArray(listing.photos) && listing.photos.length > 0;

    const imageBlock = hasPhoto
      ? `
    <image:image>
      <image:loc>${baseUrl}/objects/${normalizePhotoPath(listing.photos[0])}</image:loc>
      <image:title>${xmlEscape(`${listing.year} ${listing.brand} ${listing.model}`)}</image:title>
    </image:image>`
      : "";

    return `  <url>
    <loc>${baseUrl}/listing/${xmlEscape(listing.id)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>${imageBlock}
  </url>`;
  })
  .join("\n")}

</urlset>`;

      res.set("Content-Type", "application/xml; charset=utf-8");
      res.set("Cache-Control", "public, max-age=3600");
      res.status(200).send(sitemap);
    } catch (error: any) {
      console.error("Sitemap generation error:", error);
      res.status(500).send("Error generating sitemap");
    }
  });

  // SEO: robots.txt fallback (in case static file not served)
  app.get("/robots.txt", (req, res) => {
    res.set("Content-Type", "text/plain");
    res.send(`# NNAuto Robots.txt
User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/
Disallow: /profile
Disallow: /add-listing

Sitemap: https://nnauto.cz/sitemap.xml
`);
  });

  const httpServer = createServer(app);

  return httpServer;
}
