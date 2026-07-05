/**
 * Centralized analytics layer for GA4 + Meta Pixel + TikTok Pixel.
 *
 * Goals:
 *  - Never lose events when a vendor script is still loading: queue and replay.
 *  - Preserve UTM parameters for the lifetime of the session, even if the URL
 *    is rewritten (history.replaceState in modal/openListing flows can wipe them).
 *  - Fire a single consistent API for SPA pageviews and key business events.
 *
 * The vendor scripts themselves are loaded immediately in `app/layout.tsx`.
 * If a vendor isn't configured (e.g. Meta Pixel ID missing), the calls become no-ops.
 */

type GtagFn = (...args: unknown[]) => void;
type FbqFn = ((...args: unknown[]) => void) & { queue?: unknown[] };
type TtqFn = {
  page?: () => void;
  track?: (event: string, params?: Record<string, unknown>) => void;
};

declare global {
  interface Window {
    gtag?: GtagFn;
    dataLayer?: unknown[];
    fbq?: FbqFn;
    _fbq?: FbqFn;
    ttq?: TtqFn;
    __nn_utm?: string;
    __nn_landing_referrer?: string;
    __nnLastGaPageViewKey?: string;
    __nnLastGaPageViewAt?: number;
  }
}

const UTM_STORAGE_KEY = "nn_utm_v1";
const LANDING_REFERRER_KEY = "nn_landing_referrer_v1";

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "utm_id",
  "gclid",
  "fbclid",
  "ttclid",
  "msclkid",
];

let initialized = false;

/**
 * Capture UTM/click-id params from the URL once and persist them.
 * Called as early as possible (in the layout inline script) so that they
 * survive any subsequent history.replaceState that strips query params.
 *
 * Idempotent: safe to call multiple times — only writes if nothing stored yet.
 */
export function captureLandingAttribution(): void {
  if (typeof window === "undefined") return;
  try {
    const url = new URL(window.location.href);
    const params = url.searchParams;

    const found: Record<string, string> = {};
    for (const k of UTM_KEYS) {
      const v = params.get(k);
      if (v) found[k] = v;
    }

    if (Object.keys(found).length > 0) {
      const search = new URLSearchParams(found).toString();
      try {
        sessionStorage.setItem(UTM_STORAGE_KEY, search);
      } catch {
        /* storage unavailable */
      }
      window.__nn_utm = search;
    } else {
      try {
        const stored = sessionStorage.getItem(UTM_STORAGE_KEY);
        if (stored) window.__nn_utm = stored;
      } catch {
        /* ignore */
      }
    }

    if (document.referrer) {
      try {
        const referrerHost = new URL(document.referrer).host;
        if (referrerHost && referrerHost !== window.location.host) {
          if (!sessionStorage.getItem(LANDING_REFERRER_KEY)) {
            sessionStorage.setItem(LANDING_REFERRER_KEY, document.referrer);
          }
          window.__nn_landing_referrer =
            sessionStorage.getItem(LANDING_REFERRER_KEY) || document.referrer;
        }
      } catch {
        /* ignore */
      }
    } else {
      try {
        window.__nn_landing_referrer =
          sessionStorage.getItem(LANDING_REFERRER_KEY) || undefined;
      } catch {
        /* ignore */
      }
    }
  } catch {
    /* analytics must never break the app */
  }
}

export function getStoredUtm(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw =
      window.__nn_utm || sessionStorage.getItem(UTM_STORAGE_KEY) || "";
    if (!raw) return {};
    const out: Record<string, string> = {};
    for (const [k, v] of new URLSearchParams(raw).entries()) {
      out[k] = v;
    }
    return out;
  } catch {
    return {};
  }
}

/**
 * Retry-safe wrapper around vendor SDKs. We retry up to ~6s while the script
 * is still loading; after that the event is dropped (vendor most likely failed
 * to load and re-trying forever would leak memory).
 */
function retry(fn: () => boolean, attempts = 20, intervalMs = 300): void {
  if (typeof window === "undefined") return;
  let left = attempts;
  const tick = () => {
    if (fn()) return;
    if (--left <= 0) return;
    window.setTimeout(tick, intervalMs);
  };
  tick();
}

export function ensureInitialized(): void {
  if (initialized) return;
  initialized = true;
  captureLandingAttribution();
}

/**
 * Fire a SPA pageview to GA4, Meta Pixel and TikTok Pixel.
 * Each vendor is queued independently so a slow vendor never blocks others.
 */
