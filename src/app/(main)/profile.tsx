/**
 * ============================================
 * PROFILE
 * ============================================
 *
 * Guest card, quick stats, entry points to Settings and the partner
 * portal, and the legal / support links.
 *
 * There is no authentication in the demo, so the card renders the guest
 * state and offers the sign-in route. Preferences themselves live on the
 * Settings screen — this screen links to it rather than duplicating the
 * controls.
 *
 * TODO: Show the signed-in investor once authentication exists
 */

import { useEffect, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { AppConfig } from '@/constants/config';
import { IconName } from '@/constants/icons';
import { TranslationKey } from '@/constants/translations';
import { AppIcon, Button, IconButton } from '@/components/ui';
import { useFavorites } from '@/context/FavoritesContext';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useNotifications } from '@/context/NotificationsContext';
import { makeStyles, useTheme } from '@/context/ThemeContext';
import { goToParent } from '@/lib/navigation';
import { getAvatarUrl } from '@/lib/profile';

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
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const { count: favoriteCount } = useFavorites();
  const { unreadCount } = useNotifications();
  const { isAuthenticated, isPartner, profile, signOut, user } = useAuth();

  // Legal and support pages are outside the demo's scope; say so
  // explicitly rather than leaving a row that does nothing.
  const openInfoRow = (labelKey: TranslationKey) => {
    Alert.alert(t(labelKey), t('featureComingSoon'));
  };

  // Signed avatar URL. The avatars bucket is private, so the profile row
  // stores a path and the URL is minted per session.
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void getAvatarUrl(profile?.avatarPath ?? null).then((url) => {
      if (active) setAvatarUrl(url);
    });
    return () => {
      active = false;
    };
  }, [profile?.avatarPath]);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) Alert.alert(t('error'), t('authRequestFailed'));
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeIn} style={styles.header}>
          <IconButton icon="back" onPress={() => goToParent('/(main)/home')} accessibilityLabel={t('back')} variant="surface" size={44} />
          <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
            {t('profileTitle')}
          </Text>
          <Pressable
            onPress={() => router.push('/(main)/settings')}
            accessibilityRole="button"
            accessibilityLabel={t('settings')}
            style={({ pressed }) => [styles.gearButton, pressed && styles.pressed]}
          >
            <AppIcon name="settings" size="md" color={colors.text} />
          </Pressable>
        </Animated.View>

        {/* ---------------------------------------- */}
        {/* Identity card — signed-in state uses only public profile/Auth data. */}
        {/* ---------------------------------------- */}
        <Animated.View entering={FadeInDown.delay(60)} style={styles.card}>
          <View style={styles.userRow}>
            <View style={styles.avatar}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.avatarImage} resizeMode="cover" />
              ) : (
                <AppIcon name="profile" size="lg" color={colors.accent} />
              )}
            </View>
            <View style={styles.userText}>
              <Text style={styles.userName} numberOfLines={1} ellipsizeMode="tail">
                {isAuthenticated ? profile?.fullName || user?.email || t('profileTitle') : t('guestUser')}
              </Text>
              <Text style={styles.userSub} numberOfLines={2} ellipsizeMode="tail">
                {isAuthenticated ? user?.email : t('guestUserSubtitle')}
              </Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue} numberOfLines={1}>
                {favoriteCount}
              </Text>
              <Text style={styles.statLabel} numberOfLines={2} ellipsizeMode="tail">
                {t('savedProperties')}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue} numberOfLines={1}>
                {unreadCount}
              </Text>
              <Text style={styles.statLabel} numberOfLines={2} ellipsizeMode="tail">
                {t('notifications')}
              </Text>
            </View>
          </View>

          {isAuthenticated ? (
            <>
              <Button
                title={t('editProfile')}
                onPress={() => router.push('/(main)/edit-profile')}
                variant="secondary"
                size="md"
                icon="profile"
                style={styles.signInButton}
              />
              <Button title={t('logout')} onPress={handleSignOut} variant="outline" size="md" style={styles.signInButton} />
            </>
          ) : (
            <>
              <Text style={styles.prompt} numberOfLines={3}>{t('signInPrompt')}</Text>
              <Button title={t('login')} onPress={() => router.push('/(auth)/investor-login')} variant="primary" size="md" iconRight="arrowForward" style={styles.signInButton} />
            </>
          )}
        </Animated.View>

        {/* ---------------------------------------- */}
        {/* FAVORITES & SETTINGS */}
        {/* ---------------------------------------- */}
        <Animated.View entering={FadeInDown.delay(120)} style={styles.section}>
          <Text style={styles.sectionLabel} numberOfLines={1}>
            {t('preferences')}
          </Text>
          <Pressable
            onPress={() => router.push('/(main)/favorites')}
            accessibilityRole="button"
            accessibilityLabel={t('favorites')}
            style={({ pressed }) => [styles.linkCard, styles.favoritesCard, pressed && styles.pressed]}
          >
            <View style={styles.linkIcon}>
              <AppIcon name="favorite" size="md" color={colors.accent} />
            </View>
            <View style={styles.linkText}>
              <Text style={styles.linkTitle} numberOfLines={1} ellipsizeMode="tail">
                {t('favorites')}
              </Text>
              <Text style={styles.linkSub} numberOfLines={1} ellipsizeMode="tail">
                {t('savedProperties')}
              </Text>
            </View>
            <Text style={styles.favoriteCount} numberOfLines={1}>
              {favoriteCount}
            </Text>
            <AppIcon name="arrowForward" size="sm" color={colors.textMuted} />
          </Pressable>
          <Pressable
            onPress={() => router.push('/(main)/settings')}
            accessibilityRole="button"
            style={({ pressed }) => [styles.linkCard, pressed && styles.pressed]}
          >
            <View style={styles.linkIcon}>
              <AppIcon name="settings" size="md" color={colors.accent} />
            </View>
            <View style={styles.linkText}>
              <Text style={styles.linkTitle} numberOfLines={1} ellipsizeMode="tail">
                {t('settings')}
              </Text>
              <Text style={styles.linkSub} numberOfLines={2} ellipsizeMode="tail">
                {t('language')} · {t('currency')} · {t('appearance')}
              </Text>
            </View>
            <AppIcon name="arrowForward" size="sm" color={colors.textMuted} />
          </Pressable>
        </Animated.View>

        {/* ---------------------------------------- */}
        {/* PARTNER PORTAL */}
        {/* ---------------------------------------- */}
        {isPartner && (
          <Animated.View entering={FadeInDown.delay(180)} style={styles.section}>
            <Text style={styles.sectionLabel} numberOfLines={1}>{t('forPartners')}</Text>
            <Pressable
              onPress={() => router.push('/(partner)/dashboard')}
              accessibilityRole="button"
              style={({ pressed }) => [styles.partnerCard, pressed && styles.pressed]}
            >
              <View style={styles.partnerIcon}><AppIcon name="building" size="md" color={colors.accent} /></View>
              <View style={styles.linkText}>
                <Text style={styles.partnerTitle} numberOfLines={1} ellipsizeMode="tail">{t('partnerPortalAccess')}</Text>
                <Text style={styles.partnerSub} numberOfLines={2} ellipsizeMode="tail">{t('partnerPortalDescription')}</Text>
              </View>
              <AppIcon name="arrowForward" size="sm" color={colors.onDarkMuted} />
            </Pressable>
          </Animated.View>
        )}

        {/* ---------------------------------------- */}
        {/* ABOUT */}
        {/* ---------------------------------------- */}
        <Animated.View entering={FadeInDown.delay(240)} style={styles.section}>
          <Text style={styles.sectionLabel} numberOfLines={1}>
            {t('aboutSection')}
          </Text>
          <View style={styles.group}>
            {ABOUT_ROWS.map((row, index) => (
              <Pressable
                key={row.labelKey}
                onPress={() => openInfoRow(row.labelKey)}
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.row,
                  index > 0 && styles.rowDivider,
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.rowIcon}>
                  <AppIcon name={row.icon} size="md" color={colors.textSecondary} />
                </View>
                <Text style={styles.rowLabel} numberOfLines={1} ellipsizeMode="tail">
                  {t(row.labelKey)}
                </Text>
                <AppIcon name="arrowForward" size="sm" color={colors.textMuted} />
              </Pressable>
            ))}
          </View>
        </Animated.View>

        <Text style={styles.version} numberOfLines={1}>
          {t('appVersion')} {AppConfig.version}
        </Text>
      </ScrollView>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  container: {
    flex: 1,
    backgroundColor: t.colors.background,
  },
  content: {
    paddingBottom: t.spacing.section,
  },
  pressed: {
    opacity: 0.75,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing.smd,
    paddingHorizontal: t.spacing.screenHorizontal,
    paddingBottom: t.spacing.md,
  },
  title: {
    flexShrink: 1,
    minWidth: 0,
    ...t.typography.h2,
    color: t.colors.text,
  },
  gearButton: {
    width: t.metrics.minTouch,
    height: t.metrics.minTouch,
    borderRadius: t.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
    flexShrink: 0,
  },

  // ---- Guest card ----
  card: {
    marginHorizontal: t.spacing.screenHorizontal,
    padding: t.spacing.md,
    borderRadius: t.borderRadius.xxl,
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
    ...t.shadows.card,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.smd,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: t.borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: t.colors.accentOverlay.light,
    flexShrink: 0,
    overflow: 'hidden',
  },
  avatarImage: { width: '100%', height: '100%' },
  userText: {
    flex: 1,
    minWidth: 0,
  },
  userName: {
    ...t.typography.h4,
    color: t.colors.text,
  },
  userSub: {
    ...t.typography.caption,
    color: t.colors.textSecondary,
    marginTop: 1,
  },

  statsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginTop: t.spacing.md,
    paddingVertical: t.spacing.smd,
    borderRadius: t.borderRadius.lg,
    backgroundColor: t.colors.surfaceAlt,
  },
  stat: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    paddingHorizontal: t.spacing.sm,
  },
  statValue: {
    ...t.typography.h3,
    color: t.colors.text,
  },
  statLabel: {
    ...t.typography.tiny,
    color: t.colors.textSecondary,
    textAlign: 'center',
    marginTop: 1,
  },
  statDivider: {
    width: 1,
    backgroundColor: t.colors.border,
  },

  prompt: {
    ...t.typography.caption,
    color: t.colors.textSecondary,
    marginTop: t.spacing.smd,
  },
  signInButton: {
    marginTop: t.spacing.smd,
  },

  // ---- Sections ----
  section: {
    marginTop: t.spacing.xl,
  },
  sectionLabel: {
    ...t.typography.label,
    color: t.colors.textSecondary,
    paddingHorizontal: t.spacing.screenHorizontal,
    marginBottom: t.spacing.sm,
  },
  group: {
    marginHorizontal: t.spacing.screenHorizontal,
    borderRadius: t.borderRadius.xl,
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
    overflow: 'hidden',
  },

  linkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.smd,
    marginHorizontal: t.spacing.screenHorizontal,
    padding: t.spacing.md,
    borderRadius: t.borderRadius.xl,
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  favoritesCard: {
    marginBottom: t.spacing.sm,
  },
  linkIcon: {
    width: 40,
    height: 40,
    borderRadius: t.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: t.colors.surfaceAlt,
    flexShrink: 0,
  },
  linkText: {
    flex: 1,
    minWidth: 0,
  },
  linkTitle: {
    ...t.typography.bodyBold,
    color: t.colors.text,
  },
  linkSub: {
    ...t.typography.caption,
    color: t.colors.textSecondary,
    marginTop: 1,
  },
  favoriteCount: {
    flexShrink: 0,
    ...t.typography.bodyBold,
    color: t.colors.accent,
  },

  partnerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.smd,
    marginHorizontal: t.spacing.screenHorizontal,
    padding: t.spacing.md,
    borderRadius: t.borderRadius.xl,
    backgroundColor: t.colors.primary,
  },
  partnerIcon: {
    width: 40,
    height: 40,
    borderRadius: t.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: t.colors.accentOverlay.medium,
    flexShrink: 0,
  },
  partnerTitle: {
    ...t.typography.bodyBold,
    color: t.colors.onPrimary,
  },
  partnerSub: {
    ...t.typography.caption,
    color: t.colors.onDarkMuted,
    marginTop: 1,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.smd,
    minHeight: 56,
    paddingHorizontal: t.spacing.cardPadding,
  },
  rowDivider: {
    borderTopWidth: 1,
    borderTopColor: t.colors.border,
  },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: t.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: t.colors.surfaceAlt,
    flexShrink: 0,
  },
  rowLabel: {
    flex: 1,
    minWidth: 0,
    ...t.typography.body,
    color: t.colors.text,
  },

  version: {
    ...t.typography.caption,
    color: t.colors.textMuted,
    textAlign: 'center',
    marginTop: t.spacing.xl,
  },
}));
