import { useEffect } from "react";
import { useLocation } from "wouter";

// Key for storing scroll position in sessionStorage
export const SCROLL_POSITION_KEY = "listings_scroll_position";

export function ScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    // Check if we should restore scroll position instead of resetting
    const savedPosition = sessionStorage.getItem(SCROLL_POSITION_KEY);
    
    if (savedPosition && (location === "/" || location === "/listings")) {
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
export function saveScrollPosition() {
  sessionStorage.setItem(SCROLL_POSITION_KEY, String(window.scrollY));
}
