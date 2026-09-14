/**
 * ============================================
 * EXPLORE
 * ============================================
 *
 * Search and filter the whole catalogue.
 *
 * SEARCH matches remote title, city, country, partner and property type. The
 * data layer already resolves each remote translation for the active language
 * (and falls back to English), so searching works against the text on screen.
 *
 * FILTERS open in a bottom sheet (country, city, type, price band,
 * verified partners, minimum investment score) and the active count is
 * shown on the filter button so the user always knows the list is
 * narrowed.
 *
 * Deep links from Home arrive as params (`type`, `city`, `country`,
 * `verified`) and pre-apply the matching filter.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import {
  AppIcon,
  BottomSheet,
  Button,
  Chip,
  SheetOption,
} from '@/components/ui';
import { RemotePropertyRow } from '@/components/cards';
import { PropertyType } from '@/constants/mockData';
import {
  countryNameKey,
  propertyTypePluralKey,
} from '@/constants/localizedData';
import { useLanguage } from '@/context/LanguageContext';
import { useTabReselect } from '@/context/TabRefreshContext';
import { makeStyles, useTheme } from '@/context/ThemeContext';
import {
  filterAndSortRemoteProperties,
  getPublishedProperties,
  type RemoteProperty,
  type RemotePropertySort,
} from '@/lib/properties';

/**
 * Price bands use the database's derived USD comparison value.
 *
 * Bands rather than a slider: a slider would need another dependency and
 * would have to be re-scaled every time the display currency changes. Listing
 * cards still render the actual listing currency and never use these bands as
 * a display conversion.
 */
const PRICE_BANDS = [
  { id: 'any', min: 0, max: Infinity },
  { id: 'under500', min: 0, max: 500_000 },
  { id: 'mid', min: 500_000, max: 1_500_000 },
  { id: 'upper', min: 1_500_000, max: 3_000_000 },
  { id: 'prime', min: 3_000_000, max: Infinity },
] as const;

type PriceBandId = (typeof PRICE_BANDS)[number]['id'];

const SCORE_STEPS = [0, 85, 90, 93] as const;
const ROOM_STEPS = [0, 1, 2, 3, 4] as const;
const PROPERTY_TYPES: PropertyType[] = ['apartment', 'villa', 'land', 'commercial'];

export type SelectedCountryCode = 'sa' | 'ae' | null;

interface ExploreContentProps {
  /** Reserved for the upcoming global market selector. Null means all markets. */
  selectedCountryCode?: SelectedCountryCode;
}

function isPropertyType(value: string | undefined): value is PropertyType {
  return value !== undefined && PROPERTY_TYPES.includes(value as PropertyType);
}

function formatUsdFilterPrice(value: number): string {
  return `USD ${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value)}`;
}

function remotePropertyKey(property: RemoteProperty): string {
  return property.id;
}

export default function ExploreScreen() {
  return <ExploreContent />;
}

