import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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

  const addToFavorites = (listingId: string) => {
    setFavorites(prev => {
      if (prev.includes(listingId)) return prev;
      return [...prev, listingId];
    });
  };

  const removeFromFavorites = (listingId: string) => {
    setFavorites(prev => prev.filter(id => id !== listingId));
  };

  const isFavorite = (listingId: string) => {
    return favorites.includes(listingId);
  };

  const toggleFavorite = (listingId: string) => {
    if (isFavorite(listingId)) {
      removeFromFavorites(listingId);
    } else {
      addToFavorites(listingId);
    }
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addToFavorites,
        removeFromFavorites,
        isFavorite,
        toggleFavorite,
      }}
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
