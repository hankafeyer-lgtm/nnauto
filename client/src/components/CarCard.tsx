import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Gauge,
  Fuel,
  Calendar,
  Heart,
  Star,
  Crown,
  Loader2,
  Pencil,
  Trash2,
  CheckCircle2,
  Eye,
  Phone,
  MessageCircle,
} from "lucide-react";
import { Link, useLocation } from "@/lib/navigation";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useTranslation } from "@/lib/translations";
import { useState, memo, useRef, useEffect, useCallback } from "react";
import { saveScrollPosition } from "@/components/ScrollToTop";
import {
  canPrefetchHeavyResources,
  prefetchListing,
  prefetchListingDocument,
  warmListingFrame,
} from "@/lib/queryClient";
import { loadListingDetailPage } from "@/lib/routePreload";
import {
  getCardImageUrl,
  getThumbnailUrl,
  getCardSrcSet,
  getOptimizedImageUrl,
} from "@/lib/imageOptimizer";
import { isMobileViewport } from "@/lib/viewport";
import { restoreDebug } from "@/lib/restoreDebug";

interface CarCardProps {
  id: string;
  image: string;
  photos?: string[];
  title: string;
  price: number;
  year: number;
  mileage: number;
  fuel: string;
  transmission: string;
  location: string;
  datePosted: string;
  condition?: string;
  viewMode?: "grid" | "list";
  isOwner?: boolean;
  isTopListing?: boolean;
  onPromote?: (id: string) => void;
  isPromoting?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  /** Mark listing as sold / back to active (owner only). */
  onToggleSold?: (id: string) => void;
  isSold?: boolean;
  isTogglingSold?: boolean;
  priority?: boolean;
  vatDeductible?: boolean;
  onOpenListing?: (id: string) => void;
  /** Owner-only inline stats: shown on cards under "Moje inzeráty". */
  stats?: {
    views: number;
    contactClicks: number;
    whatsappClicks: number;
  };
}

