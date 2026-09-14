/**
 * ============================================
 * FULLSCREEN GALLERY
 * ============================================
 *
 * Full-screen photo viewer opened from the property gallery.
 *
 * Gestures (react-native-gesture-handler + reanimated — no extra
 * dependency, which keeps the bundle small):
 *   swipe left / right  → previous / next photo
 *   pinch               → zoom, clamped to 1×–5×
 *   double tap          → toggle between 1× and 2.5×
 *   drag while zoomed   → pan around the photo
 *
 * Paging is disabled the moment a photo is zoomed in, otherwise a
 * one-finger drag would flick to the next photo instead of panning the
 * current one. Zooming back out re-enables it.
 *
 * Always dark: a photo viewer with a light chrome washes out the image.
 */

import { useCallback, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Modal,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Image } from 'expo-image';

import { AppIcon } from '@/components/ui/AppIcon';
import { Images } from '@/constants/images';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const MIN_SCALE = 1;
const MAX_SCALE = 5;
const DOUBLE_TAP_SCALE = 2.5;

export interface FullscreenGalleryProps {
  visible: boolean;
  images: string[];
  /** Photo to open on */
  initialIndex?: number;
  onClose: () => void;
}

// ============================================
// ONE ZOOMABLE PAGE
// ============================================

function ZoomablePage({
  uri,
  onZoomChange,
}: {
  uri: string;
  onZoomChange: (zoomed: boolean) => void;
}) {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedX = useSharedValue(0);
  const savedY = useSharedValue(0);
  const [failed, setFailed] = useState(false);

  const reset = () => {
    'worklet';
    scale.value = withTiming(1);
    savedScale.value = 1;
    translateX.value = withTiming(0);
    translateY.value = withTiming(0);
    savedX.value = 0;
    savedY.value = 0;
  };

  const pinch = Gesture.Pinch()
    .onUpdate((event) => {
      const next = savedScale.value * event.scale;
      scale.value = Math.min(Math.max(next, MIN_SCALE), MAX_SCALE);
    })
    .onEnd(() => {
      if (scale.value <= MIN_SCALE) {
        reset();
        runOnJS(onZoomChange)(false);
      } else {
        savedScale.value = scale.value;
        runOnJS(onZoomChange)(true);
      }
    });

  // Only pans once zoomed — at 1× the swipe belongs to the pager
  const pan = Gesture.Pan()
    .onUpdate((event) => {
      if (scale.value > MIN_SCALE) {
        translateX.value = savedX.value + event.translationX;
        translateY.value = savedY.value + event.translationY;
      }
    })
    .onEnd(() => {
      savedX.value = translateX.value;
      savedY.value = translateY.value;
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      if (scale.value > MIN_SCALE) {
        reset();
        runOnJS(onZoomChange)(false);
      } else {
        scale.value = withTiming(DOUBLE_TAP_SCALE);
        savedScale.value = DOUBLE_TAP_SCALE;
        runOnJS(onZoomChange)(true);
      }
    });

  const composed = Gesture.Simultaneous(pinch, Gesture.Exclusive(doubleTap, pan));

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={styles.page}>
        <Animated.View style={[styles.pageInner, animatedStyle]}>
          <Image
            source={{ uri: failed ? Images.placeholders.property : uri }}
            style={styles.image}
            contentFit="contain"
            transition={180}
            cachePolicy="memory-disk"
            onError={() => {
              if (!failed) setFailed(true);
            }}
          />
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}

// ============================================
// GALLERY
// ============================================

export function FullscreenGallery({
  visible,
  images,
  initialIndex = 0,
  onClose,
}: FullscreenGalleryProps) {
  const { t } = useLanguage();
  const { typography } = useTheme();
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<string>>(null);

  const [index, setIndex] = useState(initialIndex);
  const [zoomed, setZoomed] = useState(false);

  const handleZoomChange = useCallback((next: boolean) => {
    setZoomed(next);
  }, []);

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
      supportedOrientations={['portrait']}
    >
      <GestureHandlerRootView style={styles.root}>
        <StatusBar barStyle="light-content" />

        <FlatList
          ref={listRef}
          data={images}
          keyExtractor={(uri, i) => `${uri}-${i}`}
          horizontal
          pagingEnabled
          // Locked while zoomed so a drag pans the photo instead of paging
          scrollEnabled={!zoomed}
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={initialIndex}
          getItemLayout={(_, i) => ({
            length: SCREEN_WIDTH,
            offset: SCREEN_WIDTH * i,
            index: i,
          })}
          onMomentumScrollEnd={(event) => {
            const next = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
            setIndex(next);
            setZoomed(false);
          }}
          renderItem={({ item }) => (
            <ZoomablePage uri={item} onZoomChange={handleZoomChange} />
          )}
        />

        {/* Close */}
        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={t('close')}
          hitSlop={12}
          style={[styles.closeButton, { top: insets.top + 12 }]}
        >
          <AppIcon name="close" size="lg" color="#FFFFFF" />
        </Pressable>

        {/* Counter */}
        <View style={[styles.counter, { top: insets.top + 16 }]}>
          <Text style={[typography.captionBold, styles.counterText]}>
            {index + 1} / {images.length}
          </Text>
        </View>

        {/* Gesture hint */}
        <Text
          style={[typography.caption, styles.hint, { bottom: insets.bottom + 20 }]}
          numberOfLines={1}
        >
          {t('zoomHint')}
        </Text>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000000',
  },
  page: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageInner: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
  },
  counter: {
    position: 'absolute',
    right: 16,
    paddingHorizontal: 12,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
  },
  counterText: {
    color: '#FFFFFF',
  },
  hint: {
    position: 'absolute',
    left: 24,
    right: 24,
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.6)',
  },
});

export default FullscreenGallery;
