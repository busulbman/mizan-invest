/**
 * ============================================
 * IMAGE GALLERY COMPONENT
 * ============================================
 *
 * Hero image with horizontal thumbnail gallery.
 * Used in: Property Detail Screen
 *
 * TODO: Add full-screen image viewer
 * TODO: Add pinch-to-zoom functionality
 * TODO: Replace placeholder images with CDN URLs
 */

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { FadeIn } from 'react-native-reanimated';

import { theme } from '@/theme';

const { width } = Dimensions.get('window');
const HERO_HEIGHT = 400;
const THUMBNAIL_SIZE = 70;

// ============================================
// TYPES
// ============================================

export interface ImageGalleryProps {
  images: string[];
  verified?: boolean;
  onImagePress?: (index: number) => void;
}

// ============================================
// COMPONENT
// ============================================

export function ImageGallery({ images, verified = false, onImagePress }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleThumbnailPress = (index: number) => {
    setActiveIndex(index);
  };

  return (
    <View style={styles.container}>
      {/* Hero Image */}
      <Animated.View entering={FadeIn.duration(500)} style={styles.heroContainer}>
        {/* TODO: Replace with production image */}
        <Image
          source={{ uri: images[activeIndex] }}
          style={styles.heroImage}
          resizeMode="cover"
        />

        {/* Gradient overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(15, 23, 42, 0.3)', 'rgba(15, 23, 42, 0.7)']}
          locations={[0.5, 0.75, 1]}
          style={styles.heroGradient}
        />

        {/* Verified badge */}
        {verified && (
          <View style={styles.verifiedBadge}>
            <BlurView intensity={40} tint="dark" style={styles.verifiedBlur}>
              <Text style={styles.verifiedIcon}>✓</Text>
              <Text style={styles.verifiedText}>Verified Property</Text>
            </BlurView>
          </View>
        )}

        {/* Image counter */}
        <View style={styles.counterBadge}>
          <BlurView intensity={40} tint="dark" style={styles.counterBlur}>
            <Text style={styles.counterText}>
              {activeIndex + 1} / {images.length}
            </Text>
          </BlurView>
        </View>
      </Animated.View>

      {/* Thumbnail Gallery */}
      {images.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.thumbnailContainer}
        >
          {images.map((image, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.thumbnail,
                activeIndex === index && styles.thumbnailActive,
              ]}
              onPress={() => handleThumbnailPress(index)}
              activeOpacity={0.8}
            >
              <Image source={{ uri: image }} style={styles.thumbnailImage} />
              {activeIndex === index && <View style={styles.thumbnailOverlay} />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.primary,
  },
  heroContainer: {
    width,
    height: HERO_HEIGHT,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  verifiedBadge: {
    position: 'absolute',
    top: 60,
    left: theme.spacing.screenHorizontal,
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
  },
  verifiedBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.full,
    gap: 6,
    borderWidth: 1,
    borderColor: theme.colors.successOverlay.medium,
  },
  verifiedIcon: {
    fontSize: 12,
    color: theme.colors.success,
  },
  verifiedText: {
    ...theme.typography.label,
    color: theme.colors.success,
  },
  counterBadge: {
    position: 'absolute',
    top: 60,
    right: theme.spacing.screenHorizontal,
    borderRadius: theme.borderRadius.sm,
    overflow: 'hidden',
  },
  counterBlur: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.overlay.light,
  },
  counterText: {
    ...theme.typography.label,
    color: theme.colors.white,
  },
  thumbnailContainer: {
    paddingHorizontal: theme.spacing.screenHorizontal,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  thumbnail: {
    width: THUMBNAIL_SIZE,
    height: THUMBNAIL_SIZE,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    marginRight: theme.spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnailActive: {
    borderColor: theme.colors.accent,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(212, 180, 131, 0.2)',
  },
});

export default ImageGallery;
