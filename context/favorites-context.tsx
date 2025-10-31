"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FavoriteItem,
  isStorageWritable,
  parseFavorites,
  persistFavorites,
  toggleFavoriteEntry,
  reorderFavoritesArray,
} from "./favorites-helpers";

export interface FavoritesContextValue {
  favorites: FavoriteItem[];
  toggleFavorite: (item: FavoriteItem) => void;
  removeFavorite: (id: string) => void;
  clearFavorites: () => void;
  reorderFavorites: (startIndex: number, endIndex: number) => void;
  isFavorite: (id: string) => boolean;
  getTotalFavorites: () => number;
  isFavoritesLoaded: boolean;
  isLocalStorageAvailable: boolean;
}

const FavoritesContext = createContext<FavoritesContextValue | undefined>(
  undefined,
);

export type { FavoriteItem } from "./favorites-helpers";

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isFavoritesLoaded, setIsFavoritesLoaded] = useState(false);
  const [isLocalStorageAvailable, setIsLocalStorageAvailable] = useState(true);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      setIsFavoritesLoaded(true);
      setHasInitialized(true);
      return;
    }

    if (!hasMounted) return;

    const loadFavorites = async () => {
      try {
        const writable = isStorageWritable(window.localStorage);
        setIsLocalStorageAvailable(writable);
        if (!writable) {
          return;
        }

        const storedFavorites = window.localStorage.getItem("favorites");
        if (!storedFavorites) return;

        const parsedFavorites = parseFavorites(storedFavorites);
        if (parsedFavorites.length > 0) {
          setFavorites(parsedFavorites);
        } else {
          window.localStorage.removeItem("favorites");
        }
      } catch (error) {
        console.error("Favorites localStorage not available", error);
        setIsLocalStorageAvailable(false);
      } finally {
        setIsFavoritesLoaded(true);
        setHasInitialized(true);
      }
    };

    const timeoutId = window.setTimeout(loadFavorites, 0);
    return () => window.clearTimeout(timeoutId);
  }, [hasMounted]);

  useEffect(() => {
    if (!isFavoritesLoaded) return;
    if (!isLocalStorageAvailable) return;
    if (!hasInitialized) return;

    try {
      persistFavorites(window.localStorage, favorites);
    } catch (error) {
      console.error("Error saving favorites to localStorage", error);
    }
  }, [favorites, hasInitialized, isFavoritesLoaded, isLocalStorageAvailable]);

  const toggleFavorite = useCallback((item: FavoriteItem) => {
    setFavorites((prevFavorites) => toggleFavoriteEntry(prevFavorites, item));
  }, []);

  const removeFavorite = useCallback((id: string) => {
    setFavorites((prevFavorites) =>
      prevFavorites.filter((favoriteItem) => favoriteItem.id !== id),
    );
  }, []);

  const clearFavorites = useCallback(() => {
    setFavorites([]);
  }, []);

  const reorderFavorites = useCallback((startIndex: number, endIndex: number) => {
    setFavorites((prevFavorites) => {
      const nextFavorites = reorderFavoritesArray(prevFavorites, startIndex, endIndex);
      return nextFavorites === prevFavorites ? prevFavorites : nextFavorites;
    });
  }, []);

  const isFavorite = useCallback(
    (id: string) => favorites.some((favoriteItem) => favoriteItem.id === id),
    [favorites],
  );

  const getTotalFavorites = useCallback(
    () => favorites.length,
    [favorites.length],
  );

  const value = useMemo<FavoritesContextValue>(
    () => ({
      favorites,
      toggleFavorite,
      removeFavorite,
      clearFavorites,
      reorderFavorites,
      isFavorite,
      getTotalFavorites,
      isFavoritesLoaded,
      isLocalStorageAvailable,
    }),
    [
      favorites,
      isFavoritesLoaded,
      isLocalStorageAvailable,
      toggleFavorite,
      removeFavorite,
      clearFavorites,
      reorderFavorites,
      isFavorite,
      getTotalFavorites,
    ],
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
}


