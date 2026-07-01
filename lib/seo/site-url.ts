const DEFAULT_SITE_ORIGIN = "https://nnauto.cz";

/** Single source of truth for the public site origin (canonical, sitemap, OG, JSON-LD). */
export function getSiteOrigin(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    DEFAULT_SITE_ORIGIN;
  return raw.replace(/\/+$/, "");
}

export const SITE_ORIGIN = getSiteOrigin();

export function absoluteUrl(path: string): string {
  if (!path) return SITE_ORIGIN;
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
}
