/**
 * ============================================
 * THEME CONTEXT
 * ============================================
 *
 * Owns the appearance preference (light / dark / system) and hands the
 * built theme to the tree.
 *
 * - The preference is persisted with AsyncStorage; this is a demo, so no
 *   backend is involved.
 * - `system` follows the OS and keeps following it while the app is open.
 * - The theme is rebuilt when the language changes too, because the type
 *   scale swaps font family for Arabic.
 *
 * Usage:
 *   const { colors, typography, isDark } = useTheme();
 *   const styles = useStyles();            // built by makeStyles(...)
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
import { Appearance, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { AppTheme, ThemeMode, buildTheme } from '@/theme';
import { useLanguage } from '@/context/LanguageContext';

/** What the user picked in Settings */
export type ThemePreference = ThemeMode | 'system';

const THEME_STORAGE_KEY = '@mizan_invest/theme';

const PREFERENCES: ThemePreference[] = ['light', 'dark', 'system'];

function isThemePreference(value: string | null): value is ThemePreference {
  return value !== null && PREFERENCES.includes(value as ThemePreference);
}

interface ThemeContextValue extends AppTheme {
  /** Raw preference, including `system` */
  preference: ThemePreference;

  /** Change the appearance and persist it */
  setPreference: (preference: ThemePreference) => void;

  /** True once the stored preference has been read */
  isThemeReady: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { isRTL } = useLanguage();

  // First launch is intentionally dark. `system` remains an explicit
  // user choice only; it must never decide the initial appearance.
  const [preference, setPreferenceState] = useState<ThemePreference>('dark');
  const [systemScheme, setSystemScheme] = useState<ThemeMode>(
    Appearance.getColorScheme() === 'dark' ? 'dark' : 'light'
  );
  const [isThemeReady, setIsThemeReady] = useState(false);

  // Restore the stored preference once on mount
  useEffect(() => {
    let cancelled = false;

    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then((stored) => {
        if (!cancelled && isThemePreference(stored)) {
          setPreferenceState(stored);
        }
      })
      .catch(() => {
        // Storage unavailable — stay on the dark default
      })
      .finally(() => {
        if (!cancelled) setIsThemeReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Keep following the OS while `system` is selected
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme === 'dark' ? 'dark' : 'light');
    });
    return () => subscription.remove();
  }, []);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    AsyncStorage.setItem(THEME_STORAGE_KEY, next).catch(() => {
      // The in-memory choice still applies for this session
    });
  }, []);

  const mode: ThemeMode = preference === 'system' ? systemScheme : preference;

  const value = useMemo<ThemeContextValue>(
    () => ({
      ...buildTheme(mode, isRTL),
      preference,
      setPreference,
      isThemeReady,
    }),
    [mode, isRTL, preference, setPreference, isThemeReady]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

// ============================================
// THEMED STYLESHEETS
// ============================================

type NamedStyles = Parameters<typeof StyleSheet.create>[0];

/**
 * Turns a style factory into a hook.
 *
 * Styles are rebuilt only when the theme identity changes (appearance or
 * language), so a re-render costs nothing extra.
 *
 *   const useStyles = makeStyles((t) => ({
 *     card: { backgroundColor: t.colors.surface },
 *   }));
 *
 *   function Card() {
 *     const styles = useStyles();
 *     ...
 *   }
 */
export function makeStyles<T extends NamedStyles>(factory: (theme: AppTheme) => T) {
  return function useStyles(): T {
    const theme = useTheme();
    return useMemo(() => StyleSheet.create(factory(theme)), [theme]);
  };
}
