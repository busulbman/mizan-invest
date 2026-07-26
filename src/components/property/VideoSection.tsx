/**
 * ============================================
 * VIDEO SECTION COMPONENT
 * ============================================
 *
 * Property video tour card.
 * Shows: Video thumbnail with play button
 *
 * Used in: Property Detail Screen
 *
 * TODO: Connect YouTube videos
 * TODO: Add video player integration
 * TODO: Add 360° virtual tour support
 */

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/theme';
import { useLanguage } from '@/context/LanguageContext';
import { AppIcon } from '@/components/ui/AppIcon';

// ============================================
// TYPES
// ============================================

export interface VideoSectionProps {
  videoUrl?: string;
  thumbnailUrl?: string;
  onWatchVideo?: () => void;
}

// ============================================
// COMPONENT
// ============================================

export function VideoSection({ videoUrl, thumbnailUrl, onWatchVideo }: VideoSectionProps) {
  const { t } = useLanguage();

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <Text style={styles.title}>{t('propertyVideoTour')}</Text>

      {/* Video Card */}
      <TouchableOpacity
        style={styles.videoCard}
        onPress={onWatchVideo}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={['#1E3A5F', theme.colors.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.videoGradient}
        >
          {/* Decorative elements */}
          <View style={styles.decoration}>
            <View style={styles.decorationCircle1} />
            <View style={styles.decorationCircle2} />
          </View>

          {/* Content */}
          <View style={styles.content}>
            {/* Virtual tour badge */}
            <View style={styles.badge}>
              <AppIcon name="video" size="sm" color={theme.colors.white} />
              <Text style={styles.badgeText}>{t('virtualTour')}</Text>
            </View>

            {/* Play button */}
            <View style={styles.playButton}>
              <LinearGradient
                colors={theme.gradients.gold}
                style={styles.playButtonGradient}
              >
                <AppIcon name="play" size="xl" color={theme.colors.primary} />
              </LinearGradient>
            </View>

            {/* Watch video button */}
            <View style={styles.watchButton}>
              <Text style={styles.watchButtonText}>{t('watchVideo')}</Text>
              <AppIcon name="arrowForward" size="md" color={theme.colors.accent} />
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.screenHorizontal,
    paddingVertical: theme.spacing.lg,
  },
  title: {
    ...theme.typography.h4,
    color: theme.colors.textDark,
    marginBottom: theme.spacing.md,
  },
  videoCard: {
    borderRadius: theme.borderRadius.hero,
    overflow: 'hidden',
    ...theme.shadows.floating,
  },
  videoGradient: {
    height: 180,
    position: 'relative',
  },
  decoration: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  decorationCircle1: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(212, 180, 131, 0.1)',
  },
  decorationCircle2: {
    position: 'absolute',
    bottom: -20,
    left: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.full,
    gap: 8,
    marginBottom: theme.spacing.md,
  },
  badgeText: {
    ...theme.typography.label,
    color: theme.colors.white,
  },
  playButton: {
    marginBottom: theme.spacing.md,
    ...theme.shadows.gold,
  },
  playButtonGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  watchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  watchButtonText: {
    ...theme.typography.bodyBold,
    color: theme.colors.white,
  },
});

export default VideoSection;
