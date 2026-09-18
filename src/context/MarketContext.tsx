/** Guest market preference. Future authenticated profile sync belongs here. */

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { isMarketCode, MarketCode } from '@/constants/markets';

export type { MarketCode } from '@/constants/markets';

export const MARKET_STORAGE_KEY = '@mizan_invest/market';

interface StoredMarketPreference {
  selectedMarket: MarketCode;
  hasChosenMarket: true;
}

interface MarketContextValue {
  selectedMarket: MarketCode;
  setSelectedMarket: (market: MarketCode) => void;
  isMarketReady: boolean;
  hasChosenMarket: boolean;
  /**
   * Clears the stored market choice so the onboarding/market flow runs again.
   * This is a PREFERENCE reset, not a sign-out: the account, favourites, roles
   * and partner membership are untouched.
   */
  resetMarketChoice: () => Promise<void>;
}

const MarketContext = createContext<MarketContextValue | undefined>(undefined);

function parseStoredMarket(value: string | null): StoredMarketPreference | null {
  if (!value) return null;

  try {
    const parsed: unknown = JSON.parse(value);
    if (
      typeof parsed === 'object'
      && parsed !== null
      && 'selectedMarket' in parsed
      && 'hasChosenMarket' in parsed
      && parsed.hasChosenMarket === true
      && isMarketCode(parsed.selectedMarket)
    ) {
      return parsed as StoredMarketPreference;
    }
  } catch {
    // An invalid local preference simply restarts the choice flow.
  }

  return null;
}

export function MarketProvider({ children }: { children: ReactNode }) {
  const [selectedMarket, setSelectedMarketState] = useState<MarketCode>(null);
  const [hasChosenMarket, setHasChosenMarket] = useState(false);
  const [isMarketReady, setIsMarketReady] = useState(false);

  useEffect(() => {
    let active = true;

    const restore = async () => {
      try {
        const saved = parseStoredMarket(await AsyncStorage.getItem(MARKET_STORAGE_KEY));
        if (active && saved) {
          setSelectedMarketState(saved.selectedMarket);
          setHasChosenMarket(true);
        }
      } catch {
        // Local storage may be unavailable; manual selection remains usable.
      } finally {
        if (active) setIsMarketReady(true);
      }
    };

    void restore();
    return () => {
      active = false;
    };
  }, []);

  const setSelectedMarket = useCallback((market: MarketCode) => {
    const preference: StoredMarketPreference = { selectedMarket: market, hasChosenMarket: true };
    setSelectedMarketState(market);
    setHasChosenMarket(true);
    AsyncStorage.setItem(MARKET_STORAGE_KEY, JSON.stringify(preference)).catch(() => {
      // The in-memory choice still applies for this session.
    });

    // TODO: When auth ships, sync this guest preference with
    // profiles.preferred_country_id without blocking the local experience.
  }, []);

  const resetMarketChoice = useCallback(async () => {
    setSelectedMarketState(null);
    setHasChosenMarket(false);
    try {
      await AsyncStorage.removeItem(MARKET_STORAGE_KEY);
    } catch {
      // The in-memory reset still sends this session back through the flow.
    }
  }, []);

  const value = useMemo<MarketContextValue>(
    () => ({ selectedMarket, setSelectedMarket, isMarketReady, hasChosenMarket, resetMarketChoice }),
    [hasChosenMarket, isMarketReady, resetMarketChoice, selectedMarket, setSelectedMarket],
  );

  return <MarketContext.Provider value={value}>{children}</MarketContext.Provider>;
}

export function useMarket() {
  const context = useContext(MarketContext);
  if (!context) throw new Error('useMarket must be used within MarketProvider');
  return context;
}
