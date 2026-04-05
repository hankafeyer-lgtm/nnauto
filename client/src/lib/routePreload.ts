import { isMobileViewport } from "@/lib/viewport";

export const loadHomePage = () => import("@/pages/HomePage");
export const loadListingsPage = () => import("@/pages/ListingsPage");
export const loadListingDetailPage = () => import("@/pages/ListingDetailPage");
export const loadAddListingPage = () => import("@/pages/AddListingPage");
export const loadProfilePage = () => import("@/pages/ProfilePage");
export const loadSettingsPage = () => import("@/pages/SettingsPage");
export const loadAdminPage = () => import("@/pages/AdminPage");
export const loadPricingPage = () => import("@/pages/PricingPage");
export const loadPrivacyPolicyPage = () => import("@/pages/PrivacyPolicyPage");
export const loadAboutPage = () => import("@/pages/AboutPage");
export const loadTipsPage = () => import("@/pages/TipsPage");
export const loadCebiaReturnPage = () => import("@/pages/CebiaReturnPage");
export const loadNotFoundPage = () => import("@/pages/not-found");

let didWarmCoreRoutes = false;

export function warmCoreRoutes() {
  if (didWarmCoreRoutes || typeof window === "undefined") return;
  didWarmCoreRoutes = true;

  const connection = (
    navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    }
  ).connection;
  const isConstrainedNetwork =
    connection?.saveData === true ||
    connection?.effectiveType === "slow-2g" ||
    connection?.effectiveType === "2g";
  const isMobileLikeViewport = isMobileViewport();
  const shouldUseLightWarmup = isConstrainedNetwork || isMobileLikeViewport;

  const warmPrimary = () => {
    void loadListingsPage();
    void loadListingDetailPage();
  };

  const warmSecondary = () => {
    if (shouldUseLightWarmup) return;
    void loadAddListingPage();
    void loadProfilePage();
  };

  const idleApi = window as Window & {
    requestIdleCallback?: (
      callback: () => void,
      options?: { timeout: number },
    ) => number;
    cancelIdleCallback?: (id: number) => void;
  };

  const primaryDelay = shouldUseLightWarmup ? 2000 : 200;
  const secondaryDelay = shouldUseLightWarmup ? 8000 : 3000;

  if (idleApi.requestIdleCallback) {
    idleApi.requestIdleCallback(warmPrimary, { timeout: primaryDelay });
    idleApi.requestIdleCallback(warmSecondary, { timeout: secondaryDelay });
    return;
  }

  window.setTimeout(warmPrimary, primaryDelay);
  window.setTimeout(warmSecondary, secondaryDelay);
}

