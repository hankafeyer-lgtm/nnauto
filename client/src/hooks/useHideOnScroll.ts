import { useEffect, useState } from "react";

export type UseHideOnScrollOptions = {
  // How many px the user must move before we react. Small values feel snappy
  // but can flicker on touch devices; the defaults match what the search-page
  // header has been using and what users have been testing against.
  hideAfterDelta?: number;
  showAfterDelta?: number;
  // Always-visible band near the top of the document. Avoids the header
  // briefly disappearing on initial render or when bouncing at the top.
  alwaysVisibleAboveY?: number;
  // Set to true to opt out (e.g. when an overlay/modal is open and you want
  // the header pinned). Reading the option re-runs the effect.
  disabled?: boolean;
};

// Sliding hide-on-scroll-down / show-on-scroll-up state, throttled via rAF.
// Returns `true` when the parent element should be hidden (translate-y-full).
//
// Designed to be UI-agnostic: callers compose it with their own classes
// (e.g. `-translate-y-full` / `translate-y-0`).
export function useHideOnScroll(opts: UseHideOnScrollOptions = {}): boolean {
  const {
    hideAfterDelta = 4,
    showAfterDelta = 4,
    alwaysVisibleAboveY = 10,
    disabled = false,
  } = opts;

  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (disabled) {
      setHidden(false);
      return;
    }

    let lastScrollY = Math.max(0, window.scrollY || 0);
    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const currentY = Math.max(0, window.scrollY || 0);
        const delta = currentY - lastScrollY;

        if (currentY < alwaysVisibleAboveY) {
          setHidden(false);
        } else if (delta > hideAfterDelta) {
          setHidden(true);
        } else if (delta < -showAfterDelta) {
          setHidden(false);
        }

        lastScrollY = currentY;
        ticking = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [disabled, hideAfterDelta, showAfterDelta, alwaysVisibleAboveY]);

  return hidden;
}
