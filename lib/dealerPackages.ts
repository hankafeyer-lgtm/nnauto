import Stripe from "stripe";
import { db } from "@lib/db";
import { ensureDealerInvoiceForPackageCheckout } from "@lib/dealerInvoice";
import { dealerPackageSubscriptions, dealers } from "@shared/schema";
import { and, desc, eq, inArray } from "drizzle-orm";

export const DEALER_PACKAGES = {
  start: {
    id: "start",
    name: "START NNAuto",
    cars: 150,
    amountKc: 3000,
    envPriceKey: "DEALER_STRIPE_PRICE_START",
  },
  business: {
    id: "business",
    name: "BUSINESS NNAuto",
    cars: 350,
    amountKc: 4500,
    envPriceKey: "DEALER_STRIPE_PRICE_BUSINESS",
  },
  pro: {
    id: "pro",
    name: "PRO NNAuto",
    cars: 750,
    amountKc: 6000,
    envPriceKey: "DEALER_STRIPE_PRICE_PRO",
  },
} as const;

export type DealerPackageId = keyof typeof DEALER_PACKAGES;

export const ACTIVE_DEALER_PACKAGE_STATUSES = [
  "active",
  "trialing",
  "past_due",
] as const;

export function isDealerPackageId(value: unknown): value is DealerPackageId {
  return typeof value === "string" && value in DEALER_PACKAGES;
}

export function getDealerPackagePriceId(packageId: DealerPackageId): string {
  const envKey = DEALER_PACKAGES[packageId].envPriceKey;
  const priceId = process.env[envKey];
  if (!priceId) throw new Error(`${envKey} is missing`);
  return priceId;
}

export function getDealerStripe() {
  const key = process.env.DEALER_STRIPE_SECRET_KEY;
  if (!key) throw new Error("Dealer Stripe not configured");
  return new Stripe(key);
}

function toDateFromStripeSeconds(value: number | null | undefined): Date | null {
  return value ? new Date(value * 1000) : null;
}

function getSubscriptionPeriod(subscription: Stripe.Subscription) {
  // Stripe SDK typings can lag API fields; current_period_* are present on
  // Subscription objects returned by the API.
  const sub = subscription as Stripe.Subscription & {
    current_period_start?: number;
    current_period_end?: number;
  };
  return {
    currentPeriodStart: toDateFromStripeSeconds(sub.current_period_start),
    currentPeriodEnd: toDateFromStripeSeconds(sub.current_period_end),
  };
}

function getPackageIdFromPrice(priceId: string): DealerPackageId | null {
  for (const packageId of Object.keys(DEALER_PACKAGES) as DealerPackageId[]) {
    if (process.env[DEALER_PACKAGES[packageId].envPriceKey] === priceId) {
      return packageId;
    }
  }
  return null;
}

async function upsertDealerPackageSubscription(args: {
  dealerId: string;
  userId: string;
  packageId: DealerPackageId;
  subscription: Stripe.Subscription;
  checkoutSessionId?: string | null;
}) {
  const pkg = DEALER_PACKAGES[args.packageId];
  const priceId = getDealerPackagePriceId(args.packageId);
  const { currentPeriodStart, currentPeriodEnd } = getSubscriptionPeriod(args.subscription);

  const values = {
    dealerId: args.dealerId,
    userId: args.userId,
    packageId: args.packageId,
    status: args.subscription.status,
    stripeCustomerId:
      typeof args.subscription.customer === "string"
        ? args.subscription.customer
        : args.subscription.customer?.id ?? null,
    stripeSubscriptionId: args.subscription.id,
    stripeCheckoutSessionId: args.checkoutSessionId ?? null,
    stripePriceId: priceId,
    amountKc: pkg.amountKc,
    currency: "CZK",
    maxListings: pkg.cars,
    currentPeriodStart,
    currentPeriodEnd,
    cancelAtPeriodEnd: args.subscription.cancel_at_period_end,
    canceledAt: toDateFromStripeSeconds(args.subscription.canceled_at),
    latestInvoiceId:
      typeof args.subscription.latest_invoice === "string"
        ? args.subscription.latest_invoice
        : args.subscription.latest_invoice?.id ?? null,
    metadata: args.subscription.metadata ?? {},
    updatedAt: new Date(),
  };

  const [existing] = await db
    .select()
    .from(dealerPackageSubscriptions)
    .where(eq(dealerPackageSubscriptions.stripeSubscriptionId, args.subscription.id));

  const [row] = existing
    ? await db
        .update(dealerPackageSubscriptions)
        .set(values)
        .where(eq(dealerPackageSubscriptions.id, existing.id))
        .returning()
    : await db
        .insert(dealerPackageSubscriptions)
        .values({ ...values, createdAt: new Date() })
        .returning();

  if ((ACTIVE_DEALER_PACKAGE_STATUSES as readonly string[]).includes(args.subscription.status)) {
    await db
      .update(dealers)
      .set({
        plan: args.packageId,
        maxListings: pkg.cars,
        updatedAt: new Date(),
      })
      .where(eq(dealers.id, args.dealerId));
  }

  return row;
}

