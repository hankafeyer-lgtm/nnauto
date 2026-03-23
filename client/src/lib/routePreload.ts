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

  const warm = () => {
    // Warm the most frequently used routes first.
    void loadListingsPage();
    void loadListingDetailPage();
    void loadAddListingPage();
    void loadProfilePage();
    void loadSettingsPage();
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

