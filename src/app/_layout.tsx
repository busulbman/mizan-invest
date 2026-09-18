/**
 * ============================================
 * ROOT LAYOUT
 * ============================================
 *
 * Provider order (outermost first):
 *   GestureHandlerRootView → required by react-native-gesture-handler
 *   LanguageProvider       → language + persisted preference
 *   ThemeProvider          → appearance; reads language for the Arabic
 *                            font stack, so it must sit inside it
 *   CurrencyProvider       → display currency
 *   FavoritesProvider      → shared saved-listing state
 *   NotificationsProvider  → in-app notification centre
 *
 * SafeAreaProvider comes from expo-router's ExpoRoot, so it is not
 * duplicated here — screens call useSafeAreaInsets() directly.
 *
 * Rendering is held back until both the stored language and the custom
 * fonts are ready. Without that the first frame would paint in the
 * fallback language and the system font, then visibly reflow.
 */

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { useFonts } from 'expo-font';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { fontAssets } from '@/theme/fonts';
import { LanguageProvider, useLanguage } from '@/context/LanguageContext';
import { ThemeProvider, makeStyles, useTheme } from '@/context/ThemeContext';
import { CurrencyProvider } from '@/context/CurrencyContext';
import { FavoritesProvider } from '@/context/FavoritesContext';
import { NotificationsProvider } from '@/context/NotificationsContext';
import { MarketProvider, useMarket } from '@/context/MarketContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';

function RootNavigator() {
  const styles = useStyles();
  const { isReady } = useLanguage();
  const { isMarketReady } = useMarket();
  const { isLoading: isAuthLoading } = useAuth();
  const { isDark, colors } = useTheme();
  const [fontsLoaded] = useFonts(fontAssets);

  if (!isReady || !isMarketReady || isAuthLoading || !fontsLoaded) {
    // Same colour as the splash so the handover shows no white flash
    return <View style={styles.placeholder} />;
  }

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(main)" />
        <Stack.Screen name="(partner)" />
        <Stack.Screen name="(admin)" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <LanguageProvider>
        <ThemeProvider>
          <CurrencyProvider>
            <MarketProvider>
              <AuthProvider>
                <FavoritesProvider>
                  <NotificationsProvider>
                    <RootNavigator />
                  </NotificationsProvider>
                </FavoritesProvider>
              </AuthProvider>
            </MarketProvider>
          </CurrencyProvider>
        </ThemeProvider>
      </LanguageProvider>
    </GestureHandlerRootView>
  );
}

const useStyles = makeStyles((t) => ({
  placeholder: {
    flex: 1,
    backgroundColor: t.colors.backgroundDark,
  },
}));
