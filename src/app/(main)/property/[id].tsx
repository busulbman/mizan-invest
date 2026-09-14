/**
 * ============================================
 * PROPERTY DETAIL
 * ============================================
 *
 * The most important screen in the app. Section order is fixed and
 * deliberate — it walks an investor from "what is it" to "can I trust
 * it" to "how do I act":
 *
 *   1  photo gallery (tap → full-screen, zoomable)
 *   2  title, location, price
 *   3  key figures
 *   4  investment score
 *   5  description
 *   6  why invest here
 *   7  features
 *   8  project video
 *   9  location
 *  10  verified partner
 *  11  similar listings
 *  12  sticky CTA (WhatsApp · call · interested)
 *
 * The floating back button sits below the safe-area inset so it clears
 * the Dynamic Island, and the scroll content reserves room for the
 * sticky bar so the last section is never hidden behind it.
 *
 * TODO: Connect to the listings API
 * TODO: Lead generation + CRM tracking behind "I'm interested"
 */

import { useMemo } from 'react';
import { Alert, ScrollView, Share, StatusBar, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { IconButton } from '@/components/ui';
import { FavoriteButton } from '@/components/cards/FavoriteButton';
import {
  BottomCTA,
  DescriptionSection,
  FeaturesSection,
  ImageGallery,
  InvestmentScoreCard,
  KeyFigures,
  LocationSection,
  PartnerSection,
  PropertyHeader,
  PropertyNotFound,
  SimilarSection,
  VideoSection,
  WhyInvestSection,
} from '@/components/property';
import { getPartnerById, getPropertyById, getSimilarProperties } from '@/constants/mockData';
import { AppConfig } from '@/constants/config';
import { useLanguage } from '@/context/LanguageContext';
import { makeStyles, useTheme } from '@/context/ThemeContext';

export default function PropertyDetailScreen() {
  const styles = useStyles();
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const property = useMemo(() => getPropertyById(id ?? ''), [id]);
  const similar = useMemo(
    () => (property ? getSimilarProperties(property, 6) : []),
    [property]
  );

  if (!property) {
    return (
      <View style={styles.container}>
        <PropertyNotFound />
      </View>
    );
  }

  const partner = getPartnerById(property.partnerId);

  // Real share sheet, with a graceful message if the OS declines it
  const handleShare = async () => {
    try {
      await Share.share({
        title: t(property.titleKey),
        message: `${t(property.titleKey)} — ${AppConfig.links.website}`,
      });
    } catch {
      Alert.alert(t('share'), t('demoActionBody'));
    }
  };

  return (
    <View style={styles.container}>
      {/* The gallery is dark, so the status bar is always light here */}
      <StatusBar barStyle="light-content" />

      {/* Controls stay below the Dynamic Island and never cover the badge. */}
      <Animated.View
        entering={FadeIn.delay(150)}
        style={[styles.topControls, { top: insets.top + 10 }]}
      >
        <IconButton
          icon="back"
          onPress={() => router.back()}
          accessibilityLabel={t('back')}
          variant="glass"
          size={44}
        />
        <View style={styles.topActions}>
          <IconButton
            icon="share"
            onPress={handleShare}
            accessibilityLabel={t('share')}
            variant="glass"
            size={44}
          />
          <FavoriteButton propertyId={property.id} variant="glass" size={44} />
        </View>
      </Animated.View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 160 }]}
        showsVerticalScrollIndicator={false}
      >
        <ImageGallery images={property.images} verified={property.verified} />

        <Animated.View entering={FadeInDown.delay(80)}>
          <PropertyHeader property={property} />
        </Animated.View>

        <KeyFigures property={property} />

        <InvestmentScoreCard
          score={property.investmentScore}
          analysis={property.aiAnalysis}
        />

        <DescriptionSection descriptionKey={property.descriptionKey} />

        <WhyInvestSection type={property.type} />

        <FeaturesSection features={property.features} />

        {property.hasVideo && <VideoSection property={property} />}

        <LocationSection property={property} />

        {partner && <PartnerSection partner={partner} />}

        <SimilarSection properties={similar} />

      </ScrollView>

      <BottomCTA partner={partner} propertyTitle={t(property.titleKey)} />
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  container: {
    flex: 1,
    backgroundColor: t.colors.background,
  },
  topControls: {
    position: 'absolute',
    left: t.spacing.screenHorizontal,
    right: t.spacing.screenHorizontal,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 20,
  },
  topActions: {
    flexDirection: 'row',
    gap: t.spacing.sm,
  },
  content: {
    paddingBottom: 170,
  },
}));
