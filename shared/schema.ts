import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  integer,
  decimal,
  boolean,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
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
  isDealer: boolean("is_dealer").default(false).notNull(),
  dealerId: varchar("dealer_id"),
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

export const passwordResetTokens = pgTable(
  "password_reset_tokens",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull(),
    // SHA-256 hex of the raw token. Raw token never persisted.
    tokenHash: varchar("token_hash", { length: 64 }).notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    usedAt: timestamp("used_at"),
    requestedIpHash: varchar("requested_ip_hash", { length: 64 }),
    createdAt: timestamp("created_at").default(sql`now()`).notNull(),
  },
  (table) => [
    uniqueIndex("password_reset_tokens_token_hash_idx").on(table.tokenHash),
    index("password_reset_tokens_user_id_idx").on(table.userId),
    index("password_reset_tokens_expires_at_idx").on(table.expiresAt),
  ],
);

export const resetPasswordSchema = z.object({
  token: z.string().min(20, "Invalid token"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  turnstileToken: z.string().optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type LoginCredentials = z.infer<typeof loginSchema>;
export type ChangePasswordRequest = z.infer<typeof changePasswordSchema>;
export type VerifyEmailRequest = z.infer<typeof verifyEmailSchema>;
export type ChangeEmailRequest = z.infer<typeof changeEmailSchema>;
export type ResetPasswordRequest = z.infer<typeof resetPasswordSchema>;
export type User = typeof users.$inferSelect;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;

// ── Dealers ──────────────────────────────────────────────────────────────────

export const dealers = pgTable(
  "dealers",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    ownerId: varchar("owner_id").notNull(),
    companyName: text("company_name").notNull(),
    ico: varchar("ico", { length: 20 }),
    dic: varchar("dic", { length: 20 }),
    description: text("description"),
    logoUrl: text("logo_url"),
    website: text("website"),
    phone: varchar("phone"),
    email: varchar("email"),
    address: text("address"),
    region: text("region"),
    isVerified: boolean("is_verified").default(false).notNull(),
    maxListings: integer("max_listings").default(50).notNull(),
    // ── Admin Dealer Management (V1) ──────────────────────────────────────
    /** free | basic | pro | premium | enterprise */
    plan: varchar("plan", { length: 20 }).default("free").notNull(),
    /** active | blocked */
    status: varchar("status", { length: 20 }).default("active").notNull(),
    /** none | pending | verified | rejected */
    verificationStatus: varchar("verification_status", { length: 20 })
      .default("none")
      .notNull(),
    xmlFeedUrl: text("xml_feed_url"),
    /** none | active | pending | error */
    xmlFeedStatus: varchar("xml_feed_status", { length: 20 })
      .default("none")
      .notNull(),
    apiKey: varchar("api_key", { length: 80 }),
    apiEnabled: boolean("api_enabled").default(false).notNull(),
    lastSyncAt: timestamp("last_sync_at"),
    createdAt: timestamp("created_at").default(sql`now()`).notNull(),
    updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
  },
  (t) => [
    index("dealers_owner_id_idx").on(t.ownerId),
    index("dealers_region_idx").on(t.region),
    index("dealers_status_idx").on(t.status),
    index("dealers_plan_idx").on(t.plan),
  ],
);

// ── Admin audit logs ─────────────────────────────────────────────────────────

export const adminAuditLogs = pgTable(
  "admin_audit_logs",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    actorUserId: varchar("actor_user_id").notNull(),
    actorEmail: varchar("actor_email"),
    action: varchar("action", { length: 64 }).notNull(),
    targetType: varchar("target_type", { length: 32 }),
    targetId: varchar("target_id"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").default(sql`now()`).notNull(),
  },
  (t) => [
    index("admin_audit_logs_created_at_idx").on(t.createdAt),
    index("admin_audit_logs_target_idx").on(t.targetType, t.targetId),
  ],
);

export type AdminAuditLog = typeof adminAuditLogs.$inferSelect;

export const insertDealerSchema = createInsertSchema(dealers).omit({
  id: true,
  isVerified: true,
  maxListings: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  companyName: z.string().min(2, "Company name is required"),
  ico: z.string().optional(),
  dic: z.string().optional(),
  description: z.string().optional(),
  logoUrl: z.string().optional(),
  website: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  address: z.string().optional(),
  region: z.string().optional(),
});

export const updateDealerSchema = insertDealerSchema.partial();

export const dealerProfileUpdateSchema = z
  .object({
    companyName: z.string().min(2, "Company name is required").optional(),
    ico: z.string().optional().nullable(),
    dic: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    logoUrl: z.string().optional().nullable(),
    website: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
    email: z.string().email("Invalid email").optional().or(z.literal("")),
    address: z.string().optional().nullable(),
    region: z.string().optional().nullable(),
  })
  .strict();

export type Dealer = typeof dealers.$inferSelect;
export type InsertDealer = z.infer<typeof insertDealerSchema>;
export type UpdateDealer = z.infer<typeof updateDealerSchema>;

export const dealerSettings = pgTable(
  "dealer_settings",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    dealerId: varchar("dealer_id").notNull(),
    userId: varchar("user_id").notNull(),
    settings: jsonb("settings").notNull(),
    createdAt: timestamp("created_at").default(sql`now()`).notNull(),
    updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
  },
  (t) => [
    uniqueIndex("dealer_settings_dealer_id_unique").on(t.dealerId),
    index("dealer_settings_user_id_idx").on(t.userId),
  ],
);

export type DealerSettings = typeof dealerSettings.$inferSelect;

// ── Bulk import jobs ─────────────────────────────────────────────────────────

export const bulkImportJobs = pgTable(
  "bulk_import_jobs",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    dealerId: varchar("dealer_id").notNull(),
    userId: varchar("user_id").notNull(),
    status: varchar("status", { length: 20 }).default("pending").notNull(),
    totalRows: integer("total_rows").default(0).notNull(),
    processedRows: integer("processed_rows").default(0).notNull(),
    successRows: integer("success_rows").default(0).notNull(),
    failedRows: integer("failed_rows").default(0).notNull(),
    errors: jsonb("errors"),
    fileName: text("file_name"),
    createdAt: timestamp("created_at").default(sql`now()`).notNull(),
    updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
  },
  (t) => [
    index("bulk_import_jobs_dealer_id_idx").on(t.dealerId),
    index("bulk_import_jobs_status_idx").on(t.status),
  ],
);

