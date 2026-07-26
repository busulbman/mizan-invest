/**
 * ============================================
 * HOME SCREEN
 * ============================================
 *
 * Main investor home screen with property listings.
 * Sections: Hero, Countries, Categories, Featured, High Yield, AI Insights, Partners
 *
 * TODO: Connect to backend API for real data
 * TODO: Add pull-to-refresh
 * TODO: Add search functionality
 * TODO: Implement favorites persistence
 */

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { FadeIn, FadeInDown, FadeInRight } from 'react-native-reanimated';

import { theme } from '@/theme';
import { Images } from '@/constants/images';
import { AppConfig } from '@/constants/config';
import {
  featuredProperties,
  highYieldProperties,
  verifiedPartners,
  countries,
  categories,
  aiInsights,
} from '@/constants/mockData';
import { LogoMark, SectionHeader, AppIcon, LanguageButton } from '@/components/ui';
import { PropertyCard } from '@/components/home/PropertyCard';
import { HighYieldCard } from '@/components/home/HighYieldCard';
import { PartnerCard } from '@/components/home/PartnerCard';
import { InsightCard } from '@/components/home/InsightCard';
import { CategoryCard } from '@/components/home/CategoryCard';
import { useLanguage } from '@/context/LanguageContext';
import { categoryNameKey, countryNameKey } from '@/constants/localizedData';

