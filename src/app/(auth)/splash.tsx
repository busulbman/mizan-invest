/**
 * ============================================
 * SPLASH SCREEN
 * ============================================
 *
 * Initial loading screen with animated logo.
 * Navigates to onboarding after 2 seconds.
 *
 * TODO: Add actual loading logic (auth check, data prefetch)
 * TODO: Connect to AsyncStorage to check first launch
 */

import { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';

import { theme } from '@/theme';
import { LogoMark } from '@/components/ui/LogoMark';
import { useLanguage } from '@/context/LanguageContext';

const { height } = Dimensions.get('window');

export default function SplashScreen() {
  const { t, isRTL } = useLanguage();
  const shimmer = useSharedValue(0);

  useEffect(() => {
    // Animated shimmer effect
    shimmer.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500 }),
        withTiming(0, { duration: 1500 })
      ),
      -1,
      false
    );

    // Navigate to onboarding after delay
    // TODO: Check if user has seen onboarding before
    const timer = setTimeout(() => {
      router.replace('/(auth)/onboarding');
    }, theme.animation.splashDuration);

    return () => clearTimeout(timer);
  }, []);

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: 0.3 + shimmer.value * 0.4,
  }));

  return (
    <Animated.View entering={FadeIn.duration(500)} exiting={FadeOut} style={styles.container}>
      <LinearGradient
        colors={theme.gradients.darkBackground}
        locations={[0, 0.5, 1]}
        style={styles.gradient}
      >
        {/* Decorative background lines */}
        <View style={styles.decorativeLines}>
          {[...Array(5)].map((_, i) => (
            <View
              key={i}
              style={[
                styles.decorativeLine,
                { opacity: 0.03 + i * 0.01, top: height * 0.15 + i * 60 },
              ]}
            />
          ))}
        </View>

        {/* Main content */}
        <View style={styles.content}>
          {/* Logo with shimmer ring */}
          <Animated.View entering={FadeInDown.delay(200).duration(800)} style={styles.logoContainer}>
            <LogoMark size="large" showShadow />
            <Animated.View style={[styles.shimmerRing, shimmerStyle]} />
          </Animated.View>

          {/* App name — wide letter spacing breaks Arabic ligatures, so drop it in RTL */}
          <Animated.View entering={FadeInDown.delay(400).duration(800)}>
            <Text style={[styles.appName, isRTL && styles.appNameRtl]}>
              {isRTL ? t('appName') : t('appName').toUpperCase()}
            </Text>
          </Animated.View>

          {/* Tagline */}
          <Animated.View entering={FadeInDown.delay(600).duration(800)}>
            <Text style={[styles.tagline, isRTL && styles.taglineRtl]}>{t('appSlogan')}</Text>
          </Animated.View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  logoContainer: {
    position: 'relative',
    marginBottom: theme.spacing.section,
  },
  shimmerRing: {
    position: 'absolute',
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: theme.colors.accent,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.white,
    letterSpacing: 6,
    marginBottom: theme.spacing.smd,
  },
  appNameRtl: {
    letterSpacing: 0,
  },
  tagline: {
    fontSize: 15,
    color: theme.colors.accent,
    letterSpacing: 2,
    textTransform: 'uppercase',
    opacity: 0.8,
    textAlign: 'center',
  },
  taglineRtl: {
    letterSpacing: 0,
    textTransform: 'none',
  },
  decorativeLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  decorativeLine: {
    position: 'absolute',
    left: -50,
    right: -50,
    height: 1,
    backgroundColor: theme.colors.accent,
    transform: [{ rotate: '-15deg' }],
  },
});
