import type { listings } from "@shared/schema";

type ListingRow = Partial<typeof listings.$inferSelect>;

/** Server-safe listing title builder (SSR / sitemap / SEO pages). */
export function getListingMainTitleFromRow(l: ListingRow): string {
  const cap = (v: string | null | undefined) =>
    v ? v.charAt(0).toUpperCase() + v.slice(1) : "";
  const parts = [
    cap(l.brand),
    cap(l.model),
    l.year ? String(l.year) : "",
  ].filter(Boolean);
  const base = parts.join(" ").trim();
  return base || (l.title ?? "Vozidlo");
}
