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

  const warm = () => {
    // Warm the most frequently used routes first.
    void loadListingsPage();
    void loadListingDetailPage();
    if (!shouldUseLightWarmup) {
      void loadAddListingPage();
      void loadProfilePage();
      void loadSettingsPage();
    }
  };

  const idleApi = window as Window & {
    requestIdleCallback?: (
      callback: () => void,
      options?: { timeout: number },
    ) => number;
    cancelIdleCallback?: (id: number) => void;
  };

  if (idleApi.requestIdleCallback) {
    idleApi.requestIdleCallback(warm, { timeout: 250 });
    return;
  }

  window.setTimeout(warm, 60);
}