export function trackPageView(path?: string): void {
  if (typeof window === "undefined") return;
  ensureInitialized();

  const pagePath =
    path && path.startsWith("/")
      ? path
      : `${window.location.pathname}${window.location.search}`;
  const pageLocation = (() => {
    try {
      const url = new URL(window.location.href);
      url.pathname = pagePath.split("?")[0];
      const qs = pagePath.split("?")[1];
      url.search = qs ? `?${qs}` : "";
      return url.toString();
    } catch {
      return window.location.href;
    }
  })();
  const pageTitle =
    typeof document !== "undefined" ? document.title : undefined;

  retry(() => {
    if (typeof window.gtag !== "function") return false;
    const now = Date.now();
    if (
      window.__nnLastGaPageViewKey === pagePath &&
      now - (window.__nnLastGaPageViewAt || 0) < 2_000
    ) {
      return true;
    }
    window.__nnLastGaPageViewKey = pagePath;
    window.__nnLastGaPageViewAt = now;
    window.gtag("event", "page_view", {
      page_path: pagePath,
      page_location: pageLocation,
      page_title: pageTitle,
    });
    return true;
  });

  retry(() => {
    if (typeof window.fbq !== "function") return false;
    window.fbq("track", "PageView");
    return true;
  });

  retry(() => {
    if (!window.ttq || typeof window.ttq.page !== "function") return false;
    window.ttq.page();
    return true;
  });
}

export function trackEvent(
  name: string,
  params: Record<string, unknown> = {},
): void {
  if (typeof window === "undefined") return;

  retry(() => {
    if (typeof window.gtag !== "function") return false;
    window.gtag("event", name, params);
    return true;
  });
}

export type ViewContentParams = {
  contentId?: string;
  contentName?: string;
  contentCategory?: string;
  value?: number;
  currency?: string;
};

/**
 * Fire a "user is looking at this listing" signal across all vendors so paid
 * platforms (Meta, TikTok) can build remarketing audiences and optimise
 * delivery for ViewContent.
 */
export function trackViewContent(p: ViewContentParams = {}): void {
  if (typeof window === "undefined") return;

  trackEvent("view_item", {
    item_id: p.contentId,
    item_name: p.contentName,
    item_category: p.contentCategory,
    value: p.value,
    currency: p.currency || "CZK",
  });

  retry(() => {
    if (typeof window.fbq !== "function") return false;
    window.fbq("track", "ViewContent", {
      content_ids: p.contentId ? [p.contentId] : undefined,
      content_name: p.contentName,
      content_category: p.contentCategory,
      content_type: "product",
      value: p.value,
      currency: p.currency || "CZK",
    });
    return true;
  });

  retry(() => {
    if (!window.ttq || typeof window.ttq.track !== "function") return false;
    window.ttq.track("ViewContent", {
      content_id: p.contentId,
      content_name: p.contentName,
      content_category: p.contentCategory,
      content_type: "product",
      value: p.value,
      currency: p.currency || "CZK",
    });
    return true;
  });
}

export type ContactMethod =
  | "phone"
  | "whatsapp"
  | "telegram"
  | "email"
  | "form"
  | "other";

export function trackContact(
  method: ContactMethod,
  params: { listingId?: string; listingName?: string } = {},
): void {
  if (typeof window === "undefined") return;

  trackEvent("contact", {
    method,
    item_id: params.listingId,
    item_name: params.listingName,
  });

  retry(() => {
    if (typeof window.fbq !== "function") return false;
    window.fbq("track", "Contact", {
      content_ids: params.listingId ? [params.listingId] : undefined,
      content_name: params.listingName,
      method,
    });
    return true;
  });

  retry(() => {
    if (!window.ttq || typeof window.ttq.track !== "function") return false;
    window.ttq.track("Contact", {
      content_id: params.listingId,
      content_name: params.listingName,
      method,
    });
    return true;
  });
}

export function trackLead(
  params: {
    listingId?: string;
    listingName?: string;
    value?: number;
    currency?: string;
  } = {},
): void {
  if (typeof window === "undefined") return;

  trackEvent("generate_lead", {
    item_id: params.listingId,
    item_name: params.listingName,
    value: params.value,
    currency: params.currency || "CZK",
  });

  retry(() => {
    if (typeof window.fbq !== "function") return false;
    window.fbq("track", "Lead", {
      content_ids: params.listingId ? [params.listingId] : undefined,
      content_name: params.listingName,
      value: params.value,
      currency: params.currency || "CZK",
    });
    return true;
  });

  retry(() => {
    if (!window.ttq || typeof window.ttq.track !== "function") return false;
    window.ttq.track("SubmitForm", {
      content_id: params.listingId,
      content_name: params.listingName,
      value: params.value,
      currency: params.currency || "CZK",
    });
    return true;
  });
}
