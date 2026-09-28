/**
 * ============================================
 * EMAIL CONFIRMATION LANDING
 * ============================================
 *
 * Where `mizaninvest://auth-complete` lands after a confirmation link is
 * tapped. The link itself is consumed in AuthContext, which exchanges the code
 * and records the outcome; this screen only reports it.
 *
 * WHY THIS IS NOT JUST A SPINNER
 * It used to render an ActivityIndicator while `isLoading` and, once loading
 * finished without a session, an EMPTY dark view — no message, no way out. An
 * expired or already-used link therefore stranded the user on a blank screen
 * with no indication anything had gone wrong. A confirmation link can fail for
 * entirely ordinary reasons (it expired, it was already used, the tab was
 * reopened), so the failure path needs to be a real state.
 *
 * THREE STATES, NO DEAD END
 *   authenticated      -> the existing role-aware landing, unchanged
 *   still exchanging   -> spinner
 *   link did not work  -> localised explanation + a route back to sign in
 */

import { ActivityIndicator, Text, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon, Button } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { makeStyles, useTheme } from '@/context/ThemeContext';
import { useLandingRoute } from '@/lib/navigation';

export default function AuthCompleteScreen() {
  const { isAuthenticated, isLoading, authLinkStatus } = useAuth();
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const landing = useLandingRoute();

  // Confirmed: hand straight over to the role-aware landing logic. An admin or
  // partner who confirms their email still lands in their own workspace.
  if (isAuthenticated) return <Redirect href={landing} />;

  const failed = authLinkStatus === 'failed';
  const working = !failed && (isLoading || authLinkStatus === 'processing');

  if (working) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  // Either the exchange failed, or this route was opened without a usable link.
  // Both are the same thing from here: there is no session and no way forward
  // except asking for a new link.
  return (
    <View style={[styles.container, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
      <View style={styles.card}>
        <AppIcon name="email" size="lg" color={colors.warning} />
        <Text style={styles.title}>{t('confirmationFailed')}</Text>
        <Text style={styles.body}>{t('confirmationFailedBody')}</Text>
        <Button
          title={t('backToSignIn')}
          variant="gold"
          size="lg"
          onPress={() => router.replace('/(auth)/investor-login')}
          style={styles.button}
        />
      </View>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: t.spacing.screenHorizontal,
    backgroundColor: t.colors.backgroundDark,
  },
  card: {
    width: '100%',
    alignItems: 'center',
    gap: 10,
    padding: t.spacing.lg,
    borderRadius: t.borderRadius.xl,
    borderWidth: 1,
    borderColor: t.colors.border,
    backgroundColor: t.colors.surface,
  },
  title: { ...t.typography.h3, color: t.colors.text, textAlign: 'center' },
  body: { ...t.typography.caption, color: t.colors.textSecondary, textAlign: 'center', lineHeight: 19 },
  button: { marginTop: t.spacing.sm, alignSelf: 'stretch' },
}));
