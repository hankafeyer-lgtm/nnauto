import { Link, useLocation } from "@/lib/navigation";
import {
  NNAUTO_OPEN_ADD_LISTING_AUTH_EVENT,
  setPostAuthRedirect,
} from "@/lib/authRedirect";
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
  Building2,
  MessageCircle,
} from "lucide-react";
import { useState, useEffect, useMemo, useRef, lazy, Suspense } from "react";
import { useHideOnScroll } from "@/hooks/useHideOnScroll";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/lib/translations";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient, setSessionId } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import LoginModal from "@/components/LoginModal";
import { useFilterParams } from "@/hooks/useFilterParams";
import { carBrands, carModels } from "@shared/carDatabase";
const logoImage = "/logo-icon-only.png";

const FavoritesModal = lazy(() =>
  import("@/components/FavoritesModal").then((m) => ({
    default: m.FavoritesModal,
  })),
);

type HeaderProps = {
  compactMobile?: boolean;
  showMobileSearch?: boolean;
};

type SearchSuggestion = {
  type: "brand" | "model";
  value: string;
  brand?: string;
  score: number;
};

const normalizeSearchText = (value: string) =>
  String(value)
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const brandLabelByValue = new Map(carBrands.map((brand) => [brand.value, brand.label]));

let _cachedModelSuggestions: Array<{ brand: string; model: string }> | null = null;
function getStaticModelSuggestions() {
  if (!_cachedModelSuggestions) {
    _cachedModelSuggestions = Object.entries(carModels).flatMap(([brandValue, models]) =>
      models.map((model) => ({
        brand: brandLabelByValue.get(brandValue) ?? brandValue,
        model,
      })),
    );
  }
  return _cachedModelSuggestions;
}

export default function Header(props: HeaderProps) {
  return <HeaderContent {...props} />;
}

