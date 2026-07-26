/**
 * ============================================
 * ONBOARDING SCREEN
 * ============================================
 *
 * 3-slide introduction to Mizan Invest.
 * Shows key features and value propositions.
 *
 * TODO: Track onboarding completion in AsyncStorage
 * TODO: Add skip confirmation for first-time users
 */

import { useState, useRef } from 'react';
import { View, StyleSheet, FlatList, Dimensions, TouchableOpacity, Text } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';

import { theme } from '@/theme';
import { Images } from '@/constants/images';
import { OnboardingSlide } from '@/components/ui/OnboardingSlide';
import { useLanguage } from '@/context/LanguageContext';
import { AppIcon } from '@/components/ui/AppIcon';

const { width } = Dimensions.get('window');

// Onboarding slide configuration
const SLIDES_CONFIG = [
  {
    badge: 'Verified Investments',
    titleKey: 'onboarding1Title' as const,
    subtitleKey: 'onboarding1Subtitle' as const,
    image: Images.onboarding.slide1,
  },
  {
    badge: 'AI Analysis',
    titleKey: 'onboarding2Title' as const,
    subtitleKey: 'onboarding2Subtitle' as const,
    image: Images.onboarding.slide2,
  },
  {
    badge: 'Trusted Partners',
    titleKey: 'onboarding3Title' as const,
    subtitleKey: 'onboarding3Subtitle' as const,
    image: Images.onboarding.slide3,
  },
];

export default function OnboardingScreen() {
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const isLastSlide = currentIndex === SLIDES_CONFIG.length - 1;

  const handleNext = () => {
    if (isLastSlide) {
      // TODO: Mark onboarding as completed
      router.replace('/(auth)/welcome');
    } else {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    }
  };

  const handleSkip = () => {
    // TODO: Mark onboarding as skipped
    router.replace('/(auth)/welcome');
  };

  return (
    <View style={styles.container}>
      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={SLIDES_CONFIG}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        keyExtractor={(_, index) => index.toString()}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        renderItem={({ item }) => (
          <OnboardingSlide
            title={t(item.titleKey)}
            subtitle={t(item.subtitleKey)}
            badge={item.badge}
            imageUrl={item.image}
          />
        )}
      />

      {/* Skip button */}
      <Animated.View
        entering={FadeIn.delay(800)}
        style={[styles.header, { top: insets.top + 16 }]}
      >
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <BlurView intensity={30} tint="dark" style={styles.skipBlur}>
            <Text style={styles.skipText}>{t('skip')}</Text>
          </BlurView>
        </TouchableOpacity>
      </Animated.View>

      {/* Footer with pagination and next button */}
      <Animated.View
        entering={FadeInUp.delay(1000).duration(600)}
        style={[styles.footer, { paddingBottom: insets.bottom + 32 }]}
      >
        {/* Pagination dots */}
        <View style={styles.pagination}>
          {SLIDES_CONFIG.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                currentIndex === index && styles.activeDot,
              ]}
            />
          ))}
        </View>

        {/* Next/Get Started button */}
        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
          activeOpacity={0.9}
        >
          <Text style={styles.nextButtonText}>
            {isLastSlide ? t('getStarted') : t('next')}
          </Text>
          <View style={styles.nextButtonArrow}>
            <AppIcon name="arrowForward" size="md" color={theme.colors.white} />
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },
  header: {
    position: 'absolute',
    right: theme.spacing.screenHorizontal,
    zIndex: 10,
  },
  skipButton: {
    overflow: 'hidden',
    borderRadius: theme.borderRadius.full,
  },
  skipBlur: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.overlay.light,
  },
  skipText: {
    ...theme.typography.small,
    fontWeight: '500',
    color: theme.colors.textOnDarkMuted,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: theme.spacing.section,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: theme.spacing.section,
    gap: theme.spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  activeDot: {
    width: 32,
    backgroundColor: theme.colors.accent,
  },
  nextButton: {
    backgroundColor: theme.colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: theme.borderRadius.xl,
    ...theme.shadows.floating,
  },
  nextButtonText: {
    ...theme.typography.button,
    color: theme.colors.primary,
  },
  nextButtonArrow: {
    marginLeft: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
