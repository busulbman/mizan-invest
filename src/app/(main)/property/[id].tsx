/**
 * ============================================
 * PROPERTY DETAIL SCREEN
 * ============================================
 *
 * Premium property detail view.
 * Most important screen in Mizan Invest.
 *
 * Sections:
 * 1. Image Gallery
 * 2. Property Info
 * 3. AI Investment Analysis
 * 4. Property Description
 * 5. Property Features
 * 6. Location Map
 * 7. Partner Information
 * 8. Video Tour
 * 9. Similar Properties
 * 10. Bottom CTA
 *
 * TODO: Connect to backend API
 * TODO: Implement favorites persistence
 * TODO: Add share functionality
 * TODO: Lead Generation System
 * TODO: CRM Tracking
 * TODO: Commission Tracking
 */

import { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  StatusBar,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { theme } from '@/theme';
import { AppIcon } from '@/components/ui/AppIcon';
import {
  getPropertyById,
  getSimilarProperties,
  Property,
} from '@/constants/mockData';
import {
  ImageGallery,
  PropertyInfo,
  AIAnalysisSection,
  PropertyFeatures,
  PropertyDescription,
  LocationSection,
  PartnerInfo,
  VideoSection,
  SimilarProperties,
  BottomCTA,
} from '@/components/property';
import { useLanguage } from '@/context/LanguageContext';

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();

  const [property, setProperty] = useState<Property | null>(null);
  const [similarProperties, setSimilarProperties] = useState<Property[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);

  // Load property data
  useEffect(() => {
    // TODO: Replace with API call
    const loadedProperty = getPropertyById(id || '1');
    if (loadedProperty) {
      setProperty(loadedProperty);
      setIsFavorite(loadedProperty.favorite || false);
      setSimilarProperties(getSimilarProperties(loadedProperty, 3));
    }
  }, [id]);

  // Handle back navigation
  const handleBack = () => {
    router.back();
  };

  // Handle favorite toggle
  const handleFavorite = () => {
    // TODO: Connect to backend/storage
    setIsFavorite(!isFavorite);
  };

  // Handle share
  const handleShare = () => {
    // TODO: Implement share functionality
    Alert.alert(t('share'), t('featureComingSoon'));
  };

  // Handle contact partner
  const handleContactPartner = () => {
    // TODO: Lead Generation System
    // TODO: CRM Tracking
    Alert.alert(t('contactPartner'), t('contactPartnerMessage'));
  };

  // Handle save property
  const handleSaveProperty = () => {
    // TODO: Connect to user favorites
    setIsFavorite(!isFavorite);
  };

  // Handle watch video
  const handleWatchVideo = () => {
    // TODO: Connect YouTube videos
    Alert.alert(t('watchVideo'), t('featureComingSoon'));
  };

  // Handle view map
  const handleViewMap = () => {
    // TODO: Integrate Google Maps
    Alert.alert(t('viewOnMap'), t('featureComingSoon'));
  };

  // Handle similar property press
  const handleSimilarPropertyPress = (similarProperty: Property) => {
    // TODO: Navigate to property detail
    router.push(`/(main)/property/${similarProperty.id}`);
  };

  if (!property) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>{t('loading')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Back Button - Fixed */}
      <Animated.View
        entering={FadeIn.delay(300)}
        style={[styles.backButton, { top: insets.top + 10 }]}
      >
        <TouchableOpacity onPress={handleBack}>
          <BlurView intensity={40} tint="dark" style={styles.backBlur}>
            <AppIcon name="back" size="lg" color={theme.colors.white} />
          </BlurView>
        </TouchableOpacity>
      </Animated.View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Image Gallery */}
        <ImageGallery
          images={property.images || [property.image]}
          verified={property.verified}
        />

        {/* 2. Property Info */}
        <Animated.View entering={FadeInDown.delay(200)}>
          <PropertyInfo
            property={property}
            onFavoritePress={handleFavorite}
            onSharePress={handleShare}
            isFavorite={isFavorite}
          />
        </Animated.View>

        {/* 3. AI Investment Analysis */}
        {property.aiAnalysis && (
          <Animated.View entering={FadeInDown.delay(300)}>
            <AIAnalysisSection analysis={property.aiAnalysis} />
          </Animated.View>
        )}

        {/* Divider */}
        <View style={styles.divider} />

        {/* 4. Property Description */}
        {property.description && (
          <Animated.View entering={FadeInDown.delay(400)}>
            <PropertyDescription description={property.description} />
          </Animated.View>
        )}

        {/* 5. Property Features */}
        {property.features && (
          <Animated.View entering={FadeInDown.delay(500)}>
            <PropertyFeatures features={property.features} />
          </Animated.View>
        )}

        {/* 6. Location Section */}
        <Animated.View entering={FadeInDown.delay(600)}>
          <LocationSection
            city={property.city}
            country={property.country}
            onViewMap={handleViewMap}
          />
        </Animated.View>

        {/* 7. Partner Information */}
        {property.partner && (
          <Animated.View entering={FadeInDown.delay(700)}>
            <PartnerInfo
              partner={property.partner}
              onViewProfile={() => {}}
            />
          </Animated.View>
        )}

        {/* 8. Video Section */}
        {property.videoUrl && (
          <Animated.View entering={FadeInDown.delay(800)}>
            <VideoSection
              videoUrl={property.videoUrl}
              onWatchVideo={handleWatchVideo}
            />
          </Animated.View>
        )}

        {/* 9. Similar Properties */}
        <Animated.View entering={FadeInDown.delay(900)}>
          <SimilarProperties
            properties={similarProperties}
            onPropertyPress={handleSimilarPropertyPress}
          />
        </Animated.View>

        {/* Bottom padding for CTA */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* 10. Bottom CTA - Fixed */}
      <BottomCTA
        onContactPartner={handleContactPartner}
        onSaveProperty={handleSaveProperty}
        isSaved={isFavorite}
      />
    </View>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    ...theme.typography.body,
    color: theme.colors.textLight,
  },
  backButton: {
    position: 'absolute',
    left: theme.spacing.screenHorizontal,
    zIndex: 100,
  },
  backBlur: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.overlay.light,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 0,
  },
  divider: {
    height: 8,
    backgroundColor: theme.colors.background,
    marginVertical: theme.spacing.sm,
  },
  bottomPadding: {
    height: 160,
  },
});
