/**
 * ============================================
 * WELCOME SCREEN
 * ============================================
 *
 * Auth choice screen after onboarding.
 * Users can continue as guest, investor, or partner.
 *
 * TODO: Add biometric login option
 * TODO: Remember last login method
 */

import { View, Text, StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';

import { theme } from '@/theme';
import { Images } from '@/constants/images';
import { LogoMark, LanguageSelector, AppIcon } from '@/components/ui';
import { useLanguage } from '@/context/LanguageContext';

export default function WelcomeScreen() {
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      {/* TODO: Replace with production image */}
      <ImageBackground
        source={{ uri: Images.hero.welcome }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <LinearGradient
          colors={[
            'rgba(15, 23, 42, 0.3)',
            'rgba(15, 23, 42, 0.5)',
            'rgba(15, 23, 42, 0.85)',
            theme.colors.primary,
          ]}
          locations={[0, 0.3, 0.6, 0.85]}
          style={styles.gradient}
        >
          {/* Language selector */}
          <Animated.View
            entering={FadeIn.delay(200)}
            style={[styles.header, { paddingTop: insets.top + 16 }]}
          >
            <LanguageSelector />
          </Animated.View>

          <View style={styles.content}>
            {/* Logo section */}
            <Animated.View entering={FadeInDown.delay(300).duration(800)} style={styles.logoSection}>
              <LogoMark size="large" showShadow />
              <Text style={styles.appName}>{t('appName')}</Text>
            </Animated.View>

            {/* Hero text */}
            <Animated.View entering={FadeInUp.delay(500).duration(800)} style={styles.heroSection}>
              <Text style={styles.title}>{t('welcomeTitle')}</Text>
              <Text style={styles.subtitle}>{t('welcomeSubtitle')}</Text>
            </Animated.View>

            {/* Action buttons */}
            <Animated.View
              entering={FadeInUp.delay(700).duration(800)}
              style={[styles.actionsSection, { paddingBottom: insets.bottom + 32 }]}
            >
              {/* Primary: Continue as Guest */}
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => router.replace('/(main)/home')}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={theme.gradients.gold}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.primaryButtonGradient}
                >
                  <Text style={styles.primaryButtonText}>{t('continueAsGuest')}</Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Secondary buttons */}
              <View style={styles.secondaryButtons}>
                {/* Investor Login */}
                <TouchableOpacity
                  style={styles.glassButton}
                  onPress={() => router.push('/(auth)/investor-login')}
                  activeOpacity={0.8}
                >
                  <BlurView intensity={20} tint="dark" style={styles.glassButtonInner}>
                    <View style={styles.buttonIconContainer}>
                      <AppIcon name="wallet" size="md" color={theme.colors.accent} />
                    </View>
                    <Text style={styles.glassButtonText}>{t('investorLogin')}</Text>
                    <AppIcon name="arrowForward" size="md" color={theme.colors.textOnDarkMuted} />
                  </BlurView>
                </TouchableOpacity>

                {/* Partner Login */}
                <TouchableOpacity
                  style={styles.glassButton}
                  onPress={() => router.push('/(auth)/partner-login')}
                  activeOpacity={0.8}
                >
                  <BlurView intensity={20} tint="dark" style={styles.glassButtonInner}>
                    <View style={[styles.buttonIconContainer, styles.partnerIcon]}>
                      <AppIcon name="building" size="md" color={theme.colors.success} />
                    </View>
                    <Text style={styles.glassButtonText}>{t('partnerLogin')}</Text>
                    <View style={styles.exclusiveBadge}>
                      <Text style={styles.exclusiveBadgeText}>PRO</Text>
                    </View>
                  </BlurView>
                </TouchableOpacity>
              </View>

              <Text style={styles.note}>{t('partnerNote')}</Text>
            </Animated.View>
          </View>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },
  backgroundImage: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    paddingHorizontal: theme.spacing.screenHorizontal,
    alignItems: 'flex-end',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.xxl,
  },
  logoSection: {
    alignItems: 'center',
    paddingTop: 40,
  },
  appName: {
    ...theme.typography.h2,
    color: theme.colors.white,
    marginTop: theme.spacing.md,
    letterSpacing: 1,
  },
  heroSection: {
    alignItems: 'center',
  },
  title: {
    fontSize: 38,
    fontWeight: '700',
    color: theme.colors.white,
    textAlign: 'center',
    lineHeight: 46,
    letterSpacing: -0.5,
    marginBottom: theme.spacing.md,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textOnDarkMuted,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  actionsSection: {
    gap: theme.spacing.md,
  },
  primaryButton: {
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    ...theme.shadows.gold,
  },
  primaryButtonGradient: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.primary,
    letterSpacing: 0.3,
  },
  secondaryButtons: {
    gap: theme.spacing.smd,
  },
  glassButton: {
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.overlay.light,
  },
  glassButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  buttonIconContainer: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.accentOverlay.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  partnerIcon: {
    backgroundColor: theme.colors.successOverlay.light,
  },
  glassButtonText: {
    flex: 1,
    ...theme.typography.bodyBold,
    color: theme.colors.white,
    letterSpacing: 0.2,
  },
  exclusiveBadge: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.xs,
  },
  exclusiveBadgeText: {
    ...theme.typography.tiny,
    color: theme.colors.primary,
    letterSpacing: 0.5,
  },
  note: {
    ...theme.typography.caption,
    color: 'rgba(255, 255, 255, 0.4)',
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },
});
