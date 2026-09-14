/**
 * ============================================
 * PARTNER DASHBOARD
 * ============================================
 *
 * The partner-side landing screen: verification marker, portfolio stats
 * and the entry point for publishing a listing.
 *
 * DEMO SCOPE — the figures are illustrative and "Add listing" confirms
 * with an explanatory alert rather than opening an editor. Listing
 * management and analytics belong to a later phase.
 *
 * Total portfolio value is rendered through the shared currency
 * formatter, so switching to TRY or RUB updates this screen too.
 *
 * TODO: Real partner analytics, listing management, lead inbox
 */

import { Alert, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';

import { Badge, Button } from '@/components/ui';
import { TranslationKey } from '@/constants/translations';
import { useCurrency } from '@/context/CurrencyContext';
import { useLanguage } from '@/context/LanguageContext';
import { makeStyles, useTheme } from '@/context/ThemeContext';

/** Illustrative portfolio value in USD, converted at render time */
const PORTFOLIO_VALUE_USD = 2_400_000;

export default function PartnerDashboardScreen() {
  const styles = useStyles();
  const { gradients } = useTheme();
  const { t } = useLanguage();
  const { price } = useCurrency();
  const insets = useSafeAreaInsets();

  const stats: { labelKey: TranslationKey; value: string; gold?: boolean }[] = [
    { labelKey: 'activeListings', value: '24' },
    { labelKey: 'totalViews', value: '1.2K' },
    { labelKey: 'inquiries', value: '89' },
    { labelKey: 'totalValue', value: price(PORTFOLIO_VALUE_USD), gold: true },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient colors={gradients.partnerGradient} locations={[0, 0.45, 1]} style={styles.fill}>
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 28 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeIn.delay(120)} style={styles.badgeRow}>
            <Badge label={t('verifiedPartnerDemo')} tone="success" icon="verified" />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(240).duration(600)} style={styles.hero}>
            <LinearGradient colors={gradients.gold} style={styles.avatar}>
              <Text style={styles.avatarText}>P</Text>
            </LinearGradient>
            <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
              {t('partnerDashboard')}
            </Text>
            <Text style={styles.subtitle} numberOfLines={3} ellipsizeMode="tail">
              {t('partnerDashboardSubtitle')}
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(380).duration(600)} style={styles.grid}>
            {stats.map((stat) => (
              <BlurView key={stat.labelKey} intensity={22} tint="dark" style={styles.statCard}>
                <Text
                  style={[styles.statValue, stat.gold && styles.statValueGold]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.65}
                >
                  {stat.value}
                </Text>
                <Text style={styles.statLabel} numberOfLines={2} ellipsizeMode="tail">
                  {t(stat.labelKey)}
                </Text>
              </BlurView>
            ))}
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(520).duration(600)} style={styles.footer}>
            <Button
              title={t('addNewListing')}
              onPress={() => Alert.alert(t('addNewListing'), t('featureComingSoon'))}
              variant="gold"
              size="lg"
              icon="listings"
            />
            <Button
              title={t('backToWelcome')}
              onPress={() => router.replace('/(auth)/welcome')}
              variant="glass"
              size="lg"
            />
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  container: {
    flex: 1,
    backgroundColor: t.colors.backgroundDark,
  },
  fill: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: t.spacing.screenHorizontal,
  },
  badgeRow: {
    alignItems: 'center',
  },
  hero: {
    alignItems: 'center',
    paddingVertical: t.spacing.section,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: t.borderRadius.hero,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: t.spacing.lg,
    ...t.shadows.gold,
  },
  avatarText: {
    ...t.typography.hero,
    fontSize: 32,
    lineHeight: 40,
    color: t.colors.onAccent,
  },
  title: {
    ...t.typography.h1,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subtitle: {
    ...t.typography.small,
    color: 'rgba(255, 255, 255, 0.72)',
    textAlign: 'center',
    marginTop: t.spacing.xs,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: t.spacing.smd,
  },
  statCard: {
    // Two per row on every width, with the gutter accounted for
    width: (t.metrics.screenWidth - t.spacing.screenHorizontal * 2 - t.spacing.smd) / 2,
    minHeight: 104,
    padding: t.spacing.md,
    borderRadius: t.borderRadius.xxl,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
  },
  statValue: {
    ...t.typography.h1,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  statValueGold: {
    color: t.colors.accent,
  },
  statLabel: {
    ...t.typography.caption,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginTop: 4,
  },

  footer: {
    gap: t.spacing.smd,
    marginTop: t.spacing.section,
  },
}));
