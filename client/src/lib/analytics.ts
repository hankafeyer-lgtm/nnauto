/**
 * Centralized analytics layer for GA4 + Meta Pixel + TikTok Pixel.
 *
 * Goals:
 *  - Count every site visit (GA Consent Mode cookieless pings + durable queues).
 *  - Never drop pageviews while consent/scripts are pending.
 *  - Preserve UTM/click-ids for the session and re-attach them to events.
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
    __nnLastMetaPageViewKey?: string;
    __nnLastMetaPageViewAt?: number;
    __nnLastTtPageViewKey?: string;
    __nnLastTtPageViewAt?: number;
    __nnConsent?: {
      analytics?: boolean;
      marketing?: boolean;
    } | null;
  }
}

const UTM_STORAGE_KEY = "nn_utm_v1";
const LANDING_REFERRER_KEY = "nn_landing_referrer_v1";
const VISIT_SENT_KEY = "nn_visit_beacon_v1";

export const ATTRIBUTION_PARAM_KEYS = [
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
  "wbraid",
  "gbraid",
  "igshid",
] as const;

const UTM_KEYS = [...ATTRIBUTION_PARAM_KEYS];

let initialized = false;
let consentListenersBound = false;

type QueuedTask = {
  id: string;
  trySend: () => boolean;
};

const pendingTasks: QueuedTask[] = [];
let drainTimer: number | null = null;

/**
 * Capture UTM/click-id params from the URL once and persist them.
 * Called as early as possible (in the layout inline script) so that they
 * survive any subsequent history.replaceState that strips query params.
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
      const existing = getStoredUtm();
      const merged = { ...existing, ...found };
      const search = new URLSearchParams(merged).toString();
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

/** Rebuild a URL that keeps campaign params even after SPA strips the query. */
export function buildAttributedUrl(pathWithOptionalQuery?: string): {
  pagePath: string;
  pageLocation: string;
} {
  const utm = getStoredUtm();
  const basePath =
    pathWithOptionalQuery && pathWithOptionalQuery.startsWith("/")
      ? pathWithOptionalQuery
      : `${window.location.pathname}${window.location.search}`;

  const [pathnamePart, queryPart = ""] = basePath.split("?");
  const params = new URLSearchParams(queryPart);
  for (const [k, v] of Object.entries(utm)) {
    if (!params.has(k)) params.set(k, v);
  }
  const qs = params.toString();
  const pagePath = qs ? `${pathnamePart}?${qs}` : pathnamePart;

  try {
    const url = new URL(window.location.href);
    url.pathname = pathnamePart;
    url.search = qs ? `?${qs}` : "";
    url.hash = "";
    return { pagePath, pageLocation: url.toString() };
  } catch {
    return {
      pagePath,
      pageLocation: `${window.location.origin}${pagePath}`,
    };
  }
}

function campaignEventParams(): Record<string, string> {
  const utm = getStoredUtm();
  const out: Record<string, string> = {};
  if (utm.utm_source) out.campaign_source = utm.utm_source;
  if (utm.utm_medium) out.campaign_medium = utm.utm_medium;
  if (utm.utm_campaign) out.campaign_name = utm.utm_campaign;
  if (utm.utm_term) out.campaign_term = utm.utm_term;
  if (utm.utm_content) out.campaign_content = utm.utm_content;
  if (utm.utm_id) out.campaign_id = utm.utm_id;
  if (utm.gclid) out.gclid = utm.gclid;
  if (utm.fbclid) out.fbclid = utm.fbclid;
  if (utm.ttclid) out.ttclid = utm.ttclid;
  if (utm.msclkid) out.msclkid = utm.msclkid;
  if (window.__nn_landing_referrer) {
    out.page_referrer = window.__nn_landing_referrer;
  }
  return out;
}

function scheduleDrain(): void {
  if (typeof window === "undefined") return;
  if (drainTimer != null) return;
  drainTimer = window.setTimeout(() => {
    drainTimer = null;
    drainQueue();
  }, 400);
}

function drainQueue(): void {
  if (pendingTasks.length === 0) return;
  const still: QueuedTask[] = [];
  for (const task of pendingTasks) {
    try {
      if (!task.trySend()) still.push(task);
    } catch {
      still.push(task);
    }
  }
  pendingTasks.length = 0;
  pendingTasks.push(...still);
  if (pendingTasks.length > 0) scheduleDrain();
}