export async function activateDealerPackageFromCheckoutSession(sessionId: string) {
  const stripe = getDealerStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["subscription"],
  });

  if (session.mode !== "subscription") throw new Error("Invalid checkout mode");
  if (session.status !== "complete") throw new Error("Checkout is not complete");
  if (session.metadata?.type !== "dealer_vehicle_package") {
    throw new Error("Invalid checkout session type");
  }

  const packageId = session.metadata.packageId;
  const dealerId = session.metadata.dealerId;
  const userId = session.metadata.userId;
  if (!isDealerPackageId(packageId) || !dealerId || !userId) {
    throw new Error("Missing checkout metadata");
  }

  const subscription =
    typeof session.subscription === "string"
      ? await stripe.subscriptions.retrieve(session.subscription)
      : session.subscription;

  if (!subscription) throw new Error("Subscription missing");

  const row = await upsertDealerPackageSubscription({
    dealerId,
    userId,
    packageId,
    subscription,
    checkoutSessionId: session.id,
  });

  await ensureDealerInvoiceForPackageCheckout({
    dealerId,
    userId,
    packageId,
    subscriptionId: row.id,
    stripeCheckoutSessionId: session.id,
    stripeInvoiceId:
      typeof subscription.latest_invoice === "string"
        ? subscription.latest_invoice
        : subscription.latest_invoice?.id ?? null,
    amountKc: row.amountKc,
  });

  return row;
}

export async function syncDealerSubscriptionFromStripe(subscription: Stripe.Subscription) {
  const packageId =
    isDealerPackageId(subscription.metadata?.packageId)
      ? subscription.metadata.packageId
      : getPackageIdFromPrice(subscription.items.data[0]?.price?.id ?? "");

  const dealerId = subscription.metadata?.dealerId;
  const userId = subscription.metadata?.userId;
  if (!packageId || !dealerId || !userId) {
    throw new Error("Subscription metadata is missing");
  }

  const row = await upsertDealerPackageSubscription({
    dealerId,
    userId,
    packageId,
    subscription,
  });

  if (!(ACTIVE_DEALER_PACKAGE_STATUSES as readonly string[]).includes(subscription.status)) {
    const active = await getActiveDealerPackageSubscription(dealerId);
    if (!active || active.stripeSubscriptionId === subscription.id) {
      await db
        .update(dealers)
        .set({ plan: "free", maxListings: 50, updatedAt: new Date() })
        .where(eq(dealers.id, dealerId));
    }
  }

  return row;
}

export async function getActiveDealerPackageSubscription(dealerId: string) {
  const [row] = await db
    .select()
    .from(dealerPackageSubscriptions)
    .where(
      and(
        eq(dealerPackageSubscriptions.dealerId, dealerId),
        inArray(dealerPackageSubscriptions.status, [...ACTIVE_DEALER_PACKAGE_STATUSES]),
      ),
    )
    .orderBy(desc(dealerPackageSubscriptions.updatedAt));

  if (!row) return null;
  if (!(ACTIVE_DEALER_PACKAGE_STATUSES as readonly string[]).includes(row.status)) {
    return null;
  }
  if (row.currentPeriodEnd && row.currentPeriodEnd.getTime() < Date.now()) {
    return null;
  }
  return row;
}

export async function getLatestDealerPackageSubscription(dealerId: string) {
  const [row] = await db
    .select()
    .from(dealerPackageSubscriptions)
    .where(eq(dealerPackageSubscriptions.dealerId, dealerId))
    .orderBy(desc(dealerPackageSubscriptions.updatedAt));
  return row ?? null;
}

export const DEALER_PACKAGE_REQUIRED_CODE = "dealer_package_required";

export class DealerPackageRequiredError extends Error {
  readonly code = DEALER_PACKAGE_REQUIRED_CODE;

  constructor() {
    super(DEALER_PACKAGE_REQUIRED_CODE);
    this.name = "DealerPackageRequiredError";
  }
}

/** Import (CSV/XML/API) requires an active START / BUSINESS / PRO subscription. */
export async function requireActiveDealerPackage(
  dealerId: string,
  opts?: { isAdmin?: boolean },
) {
  if (opts?.isAdmin) return null;
  const sub = await getActiveDealerPackageSubscription(dealerId);
  if (!sub) throw new DealerPackageRequiredError();
  return sub;
}

export function getAdminDealerPackageBypass() {
  const end = new Date();
  end.setFullYear(end.getFullYear() + 1);
  return {
    id: "admin-import-bypass",
    packageId: "pro" as DealerPackageId,
    status: "active",
    amountKc: 0,
    maxListings: DEALER_PACKAGES.pro.cars,
    currentPeriodEnd: end.toISOString(),
    cancelAtPeriodEnd: false,
  };
}

export function isDealerPackageRequiredError(error: unknown): boolean {
  return (
    error instanceof DealerPackageRequiredError ||
    (error instanceof Error && error.message === DEALER_PACKAGE_REQUIRED_CODE)
  );
}
