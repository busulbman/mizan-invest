/**
 * ============================================
 * PROPERTY IMAGE GALLERY
 * ============================================
 *
 * Swipeable hero photos with a counter and a thumbnail strip.
 *
 * Tapping the hero — or any thumbnail that is already selected — opens
 * the full-screen viewer with pinch, double-tap zoom and pan. The strip
 * itself is for quick jumps between photos without leaving the page.
 *
 * Photos render through `RemoteImage`, so a dead URL shows the branded
 * placeholder rather than an empty frame.
 */

import { useRef, useState } from 'react';
import { Dimensions, Pressable, ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { AppIcon } from '@/components/ui/AppIcon';
import { Badge } from '@/components/ui/Badge';
import { RemoteImage } from '@/components/ui/RemoteImage';
import { FullscreenGallery } from '@/components/media/FullscreenGallery';
import { useLanguage } from '@/context/LanguageContext';
import { makeStyles, useTheme } from '@/context/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HERO_HEIGHT = 360;
const THUMB_SIZE = 62;

export interface ImageGalleryProps {
  images: string[];
  verified?: boolean;
}

export function ImageGallery({ images, verified = false }: ImageGalleryProps) {
  const styles = useStyles();
  const { gradients, colors } = useTheme();
  const { t } = useLanguage();

  const scrollRef = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);
  const [viewerOpen, setViewerOpen] = useState(false);

  const goTo = (next: number) => {
    setIndex(next);
    scrollRef.current?.scrollTo({ x: next * SCREEN_WIDTH, animated: true });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) =>
          setIndex(Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH))
        }
      >
        {images.map((uri, i) => (
          <Pressable
            key={`${uri}-${i}`}
            onPress={() => setViewerOpen(true)}
            accessibilityRole="imagebutton"
            accessibilityLabel={t('photos')}
            style={styles.heroPage}
          >
            <RemoteImage uri={uri} style={styles.heroImage} />
          </Pressable>
        ))}
      </ScrollView>

      {/* Bottom scrim so the sheet corners below read cleanly */}
      <LinearGradient
        colors={['transparent', 'rgba(8, 13, 24, 0.55)']}
        style={styles.bottomScrim}
        pointerEvents="none"
      />

      {/* Verified marker */}
      {verified && (
        <View style={styles.verifiedSlot} pointerEvents="none">
          <Badge label={t('verifiedProperty')} tone="onImage" icon="verified" small />
        </View>
      )}

      {/* Counter + expand affordance */}
      <Pressable
        onPress={() => setViewerOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={t('photos')}
        style={styles.counter}
      >
        <AppIcon name="expand" size="xs" color={colors.onDark} />
        <Text style={styles.counterText} numberOfLines={1}>
          {index + 1} / {images.length}
        </Text>
      </Pressable>

      {/* Thumbnails */}
      {images.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.thumbRow}
        >
          {images.map((uri, i) => (
            <Pressable
              key={`thumb-${uri}-${i}`}
              onPress={() => (i === index ? setViewerOpen(true) : goTo(i))}
              accessibilityRole="button"
              accessibilityState={{ selected: i === index }}
              style={[styles.thumb, i === index && styles.thumbActive]}
            >
              <RemoteImage uri={uri} style={styles.thumbImage} />
            </Pressable>
          ))}
        </ScrollView>
      )}

      <FullscreenGallery
        visible={viewerOpen}
        images={images}
        initialIndex={index}
        onClose={() => setViewerOpen(false)}
      />
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  container: {
    backgroundColor: t.colors.backgroundDark,
  },
  heroPage: {
    width: SCREEN_WIDTH,
    height: HERO_HEIGHT,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  bottomScrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    // Sits above the thumbnail strip, over the hero only
    top: HERO_HEIGHT - 110,
    height: 110,
  },
  verifiedSlot: {
    position: 'absolute',
    // Photo bottom-left: clear of the safe-area controls at the top.
    top: HERO_HEIGHT - 50,
    left: t.spacing.screenHorizontal,
    // Leaves room for the floating back / action buttons
    maxWidth: SCREEN_WIDTH - t.spacing.screenHorizontal * 2 - 120,
  },
  counter: {
    position: 'absolute',
    right: t.spacing.screenHorizontal,
    top: HERO_HEIGHT - 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    height: 30,
    paddingHorizontal: 10,
    borderRadius: t.borderRadius.sm,
    backgroundColor: 'rgba(8, 13, 24, 0.6)',
  },
  counterText: {
    ...t.typography.tiny,
    color: t.colors.onDark,
  },
  thumbRow: {
    paddingHorizontal: t.spacing.screenHorizontal,
    paddingVertical: t.spacing.smd,
    gap: t.spacing.sm,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: t.borderRadius.md,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbActive: {
    borderColor: t.colors.accent,
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
}));

export default ImageGallery;