function CarCard({
  id,
  image,
  photos = [],
  title,
  price,
  year,
  mileage,
  fuel,
  transmission,
  location,
  datePosted,
  condition,
  viewMode = "grid",
  isOwner = false,
  isTopListing = false,
  onPromote,
  isPromoting = false,
  onEdit,
  onDelete,
  onToggleSold,
  isSold = false,
  isTogglingSold = false,
  priority = false,
  vatDeductible = false,
  onOpenListing,
  stats,
}: CarCardProps) {
  // Inline stats strip for "Moje inzeráty" — no need to open the listing
  // to see views / contact / WhatsApp counts.
  const StatsRow = ({ compact = false }: { compact?: boolean }) => {
    if (!isOwner || !stats) return null;
    const iconCls = compact ? "h-3.5 w-3.5" : "h-4 w-4";
    const textCls = compact ? "text-[11px]" : "text-xs sm:text-sm";
    return (
      <div
        className={`flex items-center gap-3 sm:gap-4 pt-2 mt-2 border-t border-[#B8860B]/20 text-[#6b5a2a] dark:text-[#D4AF37] ${textCls}`}
        data-testid={`card-stats-${id}`}
        aria-label="Statistiky inzerátu"
        onClick={(e) => e.stopPropagation()}
      >
        <span
          className="inline-flex items-center gap-1 font-medium"
          title="Zobrazení"
          data-testid={`card-stat-views-${id}`}
        >
          <Eye className={`${iconCls} shrink-0`} />
          {stats.views}
        </span>
        <span
          className="inline-flex items-center gap-1 font-medium"
          title="Kliknutí na kontakt"
          data-testid={`card-stat-contact-${id}`}
        >
          <Phone className={`${iconCls} shrink-0`} />
          {stats.contactClicks}
        </span>
        <span
          className="inline-flex items-center gap-1 font-medium"
          title="Kliknutí na WhatsApp"
          data-testid={`card-stat-whatsapp-${id}`}
        >
          <MessageCircle className={`${iconCls} shrink-0`} />
          {stats.whatsappClicks}
        </span>
      </div>
    );
  };
  const [, navigate] = useLocation();
  const { isFavorite, toggleFavorite } = useFavorites();
  const t = useTranslation();
  const favorite = isFavorite(id);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const didPrefetchRef = useRef(false);

  // Catalog cards now always show only the primary image.
  const allPhotos = photos.length > 0 ? photos : [image];
  const hasMultiplePhotos = allPhotos.length > 1;
  const primaryImage = allPhotos[0] || image;
  const currentOptimizedImage = getCardImageUrl(primaryImage);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(id);
  };

  const handlePromoteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onPromote && !isPromoting) {
      onPromote(id);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onEdit) {
      onEdit(id);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) {
      onDelete(id);
    }
  };

  const handleToggleSoldClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleSold && !isTogglingSold) {
      onToggleSold(id);
    }
  };

  // Show promote button if user owns the listing and it's not already TOP
  const showPromoteButton =
    isOwner && !isTopListing && onPromote && !isSold;
  // Show edit button if user owns the listing
  const showEditButton = isOwner && onEdit;
  // Show delete button if user owns the listing
  const showDeleteButton = isOwner && onDelete;
  const showSoldToggle = isOwner && onToggleSold;

  // Prefetch listing data on hover for faster navigation
  const handlePrefetch = useCallback(() => {
    void loadListingDetailPage();
    if (didPrefetchRef.current || !canPrefetchHeavyResources()) return;
    didPrefetchRef.current = true;
    const runNetworkWarmup = () => {
      prefetchListing(id);
      prefetchListingDocument(id);
      warmListingFrame(id);
    };
    const idleApi = window as Window & {
      requestIdleCallback?: (
        cb: () => void,
        opts?: { timeout: number },
      ) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    if (idleApi.requestIdleCallback) {
      idleApi.requestIdleCallback(runNetworkWarmup, { timeout: 180 });
      return;
    }
    window.setTimeout(runNetworkWarmup, 60);
  }, [id]);

  const handlePrimeOpen = useCallback(() => {
    void loadListingDetailPage();
    if (didPrefetchRef.current) return;
    didPrefetchRef.current = true;
    prefetchListing(id);
    prefetchListingDocument(id);
    warmListingFrame(id);
  }, [id]);

  useEffect(() => {
    didPrefetchRef.current = false;
  }, [id]);

  const buildListingHref = useCallback(() => {
    if (typeof window === "undefined") return `/listing/${id}`;
    const sourceUrl = `${window.location.pathname}${window.location.search}#listing-${encodeURIComponent(id)}`;
    const targetUrl = new URL(`/listing/${id}`, window.location.origin);
    targetUrl.searchParams.set("from", sourceUrl);
    return `${targetUrl.pathname}${targetUrl.search}`;
  }, [id]);
  const listingHref = buildListingHref();
  const navigateToListingWithState = useCallback(
    (href: string) => {
      navigate(href);
    },
    [navigate],
  );

  const handleListingClick = useCallback(
    (e: React.MouseEvent) => {
      const href = buildListingHref();
      restoreDebug("card", "before-navigate-to-detail", {
        id,
        hasOverlayHandler: !!onOpenListing,
        isMobile: isMobileViewport(),
        href,
      });
      if (onOpenListing) {
        e.preventDefault();
        e.stopPropagation();
        // Mobile browsers can swallow overlay-opening clicks on complex touch cards.
        // Use direct navigation on mobile for reliable opening.
        if (isMobileViewport()) {
          saveScrollPosition(id);
          restoreDebug("card", "navigate-mobile-direct", { id, href });
          navigateToListingWithState(href);
          return;
        }
        onOpenListing(id);
        restoreDebug("card", "open-overlay-desktop", { id });
        window.setTimeout(() => {
          const overlayFrame = document.querySelector(
            `iframe[src^="/listing/${id}"]`,
          );
          if (overlayFrame) return;
          const fallbackHref = buildListingHref();
          restoreDebug("card", "overlay-fallback-direct-nav", {
            id,
            href: fallbackHref,
          });
          navigateToListingWithState(fallbackHref);
        }, 160);
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      saveScrollPosition(id);
      navigateToListingWithState(href);
    },
    [buildListingHref, id, navigateToListingWithState, onOpenListing],
  );

  if (viewMode === "list") {
    return (
      <div
        className="relative isolate mb-2"
        onMouseEnter={handlePrefetch}
      >
        <Link
          href={listingHref}
          data-testid={`link-car-${id}`}
          className="touch-manipulation"
          onClick={handleListingClick}
          onMouseDown={handlePrimeOpen}
          onPointerDown={handlePrimeOpen}
          onTouchStart={handlePrimeOpen}
          onFocus={handlePrimeOpen}
        >
          <Card
            className="overflow-hidden hover-elevate active-elevate-2 cursor-pointer transition-all hover:shadow-lg duration-300 rounded-xl"
            data-testid={`card-car-${title.toLowerCase().replace(/\s+/g, "-")}`}
            data-listing-id={id}
            id={`listing-${id}`}
          >
            <div className="flex flex-col sm:flex-row">
              <div className="w-full sm:w-64 md:w-80 shrink-0 aspect-[3/2] sm:aspect-auto sm:h-48 relative overflow-hidden bg-muted">
                {!imageLoaded && !imageError && (
                  <div className="absolute inset-0 bg-gradient-to-r from-muted via-muted/80 to-muted animate-pulse" />
                )}
                {/* <img
                  src={getCardImageUrl(image)}
                  alt={title}
                  loading={priority ? "eager" : "lazy"}
                  decoding="async"
                  sizes="(max-width: 640px) 100vw, 320px"
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageError(true)}
                  className={`w-full h-full object-cover bg-muted transition-opacity duration-300 ${
                    imageLoaded ? "opacity-100" : "opacity-0"
                  }`}
                /> */}
                <img
                  src={getOptimizedImageUrl(image, {
                    width: 768,
                    quality: 84,
                    format: "webp",
                  })}
                  srcSet={getCardSrcSet(image)}
                  sizes="(max-width: 640px) 100vw, 320px"
                  alt={title}
                  loading={priority ? "eager" : "lazy"}
                  decoding="async"
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageError(true)}
                  className={`w-full h-full object-cover bg-muted transition-opacity duration-300 ${
                    imageLoaded ? "opacity-100" : "opacity-0"
                  }`}
                />

                {isSold && (
                  <div className="absolute top-2 left-2 z-20">
                    <Badge
                      variant="secondary"
                      className="bg-zinc-800 text-white border-zinc-600 text-xs font-semibold"
                    >
                      {t("listing.soldBadge")}
                    </Badge>
                  </div>
                )}
                {condition && (
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 text-black border-2 border-amber-300 rounded-lg px-2 py-0.5 shadow-[0_4px_12px_rgba(251,191,36,0.6)] text-xs font-bold flex items-center gap-1 animate-pulse">
                      <Star className="w-3 h-3 fill-black" />
                      <span className="uppercase tracking-wide">
                        {condition}
                      </span>
                    </Badge>
                  </div>
                )}
                {/* Topovat Button - List View */}
                {showPromoteButton && (
                  <button
                    onClick={handlePromoteClick}
                    disabled={isPromoting}
                    className="absolute top-2 right-2 z-20 group"
                    data-testid={`button-topovat-${id}`}
                  >
                    <div className="relative bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black rounded-lg px-2.5 py-1 shadow-[0_4px_15px_rgba(251,191,36,0.5)] text-xs font-bold flex items-center gap-1.5 transition-all duration-300 hover:shadow-[0_6px_20px_rgba(251,191,36,0.7)] hover:scale-105 border border-amber-300">
                      {isPromoting ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Crown className="w-3 h-3" />
                      )}
                      <span className="uppercase tracking-wide">
                        {t("listings.topovat")}
                      </span>
                    </div>
                  </button>
                )}
                {/* Edit / sold / delete — list view */}
                {(showEditButton || showDeleteButton || showSoldToggle) && (
                  <div className="absolute bottom-2 right-2 z-20 flex flex-col gap-1">
                    {showEditButton && (
                      <button
                        onClick={handleEditClick}
                        className="bg-amber-500 hover:bg-amber-600 text-white rounded-lg px-2.5 py-1 shadow-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 hover:scale-105"
                        data-testid={`button-edit-list-${id}`}
                      >
                        <Pencil className="w-3 h-3" />
                        <span>Upravit</span>
                      </button>
                    )}
                    {showSoldToggle && (
                      <button
                        type="button"
                        onClick={handleToggleSoldClick}
                        disabled={isTogglingSold}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-2.5 py-1 shadow-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 hover:scale-105 disabled:opacity-60"
                        data-testid={`button-toggle-sold-list-${id}`}
                      >
                        {isTogglingSold ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-3 h-3" />
                        )}
                        <span>
                          {isSold
                            ? t("listing.markAvailableShort")
                            : t("listing.markSoldShort")}
                        </span>
                      </button>
                    )}
                    {showDeleteButton && (
                      <button
                        onClick={handleDeleteClick}
                        className="bg-red-500 hover:bg-red-600 text-white rounded-lg px-2.5 py-1 shadow-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 hover:scale-105"
                        data-testid={`button-delete-list-${id}`}
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Smazat</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
              <CardContent className="flex-1 p-4 sm:p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3
                      className="font-semibold text-xl sm:text-2xl lg:text-xl leading-tight tracking-tight"
                      data-testid="text-car-title"
                    >
                      {title}
                    </h3>
                    <div className="text-right">
                      <span
                        className="text-2xl sm:text-3xl lg:text-2xl font-semibold text-primary whitespace-nowrap tracking-tight"
                        data-testid="text-car-price"
                      >
                        {price.toLocaleString()} Kč
                      </span>
                      {vatDeductible && (
                        <div className="text-xs text-green-600 dark:text-green-400 font-medium mt-0.5">
                          možnost odpočtu DPH
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-black dark:text-white">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 shrink-0" />
                      <span className="font-medium">{year}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Gauge className="h-4 w-4 shrink-0" />
                      <span className="font-medium">
                        {mileage.toLocaleString()} km
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Fuel className="h-4 w-4 shrink-0" />
                      <span className="font-medium">{fuel}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium">{transmission}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 mt-3 border-t text-xs sm:text-sm text-black dark:text-white">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="font-medium">{location}</span>
                  </div>
                  {/* <span className="truncate ml-2">{datePosted}</span> */}
                </div>
                <StatsRow compact />
              </CardContent>
            </div>
          </Card>
        </Link>

        <Button
          size="icon"
          variant="ghost"
          className={`absolute bottom-3 right-3 rounded-full bg-white/90 dark:bg-black/70 backdrop-blur-sm hover:bg-white dark:hover:bg-black/90 z-10 shadow-md border border-gray-200/50 dark:border-gray-700/50 touch-manipulation ${
            favorite ? "text-red-500" : "text-gray-600 dark:text-gray-300"
          }`}
          onClick={handleFavoriteClick}
          data-testid={`button-favorite-${id}`}
          aria-label={
            favorite
              ? t("favorites.removeFromFavorites")
              : t("favorites.addToFavorites")
          }
        >
          <Heart className={`h-4 w-4 ${favorite ? "fill-red-500" : ""}`} />
        </Button>
      </div>
    );
  }

  return (
    <div
      className="relative h-full isolate pb-2"
      onMouseEnter={handlePrefetch}
    >
      <Link
        href={listingHref}
        data-testid={`link-car-${id}`}
        className="block h-full touch-manipulation"
        onClick={handleListingClick}
        onMouseDown={handlePrimeOpen}
        onPointerDown={handlePrimeOpen}
        onTouchStart={handlePrimeOpen}
        onFocus={handlePrimeOpen}
      >
        <Card
          className="overflow-hidden hover-elevate active-elevate-2 cursor-pointer transition-all hover:shadow-2xl sm:hover:scale-[1.02] duration-300 rounded-xl sm:rounded-2xl lg:rounded-lg h-full flex flex-col"
          data-testid={`card-car-${title.toLowerCase().replace(/\s+/g, "-")}`}
          data-listing-id={id}
          id={`listing-${id}`}
        >
          <div
            className="relative bg-muted group/photo touch-pan-y min-w-0 shrink-0 h-[240px] sm:h-[260px] lg:h-[220px] overflow-hidden"
            onPointerDown={handlePrimeOpen}
            onTouchStart={undefined}
            onTouchMove={undefined}
            onTouchEnd={undefined}
          >
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 bg-gradient-to-r from-muted via-muted/80 to-muted animate-pulse" />
            )}
            <img
              src={currentOptimizedImage}
              srcSet={getCardSrcSet(primaryImage)}
              alt={title}
              loading={priority ? "eager" : "lazy"}
              decoding="async"
              fetchPriority={priority ? "high" : "auto"}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              className={`absolute inset-0 w-full h-full object-cover object-center bg-muted transition-opacity duration-100 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              } select-none pointer-events-none`}
              draggable={false}
            />

            {/* Watermark */}
            <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none select-none">
              <span className="text-white/20 text-2xl sm:text-3xl lg:text-2xl font-bold tracking-wider rotate-[-20deg]">
                NNAuto.cz
              </span>
            </div>

            {hasMultiplePhotos && (
              <div className="absolute bottom-2 left-2 z-20 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
                {allPhotos.length} foto
              </div>
            )}

            {isSold && (
              <div className="absolute top-2 left-2 z-20">
                <Badge
                  variant="secondary"
                  className="bg-zinc-800 text-white border-zinc-600 text-xs font-semibold"
                >
                  {t("listing.soldBadge")}
                </Badge>
              </div>
            )}

            {/* Favorites Button - on photo bottom-right */}
            <div
              className={`absolute bottom-2 z-[9999] w-10 h-10 bg-white/90 dark:bg-black/80 rounded-full flex items-center justify-center border border-gray-200 dark:border-gray-700 shadow-lg cursor-pointer hover:scale-110 transition-transform ${
                showEditButton || showDeleteButton || showSoldToggle
                  ? "right-24"
                  : "right-2"
              }`}
              onClick={handleFavoriteClick}
              data-testid={`button-favorite-${id}`}
            >
              <Heart
                className={`h-5 w-5 ${
                  favorite
                    ? "text-red-500 fill-red-500"
                    : "text-gray-600 dark:text-gray-300"
                }`}
              />
            </div>

            {/* Edit / sold / delete — grid */}
            {(showEditButton || showDeleteButton || showSoldToggle) && (
              <div className="absolute bottom-2 right-2 z-[9999] flex flex-col gap-1.5">
                {showEditButton && (
                  <div
                    className="bg-amber-500 hover:bg-amber-600 text-white rounded-lg px-3 py-1.5 shadow-lg cursor-pointer hover:scale-105 transition-all flex items-center gap-1.5 text-xs font-semibold"
                    onClick={handleEditClick}
                    data-testid={`button-edit-${id}`}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    <span>Upravit</span>
                  </div>
                )}
                {showSoldToggle && (
                  <div
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-3 py-1.5 shadow-lg cursor-pointer hover:scale-105 transition-all flex items-center gap-1.5 text-xs font-semibold disabled:opacity-60"
                    onClick={handleToggleSoldClick}
                    data-testid={`button-toggle-sold-${id}`}
                  >
                    {isTogglingSold ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    )}
                    <span>
                      {isSold
                        ? t("listing.markAvailableShort")
                        : t("listing.markSoldShort")}
                    </span>
                  </div>
                )}
                {showDeleteButton && (
                  <div
                    className="bg-red-500 hover:bg-red-600 text-white rounded-lg px-3 py-1.5 shadow-lg cursor-pointer hover:scale-105 transition-all flex items-center gap-1.5 text-xs font-semibold"
                    onClick={handleDeleteClick}
                    data-testid={`button-delete-${id}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Smazat</span>
                  </div>
                )}
              </div>
            )}

            {condition && (
              <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                <Badge className="bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 text-black border-2 border-amber-300 rounded-lg px-2.5 py-1 sm:px-3 sm:py-1.5 shadow-[0_4px_12px_rgba(251,191,36,0.6)] text-xs sm:text-sm font-bold flex items-center gap-1 animate-pulse">
                  <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-black" />
                  <span className="uppercase tracking-wide">{condition}</span>
                </Badge>
              </div>
            )}
            {/* Topovat Button - Grid View */}
            {showPromoteButton && (
              <button
                onClick={handlePromoteClick}
                disabled={isPromoting}
                className="absolute top-2 right-2 sm:top-3 sm:right-3 z-20 group"
                data-testid={`button-topovat-${id}`}
              >
                <div className="relative bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black rounded-lg px-3 py-1.5 sm:px-4 sm:py-2 shadow-[0_4px_15px_rgba(251,191,36,0.5)] text-xs sm:text-sm font-bold flex items-center gap-1.5 sm:gap-2 transition-all duration-300 hover:shadow-[0_6px_20px_rgba(251,191,36,0.7)] hover:scale-105 border border-amber-300">
                  {isPromoting ? (
                    <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                  ) : (
                    <Crown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  )}
                  <span className="uppercase tracking-wide">
                    {t("listings.topovat")}
                  </span>
                </div>
              </button>
            )}
          </div>
          <CardContent className="p-4 sm:p-6 lg:p-4 space-y-4 sm:space-y-6 lg:space-y-4 flex-1 flex flex-col">
            <div className="min-w-0">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] lg:grid-cols-1 items-start gap-2 sm:gap-3 mb-1 min-w-0">
                <h3
                  className="font-semibold text-lg sm:text-xl lg:text-lg leading-tight tracking-tight line-clamp-2 lg:line-clamp-none min-h-[3rem] sm:min-h-[3.5rem] lg:min-h-0 min-w-0 text-black dark:text-white"
                  data-testid="text-car-title"
                >
                  {title}
                </h3>

                <div className="text-right lg:text-right shrink-0 lg:justify-self-end">
                  <span
                    className="text-2xl sm:text-3xl lg:text-xl font-semibold text-primary whitespace-nowrap tracking-tight"
                    data-testid="text-car-price"
                  >
                    {price.toLocaleString()} Kč
                  </span>
                  {vatDeductible && (
                    <div className="text-xs text-green-600 dark:text-green-400 font-medium mt-0.5">
                      možnost odpočtu DPH
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="flex items-center gap-1.5 sm:gap-2 text-black dark:text-white">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                <span className="font-medium text-sm sm:text-base">{year}</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 text-black dark:text-white">
                <Gauge className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                <span className="font-medium text-sm sm:text-base truncate">
                  {mileage.toLocaleString()} km
                </span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 text-black dark:text-white">
                <Fuel className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                <span className="font-medium text-sm sm:text-base">{fuel}</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 text-black dark:text-white">
                <span className="font-medium text-sm sm:text-base truncate">
                  {transmission}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-white/10 text-xs sm:text-sm text-black dark:text-white mt-auto">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                <span className="font-medium">{location}</span>
              </div>
              {/* <span className="truncate ml-2">{datePosted}</span> */}
            </div>
            <StatsRow />
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}

export default memo(CarCard);
