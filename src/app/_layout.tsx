/**
 * ============================================
 * ROOT LAYOUT
 * ============================================
 *
 * Provider order (outermost first):
 *   GestureHandlerRootView  → required by react-native-gesture-handler
 *   LanguageProvider        → global language + persisted preference
 *   Stack                   → route groups
 *
 * Note: SafeAreaProvider is already supplied by expo-router's ExpoRoot,
 * so it is intentionally not duplicated here. Screens can call
 * useSafeAreaInsets() directly.
 *
 * Rendering is held back until the stored language is restored, which
 * prevents a brief flash of the fallback language on cold start. The
 * placeholder uses the same dark colour as the splash screen so the
 * transition stays seamless.
 */

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { LanguageProvider, useLanguage } from '@/context/LanguageContext';
import { theme } from '@/theme';

function RootNavigator() {
  const { isReady } = useLanguage();

  if (!isReady) {
    // Matches the splash background so no white frame appears
    return <View style={styles.placeholder} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(main)" />
      <Stack.Screen name="(partner)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <LanguageProvider>
        <StatusBar style="auto" />
        <RootNavigator />
      </LanguageProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  placeholder: {
    flex: 1,
    backgroundColor: theme.colors.backgroundDark,
  },
});
