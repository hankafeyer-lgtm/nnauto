/** Session flag: after Vyhledat / apply, land on the first listing card. */
export const LISTINGS_SCROLL_TO_FIRST_KEY = "nnauto_scroll_to_first_listing";

export function requestScrollToFirstListing() {
  try {
    sessionStorage.setItem(LISTINGS_SCROLL_TO_FIRST_KEY, "1");
  } catch {
    // ignore quota / private mode
  }
}

export function hasScrollToFirstListingRequest(): boolean {
  try {
    return sessionStorage.getItem(LISTINGS_SCROLL_TO_FIRST_KEY) === "1";
  } catch {
    return false;
  }
}

export function clearScrollToFirstListingRequest() {
  try {
    sessionStorage.removeItem(LISTINGS_SCROLL_TO_FIRST_KEY);
  } catch {
    // ignore
  }
}

function stickyChromeOffsetPx(): number {
  const header = document.querySelector("header");
  const headerH = header?.getBoundingClientRect().height ?? 72;
  // Desktop listings also has a sort/filter chrome bar under the header.
  // If it is still in view near the top, include it so card #1 is not hidden.
  let chromeH = 0;
  const sortChrome = document.querySelector<HTMLElement>(".border-b.bg-card");
  if (sortChrome) {
    const r = sortChrome.getBoundingClientRect();
    if (r.top < headerH + 8 && r.bottom > headerH) {
      chromeH = Math.max(0, r.bottom - headerH);
    }
  }
  return Math.round(headerH + chromeH + 12);
}

function findFirstListingCard(root: ParentNode): HTMLElement | null {
  // Prefer real card nodes (desktop + mobile CarCard), skip any stray ids.
  const byData = root.querySelector<HTMLElement>("[data-listing-id]");
  if (byData) return byData;
  return root.querySelector<HTMLElement>("[id^='listing-']");
}

/**
 * Scroll so the first listing card sits just below sticky page chrome.
 * Using the section title (`block: "start"`) often leaves the first card
 * under the header on desktop, so the second card looks like the start.
 */
export function scrollToFirstListingCard(opts?: {
  behavior?: ScrollBehavior;
  root?: ParentNode | null;
}): boolean {
  if (typeof window === "undefined") return false;
  const root = opts?.root ?? document;
  const first = findFirstListingCard(root);
  const behavior = opts?.behavior ?? "smooth";

  if (!first) {
    window.scrollTo({ top: 0, left: 0, behavior });
    return false;
  }

  const y =
    window.scrollY + first.getBoundingClientRect().top - stickyChromeOffsetPx();
  window.scrollTo({ top: Math.max(0, y), left: 0, behavior });
  return true;
}
