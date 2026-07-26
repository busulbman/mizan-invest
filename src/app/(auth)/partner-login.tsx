/**
 * ============================================
 * PARTNER LOGIN SCREEN
 * ============================================
 *
 * Login screen for verified partners.
 * Exclusive glass design with gold accents.
 *
 * TODO: Connect Firebase Authentication
 * TODO: Add partner verification flow
 * TODO: Add multi-factor authentication
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

export default function PartnerLoginScreen() {
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleLogin = () => {
    // TODO: Connect Firebase Authentication
    // `replace` so the dashboard is not stacked on top of the login form
    router.replace('/(partner)/dashboard');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={theme.gradients.partnerGradient}
        locations={[0, 0.5, 1]}
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
              <View style={styles.proBadge}>
                <Text style={styles.proBadgeText}>{t('partnerPortalBadge')}</Text>
              </View>
              <LogoMark size="medium" />
              <Text style={styles.title}>{t('partnerWelcome')}</Text>
              <Text style={styles.subtitle}>{t('partnerSubtitle')}</Text>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(400).duration(600)} style={styles.formCard}>
              <BlurView intensity={20} tint="dark" style={styles.formBlur}>
                <View style={styles.formInner}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>{t('partnerEmail')}</Text>
                    <View style={[styles.inputContainer, focusedField === 'email' && styles.inputFocused]}>
                      <TextInput
                        style={styles.input}
                        placeholder="partner@company.com"
                        placeholderTextColor="rgba(255, 255, 255, 0.3)"
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
                    <Text style={styles.label}>{t('password')}</Text>
                    <View style={[styles.inputContainer, focusedField === 'password' && styles.inputFocused]}>
                      <TextInput
                        style={styles.input}
                        placeholder="••••••••••"
                        placeholderTextColor="rgba(255, 255, 255, 0.3)"
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
                    <LinearGradient
                      colors={theme.gradients.gold}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.primaryButtonGradient}
                    >
                      <Text style={styles.primaryButtonText}>{t('partnerLoginButton')}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </BlurView>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(600).duration(600)} style={styles.footer}>
              <Text style={styles.footerText}>{t('notPartnerYet')}</Text>
              <TouchableOpacity style={styles.requestButton}>
                <Text style={styles.requestButtonText}>{t('requestPartnerAccess')}</Text>
                <AppIcon name="arrowForward" size="md" color={theme.colors.accent} />
              </TouchableOpacity>
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
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  proBadge: {
    backgroundColor: theme.colors.accentOverlay.light,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.full,
    marginBottom: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.accentOverlay.medium,
  },
  proBadgeText: {
    ...theme.typography.label,
    color: theme.colors.accent,
    letterSpacing: 1.5,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.white,
    marginTop: theme.spacing.lg,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textOnDarkMuted,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  formCard: {
    borderRadius: theme.borderRadius.hero,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.overlay.light,
  },
  formBlur: {
    borderRadius: theme.borderRadius.hero,
    overflow: 'hidden',
  },
  formInner: {
    padding: theme.spacing.xl,
    gap: theme.spacing.lg,
  },
  inputGroup: {
    gap: 10,
  },
  label: {
    ...theme.typography.small,
    fontWeight: '600',
    color: theme.colors.textOnDarkMuted,
  },
  inputContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.overlay.light,
  },
  inputFocused: {
    borderColor: theme.colors.accent,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  input: {
    paddingHorizontal: 18,
    paddingVertical: 16,
    ...theme.typography.body,
    color: theme.colors.white,
  },
  primaryButton: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    marginTop: theme.spacing.sm,
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
  footer: {
    alignItems: 'center',
    marginTop: 40,
    gap: theme.spacing.smd,
  },
  footerText: {
    ...theme.typography.small,
    color: theme.colors.textOnDarkMuted,
  },
  requestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  requestButtonText: {
    ...theme.typography.bodyBold,
    color: theme.colors.accent,
  },
});
