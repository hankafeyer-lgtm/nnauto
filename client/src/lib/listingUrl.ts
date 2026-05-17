/**
 * Client-side listing URL helpers — thin wrapper around the shared SEO
 * builder in `lib/seo/listing-url.ts` so cards, navigation and CSR meta
 * use the same canonical slug format as the App Router pages.
 */
import {
  buildListingUrl,
  buildListingAbsoluteUrl as buildListingAbsoluteUrlWithOrigin,
  extractShortIdFromSlug,
  isListingDetailPath,
  type ListingUrlInput,
} from "@lib/seo/listing-url";

export type { ListingUrlInput };
export { extractShortIdFromSlug, isListingDetailPath };

const SITE_ORIGIN = "https://nnauto.cz";

/** @deprecated Prefer the name `buildListingUrl` — kept for existing imports. */
export function buildListingPath(input: ListingUrlInput): string {
  return buildListingUrl(input);
}

export function buildListingAbsoluteUrl(input: ListingUrlInput): string {
  return buildListingAbsoluteUrlWithOrigin(SITE_ORIGIN, input);
}
