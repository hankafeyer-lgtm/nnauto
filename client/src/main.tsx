import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const INTERNAL_OPEN_LISTING_KEY = "nnauto:internal-open-listing";

const handleInitialOpenListingDeepLink = () => {
  if (typeof window === "undefined") return false;

  const url = new URL(window.location.href);
  const isOverlayHostRoute = url.pathname === "/" || url.pathname === "/listings";
  if (!isOverlayHostRoute) return false;

  const opened = url.searchParams.get("openListing");
  if (!opened) return false;

  let internalOpenListingId: string | null = null;
  try {
    internalOpenListingId = window.sessionStorage.getItem(INTERNAL_OPEN_LISTING_KEY);
  } catch {
    internalOpenListingId = null;
  }

  const isInternalOverlayOpen = internalOpenListingId === opened;
  const navEntry = performance.getEntriesByType("navigation")[0] as
    | PerformanceNavigationTiming
    | undefined;
  const isReload = navEntry?.type === "reload";

  // Keep refresh invariant for internal overlay opens: don't reopen previous card.
  if (isReload && isInternalOverlayOpen) {
    url.searchParams.delete("openListing");
    window.history.replaceState(window.history.state, "", url.toString());
    try {
      window.sessionStorage.removeItem(INTERNAL_OPEN_LISTING_KEY);
    } catch {
      // ignore sessionStorage issues
    }
    return false;
  }

  // Internal overlay navigation should keep current in-page flow.
  if (isInternalOverlayOpen) return false;

  // External/opened share links should always land on dedicated listing detail route.
  window.location.replace(`/listing/${opened}`);
  return true;
};

const initClarity = async () => {
  try {
    const response = await fetch("/api/analytics/config", {
      credentials: "same-origin",
    });
    if (!response.ok) return;

    const data = (await response.json()) as {
      clarityProjectId?: string | null;
    };
    const projectId = (data?.clarityProjectId || "").trim();
    if (!projectId) return;

    const clarityWindow = window as Window & {
      clarity?: (...args: any[]) => void;
    };
    if (typeof clarityWindow.clarity === "function") return;

    (
      function (
        c: Window & { clarity?: (...args: any[]) => void; [key: string]: any },
        l: Document,
        a: string,
        r: string,
        i: string,
        t?: HTMLScriptElement,
        y?: Element | null,
      ) {
        c[a] =
          c[a] ||
          function (...args: any[]) {
            (c[a].q = c[a].q || []).push(args);
          };
        t = l.createElement(r) as HTMLScriptElement;
        t.async = true;
        t.src = `https://www.clarity.ms/tag/${i}`;
        y = l.getElementsByTagName(r)[0];
        y?.parentNode?.insertBefore(t, y);
      }
    )(window as any, document, "clarity", "script", projectId);
  } catch {
    // no-op
  }
};

const scheduleClarityInit = () => {
  if (typeof window === "undefined") return;

  const start = () => {
    void initClarity();
  };

  const requestIdleCallback = (
    window as Window & {
      requestIdleCallback?: (
        callback: () => void,
        options?: { timeout: number },
      ) => void;
    }
  ).requestIdleCallback;

  if (typeof requestIdleCallback === "function") {
    requestIdleCallback(start, { timeout: 2000 });
    return;
  }

  window.setTimeout(start, 1200);
};

if (typeof window !== "undefined") {
  if (document.readyState === "complete") {
    scheduleClarityInit();
  } else {
    window.addEventListener("load", scheduleClarityInit, { once: true });
  }
}

const redirectedFromOpenListing = handleInitialOpenListingDeepLink();

if (!redirectedFromOpenListing) {
  createRoot(document.getElementById("root")!).render(<App />);
}
