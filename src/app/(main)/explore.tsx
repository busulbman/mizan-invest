/**
 * ============================================
 * EXPLORE
 * ============================================
 *
 * Search and filter the whole catalogue.
 *
 * SEARCH actually matches — across the translated listing title, city,
 * country, partner name and property type. Because titles are stored as
 * translation keys, matching runs against the *rendered* text, so typing
 * "Медина" finds the Madinah listings while the app is in Russian and
 * "Madinah" finds them in English.
 *
 * FILTERS open in a bottom sheet (country, city, type, price band,
 * verified partners, minimum investment score) and the active count is
 * shown on the filter button so the user always knows the list is
 * narrowed.
 *
 * Deep links from Home arrive as params (`type`, `city`, `country`,
 * `verified`) and pre-apply the matching filter.
 */

import { useCallback, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
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
import { PropertyRow } from '@/components/cards';
import {
  CityId,
  PropertyType,
  cities,
  countries,
  getPartnerById,
  properties,
} from '@/constants/mockData';
import {
  cityNameKey,
  countryNameKey,
  propertyTypePluralKey,
} from '@/constants/localizedData';
import { useCurrency } from '@/context/CurrencyContext';
import { useLanguage } from '@/context/LanguageContext';
import { useTabReselect } from '@/context/TabRefreshContext';
import { makeStyles, useTheme } from '@/context/ThemeContext';

/**
 * Price bands in USD.
 *
 * Bands rather than a slider: a slider would need another dependency and
 * would have to be re-scaled every time the display currency changes.
 * Bands convert cleanly and read well in all four languages.
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

export default function ExploreScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { price, priceFull } = useCurrency();
  const insets = useSafeAreaInsets();

  const params = useLocalSearchParams<{
    type?: string;
    city?: string;
    country?: string;
    verified?: string;
  }>();

  const [query, setQuery] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useTabReselect('explore', useCallback(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, []));

  const [country, setCountry] = useState<string>(params.country ?? 'all');
  const [city, setCity] = useState<CityId | 'all'>((params.city as CityId) ?? 'all');
  const [type, setType] = useState<PropertyType | 'all'>((params.type as PropertyType) ?? 'all');
  const [band, setBand] = useState<PriceBandId>('any');
  const [verifiedOnly, setVerifiedOnly] = useState(params.verified === '1');
  const [minScore, setMinScore] = useState<number>(0);

  const activeFilterCount =
    (country !== 'all' ? 1 : 0) +
    (city !== 'all' ? 1 : 0) +
    (type !== 'all' ? 1 : 0) +
    (band !== 'any' ? 1 : 0) +
    (verifiedOnly ? 1 : 0) +
    (minScore > 0 ? 1 : 0);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const selectedBand = PRICE_BANDS.find((item) => item.id === band) ?? PRICE_BANDS[0];

    return properties.filter((property) => {
      if (country !== 'all' && property.countryCode !== country) return false;
      if (city !== 'all' && property.cityId !== city) return false;
      if (type !== 'all' && property.type !== type) return false;
      if (verifiedOnly && !property.verified) return false;
      if (property.investmentScore < minScore) return false;
      if (property.price < selectedBand.min || property.price > selectedBand.max) return false;

      if (needle.length === 0) return true;

      // Match the text the user can actually see, in the active language
      const partner = getPartnerById(property.partnerId);
      const haystack = [
        t(property.titleKey),
        t(cityNameKey(property.cityId)),
        t(countryNameKey(property.countryCode)),
        t(propertyTypePluralKey(property.type)),
        partner?.name ?? '',
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(needle);
    });
  }, [query, country, city, type, band, verifiedOnly, minScore, t]);

  const resetFilters = () => {
    setCountry('all');
    setCity('all');
    setType('all');
    setBand('any');
    setVerifiedOnly(false);
    setMinScore(0);
  };

  const bandLabel = (id: PriceBandId) => {
    const item = PRICE_BANDS.find((entry) => entry.id === id);
    if (!item || id === 'any') return t('anyValue');
    if (item.max === Infinity) return `${price(item.min)}+`;
    if (item.min === 0) return `${t('upTo')} ${price(item.max)}`;
    return `${price(item.min)} – ${price(item.max)}`;
  };

  // Cities offered in the sheet follow the selected country
  const cityOptions = cities.filter((item) => country === 'all' || item.countryCode === country);

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

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 96 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {/* Country quick filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {countries.map((item) => (
            <Chip
              key={item.id}
              label={t(countryNameKey(item.id))}
              leading={item.flag}
              active={country === item.id}
              onPress={() => {
                setCountry(item.id);
                // A city from another country would zero the results
                setCity('all');
              }}
            />
          ))}
        </ScrollView>

        <View style={styles.countRow}>
          <Text style={styles.countText} numberOfLines={1}>
            {results.length}{' '}
            {results.length === 1 ? t('propertyFound') : t('propertiesFound')}
          </Text>
          {activeFilterCount > 0 && (
            <Pressable onPress={resetFilters} hitSlop={8} accessibilityRole="button">
              <Text style={styles.resetText} numberOfLines={1}>
                {t('resetFilters')}
              </Text>
            </Pressable>
          )}
        </View>

        {results.length > 0 ? (
          <View style={styles.list}>
            {results.map((property, index) => (
              <Animated.View
                key={property.id}
                entering={FadeInDown.delay(Math.min(index, 6) * 45)}
              >
                <PropertyRow property={property} />
              </Animated.View>
            ))}
          </View>
        ) : (
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
        )}
      </ScrollView>

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
        {/* Country */}
        <Text style={styles.groupLabel}>{t('countryFilter')}</Text>
        <View style={styles.wrapRow}>
          {countries.map((item) => (
            <Chip
              key={item.id}
              label={t(countryNameKey(item.id))}
              leading={item.flag}
              active={country === item.id}
              onPress={() => {
                setCountry(item.id);
                setCity('all');
              }}
              style={styles.wrapChip}
            />
          ))}
        </View>

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
              key={item.id}
              label={t(cityNameKey(item.id))}
              active={city === item.id}
              onPress={() => setCity(item.id)}
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
          {(['apartment', 'villa', 'land', 'commercial'] as PropertyType[]).map((item) => (
            <Chip
              key={item}
              label={t(propertyTypePluralKey(item))}
              active={type === item}
              onPress={() => setType(item)}
              style={styles.wrapChip}
            />
          ))}
        </View>

        {/* Price band — labelled in the active display currency */}
        <Text style={styles.groupLabel}>
          {t('priceRange')} · {t('demoExchangeRate')}
        </Text>
        {PRICE_BANDS.map((item) => (
          <SheetOption
            key={item.id}
            label={bandLabel(item.id)}
            active={band === item.id}
            onPress={() => setBand(item.id)}
          />
        ))}

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

        {/* Currency reminder — the bands above are shown converted */}
        <Text style={styles.sheetNote} numberOfLines={2}>
          {t('demoRateNote')} {priceFull(1_000_000)}
        </Text>
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
