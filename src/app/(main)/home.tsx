/**
 * ============================================
 * HOME
 * ============================================
 *
 * The investor home feed. Structured as a stack of horizontal rails
 * rather than one long vertical page, which is what makes it read as a
 * mobile app instead of a scrolled-down website.
 *
 * Listing rails and counts are derived from the remote published catalogue.
 * MarketContext scopes that catalogue before it reaches this screen.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { AppConfig } from '@/constants/config';
import { Images } from '@/constants/images';
import { propertyTypePluralKey } from '@/constants/localizedData';
import { IconName } from '@/constants/icons';
import {
  AppIcon,
  Badge,
  Button,
  LogoMark,
  MarketPicker,
  RemoteImage,
  SectionHeader,
} from '@/components/ui';
import {
  CategoryCard,
  CityCard,
  RemotePropertyCompactCard,
  RemotePropertyPosterCard,
  RemotePropertyRow,
} from '@/components/cards';
import { useLanguage } from '@/context/LanguageContext';
import { useMarket } from '@/context/MarketContext';
import { useNotifications } from '@/context/NotificationsContext';
import { useTabReselect } from '@/context/TabRefreshContext';
import { makeStyles, useTheme } from '@/context/ThemeContext';
import { getPropertiesByCountry, getPublishedProperties, RemoteProperty } from '@/lib/properties';

const HOME_CATEGORIES: ReadonlyArray<{ id: RemoteProperty['type']; icon: IconName }> = [
  { id: 'apartment', icon: 'apartment' },
  { id: 'villa', icon: 'villa' },
  { id: 'land', icon: 'land' },
  { id: 'commercial', icon: 'commercial' },
];

export default function HomeScreen() {
  const styles = useStyles();
  const { colors, gradients } = useTheme();
  const { language, t } = useLanguage();
  const { selectedMarket } = useMarket();
  const insets = useSafeAreaInsets();
  const { unreadCount } = useNotifications();
  const scrollRef = useRef<ScrollView>(null);
  const requestId = useRef(0);
  const [remoteProperties, setRemoteProperties] = useState<RemoteProperty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadProperties = useCallback(async (isPullToRefresh = false) => {
    const currentRequest = ++requestId.current;
    if (isPullToRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
      // Never display the previous market while the next market is loading.
      setRemoteProperties([]);
    }
    setLoadError(null);

    try {
      const data = selectedMarket
        ? await getPropertiesByCountry(selectedMarket, language)
        : await getPublishedProperties(language);
      if (requestId.current === currentRequest) setRemoteProperties(data);
    } catch (error) {
      if (requestId.current === currentRequest) {
        setLoadError(error instanceof Error ? error.message : String(error));
      }
    } finally {
      if (requestId.current === currentRequest) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, [language, selectedMarket]);

  useEffect(() => {
    void loadProperties();
    return () => {
      requestId.current += 1;
    };
  }, [loadProperties]);

  useTabReselect('home', useCallback(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
    void loadProperties(true);
  }, [loadProperties]));

  const featured = useMemo(() => {
    const featuredListings = remoteProperties.filter((property) => property.featured);
    return (featuredListings.length > 0 ? featuredListings : remoteProperties).slice(0, 6);
  }, [remoteProperties]);
  const madinah = useMemo(
    () => remoteProperties.filter((property) => property.city.slug.toLowerCase() === 'madinah'),
    [remoteProperties],
  );
  const newest = useMemo(() => remoteProperties.slice(0, 6), [remoteProperties]);
  const highPotential = useMemo(
    () => [...remoteProperties]
      .sort((left, right) => {
        if (left.investmentScore === null) return 1;
        if (right.investmentScore === null) return -1;
        return right.investmentScore - left.investmentScore;
      })
      .slice(0, 3),
    [remoteProperties],
  );
  const cityList = useMemo(() => {
    const byCity = new Map<string, { slug: string; name: string; image: string; count: number }>();
    remoteProperties.forEach((property) => {
      const existing = byCity.get(property.city.slug);
      if (existing) {
        existing.count += 1;
      } else {
        byCity.set(property.city.slug, {
          slug: property.city.slug,
          name: property.city.name,
          image: property.image,
          count: 1,
        });
      }
    });
    return Array.from(byCity.values()).sort((left, right) => right.count - left.count || left.name.localeCompare(right.name, language));
  }, [language, remoteProperties]);

  const goToExplore = (params?: Record<string, string>) =>
    router.push({ pathname: '/(main)/explore', params });

  if (isLoading && remoteProperties.length === 0) {
    return <HomeDataState loading title={t('loading')} />;
  }

  if (loadError && remoteProperties.length === 0) {
    return <HomeDataState title={t('networkError')} actionTitle={t('tryAgain')} onAction={() => void loadProperties()} />;
  }

  if (remoteProperties.length === 0) {
    return <HomeDataState title={t('noResults')} />;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 96 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => void loadProperties(true)}
            tintColor={colors.accent}
          />
        }
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

        <View style={styles.marketPickerRow}>
          <MarketPicker variant="compact" />
        </View>

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
            {HOME_CATEGORIES.map((category) => (
              <CategoryCard
                key={category.id}
                name={t(propertyTypePluralKey(category.id))}
                icon={category.icon}
                count={remoteProperties.filter((property) => property.type === category.id).length}
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
                <RemotePropertyPosterCard key={property.id} property={property} />
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
                <RemotePropertyCompactCard key={property.id} property={property} />
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
                <RemotePropertyCompactCard key={property.id} property={property} />
              ))}
            </ScrollView>
          </View>
        )}

        {/* ---------------------------------------- */}
        {/* HIGH POTENTIAL */}
        {/* ---------------------------------------- */}
        {highPotential.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title={t('highPotential')}
              subtitle={t('highPotentialSubtitle')}
              actionText={t('explore')}
              onActionPress={() => goToExplore()}
            />
            <View style={styles.list}>
              {highPotential.map((property) => (
                <RemotePropertyRow key={property.id} property={property} />
              ))}
            </View>
          </View>
        )}

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
                  key={city.slug}
                  name={city.name}
                  image={city.image}
                  count={city.count}
                  onPress={() => goToExplore({ city: city.slug })}
                />
              ))}
            </ScrollView>
          </View>
        )}

        <Text style={styles.footerNote} numberOfLines={2}>
          {remoteProperties.length} {t('objectsShort')}
        </Text>
      </ScrollView>
    </View>
  );
}

function HomeDataState({
  title,
  loading = false,
  actionTitle,
  onAction,
}: {
  title: string;
  loading?: boolean;
  actionTitle?: string;
  onAction?: () => void;
}) {
  const styles = useStyles();
  const { colors } = useTheme();

  return (
    <View style={[styles.container, styles.dataState]}>
      {loading ? <ActivityIndicator size="large" color={colors.accent} /> : <AppIcon name="warning" size="xl" color={colors.textMuted} />}
      <Text style={styles.dataStateTitle}>{title}</Text>
      {actionTitle && onAction && (
        <Button title={actionTitle} onPress={onAction} variant="secondary" size="md" fullWidth={false} />
      )}
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
  dataState: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.spacing.md,
    paddingHorizontal: t.spacing.section,
  },
  dataStateTitle: {
    ...t.typography.body,
    color: t.colors.textSecondary,
    textAlign: 'center',
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
  marketPickerRow: {
    alignItems: 'flex-start',
    paddingHorizontal: t.spacing.screenHorizontal,
    paddingVertical: t.spacing.md,
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
