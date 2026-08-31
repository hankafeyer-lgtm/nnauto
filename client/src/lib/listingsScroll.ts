import { isMobileViewport } from "@/lib/viewport";

/** Session flag: after Vyhledat / pagination, land on the first listing card. */
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

/** Skip desktop-only duplicates that stay in DOM with `hidden lg:flex`. */
export function isVisibleListingCard(el: HTMLElement): boolean {
  if (!el.isConnected) return false;
  const style = window.getComputedStyle(el);
  if (style.display === "none" || style.visibility === "hidden") return false;
  if (style.opacity === "0") return false;
  // Hidden ancestors (e.g. `.hidden.lg:flex`) → offsetParent null (except fixed).
  if (el.offsetParent === null && style.position !== "fixed") {
    // Still allow if a parent grid is visible — walk up for display:none.
    let node: HTMLElement | null = el;
    while (node) {
      const s = window.getComputedStyle(node);
      if (s.display === "none" || s.visibility === "hidden") return false;
      node = node.parentElement;
    }
  }
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0;
}

function findFirstVisibleListingCard(root: ParentNode): HTMLElement | null {
  const candidates = root.querySelectorAll<HTMLElement>(
    "[data-listing-id], [id^='listing-']",
  );
  for (const el of candidates) {
    if (isVisibleListingCard(el)) return el;
  }
  return null;
}

function preferredScrollBehavior(
  behavior?: ScrollBehavior,
): ScrollBehavior {
  if (behavior) return behavior;
  // iOS Safari often ignores or fights `smooth` during layout swaps.
  return isMobileViewport() ? "auto" : "smooth";
}

function scrollElementBelowChrome(
  el: HTMLElement,
  behavior?: ScrollBehavior,
): void {
  const y =
    window.scrollY + el.getBoundingClientRect().top - stickyChromeOffsetPx();
  window.scrollTo({
    top: Math.max(0, y),
    left: 0,
    behavior: preferredScrollBehavior(behavior),
  });
}

/** Scroll to a specific listing id, preferring a visible card node. */
export function scrollToListingCardById(
  listingId: string,
  opts?: { behavior?: ScrollBehavior; root?: ParentNode | null },
): boolean {
  if (typeof window === "undefined" || !listingId) return false;
  const root = opts?.root ?? document;
  const nodes = root.querySelectorAll<HTMLElement>(
    `[data-listing-id="${CSS.escape(listingId)}"], #listing-${CSS.escape(listingId)}`,
  );
  for (const el of nodes) {
    if (!isVisibleListingCard(el)) continue;
    scrollElementBelowChrome(el, opts?.behavior);
    return true;
  }
  return false;
}

/** Scroll so a section (e.g. the results grid) sits below sticky chrome. */
export function scrollSectionBelowChrome(
  el: HTMLElement | null | undefined,
  behavior?: ScrollBehavior,
): boolean {
  if (typeof window === "undefined" || !el) return false;
  scrollElementBelowChrome(el, behavior);
  return true;
}

/**
 * Drop a leftover `#listing-…` hash. On desktop that hash alone makes the
 * restore logic claim the next scroll, which would otherwise swallow the
 * jump back to the top after paging.
 */
export function clearListingHash(): void {
  if (typeof window === "undefined") return;
  if (!window.location.hash.startsWith("#listing-")) return;
  const { pathname, search } = window.location;
  window.history.replaceState(window.history.state, "", `${pathname}${search}`);
}

/**
 * Scroll so the first *visible* listing card sits below sticky chrome.
 * Home page renders desktop + mobile grids; without a visibility check
 * mobile would target a `display:none` desktop card and appear broken.
 */
export function scrollToFirstListingCard(opts?: {
  behavior?: ScrollBehavior;
  root?: ParentNode | null;
}): boolean {
  if (typeof window === "undefined") return false;
  const root = opts?.root ?? document;
  const first = findFirstVisibleListingCard(root);
  const behavior = preferredScrollBehavior(opts?.behavior);

  if (!first) {
    window.scrollTo({ top: 0, left: 0, behavior });
    return false;
  }

  scrollElementBelowChrome(first, behavior);
  return true;
}
