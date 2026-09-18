/** First-use guest market choice; location is optional and suggestion-only. */

import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { AppIcon, Button } from '@/components/ui';
import { MARKET_OPTIONS, MarketCode } from '@/constants/markets';
import { useLanguage } from '@/context/LanguageContext';
import { useMarket } from '@/context/MarketContext';
import { makeStyles, useTheme } from '@/context/ThemeContext';
import { suggestMarketFromDevice } from '@/lib/marketLocation';

function suggestionKey(market: MarketCode) {
  return market === 'sa'
    ? 'locationSuggestedSaudi'
    : market === 'ae'
      ? 'locationSuggestedUae'
      : 'locationSuggestedAll';
}

export default function MarketChoiceScreen() {
  const styles = useStyles();
  const { colors, gradients } = useTheme();
  const { t } = useLanguage();
  const { setSelectedMarket } = useMarket();
  const insets = useSafeAreaInsets();
  const [suggestedMarket, setSuggestedMarket] = useState<MarketCode | undefined>();
  const [detecting, setDetecting] = useState(false);
  const [locationUnavailable, setLocationUnavailable] = useState(false);

  const chooseMarket = (market: MarketCode) => {
    setSelectedMarket(market);
    router.replace('/(main)/home');
  };

  const detectMarket = async () => {
    if (detecting) return;
    setDetecting(true);
    setLocationUnavailable(false);
    try {
      const result = await suggestMarketFromDevice();
      if (!result.permissionGranted) {
        setLocationUnavailable(true);
        return;
      }
      setSuggestedMarket(result.market);
    } catch {
      setLocationUnavailable(true);
    } finally {
      setDetecting(false);
    }
  };

  const suggestedOption = MARKET_OPTIONS.find((option) => option.code === suggestedMarket);

  return (
    <View style={styles.container}>
      <LinearGradient colors={gradients.darkBackground} style={styles.fill}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingTop: insets.top + 28, paddingBottom: insets.bottom + 28 }]}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
            <View style={styles.iconWrap}>
              <AppIcon name="globe" size="xl" color={colors.accent} />
            </View>
            <Text style={styles.title}>{t('chooseInvestmentMarket')}</Text>
          </Animated.View>

          {suggestedOption && suggestedMarket !== undefined ? (
            <Animated.View entering={FadeIn.delay(80)} style={styles.suggestion}>
              <View style={styles.suggestionLabel}>
                <AppIcon name="location" size="sm" color={colors.accent} />
                <Text style={styles.suggestionText}>{t(suggestionKey(suggestedMarket))}</Text>
              </View>
              <Button
                title={`${t('continueWithMarket')}: ${t(suggestedOption.countryKey)}`}
                onPress={() => chooseMarket(suggestedMarket)}
                variant="gold"
                size="lg"
              />
              <Button
                title={t('chooseAnotherMarket')}
                onPress={() => setSuggestedMarket(undefined)}
                variant="outline"
                size="md"
              />
            </Animated.View>
          ) : (
            <>
              <View style={styles.marketList}>
                {MARKET_OPTIONS.map((option) => (
                  <Pressable
                    key={option.code ?? 'all'}
                    onPress={() => chooseMarket(option.code)}
                    accessibilityRole="button"
                    accessibilityLabel={t(option.countryKey)}
                    style={({ pressed }) => [styles.marketOption, pressed && styles.pressed]}
                  >
                    <Text style={styles.flag}>{option.flag}</Text>
                    <View style={styles.marketText}>
                      <Text style={styles.marketTitle}>{t(option.countryKey)}</Text>
                      <Text style={styles.marketDetails} numberOfLines={2}>{t(option.detailsKey)}</Text>
                    </View>
                    <AppIcon name="forward" size="sm" color={colors.textMuted} />
                  </Pressable>
                ))}
              </View>

              <View style={styles.locationArea}>
                {locationUnavailable && (
                  <Text style={styles.locationError}>{t('marketLocationUnavailable')}</Text>
                )}
                <Button
                  title={detecting ? t('detectingMarket') : t('useMyLocation')}
                  onPress={() => void detectMarket()}
                  variant="outline"
                  size="md"
                  icon="location"
                  loading={detecting}
                />
              </View>
            </>
          )}
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  container: { flex: 1, backgroundColor: t.colors.backgroundDark },
  fill: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: t.spacing.xl, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: t.spacing.xl },
  iconWrap: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', backgroundColor: t.colors.accentOverlay.light, marginBottom: t.spacing.md },
  title: { ...t.typography.h2, color: t.colors.onDark, textAlign: 'center' },
  marketList: { gap: t.spacing.sm },
  marketOption: { minHeight: 76, flexDirection: 'row', alignItems: 'center', gap: t.spacing.smd, padding: t.spacing.md, borderRadius: t.borderRadius.xl, backgroundColor: t.colors.overlay.light, borderWidth: 1, borderColor: t.colors.overlay.medium },
  flag: { fontSize: 28 },
  marketText: { flex: 1, minWidth: 0 },
  marketTitle: { ...t.typography.bodyBold, color: t.colors.onDark },
  marketDetails: { ...t.typography.caption, color: t.colors.onDarkMuted, marginTop: 2 },
  locationArea: { marginTop: t.spacing.xl, gap: t.spacing.sm },
  locationError: { ...t.typography.caption, color: t.colors.onDarkMuted, textAlign: 'center' },
  suggestion: { gap: t.spacing.md },
  suggestionLabel: { flexDirection: 'row', alignItems: 'flex-start', gap: t.spacing.sm, padding: t.spacing.md, borderRadius: t.borderRadius.xl, backgroundColor: t.colors.accentOverlay.light },
  suggestionText: { flex: 1, minWidth: 0, ...t.typography.body, color: t.colors.onDark },
  pressed: { opacity: 0.78, transform: [{ scale: 0.99 }] },
}));
