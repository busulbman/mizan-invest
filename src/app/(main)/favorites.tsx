/**
 * ============================================
 * FAVORITES
 * ============================================
 *
 * Saved listings, read straight from the shared favourites store. Saving
 * a listing anywhere — a Home card, an Explore row, the detail header,
 * the sticky CTA or a reel — makes it appear here immediately, and
 * unsaving it here removes the highlight everywhere else.
 */

import { ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { AppIcon, Button } from '@/components/ui';
import { PropertyRow } from '@/components/cards';
import { getPropertiesByIds } from '@/constants/mockData';
import { useFavorites } from '@/context/FavoritesContext';
import { useLanguage } from '@/context/LanguageContext';
import { makeStyles, useTheme } from '@/context/ThemeContext';

export default function FavoritesScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const { favoriteIds } = useFavorites();

  // Ids drive the order, so the most recently saved listing sits on top
  const saved = getPropertiesByIds(favoriteIds);
  const hasFavorites = saved.length > 0;

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeIn} style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
          {t('favoritesTitle')}
        </Text>
        <Text style={styles.subtitle} numberOfLines={2} ellipsizeMode="tail">
          {t('favoritesSubtitle')}
        </Text>
      </Animated.View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          !hasFavorites && styles.contentCentered,
          { paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {hasFavorites ? (
          <>
            <Text style={styles.countLabel} numberOfLines={1}>
              {t('savedProperties')} · {saved.length}
            </Text>
            <View style={styles.list}>
              {saved.map((property, index) => (
                <Animated.View key={property.id} entering={FadeInDown.delay(index * 45)}>
                  <PropertyRow property={property} />
                </Animated.View>
              ))}
            </View>
          </>
        ) : (
          <Animated.View entering={FadeInDown} style={styles.empty}>
            <View style={styles.emptyIcon}>
              <AppIcon name="favorite" size="xl" color={colors.accent} />
            </View>
            <Text style={styles.emptyTitle} numberOfLines={2}>
              {t('favoritesEmptyTitle')}
            </Text>
            <Text style={styles.emptyBody} numberOfLines={3}>
              {t('favoritesEmptySubtitle')}
            </Text>
            <Button
              title={t('browseProperties')}
              onPress={() => router.navigate('/(main)/explore')}
              variant="gold"
              size="md"
              iconRight="arrowForward"
              fullWidth={false}
              style={styles.emptyButton}
            />
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  container: {
    flex: 1,
    backgroundColor: t.colors.background,
  },
  header: {
    paddingHorizontal: t.spacing.screenHorizontal,
    paddingBottom: t.spacing.smd,
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
  content: {
    paddingBottom: t.spacing.section,
  },
  contentCentered: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  countLabel: {
    ...t.typography.label,
    color: t.colors.textSecondary,
    paddingHorizontal: t.spacing.screenHorizontal,
    paddingBottom: t.spacing.smd,
  },
  list: {
    paddingHorizontal: t.spacing.screenHorizontal,
  },

  empty: {
    alignItems: 'center',
    paddingHorizontal: t.spacing.section,
    paddingBottom: t.spacing.sectionLg,
  },
  emptyIcon: {
    width: 84,
    height: 84,
    borderRadius: t.borderRadius.feature,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: t.colors.accentOverlay.light,
    marginBottom: t.spacing.lg,
  },
  emptyTitle: {
    ...t.typography.h3,
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
}));
