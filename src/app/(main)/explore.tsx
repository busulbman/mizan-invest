/**
 * ============================================
 * EXPLORE SCREEN
 * ============================================
 *
 * Search and browse all mock listings.
 * Sections: mobile header, search field, country chips, result list.
 *
 * Unlike the Home screen the country chips here actually filter the
 * list, so the demo has one place where filtering visibly works.
 *
 * TODO: Connect to backend search API
 * TODO: Add category / price / ROI filters
 */

import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { theme } from '@/theme';
import {
  countries,
  featuredProperties,
  highYieldProperties,
  Property,
} from '@/constants/mockData';
import { countryNameKey } from '@/constants/localizedData';
import { AppIcon } from '@/components/ui/AppIcon';
import { HighYieldCard } from '@/components/home/HighYieldCard';
import { useLanguage } from '@/context/LanguageContext';

/** All demo listings, de-duplicated by id */
const ALL_PROPERTIES: Property[] = [
  ...featuredProperties,
  ...highYieldProperties.filter(
    (property) => !featuredProperties.some((featured) => featured.id === property.id)
  ),
];

export default function ExploreScreen() {
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('all');

  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return ALL_PROPERTIES.filter((property) => {
      const matchesCountry =
        selectedCountry === 'all' ||
        property.countryCode.toLowerCase() === selectedCountry.toLowerCase();

      if (!matchesCountry) {
        return false;
      }

      if (normalizedQuery.length === 0) {
        return true;
      }

      return [property.title, property.city, property.country, property.location]
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [query, selectedCountry]);

  return (
    <View style={styles.container}>
      {/* Mobile header */}
      <Animated.View entering={FadeIn} style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.title}>{t('exploreTitle')}</Text>
        <Text style={styles.subtitle}>{t('exploreSubtitle')}</Text>

        {/* Search field */}
        <View style={styles.searchField}>
          <AppIcon name="search" size="md" color={theme.colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('searchPlaceholder')}
            placeholderTextColor={theme.colors.textMuted}
            value={query}
            onChangeText={setQuery}
            autoCorrect={false}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity
              onPress={() => setQuery('')}
              accessibilityRole="button"
              accessibilityLabel={t('clearSearch')}
              hitSlop={8}
            >
              <AppIcon name="close" size="sm" color={theme.colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Country chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.countryContainer}
        >
          {countries.map((country) => {
            const isActive = selectedCountry === country.id;
            return (
              <TouchableOpacity
                key={country.id}
                style={[styles.countryChip, isActive && styles.countryChipActive]}
                onPress={() => setSelectedCountry(country.id)}
                activeOpacity={0.8}
              >
                <Text style={styles.countryFlag}>{country.flag}</Text>
                <Text style={[styles.countryName, isActive && styles.countryNameActive]}>
                  {t(countryNameKey(country.id))}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Result count */}
        <Text style={styles.resultCount}>
          {results.length} {results.length === 1 ? t('propertyFound') : t('propertiesFound')}
        </Text>

        {/* Results */}
        {results.length > 0 ? (
          <View style={styles.results}>
            {results.map((property, index) => (
              <Animated.View
                key={property.id}
                entering={FadeInDown.delay(Math.min(index, 6) * 60)}
              >
                <HighYieldCard
                  id={property.id}
                  title={property.title}
                  location={property.location}
                  price={property.price}
                  roi={property.roi}
                  image={property.image}
                  onPress={() => router.push(`/(main)/property/${property.id}`)}
                />
              </Animated.View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <AppIcon name="search" size="xl" color={theme.colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>{t('noResults')}</Text>
            <Text style={styles.emptySubtitle}>{t('noResultsSubtitle')}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: theme.spacing.screenHorizontal,
    paddingBottom: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.textDark,
  },
  subtitle: {
    ...theme.typography.small,
    color: theme.colors.textLight,
    marginTop: 2,
  },
  searchField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    height: 48,
    marginTop: theme.spacing.md,
  },
  searchInput: {
    flex: 1,
    ...theme.typography.small,
    color: theme.colors.textDark,
    padding: 0,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: theme.spacing.section,
  },
  countryContainer: {
    paddingHorizontal: theme.spacing.screenHorizontal,
    paddingVertical: theme.spacing.sm,
  },
  countryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.full,
    marginRight: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
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
  resultCount: {
    ...theme.typography.caption,
    color: theme.colors.textLight,
    paddingHorizontal: theme.spacing.screenHorizontal,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.smd,
  },
  results: {
    paddingHorizontal: theme.spacing.screenHorizontal,
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.section,
    paddingTop: theme.spacing.sectionLg,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: theme.borderRadius.hero,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },
  emptyTitle: {
    ...theme.typography.h4,
    color: theme.colors.textDark,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...theme.typography.small,
    color: theme.colors.textLight,
    textAlign: 'center',
  },
});
