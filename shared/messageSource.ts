/**
 * Single source of truth for the listing-source identifier appended to
 * every buyer-originated outbound message (WhatsApp, Telegram, mailto:,
 * contact form). Lives in /shared so the same constants are used on
 * both client and server — the API route runs the helper again as a
 * defensive append in case a client skipped it.
 *
 * Rules:
 *  - Append `\n\nInzerát z NNAuto.cz` to the end of the user's message.
 *  - Never duplicate the tag — if any case-insensitive `nnauto.cz`
 *    substring is already present, return the text untouched.
 *  - An empty / whitespace-only message yields just the tag (so a
 *    buyer who hits Send without typing still ships the source).
 */

export const LISTING_SOURCE_TAG = "Inzerát z NNAuto.cz";

/**
 * Detection is intentionally broad: any spelling/casing of the brand
 * domain counts as "already attributed". Catches both the canonical
 * tag we generate AND organic mentions a user might type themselves
 * (e.g. "našel jsem váš inzerát na NNAuto.cz").
 */
const ALREADY_TAGGED = /nnauto\.cz/i;

export function appendListingSourceTag(message: string | null | undefined): string {
  const text = (message ?? "").toString();
  const trimmedRight = text.replace(/[\s\u00a0]+$/g, "");
  if (!trimmedRight) return LISTING_SOURCE_TAG;
  if (ALREADY_TAGGED.test(trimmedRight)) return trimmedRight;
  return `${trimmedRight}\n\n${LISTING_SOURCE_TAG}`;
}

/** True if the given message already carries any nnauto.cz attribution. */
export function hasListingSourceTag(message: string | null | undefined): boolean {
  return ALREADY_TAGGED.test((message ?? "").toString());
}