export type BulkImportJob = typeof bulkImportJobs.$inferSelect;

// ── Dealer XML/feed sync ─────────────────────────────────────────────────────
// One row per dealer holding the configured feed URL and the latest sync
// status/counters. Listings created from this feed carry feed_id + external_id.

export const dealerFeeds = pgTable(
  "dealer_feeds",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    dealerId: varchar("dealer_id").notNull(),
    userId: varchar("user_id").notNull(),
    feedUrl: text("feed_url").notNull(),
    format: varchar("format", { length: 20 }).default("auto").notNull(),
    enabled: boolean("enabled").default(true).notNull(),
    status: varchar("status", { length: 20 }).default("idle").notNull(),
    lastSyncAt: timestamp("last_sync_at"),
    vehicleCount: integer("vehicle_count").default(0).notNull(),
    createdCount: integer("created_count").default(0).notNull(),
    updatedCount: integer("updated_count").default(0).notNull(),
    deactivatedCount: integer("deactivated_count").default(0).notNull(),
    errorCount: integer("error_count").default(0).notNull(),
    lastError: text("last_error"),
    errors: jsonb("errors"),
    createdAt: timestamp("created_at").default(sql`now()`).notNull(),
    updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
  },
  (t) => [
    uniqueIndex("dealer_feeds_dealer_id_unique").on(t.dealerId),
    index("dealer_feeds_user_id_idx").on(t.userId),
  ],
);

export type DealerFeed = typeof dealerFeeds.$inferSelect;

