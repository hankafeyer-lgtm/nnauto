/** Tailwind `md` breakpoint (768px): below this width uses mobile layout. */
export const MOBILE_BREAKPOINT_PX = 768;

const mobileMaxWidthQuery = `(max-width: ${MOBILE_BREAKPOINT_PX - 1}px)`;

/** Prefer over `innerWidth < 768`: stable when the mobile browser chrome resizes the layout viewport. */
export function isMobileViewport(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia(mobileMaxWidthQuery).matches;
}

export function mobileViewportMatchMedia(): MediaQueryList {
  return window.matchMedia(mobileMaxWidthQuery);
}

/** Tailwind `lg` (1024px): desktop gallery / wide layout. */
export function isLgViewport(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(min-width: 1024px)").matches;
}
