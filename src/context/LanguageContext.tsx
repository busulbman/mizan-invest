/**
 * ============================================
 * LANGUAGE CONTEXT
 * ============================================
 *
 * Global language state for Mizan Invest.
 *
 * - Default language is DEFAULT_LANGUAGE ('ru'), never hardcoded here.
 * - The selected language is persisted with AsyncStorage and restored
 *   on the next launch.
 * - `isReady` stays false until the stored language has been read, so
 *   screens never flash in the wrong language before hydration.
 *
 * Usage:
 *   const { t, language, setLanguage } = useLanguage();
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  DEFAULT_LANGUAGE,
  Language,
  RTL_LANGUAGES,
  translations,
  TranslationKey,
} from '@/constants/translations';

/** AsyncStorage key holding the user's language preference */
const LANGUAGE_STORAGE_KEY = '@mizan_invest/language';

const SUPPORTED_LANGUAGES: Language[] = ['en', 'tr', 'ru', 'ar'];

function isSupportedLanguage(value: string | null): value is Language {
  return value !== null && SUPPORTED_LANGUAGES.includes(value as Language);
}

interface LanguageContextValue {
  /** Currently active language */
  language: Language;

  /** Change language and persist the choice */
  setLanguage: (lang: Language) => void;

  /** Translate a key using the active language */
  t: (key: TranslationKey) => string;

  /** True once the stored language has been restored */
  isReady: boolean;

  /** True when the active language renders right-to-left */
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);
  const [isReady, setIsReady] = useState(false);

  // Restore the stored language once on mount
  useEffect(() => {
    let cancelled = false;

    const restoreLanguage = async () => {
      try {
        const stored = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (!cancelled && isSupportedLanguage(stored)) {
          setLanguageState(stored);
        }
      } catch {
        // Storage unavailable — fall back to DEFAULT_LANGUAGE
      } finally {
        if (!cancelled) {
          setIsReady(true);
        }
      }
    };

    restoreLanguage();

    return () => {
      cancelled = true;
    };
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    // Update immediately so the open screen re-renders without waiting on IO
    setLanguageState(lang);
    AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang).catch(() => {
      // Persisting failed — the in-memory choice still applies for this session
    });
  }, []);

  const t = useCallback(
    (key: TranslationKey): string => translations[language][key] ?? translations.en[key],
    [language]
  );

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage,
      t,
      isReady,
      isRTL: RTL_LANGUAGES.includes(language),
    }),
    [language, setLanguage, t, isReady]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
