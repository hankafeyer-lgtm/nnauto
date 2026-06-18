import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useTranslation, useLocalizedOptions } from "@/lib/translations";
import { useQuery } from "@tanstack/react-query";
import { Listing } from "@shared/schema";
import CarCard from "./CarCard";
import { getListingMainTitle } from "@/lib/listingTitle";
import { formatDistanceToNow } from "date-fns";
import { cs, uk, enUS, de } from "date-fns/locale";
import { useLanguage } from "@/contexts/LanguageContext";
import { Heart } from "lucide-react";

interface FavoritesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FavoritesModal({ isOpen, onClose }: FavoritesModalProps) {
  const { favorites } = useFavorites();
  const t = useTranslation();
  const { language } = useLanguage();
  const localizedOptions = useLocalizedOptions();

  interface ListingsResponse {
    listings: Listing[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasMore: boolean;
    };
  }

  const { data, isLoading } = useQuery<ListingsResponse>({
    queryKey: ['/api/listings'],
    enabled: isOpen && favorites.length > 0,
  });

  const listings = data?.listings || [];

  const favoriteListings = listings.filter(listing => 
    favorites.includes(listing.id)
  );

  const dateLocales = {
    cs: cs,
    uk: uk,
    en: enUS,
    de: de,
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-6xl max-h-[90vh] overflow-y-auto"
        data-testid="dialog-favorites"
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Heart className="h-6 w-6 fill-red-500 text-red-500" />
            {t('favorites.title')}
            {favorites.length > 0 && (
              <span className="text-muted-foreground text-lg font-normal">
                ({favorites.length} {t('favorites.count')})
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        {favorites.length === 0 ? (
          <div 
            className="flex flex-col items-center justify-center py-16 px-4 text-center"
            data-testid="div-favorites-empty"
          >
            <Heart className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {t('favorites.empty')}
            </h3>
            <p className="text-muted-foreground max-w-md">
              {t('favorites.emptyDescription')}
            </p>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6">
            {[...Array(favorites.length)].map((_, i) => (
              <div 
                key={i} 
                className="h-96 bg-muted animate-pulse rounded-2xl"
              />
            ))}
          </div>
        ) : (
          <div 
            className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6"
            data-testid="grid-favorites-listings"
          >
            {favoriteListings.map((listing) => {
              const fuelLabels: Record<string, string> = {
                benzin: t("hero.benzin"),
                diesel: t("hero.diesel"),
                hybrid: t("hero.hybrid"),
                electric: t("hero.electric"),
                lpg: t("hero.lpg"),
                cng: t("hero.cng"),
                ethanol: t("hero.ethanol"),
                hydrogen: t("hero.hydrogen"),
                other: t("hero.otherFuel"),
              };

              const transmissionLabels: Record<string, string> = {
                manual: t("filters.manual"),
                automatic: t("filters.automatic"),
                robot: t("filters.robot"),
                cvt: t("filters.cvt"),
              };
              
              const regions = localizedOptions.getRegions();
              const regionLabel = listing.region
                ? regions.find((r: { value: string; label: string }) => r.value === listing.region)?.label || listing.region
                : '';
              
              const datePosted = listing.createdAt
                ? formatDistanceToNow(new Date(listing.createdAt), {
                    addSuffix: true,
                    locale: dateLocales[language],
                  })
                : '';

              // Use the listing's own first photo; cars without a photo fall
              // back to CarCard's built-in neutral placeholder (no stock image).
              const listingPhoto = listing.photos && listing.photos.length > 0 
                ? listing.photos[0] 
                : null;
              const image = listingPhoto || "";

              // Handle array fields - take first value if array
              const fuelValue = Array.isArray(listing.fuelType) ? listing.fuelType[0] : listing.fuelType;
              const transmissionValue = Array.isArray(listing.transmission) ? listing.transmission[0] : listing.transmission;

              return (
                <div key={listing.id} onClick={onClose}>
                  <CarCard
                    id={listing.id}
                    brand={listing.brand}
                    model={listing.model}
                    image={image}
                    title={getListingMainTitle(listing)}
                    price={Number(listing.price)}
                    year={listing.year}
                    mileage={listing.mileage}
                    fuel={fuelValue ? (fuelLabels[fuelValue] || fuelValue) : "-"}
                    transmission={transmissionValue ? (transmissionLabels[transmissionValue] || transmissionValue) : "-"}
                    location={regionLabel}
                    datePosted={datePosted}
                    vatDeductible={listing.vatDeductible}
                  />
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
