/**
 * ============================================
 * PARTNER LOGIN
 * ============================================
 *
 * The partner-facing counterpart to the investor sign-in. Same form
 * mechanics, deliberately different chrome: a dark navy field with a
 * glass form card and gold accents, so it reads as the professional
 * portal rather than the consumer app.
 *
 * DEMO ONLY — submitting goes straight to the partner dashboard. No
 * authentication, no verification flow, no MFA.
 *
 * Keyboard handling matches the investor screen: KeyboardAvoidingView
 * plus a ScrollView that keeps taps alive while the keyboard is open.
 */

import { useState } from 'react';
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
import { BlurView } from 'expo-blur';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';

import { AppIcon, Badge, Button, IconButton, LogoMark } from '@/components/ui';
import { useLanguage } from '@/context/LanguageContext';
import { makeStyles, useTheme } from '@/context/ThemeContext';

export default function PartnerLoginScreen() {
  const styles = useStyles();
  const { colors, gradients } = useTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [focused, setFocused] = useState<'email' | 'password' | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      // `replace` so the dashboard is not stacked on the login form
      router.replace('/(partner)/dashboard');
    }, 450);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={gradients.partnerGradient} locations={[0, 0.5, 1]} style={styles.fill}>
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
              <Badge label={t('partnerPortalBadge')} tone="accent" icon="building" />
              <LogoMark size="medium" style={styles.logo} />
              <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
                {t('partnerWelcome')}
              </Text>
              <Text style={styles.subtitle} numberOfLines={3} ellipsizeMode="tail">
                {t('partnerSubtitle')}
              </Text>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(280).duration(500)} style={styles.formCard}>
              <BlurView intensity={22} tint="dark" style={styles.formInner}>
                <View style={styles.field}>
                  <Text style={styles.label} numberOfLines={1}>
                    {t('partnerEmail')}
                  </Text>
                  <View style={[styles.inputShell, focused === 'email' && styles.inputFocused]}>
                    <AppIcon name="email" size="sm" color={colors.onDarkMuted} />
                    <TextInput
                      style={styles.input}
                      placeholder="partner@company.com"
                      placeholderTextColor="rgba(255, 255, 255, 0.4)"
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

                <View style={styles.field}>
                  <Text style={styles.label} numberOfLines={1}>
                    {t('password')}
                  </Text>
                  <View style={[styles.inputShell, focused === 'password' && styles.inputFocused]}>
                    <AppIcon name="security" size="sm" color={colors.onDarkMuted} />
                    <TextInput
                      style={styles.input}
                      placeholder="••••••••"
                      placeholderTextColor="rgba(255, 255, 255, 0.4)"
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
                  title={t('partnerLoginButton')}
                  onPress={handleLogin}
                  variant="gold"
                  size="lg"
                  loading={submitting}
                />
              </BlurView>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(420).duration(500)} style={styles.footer}>
              <Text style={styles.footerText} numberOfLines={2} ellipsizeMode="tail">
                {t('notPartnerYet')}
              </Text>
              <Pressable
                onPress={() => Alert.alert(t('requestPartnerAccess'), t('requestSentBody'))}
                accessibilityRole="button"
                style={({ pressed }) => [styles.requestButton, pressed && styles.pressed]}
              >
                <Text style={styles.requestText} numberOfLines={1} ellipsizeMode="tail">
                  {t('requestPartnerAccess')}
                </Text>
                <AppIcon name="arrowForward" size="sm" color={colors.accent} />
              </Pressable>
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
    backgroundColor: t.colors.backgroundDark,
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
    marginBottom: t.spacing.xl,
  },
  logo: {
    marginTop: t.spacing.md,
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

  formCard: {
    borderRadius: t.borderRadius.hero,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
  },
  formInner: {
    padding: t.spacing.lg,
    gap: t.spacing.md,
  },
  field: {
    gap: t.spacing.sm,
  },
  label: {
    ...t.typography.smallBold,
    color: 'rgba(255, 255, 255, 0.78)',
  },
  inputShell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.sm,
    height: 54,
    paddingHorizontal: t.spacing.md,
    borderRadius: t.borderRadius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.16)',
  },
  inputFocused: {
    borderColor: t.colors.accent,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  input: {
    flex: 1,
    minWidth: 0,
    ...t.typography.body,
    color: '#FFFFFF',
    padding: 0,
  },

  footer: {
    alignItems: 'center',
    gap: t.spacing.sm,
    marginTop: t.spacing.section,
  },
  footerText: {
    ...t.typography.caption,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
  requestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.sm,
    minHeight: t.metrics.minTouch,
    maxWidth: '100%',
  },
  requestText: {
    flexShrink: 1,
    ...t.typography.bodyBold,
    color: t.colors.accent,
  },
}));