export const dealerFeedSyncJobs = pgTable(
  "dealer_feed_sync_jobs",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    dealerId: varchar("dealer_id").notNull(),
    userId: varchar("user_id").notNull(),
    feedId: varchar("feed_id").notNull(),
    feedUrl: text("feed_url").notNull(),
    status: varchar("status", { length: 20 }).default("pending").notNull(),
    trigger: varchar("trigger", { length: 20 }).default("manual").notNull(),
    startedAt: timestamp("started_at"),
    finishedAt: timestamp("finished_at"),
    summary: jsonb("summary"),
    error: text("error"),
    createdAt: timestamp("created_at").default(sql`now()`).notNull(),
    updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
  },
  (t) => [
    index("dealer_feed_sync_jobs_dealer_id_idx").on(t.dealerId),
    index("dealer_feed_sync_jobs_status_idx").on(t.status),
    index("dealer_feed_sync_jobs_created_at_idx").on(t.createdAt),
  ],
);

export type DealerFeedSyncJob = typeof dealerFeedSyncJobs.$inferSelect;

// ── Dealer webhooks ──────────────────────────────────────────────────────────
// One webhook endpoint per dealer. We sign every delivery with HMAC-SHA256
// using `secret`, and only send the events selected in `events`.

export const dealerWebhooks = pgTable(
  "dealer_webhooks",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    dealerId: varchar("dealer_id").notNull(),
    userId: varchar("user_id").notNull(),
    webhookUrl: text("webhook_url").notNull(),
    secret: varchar("secret", { length: 80 }).notNull(),
    enabled: boolean("enabled").default(true).notNull(),
    events: jsonb("events").notNull(),
    status: varchar("status", { length: 20 }).default("idle").notNull(),
    lastDeliveryAt: timestamp("last_delivery_at"),
    lastStatus: integer("last_status"),
    lastError: text("last_error"),
    createdAt: timestamp("created_at").default(sql`now()`).notNull(),
    updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
  },
  (t) => [
    uniqueIndex("dealer_webhooks_dealer_id_unique").on(t.dealerId),
    index("dealer_webhooks_user_id_idx").on(t.userId),
  ],
);

export type DealerWebhook = typeof dealerWebhooks.$inferSelect;

// ── Dealer vehicle package subscriptions ────────────────────────────────────
// Stripe subscriptions for annual dealer inventory packages. This is separate
// from the existing Stripe integration used elsewhere on the site.

export const dealerPackageSubscriptions = pgTable(
  "dealer_package_subscriptions",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    dealerId: varchar("dealer_id").notNull(),
    userId: varchar("user_id").notNull(),
    packageId: varchar("package_id", { length: 20 }).notNull(),
    status: varchar("status", { length: 32 }).notNull(),
    stripeCustomerId: text("stripe_customer_id"),
    stripeSubscriptionId: text("stripe_subscription_id").notNull(),
    stripeCheckoutSessionId: text("stripe_checkout_session_id"),
    stripePriceId: text("stripe_price_id").notNull(),
    amountKc: integer("amount_kc").notNull(),
    currency: varchar("currency", { length: 3 }).default("CZK").notNull(),
    maxListings: integer("max_listings").notNull(),
    currentPeriodStart: timestamp("current_period_start"),
    currentPeriodEnd: timestamp("current_period_end"),
    cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false).notNull(),
    canceledAt: timestamp("canceled_at"),
    latestInvoiceId: text("latest_invoice_id"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").default(sql`now()`).notNull(),
    updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
  },
  (t) => [
    uniqueIndex("dealer_package_subscriptions_stripe_sub_unique").on(t.stripeSubscriptionId),
    index("dealer_package_subscriptions_dealer_id_idx").on(t.dealerId),
    index("dealer_package_subscriptions_user_id_idx").on(t.userId),
    index("dealer_package_subscriptions_status_idx").on(t.status),
  ],
);

export type DealerPackageSubscription =
  typeof dealerPackageSubscriptions.$inferSelect;

