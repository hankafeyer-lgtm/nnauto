import { Switch, Route } from "wouter";
import { lazy, Suspense, memo } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { FavoritesButton } from "@/components/FavoritesButton";
import { ScrollToTop } from "@/components/ScrollToTop";

const HomePage = lazy(() => import("@/pages/HomePage"));
const ListingsPage = lazy(() => import("@/pages/ListingsPage"));
const ListingDetailPage = lazy(() => import("@/pages/ListingDetailPage"));
const AddListingPage = lazy(() => import("@/pages/AddListingPage"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));
const AdminPage = lazy(() => import("@/pages/AdminPage"));
const PricingPage = lazy(() => import("@/pages/PricingPage"));
const PrivacyPolicyPage = lazy(() => import("@/pages/PrivacyPolicyPage"));
const AboutPage = lazy(() => import("@/pages/AboutPage"));
const TipsPage = lazy(() => import("@/pages/TipsPage"));
const CebiaReturnPage = lazy(() => import("@/pages/CebiaReturnPage"));
const NotFound = lazy(() => import("@/pages/not-found"));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}

const SuspenseHome = memo(() => (
  <Suspense fallback={<PageLoader />}>
    <HomePage />
  </Suspense>
));

const SuspenseListings = memo(() => (
  <Suspense fallback={<PageLoader />}>
    <ListingsPage />
  </Suspense>
));

const SuspenseListingDetail = memo(() => (
  <Suspense fallback={<PageLoader />}>
    <ListingDetailPage />
  </Suspense>
));

const SuspenseAddListing = memo(() => (
  <Suspense fallback={<PageLoader />}>
    <AddListingPage />
  </Suspense>
));

const SuspenseProfile = memo(() => (
  <Suspense fallback={<PageLoader />}>
    <ProfilePage />
  </Suspense>
));

const SuspenseSettings = memo(() => (
  <Suspense fallback={<PageLoader />}>
    <SettingsPage />
  </Suspense>
));

const SuspenseAdmin = memo(() => (
  <Suspense fallback={<PageLoader />}>
    <AdminPage />
  </Suspense>
));

const SuspensePricing = memo(() => (
  <Suspense fallback={<PageLoader />}>
    <PricingPage />
  </Suspense>
));

const SuspensePrivacy = memo(() => (
  <Suspense fallback={<PageLoader />}>
    <PrivacyPolicyPage />
  </Suspense>
));

const SuspenseAbout = memo(() => (
  <Suspense fallback={<PageLoader />}>
    <AboutPage />
  </Suspense>
));

const SuspenseTips = memo(() => (
  <Suspense fallback={<PageLoader />}>
    <TipsPage />
  </Suspense>
));

const SuspenseCebiaReturn = memo(() => (
  <Suspense fallback={<PageLoader />}>
    <CebiaReturnPage />
  </Suspense>
));
const SuspenseNotFound = memo(() => (
  <Suspense fallback={<PageLoader />}>
    <NotFound />
  </Suspense>
));

function Router() {
  return (
    <>
      <ScrollToTop />
      <Switch>
        <Route path="/" component={SuspenseHome} />
        <Route path="/listings" component={SuspenseListings} />
        <Route path="/listing/:id" component={SuspenseListingDetail} />
        <Route path="/add-listing" component={SuspenseAddListing} />
        <Route path="/profile" component={SuspenseProfile} />
        <Route path="/settings" component={SuspenseSettings} />
        <Route path="/admin" component={SuspenseAdmin} />
        <Route path="/pricing" component={SuspensePricing} />
        <Route path="/privacy" component={SuspensePrivacy} />
        <Route path="/about" component={SuspenseAbout} />
        <Route path="/tips" component={SuspenseTips} />
        <Route path="/cebia/return" component={SuspenseCebiaReturn} />
        <Route component={SuspenseNotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <HelmetProvider>
      <LanguageProvider>
        <QueryClientProvider client={queryClient}>
          <FavoritesProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
              <FavoritesButton />
            </TooltipProvider>
          </FavoritesProvider>
        </QueryClientProvider>
      </LanguageProvider>
    </HelmetProvider>
  );
}

export default App;
