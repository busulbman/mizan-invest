/**
 * ============================================
 * PROPERTY CARDS
 * ============================================
 *
 * Three shapes, one data source:
 *
 *   PropertyPosterCard  — tall photo card for the featured rail
 *   PropertyCompactCard — small photo card for secondary rails
 *   PropertyRow         — full-width list row (Explore, Favorites)
 *
 * OVERFLOW RULES APPLIED THROUGHOUT
 * - Titles are capped at two lines, locations at one.
 * - The price and the ROI badge share a row: the price gets
 *   `flexShrink: 1` + `numberOfLines={1}`, the badge gets
 *   `flexShrink: 0`. A nine-digit rouble figure therefore ellipsises
 *   instead of pushing the badge outside the card.
 * - Card widths are derived from screen width, so an iPhone SE gets a
 *   narrower card rather than a clipped one.
 */

import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { FavoriteButton } from './FavoriteButton';
import { AppIcon } from '@/components/ui/AppIcon';
import { Badge } from '@/components/ui/Badge';
import { RemoteImage } from '@/components/ui/RemoteImage';
import { Property, formatROI } from '@/constants/mockData';
import { cityNameKey, locationLabel, propertyTypeKey } from '@/constants/localizedData';
import { useCurrency } from '@/context/CurrencyContext';
import { useLanguage } from '@/context/LanguageContext';
import { makeStyles, useTheme } from '@/context/ThemeContext';

function openProperty(id: string) {
  router.push(`/(main)/property/${id}`);
}

// ============================================
// POSTER CARD — featured rail
// ============================================