// ── Dealer billing invoices (package payments) ─────────────────────────────

export const dealerInvoices = pgTable(
  "dealer_invoices",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    dealerId: varchar("dealer_id").notNull(),
    userId: varchar("user_id").notNull(),
    subscriptionId: varchar("subscription_id"),
    stripeCheckoutSessionId: text("stripe_checkout_session_id"),
    stripeInvoiceId: text("stripe_invoice_id"),
    number: varchar("number", { length: 32 }).notNull(),
    issuedAt: timestamp("issued_at").notNull(),
    taxableSupplyAt: timestamp("taxable_supply_at").notNull(),
    paidAt: timestamp("paid_at"),
    paymentMethod: varchar("payment_method", { length: 80 })
      .default("Online platba kartou")
      .notNull(),
    packageId: varchar("package_id", { length: 20 }).notNull(),
    description: text("description").notNull(),
    amountKc: integer("amount_kc").notNull(),
    currency: varchar("currency", { length: 3 }).default("CZK").notNull(),
    vatRate: integer("vat_rate").default(21).notNull(),
    status: varchar("status", { length: 20 }).default("paid").notNull(),
    buyerCompanyName: text("buyer_company_name").notNull(),
    buyerIco: varchar("buyer_ico", { length: 20 }),
    buyerDic: varchar("buyer_dic", { length: 20 }),
    buyerAddress: text("buyer_address"),
    buyerEmail: varchar("buyer_email"),
    htmlContent: text("html_content"),
    pdfBase64: text("pdf_base64"),
    createdAt: timestamp("created_at").default(sql`now()`).notNull(),
  },
  (t) => [
    uniqueIndex("dealer_invoices_number_unique").on(t.number),
    uniqueIndex("dealer_invoices_checkout_session_unique").on(t.stripeCheckoutSessionId),
    index("dealer_invoices_dealer_id_idx").on(t.dealerId),
    index("dealer_invoices_user_id_idx").on(t.userId),
    index("dealer_invoices_issued_at_idx").on(t.issuedAt),
  ],
);

export type DealerInvoice = typeof dealerInvoices.$inferSelect;

// ── Brands & Models ──────────────────────────────────────────────────────────

export const brands = pgTable(
  "brands",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    slug: varchar("slug", { length: 120 }).notNull(),
    name: text("name").notNull(),
    createdAt: timestamp("created_at").default(sql`now()`).notNull(),
    updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
  },
  (t) => [
    uniqueIndex("brands_slug_unique").on(t.slug),
    index("brands_name_idx").on(t.name),
  ],
);

export const models = pgTable(
  "models",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    brandId: varchar("brand_id")
      .notNull()
      .references(() => brands.id, { onDelete: "cascade" }),
    slug: varchar("slug", { length: 160 }).notNull(),
    name: text("name").notNull(),
    createdAt: timestamp("created_at").default(sql`now()`).notNull(),
    updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
  },
  (t) => [
    uniqueIndex("models_brand_slug_unique").on(t.brandId, t.slug),
    index("models_brand_idx").on(t.brandId),
    index("models_name_idx").on(t.name),
  ],
);

export const modelGenerations = pgTable(
  "model_generations",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    modelId: varchar("model_id")
      .notNull()
      .references(() => models.id, { onDelete: "cascade" }),
    slug: varchar("slug", { length: 180 }).notNull(),
    name: text("name").notNull(),
    createdAt: timestamp("created_at").default(sql`now()`).notNull(),
    updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
  },
  (t) => [
    uniqueIndex("model_generations_model_slug_unique").on(t.modelId, t.slug),
    index("model_generations_model_idx").on(t.modelId),
    index("model_generations_name_idx").on(t.name),
  ],
);

