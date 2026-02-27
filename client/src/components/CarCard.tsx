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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Link } from "wouter";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useTranslation } from "@/lib/translations";
import { useState, memo, useRef, useEffect, useCallback, useMemo } from "react";
import { saveScrollPosition } from "@/components/ScrollToTop";
import { prefetchListing } from "@/lib/queryClient";
import {
  getCardImageUrl,
  getThumbnailUrl,
  getCardSrcSet,
  getOptimizedImageUrl,
} from "@/lib/imageOptimizer";

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
  priority?: boolean;
  vatDeductible?: boolean;
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
  priority = false,
  vatDeductible = false,
}: CarCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const t = useTranslation();
  const favorite = isFavorite(id);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  // Touch/swipe support
  const touchStartRef = useRef<number | null>(null);
  const touchEndRef = useRef<number | null>(null);
  const minSwipeDistance = 50;

  // Get all photos for navigation (use photos array if available, otherwise just the main image)
  const allPhotos = photos.length > 0 ? photos : [image];
  const hasMultiplePhotos = allPhotos.length > 1;
  const currentImage = allPhotos[currentPhotoIndex] || image;

  // Memoize optimized image URLs
  const optimizedPhotos = useMemo(
    () => allPhotos.map((photo) => getCardImageUrl(photo)),
    [allPhotos],
  );
  const currentOptimizedImage =
    optimizedPhotos[currentPhotoIndex] || getCardImageUrl(image);

  // Preload next and previous images for instant navigation
  useEffect(() => {
    if (!hasMultiplePhotos) return;

    const preloadIndices = [
      (currentPhotoIndex + 1) % optimizedPhotos.length,
      (currentPhotoIndex - 1 + optimizedPhotos.length) % optimizedPhotos.length,
    ];

    preloadIndices.forEach((idx) => {
      const img = new Image();
      img.src = optimizedPhotos[idx];
    });
  }, [currentPhotoIndex, optimizedPhotos, hasMultiplePhotos]);

  const handlePrevPhoto = (e: React.MouseEvent | React.TouchEvent) => {
    if ("preventDefault" in e) e.preventDefault();
    if ("stopPropagation" in e) e.stopPropagation();
    setCurrentPhotoIndex((prev) =>
      prev === 0 ? allPhotos.length - 1 : prev - 1,
    );
    setImageLoaded(false);
  };

  const handleNextPhoto = (e: React.MouseEvent | React.TouchEvent) => {
    if ("preventDefault" in e) e.preventDefault();
    if ("stopPropagation" in e) e.stopPropagation();
    setCurrentPhotoIndex((prev) =>
      prev === allPhotos.length - 1 ? 0 : prev + 1,
    );
    setImageLoaded(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchEndRef.current = null;
    touchStartRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || !touchEndRef.current) return;

    const distance = touchStartRef.current - touchEndRef.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (hasMultiplePhotos) {
      if (isLeftSwipe) {
        e.preventDefault();
        e.stopPropagation();
        handleNextPhoto(e);
      } else if (isRightSwipe) {
        e.preventDefault();
        e.stopPropagation();
        handlePrevPhoto(e);
      }
    }

    touchStartRef.current = null;
    touchEndRef.current = null;
  };

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

  // Show promote button if user owns the listing and it's not already TOP
  const showPromoteButton = isOwner && !isTopListing && onPromote;
  // Show edit button if user owns the listing
  const showEditButton = isOwner && onEdit;
  // Show delete button if user owns the listing
  const showDeleteButton = isOwner && onDelete;

  // Prefetch listing data on hover for faster navigation
  const handlePrefetch = useCallback(() => {
    prefetchListing(id);
  }, [id]);

  if (viewMode === "list") {
    return (
      <div className="relative isolate mb-2" onMouseEnter={handlePrefetch}>
        <Link
          href={`/listing/${id}`}
          data-testid={`link-car-${id}`}
          onClick={saveScrollPosition}
        >
          <Card
            className="overflow-hidden hover-elevate active-elevate-2 cursor-pointer transition-all hover:shadow-lg duration-300 rounded-xl"
            data-testid={`card-car-${title.toLowerCase().replace(/\s+/g, "-")}`}
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
                    quality: 80,
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
                {/* Edit and Delete buttons - bottom-right of photo (list view) */}
                {(showEditButton || showDeleteButton) && (
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
                      className="font-semibold text-xl sm:text-2xl leading-tight tracking-tight"
                      data-testid="text-car-title"
                    >
                      {title}
                    </h3>
                    <div className="text-right">
                      <span
                        className="text-2xl sm:text-3xl font-semibold text-primary whitespace-nowrap tracking-tight"
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
              </CardContent>
            </div>
          </Card>
        </Link>

        <Button
          size="icon"
          variant="ghost"
          className={`absolute top-3 left-3 rounded-full bg-white/90 dark:bg-black/70 backdrop-blur-sm hover:bg-white dark:hover:bg-black/90 z-10 shadow-md border border-gray-200/50 dark:border-gray-700/50 ${
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
    <div className="relative h-full isolate pb-2" onMouseEnter={handlePrefetch}>
      <Link
        href={`/listing/${id}`}
        data-testid={`link-car-${id}`}
        className="block h-full"
        onClick={saveScrollPosition}
      >
        <Card
          className="overflow-hidden hover-elevate active-elevate-2 cursor-pointer transition-all hover:shadow-2xl sm:hover:scale-[1.02] duration-300 rounded-xl sm:rounded-2xl h-full flex flex-col"
          data-testid={`card-car-${title.toLowerCase().replace(/\s+/g, "-")}`}
        >
          <div
            className="relative bg-muted group/photo touch-pan-y min-w-0 shrink-0 h-[240px] sm:h-[260px] lg:h-[280px] overflow-hidden"
            onTouchStart={hasMultiplePhotos ? handleTouchStart : undefined}
            onTouchMove={hasMultiplePhotos ? handleTouchMove : undefined}
            onTouchEnd={hasMultiplePhotos ? handleTouchEnd : undefined}
          >
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 bg-gradient-to-r from-muted via-muted/80 to-muted animate-pulse" />
            )}
            <img
              src={currentOptimizedImage}
              alt={title}
              loading={priority ? "eager" : "lazy"}
              decoding="async"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              className={`absolute inset-0 w-full h-full object-cover object-center bg-muted transition-opacity duration-200 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              } select-none pointer-events-none`}
              draggable={false}
            />

            {/* Photo navigation arrows - flex container ensures proper positioning */}
            {hasMultiplePhotos && (
              <>
                <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 z-20 flex justify-between pointer-events-none">
                  <button
                    onClick={handlePrevPhoto}
                    className="bg-black/60 hover:bg-black/80 text-white rounded-full p-2 sm:p-1.5 opacity-70 sm:opacity-0 sm:group-hover/photo:opacity-100 transition-opacity duration-200 active:scale-95 pointer-events-auto"
                    data-testid={`button-prev-photo-${id}`}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleNextPhoto}
                    className="bg-black/60 hover:bg-black/80 text-white rounded-full p-2 sm:p-1.5 opacity-70 sm:opacity-0 sm:group-hover/photo:opacity-100 transition-opacity duration-200 active:scale-95 pointer-events-auto"
                    data-testid={`button-next-photo-${id}`}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Photo dots indicator */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
                  {allPhotos.slice(0, 5).map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setCurrentPhotoIndex(index);
                        setImageLoaded(false);
                      }}
                      className={`w-2 h-2 rounded-full transition-all ${
                        currentPhotoIndex === index
                          ? "bg-white scale-110"
                          : "bg-white/50 hover:bg-white/75"
                      }`}
                      data-testid={`button-photo-dot-${id}-${index}`}
                    />
                  ))}
                  {allPhotos.length > 5 && (
                    <span className="text-white text-xs font-medium ml-1">
                      +{allPhotos.length - 5}
                    </span>
                  )}
                </div>
              </>
            )}

            {/* Favorites Button - on photo top-left */}
            <div
              className="absolute top-2 left-2 z-[9999] w-10 h-10 bg-white/90 dark:bg-black/80 rounded-full flex items-center justify-center border border-gray-200 dark:border-gray-700 shadow-lg cursor-pointer hover:scale-110 transition-transform"
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

            {/* Edit and Delete buttons - bottom-right of photo with text labels */}
            {(showEditButton || showDeleteButton) && (
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
          <CardContent className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 flex-1 flex flex-col">
            <div className="min-w-0">
              <div className="flex items-start justify-between gap-2 sm:gap-3 mb-1 min-w-0">
                <h3
                  className="font-semibold text-lg sm:text-xl lg:text-2xl leading-tight tracking-tight line-clamp-2 min-h-[3rem] sm:min-h-[3.5rem] flex-1 min-w-0 text-black dark:text-white"
                  data-testid="text-car-title"
                >
                  {title}
                </h3>

                <div className="text-right shrink-0">
                  <span
                    className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-primary whitespace-nowrap tracking-tight"
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
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}

export default memo(CarCard);
