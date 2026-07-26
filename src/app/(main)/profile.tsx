/**
 * ============================================
 * PROFILE SCREEN
 * ============================================
 *
 * Sections: guest user card, preferences (language), partner portal
 * entry, about / legal links, app version.
 *
 * There is no authentication yet, so the user card renders the guest
 * state and offers the sign-in route.
 *
 * TODO: Show the real user once authentication exists
 * TODO: Add notification preferences
 */

import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { theme } from '@/theme';
import { AppConfig } from '@/constants/config';
import { AppIcon } from '@/components/ui/AppIcon';
import { IconName } from '@/constants/icons';
import { LanguageButton } from '@/components/ui/LanguageButton';
import { useLanguage } from '@/context/LanguageContext';
import { TranslationKey } from '@/constants/translations';

interface LinkRow {
  icon: IconName;
  labelKey: TranslationKey;
}

const ABOUT_ROWS: LinkRow[] = [
  { icon: 'info', labelKey: 'aboutApp' },
  { icon: 'help', labelKey: 'helpCenter' },
  { icon: 'email', labelKey: 'contactUs' },
  { icon: 'security', labelKey: 'privacyPolicy' },
  { icon: 'listings', labelKey: 'termsOfService' },
];

export default function ProfileScreen() {
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 12 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Mobile header */}
        <Animated.View entering={FadeIn} style={styles.header}>
          <Text style={styles.title}>{t('profileTitle')}</Text>
        </Animated.View>

        {/* ============================================ */}
        {/* USER CARD */}
        {/* ============================================ */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.card}>
          <View style={styles.userRow}>
            <View style={styles.avatar}>
              <AppIcon name="profile" size="lg" color={theme.colors.primary} />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{t('guestUser')}</Text>
              <Text style={styles.userSubtitle}>{t('guestUserSubtitle')}</Text>
            </View>
          </View>

          <Text style={styles.signInPrompt}>{t('signInPrompt')}</Text>

          <TouchableOpacity
            style={styles.signInButton}
            onPress={() => router.push('/(auth)/investor-login')}
            activeOpacity={0.9}
          >
            <Text style={styles.signInButtonText}>{t('login')}</Text>
            <AppIcon name="arrowForward" size="sm" color={theme.colors.white} />
          </TouchableOpacity>
        </Animated.View>

        {/* ============================================ */}
        {/* PREFERENCES */}
        {/* ============================================ */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.section}>
          <Text style={styles.sectionLabel}>{t('preferences')}</Text>
          <View style={styles.groupCard}>
            <LanguageButton variant="row" />
          </View>
        </Animated.View>

        {/* ============================================ */}
        {/* PARTNER PORTAL */}
        {/* ============================================ */}
        <Animated.View entering={FadeInDown.delay(300)} style={styles.section}>
          <Text style={styles.sectionLabel}>{t('forPartners')}</Text>
          <TouchableOpacity
            style={styles.partnerCard}
            onPress={() => router.push('/(auth)/partner-login')}
            activeOpacity={0.85}
          >
            <View style={styles.partnerIcon}>
              <AppIcon name="building" size="md" color={theme.colors.accent} />
            </View>
            <View style={styles.partnerText}>
              <Text style={styles.partnerTitle}>{t('partnerPortalAccess')}</Text>
              <Text style={styles.partnerSubtitle}>{t('partnerPortalDescription')}</Text>
            </View>
            <AppIcon name="arrowForward" size="sm" color={theme.colors.textMuted} />
          </TouchableOpacity>
        </Animated.View>

        {/* ============================================ */}
        {/* ABOUT */}
        {/* TODO: Open the real URLs from AppConfig.links */}
        {/* ============================================ */}
        <Animated.View entering={FadeInDown.delay(400)} style={styles.section}>
          <Text style={styles.sectionLabel}>{t('aboutSection')}</Text>
          <View style={styles.groupCard}>
            {ABOUT_ROWS.map((row, index) => (
              <TouchableOpacity
                key={row.labelKey}
                style={[styles.linkRow, index > 0 && styles.linkRowDivider]}
                activeOpacity={0.7}
              >
                <View style={styles.linkIcon}>
                  <AppIcon name={row.icon} size="md" color={theme.colors.primary} />
                </View>
                <Text style={styles.linkLabel}>{t(row.labelKey)}</Text>
                <AppIcon name="arrowForward" size="sm" color={theme.colors.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* App version */}
        <Text style={styles.version}>
          {t('appVersion')} {AppConfig.version}
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: theme.spacing.section,
  },
  header: {
    paddingHorizontal: theme.spacing.screenHorizontal,
    paddingBottom: theme.spacing.md,
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.textDark,
  },

  // User card
  card: {
    marginHorizontal: theme.spacing.screenHorizontal,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xxl,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.card,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.smd,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    ...theme.typography.h4,
    color: theme.colors.textDark,
  },
  userSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.textLight,
    marginTop: 2,
  },
  signInPrompt: {
    ...theme.typography.small,
    color: theme.colors.textLight,
    marginTop: theme.spacing.md,
  },
  signInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    borderRadius: theme.borderRadius.lg,
    marginTop: theme.spacing.md,
  },
  signInButtonText: {
    ...theme.typography.small,
    fontWeight: '600',
    color: theme.colors.white,
  },

  // Sections
  section: {
    marginTop: theme.spacing.xl,
  },
  sectionLabel: {
    ...theme.typography.label,
    color: theme.colors.textLight,
    paddingHorizontal: theme.spacing.screenHorizontal,
    marginBottom: theme.spacing.sm,
  },
  groupCard: {
    marginHorizontal: theme.spacing.screenHorizontal,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },

  // Partner portal
  partnerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.smd,
    marginHorizontal: theme.spacing.screenHorizontal,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
  },
  partnerIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.accentOverlay.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  partnerText: {
    flex: 1,
  },
  partnerTitle: {
    ...theme.typography.bodyBold,
    color: theme.colors.white,
  },
  partnerSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.textOnDarkMuted,
    marginTop: 2,
  },

  // Link rows
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.smd,
    paddingVertical: 14,
    paddingHorizontal: theme.spacing.cardPadding,
  },
  linkRowDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border,
  },
  linkIcon: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkLabel: {
    flex: 1,
    ...theme.typography.body,
    color: theme.colors.textDark,
  },

  version: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: theme.spacing.xl,
  },
});
