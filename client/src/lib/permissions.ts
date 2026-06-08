/**
 * Super-admin gate (client side). The Admin Dealer Management sections are
 * only visible to the configured super-admin email. Server-side enforcement
 * lives in lib/auth.ts (requireSuperAdmin); this is for UI gating only.
 */
const RAW_SUPER_ADMIN_EMAIL =
  (typeof import.meta !== "undefined" &&
    (import.meta as unknown as { env?: Record<string, string> }).env
      ?.VITE_SUPER_ADMIN_EMAIL) ||
  process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL ||
  "admin@zlateauto.cz";

export const SUPER_ADMIN_EMAIL = RAW_SUPER_ADMIN_EMAIL.trim().toLowerCase();

export function isSuperAdmin(
  user: { email?: string | null } | null | undefined,
): boolean {
  if (!user?.email) return false;
  return user.email.trim().toLowerCase() === SUPER_ADMIN_EMAIL;
}