export function PropertyPosterCard({ property }: { property: Property }) {
  const styles = useStyles();
  const { gradients, colors } = useTheme();
  const { t } = useLanguage();
  const { price } = useCurrency();

  return (
    <Pressable
      onPress={() => openProperty(property.id)}
      accessibilityRole="button"
      accessibilityLabel={t(property.titleKey)}
      style={({ pressed }) => [styles.poster, pressed && styles.pressed]}
    >
      <RemoteImage uri={property.image} style={styles.posterImage} />

      <LinearGradient colors={gradients.darkOverlay} locations={[0.3, 0.6, 1]} style={styles.posterOverlay}>
        <View style={styles.posterTop}>
          {property.verified && (
            <Badge label={t('verified')} tone="onImage" icon="verified" small />
          )}
          <FavoriteButton propertyId={property.id} size={38} />
        </View>

        <View style={styles.posterBottom}>
          <Text style={styles.posterTitle} numberOfLines={2} ellipsizeMode="tail">
            {t(property.titleKey)}
          </Text>

          <View style={styles.locationRow}>
            <AppIcon name="location" size="xs" color={colors.onDarkMuted} />
            <Text style={styles.posterLocation} numberOfLines={1} ellipsizeMode="tail">
              {locationLabel(t, property.cityId, property.countryCode)}
            </Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.posterPrice} numberOfLines={1} ellipsizeMode="tail">
              {price(property.price)}
            </Text>
            <View style={styles.roiPill}>
              <AppIcon name="trendUp" size="xs" color={colors.accent} />
              <Text style={styles.roiText} numberOfLines={1}>
                {formatROI(property.roi)}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

// ============================================
// COMPACT CARD — secondary rails
// ============================================

export function PropertyCompactCard({ property }: { property: Property }) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { price } = useCurrency();

  return (
    <Pressable
      onPress={() => openProperty(property.id)}
      accessibilityRole="button"
      accessibilityLabel={t(property.titleKey)}
      style={({ pressed }) => [styles.compact, pressed && styles.pressed]}
    >
      <View style={styles.compactImageWrap}>
        <RemoteImage uri={property.image} style={styles.compactImage} />
        <FavoriteButton propertyId={property.id} size={34} style={styles.compactFavorite} />
      </View>

      <View style={styles.compactBody}>
        <Text style={styles.compactTitle} numberOfLines={2} ellipsizeMode="tail">
          {t(property.titleKey)}
        </Text>

        <View style={styles.locationRow}>
          <AppIcon name="location" size="xs" color={colors.textMuted} />
          <Text style={styles.compactLocation} numberOfLines={1} ellipsizeMode="tail">
            {t(cityNameKey(property.cityId))}
          </Text>
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.compactPrice} numberOfLines={1} ellipsizeMode="tail">
            {price(property.price)}
          </Text>
          <Text style={styles.compactRoi} numberOfLines={1}>
            {formatROI(property.roi)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

// ============================================
// LIST ROW — Explore, Favorites, vertical lists
// ============================================

export function PropertyRow({ property }: { property: Property }) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { price } = useCurrency();

  return (
    <Pressable
      onPress={() => openProperty(property.id)}
      accessibilityRole="button"
      accessibilityLabel={t(property.titleKey)}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <RemoteImage uri={property.image} style={styles.rowImage} borderRadius={14} />

      <View style={styles.rowBody}>
        <View style={styles.rowHeader}>
          <Text style={styles.rowTitle} numberOfLines={2} ellipsizeMode="tail">
            {t(property.titleKey)}
          </Text>
          <FavoriteButton propertyId={property.id} variant="plain" size={32} />
        </View>

        <View style={styles.locationRow}>
          <AppIcon name="location" size="xs" color={colors.textMuted} />
          <Text style={styles.rowLocation} numberOfLines={1} ellipsizeMode="tail">
            {locationLabel(t, property.cityId, property.countryCode)}
          </Text>
        </View>

        <View style={styles.rowFooter}>
          <Text style={styles.rowPrice} numberOfLines={1} ellipsizeMode="tail">
            {price(property.price)}
          </Text>
          <View style={styles.rowMeta}>
            <Badge label={t(propertyTypeKey(property.type))} tone="neutral" small />
            <Badge label={formatROI(property.roi)} tone="success" icon="trendUp" small />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const useStyles = makeStyles((t) => {
  // Rail cards peek the next card, which reads as native and tells the
  // user the row scrolls without needing an affordance.
  const posterWidth = Math.min(300, t.metrics.screenWidth * 0.76);
  const compactWidth = Math.min(190, t.metrics.screenWidth * 0.48);

  return {
    pressed: {
      opacity: 0.9,
      transform: [{ scale: 0.99 }],
    },

    // ---- Poster ----
    poster: {
      width: posterWidth,
      height: 300,
      borderRadius: t.borderRadius.hero,
      overflow: 'hidden',
      marginRight: t.spacing.smd,
      backgroundColor: t.colors.surfaceAlt,
      ...t.shadows.floating,
    },
    posterImage: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    posterOverlay: {
      flex: 1,
      justifyContent: 'space-between',
      padding: t.spacing.md,
    },
    posterTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: t.spacing.sm,
    },
    posterBottom: {
      gap: 4,
    },
    posterTitle: {
      ...t.typography.h4,
      color: t.colors.onDark,
    },
    posterLocation: {
      flexShrink: 1,
      minWidth: 0,
      ...t.typography.caption,
      color: t.colors.onDarkMuted,
    },
    posterPrice: {
      flexShrink: 1,
      minWidth: 0,
      ...t.typography.price,
      color: t.colors.onDark,
    },

    // ---- Compact ----
    compact: {
      width: compactWidth,
      marginRight: t.spacing.smd,
      borderRadius: t.borderRadius.xl,
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.colors.border,
      overflow: 'hidden',
      ...t.shadows.card,
    },
    compactImageWrap: {
      height: 120,
    },
    compactImage: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    compactFavorite: {
      position: 'absolute',
      top: 8,
      right: 8,
    },
    compactBody: {
      padding: t.spacing.smd,
      gap: 3,
    },
    compactTitle: {
      ...t.typography.captionBold,
      color: t.colors.text,
      minHeight: 36,
    },
    compactLocation: {
      flexShrink: 1,
      minWidth: 0,
      ...t.typography.tiny,
      color: t.colors.textMuted,
    },
    compactPrice: {
      flexShrink: 1,
      minWidth: 0,
      ...t.typography.bodyBold,
      color: t.colors.text,
    },
    compactRoi: {
      flexShrink: 0,
      ...t.typography.tiny,
      color: t.colors.success,
    },

    // ---- Row ----
    row: {
      flexDirection: 'row',
      gap: t.spacing.smd,
      padding: t.spacing.smd,
      marginBottom: t.spacing.smd,
      borderRadius: t.borderRadius.xl,
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.colors.border,
      ...t.shadows.card,
    },
    rowImage: {
      width: 96,
      height: 96,
    },
    rowBody: {
      flex: 1,
      minWidth: 0,
      justifyContent: 'space-between',
      gap: 4,
    },
    rowHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: t.spacing.sm,
    },
    rowTitle: {
      flex: 1,
      minWidth: 0,
      ...t.typography.bodyBold,
      color: t.colors.text,
    },
    rowLocation: {
      flexShrink: 1,
      minWidth: 0,
      ...t.typography.caption,
      color: t.colors.textSecondary,
    },
    rowFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: t.spacing.sm,
    },
    rowPrice: {
      flexShrink: 1,
      minWidth: 0,
      ...t.typography.price,
      color: t.colors.text,
    },
    rowMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      flexShrink: 0,
    },

    // ---- Shared ----
    locationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      minWidth: 0,
    },
    priceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: t.spacing.sm,
      marginTop: 2,
    },
    roiPill: {
      flexShrink: 0,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 9,
      paddingVertical: 5,
      borderRadius: t.borderRadius.sm,
      backgroundColor: 'rgba(8, 13, 24, 0.55)',
    },
    roiText: {
      ...t.typography.tiny,
      color: t.colors.accent,
    },
  };
});