function HeaderContent({
  compactMobile = false,
  showMobileSearch = true,
}: HeaderProps = {}) {
  const { language, setLanguage } = useLanguage();
  const t = useTranslation();
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [location, navigate] = useLocation();
  const { setSearch, filters } = useFilterParams();
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [loginModalTab, setLoginModalTab] = useState<"login" | "register">(
    "login",
  );
  const [favoritesModalOpen, setFavoritesModalOpen] = useState(false);

  useEffect(() => {
    const openAddListingAuth = () => {
      setPostAuthRedirect("/add-listing");
      setLoginModalTab("register");
      setLoginModalOpen(true);
    };
    window.addEventListener(NNAUTO_OPEN_ADD_LISTING_AUTH_EVENT, openAddListingAuth);
    return () =>
      window.removeEventListener(NNAUTO_OPEN_ADD_LISTING_AUTH_EVENT, openAddListingAuth);
  }, []);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === "undefined") return false;
    const THEME_VERSION = "v3_always_light_default";
    try {
      const savedVersion = localStorage.getItem("zlateauto_theme_version");

      if (savedVersion !== THEME_VERSION) {
        try {
          localStorage.setItem("zlateauto_theme", "light");
          localStorage.setItem("zlateauto_theme_version", THEME_VERSION);
        } catch {
          /* private mode / quota: silently ignore */
        }
        document.documentElement.classList.remove("dark");
        return false;
      }

      const saved = localStorage.getItem("zlateauto_theme");
      if (!saved || saved === "light") {
        document.documentElement.classList.remove("dark");
        return false;
      }
      return saved === "dark";
    } catch {
      document.documentElement.classList.remove("dark");
      return false;
    }
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchVisible, setIsSearchVisible] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Hide-on-scroll-down / show-on-scroll-up behaviour. Implementation lives
  // in a reusable hook so we can apply the same pattern to other floating
  // bars without duplicating scroll listeners.
  const headerHidden = useHideOnScroll();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchMobileInputRef = useRef<HTMLInputElement>(null);
  const lastScrollYRef = useRef(0);
  const scrollRafRef = useRef<number | null>(null);

  const listingsCountQueryString = useMemo(() => {
    const params = new URLSearchParams();
    const appendIfPresent = (key: string, value: unknown) => {
      if (value === undefined || value === null) return;
      if (typeof value === "string" && value.trim() === "") return;
      if (Array.isArray(value)) {
        if (!value.length) return;
        params.set(key, value.join(","));
        return;
      }
      if (typeof value === "boolean") {
        if (!value) return;
        params.set(key, "true");
        return;
      }
      params.set(key, String(value));
    };

    appendIfPresent("vehicleType", filters.vehicleType);
    appendIfPresent("brand", filters.brand);
    appendIfPresent("model", filters.model);
    appendIfPresent("generation", filters.generation);
    appendIfPresent("priceMin", filters.priceMin);
    appendIfPresent("priceMax", filters.priceMax);
    appendIfPresent("yearMin", filters.yearMin);
    appendIfPresent("yearMax", filters.yearMax);
    appendIfPresent("mileageMin", filters.mileageMin);
    appendIfPresent("mileageMax", filters.mileageMax);
    appendIfPresent("fuel", filters.fuel);
    appendIfPresent("bodyType", filters.bodyType);
    appendIfPresent("transmission", filters.transmission);
    appendIfPresent("color", filters.color);
    appendIfPresent("trim", filters.trim);
    appendIfPresent("region", filters.region);
    appendIfPresent("driveType", filters.driveType);
    appendIfPresent("engineMin", filters.engineMin);
    appendIfPresent("engineMax", filters.engineMax);
    appendIfPresent("powerMin", filters.powerMin);
    appendIfPresent("powerMax", filters.powerMax);
    appendIfPresent("doorsMin", filters.doorsMin);
    appendIfPresent("doorsMax", filters.doorsMax);
    appendIfPresent("seatsMin", filters.seatsMin);
    appendIfPresent("seatsMax", filters.seatsMax);
    appendIfPresent("ownersMin", filters.ownersMin);
    appendIfPresent("ownersMax", filters.ownersMax);
    appendIfPresent("condition", filters.condition);
    appendIfPresent("extras", filters.extras);
    appendIfPresent("equipment", filters.equipment);

    return params.toString();
  }, [filters]);

  const listingsCountApiUrl = `/api/listings?${
    listingsCountQueryString ? `${listingsCountQueryString}&` : ""
  }countOnly=1&limit=1`;

  const { data: listingsCountData } = useQuery<{
    listings: [];
    pagination?: { total: number };
  }>({
    queryKey: [listingsCountApiUrl],
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnMount: false,
  });

  const baseListingsCount = listingsCountData?.pagination?.total ?? 0;
  const totalListingsCount = baseListingsCount > 0 ? baseListingsCount + 98 : 0;

  const suggestions = useMemo(() => {
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery || trimmedQuery.length < 1) return [];

    const query = normalizeSearchText(trimmedQuery);
    const results: SearchSuggestion[] = [];
    const seenBrands = new Set<string>();
    const seenModels = new Set<string>();

    for (const brand of carBrands) {
      const brandQuery = normalizeSearchText(brand.label);
      if (!brandQuery.includes(query) || seenBrands.has(brandQuery)) continue;

      seenBrands.add(brandQuery);
      results.push({
        type: "brand",
        value: brand.label,
        score: brandQuery.startsWith(query) ? 0 : 1,
      });
    }

    for (const entry of getStaticModelSuggestions()) {
      const brandQuery = normalizeSearchText(entry.brand);
      const modelQuery = normalizeSearchText(entry.model);
      const modelKey = `${brandQuery}-${modelQuery}`;
      const fullQuery = `${brandQuery} ${modelQuery}`;

      if (seenModels.has(modelKey)) continue;
      if (!modelQuery.includes(query) && !fullQuery.includes(query)) continue;

      seenModels.add(modelKey);
      results.push({
        type: "model",
        value: entry.model,
        brand: entry.brand,
        score: modelQuery.startsWith(query) ? 2 : fullQuery.startsWith(query) ? 3 : 4,
      });
    }

    return results
      .sort((a, b) => a.score - b.score || a.value.localeCompare(b.value))
      .slice(0, 8)
      .map(({ score: _score, ...suggestion }) => suggestion);
  }, [searchQuery]);

  const languageNames = {
    cs: "Čeština",
    uk: "Українська",
    en: "English",
    de: "Deutsch",
  };

  useEffect(() => {
    const THEME_VERSION = "v3_always_light_default";
    if (darkMode) {
      document.documentElement.classList.add("dark");
      try {
        localStorage.setItem("zlateauto_theme", "dark");
        localStorage.setItem("zlateauto_theme_version", THEME_VERSION);
      } catch {
        /* iOS private mode / storage disabled */
      }
    } else {
      document.documentElement.classList.remove("dark");
      try {
        localStorage.setItem("zlateauto_theme", "light");
        localStorage.setItem("zlateauto_theme_version", THEME_VERSION);
      } catch {
        /* iOS private mode / storage disabled */
      }
    }
  }, [darkMode]);

  useEffect(() => {
    const handleScroll = () => {
      if (scrollRafRef.current !== null) return;

      scrollRafRef.current = window.requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;

        if (currentScrollY < 10) {
          setIsSearchVisible(true);
        } else if (currentScrollY > lastScrollYRef.current) {
          setIsSearchVisible(false);
        } else {
          setIsSearchVisible(true);
        }

        lastScrollYRef.current = currentScrollY;
        scrollRafRef.current = null;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      if (scrollRafRef.current !== null) {
        window.cancelAnimationFrame(scrollRafRef.current);
      }
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

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

  const openLoginModal = (tab: "login" | "register") => {
    setLoginModalTab(tab);
    setLoginModalOpen(true);
  };

  const handleLogoClick = () => {
    const isEmbeddedListing =
      new URLSearchParams(window.location.search).get("embedded") === "1";
    const isInIframe = window.parent && window.parent !== window;

    // Embedded listing (in iframe) keeps its existing behaviour — ask the
    // parent window to close the overlay instead of navigating ourselves.
    if (isEmbeddedListing && isInIframe) {
      window.parent.postMessage({ type: "nnauto-close-listing-overlay" }, "*");
      return;
    }

    // Logo always returns the user to a fresh home page. We use a real
    // navigation instead of SPA `navigate("/")` so any in-memory state
    // (filters, scroll, modals, opened listings) is wiped exactly the
    // same way as a manual reload — which matches the user expectation
    // of "go to the very first home page".
    window.location.assign("/");
  };

  return (
    <header
      className={`sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl shadow-lg transition-transform duration-300 ease-out will-change-transform ${
        headerHidden ? "-translate-y-full" : "translate-y-0"
      } ${compactMobile ? "md:backdrop-blur-2xl" : ""}`}
    >
      <div
        className={`container mx-auto ${
          compactMobile
            ? "pl-2 pr-[calc(0.875rem+env(safe-area-inset-right,0px))] sm:px-6 lg:px-8"
            : "pl-2.5 pr-[calc(1.125rem+env(safe-area-inset-right,0px))] sm:px-6 lg:px-8"
        }`}
      >
        <div
          className={`flex items-center min-w-0 max-md:justify-start max-md:gap-1 md:justify-between md:gap-4 lg:gap-8 ${
            compactMobile ? "h-14 sm:h-20 lg:h-24" : "h-16 sm:h-20 lg:h-24"
          }`}
        >
          <div
            onClick={handleLogoClick}
            className="relative z-20 cursor-pointer shrink-0"
            data-testid="link-home"
          >
            <div
              className={`hover-elevate active-elevate-2 rounded-xl py-2 flex items-center cursor-pointer ${
                compactMobile
                  ? "px-1 sm:px-4 -ml-3 sm:-ml-4 gap-0.5 sm:gap-3"
                  : "px-2 sm:px-4 -ml-4 sm:-ml-4 gap-1 sm:gap-3"
              }`}
            >
              <div
                className="relative z-30 shrink-0 pointer-events-auto"
                onClick={(e) => {
                  e.stopPropagation();
                  handleLogoClick();
                }}
                data-testid="favicon-wrapper"
              >
                <img
                  src={logoImage}
                  alt="NNAuto"
                  width={96}
                  height={96}
                  decoding="async"
                  fetchPriority="high"
                  className={`object-contain ${
                    compactMobile
                      ? "w-9 h-9 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24"
                      : "w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24"
                  }`}
                />
              </div>
              <span
                className={`font-bold tracking-tight ${
                  compactMobile
                    ? "text-[1.65rem] leading-none max-[390px]:text-[1.35rem] sm:text-2xl md:text-3xl lg:text-4xl"
                    : "text-xl sm:text-2xl md:text-3xl lg:text-4xl"
                }`}
              >
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

          <div className="relative z-30 ml-auto flex items-center gap-1 sm:gap-2 lg:gap-3 shrink-0">
            <Button
              asChild
              variant="outline"
              size="sm"
              className={`gap-1 px-1.5 pr-2 sm:px-3 ${compactMobile ? "h-9 rounded-xl" : ""}`}
            >
              <a href="/add-listing" data-testid="button-open-add-listing" className="inline-flex items-center gap-1">
                <Plus className="w-4 h-4" />
                <span className="text-[11px] leading-none whitespace-nowrap sm:text-sm">
                  Přidat inzerát
                </span>
              </a>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className={`rounded-lg sm:rounded-xl ${compactMobile ? "h-9 w-9 sm:h-12 sm:w-12" : "h-10 w-10 sm:h-12 sm:w-12"}`}
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
                  className={`rounded-lg sm:rounded-xl ${compactMobile ? "h-9 w-9 sm:h-12 sm:w-12" : "h-10 w-10 sm:h-12 sm:w-12"}`}
                  data-testid="button-language"
                >
                  <Languages className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-2">
                <DropdownMenuLabel className="text-base font-semibold px-3 py-2.5 text-black dark:text-white">
                  Jazyk / Мова / Language / Sprache
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
                <DropdownMenuItem
                  onClick={() => setLanguage("de")}
                  className={`px-3 py-3 text-base rounded-lg border border-transparent text-black dark:text-white ${
                    language === "de"
                      ? "bg-accent border-accent-border"
                      : "hover:border-border"
                  }`}
                  data-testid="language-de"
                >
                  <span className="font-medium">{languageNames.de}</span>
                  {language === "de" && (
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
                  className={`rounded-lg sm:rounded-xl ${compactMobile ? "h-9 w-9 sm:h-12 sm:w-12" : "h-10 w-10 sm:h-12 sm:w-12"}`}
                  data-testid="button-menu"
                >
                  <Menu className="h-[1.2rem] w-[1.2rem] sm:h-5 sm:w-5" strokeWidth={2.25} />
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
                <DropdownMenuItem asChild>
                  <Link
                    href="/add-listing"
                    className="px-3 py-3 text-base rounded-lg border border-transparent hover:border-border cursor-pointer flex items-center"
                    data-testid="menu-item-add-listing"
                  >
                    <Plus className="mr-3 h-5 w-5" />
                    <span>{t("header.menu.addListing")}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-2" />
                {!isAuthenticated ? (
                  <>
                    <DropdownMenuItem asChild>
                      <button
                        type="button"
                        onClick={() => openLoginModal("login")}
                        className="w-full px-3 py-3 text-base rounded-lg border border-transparent hover:border-border text-left flex items-center"
                        data-testid="menu-item-login"
                      >
                        <LogIn className="mr-3 h-5 w-5" />
                        <span>{t("auth.login")}</span>
                      </button>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <button
                        type="button"
                        onClick={() => openLoginModal("register")}
                        className="w-full px-3 py-3 text-base rounded-lg border border-transparent hover:border-border text-left flex items-center"
                        data-testid="menu-item-register"
                      >
                        <UserPlus className="mr-3 h-5 w-5" />
                        <span>{t("auth.register")}</span>
                      </button>
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
                    <DropdownMenuItem
                      onClick={() => navigate("/zpravy")}
                      className="px-3 py-3 text-base rounded-lg border border-transparent hover:border-border"
                      data-testid="menu-item-messages"
                    >
                      <MessageCircle className="mr-3 h-5 w-5" />
                      <span className="flex items-center gap-2">
                        Správy
                        <UnreadBadge />
                      </span>
                    </DropdownMenuItem>
                    {user?.isAdmin && (
                      <>
                        <DropdownMenuSeparator className="my-2" />
                        <DropdownMenuItem
                          onClick={() => navigate("/dealer")}
                          className="px-3 py-3 text-base rounded-lg border border-transparent hover:border-border"
                          data-testid="menu-item-dealer"
                        >
                          <Building2 className="mr-3 h-5 w-5" />
                          <span>{t("dealer.cabinet")}</span>
                        </DropdownMenuItem>
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
          className={`md:hidden pb-3 sm:pb-4 ${showMobileSearch ? "" : "hidden"}`}
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

      {loginModalOpen && (
        <Suspense fallback={null}>
          <LoginModal
            open={loginModalOpen}
            onOpenChange={setLoginModalOpen}
            initialTab={loginModalTab}
          />
        </Suspense>
      )}
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

function UnreadBadge() {
  const { data } = useQuery({
    queryKey: ["/api/messages/unread-count"],
    queryFn: async () => {
      const res = await fetch("/api/messages/unread-count", { credentials: "include" });
      if (!res.ok) return { unread: 0 };
      return res.json() as Promise<{ unread: number }>;
    },
    refetchInterval: 30_000,
    staleTime: 10_000,
  });
  const count = data?.unread ?? 0;
  if (count <= 0) return null;
  return (
    <span className="inline-flex items-center justify-center h-5 min-w-5 rounded-full bg-[#B8860B] text-white text-xs font-medium px-1.5">
      {count > 99 ? "99+" : count}
    </span>
  );
}
