import { useEffect } from "react";
import { useLocation } from "wouter";
import { restoreDebug } from "@/lib/restoreDebug";

// Key for storing scroll position in sessionStorage
export const SCROLL_POSITION_KEY = "listings_scroll_position";
export const LISTINGS_RETURN_URL_KEY = "listings_return_url";
export const LISTINGS_TARGET_ID_KEY = "listings_target_id";
export const LISTINGS_FORCE_RESTORE_KEY = "listings_force_restore";
export const LISTINGS_BACK_STATE_KEY = "__nnautoListingsBack";
export const LISTINGS_RESTORE_ID_PARAM = "_restoreId";
export const LISTINGS_RESTORE_Y_PARAM = "_restoreY";
export const LISTINGS_RESTORE_TOKEN_PARAM = "_restoreToken";
export const LISTINGS_RESTORE_STATE_KEY = "listings_restore_state_v2";
const RESTORE_STATE_MAX_AGE_MS = 10 * 60 * 1000;

export type ListingsRestoreState = {
  returnUrl: string;
  scrollY: number | null;
  listingId: string | null;
  savedAt: number;
};

export function readListingsRestoreState(): ListingsRestoreState | null {
  const raw = sessionStorage.getItem(LISTINGS_RESTORE_STATE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as ListingsRestoreState;
    if (!parsed || typeof parsed !== "object") return null;
    if (typeof parsed.returnUrl !== "string" || !parsed.returnUrl.startsWith("/")) {
      return null;
    }
    if (
      parsed.scrollY !== null &&
      (typeof parsed.scrollY !== "number" || !Number.isFinite(parsed.scrollY))
    ) {
      return null;
    }
    if (
      parsed.listingId !== null &&
      (typeof parsed.listingId !== "string" || parsed.listingId.length === 0)
    ) {
      return null;
    }
    if (typeof parsed.savedAt !== "number" || !Number.isFinite(parsed.savedAt)) {
      return null;
    }
    if (Date.now() - parsed.savedAt > RESTORE_STATE_MAX_AGE_MS) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearListingsRestoreState() {
  sessionStorage.removeItem(LISTINGS_RESTORE_STATE_KEY);
  sessionStorage.removeItem(SCROLL_POSITION_KEY);
  sessionStorage.removeItem(LISTINGS_RETURN_URL_KEY);
  sessionStorage.removeItem(LISTINGS_TARGET_ID_KEY);
}

export function ScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    // Check if we should restore scroll position instead of resetting
    const savedPosition = sessionStorage.getItem(SCROLL_POSITION_KEY);
    const returnUrl = sessionStorage.getItem(LISTINGS_RETURN_URL_KEY);

    const pathname = (location || "").split("?")[0];
    // Listings page restores scroll after cards are loaded (handled in ListingsPage)
    if (pathname === "/listings") return;

    if (savedPosition && pathname === "/" && returnUrl) {
      const [returnPath] = returnUrl.split("#");
      const currentPath = `${window.location.pathname}${window.location.search}`;
      if (returnPath === currentPath) return;
    }

    if (savedPosition && pathname === "/") {
      // Restore saved position after a short delay to ensure content is rendered
      const scrollY = parseInt(savedPosition, 10);
      sessionStorage.removeItem(SCROLL_POSITION_KEY);
      
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        window.scrollTo({ top: scrollY, left: 0, behavior: "instant" });
      });
    } else {
      // Normal behavior - scroll to top
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, [location]);

  return null;
}

// Helper function to save scroll position before navigating to detail page
export function saveScrollPosition(listingId?: string) {
  restoreDebug("save", "before-save-scroll-state", {
    pathname: window.location.pathname,
    search: window.location.search,
    hash: window.location.hash,
    listingId: listingId ?? null,
    scrollY: window.scrollY,
  });
  const scrollY = Number.isFinite(window.scrollY) ? Math.max(0, window.scrollY) : 0;
  sessionStorage.setItem(SCROLL_POSITION_KEY, String(scrollY));
  const anchor = listingId ? `#listing-${encodeURIComponent(listingId)}` : "";
  const returnUrl = `${window.location.pathname}${window.location.search}${anchor}`;
  sessionStorage.setItem(
    LISTINGS_RETURN_URL_KEY,
    returnUrl,
  );
  if (listingId) {
    sessionStorage.setItem(LISTINGS_TARGET_ID_KEY, listingId);
  } else {
    sessionStorage.removeItem(LISTINGS_TARGET_ID_KEY);
  }
  const state: ListingsRestoreState = {
    returnUrl,
    scrollY,
    listingId: listingId ?? null,
    savedAt: Date.now(),
  };
  sessionStorage.setItem(LISTINGS_RESTORE_STATE_KEY, JSON.stringify(state));
  restoreDebug("save", "saved-restore-state", {
    returnUrl,
    savedScrollY: scrollY,
    savedListingId: listingId ?? null,
    savedAt: state.savedAt,
  });
}
