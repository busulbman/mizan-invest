/**
 * ============================================
 * ONBOARDING SLIDE COMPONENT
 * ============================================
 *
 * Full-screen onboarding slide with image and text.
 * Used in: Onboarding screen
 *
 * TODO: Replace placeholder images with branded illustrations
 */

import { View, Text, StyleSheet, Dimensions, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { theme } from '@/theme';

const { width, height } = Dimensions.get('window');

// ============================================
// TYPES
// ============================================

export interface OnboardingSlideProps {
  /** Slide title */
  title: string;

  /** Slide subtitle/description */
  subtitle: string;

  /** Badge text (e.g., "Verified Investments") */
  badge: string;

  /** Background image URL */
  imageUrl: string;
}

// ============================================
// COMPONENT
// ============================================

export function OnboardingSlide({ title, subtitle, badge, imageUrl }: OnboardingSlideProps) {
  return (
    <View style={styles.container}>
      {/* TODO: Replace with production image */}
      <ImageBackground
        source={{ uri: imageUrl }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <LinearGradient
          colors={theme.gradients.heroOverlay}
          locations={[0, 0.3, 0.6, 1]}
          style={styles.gradient}
        >
          <View style={styles.content}>
            {/* Badge */}
            <Animated.View entering={FadeInUp.delay(200).duration(600)}>
              <BlurView intensity={40} tint="dark" style={styles.badge}>
                <View style={styles.badgeDot} />
                <Text style={styles.badgeText}>{badge}</Text>
              </BlurView>
            </Animated.View>

            {/* Title */}
            <Animated.Text
              entering={FadeInUp.delay(400).duration(600)}
              style={styles.title}
            >
              {title}
            </Animated.Text>

            {/* Subtitle */}
            <Animated.Text
              entering={FadeInUp.delay(600).duration(600)}
              style={styles.subtitle}
            >
              {subtitle}
            </Animated.Text>
          </View>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    width,
    height,
  },
  backgroundImage: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  content: {
    paddingHorizontal: theme.spacing.section,
    paddingBottom: 180,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.full,
    marginBottom: theme.spacing.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.accentOverlay.medium,
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.accent,
    marginRight: 10,
  },
  badgeText: {
    ...theme.typography.label,
    color: theme.colors.accent,
    textTransform: 'uppercase',
  },
  title: {
    ...theme.typography.hero,
    color: theme.colors.white,
    marginBottom: theme.spacing.lg,
  },
  subtitle: {
    fontSize: 18,
    color: theme.colors.textOnDarkMuted,
    lineHeight: 28,
    letterSpacing: 0.2,
  },
});

export default OnboardingSlide;