export default function HomeScreen() {
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const [selectedCountry, setSelectedCountry] = useState('all');

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingTop: insets.top }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ============================================ */}
        {/* HEADER */}
        {/* ============================================ */}
        <Animated.View entering={FadeIn.delay(100)} style={styles.header}>
          <View style={styles.headerLeft}>
            <LogoMark size="small" showShadow />
            <View>
              <Text style={styles.headerTitle}>{AppConfig.appName}</Text>
              <Text style={styles.headerSubtitle}>{t('homeSubtitle')}</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            {/* Language switcher — available without leaving the Home tab */}
            <LanguageButton />

            {/* TODO: Connect to notifications */}
            <TouchableOpacity style={styles.notificationButton}>
              <AppIcon name="notification" size="lg" color={theme.colors.textDark} />
              <View style={styles.notificationBadge} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* ============================================ */}
        {/* HERO CARD */}
        {/* TODO: Replace with production image */}
        {/* ============================================ */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.heroContainer}>
          <ImageBackground
            source={{ uri: Images.hero.home }}
            style={styles.heroImage}
            imageStyle={styles.heroImageStyle}
          >
            <LinearGradient
              colors={theme.gradients.darkOverlay}
              locations={[0.2, 0.5, 1]}
              style={styles.heroGradient}
            >
              <BlurView intensity={20} tint="dark" style={styles.heroBadge}>
                <AppIcon name="star" size="sm" color={theme.colors.accent} />
                <Text style={styles.heroBadgeText}>{t('investorEdition')}</Text>
              </BlurView>

              <Text style={styles.heroTitle}>{t('heroTitle')}</Text>
              <Text style={styles.heroSubtitle}>{t('heroSubtitle')}</Text>

              <TouchableOpacity style={styles.heroButton} activeOpacity={0.9}>
                <LinearGradient
                  colors={theme.gradients.gold}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.heroButtonGradient}
                >
                  <Text style={styles.heroButtonText}>{t('exploreInvestments')}</Text>
                  <AppIcon name="arrowForward" size="md" color={theme.colors.textDark} />
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </ImageBackground>
        </Animated.View>

        {/* ============================================ */}
        {/* COUNTRY CHIPS */}
        {/* TODO: Add/remove countries in mockData.ts */}
        {/* ============================================ */}
        <Animated.View entering={FadeInRight.delay(300)}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.countryContainer}
          >
            {countries.map((country) => (
              <TouchableOpacity
                key={country.id}
                style={[
                  styles.countryChip,
                  selectedCountry === country.id && styles.countryChipActive,
                ]}
                onPress={() => setSelectedCountry(country.id)}
              >
                <Text style={styles.countryFlag}>{country.flag}</Text>
                <Text
                  style={[
                    styles.countryName,
                    selectedCountry === country.id && styles.countryNameActive,
                  ]}
                >
                  {t(countryNameKey(country.id))}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {/* ============================================ */}
        {/* CATEGORIES */}
        {/* ============================================ */}
        <Animated.View entering={FadeInDown.delay(400)} style={styles.section}>
          <SectionHeader title={t('categories')} actionText={t('seeAll')} />
          <View style={styles.categoriesGrid}>
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                name={t(categoryNameKey(category.id))}
                icon={category.icon}
                count={category.count}
              />
            ))}
          </View>
        </Animated.View>

        {/* ============================================ */}
        {/* FEATURED PROPERTIES */}
        {/* TODO: Replace mock property data */}
        {/* ============================================ */}
        <Animated.View entering={FadeInDown.delay(500)} style={styles.section}>
          <SectionHeader
            title={t('featuredProperties')}
            subtitle={t('handpickedInvestments')}
            actionText={t('viewAll')}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.propertiesContainer}
          >
            {featuredProperties.map((property) => (
              <PropertyCard
                key={property.id}
                id={property.id}
                title={property.title}
                location={property.location}
                price={property.price}
                roi={property.roi}
                image={property.image}
                verified={property.verified}
                favorite={property.favorite}
                onPress={() => router.push(`/(main)/property/${property.id}`)}
              />
            ))}
          </ScrollView>
        </Animated.View>

        {/* ============================================ */}
        {/* HIGH YIELD OPPORTUNITIES */}
        {/* ============================================ */}
        <Animated.View entering={FadeInDown.delay(600)} style={styles.section}>
          <SectionHeader
            title={t('highYieldOpportunities')}
            subtitle={t('bestRoiPotential')}
            actionText={t('explore')}
          />
          <View style={styles.highYieldContainer}>
            {highYieldProperties.map((property) => (
              <HighYieldCard
                key={property.id}
                id={property.id}
                title={property.title}
                location={property.location}
                price={property.price}
                roi={property.roi}
                image={property.image}
                onPress={() => router.push(`/(main)/property/${property.id}`)}
              />
            ))}
          </View>
        </Animated.View>

        {/* ============================================ */}
        {/* AI INVESTMENT INSIGHTS */}
        {/* TODO: Connect to AI analysis API */}
        {/* ============================================ */}
        <Animated.View entering={FadeInDown.delay(700)} style={styles.section}>
          <SectionHeader
            title={t('aiInsights')}
            subtitle={t('marketAnalysis')}
          />
          <View style={styles.insightsGrid}>
            {aiInsights.map((insight) => (
              <InsightCard
                key={insight.id}
                label={insight.label}
                value={insight.value}
                trend={insight.trend}
                color={insight.color}
              />
            ))}
          </View>
        </Animated.View>

        {/* ============================================ */}
        {/* VERIFIED PARTNERS */}
        {/* TODO: Replace with partner data from API */}
        {/* ============================================ */}
        <Animated.View entering={FadeInDown.delay(800)} style={[styles.section, styles.lastSection]}>
          <SectionHeader
            title={t('verifiedPartners')}
            subtitle={t('trustedProfessionals')}
            actionText={t('allPartners')}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.partnersContainer}
          >
            {verifiedPartners.map((partner) => (
              <PartnerCard
                key={partner.id}
                name={partner.name}
                country={partner.country}
                listings={partner.listings}
                rating={partner.rating}
                logo={partner.logo}
              />
            ))}
          </ScrollView>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: theme.spacing.section,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.screenHorizontal,
    paddingVertical: theme.spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.smd,
  },
  headerTitle: {
    ...theme.typography.h4,
    color: theme.colors.textDark,
  },
  headerSubtitle: {
    ...theme.typography.label,
    color: theme.colors.textLight,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.smd,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.error,
    borderWidth: 2,
    borderColor: theme.colors.white,
  },

  // Hero
  heroContainer: {
    paddingHorizontal: theme.spacing.screenHorizontal,
    marginBottom: theme.spacing.lg,
  },
  heroImage: {
    width: '100%',
    height: 320,
    borderRadius: theme.borderRadius.feature,
    overflow: 'hidden',
  },
  heroImageStyle: {
    borderRadius: theme.borderRadius.feature,
  },
  heroGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: theme.spacing.xl,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.accentOverlay.medium,
  },
  heroBadgeText: {
    ...theme.typography.label,
    color: theme.colors.accent,
  },
  heroTitle: {
    ...theme.typography.h2,
    color: theme.colors.white,
    marginBottom: theme.spacing.sm,
  },
  heroSubtitle: {
    ...theme.typography.small,
    color: theme.colors.textOnDarkMuted,
    lineHeight: 22,
    marginBottom: theme.spacing.lg,
  },
  heroButton: {
    alignSelf: 'flex-start',
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.gold,
  },
  heroButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 8,
  },
  heroButtonText: {
    ...theme.typography.small,
    fontWeight: '600',
    color: theme.colors.primary,
  },

  // Country chips
  countryContainer: {
    paddingHorizontal: theme.spacing.screenHorizontal,
    paddingVertical: theme.spacing.sm,
    gap: 10,
  },
  countryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.full,
    marginRight: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 8,
  },
  countryChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  countryFlag: {
    fontSize: 16,
  },
  countryName: {
    ...theme.typography.small,
    fontWeight: '500',
    color: theme.colors.textDark,
  },
  countryNameActive: {
    color: theme.colors.white,
  },

  // Sections
  section: {
    marginTop: theme.spacing.xxl,
  },
  lastSection: {
    marginBottom: theme.spacing.lg,
  },
  categoriesGrid: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
  },
  propertiesContainer: {
    paddingHorizontal: theme.spacing.screenHorizontal,
  },
  highYieldContainer: {
    paddingHorizontal: theme.spacing.screenHorizontal,
  },
  insightsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: theme.spacing.screenHorizontal,
    gap: theme.spacing.smd,
  },
  partnersContainer: {
    paddingHorizontal: theme.spacing.screenHorizontal,
  },
});