export const listings = pgTable(
  "listings",
  {
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
    isSold: boolean("is_sold").default(false).notNull(),
    isImported: boolean("is_imported").default(false).notNull(),
    importCountry: text("import_country"),
    photos: text("photos").array(),
    video: text("video"),
    // Source tracking for automated imports (e.g. XML feed sync). `source`
    // distinguishes manual listings from feed-synced ones; `externalId` is the
    // vehicle id taken from the dealer's feed so we can update/deactivate it on
    // the next sync; `feedId` links the listing to the dealer_feeds row.
    source: text("source").default("manual"),
    externalId: text("external_id"),
    feedId: varchar("feed_id"),
    createdAt: timestamp("created_at").default(sql`now()`).notNull(),
    updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
  },
  (t) => [
    index("listings_is_top_created_at_idx").on(t.isTopListing, t.createdAt),
    index("listings_is_sold_idx").on(t.isSold),
    index("listings_created_at_idx").on(t.createdAt),
    index("listings_price_idx").on(t.price),
    index("listings_year_idx").on(t.year),
    index("listings_mileage_idx").on(t.mileage),
    index("listings_brand_idx").on(t.brand),
    index("listings_model_idx").on(t.model),
    index("listings_vehicle_type_idx").on(t.vehicleType),
    index("listings_body_type_idx").on(t.bodyType),
    index("listings_region_idx").on(t.region),
    index("listings_user_id_idx").on(t.userId),
    index("listings_feed_id_idx").on(t.feedId),
    // Dedup key for feed sync. NULLs are distinct in Postgres, so manual
    // listings (external_id IS NULL) never collide here.
    uniqueIndex("listings_user_external_unique").on(t.userId, t.externalId),
  ],
);

// ── Deleted listings log ─────────────────────────────────────────────────────

export const deletedListings = pgTable("deleted_listings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  listingId: varchar("listing_id").notNull(),
  userId: varchar("user_id").notNull(),
  deletedBy: varchar("deleted_by").notNull(),
  brand: text("brand").notNull(),
  model: text("model").notNull(),
  title: text("title").notNull(),
  year: integer("year"),
  price: decimal("price", { precision: 10, scale: 2 }),
  photo: text("photo"),
  deletedAt: timestamp("deleted_at").default(sql`now()`).notNull(),
});

export type DeletedListing = typeof deletedListings.$inferSelect;

const VIN_REGEX = /^[A-HJ-NPR-Z0-9]{17}$/;

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
  vin: z.preprocess(
    (value) => {
      if (typeof value !== "string") return undefined;
      const normalized = value.trim().toUpperCase();
      return normalized === "" ? undefined : normalized;
    },
    z
      .string()
      .regex(
        VIN_REGEX,
        "VIN must have exactly 17 characters (A-Z, 0-9, without I/O/Q) / VIN має містити рівно 17 символів (A-Z, 0-9, без I/O/Q) / VIN must have exactly 17 characters (A-Z, 0-9, no I/O/Q)",
      )
      .optional(),
  ),
  euroEmission: z.string().optional(),
  stkValidUntil: z.string().optional(),
  hasServiceBook: z.boolean().optional(),
  isSold: z.boolean().optional(),
});

export const updateListingSchema = insertListingSchema.extend({
  isTopListing: z.boolean().optional(),
  topListingExpiresAt: z.date().nullable().optional(),
  isSold: z.boolean().optional(),
}).omit({
  userId: true,
}).partial();

export type InsertListing = z.infer<typeof insertListingSchema>;
export type UpdateListing = z.infer<typeof updateListingSchema>;
export type Listing = typeof listings.$inferSelect;
export type Brand = typeof brands.$inferSelect;
export type Model = typeof models.$inferSelect;
export type ModelGeneration = typeof modelGenerations.$inferSelect;

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

    // Buyer e-mail (captured from Stripe Checkout) used to deliver the PDF
    // and shown in the user cabinet. `emailSentAt` makes delivery idempotent.
    email: text("email"),
    emailSentAt: timestamp("email_sent_at"),
    // Random token allowing an authless download link (used in e-mails), so
    // the same delivery URL works for both guests and logged-in buyers.
    downloadToken: text("download_token"),

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

