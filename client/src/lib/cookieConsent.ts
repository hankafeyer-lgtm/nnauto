/**
 * Cookie-consent state shared between the React banner and the analytics
 * bootstrap injected in app/layout.tsx.
 *
 * Storage key and the `nn-consent-changed` event name MUST stay in sync with
 * the inline bootstrap script in the root layout so that trackers which were
 * deferred until consent get flushed the moment the user accepts.
 */

export type CookieConsent = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  ts: number;
};

export type ConsentCategory = "analytics" | "marketing";

const KEY = "nn_cookie_consent_v1";
export const CONSENT_EVENT = "nn-consent-changed";
export const OPEN_SETTINGS_EVENT = "nn-open-cookie-settings";

/** Re-open the cookie settings dialog from anywhere (e.g. a footer link). */
export function openCookieSettings(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(OPEN_SETTINGS_EVENT));
}

export function getConsent(): CookieConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      return {
        necessary: true,
        analytics: !!parsed.analytics,
        marketing: !!parsed.marketing,
        ts: Number(parsed.ts) || 0,
      };
    }
  } catch {
    // ignore malformed value
  }
  return null;
}

export function hasConsentDecision(): boolean {
  return getConsent() !== null;
}

export function hasConsent(category: ConsentCategory): boolean {
  const c = getConsent();
  return !!c && !!c[category];
}

export function saveConsent(choice: {
  analytics: boolean;
  marketing: boolean;
}): CookieConsent {
  const value: CookieConsent = {
    necessary: true,
    analytics: !!choice.analytics,
    marketing: !!choice.marketing,
    ts: Date.now(),
  };
  try {
    localStorage.setItem(KEY, JSON.stringify(value));
  } catch {
    // storage may be unavailable (private mode) — still notify in-memory listeners
  }
  if (typeof window !== "undefined") {
    (window as unknown as { __nnConsent?: CookieConsent }).__nnConsent = value;
    window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value }));
  }
  return value;
}

export function onConsentChange(cb: (c: CookieConsent) => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = (e: Event) => cb((e as CustomEvent).detail as CookieConsent);
  window.addEventListener(CONSENT_EVENT, handler);
  return () => window.removeEventListener(CONSENT_EVENT, handler);
}

/** Run `fn` immediately if the category is granted, otherwise once it becomes granted. */
export function runWhenConsent(category: ConsentCategory, fn: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  if (hasConsent(category)) {
    fn();
    return () => {};
  }
  const off = onConsentChange((c) => {
    if (c[category]) {
      fn();
      off();
    }
  });
  return off;
}
