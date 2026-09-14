/**
 * ============================================
 * ONBOARDING
 * ============================================
 *
 * Three full-bleed slides introducing the product, with Skip pinned top
 * right and pagination + Next pinned to the bottom safe area.
 *
 * The slide content reserves the footer height, so the longest Russian
 * headline still clears the dots and the button instead of sliding under
 * them on a small screen.
 *
 * TODO: Record completion in AsyncStorage so returning users skip this
 */

import { useRef, useState } from 'react';
import { Dimensions, FlatList, Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';

import { Images } from '@/constants/images';
import { TranslationKey } from '@/constants/translations';
import { Button, OnboardingSlide } from '@/components/ui';
import { useLanguage } from '@/context/LanguageContext';
import { makeStyles } from '@/context/ThemeContext';

const { width } = Dimensions.get('window');

interface SlideConfig {
  badgeKey: TranslationKey;
  titleKey: TranslationKey;
  subtitleKey: TranslationKey;
  image: string;
}

const SLIDES: SlideConfig[] = [
  {
    badgeKey: 'onboarding1Badge',
    titleKey: 'onboarding1Title',
    subtitleKey: 'onboarding1Subtitle',
    image: Images.onboarding.slide1,
  },
  {
    badgeKey: 'onboarding2Badge',
    titleKey: 'onboarding2Title',
    subtitleKey: 'onboarding2Subtitle',
    image: Images.onboarding.slide2,
  },
  {
    badgeKey: 'onboarding3Badge',
    titleKey: 'onboarding3Title',
    subtitleKey: 'onboarding3Subtitle',
    image: Images.onboarding.slide3,
  },
];

export default function OnboardingScreen() {
  const styles = useStyles();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();

  const listRef = useRef<FlatList<SlideConfig>>(null);
  const [index, setIndex] = useState(0);

  const isLast = index === SLIDES.length - 1;

  const goNext = () => {
    if (isLast) {
      router.replace('/(auth)/welcome');
    } else {
      listRef.current?.scrollToIndex({ index: index + 1, animated: true });
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={listRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.titleKey}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        onMomentumScrollEnd={(event) =>
          setIndex(Math.round(event.nativeEvent.contentOffset.x / width))
        }
        renderItem={({ item }) => (
          <OnboardingSlide
            title={t(item.titleKey)}
            subtitle={t(item.subtitleKey)}
            badge={t(item.badgeKey)}
            imageUrl={item.image}
          />
        )}
      />

      {/* Skip */}
      <Animated.View entering={FadeIn.delay(600)} style={[styles.skipWrap, { top: insets.top + 12 }]}>
        <Pressable
          onPress={() => router.replace('/(auth)/welcome')}
          accessibilityRole="button"
          accessibilityLabel={t('skip')}
          style={({ pressed }) => [styles.skip, pressed && styles.pressed]}
        >
          <BlurView intensity={28} tint="dark" style={styles.skipInner}>
            <Text style={styles.skipText} numberOfLines={1}>
              {t('skip')}
            </Text>
          </BlurView>
        </Pressable>
      </Animated.View>

      {/* Footer */}
      <Animated.View
        entering={FadeInUp.delay(700).duration(500)}
        style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}
      >
        <View style={styles.dots}>
          {SLIDES.map((slide, i) => (
            <View key={slide.titleKey} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
        </View>

        <Button
          title={isLast ? t('getStarted') : t('next')}
          onPress={goNext}
          variant="gold"
          size="lg"
          iconRight="arrowForward"
        />
      </Animated.View>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  container: {
    flex: 1,
    backgroundColor: t.colors.backgroundDark,
  },
  pressed: {
    opacity: 0.75,
  },

  skipWrap: {
    position: 'absolute',
    right: t.spacing.screenHorizontal,
    zIndex: 10,
  },
  skip: {
    height: t.metrics.minTouch,
    borderRadius: t.borderRadius.full,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: t.colors.overlay.medium,
  },
  skipInner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  skipText: {
    ...t.typography.captionBold,
    color: t.colors.onDark,
  },

  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: t.spacing.xl,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: t.spacing.sm,
    marginBottom: t.spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.32)',
  },
  dotActive: {
    width: 28,
    backgroundColor: t.colors.accent,
  },
}));
