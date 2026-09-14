/**
 * ============================================
 * CURRENCY CONTEXT
 * ============================================
 *
 * Holds the display currency (USD / TRY / RUB) and exposes the two
 * formatters every price on screen goes through.
 *
 * Demo scope: rates are the fixed constants in `@/constants/currency`
 * and the choice is persisted with AsyncStorage. No FX API.
 *
 * Usage:
 *   const { price, priceFull, currency, setCurrency } = useCurrency();
 *   <Text>{price(property.price)}</Text>
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

import {
  CURRENCY_ORDER,
  CurrencyCode,
  formatIncome,
  formatPrice,
  formatPriceFull,
  rateLabel,
} from '@/constants/currency';

const CURRENCY_STORAGE_KEY = '@mizan_invest/currency';

function isCurrencyCode(value: string | null): value is CurrencyCode {
  return value !== null && CURRENCY_ORDER.includes(value as CurrencyCode);
}

interface CurrencyContextValue {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;

  /** Compact price for cards — "$4.3M" */
  price: (usd: number) => string;

  /** Exact price for detail views — "$4,250,000" */
  priceFull: (usd: number) => string;

  /** Monthly income figure, exact */
  income: (usd: number) => string;

  /** "1 USD = 47 TRY" — shown next to the demo-rate disclaimer */
  rate: string;
}

const CurrencyContext = createContext<CurrencyContextValue | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  // First launch is intentionally rouble-denominated. A saved user
  // preference, when present, replaces this value during hydration.
  const [currency, setCurrencyState] = useState<CurrencyCode>('RUB');

  useEffect(() => {
    let cancelled = false;

    AsyncStorage.getItem(CURRENCY_STORAGE_KEY)
      .then((stored) => {
        if (!cancelled && isCurrencyCode(stored)) {
          setCurrencyState(stored);
        }
      })
      .catch(() => {
        // Storage unavailable — RUB stays selected
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const setCurrency = useCallback((next: CurrencyCode) => {
    setCurrencyState(next);
    AsyncStorage.setItem(CURRENCY_STORAGE_KEY, next).catch(() => {
      // Session-only selection is still fine
    });
  }, []);

  const value = useMemo<CurrencyContextValue>(
    () => ({
      currency,
      setCurrency,
      price: (usd: number) => formatPrice(usd, currency),
      priceFull: (usd: number) => formatPriceFull(usd, currency),
      income: (usd: number) => formatIncome(usd, currency),
      rate: rateLabel(currency),
    }),
    [currency, setCurrency]
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency(): CurrencyContextValue {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider');
  }
  return context;
}
