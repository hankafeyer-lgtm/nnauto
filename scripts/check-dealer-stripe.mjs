import "dotenv/config";
import Stripe from "stripe";

function mask(value) {
  if (!value) return "(missing)";
  if (value.length <= 12) return value;
  return `${value.slice(0, 8)}…${value.slice(-4)} (len ${value.length})`;
}

const secret = process.env.DEALER_STRIPE_SECRET_KEY;
const publishable = process.env.DEALER_STRIPE_PUBLISHABLE_KEY;
const prices = {
  START: process.env.DEALER_STRIPE_PRICE_START,
  BUSINESS: process.env.DEALER_STRIPE_PRICE_BUSINESS,
  PRO: process.env.DEALER_STRIPE_PRICE_PRO,
};

console.log("=== Dealer Stripe config ===");
console.log("DEALER_STRIPE_SECRET_KEY     :", mask(secret));
console.log("DEALER_STRIPE_PUBLISHABLE_KEY:", mask(publishable));
console.log("DEALER_STRIPE_PRICE_START    :", prices.START || "(missing)");
console.log("DEALER_STRIPE_PRICE_BUSINESS :", prices.BUSINESS || "(missing)");
console.log("DEALER_STRIPE_PRICE_PRO      :", prices.PRO || "(missing)");
console.log("");

if (!secret) {
  console.error("ERROR: DEALER_STRIPE_SECRET_KEY is missing in .env");
  process.exit(1);
}

const mode = secret.startsWith("sk_live_")
  ? "LIVE"
  : secret.startsWith("sk_test_")
    ? "TEST"
    : "UNKNOWN";
console.log("Secret key mode:", mode);
console.log("");

const stripe = new Stripe(secret);

async function checkAccount() {
  try {
    const acct = await stripe.accounts.retrieve();
    console.log("✅ Secret key is VALID. Account:", acct.id, acct.business_profile?.name || "");
    return true;
  } catch (err) {
    console.error("❌ Secret key REJECTED by Stripe:", err.message);
    return false;
  }
}

async function checkPrice(label, id) {
  if (!id) {
    console.error(`❌ ${label}: price id missing in .env`);
    return;
  }
  try {
    const price = await stripe.prices.retrieve(id);
    const amount = price.unit_amount != null ? price.unit_amount / 100 : "?";
    console.log(
      `✅ ${label}: ${id} -> ${amount} ${price.currency?.toUpperCase()} ` +
        `(${price.recurring?.interval || "one-time"}), livemode=${price.livemode}, active=${price.active}`,
    );
  } catch (err) {
    console.error(`❌ ${label}: ${id} -> ${err.message}`);
  }
}

const ok = await checkAccount();
console.log("");
if (ok) {
  await checkPrice("START   ", prices.START);
  await checkPrice("BUSINESS", prices.BUSINESS);
  await checkPrice("PRO     ", prices.PRO);
}
console.log("\nDone.");
