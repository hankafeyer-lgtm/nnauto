import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Plus,
  Menu,
  Moon,
  Sun,
  User,
  Heart,
  Settings,
  LogOut,
  Car,
  Languages,
  LogIn,
  UserPlus,
  History,
  Star,
  Shield,
} from "lucide-react";
import { useState, useEffect, useMemo, useRef, lazy, Suspense } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/lib/translations";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient, setSessionId } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import LoginModal from "@/components/LoginModal";
import { useFilterParams } from "@/hooks/useFilterParams";

import { Listing } from "@shared/schema";
import logoImage from "@assets/ADEE73F1-9859-4FA3-9185-00DC43A78326_1764497749332.png";

const FavoritesModal = lazy(() =>
  import("@/components/FavoritesModal").then((m) => ({
    default: m.FavoritesModal,
  })),
);

export default function Header() {
  const { language, setLanguage } = useLanguage();
  const t = useTranslation();
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [location, navigate] = useLocation();
  const { setSearch } = useFilterParams();
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [loginModalTab, setLoginModalTab] = useState<"login" | "register">(
    "login",
  );
  const [favoritesModalOpen, setFavoritesModalOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const THEME_VERSION = "v3_always_light_default";
    const savedVersion = localStorage.getItem("zlateauto_theme_version");

    // Always reset to light theme if version doesn't match or no saved theme
    if (savedVersion !== THEME_VERSION) {
      localStorage.setItem("zlateauto_theme", "light");
      localStorage.setItem("zlateauto_theme_version", THEME_VERSION);
      document.documentElement.classList.remove("dark");
      return false;
    }

    const saved = localStorage.getItem("zlateauto_theme");
    // Default to light mode if no saved preference
    if (!saved || saved === "light") {
      document.documentElement.classList.remove("dark");
      return false;
    }
    return saved === "dark";
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchVisible, setIsSearchVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchMobileInputRef = useRef<HTMLInputElement>(null);

  // Fetch listings for autocomplete suggestions
  const { data: listingsData } = useQuery<{ listings: Listing[] }>({
    queryKey: ["/api/listings"],
  });

  // Safely extract listings array and total count
  const listings = listingsData?.listings || [];
  const totalListingsCount =
    ((listingsData as any)?.pagination?.total ?? listings.length) + 98;

  // Generate search suggestions based on input (works with 1+ letters)
  const suggestions = useMemo(() => {
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery || trimmedQuery.length < 1) return [];

    const query = trimmedQuery.toLowerCase();
    const results: {
      type: "brand" | "model" | "listing";
      value: string;
      brand?: string;
    }[] = [];
    const seenBrands = new Set<string>();
    const seenModels = new Set<string>();

    if (!Array.isArray(listings)) return [];

    listings.forEach((listing) => {
      if (!listing?.brand || !listing?.model) return;

      // Add brand suggestions
      const brandLower = listing.brand.toLowerCase();
      if (brandLower.includes(query) && !seenBrands.has(brandLower)) {
        seenBrands.add(brandLower);
        results.push({ type: "brand", value: listing.brand });
      }

      // Add model suggestions
      const modelLower = listing.model.toLowerCase();
      const modelKey = `${brandLower}-${modelLower}`;
      if (modelLower.includes(query) && !seenModels.has(modelKey)) {
        seenModels.add(modelKey);
        results.push({
          type: "model",
          value: listing.model,
          brand: listing.brand,
        });
      }
    });

    return results.slice(0, 8);
  }, [searchQuery, listings]);

  const languageNames = {
    cs: "Čeština",
    uk: "Українська",
    en: "English",
  };

  useEffect(() => {
    const THEME_VERSION = "v3_always_light_default";
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("zlateauto_theme", "dark");
      localStorage.setItem("zlateauto_theme_version", THEME_VERSION);
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("zlateauto_theme", "light");
      localStorage.setItem("zlateauto_theme_version", THEME_VERSION);
    }
  }, [darkMode]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 10) {
        setIsSearchVisible(true);
      } else if (currentScrollY > lastScrollY) {
        setIsSearchVisible(false);
      } else {
        setIsSearchVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      // If already on listings page, use filter update instead of navigation
      if (location.startsWith("/listings")) {
        setSearch(searchQuery.trim());
      } else {
        navigate(`/listings?search=${encodeURIComponent(searchQuery.trim())}`);
      }
      setSearchQuery("");
    }
  };

  const handleSuggestionClick = (suggestion: {
    type: string;
    value: string;
    brand?: string;
  }) => {
    setShowSuggestions(false);
    const searchTerm =
      suggestion.type === "model" && suggestion.brand
        ? `${suggestion.brand} ${suggestion.value}`
        : suggestion.value;

    if (location.startsWith("/listings")) {
      setSearch(searchTerm);
    } else {
      navigate(`/listings?search=${encodeURIComponent(searchTerm)}`);
    }
    setSearchQuery("");
  };

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/logout", {});
      return await res.json();
    },
    onSuccess: () => {
      // Clear all auth tokens and session data
      setSessionId(null);
      localStorage.removeItem("nnauto_user");
      localStorage.removeItem("nnauto_token"); // Clear JWT token

      // IMMEDIATELY set auth state to null to force useAuth consumers into anonymous state
      queryClient.setQueryData(["/api/auth/user"], {
        user: null,
        sessionId: null,
      });

      // PURGE listings cache to prevent stale owner data from showing after logout
      queryClient.removeQueries({
        predicate: (query) => query.queryKey[0] === "/api/listings",
      });

      toast({
        title: t("auth.logoutSuccess"),
        description: t("auth.logoutSuccessDescription"),
      });
    },
    onError: (error: any) => {
      // Parse error message - apiRequest throws "status: body" format
      let errorMsg = "Failed to logout";
      if (error.message) {
        try {
          const match = error.message.match(/:\s*(.+)$/);
          if (match) {
            const parsed = JSON.parse(match[1]);
            errorMsg = parsed.error || errorMsg;
          }
        } catch {
          errorMsg = error.message;
        }
      }
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMsg,
      });
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleAddListingRequest = () => {
    if (isLoading) {
      return;
    }
    if (!isAuthenticated || !user) {
      toast({
        variant: "destructive",
        title: t("auth.loginRequired"),
        description: t("auth.loginRequiredDescription"),
      });
      setLoginModalTab("login");
      setLoginModalOpen(true);
    } else {
      navigate("/add-listing");
    }
  };
  const handleLogoClick = () => {
    const hasQueryOrHash = !!window.location.search || !!window.location.hash;

    // Якщо вже на чистій головній — просто скрол вгору
    if (window.location.pathname === "/" && !hasQueryOrHash) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // 1) пробуємо стандартну навігацію wouter
    try {
      // якщо твоя версія wouter підтримує replace
      (navigate as any)("/", { replace: true });
    } catch {
      navigate("/");
    }

    // 2) якщо wouter вважає що "і так /" і не прибирає query — форсимо чистий URL
    window.history.replaceState(null, "", "/");
    window.dispatchEvent(new Event("popstate")); // щоб wouter підхопив зміну
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl shadow-lg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 sm:h-20 lg:h-24 items-center justify-between gap-2 sm:gap-4 lg:gap-8">
          <div
            onClick={handleLogoClick}
            className="cursor-pointer"
            data-testid="link-home"
          >
            <div className="hover-elevate active-elevate-2 rounded-xl px-3 sm:px-4 py-2 -ml-3 sm:-ml-4 flex items-center gap-3 sm:gap-4 cursor-pointer">
              <img
                src={logoImage}
                alt="NNAuto"
                className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 object-contain"
              />
              <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight">
                <span className="text-[#B8860B]">NN</span>
                <span className="text-black dark:text-white">Auto</span>
              </span>
            </div>
          </div>

          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-2xl"
          >
            <div className="relative w-full">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
              <Input
                ref={searchInputRef}
                type="search"
                placeholder={
                  totalListingsCount > 0
                    ? `${t("header.search")} (${totalListingsCount} ${t(
                        "header.listings",
                      )})`
                    : t("header.search")
                }
                className="pl-14 h-12 lg:h-14 rounded-xl shadow-sm"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(e.target.value.trim().length >= 1);
                }}
                onFocus={() =>
                  setShowSuggestions(searchQuery.trim().length >= 1)
                }
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                data-testid="input-search"
              />
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-xl shadow-lg z-50 overflow-hidden">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={`${suggestion.type}-${suggestion.value}-${index}`}
                      type="button"
                      className="w-full px-4 py-3 text-left hover:bg-accent flex items-center gap-3 border-b last:border-b-0"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSuggestionClick(suggestion);
                      }}
                      data-testid={`suggestion-${suggestion.type}-${index}`}
                    >
                      {suggestion.type === "brand" ? (
                        <Car className="w-4 h-4 text-[#B8860B]" />
                      ) : (
                        <Search className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span className="text-black dark:text-white">
                        {suggestion.type === "model" && suggestion.brand ? (
                          <>
                            <span className="text-muted-foreground">
                              {suggestion.brand}
                            </span>{" "}
                            <span className="font-medium">
                              {suggestion.value}
                            </span>
                          </>
                        ) : (
                          <span className="font-medium">
                            {suggestion.value}
                          </span>
                        )}
                      </span>
                      <span className="ml-auto text-xs text-muted-foreground">
                        {suggestion.type === "brand"
                          ? t("filters.brand")
                          : t("filters.model")}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </form>

          <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3">
            <Button
              onClick={handleAddListingRequest}
              variant="outline"
              size="sm"
              className="gap-1.5 px-2 sm:px-3"
              data-testid="button-open-add-listing"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm">{t("header.addListing")}</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg sm:rounded-xl"
              onClick={toggleDarkMode}
              data-testid="button-theme-toggle"
            >
              {darkMode ? (
                <Sun className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <Moon className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg sm:rounded-xl"
                  data-testid="button-language"
                >
                  <Languages className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-2">
                <DropdownMenuLabel className="text-base font-semibold px-3 py-2.5 text-black dark:text-white">
                  Jazyk / Мова / Language
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setLanguage("cs")}
                  className={`px-3 py-3 text-base rounded-lg border border-transparent text-black dark:text-white ${
                    language === "cs"
                      ? "bg-accent border-accent-border"
                      : "hover:border-border"
                  }`}
                  data-testid="language-cs"
                >
                  <span className="font-medium">{languageNames.cs}</span>
                  {language === "cs" && (
                    <span className="ml-auto text-sm">✓</span>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setLanguage("uk")}
                  className={`px-3 py-3 text-base rounded-lg border border-transparent text-black dark:text-white ${
                    language === "uk"
                      ? "bg-accent border-accent-border"
                      : "hover:border-border"
                  }`}
                  data-testid="language-uk"
                >
                  <span className="font-medium">{languageNames.uk}</span>
                  {language === "uk" && (
                    <span className="ml-auto text-sm">✓</span>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setLanguage("en")}
                  className={`px-3 py-3 text-base rounded-lg border border-transparent text-black dark:text-white ${
                    language === "en"
                      ? "bg-accent border-accent-border"
                      : "hover:border-border"
                  }`}
                  data-testid="language-en"
                >
                  <span className="font-medium">{languageNames.en}</span>
                  {language === "en" && (
                    <span className="ml-auto text-sm">✓</span>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg sm:rounded-xl"
                  data-testid="button-menu"
                >
                  <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72 p-2">
                <DropdownMenuItem
                  onClick={() => navigate("/listings")}
                  className="px-3 py-3 text-base rounded-lg border border-transparent hover:border-border"
                  data-testid="menu-item-search-cars"
                >
                  <Search className="mr-3 h-5 w-5" />
                  <span>{t("header.menu.searchCars")}</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigate("/listings?category=used")}
                  className="px-3 py-3 text-base rounded-lg border border-transparent hover:border-border"
                  data-testid="menu-item-used-cars"
                >
                  <History className="mr-3 h-5 w-5" />
                  <span>{t("header.menu.usedCars")}</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigate("/listings?category=new")}
                  className="px-3 py-3 text-base rounded-lg border border-transparent hover:border-border"
                  data-testid="menu-item-new-cars"
                >
                  <Star className="mr-3 h-5 w-5" />
                  <span>{t("header.menu.newCars")}</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleAddListingRequest}
                  className="px-3 py-3 text-base rounded-lg border border-transparent hover:border-border"
                  data-testid="menu-item-add-listing"
                >
                  <Plus className="mr-3 h-5 w-5" />
                  <span>{t("header.menu.addListing")}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-2" />
                {!isLoading && !isAuthenticated ? (
                  <>
                    <DropdownMenuItem
                      onClick={() => {
                        setLoginModalTab("login");
                        setLoginModalOpen(true);
                      }}
                      className="px-3 py-3 text-base rounded-lg border border-transparent hover:border-border"
                      data-testid="menu-item-login"
                    >
                      <LogIn className="mr-3 h-5 w-5" />
                      <span>{t("auth.login")}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setLoginModalTab("register");
                        setLoginModalOpen(true);
                      }}
                      className="px-3 py-3 text-base rounded-lg border border-transparent hover:border-border"
                      data-testid="menu-item-register"
                    >
                      <UserPlus className="mr-3 h-5 w-5" />
                      <span>{t("auth.register")}</span>
                    </DropdownMenuItem>
                  </>
                ) : isAuthenticated ? (
                  <>
                    <DropdownMenuLabel className="text-base font-semibold px-3 py-2.5">
                      {user?.email || t("header.menu.myAccount")}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="my-2" />
                    <DropdownMenuItem
                      onClick={() => navigate("/profile")}
                      className="px-3 py-3 text-base rounded-lg border border-transparent hover:border-border"
                      data-testid="menu-item-profile"
                    >
                      <User className="mr-3 h-5 w-5" />
                      <span>{t("header.menu.profile")}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => navigate(`/listings?userId=${user?.id}`)}
                      className="px-3 py-3 text-base rounded-lg border border-transparent hover:border-border"
                      data-testid="menu-item-my-listings"
                    >
                      <Car className="mr-3 h-5 w-5" />
                      <span>{t("header.menu.myListings")}</span>
                    </DropdownMenuItem>
                    {user?.isAdmin && (
                      <>
                        <DropdownMenuSeparator className="my-2" />
                        <DropdownMenuItem
                          onClick={() => navigate("/admin")}
                          className="px-3 py-3 text-base rounded-lg border border-transparent hover:border-border"
                          data-testid="menu-item-admin"
                        >
                          <Shield className="mr-3 h-5 w-5" />
                          <span>{t("header.menu.admin")}</span>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuItem
                      onClick={() => setFavoritesModalOpen(true)}
                      className="px-3 py-3 text-base rounded-lg border border-transparent hover:border-border"
                      data-testid="menu-item-favorites"
                    >
                      <Heart className="mr-3 h-5 w-5" />
                      <span>{t("header.menu.favorites")}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => navigate("/settings")}
                      className="px-3 py-3 text-base rounded-lg border border-transparent hover:border-border"
                      data-testid="menu-item-settings"
                    >
                      <Settings className="mr-3 h-5 w-5" />
                      <span>{t("header.menu.settings")}</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="my-2" />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="px-3 py-3 text-base rounded-lg border border-transparent hover:border-border"
                      data-testid="menu-item-logout"
                    >
                      <LogOut className="mr-3 h-5 w-5" />
                      <span>{t("header.menu.logout")}</span>
                    </DropdownMenuItem>
                  </>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div
          className={`md:hidden pb-3 sm:pb-4 transition-all duration-300 ease-in-out overflow-hidden ${
            isSearchVisible
              ? "max-h-20 opacity-100 translate-y-0"
              : "max-h-0 opacity-0 -translate-y-4 pb-0"
          }`}
        >
          <form onSubmit={handleSearch} className="w-full">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t("header.search")}
                className="pl-12 h-12 rounded-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search-mobile"
              />
            </div>
          </form>
        </div>
      </div>

      <LoginModal
        open={loginModalOpen}
        onOpenChange={setLoginModalOpen}
        initialTab={loginModalTab}
      />
      {favoritesModalOpen && (
        <Suspense fallback={null}>
          <FavoritesModal
            isOpen={favoritesModalOpen}
            onClose={() => setFavoritesModalOpen(false)}
          />
        </Suspense>
      )}
    </header>
  );
}
