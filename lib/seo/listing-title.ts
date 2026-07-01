import type { listings } from "@shared/schema";
import { buildListingH1 } from "./listing-meta";

type ListingRow = Partial<typeof listings.$inferSelect>;

/** Server-safe listing title builder (SSR / sitemap / SEO pages). */
export function getListingMainTitleFromRow(l: ListingRow): string {
  const h1 = buildListingH1(l);
  return h1 || (l.title ?? "Vozidlo");
}