// ─────────────────────────────────────────────────────────────────────────────
// Dealer ↔ Buyer messaging (unified inbox)
// ─────────────────────────────────────────────────────────────────────────────
//
// One Conversation per (dealer × listing × client identity), where client
// identity is e-mail OR phone OR an anonymous chat session. Channels can mix:
// the buyer can write via in-app chat, e-mail, WhatsApp or Telegram and the
// dealer answers from a single thread.
//
// dealerUserId stores listings.userId (= the user that owns the listing,
// which for dealer accounts is the dealer's owner user). It is the column
// every dealer-protected query filters on, so it is indexed.

export const conversationSourceValues = ["chat", "email", "sms", "whatsapp", "telegram"] as const;
export const conversationStatusValues = ["new", "in_progress", "closed"] as const;
export const messageSenderValues = ["dealer", "client", "system"] as const;
export const messageTypeValues = ["text", "image", "email"] as const;

export const conversations = pgTable(
  "conversations",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    /** Listing owner user id — every dealer-side query filters on this. */
    dealerUserId: varchar("dealer_user_id").notNull(),
    /** Optional dealers.id, when the listing owner is a dealer account. */
    dealerId: varchar("dealer_id"),
    listingId: varchar("listing_id").notNull(),
    /** Logged-in buyer user id — null for anonymous contact form submissions. */
    clientUserId: varchar("client_user_id"),
    clientName: text("client_name"),
    clientEmail: varchar("client_email"),
    clientPhone: varchar("client_phone"),
    /** "chat" | "email" | "sms" | "whatsapp" | "telegram" */
    source: varchar("source", { length: 16 }).notNull().default("chat"),
    /** "new" | "in_progress" | "closed" */
    status: varchar("status", { length: 16 }).notNull().default("new"),
    /** Cheap, denormalised counter for unread badge in dealer cabinet. */
    unreadDealerCount: integer("unread_dealer_count").notNull().default(0),
    /** Cheap, denormalised counter for unread badge in buyer inbox. */
    unreadClientCount: integer("unread_client_count").notNull().default(0),
    /** Last client message preview (first ~200 chars) for the inbox list. */
    lastMessagePreview: text("last_message_preview"),
    lastMessageAt: timestamp("last_message_at"),
    /** External identifiers used for inbound thread matching. */
    threadKey: varchar("thread_key", { length: 64 }),
    /** Soft delete: when set, the conversation is hidden from dealer/buyer
     *  inboxes but retained in the DB for admin recovery/audit. */
    deletedAt: timestamp("deleted_at"),
    /** User id (dealer or buyer) who soft-deleted the conversation. */
    deletedBy: varchar("deleted_by"),
    createdAt: timestamp("created_at").default(sql`now()`).notNull(),
    updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
  },
  (table) => [
    index("conversations_dealer_user_id_idx").on(table.dealerUserId),
    index("conversations_client_user_id_idx").on(table.clientUserId),
    index("conversations_listing_id_idx").on(table.listingId),
    index("conversations_status_idx").on(table.status),
    index("conversations_last_message_at_idx").on(table.lastMessageAt),
    index("conversations_deleted_at_idx").on(table.deletedAt),
    uniqueIndex("conversations_thread_key_idx").on(table.threadKey),
  ],
);

export const messages = pgTable(
  "messages",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    conversationId: varchar("conversation_id").notNull(),
    /** "dealer" | "client" | "system" */
    sender: varchar("sender", { length: 16 }).notNull(),
    /** "text" | "image" | "email" */
    type: varchar("type", { length: 16 }).notNull().default("text"),
    content: text("content").notNull(),
    /** When sender=dealer this is true once the client opens the email/web chat;
     *  when sender=client this is true once the dealer opens the conversation. */
    read: boolean("read").notNull().default(false),
    /** Original delivery channel for THIS message (lets us render an
     *  "Email" badge even inside a chat-source conversation). */
    channel: varchar("channel", { length: 16 }).notNull().default("chat"),
    /** Provider-side message id (mailersend / whatsapp / telegram) for
     *  webhook reconciliation. */
    externalId: varchar("external_id", { length: 128 }),
    /** Soft delete: retained in the DB for admin recovery/audit. */
    deletedAt: timestamp("deleted_at"),
    deletedBy: varchar("deleted_by"),
    createdAt: timestamp("created_at").default(sql`now()`).notNull(),
  },
  (table) => [
    index("messages_conversation_id_created_at_idx").on(
      table.conversationId,
      table.createdAt,
    ),
    index("messages_external_id_idx").on(table.externalId),
  ],
);