/**
 * Keep retrying until the vendor is ready (and consent allows the send).
 * Pageviews must not be dropped after a few seconds of delay.
 */
function enqueue(id: string, trySend: () => boolean): void {
  if (typeof window === "undefined") return;
  if (trySend()) return;
  // Replace older duplicate of the same logical event (e.g. rapid SPA nav).
  const idx = pendingTasks.findIndex((t) => t.id === id);
  if (idx >= 0) pendingTasks.splice(idx, 1);
  pendingTasks.push({ id, trySend });
  if (!consentListenersBound) {
    consentListenersBound = true;
    window.addEventListener("nn-consent-changed", ((event: Event) => {
      drainQueue();
      const detail = (event as CustomEvent).detail as
        | { analytics?: boolean; marketing?: boolean }
        | undefined;
      if (detail?.analytics || detail?.marketing) {
        trackPageView(
          `${window.location.pathname}${window.location.search}`,
          { force: true },
        );
      }
    }) as EventListener);
  }
  scheduleDrain();
}

function hasAnalyticsConsent(): boolean {
  // Google Consent Mode: always send page_view/events; storage grant is separate.
  return true;
}

function hasMarketingConsent(): boolean {
  const c = window.__nnConsent;
  return !!(c && c.marketing);
}

function abandonMarketing(): boolean {
  const c = window.__nnConsent;
  return !!(c && c.marketing === false);
}

/** First-party beacon so every landing is counted even if ad pixels are blocked. */
function sendFirstPartyVisitBeacon(): void {
  if (typeof window === "undefined") return;
  try {
    if (sessionStorage.getItem(VISIT_SENT_KEY) === "1") return;
    sessionStorage.setItem(VISIT_SENT_KEY, "1");
  } catch {
    /* continue anyway once per page load */
  }

  const { pagePath, pageLocation } = buildAttributedUrl();
  const utm = getStoredUtm();
  const payload = JSON.stringify({
    path: pagePath,
    location: pageLocation,
    referrer: window.__nn_landing_referrer || document.referrer || null,
    utm,
    ts: Date.now(),
  });

  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: "application/json" });
      navigator.sendBeacon("/api/analytics/visit", blob);
      return;
    }
  } catch {
    /* fall through */
  }

  try {
    void fetch("/api/analytics/visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
      credentials: "same-origin",
    });
  } catch {
    /* ignore */
  }
}

export function ensureInitialized(): void {
  if (initialized) return;
  initialized = true;
  captureLandingAttribution();
  sendFirstPartyVisitBeacon();
}

/**
 * Fire a SPA pageview to GA4, Meta Pixel and TikTok Pixel.
 */
export function trackPageView(
  path?: string,
  opts?: { force?: boolean },
): void {
  if (typeof window === "undefined") return;
  ensureInitialized();

  const { pagePath, pageLocation } = buildAttributedUrl(path);
  const pageTitle =
    typeof document !== "undefined" ? document.title : undefined;
  const campaign = campaignEventParams();
  const force = !!opts?.force;

  enqueue(`ga:page_view:${pagePath}`, () => {
    if (!hasAnalyticsConsent()) return false;
    if (typeof window.gtag !== "function") return false;
    const now = Date.now();
    if (
      !force &&
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
      ...campaign,
    });
    return true;
  });

  enqueue(`meta:PageView:${pagePath}`, () => {
    if (abandonMarketing()) return true;
    if (!hasMarketingConsent()) return false;
    if (typeof window.fbq !== "function") return false;
    const now = Date.now();
    if (
      !force &&
      window.__nnLastMetaPageViewKey === pagePath &&
      now - (window.__nnLastMetaPageViewAt || 0) < 2_000
    ) {
      return true;
    }
    window.__nnLastMetaPageViewKey = pagePath;
    window.__nnLastMetaPageViewAt = now;
    window.fbq("track", "PageView");
    return true;
  });

  enqueue(`tt:page:${pagePath}`, () => {
    if (abandonMarketing()) return true;
    if (!hasMarketingConsent()) return false;
    if (!window.ttq || typeof window.ttq.page !== "function") return false;
    const now = Date.now();
    if (
      !force &&
      window.__nnLastTtPageViewKey === pagePath &&
      now - (window.__nnLastTtPageViewAt || 0) < 2_000
    ) {
      return true;
    }
    window.__nnLastTtPageViewKey = pagePath;
    window.__nnLastTtPageViewAt = now;
    window.ttq.page();
    return true;
  });
}