export function ExploreContent({ selectedCountryCode = null }: ExploreContentProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { language, t } = useLanguage();
  const insets = useSafeAreaInsets();

  const params = useLocalSearchParams<{
    type?: string;
    city?: string;
    country?: string;
    verified?: string;
  }>();

  const [query, setQuery] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const listRef = useRef<FlatList<RemoteProperty>>(null);
  const requestId = useRef(0);

  const [remoteProperties, setRemoteProperties] = useState<RemoteProperty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useTabReselect('explore', useCallback(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []));

  const [country, setCountry] = useState<string>(params.country ?? 'all');
  const [city, setCity] = useState<string>(params.city ?? 'all');
  const [type, setType] = useState<PropertyType | 'all'>(
    isPropertyType(params.type) ? params.type : 'all',
  );
  const [band, setBand] = useState<PriceBandId>('any');
  const [verifiedOnly, setVerifiedOnly] = useState(params.verified === '1');
  const [minScore, setMinScore] = useState<number>(0);
  const [minBedrooms, setMinBedrooms] = useState<number>(0);
  const [minBathrooms, setMinBathrooms] = useState<number>(0);
  const sort: RemotePropertySort = 'recommended';

  const loadProperties = useCallback(async (isPullToRefresh = false) => {
    const currentRequest = ++requestId.current;

    if (isPullToRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setLoadError(null);

    try {
      const data = await getPublishedProperties(language);
      if (requestId.current === currentRequest) {
        setRemoteProperties(data);
      }
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
  }, [language]);

  useEffect(() => {
    void loadProperties();

    return () => {
      requestId.current += 1;
    };
  }, [loadProperties]);

  const effectiveCountryCode = selectedCountryCode ?? (country === 'all' ? null : country);

  const activeFilterCount =
    (selectedCountryCode === null && country !== 'all' ? 1 : 0) +
    (city !== 'all' ? 1 : 0) +
    (type !== 'all' ? 1 : 0) +
    (band !== 'any' ? 1 : 0) +
    (verifiedOnly ? 1 : 0) +
    (minScore > 0 ? 1 : 0) +
    (minBedrooms > 0 ? 1 : 0) +
    (minBathrooms > 0 ? 1 : 0);

  const results = useMemo(() => {
    const selectedBand = PRICE_BANDS.find((item) => item.id === band) ?? PRICE_BANDS[0];

    return filterAndSortRemoteProperties(
      remoteProperties,
      {
        countryCode: effectiveCountryCode,
        citySlug: city === 'all' ? null : city,
        propertyType: type === 'all' ? null : type,
        minPriceUsd: selectedBand.min,
        maxPriceUsd: selectedBand.max === Infinity ? null : selectedBand.max,
        minBedrooms,
        minBathrooms,
        verifiedOnly,
        minInvestmentScore: minScore,
        search: query,
      },
      sort,
    );
  }, [
    band,
    city,
    effectiveCountryCode,
    minBathrooms,
    minBedrooms,
    minScore,
    query,
    remoteProperties,
    sort,
    type,
    verifiedOnly,
  ]);

  const marketOptions = useMemo(() => {
    const markets = new Map<string, { code: string; name: string; flag: string | null }>();
    remoteProperties.forEach((property) => {
      markets.set(property.country.code, {
        code: property.country.code,
        name: property.country.name,
        flag: property.country.flag,
      });
    });

    return [
      { code: 'all', name: t(countryNameKey('all')), flag: '🌍' },
      ...Array.from(markets.values()).sort((left, right) => left.name.localeCompare(right.name, language)),
    ];
  }, [language, remoteProperties, t]);

  const cityOptions = useMemo(() => {
    const cities = new Map<string, { slug: string; name: string }>();
    remoteProperties.forEach((property) => {
      if (!effectiveCountryCode || property.country.code === effectiveCountryCode) {
        cities.set(property.city.slug, { slug: property.city.slug, name: property.city.name });
      }
    });

    return Array.from(cities.values()).sort((left, right) => left.name.localeCompare(right.name, language));
  }, [effectiveCountryCode, language, remoteProperties]);

  const resetFilters = () => {
    setCountry('all');
    setCity('all');
    setType('all');
    setBand('any');
    setVerifiedOnly(false);
    setMinScore(0);
    setMinBedrooms(0);
    setMinBathrooms(0);
  };

  const bandLabel = (id: PriceBandId) => {
    const item = PRICE_BANDS.find((entry) => entry.id === id);
    if (!item || id === 'any') return t('anyValue');
    if (item.max === Infinity) return `${formatUsdFilterPrice(item.min)}+`;
    if (item.min === 0) return `${t('upTo')} ${formatUsdFilterPrice(item.max)}`;
    return `${formatUsdFilterPrice(item.min)} – ${formatUsdFilterPrice(item.max)}`;
  };

  const renderRemoteProperty = useCallback(
    ({ item }: { item: RemoteProperty }) => (
      <View style={styles.list}>
        <Animated.View entering={FadeInDown}>
          <RemotePropertyRow property={item} />
        </Animated.View>
      </View>
    ),
    [styles.list],
  );

  const renderEmpty = useCallback(() => {
    if (isLoading) {
      return (
        <View style={styles.empty}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.emptyTitle}>{t('loading')}</Text>
        </View>
      );
    }

    if (loadError) {
      return (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <AppIcon name="error" size="xl" color={colors.textMuted} />
          </View>
          <Text style={styles.emptyTitle} numberOfLines={2}>
            {t('networkError')}
          </Text>
          <Button
            title={t('tryAgain')}
            onPress={() => void loadProperties()}
            variant="secondary"
            size="md"
            fullWidth={false}
            style={styles.emptyButton}
          />
        </View>
      );
    }

    return (
      <View style={styles.empty}>
        <View style={styles.emptyIcon}>
          <AppIcon name="search" size="xl" color={colors.textMuted} />
        </View>
        <Text style={styles.emptyTitle} numberOfLines={2}>
          {t('noResults')}
        </Text>
        <Text style={styles.emptyBody} numberOfLines={3}>
          {t('noResultsSubtitle')}
        </Text>
        <Button
          title={t('resetFilters')}
          onPress={() => {
            resetFilters();
            setQuery('');
          }}
          variant="secondary"
          size="md"
          fullWidth={false}
          style={styles.emptyButton}
        />
      </View>
    );
  }, [colors.accent, colors.textMuted, isLoading, loadError, loadProperties, styles, t]);

  return (
    <View style={styles.container}>
      {/* ---------------------------------------- */}
      {/* HEADER + SEARCH */}
      {/* ---------------------------------------- */}
      <Animated.View entering={FadeIn} style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
          {t('exploreTitle')}
        </Text>
        <Text style={styles.subtitle} numberOfLines={2} ellipsizeMode="tail">
          {t('exploreSubtitle')}
        </Text>

        <View style={styles.searchRow}>
          <View style={styles.searchField}>
            <AppIcon name="search" size="sm" color={colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder={t('searchPlaceholder')}
              placeholderTextColor={colors.textMuted}
              value={query}
              onChangeText={setQuery}
              autoCorrect={false}
              returnKeyType="search"
              clearButtonMode="never"
            />
            {query.length > 0 && (
              <Pressable
                onPress={() => setQuery('')}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel={t('clearSearch')}
              >
                <AppIcon name="close" size="sm" color={colors.textMuted} />
              </Pressable>
            )}
          </View>

          <Pressable
            onPress={() => setFiltersOpen(true)}
            accessibilityRole="button"
            accessibilityLabel={t('filters')}
            style={({ pressed }) => [
              styles.filterButton,
              activeFilterCount > 0 && styles.filterButtonActive,
              pressed && styles.pressed,
            ]}
          >
            <AppIcon
              name="filter"
              size="md"
              color={activeFilterCount > 0 ? colors.onAccent : colors.text}
            />
            {activeFilterCount > 0 && (
              <View style={styles.filterCount}>
                <Text style={styles.filterCountText}>{activeFilterCount}</Text>
              </View>
            )}
          </Pressable>
        </View>
      </Animated.View>

      <FlatList
        ref={listRef}
        data={results}
        renderItem={renderRemoteProperty}
        keyExtractor={remotePropertyKey}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={7}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 96 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        refreshing={isRefreshing}
        onRefresh={() => void loadProperties(true)}
        ListHeaderComponent={
          <>
            {selectedCountryCode === null && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipRow}
              >
                {marketOptions.map((item) => (
                  <Chip
                    key={item.code}
                    label={item.name}
                    leading={item.flag ?? undefined}
                    active={country === item.code}
                    onPress={() => {
                      setCountry(item.code);
                      // A city from another country would zero the results.
                      setCity('all');
                    }}
                  />
                ))}
              </ScrollView>
            )}

            <View style={styles.countRow}>
              <Text style={styles.countText} numberOfLines={1}>
                {results.length} {results.length === 1 ? t('propertyFound') : t('propertiesFound')}
              </Text>
              {activeFilterCount > 0 && (
                <Pressable onPress={resetFilters} hitSlop={8} accessibilityRole="button">
                  <Text style={styles.resetText} numberOfLines={1}>
                    {t('resetFilters')}
                  </Text>
                </Pressable>
              )}
            </View>
          </>
        }
        ListEmptyComponent={renderEmpty}
        // Reserved for a page-loading indicator when server pagination is added.
        ListFooterComponent={<View style={styles.listFooter} />}
      />

      {/* ---------------------------------------- */}
      {/* FILTER SHEET */}
      {/* ---------------------------------------- */}
      <BottomSheet
        visible={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title={t('filters')}
        subtitle={`${results.length} ${t('propertiesFound')}`}
        footer={
          <View style={styles.sheetFooter}>
            <Button
              title={t('resetFilters')}
              onPress={resetFilters}
              variant="secondary"
              size="md"
              style={styles.footerButton}
            />
            <Button
              title={t('applyFilters')}
              onPress={() => setFiltersOpen(false)}
              variant="gold"
              size="md"
              style={styles.footerButton}
            />
          </View>
        }
      >
        {/* Country remains local only until a global market selector owns it. */}
        {selectedCountryCode === null && (
          <>
            <Text style={styles.groupLabel}>{t('countryFilter')}</Text>
            <View style={styles.wrapRow}>
              {marketOptions.map((item) => (
                <Chip
                  key={item.code}
                  label={item.name}
                  leading={item.flag ?? undefined}
                  active={country === item.code}
                  onPress={() => {
                    setCountry(item.code);
                    setCity('all');
                  }}
                  style={styles.wrapChip}
                />
              ))}
            </View>
          </>
        )}

        {/* City */}
        <Text style={styles.groupLabel}>{t('cityFilter')}</Text>
        <View style={styles.wrapRow}>
          <Chip
            label={t('anyValue')}
            active={city === 'all'}
            onPress={() => setCity('all')}
            style={styles.wrapChip}
          />
          {cityOptions.map((item) => (
            <Chip
              key={item.slug}
              label={item.name}
              active={city === item.slug}
              onPress={() => setCity(item.slug)}
              style={styles.wrapChip}
            />
          ))}
        </View>

        {/* Type */}
        <Text style={styles.groupLabel}>{t('propertyTypeFilter')}</Text>
        <View style={styles.wrapRow}>
          <Chip
            label={t('anyValue')}
            active={type === 'all'}
            onPress={() => setType('all')}
            style={styles.wrapChip}
          />
          {PROPERTY_TYPES.map((item) => (
            <Chip
              key={item}
              label={t(propertyTypePluralKey(item))}
              active={type === item}
              onPress={() => setType(item)}
              style={styles.wrapChip}
            />
          ))}
        </View>

        {/* Price bands use the database's USD comparison value. */}
        <Text style={styles.groupLabel}>
          {t('priceRange')} · USD
        </Text>
        {PRICE_BANDS.map((item) => (
          <SheetOption
            key={item.id}
            label={bandLabel(item.id)}
            active={band === item.id}
            onPress={() => setBand(item.id)}
          />
        ))}

        {/* Minimum bedrooms */}
        <Text style={styles.groupLabel}>{t('bedrooms')}</Text>
        <View style={styles.wrapRow}>
          {ROOM_STEPS.map((step) => (
            <Chip
              key={step}
              label={step === 0 ? t('anyValue') : `${step}+`}
              active={minBedrooms === step}
              onPress={() => setMinBedrooms(step)}
              style={styles.wrapChip}
            />
          ))}
        </View>

        {/* Minimum bathrooms */}
        <Text style={styles.groupLabel}>{t('bathrooms')}</Text>
        <View style={styles.wrapRow}>
          {ROOM_STEPS.map((step) => (
            <Chip
              key={step}
              label={step === 0 ? t('anyValue') : `${step}+`}
              active={minBathrooms === step}
              onPress={() => setMinBathrooms(step)}
              style={styles.wrapChip}
            />
          ))}
        </View>

        {/* Investment score */}
        <Text style={styles.groupLabel}>{t('minInvestmentScore')}</Text>
        <View style={styles.wrapRow}>
          {SCORE_STEPS.map((step) => (
            <Chip
              key={step}
              label={step === 0 ? t('anyValue') : `${step}+`}
              active={minScore === step}
              onPress={() => setMinScore(step)}
              style={styles.wrapChip}
            />
          ))}
        </View>

        {/* Verified partners */}
        <Pressable
          onPress={() => setVerifiedOnly((current) => !current)}
          accessibilityRole="switch"
          accessibilityState={{ checked: verifiedOnly }}
          style={styles.toggleRow}
        >
          <AppIcon
            name={verifiedOnly ? 'verified' : 'verifiedOutline'}
            size="md"
            color={verifiedOnly ? colors.success : colors.textMuted}
          />
          <Text style={styles.toggleLabel} numberOfLines={2}>
            {t('verifiedOnly')}
          </Text>
          <View style={[styles.switch, verifiedOnly && styles.switchOn]}>
            <View style={[styles.knob, verifiedOnly && styles.knobOn]} />
          </View>
        </Pressable>
      </BottomSheet>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  container: {
    flex: 1,
    backgroundColor: t.colors.background,
  },
  pressed: {
    opacity: 0.75,
  },

  header: {
    paddingHorizontal: t.spacing.screenHorizontal,
    paddingBottom: t.spacing.smd,
    backgroundColor: t.colors.background,
  },
  title: {
    ...t.typography.h2,
    color: t.colors.text,
  },
  subtitle: {
    ...t.typography.caption,
    color: t.colors.textSecondary,
    marginTop: 2,
  },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.sm,
    marginTop: t.spacing.smd,
  },
  searchField: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.sm,
    height: 48,
    paddingHorizontal: t.spacing.smd,
    borderRadius: t.borderRadius.lg,
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    ...t.typography.small,
    color: t.colors.text,
    padding: 0,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: t.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  filterButtonActive: {
    backgroundColor: t.colors.accent,
    borderColor: t.colors.accent,
  },
  filterCount: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 3,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: t.colors.primary,
  },
  filterCountText: {
    ...t.typography.tiny,
    fontSize: 9,
    lineHeight: 12,
    color: t.colors.onPrimary,
  },

  content: {
    paddingBottom: t.spacing.section,
  },
  chipRow: {
    paddingHorizontal: t.spacing.screenHorizontal,
    paddingVertical: t.spacing.smd,
    gap: t.spacing.sm,
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing.sm,
    paddingHorizontal: t.spacing.screenHorizontal,
    paddingBottom: t.spacing.smd,
  },
  countText: {
    flexShrink: 1,
    minWidth: 0,
    ...t.typography.caption,
    color: t.colors.textSecondary,
  },
  resetText: {
    ...t.typography.captionBold,
    color: t.colors.accent,
  },
  list: {
    paddingHorizontal: t.spacing.screenHorizontal,
  },
  listFooter: {
    height: t.spacing.smd,
  },

  empty: {
    alignItems: 'center',
    paddingHorizontal: t.spacing.section,
    paddingTop: t.spacing.sectionLg,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: t.borderRadius.hero,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
    marginBottom: t.spacing.lg,
  },
  emptyTitle: {
    ...t.typography.h4,
    color: t.colors.text,
    textAlign: 'center',
    marginBottom: t.spacing.xs,
  },
  emptyBody: {
    ...t.typography.small,
    color: t.colors.textSecondary,
    textAlign: 'center',
  },
  emptyButton: {
    marginTop: t.spacing.lg,
  },

  // ---- Filter sheet ----
  groupLabel: {
    ...t.typography.label,
    color: t.colors.textSecondary,
    paddingHorizontal: t.spacing.smd,
    marginTop: t.spacing.md,
    marginBottom: t.spacing.sm,
  },
  wrapRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: t.spacing.sm,
    paddingHorizontal: t.spacing.smd,
  },
  wrapChip: {
    marginBottom: 2,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.smd,
    minHeight: 56,
    paddingHorizontal: t.spacing.smd,
    marginTop: t.spacing.md,
    borderRadius: t.borderRadius.md,
    backgroundColor: t.colors.surfaceAlt,
  },
  toggleLabel: {
    flex: 1,
    minWidth: 0,
    ...t.typography.body,
    color: t.colors.text,
  },
  switch: {
    width: 46,
    height: 28,
    borderRadius: 14,
    padding: 3,
    justifyContent: 'center',
    backgroundColor: t.colors.borderStrong,
  },
  switchOn: {
    backgroundColor: t.colors.success,
  },
  knob: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
  },
  knobOn: {
    alignSelf: 'flex-end',
  },
  sheetNote: {
    ...t.typography.tiny,
    color: t.colors.textMuted,
    paddingHorizontal: t.spacing.smd,
    paddingTop: t.spacing.smd,
  },
  sheetFooter: {
    flexDirection: 'row',
    gap: t.spacing.sm,
  },
  footerButton: {
    flex: 1,
  },
}));
