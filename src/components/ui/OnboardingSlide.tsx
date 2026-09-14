/**
 * ============================================
 * ONBOARDING SLIDE
 * ============================================
 *
 * Full-bleed photo slide with a badge, a headline and a supporting line.
 *
 * The onboarding screens always sit on dark photography, so the text is
 * white in both appearances by design — only the badge accent follows
 * the theme.
 *
 * Text sizing steps down on small phones and the headline is capped at
 * three lines, which is what keeps the longer Russian headlines clear of
 * the pagination dots and the Next button below.
 */

import { Dimensions, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { RemoteImage } from './RemoteImage';
import { makeStyles, useTheme } from '@/context/ThemeContext';

const { width, height } = Dimensions.get('window');

export interface OnboardingSlideProps {
  title: string;
  subtitle: string;
  /** Small uppercase eyebrow, e.g. "Verified investments" */
  badge: string;
  imageUrl: string;
}

export function OnboardingSlide({ title, subtitle, badge, imageUrl }: OnboardingSlideProps) {
  const styles = useStyles();
  const { gradients } = useTheme();

  return (
    <View style={styles.container}>
      <RemoteImage uri={imageUrl} style={styles.image} />

      <LinearGradient
        colors={gradients.heroOverlay}
        locations={[0, 0.35, 0.68, 1]}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <Animated.View entering={FadeInUp.delay(180).duration(500)}>
            <BlurView intensity={36} tint="dark" style={styles.badge}>
              <View style={styles.badgeDot} />
              <Text style={styles.badgeText} numberOfLines={1} ellipsizeMode="tail">
                {badge}
              </Text>
            </BlurView>
          </Animated.View>

          <Animated.Text
            entering={FadeInUp.delay(320).duration(500)}
            style={styles.title}
            numberOfLines={3}
            ellipsizeMode="tail"
          >
            {title}
          </Animated.Text>

          <Animated.Text
            entering={FadeInUp.delay(440).duration(500)}
            style={styles.subtitle}
            numberOfLines={4}
            ellipsizeMode="tail"
          >
            {subtitle}
          </Animated.Text>
        </View>
      </LinearGradient>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  container: {
    width,
    height,
  },
  image: {
    ...StyleSheetAbsolute,
  },
  gradient: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  content: {
    paddingHorizontal: t.spacing.xl,
    // Clears the pagination dots and the footer buttons
    paddingBottom: t.metrics.isSmall ? 190 : 210,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    maxWidth: '100%',
    paddingHorizontal: t.spacing.md,
    paddingVertical: 9,
    borderRadius: t.borderRadius.full,
    marginBottom: t.spacing.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: t.colors.accentOverlay.medium,
  },
  badgeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: t.colors.accent,
    marginRight: 9,
  },
  badgeText: {
    flexShrink: 1,
    ...t.typography.label,
    color: t.colors.accent,
  },
  title: {
    ...t.typography.hero,
    fontSize: t.metrics.isSmall ? 30 : t.typography.hero.fontSize,
    lineHeight: t.metrics.isSmall ? 38 : t.typography.hero.lineHeight,
    color: t.colors.onDark,
    marginBottom: t.spacing.smd,
  },
  subtitle: {
    ...t.typography.body,
    fontSize: t.metrics.isSmall ? 15 : 16,
    lineHeight: t.metrics.isSmall ? 22 : 24,
    color: t.colors.onDarkMuted,
  },
}));

/** Absolute fill for the background photo behind the gradient */
const StyleSheetAbsolute = {
  position: 'absolute' as const,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
};

export default OnboardingSlide;