export function trackEvent(
  name: string,
  params: Record<string, unknown> = {},
): void {
  if (typeof window === "undefined") return;
  ensureInitialized();
  const campaign = campaignEventParams();

  enqueue(`ga:event:${name}:${Date.now()}`, () => {
    if (!hasAnalyticsConsent()) return false;
    if (typeof window.gtag !== "function") return false;
    window.gtag("event", name, { ...campaign, ...params });
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
 * Meta attributes ViewContent to the address bar at send time. Only fire on a
 * standalone listing detail URL — never homepage, catalog, listings list, or
 * the homepage/listings iframe overlay (`?embedded=1`).
 */
function canSendListingViewContent(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (window.self !== window.top) return false;
  } catch {
    // Cross-origin frame: treat as embedded and skip.
    return false;
  }
  const params = new URLSearchParams(window.location.search);
  if (params.get("embedded") === "1") return false;
  const path = window.location.pathname;
  return /^\/(listing\/|auta\/[^/]+\/[^/]+\/)/.test(path);
}

/**
 * Fire a "user is looking at this listing" signal across all vendors so paid
 * platforms (Meta, TikTok) can build remarketing audiences and optimise
 * delivery for ViewContent.
 */
export function trackViewContent(p: ViewContentParams = {}): void {
  if (typeof window === "undefined") return;
  if (!canSendListingViewContent()) return;
  ensureInitialized();

  trackEvent("view_item", {
    item_id: p.contentId,
    item_name: p.contentName,
    item_category: p.contentCategory,
    value: p.value,
    currency: p.currency || "CZK",
  });

  enqueue(`meta:ViewContent:${p.contentId || ""}`, () => {
    if (abandonMarketing()) return true;
    // Left the listing page while waiting for consent/fbq — drop, do not send
    // ViewContent against homepage/catalog URL.
    if (!canSendListingViewContent()) return true;
    if (!hasMarketingConsent()) return false;
    if (typeof window.fbq !== "function") return false;
    window.fbq("track", "ViewContent", {
      content_ids: p.contentId ? [p.contentId] : undefined,
      content_name: p.contentName,
      content_category: p.contentCategory,
      content_type: "vehicle",
      value: p.value,
      currency: p.currency || "CZK",
    });
    return true;
  });

  enqueue(`tt:ViewContent:${p.contentId || ""}`, () => {
    if (abandonMarketing()) return true;
    if (!canSendListingViewContent()) return true;
    if (!hasMarketingConsent()) return false;
    if (!window.ttq || typeof window.ttq.track !== "function") return false;
    window.ttq.track("ViewContent", {
      content_id: p.contentId,
      content_name: p.contentName,
      content_category: p.contentCategory,
      content_type: "vehicle",
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
  ensureInitialized();

  trackEvent("contact", {
    method,
    item_id: params.listingId,
    item_name: params.listingName,
  });

  enqueue(`meta:Contact:${params.listingId || ""}:${method}`, () => {
    if (abandonMarketing()) return true;
    if (!hasMarketingConsent()) return false;
    if (typeof window.fbq !== "function") return false;
    window.fbq("track", "Contact", {
      content_ids: params.listingId ? [params.listingId] : undefined,
      content_name: params.listingName,
      method,
    });
    return true;
  });

  enqueue(`tt:Contact:${params.listingId || ""}:${method}`, () => {
    if (abandonMarketing()) return true;
    if (!hasMarketingConsent()) return false;
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
  ensureInitialized();

  trackEvent("generate_lead", {
    item_id: params.listingId,
    item_name: params.listingName,
    value: params.value,
    currency: params.currency || "CZK",
  });

  enqueue(`meta:Lead:${params.listingId || ""}`, () => {
    if (abandonMarketing()) return true;
    if (!hasMarketingConsent()) return false;
    if (typeof window.fbq !== "function") return false;
    window.fbq("track", "Lead", {
      content_ids: params.listingId ? [params.listingId] : undefined,
      content_name: params.listingName,
      value: params.value,
      currency: params.currency || "CZK",
    });
    return true;
  });

  enqueue(`tt:SubmitForm:${params.listingId || ""}`, () => {
    if (abandonMarketing()) return true;
    if (!hasMarketingConsent()) return false;
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
