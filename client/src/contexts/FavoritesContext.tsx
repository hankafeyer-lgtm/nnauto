import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';

interface FavoritesContextType {
  favorites: string[];
  addToFavorites: (listingId: string) => void;
  removeFromFavorites: (listingId: string) => void;
  isFavorite: (listingId: string) => boolean;
  toggleFavorite: (listingId: string) => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('zlateauto_favorites');
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse favorites from localStorage', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('zlateauto_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const favoriteIds = useMemo(() => new Set(favorites), [favorites]);

  const addToFavorites = useCallback((listingId: string) => {
    setFavorites(prev => {
      if (prev.includes(listingId)) return prev;
      return [...prev, listingId];
    });
  }, []);

  const removeFromFavorites = useCallback((listingId: string) => {
    setFavorites(prev => prev.filter(id => id !== listingId));
  }, []);

  const isFavorite = useCallback((listingId: string) => favoriteIds.has(listingId), [
    favoriteIds,
  ]);

  const toggleFavorite = useCallback((listingId: string) => {
    if (isFavorite(listingId)) {
      removeFromFavorites(listingId);
    } else {
      addToFavorites(listingId);
    }
  }, [addToFavorites, isFavorite, removeFromFavorites]);

  const contextValue = useMemo(
    () => ({
      favorites,
      addToFavorites,
      removeFromFavorites,
      isFavorite,
      toggleFavorite,
    }),
    [favorites, addToFavorites, removeFromFavorites, isFavorite, toggleFavorite],
  );

  return (
    <FavoritesContext.Provider
      value={contextValue}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
