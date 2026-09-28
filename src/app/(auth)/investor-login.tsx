/**
 * ============================================
 * INVESTOR LOGIN
 * ============================================
 *
 * Email + password form with social sign-in shortcuts.
 *
 * CONFIRMATION IS A STATE, NOT AN ALERT
 * Signing up used to end at a dismissible Alert saying "check your email". That
 * over-claimed: `needsEmailConfirmation` only means Supabase returned no
 * session, i.e. that confirmation is REQUIRED — it is not evidence that any
 * email was delivered, and the user was left with no way to recover a message
 * that never arrived. Signup now lands on a pending panel that says what was
 * actually requested and offers a new link.
 *
 * KEYBOARD HANDLING
 * The form lives inside a KeyboardAvoidingView + ScrollView with
 * `keyboardShouldPersistTaps="handled"`. Without both, the password
 * field disappears behind the keyboard on a small iPhone and the first
 * tap on the submit button only dismisses the keyboard instead of
 * pressing it.
 *
 */

import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';

import { AppIcon, Button, IconButton, LogoMark } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { makeStyles, useTheme } from '@/context/ThemeContext';
import { goBackOrHome, landingRouteForRole } from '@/lib/navigation';

/** Matches the server-side throttle closely enough to keep the UI honest. */
const RESEND_COOLDOWN_SECONDS = 60;

