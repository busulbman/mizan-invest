/**
 * ============================================
 * INVESTOR LOGIN
 * ============================================
 *
 * Email + password form with social sign-in shortcuts.
 *
 * DEMO ONLY — there is no authentication backend. Any submission goes
 * straight to the investor home, which is what the walkthrough needs.
 *
 * KEYBOARD HANDLING
 * The form lives inside a KeyboardAvoidingView + ScrollView with
 * `keyboardShouldPersistTaps="handled"`. Without both, the password
 * field disappears behind the keyboard on a small iPhone and the first
 * tap on the submit button only dismisses the keyboard instead of
 * pressing it.
 *
 * TODO: Connect real authentication and validation
 */

import { useState } from 'react';
import {
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
import { useLanguage } from '@/context/LanguageContext';
import { makeStyles, useTheme } from '@/context/ThemeContext';

export default function InvestorLoginScreen() {
  const styles = useStyles();
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [focused, setFocused] = useState<'email' | 'password' | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Brief spinner so the demo reads like a real sign-in
  const handleLogin = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      router.replace('/(main)/home');
    }, 450);
  };

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
                onPress={() => router.back()}
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
                {t('signInSubtitle')}
              </Text>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(280).duration(500)} style={styles.form}>
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
                    onPress={handleLogin}
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
                title={t('login')}
                onPress={handleLogin}
                variant="gold"
                size="lg"
                loading={submitting}
                style={styles.submit}
              />

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText} numberOfLines={1} ellipsizeMode="tail">
                  {t('orContinueWith')}
                </Text>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.social}>
                <Button
                  title="Google"
                  onPress={handleLogin}
                  variant="secondary"
                  size="md"
                  icon="globe"
                  style={styles.socialButton}
                />
                <Button
                  title="Apple"
                  onPress={handleLogin}
                  variant="secondary"
                  size="md"
                  icon="star"
                  style={styles.socialButton}
                />
              </View>

              <Text style={styles.demoNote} numberOfLines={2}>
                {t('demoAction')} · {t('demoActionBody')}
              </Text>
            </Animated.View>
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
