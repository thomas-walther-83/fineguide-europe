import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { getItem, setItem } from './storage';

const STORAGE_KEY = 'fineguide.favorites.v1';

type FavoritesContextValue = {
  /** Favorite country ids, in insertion order. */
  favorites: string[];
  isFavorite: (id: string) => boolean;
  /** Add the id if absent, remove it if present. */
  toggle: (id: string) => void;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

/**
 * Provides the user's favorite countries, persisted locally via `lib/storage`
 * so they survive reloads (works on web + native). Mount once near the app
 * root (see `app/_layout.tsx`).
 */
export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);
  // Avoid persisting the initial empty state before the stored value loads.
  const loaded = useRef(false);

  useEffect(() => {
    let active = true;
    getItem<string[]>(STORAGE_KEY, []).then((stored) => {
      if (!active) return;
      if (Array.isArray(stored)) setFavorites(stored.filter((x) => typeof x === 'string'));
      loaded.current = true;
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    void setItem(STORAGE_KEY, favorites);
  }, [favorites]);

  const toggle = useCallback((id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const isFavorite = useCallback((id: string) => favorites.includes(id), [favorites]);

  const value = useMemo<FavoritesContextValue>(
    () => ({ favorites, isFavorite, toggle }),
    [favorites, isFavorite, toggle]
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites(): FavoritesContextValue {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error('useFavorites must be used within a <FavoritesProvider>.');
  }
  return ctx;
}