export default function InvestorLoginScreen() {
  const styles = useStyles();
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();
  const { signIn, signUp, resendConfirmation } = useAuth();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [focused, setFocused] = useState<'name' | 'email' | 'password' | null>(null);
  const [submitting, setSubmitting] = useState(false);

  /**
   * Set once signup succeeds and confirmation is required. While it holds an
   * address the form is replaced by the pending panel, so the user cannot
   * silently lose the fact that an unconfirmed account now exists.
   */
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Confirmation sends are throttled server-side. The countdown makes that
  // visible instead of letting the user hammer a button into a 429.
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((value) => (value <= 1 ? 0 : value - 1)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleLogin = async () => {
    if (!email.trim() || !password) return;
    setSubmitting(true);
    const result = isSignUp
      ? await signUp({ email, password, fullName })
      : await signIn(email, password);
    setSubmitting(false);

    if (result.error) {
      // Supabase returns user-safe Auth errors (for example invalid
      // credentials). Avoid logging addresses or passwords on the client.
      Alert.alert(t('error'), result.error.message || t('authRequestFailed'));
      return;
    }

    if ('needsEmailConfirmation' in result && result.needsEmailConfirmation) {
      // A pending state, not an alert: the account exists but is unusable until
      // confirmed, and the user needs a way back to that fact.
      setPendingEmail(email.trim());
      setCooldown(RESEND_COOLDOWN_SECONDS);
      setPassword('');
      return;
    }

    // Landing follows the role the server just granted, not this screen.
    // `result.identity` is used rather than the context values, which are
    // still the pre-sign-in ones during this handler.
    router.replace(landingRouteForRole(result.identity));
  };

  const handleResend = useCallback(async () => {
    if (!pendingEmail || resending || cooldown > 0) return;
    setResending(true);
    const { error, rateLimited } = await resendConfirmation(pendingEmail);
    setResending(false);
    // Throttled or accepted, the next attempt waits either way.
    setCooldown(RESEND_COOLDOWN_SECONDS);
    if (rateLimited) {
      Alert.alert(t('couldNotResend'), `${t('resendAvailableIn')} ${RESEND_COOLDOWN_SECONDS}s`);
      return;
    }
    if (error) {
      Alert.alert(t('couldNotResend'), error.message || t('pleaseTryAgain'));
      return;
    }
    Alert.alert(t('confirmationResent'), t('confirmationDeliveryNote'));
  }, [cooldown, pendingEmail, resendConfirmation, resending, t]);

  const leavePending = useCallback(() => {
    setPendingEmail(null);
    setCooldown(0);
    setIsSignUp(false);
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={
          isDark
            ? [colors.backgroundDark, colors.background, colors.background]
            : ['#0F172A', '#1E293B', colors.background]
        }
        locations={[0, 0.35, 1]}
        style={styles.fill}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.fill}
        >
          <ScrollView
            contentContainerStyle={[
              styles.content,
              { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 28 },
            ]}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            showsVerticalScrollIndicator={false}
          >
            <Animated.View entering={FadeIn.delay(80)} style={styles.backRow}>
              <IconButton
                icon="back"
                onPress={goBackOrHome}
                accessibilityLabel={t('back')}
                variant="glass"
                size={44}
              />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(160).duration(500)} style={styles.header}>
              <LogoMark size="medium" />
              <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
                {t('welcomeBack')}
              </Text>
              <Text style={styles.subtitle} numberOfLines={3} ellipsizeMode="tail">
                {pendingEmail ? t('confirmYourEmail') : isSignUp ? t('createAccount') : t('signInSubtitle')}
              </Text>
            </Animated.View>

            {pendingEmail ? (
              <Animated.View entering={FadeInUp.delay(200).duration(500)} style={styles.form}>
                <View style={styles.pendingCard}>
                  <AppIcon name="email" size="lg" color={colors.accent} />
                  <Text style={styles.pendingTitle}>{t('confirmYourEmail')}</Text>
                  <Text style={styles.pendingLabel}>{t('confirmationRequestedFor')}</Text>
                  <Text style={styles.pendingEmail} numberOfLines={2}>
                    {pendingEmail}
                  </Text>
                  {/* Deliberately does not promise delivery — nothing the client
                      can see proves the message left Supabase. */}
                  <Text style={styles.pendingNote}>{t('confirmationDeliveryNote')}</Text>
                </View>

                <Button
                  title={
                    cooldown > 0
                      ? `${t('resendAvailableIn')} ${cooldown}s`
                      : t('resendConfirmation')
                  }
                  onPress={() => void handleResend()}
                  variant="gold"
                  size="lg"
                  loading={resending}
                  disabled={resending || cooldown > 0}
                  style={styles.submit}
                />

                <Pressable
                  onPress={leavePending}
                  accessibilityRole="button"
                  style={({ pressed }) => [styles.authSwitch, pressed && styles.pressed]}
                >
                  <Text style={styles.authSwitchText} numberOfLines={1}>
                    {t('backToSignIn')}
                  </Text>
                </Pressable>
              </Animated.View>
            ) : (
            <Animated.View entering={FadeInUp.delay(280).duration(500)} style={styles.form}>
              {isSignUp && (
                <View style={styles.field}>
                  <Text style={styles.label} numberOfLines={1}>{t('name')}</Text>
                  <View style={[styles.inputShell, focused === 'name' && styles.inputFocused]}>
                    <AppIcon name="profile" size="sm" color={colors.textMuted} />
                    <TextInput
                      style={styles.input}
                      value={fullName}
                      onChangeText={setFullName}
                      onFocus={() => setFocused('name')}
                      onBlur={() => setFocused(null)}
                      autoCapitalize="words"
                      returnKeyType="next"
                    />
                  </View>
                </View>
              )}
              {/* Email */}
              <View style={styles.field}>
                <Text style={styles.label} numberOfLines={1}>
                  {t('email')}
                </Text>
                <View style={[styles.inputShell, focused === 'email' && styles.inputFocused]}>
                  <AppIcon name="email" size="sm" color={colors.textMuted} />
                  <TextInput
                    style={styles.input}
                    placeholder="investor@example.com"
                    placeholderTextColor={colors.textMuted}
                    value={email}
                    onChangeText={setEmail}
                    onFocus={() => setFocused('email')}
                    onBlur={() => setFocused(null)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="next"
                  />
                </View>
              </View>

              {/* Password */}
              <View style={styles.field}>
                <View style={styles.labelRow}>
                  <Text style={styles.label} numberOfLines={1}>
                    {t('password')}
                  </Text>
                  <Pressable
                    onPress={() => router.push('/(auth)/forgot-password')}
                    hitSlop={8}
                    accessibilityRole="button"
                    style={({ pressed }) => (pressed ? styles.pressed : undefined)}
                  >
                    <Text style={styles.forgot} numberOfLines={1} ellipsizeMode="tail">
                      {t('forgotPassword')}
                    </Text>
                  </Pressable>
                </View>
                <View style={[styles.inputShell, focused === 'password' && styles.inputFocused]}>
                  <AppIcon name="security" size="sm" color={colors.textMuted} />
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor={colors.textMuted}
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => setFocused('password')}
                    onBlur={() => setFocused(null)}
                    secureTextEntry
                    returnKeyType="go"
                    onSubmitEditing={handleLogin}
                  />
                </View>
              </View>

              <Button
                title={isSignUp ? t('signUp') : t('login')}
                onPress={handleLogin}
                variant="gold"
                size="lg"
                loading={submitting}
                style={styles.submit}
              />

              <Pressable
                onPress={() => setIsSignUp((value) => !value)}
                accessibilityRole="button"
                style={({ pressed }) => [styles.authSwitch, pressed && styles.pressed]}
              >
                <Text style={styles.authSwitchText} numberOfLines={1}>
                  {isSignUp ? t('alreadyHaveAccount') : t('createAccount')}
                </Text>
              </Pressable>
            </Animated.View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  container: {
    flex: 1,
    backgroundColor: t.colors.background,
  },
  fill: {
    flex: 1,
  },
  pressed: {
    opacity: 0.7,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: t.spacing.xl,
  },
  backRow: {
    alignItems: 'flex-start',
    marginBottom: t.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: t.spacing.section,
  },
  title: {
    ...t.typography.h1,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: t.spacing.md,
  },
  subtitle: {
    ...t.typography.small,
    color: 'rgba(255, 255, 255, 0.72)',
    textAlign: 'center',
    marginTop: t.spacing.xs,
  },

  form: {
    gap: t.spacing.md,
  },
  field: {
    gap: t.spacing.sm,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing.sm,
  },
  label: {
    flexShrink: 1,
    ...t.typography.smallBold,
    color: t.colors.text,
  },
  forgot: {
    flexShrink: 1,
    maxWidth: 180,
    ...t.typography.caption,
    color: t.colors.accent,
    textAlign: 'right',
  },
  inputShell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.sm,
    height: 54,
    paddingHorizontal: t.spacing.md,
    borderRadius: t.borderRadius.lg,
    backgroundColor: t.colors.surface,
    borderWidth: 1.5,
    borderColor: t.colors.border,
  },
  inputFocused: {
    borderColor: t.colors.accent,
  },
  input: {
    flex: 1,
    minWidth: 0,
    ...t.typography.body,
    color: t.colors.text,
    padding: 0,
  },
  submit: {
    marginTop: t.spacing.xs,
  },
  authSwitch: {
    alignSelf: 'center',
    paddingVertical: t.spacing.sm,
    paddingHorizontal: t.spacing.md,
  },
  authSwitchText: {
    ...t.typography.captionBold,
    color: t.colors.accent,
  },

  pendingCard: {
    alignItems: 'center',
    gap: 8,
    padding: t.spacing.lg,
    borderRadius: t.borderRadius.xl,
    borderWidth: 1,
    borderColor: t.colors.border,
    backgroundColor: t.colors.surface,
  },
  pendingTitle: { ...t.typography.h3, color: t.colors.text, textAlign: 'center' },
  pendingLabel: { ...t.typography.caption, color: t.colors.textSecondary, textAlign: 'center' },
  pendingEmail: { ...t.typography.bodyBold, color: t.colors.accent, textAlign: 'center' },
  pendingNote: {
    ...t.typography.tiny,
    color: t.colors.textMuted,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 4,
  },

  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.smd,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: t.colors.border,
  },
  dividerText: {
    flexShrink: 1,
    maxWidth: '60%',
    ...t.typography.caption,
    color: t.colors.textMuted,
    textAlign: 'center',
  },
  social: {
    flexDirection: 'row',
    gap: t.spacing.smd,
  },
  socialButton: {
    flex: 1,
    minWidth: 0,
  },
  demoNote: {
    ...t.typography.tiny,
    color: t.colors.textMuted,
    textAlign: 'center',
    marginTop: t.spacing.sm,
  },
}));
