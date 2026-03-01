import { useEffect } from "react";
import { useLocation } from "wouter";

// Key for storing scroll position in sessionStorage
export const SCROLL_POSITION_KEY = "listings_scroll_position";
export const LISTINGS_RETURN_URL_KEY = "listings_return_url";
export const LISTINGS_TARGET_ID_KEY = "listings_target_id";
export const LISTINGS_FORCE_RESTORE_KEY = "listings_force_restore";
export const LISTINGS_BACK_STATE_KEY = "__nnautoListingsBack";
export const LISTINGS_RESTORE_ID_PARAM = "_restoreId";
export const LISTINGS_RESTORE_Y_PARAM = "_restoreY";
export const LISTINGS_RESTORE_TOKEN_PARAM = "_restoreToken";

export function ScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    // Check if we should restore scroll position instead of resetting
    const savedPosition = sessionStorage.getItem(SCROLL_POSITION_KEY);

    const pathname = (location || "").split("?")[0];
    // Listings page restores scroll after cards are loaded (handled in ListingsPage)
    if (pathname === "/listings") return;

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
  sessionStorage.setItem(SCROLL_POSITION_KEY, String(window.scrollY));
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
}