export const quickReplies = pgTable(
  "quick_replies",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    /** Owner is the dealer account user id (so it survives if dealers row
     *  is recreated and matches conversations.dealerUserId). */
    dealerUserId: varchar("dealer_user_id").notNull(),
    title: text("title").notNull(),
    message: text("message").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at").default(sql`now()`).notNull(),
    updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
  },
  (table) => [index("quick_replies_dealer_user_id_idx").on(table.dealerUserId)],
);

// ── Leady (CRM pipeline) ────────────────────────────────────────────────────
// Each conversation (contact form / chat / inbound e-mail) is surfaced as a
// "lead" in the dealer cabinet. The CRM status the dealer assigns lives here,
// keyed by conversation id, so it stays decoupled from the messaging status.
export const leadStates = pgTable(
  "lead_states",
  {
    /** conversations.id — one CRM state per contact thread. */
    conversationId: varchar("conversation_id").primaryKey(),
    /** Listing owner user id — every dealer-side query filters on this. */
    dealerUserId: varchar("dealer_user_id").notNull(),
    /** "new" | "contacted" | "negotiating" | "sold" | "rejected" */
    status: varchar("status", { length: 16 }).notNull().default("new"),
    note: text("note"),
    updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
  },
  (table) => [index("lead_states_dealer_user_id_idx").on(table.dealerUserId)],
);

export const leadStatusValues = [
  "new",
  "contacted",
  "negotiating",
  "reserved",
  "sold",
  "lost",
] as const;

export type LeadStatusValue = (typeof leadStatusValues)[number];
export type LeadState = typeof leadStates.$inferSelect;

// Public buyer → dealer contact form (creates a Conversation + first Message).
export const contactDealerSchema = z.object({
  listingId: z.string().min(1),
  name: z.string().trim().max(120).optional(),
  email: z.string().trim().email().max(254).optional(),
  phone: z.string().trim().max(40).optional(),
  message: z.string().trim().min(1, "Message is required").max(4000),
});

// Dealer → outbound message
export const dealerOutboundMessageSchema = z.object({
  content: z.string().trim().min(1).max(8000),
  /** When true and the conversation has an email, also deliver via e-mail. */
  viaEmail: z.boolean().optional(),
});

export const updateConversationStatusSchema = z.object({
  status: z.enum(conversationStatusValues),
});

export const insertQuickReplySchema = z.object({
  title: z.string().trim().min(1).max(120),
  message: z.string().trim().min(1).max(4000),
  sortOrder: z.number().int().optional(),
});

export const updateQuickReplySchema = insertQuickReplySchema.partial();

export type ConversationSource = (typeof conversationSourceValues)[number];
export type ConversationStatus = (typeof conversationStatusValues)[number];
export type MessageSender = (typeof messageSenderValues)[number];
export type MessageType = (typeof messageTypeValues)[number];

export type Conversation = typeof conversations.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type QuickReply = typeof quickReplies.$inferSelect;
export type ContactDealerRequest = z.infer<typeof contactDealerSchema>;
export type DealerOutboundMessageRequest = z.infer<typeof dealerOutboundMessageSchema>;
export type UpdateConversationStatusRequest = z.infer<typeof updateConversationStatusSchema>;
export type InsertQuickReplyRequest = z.infer<typeof insertQuickReplySchema>;
export type UpdateQuickReplyRequest = z.infer<typeof updateQuickReplySchema>;
