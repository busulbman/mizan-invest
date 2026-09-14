/**
 * ============================================
 * HOME
 * ============================================
 *
 * The investor home feed. Structured as a stack of horizontal rails
 * rather than one long vertical page, which is what makes it read as a
 * mobile app instead of a scrolled-down website.
 *
 * Rails: featured · Madinah · new · high potential · AI insights ·
 * popular cities · verified partners · recently viewed.
 *
 * The country chips are not decorative — they filter the listing rails
 * in place, and each rail hides itself when the active filter leaves it
 * empty, so the screen never shows an empty row.
 *
 * TODO: Replace the demo catalogue with the listings API
 */

import { useCallback, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { AppConfig } from '@/constants/config';
import { Images } from '@/constants/images';
import {
  aiInsights,
  categories,
  cities,
  countries,
  countPropertiesByCity,
  countPropertiesByType,
  featuredProperties,
  highYieldProperties,
  madinahProperties,
  newestProperties,
  properties,
  recentlyViewedProperties,
  verifiedPartners,
} from '@/constants/mockData';
import {
  cityNameKey,
  countryNameKey,
  propertyTypePluralKey,
} from '@/constants/localizedData';
import {
  AppIcon,
  Badge,
  Button,
  LogoMark,
  RemoteImage,
  SectionHeader,
} from '@/components/ui';
import {
  CategoryCard,
  CityCard,
  InsightCard,
  PartnerCard,
  PropertyCompactCard,
  PropertyPosterCard,
  PropertyRow,
} from '@/components/cards';
import { useLanguage } from '@/context/LanguageContext';
import { useNotifications } from '@/context/NotificationsContext';
import { useTabReselect } from '@/context/TabRefreshContext';
import { makeStyles, useTheme } from '@/context/ThemeContext';

export default function HomeScreen() {
  const styles = useStyles();
  const { colors, gradients } = useTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const { unreadCount } = useNotifications();

  const [country, setCountry] = useState('all');
  const scrollRef = useRef<ScrollView>(null);

  useTabReselect('home', useCallback(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, []));

  // One predicate drives every rail, so the chips filter the whole feed
  const matchesCountry = useMemo(
    () => (countryCode: string) => country === 'all' || countryCode === country,
    [country]
  );

  const featured = featuredProperties.filter((p) => matchesCountry(p.countryCode));
  const madinah = madinahProperties.filter((p) => matchesCountry(p.countryCode));
  const newest = newestProperties.filter((p) => matchesCountry(p.countryCode));
  const highYield = highYieldProperties.filter((p) => matchesCountry(p.countryCode)).slice(0, 3);
  const cityList = cities.filter((c) => matchesCountry(c.countryCode));
  const partners = verifiedPartners.filter((p) => matchesCountry(p.countryCode));

  const goToExplore = (params?: Record<string, string>) =>
    router.push({ pathname: '/(main)/explore', params });

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 96 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ---------------------------------------- */}
        {/* HEADER */}
        {/* ---------------------------------------- */}
        <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
          <View style={styles.brand}>
            <LogoMark size="small" showShadow={false} />
            <Text style={styles.brandName} numberOfLines={1} ellipsizeMode="tail">
              {AppConfig.appName}
            </Text>
          </View>

          <View style={styles.headerActions}>
            <Pressable
              onPress={() => router.push('/(main)/notifications')}
              accessibilityRole="button"
              accessibilityLabel={t('notifications')}
              style={({ pressed }) => [styles.bellButton, pressed && styles.pressed]}
            >
              <AppIcon name="notification" size="md" color={colors.text} />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText} numberOfLines={1}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Text>
                </View>
              )}
            </Pressable>
            <Pressable
              onPress={() => router.push('/(main)/profile')}
              accessibilityRole="button"
              accessibilityLabel={t('profile')}
              style={({ pressed }) => [styles.bellButton, pressed && styles.pressed]}
            >
              <AppIcon name="profile" size="md" color={colors.text} />
            </Pressable>
          </View>
        </Animated.View>

        {/* ---------------------------------------- */}
        {/* HERO */}
        {/* Deliberately short — a full-height hero is a website habit. */}
        {/* ---------------------------------------- */}
        <Animated.View entering={FadeInDown.delay(80)} style={styles.heroWrap}>
          <RemoteImage uri={Images.hero.home} style={styles.heroImage} />
          <LinearGradient
            colors={gradients.darkOverlay}
            locations={[0.1, 0.5, 1]}
            style={styles.heroOverlay}
          >
            <Badge label={t('investorEdition')} tone="onImage" icon="star" small />
            <Text style={styles.heroTitle} numberOfLines={2} ellipsizeMode="tail">
              {t('heroTitle')}
            </Text>
            <Text style={styles.heroSubtitle} numberOfLines={2} ellipsizeMode="tail">
              {t('heroSubtitle')}
            </Text>
            <Button
              title={t('exploreInvestments')}
              onPress={() => goToExplore()}
              variant="gold"
              size="md"
              iconRight="arrowForward"
              fullWidth={false}
              style={styles.heroButton}
            />
          </LinearGradient>
        </Animated.View>

        {/* ---------------------------------------- */}
        {/* COUNTRY FILTER */}
        {/* ---------------------------------------- */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {countries.map((item) => {
            const active = country === item.id;
            return (
              <Pressable
                key={item.id}
                onPress={() => setCountry(item.id)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                style={({ pressed }) => [
                  styles.chip,
                  active && styles.chipActive,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.chipFlag}>{item.flag}</Text>
                <Text
                  style={[styles.chipLabel, active && styles.chipLabelActive]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {t(countryNameKey(item.id))}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* ---------------------------------------- */}
        {/* CATEGORIES */}
        {/* ---------------------------------------- */}
        <View style={styles.section}>
          <SectionHeader
            title={t('categories')}
            actionText={t('seeAll')}
            onActionPress={() => goToExplore()}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.rail}
          >
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                name={t(propertyTypePluralKey(category.id))}
                icon={category.icon}
                count={countPropertiesByType(category.id)}
                onPress={() => goToExplore({ type: category.id })}
              />
            ))}
          </ScrollView>
        </View>

        {/* ---------------------------------------- */}
        {/* FEATURED */}
        {/* ---------------------------------------- */}
        {featured.length > 0 && (
          <Animated.View entering={FadeInDown.delay(120)} style={styles.section}>
            <SectionHeader
              title={t('featuredProjects')}
              subtitle={t('featuredProjectsSubtitle')}
              actionText={t('viewAll')}
              onActionPress={() => goToExplore()}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.rail}
            >
              {featured.map((property) => (
                <PropertyPosterCard key={property.id} property={property} />
              ))}
            </ScrollView>
          </Animated.View>
        )}

        {/* ---------------------------------------- */}
        {/* MADINAH */}
        {/* ---------------------------------------- */}
        {madinah.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title={t('madinahProjects')}
              subtitle={t('madinahProjectsSubtitle')}
              actionText={t('seeAll')}
              onActionPress={() => goToExplore({ city: 'madinah' })}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.rail}
            >
              {madinah.map((property) => (
                <PropertyCompactCard key={property.id} property={property} />
              ))}
            </ScrollView>
          </View>
        )}

        {/* ---------------------------------------- */}
        {/* NEW LISTINGS */}
        {/* ---------------------------------------- */}
        {newest.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title={t('newListings')}
              subtitle={t('newListingsSubtitle')}
              actionText={t('seeAll')}
              onActionPress={() => goToExplore()}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.rail}
            >
              {newest.map((property) => (
                <PropertyCompactCard key={property.id} property={property} />
              ))}
            </ScrollView>
          </View>
        )}

        {/* ---------------------------------------- */}
        {/* HIGH POTENTIAL */}
        {/* ---------------------------------------- */}
        {highYield.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title={t('highPotential')}
              subtitle={t('highPotentialSubtitle')}
              actionText={t('explore')}
              onActionPress={() => goToExplore()}
            />
            <View style={styles.list}>
              {highYield.map((property) => (
                <PropertyRow key={property.id} property={property} />
              ))}
            </View>
          </View>
        )}

        {/* ---------------------------------------- */}
        {/* AI INSIGHTS */}
        {/* ---------------------------------------- */}
        <View style={styles.section}>
          <SectionHeader title={t('aiInsights')} subtitle={t('marketAnalysis')} />
          <View style={styles.insightGrid}>
            {aiInsights.map((insight) => (
              <InsightCard
                key={insight.id}
                label={t(insight.labelKey)}
                // The risk tile stores a key so it translates like the rest
                value={insight.id === '4' ? t('low') : insight.value}
                trend={insight.trend}
                tone={insight.tone}
              />
            ))}
          </View>
          <Text style={styles.disclaimer} numberOfLines={3}>
            {t('aiDisclaimer')}
          </Text>
        </View>

        {/* ---------------------------------------- */}
        {/* POPULAR CITIES */}
        {/* ---------------------------------------- */}
        {cityList.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title={t('popularCities')}
              subtitle={t('popularCitiesSubtitle')}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.rail}
            >
              {cityList.map((city) => (
                <CityCard
                  key={city.id}
                  name={t(cityNameKey(city.id))}
                  image={city.image}
                  count={countPropertiesByCity(city.id)}
                  onPress={() => goToExplore({ city: city.id })}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* ---------------------------------------- */}
        {/* VERIFIED PARTNERS */}
        {/* ---------------------------------------- */}
        {partners.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title={t('verifiedPartners')}
              subtitle={t('verifiedPartnersSubtitle')}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.rail}
            >
              {partners.map((partner) => (
                <PartnerCard
                  key={partner.id}
                  partner={partner}
                  onPress={() =>
                    goToExplore({
                      // Opening a partner filters Explore to their market
                      country: partner.countryCode,
                      verified: '1',
                    })
                  }
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* ---------------------------------------- */}
        {/* RECENTLY VIEWED */}
        {/* ---------------------------------------- */}
        <View style={[styles.section, styles.lastSection]}>
          <SectionHeader
            title={t('recentlyViewed')}
            subtitle={t('recentlyViewedSubtitle')}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.rail}
          >
            {recentlyViewedProperties.map((property) => (
              <PropertyCompactCard key={property.id} property={property} />
            ))}
          </ScrollView>
        </View>

        <Text style={styles.footerNote} numberOfLines={2}>
          {properties.length} {t('objectsShort')} · {t('demoExchangeRate')}
        </Text>
      </ScrollView>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  container: {
    flex: 1,
    backgroundColor: t.colors.background,
  },
  content: {
    paddingBottom: t.spacing.section,
  },
  pressed: {
    opacity: 0.75,
  },

  // ---- Header ----
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing.sm,
    paddingHorizontal: t.spacing.screenHorizontal,
    paddingBottom: t.spacing.smd,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.sm,
    // Yields width to the controls before it truncates
    flexShrink: 1,
    minWidth: 0,
  },
  brandName: {
    flexShrink: 1,
    minWidth: 0,
    ...t.typography.h4,
    color: t.colors.text,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.sm,
    flexShrink: 0,
  },
  bellButton: {
    width: t.metrics.minTouch,
    height: t.metrics.minTouch,
    borderRadius: t.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  badge: {
    position: 'absolute',
    top: 5,
    right: 5,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: t.colors.error,
    borderWidth: 2,
    borderColor: t.colors.surface,
  },
  badgeText: {
    ...t.typography.tiny,
    fontSize: 9,
    lineHeight: 12,
    color: '#FFFFFF',
  },

  // ---- Hero ----
  heroWrap: {
    height: t.metrics.isSmall ? 210 : 240,
    marginHorizontal: t.spacing.screenHorizontal,
    borderRadius: t.borderRadius.hero,
    overflow: 'hidden',
    backgroundColor: t.colors.surfaceAlt,
  },
  heroImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: t.spacing.md,
    gap: 6,
  },
  heroTitle: {
    ...t.typography.h2,
    fontSize: t.metrics.isSmall ? 21 : t.typography.h2.fontSize,
    color: t.colors.onDark,
    marginTop: 2,
  },
  heroSubtitle: {
    ...t.typography.caption,
    color: t.colors.onDarkMuted,
  },
  heroButton: {
    marginTop: 6,
  },

  // ---- Chips ----
  chipRow: {
    paddingHorizontal: t.spacing.screenHorizontal,
    paddingVertical: t.spacing.md,
    gap: t.spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 40,
    maxWidth: 200,
    paddingHorizontal: t.spacing.md,
    borderRadius: t.borderRadius.full,
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  chipActive: {
    backgroundColor: t.colors.primary,
    borderColor: t.colors.primary,
  },
  chipFlag: {
    fontSize: 15,
  },
  chipLabel: {
    flexShrink: 1,
    minWidth: 0,
    ...t.typography.captionBold,
    color: t.colors.text,
  },
  chipLabelActive: {
    color: t.colors.onPrimary,
  },

  // ---- Sections ----
  section: {
    marginTop: t.spacing.sectionGap,
  },
  lastSection: {
    marginBottom: t.spacing.md,
  },
  rail: {
    paddingHorizontal: t.spacing.screenHorizontal,
    paddingRight: t.spacing.md,
  },
  list: {
    paddingHorizontal: t.spacing.screenHorizontal,
  },
  insightGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: t.spacing.smd,
    paddingHorizontal: t.spacing.screenHorizontal,
  },
  disclaimer: {
    ...t.typography.tiny,
    color: t.colors.textMuted,
    paddingHorizontal: t.spacing.screenHorizontal,
    paddingTop: t.spacing.smd,
  },
  footerNote: {
    ...t.typography.tiny,
    color: t.colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: t.spacing.screenHorizontal,
    paddingTop: t.spacing.lg,
  },
}));
