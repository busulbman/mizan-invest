/**
 * ============================================
 * SETTINGS
 * ============================================
 *
 * The three preferences that change how the whole app renders:
 * language, display currency and appearance.
 *
 * Each row opens the same bottom-sheet picker used elsewhere, and each
 * choice is persisted locally — appropriate for a demo, and the reason
 * none of this touches a backend.
 */

import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { AppConfig } from '@/constants/config';
import {
  AppearancePicker,
  CurrencyPicker,
  IconButton,
  LanguagePicker,
  MarketPicker,
  PromptSheet,
} from '@/components/ui';
import { AppIcon } from '@/components/ui/AppIcon';
import { useAuth } from '@/context/AuthContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useLanguage } from '@/context/LanguageContext';
import { useMarket } from '@/context/MarketContext';
import { makeStyles, useTheme } from '@/context/ThemeContext';
import { goToParent } from '@/lib/navigation';
import { deleteOwnAccount, resetOnboardingFlag } from '@/lib/profile';

/** Literal the user must type to unlock permanent deletion. Never translated:
 *  a fixed token keeps the confirmation unambiguous in every language. */
const DELETE_CONFIRMATION = 'DELETE';

export default function SettingsScreen() {
  const styles = useStyles();
  const { t } = useLanguage();
  const { colors } = useTheme();
  const { rate } = useCurrency();
  const { isAdmin, isAuthenticated, isPartner, profile, user, refresh, signOut } = useAuth();
  const { resetMarketChoice } = useMarket();
  const insets = useSafeAreaInsets();

  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [working, setWorking] = useState(false);

  /**
   * Replays onboarding. Clears the local market choice and the server-side
   * `onboarding_completed_at` marker, then sends the app back to the start of
   * the flow. Nothing is deleted: account, favourites, roles and partner
   * membership all survive, which is why this is safe to leave in a build.
   */
  const restartOnboarding = useCallback(() => {
    Alert.alert(t('restartOnboarding'), t('restartOnboardingConfirm'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('restartOnboarding'),
        onPress: async () => {
          setWorking(true);
          try {
            await resetMarketChoice();
            if (user) await resetOnboardingFlag(user.id);
            router.replace('/(auth)/onboarding');
          } catch (error) {
            Alert.alert(t('error'), error instanceof Error ? error.message : t('pleaseTryAgain'));
          } finally {
            setWorking(false);
          }
        },
      },
    ]);
  }, [resetMarketChoice, t, user]);

  /**
   * Soft restart.
   *
   * There is no real process restart here and deliberately no native hack:
   * expo-updates is not part of this project, and forcing a process kill is
   * not something that belongs in a shipped build. What this does instead is
   * what a restart is actually wanted for — it refetches the session from
   * Supabase and resets navigation to the app's first route, so the whole
   * start-up path (splash -> auth check -> landing) runs again against fresh
   * state. Nothing is signed out and nothing is deleted.
   */
  const restartApp = useCallback(() => {
    Alert.alert(t('restartApp'), t('restartAppConfirm'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('restartApp'),
        onPress: async () => {
          setWorking(true);
          try {
            await refresh();
            router.replace('/(auth)/splash');
          } finally {
            setWorking(false);
          }
        },
      },
    ]);
  }, [refresh, t]);

  /** First of two confirmations. The second is the typed-word sheet below. */
  const askDelete = useCallback(() => {
    Alert.alert(t('deleteAccountStep1Title'), t('deleteAccountStep1Body'), [
      { text: t('cancel'), style: 'cancel' },
      { text: t('deleteAccount'), style: 'destructive', onPress: () => setConfirmingDelete(true) },
    ]);
  }, [t]);

  const performDelete = useCallback(async () => {
    if (!user) return;
    setDeleting(true);
    try {
      await deleteOwnAccount({ userId: user.id, avatarPath: profile?.avatarPath ?? null });

      // Local cleanup mirrors the server state: the account is gone, so the
      // stored onboarding/market choice should not survive it either.
      await resetMarketChoice();
      await signOut();

      setConfirmingDelete(false);
      Alert.alert(t('accountDeleted'), t('accountDeletedBody'));
      router.replace('/(auth)/welcome');
    } catch (error) {
      setConfirmingDelete(false);
      // The RPC refuses sole-owner and last-super-admin deletions by design,
      // and its message says which; show it rather than a generic failure.
      Alert.alert(
        t('couldNotDeleteAccount'),
        error instanceof Error ? error.message : t('pleaseTryAgain')
      );
    } finally {
      setDeleting(false);
    }
  }, [profile?.avatarPath, resetMarketChoice, signOut, t, user]);

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeIn} style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <IconButton
          icon="back"
          onPress={() => goToParent('/(main)/profile')}
          accessibilityLabel={t('back')}
          variant="surface"
          size={40}
        />
        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
          {t('settings')}
        </Text>
        <View style={styles.spacer} />
      </Animated.View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(60)} style={styles.section}>
          <Text style={styles.sectionLabel} numberOfLines={1}>
            {t('preferences')}
          </Text>
          <View style={styles.group}>
            <LanguagePicker variant="row" />
            <View style={styles.divider} />
            <CurrencyPicker variant="row" />
            <View style={styles.divider} />
            <MarketPicker variant="row" />
            <View style={styles.divider} />
            <AppearancePicker variant="row" />
          </View>

          {/* Demo-rate disclaimer, stated plainly next to the setting */}
          <Text style={styles.note} numberOfLines={3}>
            {t('demoExchangeRate')}: {rate}. {t('demoRateNote')}
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(120)} style={styles.section}>
          {isAuthenticated && (
            <>
              <Text style={styles.sectionLabel} numberOfLines={1}>{t('profileTitle')}</Text>
              <View style={styles.group}>
                {isPartner && (
                  <Pressable onPress={() => router.push('/(partner)/dashboard')} accessibilityRole="button" style={({ pressed }) => [styles.managementRow, pressed && styles.pressed]}>
                    <View style={styles.managementIcon}><AppIcon name="building" size="md" color={colors.accent} /></View>
                    <Text style={styles.managementLabel}>{t('partnerPortalAccess')}</Text>
                    <AppIcon name="arrowForward" size="sm" color={colors.textMuted} />
                  </Pressable>
                )}
                {!isPartner && (
                  <Pressable onPress={() => router.push('/(main)/partner-application')} accessibilityRole="button" style={({ pressed }) => [styles.managementRow, pressed && styles.pressed]}>
                    <View style={styles.managementIcon}><AppIcon name="building" size="md" color={colors.accent} /></View>
                    <Text style={styles.managementLabel}>{t('becomePartner')}</Text>
                    <AppIcon name="arrowForward" size="sm" color={colors.textMuted} />
                  </Pressable>
                )}
                {(isPartner || !isPartner) && isAdmin && <View style={styles.divider} />}
                {isAdmin && (
                  <Pressable onPress={() => router.push('/(admin)/dashboard')} accessibilityRole="button" style={({ pressed }) => [styles.managementRow, pressed && styles.pressed]}>
                    <View style={styles.managementIcon}><AppIcon name="analytics" size="md" color={colors.accent} /></View>
                    <Text style={styles.managementLabel}>{t('mizanManagement')}</Text>
                    <AppIcon name="arrowForward" size="sm" color={colors.textMuted} />
                  </Pressable>
                )}
              </View>
            </>
          )}

          {isAuthenticated && (
            <>
              <Text style={styles.sectionLabel} numberOfLines={1}>{t('testingTools')}</Text>
              <View style={styles.group}>
                <Pressable
                  onPress={restartOnboarding}
                  disabled={working}
                  accessibilityRole="button"
                  style={({ pressed }) => [styles.managementRow, pressed && styles.pressed, working && styles.rowDisabled]}
                >
                  <View style={styles.managementIcon}><AppIcon name="replay" size="md" color={colors.accent} /></View>
                  <View style={styles.rowText}>
                    <Text style={styles.managementLabel}>{t('restartOnboarding')}</Text>
                    <Text style={styles.rowNote} numberOfLines={3}>{t('restartOnboardingNote')}</Text>
                  </View>
                </Pressable>
                <View style={styles.divider} />
                <Pressable
                  onPress={restartApp}
                  disabled={working}
                  accessibilityRole="button"
                  style={({ pressed }) => [styles.managementRow, pressed && styles.pressed, working && styles.rowDisabled]}
                >
                  <View style={styles.managementIcon}><AppIcon name="time" size="md" color={colors.accent} /></View>
                  <View style={styles.rowText}>
                    <Text style={styles.managementLabel}>{t('restartApp')}</Text>
                    <Text style={styles.rowNote} numberOfLines={3}>{t('restartAppNote')}</Text>
                  </View>
                </Pressable>
              </View>

              <Text style={[styles.sectionLabel, styles.dangerLabel]} numberOfLines={1}>{t('dangerZone')}</Text>
              <View style={[styles.group, styles.dangerGroup]}>
                <Pressable
                  onPress={askDelete}
                  disabled={deleting}
                  accessibilityRole="button"
                  style={({ pressed }) => [styles.managementRow, pressed && styles.pressed]}
                >
                  <View style={[styles.managementIcon, styles.dangerIcon]}>
                    {deleting ? <ActivityIndicator color={colors.error} /> : <AppIcon name="trash" size="md" color={colors.error} />}
                  </View>
                  <View style={styles.rowText}>
                    <Text style={[styles.managementLabel, styles.dangerText]}>{t('deleteAccount')}</Text>
                    <Text style={styles.rowNote} numberOfLines={4}>{t('deleteAccountBlockedNote')}</Text>
                  </View>
                </Pressable>
              </View>
            </>
          )}

          <Text style={styles.sectionLabel} numberOfLines={1}>
            {t('aboutSection')}
          </Text>
          <View style={styles.group}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel} numberOfLines={1}>
                {t('appName')}
              </Text>
              <Text style={styles.infoValue} numberOfLines={1}>
                {AppConfig.appName}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel} numberOfLines={1}>
                {t('appVersion')}
              </Text>
              <Text style={styles.infoValue} numberOfLines={1}>
                {AppConfig.version}
              </Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Second confirmation. `requiredValue` means an exact typed word
          unlocks it — a length check would accept any ten characters. */}
      <PromptSheet
        visible={confirmingDelete}
        title={t('deleteAccountStep2Title')}
        subtitle={t('deleteAccountStep2Body')}
        label={t('deleteAccountConfirmLabel')}
        placeholder={DELETE_CONFIRMATION}
        confirmTitle={t('deleteAccountFinal')}
        requiredValue={DELETE_CONFIRMATION}
        busy={deleting}
        onCancel={() => setConfirmingDelete(false)}
        onConfirm={() => void performDelete()}
      />
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  container: {
    flex: 1,
    backgroundColor: t.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.smd,
    paddingHorizontal: t.spacing.screenHorizontal,
    paddingBottom: t.spacing.md,
  },
  title: {
    flex: 1,
    minWidth: 0,
    ...t.typography.h3,
    color: t.colors.text,
    textAlign: 'center',
  },
  spacer: {
    width: 40,
  },
  content: {
    paddingBottom: t.spacing.section,
  },
  rowText: { flex: 1, minWidth: 0, gap: 2 },
  rowNote: { ...t.typography.tiny, color: t.colors.textMuted, lineHeight: 15 },
  rowDisabled: { opacity: 0.5 },
  dangerLabel: { color: t.colors.error },
  dangerGroup: { borderColor: t.colors.error },
  dangerIcon: { backgroundColor: 'transparent' },
  dangerText: { color: t.colors.error },
  section: {
    marginTop: t.spacing.md,
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
  divider: {
    height: 1,
    marginLeft: t.spacing.cardPadding + 36 + t.spacing.smd,
    backgroundColor: t.colors.border,
  },
  note: {
    ...t.typography.tiny,
    color: t.colors.textMuted,
    paddingHorizontal: t.spacing.screenHorizontal,
    paddingTop: t.spacing.smd,
  },
  pressed: {
    opacity: 0.72,
  },
  managementRow: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.smd,
    paddingHorizontal: t.spacing.cardPadding,
  },
  managementIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: t.borderRadius.md,
    backgroundColor: t.colors.surfaceAlt,
  },
  managementLabel: {
    flex: 1,
    minWidth: 0,
    ...t.typography.bodyBold,
    color: t.colors.text,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing.smd,
    minHeight: 52,
    paddingHorizontal: t.spacing.cardPadding,
  },
  infoLabel: {
    flexShrink: 1,
    minWidth: 0,
    ...t.typography.body,
    color: t.colors.text,
  },
  infoValue: {
    flexShrink: 0,
    ...t.typography.caption,
    color: t.colors.textSecondary,
  },
}));
