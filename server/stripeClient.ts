import Stripe from 'stripe';

async function getCredentials() {
  // First, try to get keys from environment variables (manual setup)
  const envSecretKey = process.env.STRIPE_SECRET_KEY;
  const envPublishableKey = process.env.STRIPE_PUBLISHABLE_KEY;
  
  if (envSecretKey && envPublishableKey) {
    return {
      publishableKey: envPublishableKey,
      secretKey: envSecretKey,
    };
  }

  // Fallback to Replit connection API
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? 'repl ' + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
      ? 'depl ' + process.env.WEB_REPL_RENEWAL
      : null;

  if (!xReplitToken || !hostname) {
    throw new Error('Stripe not configured: Set STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY environment variables');
  }

  const connectorName = 'stripe';
  const isProduction = process.env.REPLIT_DEPLOYMENT === '1';
  const targetEnvironment = isProduction ? 'production' : 'development';

  const url = new URL(`https://${hostname}/api/v2/connection`);
  url.searchParams.set('include_secrets', 'true');
  url.searchParams.set('connector_names', connectorName);
  url.searchParams.set('environment', targetEnvironment);

  const response = await fetch(url.toString(), {
    headers: {
      'Accept': 'application/json',
      'X_REPLIT_TOKEN': xReplitToken
    }
  });

  const data = await response.json();
  const connectionSettings = data.items?.[0];

  if (!connectionSettings || (!connectionSettings.settings.publishable || !connectionSettings.settings.secret)) {
    throw new Error('Stripe not configured: Set STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY environment variables');
  }

  return {
    publishableKey: connectionSettings.settings.publishable,
    secretKey: connectionSettings.settings.secret,
  };
}

// WARNING: Never cache this client.
// Always call this function again to get a fresh client.
export async function getUncachableStripeClient() {
  const { secretKey } = await getCredentials();

  return new Stripe(secretKey, {
    apiVersion: '2025-08-27.basil',
  });
}

// Use getStripePublishableKey() for client-side operations
export async function getStripePublishableKey() {
  const { publishableKey } = await getCredentials();
  return publishableKey;
}

// Use getStripeSecretKey() for server-side operations requiring the secret key
export async function getStripeSecretKey() {
  const { secretKey } = await getCredentials();
  return secretKey;
}

// StripeSync singleton for webhook processing and data sync
let stripeSync: any = null;

export async function getStripeSync() {
  if (!stripeSync) {
    const { StripeSync } = await import('stripe-replit-sync');
    const secretKey = await getStripeSecretKey();
    const dbUrl =
      process.env.DATABASE_URL_POOLED ||
      process.env.PRODUCTION_DATABASE_URL ||
      process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error("DATABASE_URL must be set for Stripe sync");
    }

    stripeSync = new StripeSync({
      poolConfig: {
        connectionString: dbUrl.trim(),
        max: 2,
      },
      stripeSecretKey: secretKey,
    });
  }
  return stripeSync;
}
