/**
 * ============================================
 * INVESTOR LOGIN SCREEN
 * ============================================
 *
 * Login screen for investors.
 * Supports email/password and social login.
 *
 * TODO: Connect Firebase Authentication
 * TODO: Add form validation
 * TODO: Add password reset flow
 */

import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';

import { theme } from '@/theme';
import { LogoMark } from '@/components/ui/LogoMark';
import { AppIcon } from '@/components/ui/AppIcon';
import { useLanguage } from '@/context/LanguageContext';

export default function InvestorLoginScreen() {
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleLogin = () => {
    // TODO: Connect Firebase Authentication
    router.replace('/(main)/home');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.primary, '#1E293B', theme.colors.background]}
        locations={[0, 0.4, 1]}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={[
              styles.content,
              { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Animated.View entering={FadeIn.delay(100)}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <BlurView intensity={30} tint="dark" style={styles.backBlur}>
                  <AppIcon name="back" size="lg" color={theme.colors.white} />
                </BlurView>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.header}>
              <LogoMark size="medium" />
              <Text style={styles.title}>{t('welcomeBack')}</Text>
              <Text style={styles.subtitle}>{t('signInSubtitle')}</Text>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(400).duration(600)} style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('email')}</Text>
                <View style={[styles.inputContainer, focusedField === 'email' && styles.inputFocused]}>
                  <TextInput
                    style={styles.input}
                    placeholder="investor@example.com"
                    placeholderTextColor="rgba(107, 114, 128, 0.6)"
                    value={email}
                    onChangeText={setEmail}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>{t('password')}</Text>
                  <TouchableOpacity>
                    <Text style={styles.forgotPassword}>{t('forgotPassword')}</Text>
                  </TouchableOpacity>
                </View>
                <View style={[styles.inputContainer, focusedField === 'password' && styles.inputFocused]}>
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••••"
                    placeholderTextColor="rgba(107, 114, 128, 0.6)"
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    secureTextEntry
                  />
                </View>
              </View>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleLogin}
                activeOpacity={0.9}
              >
                <Text style={styles.primaryButtonText}>{t('login')}</Text>
              </TouchableOpacity>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or continue with</Text>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.socialButtons}>
                <TouchableOpacity style={styles.socialButton} onPress={handleLogin} activeOpacity={0.8}>
                  <Text style={styles.socialIcon}>G</Text>
                  <Text style={styles.socialButtonText}>Google</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.socialButton} onPress={handleLogin} activeOpacity={0.8}>
                  <Text style={styles.socialIcon}></Text>
                  <Text style={styles.socialButtonText}>Apple</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.xxl,
  },
  backButton: {
    alignSelf: 'flex-start',
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    marginBottom: theme.spacing.xl,
  },
  backBlur: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.overlay.light,
  },
  backArrow: {
    fontSize: 20,
    color: theme.colors.white,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.white,
    marginTop: theme.spacing.xl,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textOnDarkMuted,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  form: {
    gap: theme.spacing.lg,
  },
  inputGroup: {
    gap: 10,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    ...theme.typography.small,
    fontWeight: '600',
    color: theme.colors.textDark,
  },
  forgotPassword: {
    ...theme.typography.small,
    color: theme.colors.accent,
    fontWeight: '500',
  },
  inputContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: 'transparent',
    ...theme.shadows.card,
  },
  inputFocused: {
    borderColor: theme.colors.accent,
  },
  input: {
    paddingHorizontal: 18,
    paddingVertical: 16,
    ...theme.typography.body,
    color: theme.colors.textDark,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 18,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    marginTop: theme.spacing.smd,
    ...theme.shadows.primary,
  },
  primaryButtonText: {
    ...theme.typography.button,
    color: theme.colors.white,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  dividerText: {
    marginHorizontal: theme.spacing.md,
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
  socialButtons: {
    flexDirection: 'row',
    gap: theme.spacing.smd,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.white,
    paddingVertical: 16,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 10,
  },
  socialIcon: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textDark,
  },
  socialButtonText: {
    ...theme.typography.small,
    fontWeight: '600',
    color: theme.colors.textDark,
  },
});
