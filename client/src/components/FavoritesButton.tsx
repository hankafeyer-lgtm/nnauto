import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart } from "lucide-react";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useTranslation } from "@/lib/translations";
import { useState, lazy, Suspense } from "react";

const FavoritesModal = lazy(() => import("@/components/FavoritesModal").then(m => ({ default: m.FavoritesModal })));

export function FavoritesButton() {
  const { favorites } = useFavorites();
  const t = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        className="!fixed !bottom-4 !right-4 sm:!bottom-6 sm:!right-6 rounded-full shadow-2xl !z-[9999] bg-primary hover:bg-primary text-primary-foreground h-14 w-14 sm:h-auto sm:w-auto sm:px-6 sm:py-3 p-0 pointer-events-auto"
        data-testid="button-favorites-floating"
      >
        <div className="relative flex items-center justify-center sm:justify-start">
          <Heart className="h-5 w-5 sm:mr-2 fill-current" />
          <span className="hidden sm:inline font-semibold">{t('favorites.button')}</span>
          {favorites.length > 0 && (
            <Badge 
              className="absolute -top-2 -right-2 sm:static sm:ml-2 bg-background text-foreground rounded-full min-w-5 h-5 sm:min-w-6 sm:h-6 flex items-center justify-center text-xs sm:text-sm"
              data-testid="badge-favorites-count"
            >
              {favorites.length}
            </Badge>
          )}
        </div>
      </Button>
      
      {isModalOpen && (
        <Suspense fallback={null}>
          <FavoritesModal 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          />
        </Suspense>
      )}
    </>
  );
}
