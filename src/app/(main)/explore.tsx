/**
 * Remote catalogue exploration. Filters stay client-side while the catalogue
 * is small; the predicate lives in lib/properties so server filtering and
 * pagination can replace it later without distributing query logic to cards.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { AppIcon, BottomSheet, Button, Chip, MarketPicker, SheetOption } from '@/components/ui';
import { RemotePropertyRow } from '@/components/cards';
import { PropertyType } from '@/constants/mockData';
import { propertyTypePluralKey } from '@/constants/localizedData';
import { useLanguage } from '@/context/LanguageContext';
import { useMarket } from '@/context/MarketContext';
import { useTabReselect } from '@/context/TabRefreshContext';
import { makeStyles, useTheme } from '@/context/ThemeContext';
import {
  filterAndSortRemoteProperties,
  getPropertiesByCountry,
  getPublishedProperties,
  type RemotePropertyAmenity,
  type RemoteProperty,
  type RemotePropertySort,
} from '@/lib/properties';

type ListingStatus = RemoteProperty['status'];
type BedroomFilter = 'any' | 'studio' | 1 | 2 | 3 | 4 | 5;
type RoomFilter = 'any' | 1 | 2 | 3 | 4 | 5;

const BEDROOM_OPTIONS: BedroomFilter[] = ['any', 'studio', 1, 2, 3, 4, 5];
const BATHROOM_OPTIONS: RoomFilter[] = ['any', 1, 2, 3, 4, 5];
const SCORE_STEPS = [0, 75, 80, 85, 90] as const;
const ROI_STEPS = [0, 5, 6, 7] as const;
const AMENITIES: RemotePropertyAmenity[] = ['pool', 'security', 'garden', 'seaView', 'cityView'];

function isPropertyType(value: string | undefined): value is PropertyType {
  return value === 'apartment' || value === 'villa' || value === 'land' || value === 'commercial';
}

function parseNumber(value: string): number | null {
  const normalized = value.trim().replace(/[^0-9.,]/g, '').replace(',', '.');
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function formatFilterAmount(value: number, currency: string, language: string): string {
  return `${currency} ${new Intl.NumberFormat(language, { notation: 'compact', maximumFractionDigits: 1 }).format(value)}`;
}

function remotePropertyKey(property: RemoteProperty): string {
  return property.id;
}

export default function ExploreScreen() {
  return <ExploreContent />;
}

export function ExploreContent() {
  const styles = useStyles();
  const { colors } = useTheme();
  const { language, t } = useLanguage();
  const { selectedMarket } = useMarket();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ type?: string; city?: string; verified?: string }>();

  const [query, setQuery] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const listRef = useRef<FlatList<RemoteProperty>>(null);
  const requestId = useRef(0);
  const appliedInitialCity = useRef(false);
  const [remoteProperties, setRemoteProperties] = useState<RemoteProperty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Global market is intentionally not a property filter and Clear never changes it.
  const [countryCode, setCountryCode] = useState('all');
  const [cityId, setCityId] = useState('all');
  const [type, setType] = useState<PropertyType | 'all'>(isPropertyType(params.type) ? params.type : 'all');
  const [listingStatus, setListingStatus] = useState<ListingStatus | 'all'>('all');
  const [minPriceInput, setMinPriceInput] = useState('');
  const [maxPriceInput, setMaxPriceInput] = useState('');
  const [bedrooms, setBedrooms] = useState<BedroomFilter>('any');
  const [bathrooms, setBathrooms] = useState<RoomFilter>('any');
  const [minAreaInput, setMinAreaInput] = useState('');
  const [maxAreaInput, setMaxAreaInput] = useState('');
  const [amenities, setAmenities] = useState<RemotePropertyAmenity[]>([]);
  const [verifiedPartnerOnly, setVerifiedPartnerOnly] = useState(params.verified === '1');
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [minScore, setMinScore] = useState(0);
  const [minRoi, setMinRoi] = useState(0);
  const [sort, setSort] = useState<RemotePropertySort>('recommended');

  useTabReselect('explore', useCallback(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []));

  const loadProperties = useCallback(async (isPullToRefresh = false) => {
    const currentRequest = ++requestId.current;
    if (isPullToRefresh) setIsRefreshing(true);
    else setIsLoading(true);
    setLoadError(null);
    try {
      const data = selectedMarket
        ? await getPropertiesByCountry(selectedMarket, language)
        : await getPublishedProperties(language);
      if (requestId.current === currentRequest) setRemoteProperties(data);
    } catch (error) {
      if (requestId.current === currentRequest) setLoadError(error instanceof Error ? error.message : String(error));
    } finally {
      if (requestId.current === currentRequest) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, [language, selectedMarket]);

  useEffect(() => {
    void loadProperties();
    return () => { requestId.current += 1; };
  }, [loadProperties]);

  useEffect(() => {
    // A market switch cannot leave invalid country/city selections behind.
    setCountryCode('all');
    setCityId('all');
  }, [selectedMarket]);

  useEffect(() => {
    const requestedCity = params.city?.trim().toLowerCase();
    if (appliedInitialCity.current || !requestedCity || remoteProperties.length === 0) return;
    appliedInitialCity.current = true;
    const match = remoteProperties.find((property) => property.city.slug.toLowerCase() === requestedCity);
    if (match) setCityId(match.city.id);
  }, [params.city, remoteProperties]);

  const effectiveCountryCode = selectedMarket ?? (countryCode === 'all' ? null : countryCode);
  const scopedProperties = useMemo(() => remoteProperties.filter((property) => !effectiveCountryCode
    || property.country.code.toLowerCase() === effectiveCountryCode.toLowerCase()), [effectiveCountryCode, remoteProperties]);
  const priceScopedProperties = useMemo(
    () => scopedProperties.filter((property) => cityId === 'all' || property.city.id === cityId),
    [cityId, scopedProperties],
  );
  const listingCurrency = useMemo(() => {
    const currencies = new Set<RemoteProperty['priceCurrency']>();
    priceScopedProperties.forEach((property) => currencies.add(property.priceCurrency));
    return currencies.size === 1 ? Array.from(currencies)[0] : null;
  }, [priceScopedProperties]);
  const priceLabel = listingCurrency ?? t('comparableUsd');

  const countryOptions = useMemo(() => {
    const countries = new Map<string, { code: string; name: string }>();
    remoteProperties.forEach((property) => countries.set(property.country.code, { code: property.country.code, name: property.country.name }));
    return Array.from(countries.values()).sort((left, right) => left.name.localeCompare(right.name, language));
  }, [language, remoteProperties]);
  const cityOptions = useMemo(() => {
    const cities = new Map<string, { id: string; name: string }>();
    scopedProperties.forEach((property) => cities.set(property.city.id, { id: property.city.id, name: property.city.name }));
    return Array.from(cities.values()).sort((left, right) => left.name.localeCompare(right.name, language));
  }, [language, scopedProperties]);
  const typeOptions = useMemo(() => Array.from(new Set(scopedProperties.map((property) => property.type))) as PropertyType[], [scopedProperties]);
  const statusOptions = useMemo(() => Array.from(new Set(scopedProperties.map((property) => property.status))) as ListingStatus[], [scopedProperties]);
  const hasRoi = remoteProperties.some((property) => property.roi !== null);

  useEffect(() => {
    if (!hasRoi && sort === 'roi_high_to_low') setSort('recommended');
  }, [hasRoi, sort]);

  const minPrice = parseNumber(minPriceInput);
  const maxPrice = parseNumber(maxPriceInput);
  const minArea = parseNumber(minAreaInput);
  const maxArea = parseNumber(maxAreaInput);
  const results = useMemo(() => filterAndSortRemoteProperties(remoteProperties, {
    countryCode: effectiveCountryCode,
    cityId: cityId === 'all' ? null : cityId,
    propertyType: type === 'all' ? null : type,
    listingStatus: listingStatus === 'all' ? null : listingStatus,
    studioOnly: bedrooms === 'studio',
    minBedrooms: typeof bedrooms === 'number' ? bedrooms : null,
    minBathrooms: typeof bathrooms === 'number' ? bathrooms : null,
    minPrice: listingCurrency ? minPrice : null,
    maxPrice: listingCurrency ? maxPrice : null,
    priceCurrency: listingCurrency,
    minPriceUsd: listingCurrency ? null : minPrice,
    maxPriceUsd: listingCurrency ? null : maxPrice,
    minAreaSqm: minArea,
    maxAreaSqm: maxArea,
    amenities,
    verifiedPartnerOnly,
    featuredOnly,
    minInvestmentScore: minScore,
    minRoi,
    search: query,
  }, sort), [amenities, bathrooms, bedrooms, cityId, effectiveCountryCode, featuredOnly, listingCurrency, listingStatus, maxArea, maxPrice, minArea, minPrice, minRoi, minScore, query, remoteProperties, sort, type, verifiedPartnerOnly]);

  const clearFilters = useCallback(() => {
    setCountryCode('all'); setCityId('all'); setType('all'); setListingStatus('all');
    setMinPriceInput(''); setMaxPriceInput(''); setBedrooms('any'); setBathrooms('any');
    setMinAreaInput(''); setMaxAreaInput(''); setVerifiedPartnerOnly(false); setFeaturedOnly(false);
    setAmenities([]);
    setMinScore(0); setMinRoi(0);
  }, []);

  const activeFilterCount =
    (!selectedMarket && countryCode !== 'all' ? 1 : 0) + (cityId !== 'all' ? 1 : 0)
    + (type !== 'all' ? 1 : 0) + (listingStatus !== 'all' ? 1 : 0)
    + (minPrice !== null || maxPrice !== null ? 1 : 0) + (bedrooms !== 'any' ? 1 : 0)
    + (bathrooms !== 'any' ? 1 : 0) + (minArea !== null || maxArea !== null ? 1 : 0) + amenities.length
    + (verifiedPartnerOnly ? 1 : 0) + (featuredOnly ? 1 : 0) + (minScore > 0 ? 1 : 0) + (minRoi > 0 ? 1 : 0);

  const sortOptions = [
    { id: 'recommended' as const, label: t('sortRecommended') },
    { id: 'newest' as const, label: t('sortNewest') },
    { id: 'price_low_to_high' as const, label: t('sortPriceLow') },
    { id: 'price_high_to_low' as const, label: t('sortPriceHigh') },
    ...(hasRoi ? [{ id: 'roi_high_to_low' as const, label: t('sortHighestRoi') }] : []),
  ];
  const selectedSortLabel = sortOptions.find((option) => option.id === sort)?.label ?? t('sortRecommended');
  const activeChips = [
    !selectedMarket && countryCode !== 'all' ? { key: 'country', label: countryOptions.find((item) => item.code === countryCode)?.name ?? countryCode.toUpperCase(), clear: () => { setCountryCode('all'); setCityId('all'); } } : null,
    cityId !== 'all' ? { key: 'city', label: cityOptions.find((item) => item.id === cityId)?.name ?? t('city'), clear: () => setCityId('all') } : null,
    type !== 'all' ? { key: 'type', label: t(propertyTypePluralKey(type)), clear: () => setType('all') } : null,
    listingStatus !== 'all' ? { key: 'status', label: t(listingStatus), clear: () => setListingStatus('all') } : null,
    minPrice !== null || maxPrice !== null ? { key: 'price', label: `${minPrice === null ? '' : formatFilterAmount(minPrice, priceLabel, language)}${minPrice !== null && maxPrice !== null ? ' – ' : ''}${maxPrice === null ? '' : formatFilterAmount(maxPrice, priceLabel, language)}`, clear: () => { setMinPriceInput(''); setMaxPriceInput(''); } } : null,
    bedrooms !== 'any' ? { key: 'beds', label: bedrooms === 'studio' ? t('studio') : `${bedrooms}+ ${t('bedrooms')}`, clear: () => setBedrooms('any') } : null,
    bathrooms !== 'any' ? { key: 'baths', label: `${bathrooms}+ ${t('bathrooms')}`, clear: () => setBathrooms('any') } : null,
    minArea !== null || maxArea !== null ? { key: 'area', label: `${minArea ?? ''}${minArea !== null && maxArea !== null ? ' – ' : ''}${maxArea ?? ''} m²`, clear: () => { setMinAreaInput(''); setMaxAreaInput(''); } } : null,
    ...amenities.map((amenity) => ({ key: `amenity-${amenity}`, label: t(amenity), clear: () => setAmenities((current) => current.filter((item) => item !== amenity)) })),
    verifiedPartnerOnly ? { key: 'verified', label: t('verifiedOnly'), clear: () => setVerifiedPartnerOnly(false) } : null,
    featuredOnly ? { key: 'featured', label: t('featuredOnly'), clear: () => setFeaturedOnly(false) } : null,
    minScore > 0 ? { key: 'score', label: `${minScore}+ ${t('investmentScore')}`, clear: () => setMinScore(0) } : null,
    minRoi > 0 ? { key: 'roi', label: `${minRoi}%+ ROI`, clear: () => setMinRoi(0) } : null,
  ].filter((chip): chip is { key: string; label: string; clear: () => void } => chip !== null);

  const renderRemoteProperty = useCallback(({ item }: { item: RemoteProperty }) => (
    <View style={styles.list}><Animated.View entering={FadeInDown}><RemotePropertyRow property={item} /></Animated.View></View>
  ), [styles.list]);
  const renderEmpty = useCallback(() => {
    if (isLoading) return <View style={styles.empty}><ActivityIndicator size="large" color={colors.accent} /><Text style={styles.emptyTitle}>{t('loading')}</Text></View>;
    if (loadError) return <View style={styles.empty}><View style={styles.emptyIcon}><AppIcon name="error" size="xl" color={colors.textMuted} /></View><Text style={styles.emptyTitle}>{t('networkError')}</Text><Button title={t('tryAgain')} onPress={() => void loadProperties()} variant="secondary" size="md" fullWidth={false} style={styles.emptyButton} /></View>;
    return <View style={styles.empty}><View style={styles.emptyIcon}><AppIcon name="search" size="xl" color={colors.textMuted} /></View><Text style={styles.emptyTitle}>{t('noResults')}</Text><Text style={styles.emptyBody}>{t('noResultsSubtitle')}</Text><Button title={t('resetFilters')} onPress={() => { clearFilters(); setQuery(''); }} variant="secondary" size="md" fullWidth={false} style={styles.emptyButton} /></View>;
  }, [clearFilters, colors.accent, colors.textMuted, isLoading, loadError, loadProperties, styles, t]);

  return <View style={styles.container}>
    <Animated.View entering={FadeIn} style={[styles.header, { paddingTop: insets.top + 10 }]}>
      <Text style={styles.title}>{t('exploreTitle')}</Text><Text style={styles.subtitle}>{t('exploreSubtitle')}</Text>
      <View style={styles.searchField}><AppIcon name="search" size="sm" color={colors.textMuted} /><TextInput style={styles.searchInput} placeholder={t('searchPlaceholder')} placeholderTextColor={colors.textMuted} value={query} onChangeText={setQuery} autoCorrect={false} returnKeyType="search" />{query.length > 0 && <Pressable onPress={() => setQuery('')} hitSlop={10} accessibilityRole="button" accessibilityLabel={t('clearSearch')}><AppIcon name="close" size="sm" color={colors.textMuted} /></Pressable>}</View>
      <View style={styles.actionRow}>
        <Pressable onPress={() => setFiltersOpen(true)} accessibilityRole="button" accessibilityLabel={activeFilterCount ? `${t('filters')} (${activeFilterCount})` : t('filters')} style={({ pressed }) => [styles.actionButton, activeFilterCount > 0 && styles.actionButtonActive, pressed && styles.pressed]}><AppIcon name="filter" size="sm" color={activeFilterCount > 0 ? colors.onAccent : colors.text} /><Text style={[styles.actionButtonText, activeFilterCount > 0 && styles.actionButtonTextActive]}>{activeFilterCount ? `${t('filters')} (${activeFilterCount})` : t('filters')}</Text></Pressable>
        <Pressable onPress={() => setSortOpen(true)} accessibilityRole="button" accessibilityLabel={t('sort')} style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}><AppIcon name="sort" size="sm" color={colors.text} /><Text style={styles.actionButtonText}>{t('sort')}</Text></Pressable>
      </View>
    </Animated.View>
    <FlatList ref={listRef} data={results} renderItem={renderRemoteProperty} keyExtractor={remotePropertyKey} initialNumToRender={8} maxToRenderPerBatch={8} windowSize={7} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 96 }]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" refreshing={isRefreshing} onRefresh={() => void loadProperties(true)} ListHeaderComponent={<>
      <View style={styles.marketPickerRow}><MarketPicker variant="compact" /></View>
      {activeChips.length > 0 && <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.activeChipRow}>{activeChips.map((chip) => <Pressable key={chip.key} onPress={chip.clear} accessibilityRole="button" accessibilityLabel={`${chip.label}, ${t('close')}`} style={styles.activeChip}><Text style={styles.activeChipText} numberOfLines={1}>{chip.label}</Text><AppIcon name="close" size="xs" color={colors.onAccent} /></Pressable>)}</ScrollView>}
      <View style={styles.countRow}><Text style={styles.countText}>{results.length} {results.length === 1 ? t('propertyFound') : t('propertiesFound')} · {selectedSortLabel}</Text>{activeFilterCount > 0 && <Pressable onPress={clearFilters} hitSlop={8} accessibilityRole="button"><Text style={styles.resetText}>{t('resetFilters')}</Text></Pressable>}</View>
    </>} ListEmptyComponent={renderEmpty} ListFooterComponent={<View style={styles.listFooter} />} />

    <BottomSheet visible={filtersOpen} onClose={() => setFiltersOpen(false)} title={t('filters')} subtitle={`${results.length} ${t('propertiesFound')}`} footer={<View style={styles.sheetFooter}><Button title={t('resetFilters')} onPress={clearFilters} variant="secondary" size="md" style={styles.footerButton} /><Button title={`${t('showProperties')} (${results.length})`} onPress={() => setFiltersOpen(false)} variant="gold" size="md" style={styles.footerButton} /></View>}>
      {!selectedMarket && <><Text style={styles.groupLabel}>{t('countryFilter')}</Text><View style={styles.wrapRow}><Chip label={t('anyValue')} active={countryCode === 'all'} onPress={() => { setCountryCode('all'); setCityId('all'); }} style={styles.wrapChip} />{countryOptions.map((item) => <Chip key={item.code} label={item.name} active={countryCode === item.code} onPress={() => { setCountryCode(item.code); setCityId('all'); }} style={styles.wrapChip} />)}</View></>}
      <Text style={styles.groupLabel}>{t('cityFilter')}</Text><View style={styles.wrapRow}><Chip label={t('anyValue')} active={cityId === 'all'} onPress={() => setCityId('all')} style={styles.wrapChip} />{cityOptions.map((item) => <Chip key={item.id} label={item.name} active={cityId === item.id} onPress={() => setCityId(item.id)} style={styles.wrapChip} />)}</View>
      <Text style={styles.groupLabel}>{t('propertyTypeFilter')}</Text><View style={styles.wrapRow}><Chip label={t('anyValue')} active={type === 'all'} onPress={() => setType('all')} style={styles.wrapChip} />{typeOptions.map((item) => <Chip key={item} label={t(propertyTypePluralKey(item))} active={type === item} onPress={() => setType(item)} style={styles.wrapChip} />)}</View>
      <Text style={styles.groupLabel}>{t('listingStatusFilter')}</Text><View style={styles.wrapRow}><Chip label={t('anyValue')} active={listingStatus === 'all'} onPress={() => setListingStatus('all')} style={styles.wrapChip} />{statusOptions.map((item) => <Chip key={item} label={t(item)} active={listingStatus === item} onPress={() => setListingStatus(item)} style={styles.wrapChip} />)}</View>
      <Text style={styles.groupLabel}>{t('priceRange')} · {priceLabel}</Text><View style={styles.rangeRow}><TextInput value={minPriceInput} onChangeText={setMinPriceInput} placeholder={t('minValue')} placeholderTextColor={colors.textMuted} keyboardType="decimal-pad" style={styles.rangeInput} accessibilityLabel={`${t('minValue')} ${priceLabel}`} /><TextInput value={maxPriceInput} onChangeText={setMaxPriceInput} placeholder={t('maxValue')} placeholderTextColor={colors.textMuted} keyboardType="decimal-pad" style={styles.rangeInput} accessibilityLabel={`${t('maxValue')} ${priceLabel}`} /></View>
      <Text style={styles.groupLabel}>{t('bedrooms')}</Text><View style={styles.wrapRow}>{BEDROOM_OPTIONS.map((item) => <Chip key={String(item)} label={item === 'any' ? t('anyValue') : item === 'studio' ? t('studio') : item === 5 ? '5+' : `${item}+`} active={bedrooms === item} onPress={() => setBedrooms(item)} style={styles.wrapChip} />)}</View>
      <Text style={styles.groupLabel}>{t('bathrooms')}</Text><View style={styles.wrapRow}>{BATHROOM_OPTIONS.map((item) => <Chip key={String(item)} label={item === 'any' ? t('anyValue') : item === 5 ? '5+' : `${item}+`} active={bathrooms === item} onPress={() => setBathrooms(item)} style={styles.wrapChip} />)}</View>
      <Text style={styles.groupLabel}>{t('areaRange')} · m²</Text><View style={styles.rangeRow}><TextInput value={minAreaInput} onChangeText={setMinAreaInput} placeholder={t('minValue')} placeholderTextColor={colors.textMuted} keyboardType="decimal-pad" style={styles.rangeInput} accessibilityLabel={`${t('minValue')} ${t('area')}`} /><TextInput value={maxAreaInput} onChangeText={setMaxAreaInput} placeholder={t('maxValue')} placeholderTextColor={colors.textMuted} keyboardType="decimal-pad" style={styles.rangeInput} accessibilityLabel={`${t('maxValue')} ${t('area')}`} /></View>
      <Text style={styles.groupLabel}>{t('propertyFeatures')}</Text><View style={styles.wrapRow}>{AMENITIES.map((amenity) => <Chip key={amenity} label={t(amenity)} active={amenities.includes(amenity)} onPress={() => setAmenities((current) => current.includes(amenity) ? current.filter((item) => item !== amenity) : [...current, amenity])} style={styles.wrapChip} />)}</View>
      <Text style={styles.groupLabel}>{t('minInvestmentScore')}</Text><View style={styles.wrapRow}>{SCORE_STEPS.map((step) => <Chip key={step} label={step === 0 ? t('anyValue') : `${step}+`} active={minScore === step} onPress={() => setMinScore(step)} style={styles.wrapChip} />)}</View>
      {hasRoi && <><Text style={styles.groupLabel}>{t('minRoi')}</Text><View style={styles.wrapRow}>{ROI_STEPS.map((step) => <Chip key={step} label={step === 0 ? t('anyValue') : `${step}%+`} active={minRoi === step} onPress={() => setMinRoi(step)} style={styles.wrapChip} />)}</View></>}
      <Pressable onPress={() => setVerifiedPartnerOnly((current) => !current)} accessibilityRole="switch" accessibilityState={{ checked: verifiedPartnerOnly }} style={styles.toggleRow}><AppIcon name={verifiedPartnerOnly ? 'verified' : 'verifiedOutline'} size="md" color={verifiedPartnerOnly ? colors.success : colors.textMuted} /><Text style={styles.toggleLabel}>{t('verifiedOnly')}</Text><View style={[styles.switch, verifiedPartnerOnly && styles.switchOn]}><View style={[styles.knob, verifiedPartnerOnly && styles.knobOn]} /></View></Pressable>
      <Pressable onPress={() => setFeaturedOnly((current) => !current)} accessibilityRole="switch" accessibilityState={{ checked: featuredOnly }} style={styles.toggleRow}><AppIcon name="star" size="md" color={featuredOnly ? colors.accent : colors.textMuted} /><Text style={styles.toggleLabel}>{t('featuredOnly')}</Text><View style={[styles.switch, featuredOnly && styles.switchAccent]}><View style={[styles.knob, featuredOnly && styles.knobOn]} /></View></Pressable>
    </BottomSheet>
    <BottomSheet visible={sortOpen} onClose={() => setSortOpen(false)} title={t('sort')}>{sortOptions.map((option) => <SheetOption key={option.id} label={option.label} active={sort === option.id} onPress={() => { setSort(option.id); setSortOpen(false); }} />)}</BottomSheet>
  </View>;
}

const useStyles = makeStyles((t) => ({
  container: { flex: 1, backgroundColor: t.colors.background }, pressed: { opacity: 0.75 },
  header: { paddingHorizontal: t.spacing.screenHorizontal, paddingBottom: t.spacing.smd, backgroundColor: t.colors.background },
  title: { ...t.typography.h2, color: t.colors.text }, subtitle: { ...t.typography.caption, color: t.colors.textSecondary, marginTop: 2 },
  searchField: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.sm, height: 48, paddingHorizontal: t.spacing.smd, marginTop: t.spacing.smd, borderRadius: t.borderRadius.lg, backgroundColor: t.colors.surface, borderWidth: 1, borderColor: t.colors.border }, searchInput: { flex: 1, minWidth: 0, ...t.typography.small, color: t.colors.text, padding: 0 },
  actionRow: { flexDirection: 'row', gap: t.spacing.sm, marginTop: t.spacing.sm }, actionButton: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: t.spacing.xs, paddingHorizontal: t.spacing.smd, borderRadius: t.borderRadius.md, backgroundColor: t.colors.surface, borderWidth: 1, borderColor: t.colors.border }, actionButtonActive: { backgroundColor: t.colors.accent, borderColor: t.colors.accent }, actionButtonText: { ...t.typography.captionBold, color: t.colors.text }, actionButtonTextActive: { color: t.colors.onAccent },
  content: { paddingBottom: t.spacing.section }, marketPickerRow: { paddingHorizontal: t.spacing.screenHorizontal, paddingVertical: t.spacing.smd, alignItems: 'flex-start' }, activeChipRow: { gap: t.spacing.sm, paddingHorizontal: t.spacing.screenHorizontal, paddingBottom: t.spacing.smd }, activeChip: { flexDirection: 'row', alignItems: 'center', gap: 5, maxWidth: 210, paddingVertical: 7, paddingHorizontal: t.spacing.sm, borderRadius: t.borderRadius.full, backgroundColor: t.colors.accent }, activeChipText: { ...t.typography.tiny, color: t.colors.onAccent, flexShrink: 1 },
  countRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: t.spacing.sm, paddingHorizontal: t.spacing.screenHorizontal, paddingBottom: t.spacing.smd }, countText: { flex: 1, ...t.typography.caption, color: t.colors.textSecondary }, resetText: { ...t.typography.captionBold, color: t.colors.accent }, list: { paddingHorizontal: t.spacing.screenHorizontal }, listFooter: { height: t.spacing.smd },
  empty: { alignItems: 'center', paddingHorizontal: t.spacing.section, paddingTop: t.spacing.sectionLg }, emptyIcon: { width: 72, height: 72, borderRadius: t.borderRadius.hero, alignItems: 'center', justifyContent: 'center', backgroundColor: t.colors.surface, borderWidth: 1, borderColor: t.colors.border, marginBottom: t.spacing.lg }, emptyTitle: { ...t.typography.h4, color: t.colors.text, textAlign: 'center', marginBottom: t.spacing.xs }, emptyBody: { ...t.typography.small, color: t.colors.textSecondary, textAlign: 'center' }, emptyButton: { marginTop: t.spacing.lg },
  groupLabel: { ...t.typography.label, color: t.colors.textSecondary, paddingHorizontal: t.spacing.smd, marginTop: t.spacing.md, marginBottom: t.spacing.sm }, wrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.sm, paddingHorizontal: t.spacing.smd }, wrapChip: { marginBottom: 2 }, rangeRow: { flexDirection: 'row', gap: t.spacing.sm, paddingHorizontal: t.spacing.smd }, rangeInput: { flex: 1, minWidth: 0, height: 46, paddingHorizontal: t.spacing.smd, borderRadius: t.borderRadius.md, borderWidth: 1, borderColor: t.colors.border, backgroundColor: t.colors.surface, ...t.typography.small, color: t.colors.text },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.smd, minHeight: 56, paddingHorizontal: t.spacing.smd, marginTop: t.spacing.md, borderRadius: t.borderRadius.md, backgroundColor: t.colors.surfaceAlt }, toggleLabel: { flex: 1, minWidth: 0, ...t.typography.body, color: t.colors.text }, switch: { width: 46, height: 28, borderRadius: 14, padding: 3, justifyContent: 'center', backgroundColor: t.colors.borderStrong }, switchOn: { backgroundColor: t.colors.success }, switchAccent: { backgroundColor: t.colors.accent }, knob: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#FFFFFF' }, knobOn: { alignSelf: 'flex-end' }, sheetFooter: { flexDirection: 'row', gap: t.spacing.sm }, footerButton: { flex: 1 },
}));
