/**
 * ============================================
 * FAVORITES SCREEN
 * ============================================
 *
 * Shows the properties the investor saved.
 *
 * Until a persisted favorites store exists (planned for a later phase),
 * the list is derived from the `favorite` flag already present on the
 * mock properties. The rendering path — header, count, list, empty
 * state — is the one the real store will plug into, so only the data
 * source has to change.
 *
 * TODO: Replace the mock source with a persisted favorites store
 * TODO: Support removing a property from this screen
 */

import { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { theme } from '@/theme';
import { featuredProperties, highYieldProperties, Property } from '@/constants/mockData';
import { AppIcon } from '@/components/ui/AppIcon';
import { HighYieldCard } from '@/components/home/HighYieldCard';
import { useLanguage } from '@/context/LanguageContext';

const ALL_PROPERTIES: Property[] = [
  ...featuredProperties,
  ...highYieldProperties.filter(
    (property) => !featuredProperties.some((featured) => featured.id === property.id)
  ),
];

export default function FavoritesScreen() {
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();

  const savedProperties = useMemo(
    () => ALL_PROPERTIES.filter((property) => property.favorite),
    []
  );

  const hasFavorites = savedProperties.length > 0;

  return (
    <View style={styles.container}>
      {/* Mobile header */}
      <Animated.View entering={FadeIn} style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.title}>{t('favoritesTitle')}</Text>
        <Text style={styles.subtitle}>{t('favoritesSubtitle')}</Text>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, !hasFavorites && styles.contentCentered]}
        showsVerticalScrollIndicator={false}
      >
        {hasFavorites ? (
          <>
            <Text style={styles.sectionLabel}>
              {t('savedProperties')} · {savedProperties.length}
            </Text>
            <View style={styles.list}>
              {savedProperties.map((property, index) => (
                <Animated.View key={property.id} entering={FadeInDown.delay(index * 60)}>
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
          </>
        ) : (
          <Animated.View entering={FadeInDown} style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <AppIcon name="favorite" size="xl" color={theme.colors.accent} />
            </View>
            <Text style={styles.emptyTitle}>{t('favoritesEmptyTitle')}</Text>
            <Text style={styles.emptySubtitle}>{t('favoritesEmptySubtitle')}</Text>

            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => router.navigate('/(main)/explore')}
              activeOpacity={0.9}
            >
              <Text style={styles.emptyButtonText}>{t('browseProperties')}</Text>
              <AppIcon name="arrowForward" size="sm" color={theme.colors.white} />
            </TouchableOpacity>
          </Animated.View>
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
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: theme.spacing.section,
  },
  contentCentered: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  sectionLabel: {
    ...theme.typography.label,
    color: theme.colors.textLight,
    paddingHorizontal: theme.spacing.screenHorizontal,
    paddingBottom: theme.spacing.smd,
  },
  list: {
    paddingHorizontal: theme.spacing.screenHorizontal,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.section,
    paddingBottom: theme.spacing.sectionLg,
  },
  emptyIcon: {
    width: 88,
    height: 88,
    borderRadius: theme.borderRadius.feature,
    backgroundColor: theme.colors.accentOverlay.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xl,
  },
  emptyTitle: {
    ...theme.typography.h3,
    color: theme.colors.textDark,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  emptySubtitle: {
    ...theme.typography.small,
    color: theme.colors.textLight,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.primary,
  },
  emptyButtonText: {
    ...theme.typography.small,
    fontWeight: '600',
    color: theme.colors.white,
  },
});
