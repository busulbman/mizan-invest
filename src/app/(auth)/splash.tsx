/**
 * ============================================
 * SPLASH
 * ============================================
 *
 * Branded launch screen. Always dark in both appearances — it is the
 * brand moment, not a themed surface, and it matches the native splash
 * so the handover is invisible.
 *
 * The wordmark uses wide letter spacing in Latin and Cyrillic, and none
 * in Arabic: tracking breaks the cursive joins between Arabic letters.
 */

import { useEffect } from 'react';
import { Dimensions, View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { LogoMark } from '@/components/ui';
import { useLanguage } from '@/context/LanguageContext';
import { makeStyles, useTheme } from '@/context/ThemeContext';

const { height } = Dimensions.get('window');

export default function SplashScreen() {
  const styles = useStyles();
  const { gradients, animation } = useTheme();
  const { t, isRTL } = useLanguage();

  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withSequence(withTiming(1, { duration: 1400 }), withTiming(0, { duration: 1400 })),
      -1,
      false
    );

    const timer = setTimeout(() => {
      router.replace('/(auth)/onboarding');
    }, animation.splashDuration);

    return () => clearTimeout(timer);
  }, [animation.splashDuration, shimmer]);

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: 0.25 + shimmer.value * 0.45,
  }));

  return (
    <Animated.View entering={FadeIn.duration(400)} exiting={FadeOut} style={styles.container}>
      <LinearGradient colors={gradients.darkBackground} locations={[0, 0.5, 1]} style={styles.fill}>
        {/* Decorative diagonals */}
        <View style={styles.decoration} pointerEvents="none">
          {[0, 1, 2, 3, 4].map((i) => (
            <View
              key={i}
              style={[styles.line, { opacity: 0.03 + i * 0.01, top: height * 0.15 + i * 60 }]}
            />
          ))}
        </View>

        <View style={styles.content}>
          <Animated.View entering={FadeInDown.delay(150).duration(700)} style={styles.logoWrap}>
            <LogoMark size="large" showShadow />
            <Animated.View style={[styles.ring, shimmerStyle]} />
          </Animated.View>

          <Animated.Text
            entering={FadeInDown.delay(350).duration(700)}
            style={[styles.wordmark, isRTL && styles.wordmarkRtl]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.75}
          >
            {isRTL ? t('appName') : t('appName').toUpperCase()}
          </Animated.Text>

          <Animated.Text
            entering={FadeInDown.delay(520).duration(700)}
            style={[styles.tagline, isRTL && styles.taglineRtl]}
            numberOfLines={2}
          >
            {t('appSlogan')}
          </Animated.Text>
        </View>
      </LinearGradient>
    </Animated.View>
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
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: t.spacing.section,
    zIndex: 10,
  },
  logoWrap: {
    position: 'relative',
    marginBottom: t.spacing.section,
  },
  ring: {
    position: 'absolute',
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: t.colors.accent,
  },
  wordmark: {
    ...t.typography.h1,
    color: '#FFFFFF',
    letterSpacing: 5,
    textAlign: 'center',
    marginBottom: t.spacing.smd,
  },
  wordmarkRtl: {
    // Tracking breaks Arabic letter joins
    letterSpacing: 0,
  },
  tagline: {
    ...t.typography.caption,
    color: t.colors.accent,
    letterSpacing: 1.6,
    textAlign: 'center',
    opacity: 0.85,
  },
  taglineRtl: {
    letterSpacing: 0,
  },
  decoration: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  line: {
    position: 'absolute',
    left: -50,
    right: -50,
    height: 1,
    backgroundColor: t.colors.accent,
    transform: [{ rotate: '-15deg' }],
  },
}));
