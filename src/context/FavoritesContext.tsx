/**
 * ============================================
 * FAVORITES CONTEXT
 * ============================================
 *
 * The single source of truth for saved listings. Every heart button in
 * the app — Home cards, Explore results, Property detail, Reels — reads
 * and writes through here, so the state can never disagree between two
 * screens.
 *
 * Demo scope: ids are kept in memory and mirrored to AsyncStorage. No
 * backend, no per-user sync.
 *
 * Usage:
 *   const { isFavorite, toggleFavorite } = useFavorites();
 */

import React, {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_STORAGE_KEY = '@mizan_invest/favorites';

/** Listings pre-saved so the Favorites tab is not empty on first launch */
const SEEDED_FAVORITES = ['2', '9'];

interface FavoritesContextValue {
  /** Saved listing ids, newest first */
  favoriteIds: string[];

  isFavorite: (id: string) => boolean;

  /** Adds or removes; returns the state the listing ends up in */
  toggleFavorite: (id: string) => boolean;

  count: number;
}

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>(SEEDED_FAVORITES);

  useEffect(() => {
    let cancelled = false;

    AsyncStorage.getItem(FAVORITES_STORAGE_KEY)
      .then((stored) => {
        if (cancelled || !stored) return;
        const parsed: unknown = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.every((id) => typeof id === 'string')) {
          setFavoriteIds(parsed);
        }
      })
      .catch(() => {
        // Unreadable or absent — keep the seeded demo favourites
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback((ids: string[]) => {
    AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(ids)).catch(() => {
      // In-memory state is still correct for this session
    });
  }, []);

  const toggleFavorite = useCallback(
    (id: string) => {
      let nowSaved = false;

      setFavoriteIds((current) => {
        const exists = current.includes(id);
        nowSaved = !exists;
        const next = exists ? current.filter((item) => item !== id) : [id, ...current];
        persist(next);
        return next;
      });

      return nowSaved;
    },
    [persist]
  );

  const value = useMemo<FavoritesContextValue>(
    () => ({
      favoriteIds,
      isFavorite: (id: string) => favoriteIds.includes(id),
      toggleFavorite,
      count: favoriteIds.length,
    }),
    [favoriteIds, toggleFavorite]
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites(): FavoritesContextValue {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within FavoritesProvider');
  }
  return context;
}
