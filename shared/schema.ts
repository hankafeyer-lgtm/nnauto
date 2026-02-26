import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, boolean, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").notNull().unique(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  phone: varchar("phone"),
  avatarUrl: text("avatar_url"),
  isAdmin: boolean("is_admin").default(false).notNull(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  verificationCode: varchar("verification_code"),
  verificationCodeExpiry: timestamp("verification_code_expiry"),
  pendingEmail: varchar("pending_email"),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  username: true,
  password: true,
  firstName: true,
  lastName: true,
  phone: true,
}).extend({
  // Allow registration without providing a username (server will generate one).
  username: z.string().min(1).optional(),
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const updateUserSchema = createInsertSchema(users).pick({
  email: true,
  username: true,
  firstName: true,
  lastName: true,
  phone: true,
  avatarUrl: true,
}).extend({
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  avatarUrl: z.string().nullable().optional(),
}).partial();

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmNewPassword: z.string().min(6, "Password confirmation is required"),
}).refine(data => data.newPassword === data.confirmNewPassword, {
  message: "Passwords do not match",
  path: ["confirmNewPassword"],
});

export const verifyEmailSchema = z.object({
  code: z.string().length(6, "Code must be 6 digits"),
});

export const changeEmailSchema = z.object({
  newEmail: z.string().email("Invalid email address"),
  code: z.string().length(6, "Code must be 6 digits"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type LoginCredentials = z.infer<typeof loginSchema>;
export type ChangePasswordRequest = z.infer<typeof changePasswordSchema>;
export type VerifyEmailRequest = z.infer<typeof verifyEmailSchema>;
export type ChangeEmailRequest = z.infer<typeof changeEmailSchema>;
export type User = typeof users.$inferSelect;

export const listings = pgTable("listings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  brand: text("brand").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  mileage: integer("mileage").notNull(),
  fuelType: text("fuel_type").array(),
  transmission: text("transmission").array(),
  bodyType: text("body_type"),
  color: text("color"),
  trim: text("trim"),
  driveType: text("drive_type").array(),
  engineVolume: decimal("engine_volume", { precision: 3, scale: 1 }),
  power: integer("power"),
  doors: integer("doors"),
  seats: integer("seats"),
  airbags: integer("airbags"),
  sellerType: text("seller_type"),
  owners: integer("owners"),
  region: text("region"),
  category: text("category"),
  vehicleType: text("vehicle_type"),
  condition: text("condition"),
  equipment: text("equipment").array(),
  extras: text("extras").array(),
  phone: varchar("phone"),
  vin: varchar("vin", { length: 17 }),
  euroEmission: text("euro_emission"),
  stkValidUntil: varchar("stk_valid_until"),
  hasServiceBook: boolean("has_service_book").default(false),
  isTopListing: boolean("is_top_listing").default(false).notNull(),
  topListingExpiresAt: timestamp("top_listing_expires_at"),
  vatDeductible: boolean("vat_deductible").default(true).notNull(),
  isImported: boolean("is_imported").default(false).notNull(),
  importCountry: text("import_country"),
  photos: text("photos").array(),
  video: text("video"),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
});

export const insertListingSchema = createInsertSchema(listings).omit({
  id: true,
  topListingExpiresAt: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  title: z.string().min(1, "Název inzerátu je povinný / Назва оголошення обов'язкова"),
  description: z.string().min(1, "Popis je povinný / Опис обов'язковий"),
  price: z.string().min(1, "Cena je povinná / Ціна обов'язкова").refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, "Cena musí být kladné číslo / Ціна повинна бути додатнім числом"),
  condition: z.string().min(1, "Stav vozidla je povinný / Стан авто обов'язковий"),
  vehicleType: z.string().min(1, "Typ vozidla je povinný / Тип авто обов'язковий"),
  brand: z.string().min(1, "Značka je povinná / Марка обов'язкова"),
  model: z.string().min(1, "Model je povinný / Модель обов'язкова"),
  year: z.coerce.number().min(1900, "Rok výroby je povinný / Рік випуску обов'язковий").max(new Date().getFullYear() + 1, "Neplatný rok / Невалідний рік"),
  mileage: z.coerce.number().min(0, "Najeto km je povinné / Пробіг обов'язковий"),
  fuelType: z.array(z.string()).min(1, "Palivo je povinné / Паливо обов'язкове"),
  transmission: z.array(z.string()).min(1, "Převodovka je povinná / КПП обов'язкова"),
  color: z.string().min(1, "Barva je povinná / Колір обов'язковий"),
  driveType: z.array(z.string()).min(1, "Pohon je povinný / Привід обов'язковий"),
  engineVolume: z.string().min(1, "Objem motoru je povinný / Об'єм двигуна обов'язковий"),
  power: z.coerce.number().min(1, "Výkon je povinný / Потужність обов'язкова"),
  doors: z.coerce.number().optional(),
  seats: z.coerce.number().optional(),
  owners: z.coerce.number().optional(),
  sellerType: z.string().min(1, "Prodejce je povinný / Продавець обов'язковий"),
  region: z.string().min(1, "Region je povinný / Регіон обов'язковий"),
  phone: z.string().min(1, "Telefon je povinný / Телефон обов'язковий"),
  vin: z.string().optional(),
  euroEmission: z.string().optional(),
  stkValidUntil: z.string().optional(),
  hasServiceBook: z.boolean().optional(),
});

export const updateListingSchema = insertListingSchema.extend({
  isTopListing: z.boolean().optional(),
  topListingExpiresAt: z.date().nullable().optional(),
}).omit({
  userId: true,
}).partial();

export type InsertListing = z.infer<typeof insertListingSchema>;
export type UpdateListing = z.infer<typeof updateListingSchema>;
export type Listing = typeof listings.$inferSelect;

export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  listingId: varchar("listing_id").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("CZK").notNull(),
  status: varchar("status", { length: 20 }).default("pending").notNull(),
  stripeSessionId: text("stripe_session_id"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updatePaymentSchema = insertPaymentSchema.partial().strict();

export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type UpdatePayment = z.infer<typeof updatePaymentSchema>;
export type Payment = typeof payments.$inferSelect;

export type EnrichedPayment = Payment & {
  buyerUsername?: string;
  buyerEmail?: string;
  buyerFirstName?: string;
  buyerLastName?: string;
  listingTitle?: string;
  listingBrand?: string;
  listingModel?: string;
  listingPrice?: string;
};

export const cebiaReports = pgTable(
  "cebia_reports",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull(),
    listingId: varchar("listing_id"),
    vin: varchar("vin", { length: 17 }).notNull(),

    // What was purchased / requested
    product: varchar("product", { length: 40 }).default("pdf_autotracer").notNull(),
    status: varchar("status", { length: 30 }).default("created").notNull(),

    // Stripe
    priceCents: integer("price_cents").notNull(),
    currency: varchar("currency", { length: 3 }).default("CZK").notNull(),
    stripeSessionId: text("stripe_session_id"),
    stripePaymentIntentId: text("stripe_payment_intent_id"),

    // Cebia workflow (PDF queue)
    cebiaQueueId: text("cebia_queue_id"),
    cebiaQueueStatus: integer("cebia_queue_status"),
    cebiaCouponNumber: text("cebia_coupon_number"),
    cebiaReportUrl: text("cebia_report_url"),

    // Store the PDF data (base64) + raw JSON for audit/debug
    pdfBase64: text("pdf_base64"),
    rawResponse: jsonb("raw_response"),

    createdAt: timestamp("created_at").default(sql`now()`).notNull(),
    updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
  },
  (t) => [
    index("cebia_reports_user_id_idx").on(t.userId),
    index("cebia_reports_vin_idx").on(t.vin),
    index("cebia_reports_stripe_session_id_idx").on(t.stripeSessionId),
    index("cebia_reports_created_at_idx").on(t.createdAt),
  ],
);

export const insertCebiaReportSchema = createInsertSchema(cebiaReports).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateCebiaReportSchema = insertCebiaReportSchema.partial().strict();

export type InsertCebiaReport = z.infer<typeof insertCebiaReportSchema>;
export type UpdateCebiaReport = z.infer<typeof updateCebiaReportSchema>;
export type CebiaReport = typeof cebiaReports.$inferSelect;
