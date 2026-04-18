const isProductionRuntime =
  process.env.NODE_ENV === "production" ||
  Boolean(process.env.REPLIT_DEPLOYMENT) ||
  process.env.NN_AUTO_REQUIRE_PROD_SECRETS === "true";

const MIN_SECRET_LENGTH = 32;

/**
 * JWT signing/verification secret. In production, weak or missing secrets are rejected.
 */
export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET || process.env.SESSION_SECRET;
  if (isProductionRuntime) {
    if (!secret || secret.length < MIN_SECRET_LENGTH) {
      throw new Error(
        `JWT_SECRET or SESSION_SECRET must be set in production (min ${MIN_SECRET_LENGTH} characters).`,
      );
    }
    return secret;
  }
  if (secret && secret.length >= MIN_SECRET_LENGTH) return secret;
  return secret || "dev-only-nnauto-jwt-secret-not-for-production";
}
