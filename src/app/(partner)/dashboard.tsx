/**
 * ============================================
 * PARTNER DASHBOARD PLACEHOLDER
 * ============================================
 *
 * Placeholder screen for partner dashboard.
 * Shows demo stats and navigation.
 *
 * Route: /(partner)/dashboard
 *
 * TODO: Replace the demo stats with real partner analytics
 * TODO: Build full partner dashboard
 * TODO: Add listing management
 * TODO: Add analytics
 */

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';

import { theme } from '@/theme';
import { useLanguage } from '@/context/LanguageContext';

export default function PartnerDashboardScreen() {
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={theme.gradients.partnerGradient}
        locations={[0, 0.4, 1]}
        style={styles.gradient}
      >
        <View style={[styles.content, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 32 }]}>
          <Animated.View entering={FadeIn.delay(200)} style={styles.header}>
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedIcon}>✓</Text>
              <Text style={styles.verifiedText}>{t('verifiedPartnerDemo')}</Text>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400).duration(800)} style={styles.heroSection}>
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={theme.gradients.gold}
                style={styles.avatarGradient}
              >
                <Text style={styles.avatarText}>P</Text>
              </LinearGradient>
            </View>
            <Text style={styles.title}>{t('partnerDashboard')}</Text>
            <Text style={styles.subtitle}>{t('partnerDashboardSubtitle')}</Text>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(600).duration(800)} style={styles.statsSection}>
            <View style={styles.statsRow}>
              <BlurView intensity={20} tint="dark" style={styles.statCard}>
                <Text style={styles.statValue}>24</Text>
                <Text style={styles.statLabel}>{t('activeListings')}</Text>
              </BlurView>
              <BlurView intensity={20} tint="dark" style={styles.statCard}>
                <Text style={styles.statValue}>1.2K</Text>
                <Text style={styles.statLabel}>{t('totalViews')}</Text>
              </BlurView>
            </View>
            <View style={styles.statsRow}>
              <BlurView intensity={20} tint="dark" style={styles.statCard}>
                <Text style={styles.statValue}>89</Text>
                <Text style={styles.statLabel}>{t('inquiries')}</Text>
              </BlurView>
              <BlurView intensity={20} tint="dark" style={styles.statCard}>
                <Text style={[styles.statValue, styles.goldText]}>$2.4M</Text>
                <Text style={styles.statLabel}>{t('totalValue')}</Text>
              </BlurView>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(800).duration(800)} style={styles.footer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => {}}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={theme.gradients.gold}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.primaryButtonGradient}
              >
                <Text style={styles.primaryButtonText}>{t('addNewListing')}</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.replace('/(auth)/welcome')}
            >
              <Text style={styles.backButtonText}>{t('backToWelcome')}</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.screenHorizontal,
  },
  header: {
    alignItems: 'center',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.successOverlay.light,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.successOverlay.medium,
  },
  verifiedIcon: {
    fontSize: 14,
    color: theme.colors.success,
    marginRight: 8,
    fontWeight: '700',
  },
  verifiedText: {
    ...theme.typography.small,
    fontWeight: '600',
    color: theme.colors.success,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  avatarContainer: {
    marginBottom: theme.spacing.xl,
    ...theme.shadows.gold,
  },
  avatarGradient: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.hero,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.white,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textOnDarkMuted,
  },
  statsSection: {
    flex: 1,
    gap: theme.spacing.smd,
  },
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing.smd,
  },
  statCard: {
    flex: 1,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.xxl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.overlay.light,
    alignItems: 'center',
  },
  statValue: {
    ...theme.typography.h1,
    color: theme.colors.white,
    marginBottom: 4,
  },
  goldText: {
    color: theme.colors.accent,
  },
  statLabel: {
    ...theme.typography.caption,
    color: theme.colors.textOnDarkMuted,
  },
  footer: {
    gap: theme.spacing.smd,
  },
  primaryButton: {
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    ...theme.shadows.gold,
  },
  primaryButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  primaryButtonText: {
    ...theme.typography.button,
    color: theme.colors.primary,
  },
  backButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  backButtonText: {
    ...theme.typography.body,
    fontWeight: '500',
    color: theme.colors.textOnDarkMuted,
  },
});
